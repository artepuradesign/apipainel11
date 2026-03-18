
<?php
// src/services/UserActivationService.php

class UserActivationService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function activatePendingAccount($userId) {
        try {
            $query = "UPDATE users SET status = 'ativo', updated_at = NOW() WHERE id = ? AND status = 'pendente'";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$userId]);
            
            if ($result) {
                error_log("USER_ACTIVATION: Conta ativada automaticamente - ID: " . $userId);
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("USER_ACTIVATION ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function isAccountActive($status) {
        return in_array($status, ['ativo', 'pendente']);
    }
}
