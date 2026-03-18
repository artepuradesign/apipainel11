<?php
// src/services/RechargeService.php

require_once __DIR__ . '/WalletService.php';
require_once __DIR__ . '/CentralCashService.php';
require_once __DIR__ . '/NotificationService.php';
require_once __DIR__ . '/AuditLogService.php';
require_once __DIR__ . '/ReferralService.php';

require_once __DIR__ . '/ReferralCommissionService.php';

class RechargeService {
    private $db;
    private $walletService;
    private $centralCashService;
    private $notificationService;
    private $auditLogService;
    private $referralService;
    
    private $referralCommissionService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->walletService = new WalletService($db);
        $this->centralCashService = new CentralCashService($db);
        $this->notificationService = new NotificationService($db);
        $this->auditLogService = new AuditLogService($db);
        $this->referralService = new ReferralService($db);
        
        $this->referralCommissionService = new ReferralCommissionService($db);
    }
    
    public function processRecharge($userId, $amount, $paymentMethod, $description = null, $externalId = null) {
        try {
            error_log("RECHARGE_SERVICE: Iniciando processamento de recarga - User: {$userId}, Amount: {$amount}, Method: {$paymentMethod}");
            
            // 1. Validações iniciais
            $this->validateRechargeData($userId, $amount, $paymentMethod);
            
            // 2. Validar usuário existe
            $user = $this->getUserById($userId);
            if (!$user) {
                throw new Exception('Usuário não encontrado');
            }
            
            // 3. Usar valor original da recarga
            $originalAmount = $amount;
            $discountAmount = 0;
            $finalAmount = $amount;
            
            $this->db->beginTransaction();
            
            try {
                // 4. Obter saldo anterior
                $balanceBefore = $this->walletService->getUserBalance($userId);
                
                // 5. Processar transação na carteira
                $walletResult = $this->walletService->createTransaction(
                    $userId,
                    'recarga',
                    $finalAmount,
                    $description ?: "Recarga de saldo via {$paymentMethod}",
                    'recharge',
                    null
                );
                
                if (!$walletResult['success']) {
                    throw new Exception($walletResult['message']);
                }
                
                $balanceAfter = $walletResult['balance_after'];
                
                // 6. Registrar no caixa central
                $centralCashResult = $this->centralCashService->addTransaction(
                    'recarga',
                    $finalAmount,
                    $balanceBefore,
                    $balanceAfter,
                    $userId,
                    $userId, // created_by
                    $description ?: "Recarga de saldo via {$paymentMethod}",
                    $paymentMethod,
                    'recargas', // reference_table
                    $walletResult['transaction_id'], // reference_id
                    $externalId
                );
                
                // 7. Auditoria
                $this->auditLogService->logEvent(
                    'recarga',
                    $walletResult['transaction_id'],
                    $userId,
                    'create',
                    'Saldo adicionado via recarga ' . $paymentMethod,
                    null,
                    json_encode([
                        'amount' => $finalAmount,
                        'original_amount' => $originalAmount,
                        'discount_amount' => $discountAmount,
                        'payment_method' => $paymentMethod,
                        'balance_before' => $balanceBefore,
                        'balance_after' => $balanceAfter,
                        'external_id' => $externalId,
                        'transaction_id' => $walletResult['transaction_id']
                    ])
                );
                
                // 8. Notificações são criadas pelo frontend via rechargeNotificationService
                
                // 9. Processar comissão de indicação automaticamente
                $commissionResult = $this->referralCommissionService->processRechargeCommission(
                    $userId, 
                    $finalAmount, 
                    $walletResult['transaction_id']
                );
                
                $this->db->commit();
                
                error_log("RECHARGE_SERVICE: Recarga processada com sucesso - User: {$userId}, Amount: {$finalAmount}");
                
                return [
                    'success' => true,
                    'message' => 'Recarga processada com sucesso',
                    'data' => [
                        'transaction_id' => $walletResult['transaction_id'],
                        'amount' => $finalAmount,
                        'original_amount' => $originalAmount,
                        'discount_amount' => $discountAmount,
                        'balance_before' => $balanceBefore,
                        'balance_after' => $balanceAfter,
                        'payment_method' => $paymentMethod,
                        'external_id' => $externalId,
                        'commission_processed' => $commissionResult ? $commissionResult['success'] : false
                    ]
                ];
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("RECHARGE_SERVICE ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function validateRechargeData($userId, $amount, $paymentMethod) {
        if (!$userId || $userId <= 0) {
            throw new Exception('ID do usuário inválido');
        }
        
        if (!$amount || $amount < 1.00) {
            throw new Exception('Valor mínimo para recarga é R$ 1,00');
        }
        
        if ($amount > 50000.00) {
            throw new Exception('Valor máximo para recarga é R$ 50.000,00');
        }
        
        $allowedMethods = ['pix', 'credit', 'transfer', 'paypal', 'crypto'];
        if (!in_array($paymentMethod, $allowedMethods)) {
            throw new Exception('Método de pagamento não permitido');
        }
    }
    
    private function getUserById($userId) {
        try {
            $query = "SELECT * FROM users WHERE id = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting user: " . $e->getMessage());
            return null;
        }
    }
    
    
    private function hasActiveReferral($userId) {
        try {
            $query = "SELECT * FROM indicacoes WHERE indicated_user_id = ? AND status = 'ativo' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
        } catch (Exception $e) {
            error_log("Error checking referral: " . $e->getMessage());
            return false;
        }
    }
    
    private function processReferralCommission($userId, $amount) {
        try {
            // Buscar dados da indicação
            $query = "SELECT * FROM indicacoes WHERE indicated_user_id = ? AND status = 'ativo' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $referral = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referral) {
                return ['success' => false, 'message' => 'Indicação não encontrada'];
            }
            
            // Calcular comissão
            $commissionPercentage = (float)$referral['commission_percentage'] ?: 5.0;
            $commissionAmount = ($amount * $commissionPercentage) / 100;
            
            // Registrar comissão
            $query = "INSERT INTO referral_commissions (
                referrer_id, referred_user_id, commission_type, amount, 
                commission_percentage, status, reference_table, reference_id, created_at
            ) VALUES (?, ?, 'recarga', ?, ?, 'pending', 'recargas', ?, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $referral['referrer_user_id'],
                $userId,
                $commissionAmount,
                $commissionPercentage,
                null // reference_id será o ID da recarga se houver tabela específica
            ]);
            
            error_log("RECHARGE_SERVICE: Comissão registrada - Referrer: {$referral['referrer_user_id']}, Amount: {$commissionAmount}");
            
            return [
                'success' => true,
                'commission_amount' => $commissionAmount,
                'referrer_id' => $referral['referrer_user_id']
            ];
            
        } catch (Exception $e) {
            error_log("Error processing referral commission: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function getPixKeys() {
        try {
            $query = "SELECT * FROM pix_keys WHERE status = 'active' ORDER BY is_default DESC, created_at ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting PIX keys: " . $e->getMessage());
            return [];
        }
    }
    
    public function validatePixPayment($pixKey, $amount, $txId = null) {
        try {
            // Verificar se a chave PIX é válida
            $query = "SELECT * FROM pix_keys WHERE pix_key = ? AND status = 'active' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$pixKey]);
            $pixKeyData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$pixKeyData) {
                return ['success' => false, 'message' => 'Chave PIX não encontrada'];
            }
            
            // Aqui você pode implementar validação adicional via webhook ou API do banco
            // Por enquanto, simular validação positiva
            
            return [
                'success' => true,
                'pix_key_data' => $pixKeyData,
                'validated_amount' => $amount,
                'transaction_id' => $txId ?: uniqid('PIX_')
            ];
            
        } catch (Exception $e) {
            error_log("Error validating PIX payment: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    /**
     * Método removido - notificações agora são criadas pelo frontend
     * para evitar duplicação
     */
}