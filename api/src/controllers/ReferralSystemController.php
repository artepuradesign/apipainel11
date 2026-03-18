<?php
// src/controllers/ReferralSystemController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../services/ConfigService.php';
require_once __DIR__ . '/../services/BonusConfigService.php';
require_once __DIR__ . '/../services/ReferralTransactionService.php';

class ReferralSystemController {
    private $db;
    private $configService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->configService = new ConfigService($db);
    }
    
    /**
     * Processar bônus de indicação no momento do cadastro
     */
    public function processRegistrationBonus() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['user_id']) || !isset($input['referral_code'])) {
                Response::error('user_id e referral_code são obrigatórios', 400);
                return;
            }
            
            $userId = (int)$input['user_id'];
            $referralCode = $input['referral_code'];
            
            error_log("REFERRAL_SYSTEM: === PROCESSANDO BÔNUS DE INDICAÇÃO ===");
            error_log("REFERRAL_SYSTEM: Usuário: {$userId}, Código: {$referralCode}");
            
            // Verificar se o código de indicação é válido
            $referrerQuery = "SELECT id, full_name FROM users WHERE codigo_indicacao = ? AND status = 'ativo' AND id != ?";
            $stmt = $this->db->prepare($referrerQuery);
            $stmt->execute([$referralCode, $userId]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referrer) {
                error_log("REFERRAL_SYSTEM: Código inválido ou usuário inativo");
                Response::error('Código de indicação inválido ou usuário inativo', 404);
                return;
            }
            
            $referrerId = $referrer['id'];
            error_log("REFERRAL_SYSTEM: Indicador encontrado: {$referrerId} ({$referrer['full_name']})");
            
            // Verificar se já existe indicação para este usuário
            $existingQuery = "SELECT id FROM indicacoes WHERE indicado_id = ? LIMIT 1";
            $stmt = $this->db->prepare($existingQuery);
            $stmt->execute([$userId]);
            $existing = $stmt->fetch();
            
            if ($existing) {
                error_log("REFERRAL_SYSTEM: Indicação já existe para usuário {$userId}");
                Response::error('Usuário já possui indicação processada', 409);
                return;
            }
            
            // Atualizar código usado pelo usuário
            $updateUserQuery = "UPDATE users SET codigo_usado_indicacao = ? WHERE id = ?";
            $stmt = $this->db->prepare($updateUserQuery);
            $stmt->execute([$referralCode, $userId]);
            
            // Buscar valor do bônus do arquivo bonus.php
            $bonusConfigService = BonusConfigService::getInstance();
            $bonusAmount = $bonusConfigService->getBonusAmount();
            error_log("REFERRAL_SYSTEM: Valor do bônus do bonus.php: R$ {$bonusAmount}");
            
            // Usar ReferralTransactionService em vez da procedure para evitar duplicação
            $referralTransactionService = new ReferralTransactionService($this->db);
            $result = $referralTransactionService->processRegistrationBonus($referrerId, $userId, $referralCode);
            
            if ($result['success']) {
                error_log("REFERRAL_SYSTEM: === BÔNUS PROCESSADO COM SUCESSO ===");
                error_log("REFERRAL_SYSTEM: Indicador ID: {$referrerId}, Indicado ID: {$userId}");
                error_log("REFERRAL_SYSTEM: Valor do bônus: R$ {$bonusAmount}");
                
                Response::success([
                    'bonus_processed' => true,
                    'bonus_amount' => $bonusAmount,
                    'referrer_bonus' => $bonusAmount,
                    'referred_bonus' => $bonusAmount,
                    'referrer_id' => $referrerId,
                    'referred_id' => $userId,
                    'transaction_details' => $result,
                    'message' => 'Sistema de indicação processado com sucesso!'
                ], 'Bônus de indicação processado com sucesso');
            } else {
                throw new Exception($result['message'] ?? 'Erro desconhecido no processamento do bônus');
            }
            
        } catch (Exception $e) {
            error_log("REFERRAL_SYSTEM ERROR: " . $e->getMessage());
            Response::error('Erro ao processar bônus: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Validar código de indicação
     */
    public function validateReferralCode() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['code'])) {
                Response::error('Código de indicação é obrigatório', 400);
                return;
            }
            
            $code = $input['code'];
            
            // Buscar usuário pelo código
            $query = "SELECT id, full_name, email FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($referrer) {
                Response::success([
                    'valid' => true,
                    'referrer_id' => $referrer['id'],
                    'referrer_name' => $referrer['full_name'],
                    'referrer_email' => $referrer['email'],
                    'code' => $code
                ], 'Código de indicação válido');
            } else {
                Response::error('Código de indicação inválido', 404);
            }
            
        } catch (Exception $e) {
            error_log("VALIDATE_REFERRAL ERROR: " . $e->getMessage());
            Response::error('Erro ao validar código: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Buscar dados de indicação do usuário
     */
    public function getUserReferralData() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            // Buscar indicações feitas pelo usuário
            $referralsQuery = "SELECT 
                i.id,
                i.indicado_id,
                i.codigo_usado,
                i.bonus_indicador,
                i.bonus_indicado,
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
            $totalIndicados = count($referrals);
            $indicadosAtivos = 0;
            $totalBonus = 0;
            $bonusEsteMes = 0;
            
            $currentMonth = date('Y-m');
            
            foreach ($referrals as $referral) {
                if ($referral['bonus_paid'] == 1) {
                    $indicadosAtivos++;
                    $totalBonus += (float)$referral['bonus_indicador'];
                    
                    if ($referral['bonus_paid_at'] && 
                        strpos($referral['bonus_paid_at'], $currentMonth) === 0) {
                        $bonusEsteMes += (float)$referral['bonus_indicador'];
                    }
                }
            }
            
            // Buscar saldo atual do usuário
            $walletQuery = "SELECT wallet_balance, plan_balance FROM user_wallets WHERE user_id = ?";
            $stmt = $this->db->prepare($walletQuery);
            $stmt->execute([$userId]);
            $wallet = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $response = [
                'stats' => [
                    'total_indicados' => $totalIndicados,
                    'indicados_ativos' => $indicadosAtivos,
                    'total_bonus' => $totalBonus,
                    'bonus_este_mes' => $bonusEsteMes
                ],
                'referrals' => $referrals,
                'wallet' => $wallet ?: ['wallet_balance' => 0, 'plan_balance' => 0]
            ];
            
            Response::success($response, 'Dados de indicação carregados');
            
        } catch (Exception $e) {
            error_log("GET_REFERRAL_DATA ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar dados: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Buscar transações de carteira
     */
    public function getWalletTransactions() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            $query = "SELECT 
                id,
                amount,
                type,
                wallet_type,
                description,
                reference_id,
                previous_balance,
                new_balance,
                status,
                created_at
            FROM wallet_transactions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($transactions, 'Transações carregadas');
            
        } catch (Exception $e) {
            error_log("GET_TRANSACTIONS ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar transações: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Criar carteira se não existir
     */
    private function createWalletIfNotExists($userId) {
        $checkQuery = "SELECT id FROM user_wallets WHERE user_id = ?";
        $stmt = $this->db->prepare($checkQuery);
        $stmt->execute([$userId]);
        
        if (!$stmt->fetch()) {
            $insertQuery = "INSERT INTO user_wallets (user_id, wallet_balance, plan_balance) VALUES (?, 0.00, 0.00)";
            $stmt = $this->db->prepare($insertQuery);
            $stmt->execute([$userId]);
            error_log("REFERRAL_SYSTEM: Carteira criada para usuário {$userId}");
        }
    }
}