
<?php
// src/models/UserSession.php

class UserSession {
    private $db;
    public $id;
    public $user_id;
    public $session_token;
    public $expires_at;
    public $status;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function validateSession($token) {
        try {
            error_log("USER_SESSION: Validando token: " . substr($token, 0, 15) . '...');
            
            // Verificar se o token existe (usando apenas session_token)
            $checkQuery = "SELECT * FROM user_sessions WHERE session_token = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$token]);
            $tokenCheck = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$tokenCheck) {
                error_log("USER_SESSION: Token não encontrado na base de dados");
                return false;
            }
            
            error_log("USER_SESSION: Token encontrado - User ID: " . $tokenCheck['user_id'] . 
                     ", Status: " . $tokenCheck['status'] . 
                     ", Expires: " . $tokenCheck['expires_at']);
            
            // Verificar se não está expirado E se está ativo
            $query = "SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > NOW() AND status = 'ativa'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$token]);
            $session = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($session) {
                error_log("USER_SESSION: Token válido e ativo para usuário: " . $session['user_id']);
                
                $this->id = $session['id'];
                $this->user_id = $session['user_id'];
                $this->session_token = $session['session_token'];
                $this->expires_at = $session['expires_at'];
                $this->status = $session['status'];
                
                // Atualizar última atividade
                $this->updateLastActivity();
                
                return true;
            } else {
                if ($tokenCheck['status'] !== 'ativa') {
                    error_log("USER_SESSION: Token com status inativo: " . $tokenCheck['status']);
                } else {
                    error_log("USER_SESSION: Token expirado - Expires at: " . $tokenCheck['expires_at'] . ", Current time: " . date('Y-m-d H:i:s'));
                }
                return false;
            }
            
        } catch (Exception $e) {
            error_log("USER_SESSION VALIDATE ERROR: " . $e->getMessage());
            error_log("USER_SESSION VALIDATE ERROR TRACE: " . $e->getTraceAsString());
            return false;
        }
    }
    
    public function revokeSession($token) {
        try {
            $query = "UPDATE user_sessions SET status = 'revogada', updated_at = NOW() WHERE session_token = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$token]);
            
        } catch (Exception $e) {
            error_log("USER_SESSION REVOKE ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function createSession($userId, $ipAddress, $userAgent, $expiresInSeconds = 21600) {
        try {
            error_log("USER_SESSION: Iniciando criação de sessão para usuário: " . $userId);
            
            $sessionToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', time() + $expiresInSeconds);
            
            error_log("USER_SESSION: Token gerado: " . substr($sessionToken, 0, 15) . "...");
            
            // Usar a estrutura correta da tabela user_sessions
            $query = "INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at, status, created_at, last_activity) 
                     VALUES (?, ?, ?, ?, ?, 'ativa', NOW(), NOW())";
            
            error_log("USER_SESSION: Executando query de criação...");
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $userId,
                $sessionToken,
                $ipAddress,
                $userAgent,
                $expiresAt
            ]);
            
            if ($result) {
                $this->id = $this->db->lastInsertId();
                $this->session_token = $sessionToken;
                $this->user_id = $userId;
                $this->expires_at = $expiresAt;
                $this->status = 'ativa';
                
                error_log("USER_SESSION: Sessão criada com sucesso - ID: " . $this->id);
                return true;
            } else {
                error_log("USER_SESSION: Falha ao inserir sessão na base de dados");
                return false;
            }
            
        } catch (Exception $e) {
            error_log("USER_SESSION CREATE ERROR: " . $e->getMessage());
            error_log("USER_SESSION CREATE ERROR TRACE: " . $e->getTraceAsString());
            return false;
        }
    }
    
    private function updateLastActivity() {
        try {
            $query = "UPDATE user_sessions SET last_activity = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$this->id]);
            
        } catch (Exception $e) {
            error_log("USER_SESSION UPDATE_ACTIVITY ERROR: " . $e->getMessage());
        }
    }
}
