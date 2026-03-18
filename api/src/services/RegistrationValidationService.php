
<?php
// src/services/RegistrationValidationService.php

class RegistrationValidationService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function validateRegistrationData($data) {
        $required = ['email', 'password', 'full_name'];
        $missing = [];
        
        foreach ($required as $field) {
            if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
                $missing[] = $field;
            }
        }
        
        if (!empty($missing)) {
            return [
                'valid' => false,
                'message' => 'Campos obrigatórios ausentes: ' . implode(', ', $missing)
            ];
        }
        
        // Validar email
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return [
                'valid' => false,
                'message' => 'Email inválido'
            ];
        }
        
        // Validar senha
        if (strlen($data['password']) < 6) {
            return [
                'valid' => false,
                'message' => 'Senha deve ter pelo menos 6 caracteres'
            ];
        }
        
        return ['valid' => true];
    }
    
    public function userExists($data) {
        try {
            $query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['email']]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result['count'] > 0;
        } catch (Exception $e) {
            error_log("USER_EXISTS_CHECK ERROR: " . $e->getMessage());
            return false;
        }
    }
}
