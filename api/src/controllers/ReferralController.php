<?php
// src/controllers/ReferralController.php

require_once __DIR__ . '/../models/UserWallet.php';
require_once __DIR__ . '/../services/WalletService.php';
require_once __DIR__ . '/../services/ConfigService.php';
require_once __DIR__ . '/../services/BonusConfigService.php';
require_once __DIR__ . '/../utils/Response.php';

class ReferralController {
    private $db;
    private $walletService;
    private $userWallet;
    private $configService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->walletService = new WalletService($db);
        $this->userWallet = new UserWallet($db);
        $this->configService = new ConfigService($db);
    }
    
    /**
     * Valida código de indicação
     */
    public function validateReferralCode() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['code'])) {
                Response::error('Código de indicação é obrigatório', 400);
                return;
            }
            
            $code = trim($input['code']);
            
            // Buscar usuário pelo código de indicação
            $query = "SELECT id, full_name, email FROM users 
                     WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referrer) {
                Response::error('Código de indicação inválido ou usuário inativo', 400);
                return;
            }
            
            Response::success([
                'valid' => true,
                'referrer_id' => $referrer['id'],
                'referrer_name' => $referrer['full_name'],
                'referrer_email' => $referrer['email']
            ], 'Código de indicação válido');
            
        } catch (Exception $e) {
            error_log("VALIDATE_REFERRAL_CODE ERROR: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    /**
     * Processa bônus de cadastro com indicação
     */
    public function processRegistrationBonus() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['user_id']) || !isset($input['referral_code'])) {
                Response::error('Dados obrigatórios: user_id e referral_code', 400);
                return;
            }
            
            $userId = (int)$input['user_id'];
            $referralCode = trim($input['referral_code']);
            
            error_log("REFERRAL_CONTROLLER: Processando bônus - User: {$userId}, Code: {$referralCode}");
            
            // Buscar indicador pelo código
            $referrerQuery = "SELECT id, full_name FROM users 
                             WHERE codigo_indicacao = ? AND status = 'ativo'";
            $referrerStmt = $this->db->prepare($referrerQuery);
            $referrerStmt->execute([$referralCode]);
            $referrer = $referrerStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referrer) {
                Response::error('Código de indicação inválido', 400);
                return;
            }
            
            $referrerId = $referrer['id'];
            
            // Verificar se o usuário indicado não é o mesmo que o indicador
            if ($userId === $referrerId) {
                Response::error('Não é possível usar seu próprio código de indicação', 400);
                return;
            }
            
            // Verificar se já existe uma indicação para este usuário
            $existingQuery = "SELECT id FROM indicacoes 
                             WHERE indicado_id = ? AND indicador_id = ?";
            $existingStmt = $this->db->prepare($existingQuery);
            $existingStmt->execute([$userId, $referrerId]);
            
            if ($existingStmt->fetch()) {
                Response::error('Bônus de indicação já foi processado para este usuário', 400);
                return;
            }
            
            // Iniciar transação
            $this->db->beginTransaction();
            
            try {
                // 1. Atualizar usuário indicado com dados da indicação
                $updateUserQuery = "UPDATE users SET 
                                   indicador_id = ?, 
                                   codigo_usado_indicacao = ?
                                   WHERE id = ?";
                $updateUserStmt = $this->db->prepare($updateUserQuery);
                $updateUserStmt->execute([$referrerId, $referralCode, $userId]);
                
                // Buscar valor do bônus do arquivo bonus.php
                $bonusConfigService = BonusConfigService::getInstance();
                $bonusAmount = $bonusConfigService->getBonusAmount();
                
                // 2. Inserir registro na tabela indicacoes
                $insertIndicacaoQuery = "INSERT INTO indicacoes (
                    indicador_id, indicado_id, codigo_usado, status, 
                    bonus_indicador, bonus_indicado, bonus_paid, bonus_paid_at,
                    created_at
                ) VALUES (?, ?, ?, 'ativo', ?, ?, 1, NOW(), NOW())";
                
                $insertIndicacaoStmt = $this->db->prepare($insertIndicacaoQuery);
                $insertIndicacaoStmt->execute([$referrerId, $userId, $referralCode, $bonusAmount, $bonusAmount]);
                
                $indicacaoId = $this->db->lastInsertId();
                
                // 3. Processar bônus para o usuário indicado (saldo do plano)
                $referredBonusResult = $this->walletService->createTransaction(
                    $userId,
                    'bonus',
                    $bonusAmount,
                    'Bônus de boas-vindas por indicação',
                    'indicacao',
                    $indicacaoId
                );
                
                if (!$referredBonusResult['success']) {
                    throw new Exception("Erro ao processar bônus do indicado: " . $referredBonusResult['message']);
                }
                
                // 4. Processar bônus para o indicador (saldo do plano)
                $referrerBonusResult = $this->walletService->createTransaction(
                    $referrerId,
                    'indicacao',
                    $bonusAmount,
                    'Bônus por indicar usuário',
                    'indicacao',
                    $indicacaoId
                );
                
                if (!$referrerBonusResult['success']) {
                    throw new Exception("Erro ao processar bônus do indicador: " . $referrerBonusResult['message']);
                }
                
                // 5. Registrar auditoria para ambos os usuários
                $this->registerAudit($userId, 'bonus_received', 'referral', 
                    "Recebeu bônus de R$ {$bonusAmount} por indicação", 
                    ['bonus_amount' => $bonusAmount, 'referrer_id' => $referrerId]);
                
                $this->registerAudit($referrerId, 'bonus_earned', 'referral', 
                    "Ganhou bônus de R$ {$bonusAmount} por indicar usuário", 
                    ['bonus_amount' => $bonusAmount, 'referred_id' => $userId]);
                
                // Confirmar transação
                $this->db->commit();
                
                $response = [
                    'registration_processed' => true,
                    'referred_bonus' => $bonusAmount,
                    'referrer_bonus' => $bonusAmount,
                    'referrer_name' => $referrer['full_name'],
                    'indicacao_id' => $indicacaoId
                ];
                
                error_log("REFERRAL_CONTROLLER SUCCESS: Bônus processado - Indicado: {$userId}, Indicador: {$referrerId}");
                
                Response::success($response, 'Bônus de indicação processado com sucesso');
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("REFERRAL_CONTROLLER ERROR: " . $e->getMessage());
            Response::error('Erro ao processar bônus de indicação: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Processa comissão de recarga
     */
    public function processRechargeCommission() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['user_id']) || !isset($input['amount'])) {
                Response::error('Dados obrigatórios: user_id e amount', 400);
                return;
            }
            
            $userId = (int)$input['user_id'];
            $rechargeAmount = (float)$input['amount'];
            
            // Buscar indicador do usuário
            $userQuery = "SELECT indicador_id FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || !$user['indicador_id']) {
                Response::success([
                    'commission_processed' => false,
                    'commission_amount' => 0
                ], 'Usuário não possui indicador');
                return;
            }
            
            $referrerId = $user['indicador_id'];
            
            // Buscar configuração de comissão dinamicamente
            $commissionPercentage = $this->configService->get('referral_commission_percentage', 5.00);
            $commissionAmount = $rechargeAmount * ($commissionPercentage / 100);
            
            // Processar comissão para o indicador
            $commissionResult = $this->walletService->createTransaction(
                $referrerId,
                'indicacao',
                $commissionAmount,
                "Comissão de {$commissionPercentage}% sobre recarga de R$ {$rechargeAmount}",
                'recarga_commission',
                $userId
            );
            
            if (!$commissionResult['success']) {
                Response::error('Erro ao processar comissão: ' . $commissionResult['message'], 500);
                return;
            }
            
            // Registrar auditoria
            $this->registerAudit($referrerId, 'commission_earned', 'referral', 
                "Comissão de R$ {$commissionAmount} sobre recarga", 
                ['commission_amount' => $commissionAmount, 'recharge_amount' => $rechargeAmount, 'referred_id' => $userId]);
            
            Response::success([
                'commission_processed' => true,
                'commission_amount' => $commissionAmount
            ], 'Comissão processada com sucesso');
            
        } catch (Exception $e) {
            error_log("RECHARGE_COMMISSION ERROR: " . $e->getMessage());
            Response::error('Erro ao processar comissão de recarga', 500);
        }
    }
    
    /**
     * Busca dados de indicação do usuário
     */
    public function getUserReferralData() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            // Verificar autenticação (implementar conforme seu sistema)
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                Response::error('Token de autorização inválido', 401);
                return;
            }
            
            // Buscar indicações feitas pelo usuário
            $referralsQuery = "SELECT 
                                i.id,
                                i.indicado_id,
                                i.codigo_usado,
                                i.bonus_indicador,
                                i.bonus_indicado,
                                i.status,
                                i.created_at,
                                u.full_name as indicado_nome,
                                u.email as indicado_email,
                                u.created_at as data_cadastro
                              FROM indicacoes i
                              LEFT JOIN users u ON i.indicado_id = u.id
                              WHERE i.indicador_id = ?
                              ORDER BY i.created_at DESC";
            
            $referralsStmt = $this->db->prepare($referralsQuery);
            $referralsStmt->execute([$userId]);
            $referrals = $referralsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calcular estatísticas
            $totalReferrals = count($referrals);
            $totalEarned = array_sum(array_column($referrals, 'bonus_indicador'));
            
            Response::success([
                'referrals' => $referrals,
                'stats' => [
                    'total_referrals' => $totalReferrals,
                    'total_earned' => $totalEarned,
                    'active_referrals' => count(array_filter($referrals, function($r) { return $r['status'] === 'ativo'; }))
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("GET_USER_REFERRAL_DATA ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar dados de indicação', 500);
        }
    }
    
    /**
     * Busca transações da carteira
     */
    public function getWalletTransactions() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                Response::error('Token de autorização inválido', 401);
                return;
            }
            
            $transactions = $this->walletService->getUserTransactions($userId, 50, 0);
            
            Response::success(['transactions' => $transactions]);
            
        } catch (Exception $e) {
            error_log("GET_WALLET_TRANSACTIONS ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar transações', 500);
        }
    }
    
    /**
     * Busca saldo da carteira
     */
    public function getWalletBalance() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $userId = $this->getUserIdFromToken();
            
            if (!$userId) {
                Response::error('Token de autorização inválido', 401);
                return;
            }
            
            $balance = $this->walletService->getUserBalance($userId);
            
            Response::success($balance);
            
        } catch (Exception $e) {
            error_log("GET_WALLET_BALANCE ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar saldo', 500);
        }
    }
    
    /**
     * Retorna configurações do sistema de indicação
     */
    public function getReferralConfig() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            // Buscar valores do arquivo bonus.php
            $bonusConfigService = BonusConfigService::getInstance();
            $bonusAmount = $bonusConfigService->getBonusAmount();
            $commissionPercentage = $this->configService->get('referral_commission_percentage', 5.00);
            
            Response::success([
                'bonus_amount' => $bonusAmount,
                'commission_percentage' => $commissionPercentage,
                'currency' => 'BRL'
            ]);
            
        } catch (Exception $e) {
            error_log("GET_REFERRAL_CONFIG ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar configurações', 500);
        }
    }
    
    /**
     * Atualiza saldo do usuário manualmente
     */
    public function updateUserBalance() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['user_id']) || !isset($input['amount']) || !isset($input['type'])) {
                Response::error('Dados obrigatórios: user_id, amount e type', 400);
                return;
            }
            
            $userId = (int)$input['user_id'];
            $amount = (float)$input['amount'];
            $type = $input['type'];
            $description = $input['description'] ?? 'Ajuste manual de saldo';
            
            $result = $this->walletService->createTransaction(
                $userId,
                $type,
                $amount,
                $description,
                'manual_adjustment',
                null
            );
            
            if ($result['success']) {
                Response::success($result, 'Saldo atualizado com sucesso');
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log("UPDATE_USER_BALANCE ERROR: " . $e->getMessage());
            Response::error('Erro ao atualizar saldo', 500);
        }
    }
    
    /**
     * Registra auditoria
     */
    private function registerAudit($userId, $action, $category, $description, $details = null) {
        try {
            $auditQuery = "INSERT INTO user_audit (
                user_id, action, category, description, new_values, 
                ip_address, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            
            $auditStmt = $this->db->prepare($auditQuery);
            $auditStmt->execute([
                $userId,
                $action,
                $category,
                $description,
                $details ? json_encode($details) : null,
                $_SERVER['REMOTE_ADDR'] ?? null
            ]);
            
        } catch (Exception $e) {
            error_log("AUDIT_ERROR: " . $e->getMessage());
        }
    }
    
    /**
     * Extrai user ID do token (implementar conforme seu sistema de auth)
     */
    private function getUserIdFromToken() {
        // Implementar extração do user ID do token JWT ou sessão
        // Por enquanto, retorna null para forçar uso de middleware de auth
        return null;
    }
}