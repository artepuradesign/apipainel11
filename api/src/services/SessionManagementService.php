
<?php
// src/services/SessionManagementService.php

require_once __DIR__ . '/../models/UserSession.php';

class SessionManagementService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createUserSession($userId, $expiresInSeconds = 21600) {
        try {
            $userSession = new UserSession($this->db);
            $sessionCreated = $userSession->createSession(
                $userId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                $expiresInSeconds
            );
            
            if ($sessionCreated) {
                return $userSession;
            }
            
            return false;
        } catch (Exception $e) {
            error_log("SESSION_MANAGEMENT_ERROR: " . $e->getMessage());
            return false;
        }
    }
}
