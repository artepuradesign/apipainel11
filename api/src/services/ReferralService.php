<?php
// src/services/ReferralService.php

class ReferralService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function processReferralBonus($indicatorId, $indicatedId, $bonusAmount = 5.00) {
        try {
            require_once __DIR__ . '/WalletService.php';
            $walletService = new WalletService($this->db);
            
            // Registrar transação de bônus para o indicador
            $transactionResult = $walletService->createTransaction(
                $indicatorId, 
                'indicacao', 
                $bonusAmount, 
                "Bônus de indicação - Novo usuário registrado",
                'referral',
                $indicatedId
            );
            
            if ($transactionResult['success']) {
                error_log("REFERRAL BONUS: Transação criada - Indicador: {$indicatorId}, Valor: R$ {$bonusAmount}");
                
                return [
                    'success' => true,
                    'transaction_id' => $transactionResult['transaction_id'],
                    'bonus_amount' => $bonusAmount,
                    'balance_after' => $transactionResult['balance_after']
                ];
            } else {
                error_log("REFERRAL BONUS ERROR: " . $transactionResult['message']);
                return ['success' => false, 'message' => $transactionResult['message']];
            }
            
        } catch (Exception $e) {
            error_log("REFERRAL BONUS EXCEPTION: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function processReferralCommission($userId, $amount, $transactionType = 'recarga') {
        try {
            // Buscar indicação ativa
            $query = "SELECT * FROM indicacoes WHERE indicated_user_id = ? AND status = 'ativo' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $referral = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referral) {
                return ['success' => false, 'message' => 'Nenhuma indicação ativa encontrada'];
            }
            
            // Calcular comissão
            $commissionPercentage = (float)$referral['commission_percentage'] ?: 5.0;
            $commissionAmount = ($amount * $commissionPercentage) / 100;
            
            // Registrar comissão
            $query = "INSERT INTO referral_commissions (
                referrer_id, referred_user_id, commission_type, amount, 
                commission_percentage, status, reference_table, reference_id, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, NOW(), NOW())";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $referral['referrer_user_id'],
                $userId,
                $transactionType,
                $commissionAmount,
                $commissionPercentage,
                $transactionType . 's', // reference_table
                null // reference_id
            ]);
            
            if ($result) {
                $commissionId = $this->db->lastInsertId();
                error_log("REFERRAL: Comissão registrada - ID: {$commissionId}, Referrer: {$referral['referrer_user_id']}, Amount: {$commissionAmount}");
                
                return [
                    'success' => true,
                    'commission_id' => $commissionId,
                    'commission_amount' => $commissionAmount,
                    'referrer_id' => $referral['referrer_user_id']
                ];
            }
            
            return ['success' => false, 'message' => 'Erro ao registrar comissão'];
            
        } catch (Exception $e) {
            error_log("REFERRAL ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function getReferralConfig() {
        try {
            $query = "SELECT config_key, config_value FROM system_config 
                     WHERE config_key IN ('referral_bonus_amount', 'referral_commission_percentage') 
                     AND status = 'active'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $config = [
                'referral_bonus_amount' => 5.00,
                'referral_commission_percentage' => 5.0
            ];
            
            foreach ($configs as $row) {
                $config[$row['config_key']] = (float)$row['config_value'];
            }
            
            return $config;
        } catch (Exception $e) {
            error_log("Error getting referral config: " . $e->getMessage());
            return [
                'referral_bonus_amount' => 5.00,
                'referral_commission_percentage' => 5.0
            ];
        }
    }
}