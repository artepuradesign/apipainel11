
<?php
// src/services/RegistrationAuditService.php

class RegistrationAuditService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function logFinalRegistration($userId, $userData, $indicadorId) {
        try {
            $query = "INSERT INTO system_logs (
                user_id, log_level, action, module, description, details,
                ip_address, user_agent, created_at
            ) VALUES (?, 'info', 'user_registration_complete', 'auth', ?, ?, ?, ?, NOW())";
            
            $details = json_encode([
                'timestamp' => date('Y-m-d H:i:s'),
                'user_id' => $userId,
                'email' => $userData['email'],
                'user_role' => $userData['user_role'] ?? 'assinante',
                'indicador_id' => $indicadorId,
                'registration_method' => 'api_complete'
            ]);
            
            $description = "Registro completo do usuário ID: {$userId} com todas as tabelas relacionadas";
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $userId,
                $description,
                $details,
                $ipAddress,
                $userAgent
            ]);
            
            error_log("REGISTRATION_AUDIT: Log final de registro criado para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("REGISTRATION_AUDIT WARNING: Erro ao criar log final: " . $e->getMessage());
        }
    }
}
