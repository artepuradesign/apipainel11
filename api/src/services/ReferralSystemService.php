
<?php
// src/services/ReferralSystemService.php

require_once __DIR__ . '/ConfigService.php';
require_once __DIR__ . '/BonusConfigService.php';

class ReferralSystemService {
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Processar bônus de indicação automaticamente
     */
    public function processAutomaticReferralBonus($userId, $referralCode) {
        try {
            $this->db->beginTransaction();
            
            // Validar código de indicação
            $referrerData = $this->getReferrerByCode($referralCode);
            if (!$referrerData) {
                throw new Exception('Código de indicação inválido');
            }
            
            $referrerId = $referrerData['id'];
            
            // Verificar se usuário já foi indicado
            if ($this->userAlreadyReferred($userId)) {
                throw new Exception('Usuário já possui indicação');
            }
            
            // Buscar configurações do sistema
            $config = $this->getReferralConfig();
            $bonusAmount = $config['referral_bonus_amount'];
            
            // Garantir que carteiras existam
            $this->ensureWalletExists($userId);
            $this->ensureWalletExists($referrerId);
            
            // Criar registro na tabela indicacoes
            $indicacaoId = $this->createReferralRecord($referrerId, $userId, $referralCode, $bonusAmount);
            
            // Adicionar bônus para o indicador (carteira plan)
            $referrerTransaction = $this->addWalletBalance(
                $referrerId, 
                $bonusAmount, 
                'plan', 
                'indicacao', 
                "Bônus por indicação - Usuário {$userId} se cadastrou",
                'referral_registration',
                $userId
            );
            
            // Adicionar bônus para o indicado (carteira plan)
            $referredTransaction = $this->addWalletBalance(
                $userId, 
                $bonusAmount, 
                'plan', 
                'indicacao', 
                "Bônus de boas-vindas - Indicado por usuário {$referrerId}",
                'referral_registration',
                $referrerId
            );
            
            // Atualizar saldo_plano na tabela users
            $this->updateUserPlanBalance($referrerId, $bonusAmount, 'add');
            $this->updateUserPlanBalance($userId, $bonusAmount, 'add');
            
            // Marcar indicação como paga
            $this->markReferralAsPaid($indicacaoId);
            
            $this->db->commit();
            
            error_log("REFERRAL_AUTO SUCCESS: Bônus processado - Indicação ID: {$indicacaoId}");
            
            return [
                'success' => true,
                'total_paid' => $bonusAmount * 2, // Total pago (indicador + indicado)
                'referrer_bonus' => $bonusAmount,
                'referred_bonus' => $bonusAmount,
                'indicacao_id' => $indicacaoId,
                'referrer_id' => $referrerId,
                'transactions' => [
                    'referrer' => $referrerTransaction,
                    'referred' => $referredTransaction
                ]
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("REFERRAL_AUTO ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Validar código de indicação
     */
    public function validateReferralCode($code) {
        try {
            $referrerData = $this->getReferrerByCode($code);
            
            if ($referrerData) {
                return [
                    'success' => true,
                    'data' => [
                        'valid' => true,
                        'referrer_id' => $referrerData['id'],
                        'referrer_name' => $referrerData['full_name'],
                        'referrer_email' => $referrerData['email'],
                        'code' => $code
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Código de indicação inválido'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao validar código: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Processar comissão de recarga
     */
    public function processRechargeCommission($userId, $rechargeAmount) {
        try {
            // Buscar quem indicou este usuário
            $referralData = $this->getUserReferrer($userId);
            
            if (!$referralData) {
                return [
                    'success' => false,
                    'message' => 'Usuário não foi indicado por ninguém'
                ];
            }
            
            $referrerId = $referralData['indicador_id'];
            $config = $this->getReferralConfig();
            $commissionPercentage = $config['referral_commission_percentage'] ?? 5.0;
            
            // Calcular comissão
            $commissionAmount = ($rechargeAmount * $commissionPercentage) / 100;
            
            if ($commissionAmount > 0) {
                $this->db->beginTransaction();
                
                // Adicionar comissão na carteira main do indicador
                $transaction = $this->addWalletBalance(
                    $referrerId,
                    $commissionAmount,
                    'main',
                    'indicacao',
                    "Comissão de recarga - R$ {$rechargeAmount} do usuário {$userId}",
                    'recharge_commission',
                    $userId
                );
                
                // Atualizar total ganho na indicação
                $this->updateReferralEarnings($referrerId, $userId, $commissionAmount, $rechargeAmount);
                
                $this->db->commit();
                
                return [
                    'success' => true,
                    'data' => [
                        'commission_processed' => true,
                        'commission_amount' => $commissionAmount,
                        'commission_percentage' => $commissionPercentage,
                        'referrer_id' => $referrerId,
                        'transaction_id' => $transaction['transaction_id']
                    ]
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Comissão zerada'
            ];
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao processar comissão: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Buscar dados de indicação do usuário
     */
    public function getUserReferralData($userId) {
        try {
            // Buscar indicações feitas pelo usuário
            $referralsQuery = "SELECT 
                i.id,
                i.indicado_id,
                i.codigo_usado,
                i.bonus_indicador,
                i.bonus_indicado,
                i.total_earned,
                i.total_spent_by_referred,
                i.status,
                i.bonus_paid,
                i.bonus_paid_at,
                i.created_at,
                u.full_name as indicado_nome,
                u.email as indicado_email
            FROM indicacoes i
            LEFT JOIN users u ON i.indicado_id = u.id
            WHERE i.indicador_id = ?
            ORDER BY i.created_at DESC";
            
            $stmt = $this->db->prepare($referralsQuery);
            $stmt->execute([$userId]);
            $referrals = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calcular estatísticas
            $stats = $this->calculateReferralStats($referrals);
            
            // Buscar saldo da carteira
            $walletBalance = $this->getUserWalletBalance($userId);
            
            return [
                'success' => true,
                'data' => [
                    'stats' => $stats,
                    'referrals' => $referrals,
                    'wallet' => $walletBalance['data']
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao carregar dados: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Buscar saldo da carteira do usuário
     */
    public function getUserWalletBalance($userId) {
        try {
            $query = "SELECT 
                COALESCE(SUM(CASE WHEN wallet_type = 'main' THEN current_balance END), 0) as wallet_balance,
                COALESCE(SUM(CASE WHEN wallet_type = 'plan' THEN current_balance END), 0) as plan_balance
            FROM user_wallets 
            WHERE user_id = ? AND status = 'active'";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $wallet = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => [
                    'wallet_balance' => (float)($wallet['wallet_balance'] ?? 0),
                    'plan_balance' => (float)($wallet['plan_balance'] ?? 0)
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao carregar saldo: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Buscar transações da carteira
     */
    public function getWalletTransactions($userId, $limit = 50, $offset = 0) {
        try {
            $query = "SELECT 
                id,
                wallet_type,
                type,
                amount,
                balance_before,
                balance_after,
                description,
                reference_id,
                reference_type,
                status,
                created_at
            FROM wallet_transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => $transactions
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Erro ao carregar transações: ' . $e->getMessage()
            ];
        }
    }
    
    // Métodos auxiliares privados
    private function getReferrerByCode($code) {
        $query = "SELECT id, full_name, email FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function userAlreadyReferred($userId) {
        $query = "SELECT id FROM indicacoes WHERE indicado_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch() !== false;
    }
    
    private function getReferralConfig() {
        // Usar o valor do arquivo bonus.php
        $bonusConfigService = BonusConfigService::getInstance();
        $bonusAmount = $bonusConfigService->getBonusAmount();
        
        // Comissão ainda vem da system_config
        $query = "SELECT config_value FROM system_config WHERE config_key = 'referral_commission_percentage'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $commissionResult = $stmt->fetch(PDO::FETCH_ASSOC);
        $commissionPercentage = $commissionResult ? (float)$commissionResult['config_value'] : 5.0;
        
        return [
            'referral_bonus_amount' => $bonusAmount,
            'referral_commission_percentage' => $commissionPercentage
        ];
    }
    
    private function ensureWalletExists($userId) {
        // Verificar carteira main
        $this->createWalletIfNotExists($userId, 'main');
        // Verificar carteira plan
        $this->createWalletIfNotExists($userId, 'plan');
    }
    
    private function createWalletIfNotExists($userId, $walletType) {
        $checkQuery = "SELECT id FROM user_wallets WHERE user_id = ? AND wallet_type = ?";
        $stmt = $this->db->prepare($checkQuery);
        $stmt->execute([$userId, $walletType]);
        
        if (!$stmt->fetch()) {
            $insertQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, status, created_at) VALUES (?, ?, 0.00, 0.00, 'active', NOW())";
            $stmt = $this->db->prepare($insertQuery);
            $stmt->execute([$userId, $walletType]);
            error_log("WALLET_CREATED: {$walletType} para usuário {$userId}");
        }
    }
    
    private function createReferralRecord($referrerId, $userId, $code, $bonusAmount) {
        $query = "INSERT INTO indicacoes (indicador_id, indicado_id, codigo_usado, bonus_indicador, bonus_indicado, status, created_at) VALUES (?, ?, ?, ?, ?, 'ativo', NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$referrerId, $userId, $code, $bonusAmount, $bonusAmount]);
        return $this->db->lastInsertId();
    }
    
    private function addWalletBalance($userId, $amount, $walletType, $transactionType, $description, $referenceType = null, $referenceId = null) {
        // Buscar saldo atual
        $balanceQuery = "SELECT current_balance FROM user_wallets WHERE user_id = ? AND wallet_type = ?";
        $stmt = $this->db->prepare($balanceQuery);
        $stmt->execute([$userId, $walletType]);
        $currentBalance = (float)($stmt->fetchColumn() ?: 0);
        
        $newBalance = $currentBalance + $amount;
        
        // Atualizar carteira
        $updateQuery = "UPDATE user_wallets SET current_balance = ?, available_balance = ?, last_transaction_at = NOW(), updated_at = NOW() WHERE user_id = ? AND wallet_type = ?";
        $stmt = $this->db->prepare($updateQuery);
        $stmt->execute([$newBalance, $newBalance, $userId, $walletType]);
        
        // Criar transação
        $transactionQuery = "INSERT INTO wallet_transactions (user_id, wallet_type, type, amount, balance_before, balance_after, description, reference_type, reference_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())";
        $stmt = $this->db->prepare($transactionQuery);
        $stmt->execute([$userId, $walletType, $transactionType, $amount, $currentBalance, $newBalance, $description, $referenceType, $referenceId]);
        
        $transactionId = $this->db->lastInsertId();
        
        error_log("WALLET_TRANSACTION: User {$userId}, Type {$walletType}, Amount {$amount}, New Balance {$newBalance}");
        
        return [
            'transaction_id' => $transactionId,
            'balance_before' => $currentBalance,
            'balance_after' => $newBalance
        ];
    }
    
    private function updateUserPlanBalance($userId, $amount, $operation = 'add') {
        $operator = $operation === 'add' ? '+' : '-';
        $query = "UPDATE users SET saldo_plano = saldo_plano {$operator} ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$amount, $userId]);
    }
    
    private function markReferralAsPaid($indicacaoId) {
        $query = "UPDATE indicacoes SET bonus_paid = 1, bonus_paid_at = NOW(), updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$indicacaoId]);
    }
    
    private function getUserReferrer($userId) {
        $query = "SELECT indicador_id FROM indicacoes WHERE indicado_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function updateReferralEarnings($referrerId, $referredId, $commissionAmount, $rechargeAmount) {
        $query = "UPDATE indicacoes SET total_earned = total_earned + ?, total_spent_by_referred = total_spent_by_referred + ?, updated_at = NOW() WHERE indicador_id = ? AND indicado_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$commissionAmount, $rechargeAmount, $referrerId, $referredId]);
    }
    
    private function calculateReferralStats($referrals) {
        $totalIndicados = count($referrals);
        $indicadosAtivos = 0;
        $totalBonus = 0;
        $bonusEsteMes = 0;
        
        $currentMonth = date('Y-m');
        
        foreach ($referrals as $referral) {
            if ($referral['bonus_paid'] == 1) {
                $indicadosAtivos++;
                $totalBonus += (float)$referral['total_earned'];
                
                if ($referral['bonus_paid_at'] && 
                    strpos($referral['bonus_paid_at'], $currentMonth) === 0) {
                    $bonusEsteMes += (float)$referral['total_earned'];
                }
            }
        }
        
        return [
            'total_indicados' => $totalIndicados,
            'indicados_ativos' => $indicadosAtivos,
            'total_bonus' => $totalBonus,
            'bonus_este_mes' => $bonusEsteMes
        ];
    }
    
    public function updateWalletBalance($userId, $amount, $type, $description, $walletType = 'plan') {
        try {
            $this->db->beginTransaction();
            
            if ($type === 'credit') {
                $transaction = $this->addWalletBalance($userId, $amount, $walletType, 'entrada', $description);
                $this->updateUserPlanBalance($userId, $amount, 'add');
            } else {
                // Para débito, implementar lógica similar
                throw new Exception('Débito ainda não implementado');
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'data' => $transaction
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
