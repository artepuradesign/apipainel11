
<?php
// src/services/AuditLogService.php

class AuditLogService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function logEvent($entityType, $entityId, $userId, $action, $description, $oldValues = null, $newValues = null) {
        try {
            $query = "INSERT INTO audit_logs (
                entity_type, entity_id, user_id, action, description, 
                old_values, new_values, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $entityType, $entityId, $userId, $action, $description,
                $oldValues, $newValues, $ipAddress, $userAgent
            ]);
            
            if ($result) {
                $logId = $this->db->lastInsertId();
                error_log("AUDIT_LOG: Evento registrado - ID: {$logId}, Entity: {$entityType}, Action: {$action}");
                
                return [
                    'success' => true,
                    'log_id' => $logId
                ];
            }
            
            return ['success' => false, 'message' => 'Erro ao registrar log de auditoria'];
            
        } catch (Exception $e) {
            error_log("AUDIT_LOG ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function logSuccessfulLogin($userId) {
        try {
            $this->logUserAction($userId, 'login_success', 'auth', 'Login realizado com sucesso');
        } catch (Exception $e) {
            error_log("AUDIT_LOG_SUCCESS ERROR: " . $e->getMessage());
        }
    }
    
    public function logFailedLogin($userId, $reason = 'wrong_credentials') {
        try {
            $this->logUserAction($userId, 'login_failed', 'auth', 'Tentativa de login falhada: ' . $reason);
        } catch (Exception $e) {
            error_log("AUDIT_LOG_FAILED ERROR: " . $e->getMessage());
        }
    }
    
    private function logUserAction($userId, $action, $category, $description) {
        try {
            $query = "INSERT INTO user_audit (user_id, action, category, description, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $action, $category, $description, $ipAddress, $userAgent]);
            
        } catch (Exception $e) {
            error_log("AUDIT_LOG_ACTION ERROR: " . $e->getMessage());
        }
    }
}
