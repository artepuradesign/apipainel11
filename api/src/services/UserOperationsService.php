
<?php
// src/services/UserOperationsService.php

class UserOperationsService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function generateReferralCode($email) {
        try {
            // Extrair parte do email antes do @
            $emailParts = explode('@', $email);
            $baseCode = strtoupper(substr($emailParts[0], 0, 3));
            
            // Garantir que tenha pelo menos 3 caracteres
            if (strlen($baseCode) < 3) {
                $baseCode = 'REF';
            }
            
            // Limpar caracteres especiais
            $baseCode = preg_replace('/[^A-Z0-9]/', '', $baseCode);
            
            // Adicionar 4 números aleatórios
            $codigo = $baseCode . sprintf('%04d', mt_rand(1000, 9999));
            
            // Verificar se já existe e gerar um novo se necessário
            $attempts = 0;
            while ($this->referralCodeExists($codigo) && $attempts < 10) {
                $codigo = $baseCode . sprintf('%04d', mt_rand(1000, 9999));
                $attempts++;
            }
            
            // Se ainda não for único após 10 tentativas, usar timestamp
            if ($this->referralCodeExists($codigo)) {
                $codigo = $baseCode . substr(time(), -4);
            }
            
            return $codigo;
            
        } catch (Exception $e) {
            error_log("REFERRAL_CODE_GENERATION ERROR: " . $e->getMessage());
            return 'REF' . substr(time(), -4);
        }
    }
    
    private function referralCodeExists($codigo) {
        try {
            $query = "SELECT id FROM users WHERE codigo_indicacao = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$codigo]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            error_log("REFERRAL_CODE_CHECK ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function validateUserData($data) {
        $errors = [];
        
        // Email obrigatório e válido
        if (!isset($data['email']) || empty(trim($data['email']))) {
            $errors[] = 'Email é obrigatório';
        } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email deve ter um formato válido';
        }
        
        // Nome completo obrigatório
        if (!isset($data['full_name']) || empty(trim($data['full_name']))) {
            $errors[] = 'Nome completo é obrigatório';
        }
        
        // Senha obrigatória
        if (!isset($data['password']) || empty($data['password'])) {
            $errors[] = 'Senha é obrigatória';
        } elseif (strlen($data['password']) < 6) {
            $errors[] = 'Senha deve ter pelo menos 6 caracteres';
        }
        
        // Tipo de usuário válido
        if (isset($data['user_role']) && !in_array($data['user_role'], ['assinante', 'suporte', 'admin'])) {
            $errors[] = 'Tipo de usuário inválido';
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    public function checkEmailExists($email, $excludeId = null) {
        try {
            $query = "SELECT id FROM users WHERE email = ?";
            $params = [$email];
            
            if ($excludeId) {
                $query .= " AND id != ?";
                $params[] = $excludeId;
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            return $stmt->rowCount() > 0;
            
        } catch (Exception $e) {
            error_log("EMAIL_EXISTS_CHECK ERROR: " . $e->getMessage());
            return false;
        }
    }
}
