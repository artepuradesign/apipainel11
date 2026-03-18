
<?php
// src/services/AuthenticationService.php

class AuthenticationService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findUserByEmail($email) {
        try {
            $query = "SELECT *, senhaalfa as password_hash FROM users WHERE email = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                error_log("AUTH_SERVICE: Usuário encontrado - ID: {$user['id']}, Email: {$user['email']}, Status: {$user['status']}");
                error_log("AUTH_SERVICE: Senha hash: " . substr($user['password_hash'], 0, 10) . "...");
            } else {
                error_log("AUTH_SERVICE: Nenhum usuário encontrado para email: " . $email);
            }
            
            return $user;
        } catch (Exception $e) {
            error_log("AUTH_SERVICE_FIND_USER_ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function verifyPassword($password, $passwordHash) {
        if (empty($passwordHash)) {
            return false;
        }
        
        // Primeiro tentar verificar com password_verify (bcrypt)
        if (password_verify($password, $passwordHash)) {
            return true;
        }
        
        // Se falhar, tentar com MD5 simples (campo senhaalfa)
        $md5Hash = md5($password);
        if ($md5Hash === $passwordHash) {
            return true;
        }
        
        // Comparação direta (senha em texto plano - para compatibilidade)
        if ($password === $passwordHash) {
            return true;
        }
        
        return false;
    }
    
    public function updateLastLogin($userId) {
        try {
            $query = "UPDATE users SET ultimo_login = NOW(), updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            error_log("AUTH_SERVICE: Último login atualizado para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE_UPDATE_LAST_LOGIN_ERROR: " . $e->getMessage());
        }
    }
}
