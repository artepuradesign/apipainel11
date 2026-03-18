<?php
// src/services/ReferralTransactionService.php

require_once __DIR__ . '/WalletService.php';
require_once __DIR__ . '/NotificationService.php';
require_once __DIR__ . '/ConfigService.php';
require_once __DIR__ . '/BonusConfigService.php';

class ReferralTransactionService {
    private $db;
    private $walletService;
    private $notificationService;
    private $configService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->walletService = new WalletService($db);
        $this->notificationService = new NotificationService($db);
        $this->configService = new ConfigService($db);
    }
    
    public function processRegistrationBonus($referrerId, $newUserId, $referralCode) {
        error_log("REFERRAL_TRANSACTION: === INICIANDO PROCESSO DE BÔNUS ===");
        error_log("REFERRAL_TRANSACTION: Indicador ID: {$referrerId}, Novo usuário ID: {$newUserId}, Código: {$referralCode}");
        
        try {
            // Remover beginTransaction() - será controlado pelo RegistrationService
            
            // Verificar se já existe indicação entre estes usuários
            $checkQuery = "SELECT id FROM indicacoes WHERE indicador_id = ? AND indicado_id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$referrerId, $newUserId]);
            
            if ($checkStmt->fetch()) {
                throw new Exception("Indicação já processada entre estes usuários");
            }
            
            // Buscar dados dos usuários
            $referrerData = $this->getUserData($referrerId);
            $newUserData = $this->getUserData($newUserId);
            
            if (!$referrerData || !$newUserData) {
                throw new Exception("Dados de usuário não encontrados");
            }
            
            // Buscar configuração de bônus do arquivo bonus.php
            $bonusConfigService = BonusConfigService::getInstance();
            $bonusAmount = $bonusConfigService->getBonusAmount();
            $referrerBonus = $bonusAmount;
            $newUserBonus = $bonusAmount;
            
            error_log("REFERRAL_TRANSACTION: Bônus configurado - Indicador: R$ {$referrerBonus}, Indicado: R$ {$newUserBonus}");
            
            // 1. ATUALIZAR INDICADOR_ID NA TABELA USERS (sem mexer no saldo)
            error_log("REFERRAL_TRANSACTION: === ATUALIZANDO INDICADOR_ID ===");
            
            // Atualizar indicado com indicador_id apenas (saldo será atualizado pelo WalletService)
            $updateNewUserQuery = "UPDATE users SET 
                                  indicador_id = ?, 
                                  updated_at = NOW() 
                                  WHERE id = ?";
            $updateNewUserStmt = $this->db->prepare($updateNewUserQuery);
            $updateNewUserResult = $updateNewUserStmt->execute([$referrerId, $newUserId]);
            
            if (!$updateNewUserResult) {
                throw new Exception("Erro ao atualizar dados do indicado");
            }
            
            error_log("REFERRAL_TRANSACTION: ✅ Indicador_id atualizado, saldos serão atualizados pelo WalletService");
            
            // 2. CRIAR TRANSAÇÕES NA WALLET_TRANSACTIONS (que também atualizarão os saldos)
            error_log("REFERRAL_TRANSACTION: === CRIANDO TRANSAÇÕES ===");
            
            // Transação para o indicador
            $referrerTransactionResult = $this->walletService->createTransaction(
                $referrerId,
                'indicacao',
                $referrerBonus,
                "Bônus por indicação - {$newUserData['full_name']} se cadastrou com seu código {$referralCode}",
                'referral_registration',
                $newUserId
            );
            
            if (!$referrerTransactionResult['success']) {
                throw new Exception("Erro ao criar transação do indicador: " . $referrerTransactionResult['message']);
            }
            
            // Transação para o indicado
            $newUserTransactionResult = $this->walletService->createTransaction(
                $newUserId,
                'indicacao',
                $newUserBonus,
                "Bônus de boas-vindas - indicado por {$referrerData['full_name']} (código {$referralCode})",
                'referral_registration',
                $referrerId
            );
            
            if (!$newUserTransactionResult['success']) {
                throw new Exception("Erro ao criar transação do indicado: " . $newUserTransactionResult['message']);
            }
            
            error_log("REFERRAL_TRANSACTION: ✅ Transações criadas na wallet_transactions");
            
            // 3. REGISTRAR NA TABELA INDICACOES
            error_log("REFERRAL_TRANSACTION: === REGISTRANDO INDICAÇÃO ===");
            
            // Buscar configuração de comissão dinamicamente
            $commissionPercentage = $this->configService->get('referral_commission_percentage', 5.00);
            
            $indicacaoQuery = "INSERT INTO indicacoes (
                indicador_id, indicado_id, codigo_usado, bonus_indicador, bonus_indicado, 
                commission_percentage, status, bonus_paid, bonus_paid_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'ativo', 1, NOW(), NOW(), NOW())";
            
            $indicacaoStmt = $this->db->prepare($indicacaoQuery);
            $indicacaoResult = $indicacaoStmt->execute([
                $referrerId,
                $newUserId,
                $referralCode,
                $referrerBonus,
                $newUserBonus,
                $commissionPercentage
            ]);
            
            if (!$indicacaoResult) {
                throw new Exception("Erro ao registrar indicação");
            }
            
            $indicacaoId = $this->db->lastInsertId();
            error_log("REFERRAL_TRANSACTION: ✅ Indicação registrada com ID: {$indicacaoId}");
            
            // 4. REGISTRAR AUDITORIA
            error_log("REFERRAL_TRANSACTION: === REGISTRANDO AUDITORIA ===");
            $this->createAuditLog($referrerId, 'referral_bonus_received', 
                "Recebeu bônus de R$ {$referrerBonus} por indicação do usuário {$newUserData['full_name']}", 
                ['bonus_amount' => $referrerBonus, 'referred_user_id' => $newUserId]);
                
            $this->createAuditLog($newUserId, 'referral_bonus_received', 
                "Recebeu bônus de R$ {$newUserBonus} por ser indicado por {$referrerData['full_name']}", 
                ['bonus_amount' => $newUserBonus, 'referrer_user_id' => $referrerId]);
            
            // 5. REGISTRAR NO CENTRAL_CASH
            error_log("REFERRAL_TRANSACTION: === REGISTRANDO CENTRAL_CASH ===");
            $this->registerCentralCash($referrerId, 'comissao', $referrerBonus, 
                "Comissão por indicação - usuário {$newUserData['full_name']}", 
                'indicacoes', $indicacaoId, $newUserId);
                
            $this->registerCentralCash($newUserId, 'comissao', $newUserBonus, 
                "Bônus de indicação por {$referrerData['full_name']}", 
                'indicacoes', $indicacaoId, $referrerId);
            
            // Remover commit() - será controlado pelo RegistrationService
            
            error_log("REFERRAL_TRANSACTION: ✅ PROCESSO COMPLETO COM SUCESSO!");
            error_log("REFERRAL_TRANSACTION: ✅ Indicador {$referrerId} recebeu R$ {$referrerBonus}");
            error_log("REFERRAL_TRANSACTION: ✅ Indicado {$newUserId} recebeu R$ {$newUserBonus}");
            error_log("REFERRAL_TRANSACTION: ✅ Todas as tabelas foram atualizadas");
            
            return [
                'success' => true,
                'message' => 'Bônus de indicação processado com sucesso',
                'data' => [
                    'referrer_bonus' => $referrerBonus,
                    'bonus_amount' => $newUserBonus,
                    'referrer_transaction_id' => $referrerTransactionResult['transaction_id'],
                    'new_user_transaction_id' => $newUserTransactionResult['transaction_id'],
                    'indicacao_id' => $indicacaoId
                ]
            ];
            
        } catch (Exception $e) {
            // Remover rollback() - será controlado pelo RegistrationService
            error_log("REFERRAL_TRANSACTION ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function getUserData($userId) {
        $query = "SELECT id, full_name, email FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function createAuditLog($userId, $action, $description, $metadata = null) {
        try {
            $auditQuery = "INSERT INTO user_audit (
                user_id, action, category, description, new_values, ip_address, user_agent, created_at
            ) VALUES (?, ?, 'referral', ?, ?, ?, ?, NOW())";
            
            $auditStmt = $this->db->prepare($auditQuery);
            $auditStmt->execute([
                $userId,
                $action,
                $description,
                $metadata ? json_encode($metadata) : null,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'system'
            ]);
            
            error_log("REFERRAL_TRANSACTION: ✅ Log de auditoria criado para usuário {$userId}");
            
        } catch (Exception $e) {
            error_log("REFERRAL_TRANSACTION: Erro ao criar log de auditoria: " . $e->getMessage());
        }
    }
    
    private function registerCentralCash($userId, $type, $amount, $description, $referenceTable = null, $referenceId = null, $relatedUserId = null) {
        try {
            // Buscar saldo atual do central_cash
            $balanceQuery = "SELECT COALESCE(SUM(CASE 
                WHEN transaction_type IN ('entrada', 'recarga', 'comissao') THEN amount 
                WHEN transaction_type IN ('saida', 'consulta', 'saque', 'plano') THEN -amount 
                ELSE 0 END), 0) as current_balance 
                FROM central_cash";
            
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute();
            $currentBalance = (float)($balanceStmt->fetchColumn() ?: 0);
            
            $newBalance = $currentBalance + $amount;
            
            $centralCashQuery = "INSERT INTO central_cash (
                transaction_type, amount, balance_before, balance_after, description, 
                reference_table, reference_id, user_id, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $metadata = json_encode([
                'related_user_id' => $relatedUserId,
                'referral_code' => $referenceTable === 'indicacoes' ? 'bonus_registration' : null
            ]);
            
            $centralCashStmt = $this->db->prepare($centralCashQuery);
            $centralCashStmt->execute([
                $type,
                $amount,
                $currentBalance,
                $newBalance,
                $description,
                $referenceTable,
                $referenceId,
                $userId,
                $metadata
            ]);
            
            error_log("REFERRAL_TRANSACTION: ✅ Registro criado no central_cash para usuário {$userId} - Valor: R$ {$amount}");
            
        } catch (Exception $e) {
            error_log("REFERRAL_TRANSACTION: Erro ao registrar central_cash: " . $e->getMessage());
        }
    }
}
?>