
<?php
// src/services/TokenService.php

class TokenService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function generateToken($userId) {
        // Gerar token simples para desenvolvimento
        $token = bin2hex(random_bytes(32));
        
        try {
            // Salvar token em tabela de sessões se existir
            $query = "INSERT INTO user_sessions (user_id, session_token, expires_at, created_at) 
                     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NOW())
                     ON DUPLICATE KEY UPDATE 
                     session_token = VALUES(session_token), expires_at = VALUES(expires_at), updated_at = NOW()";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $token]);
        } catch (Exception $e) {
            error_log("TOKEN_SERVICE: Erro ao salvar token: " . $e->getMessage());
        }
        
        return $token;
    }
    
    public function generateSessionToken($userId) {
        // Gerar token de sessão
        return 'session_' . bin2hex(random_bytes(16)) . '_' . $userId;
    }
    
    public function validateToken($token) {
        try {
            $query = "SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW() AND status = 'ativa'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$token]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return [
                    'valid' => true,
                    'user_id' => $result['user_id']
                ];
            }
            
            return ['valid' => false];
        } catch (Exception $e) {
            error_log("TOKEN_SERVICE VALIDATE ERROR: " . $e->getMessage());
            return ['valid' => false];
        }
    }
    
    public function revokeToken($token) {
        try {
            $query = "DELETE FROM user_sessions WHERE session_token = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$token]);
            
            return [
                'success' => true,
                'message' => 'Token revogado com sucesso'
            ];
        } catch (Exception $e) {
            error_log("TOKEN_SERVICE REVOKE ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao revogar token'
            ];
        }
    }
}
