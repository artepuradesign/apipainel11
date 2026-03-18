
<?php
// src/services/UniqueSessionService.php

require_once __DIR__ . '/../models/UserSession.php';

class UniqueSessionService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createUniqueSession($userId, $ipAddress, $userAgent) {
        try {
            // Invalidar sessões anteriores do usuário
            $this->invalidateUserSessions($userId);
            
            // Criar nova sessão
            $userSession = new UserSession($this->db);
            
            if ($userSession->createSession($userId, $ipAddress, $userAgent)) {
                return $userSession;
            }
            
            return null;
            
        } catch (Exception $e) {
            error_log("UNIQUE_SESSION_SERVICE ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    private function invalidateUserSessions($userId) {
        try {
            $query = "UPDATE user_sessions SET status = 'revogada' WHERE user_id = ? AND status = 'ativa'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            error_log("UNIQUE_SESSION_SERVICE: Sessões anteriores invalidadas para usuário: " . $userId);
            
        } catch (Exception $e) {
            error_log("UNIQUE_SESSION_SERVICE INVALIDATE ERROR: " . $e->getMessage());
        }
    }
}
