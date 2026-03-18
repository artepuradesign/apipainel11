
<?php
// src/models/Session.php

require_once 'BaseModel.php';

class Session extends BaseModel {
    protected $table = 'user_sessions';
    
    public function createSession($userId) {
        try {
            // Gerar token único
            $token = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + 3600); // 1 hora
            
            // Invalidar sessões antigas do usuário
            $this->invalidateUserSessions($userId);
            
            // Criar nova sessão
            $query = "INSERT INTO {$this->table} (user_id, token, expires_at, created_at, last_activity) 
                     VALUES (?, ?, ?, NOW(), NOW())";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $token, $expiresAt]);
            
            return [
                'session_id' => $this->db->lastInsertId(),
                'token' => $token,
                'expires_at' => $expiresAt
            ];
            
        } catch (Exception $e) {
            error_log("SESSION CREATE ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    public function validateSession($token) {
        try {
            $query = "SELECT * FROM {$this->table} WHERE token = ? AND expires_at > NOW() LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$token]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("SESSION VALIDATE ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    public function updateActivity($sessionId) {
        try {
            $query = "UPDATE {$this->table} SET last_activity = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$sessionId]);
        } catch (Exception $e) {
            error_log("SESSION UPDATE ACTIVITY ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function invalidateSession($token) {
        try {
            $query = "DELETE FROM {$this->table} WHERE token = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$token]);
        } catch (Exception $e) {
            error_log("SESSION INVALIDATE ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    private function invalidateUserSessions($userId) {
        try {
            $query = "DELETE FROM {$this->table} WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$userId]);
        } catch (Exception $e) {
            error_log("SESSION INVALIDATE USER ERROR: " . $e->getMessage());
            return false;
        }
    }
}
