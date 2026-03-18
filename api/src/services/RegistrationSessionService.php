
<?php
// src/services/RegistrationSessionService.php

require_once __DIR__ . '/../models/UserSession.php';

class RegistrationSessionService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createSessionForUser($userId) {
        error_log("REGISTRATION_SESSION: === CRIANDO SESSÃO AUTOMÁTICA ===");
        $userSession = new UserSession($this->db);
        $sessionToken = null;
        
        try {
            $sessionResult = $userSession->createSession(
                $userId,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                21600 // 6 horas
            );
            
            if ($sessionResult) {
                $sessionToken = $userSession->session_token;
                error_log("REGISTRATION_SESSION: ✅ Sessão criada com sucesso - Token: " . substr($sessionToken, 0, 10) . "...");
            } else {
                error_log("REGISTRATION_SESSION WARNING: Falha ao criar sessão");
            }
        } catch (Exception $e) {
            error_log("REGISTRATION_SESSION WARNING: Erro ao criar sessão: " . $e->getMessage());
            // Não falha o registro por causa da sessão
        }
        
        return $sessionToken;
    }
}
