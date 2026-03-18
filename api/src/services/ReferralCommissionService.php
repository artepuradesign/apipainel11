<?php
// src/services/ReferralCommissionService.php

require_once __DIR__ . '/ConfigService.php';
require_once __DIR__ . '/WalletService.php';
require_once __DIR__ . '/NotificationService.php';

class ReferralCommissionService {
    private $db;
    private $configService;
    private $walletService;
    private $notificationService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->configService = new ConfigService($db);
        $this->walletService = new WalletService($db);
        $this->notificationService = new NotificationService($db);
    }
    
    public function processRechargeCommission($userId, $rechargeAmount, $transactionId = null) {
        try {
            // Verificar se o sistema de comissões está ativo
            if (!$this->configService->isReferralCommissionEnabled()) {
                error_log("REFERRAL_COMMISSION: Sistema de comissões desabilitado");
                return ['success' => false, 'message' => 'Sistema de comissões desabilitado'];
            }
            
            // Buscar indicação ativa para este usuário
            $referralData = $this->getActiveReferralForUser($userId);
            if (!$referralData) {
                error_log("REFERRAL_COMMISSION: Nenhuma indicação ativa encontrada para usuário {$userId}");
                return ['success' => false, 'message' => 'Nenhuma indicação ativa encontrada'];
            }
            
            $referrerId = $referralData['indicador_id'];
            $commissionPercentage = $this->configService->get('referral_commission_percentage', 5.0);
            $commissionAmount = ($rechargeAmount * $commissionPercentage) / 100;
            
            // Verificar se a comissão já foi processada para esta transação
            if ($transactionId && $this->isCommissionAlreadyProcessed($transactionId)) {
                error_log("REFERRAL_COMMISSION: Comissão já processada para transação {$transactionId}");
                return ['success' => false, 'message' => 'Comissão já processada'];
            }
            
            $this->db->beginTransaction();
            
            try {
                // Registrar a comissão na tabela de comissões
                $commissionId = $this->createCommissionRecord(
                    $referrerId,
                    $userId,
                    'recarga',
                    $commissionAmount,
                    $commissionPercentage,
                    $rechargeAmount,
                    'wallet_transactions',
                    $transactionId
                );
                
                // Adicionar comissão ao saldo do plano do indicador
                $walletResult = $this->walletService->createTransaction(
                    $referrerId,
                    'comissao',
                    $commissionAmount,
                    "Comissão {$commissionPercentage}% sobre recarga de R$ " . number_format($rechargeAmount, 2, ',', '.'),
                    'referral_commission',
                    $commissionId
                );
                
                if (!$walletResult['success']) {
                    throw new Exception('Erro ao processar comissão: ' . $walletResult['message']);
                }
                
                // Marcar comissão como paga
                $this->markCommissionAsPaid($commissionId);
                
                // Buscar dados dos usuários para notificação
                $referrerData = $this->getUserData($referrerId);
                $referredData = $this->getUserData($userId);
                
                // Enviar notificação
                $this->sendCommissionNotification($referrerId, $commissionAmount, $rechargeAmount, $commissionPercentage, $referredData);
                
                $this->db->commit();
                
                error_log("REFERRAL_COMMISSION: Processada com sucesso - Indicador: {$referrerId}, Valor: R$ {$commissionAmount} ({$commissionPercentage}% de R$ {$rechargeAmount})");
                
                return [
                    'success' => true,
                    'commission_id' => $commissionId,
                    'commission_amount' => $commissionAmount,
                    'commission_percentage' => $commissionPercentage,
                    'referrer_id' => $referrerId,
                    'referred_id' => $userId
                ];
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("REFERRAL_COMMISSION ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function getActiveReferralForUser($userId) {
        try {
            $query = "SELECT * FROM indicacoes WHERE indicado_id = ? AND status = 'ativo' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting active referral: " . $e->getMessage());
            return null;
        }
    }
    
    private function isCommissionAlreadyProcessed($transactionId) {
        try {
            $query = "SELECT id FROM referral_commissions WHERE reference_id = ? AND reference_table = 'wallet_transactions' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$transactionId]);
            return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
        } catch (Exception $e) {
            error_log("Error checking commission processed: " . $e->getMessage());
            return false;
        }
    }
    
    private function createCommissionRecord($referrerId, $referredId, $type, $amount, $percentage, $referenceAmount, $referenceTable, $referenceId) {
        try {
            $query = "INSERT INTO referral_commissions (
                referrer_id, referred_user_id, commission_type, amount, 
                commission_percentage, reference_amount, status, 
                reference_table, reference_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $referrerId,
                $referredId,
                $type,
                $amount,
                $percentage,
                $referenceAmount,
                $referenceTable,
                $referenceId
            ]);
            
            return $this->db->lastInsertId();
            
        } catch (Exception $e) {
            throw new Exception("Error creating commission record: " . $e->getMessage());
        }
    }
    
    private function markCommissionAsPaid($commissionId) {
        try {
            $query = "UPDATE referral_commissions SET status = 'paid', paid_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$commissionId]);
        } catch (Exception $e) {
            error_log("Error marking commission as paid: " . $e->getMessage());
        }
    }
    
    private function getUserData($userId) {
        try {
            $query = "SELECT id, full_name, email FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting user data: " . $e->getMessage());
            return null;
        }
    }
    
    private function sendCommissionNotification($referrerId, $commissionAmount, $rechargeAmount, $commissionPercentage, $referredData) {
        try {
            $this->notificationService->createNotification(
                $referrerId,
                'referral_commission',
                'Nova Comissão de Indicação! 💰',
                "{$referredData['full_name']} fez uma recarga de R$ " . number_format($rechargeAmount, 2, ',', '.') . ". Você recebeu R$ " . number_format($commissionAmount, 2, ',', '.') . " ({$commissionPercentage}%) como comissão!",
                '/dashboard/wallet',
                'Ver Carteira',
                'medium'
            );
            
            error_log("REFERRAL_COMMISSION_NOTIFICATION: Enviada para Indicador ID {$referrerId}");
            
        } catch (Exception $e) {
            error_log("Error sending commission notification: " . $e->getMessage());
        }
    }
    
    public function getUserCommissions($userId, $limit = 50, $offset = 0) {
        try {
            $query = "SELECT rc.*, u.full_name as referred_user_name 
                     FROM referral_commissions rc 
                     LEFT JOIN users u ON rc.referred_user_id = u.id 
                     WHERE rc.referrer_id = ? 
                     ORDER BY rc.created_at DESC 
                     LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("Error getting user commissions: " . $e->getMessage());
            return [];
        }
    }
}