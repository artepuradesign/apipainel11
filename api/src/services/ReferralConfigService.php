
<?php
// src/services/ReferralConfigService.php

class ReferralConfigService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getReferralConfig() {
        try {
            error_log("REFERRAL_CONFIG: Buscando config_value do ID 6 da system_config");
            
            // Buscar especificamente o registro ID 6 da system_config
            $query = "SELECT config_value, config_type FROM system_config WHERE id = 6";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && isset($result['config_value'])) {
                $bonusAmount = (float)$result['config_value'];
                error_log("REFERRAL_CONFIG: ID 6 config_value = {$result['config_value']} (tipo: {$result['config_type']})");
            } else {
                error_log("REFERRAL_CONFIG ERROR: ID 6 não encontrado na system_config!");
                throw new Exception("Configuração de bônus não encontrada (ID 6)");
            }
            
            $config = [
                'referral_bonus_amount' => $bonusAmount,
                'referral_commission_percentage' => 5.0
            ];
            
            error_log("REFERRAL_CONFIG: Configuração final com ID 6: " . json_encode($config));
            return $config;
            
        } catch (Exception $e) {
            error_log("REFERRAL_CONFIG CRITICAL ERROR: " . $e->getMessage());
            throw $e; // Re-throw para forçar uso da API externa
        }
    }
    
    public function getBonusAmountById($id = 6) {
        try {
            error_log("REFERRAL_CONFIG: Buscando config_value do ID {$id}");
            
            $query = "SELECT config_value, config_type FROM system_config WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result && isset($result['config_value'])) {
                $value = (float)$result['config_value'];
                error_log("REFERRAL_CONFIG: ID {$id} = {$value}");
                return $value;
            } else {
                error_log("REFERRAL_CONFIG ERROR: ID {$id} não encontrado!");
                throw new Exception("Configuração não encontrada (ID {$id})");
            }
            
        } catch (Exception $e) {
            error_log("REFERRAL_CONFIG ERROR: " . $e->getMessage());
            throw $e;
        }
    }
}
