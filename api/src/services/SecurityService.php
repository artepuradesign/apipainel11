
<?php
// src/services/SecurityService.php

require_once __DIR__ . '/../utils/Security.php';

class SecurityService {
    private $db;
    private $security;
    
    public function __construct($db) {
        $this->db = $db;
        $this->security = new Security();
    }
    
    public function encryptData($data, $key = null) {
        $key = $key ?? $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_in_production';
        $iv = random_bytes(16);
        $encrypted = openssl_encrypt($data, 'AES-256-CBC', $key, 0, $iv);
        return base64_encode($iv . $encrypted);
    }
    
    public function decryptData($encryptedData, $key = null) {
        $key = $key ?? $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_in_production';
        $data = base64_decode($encryptedData);
        $iv = substr($data, 0, 16);
        $encrypted = substr($data, 16);
        return openssl_decrypt($encrypted, 'AES-256-CBC', $key, 0, $iv);
    }
    
    public function generateSecureToken($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    public function hashSensitiveData($data) {
        return hash('sha256', $data . $_ENV['HASH_SALT'] ?? 'default_salt');
    }
    
    public function validateRequestSignature($payload, $signature, $secret) {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($signature, $expectedSignature);
    }
    
    public function scanForMalware($filePath) {
        // Implementação básica de scanner de malware
        $dangerousPatterns = [
            '/eval\s*\(/i',
            '/exec\s*\(/i',
            '/system\s*\(/i',
            '/shell_exec\s*\(/i',
            '/passthru\s*\(/i',
            '/<\?php.*(?:eval|exec|system|shell_exec)/is',
            '/base64_decode\s*\(/i'
        ];
        
        if (!file_exists($filePath)) {
            return ['safe' => false, 'reason' => 'Arquivo não encontrado'];
        }
        
        $content = file_get_contents($filePath);
        
        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $content)) {
                return [
                    'safe' => false,
                    'reason' => 'Padrão suspeito encontrado',
                    'pattern' => $pattern
                ];
            }
        }
        
        return ['safe' => true];
    }
    
    public function auditUserAction($userId, $action, $details = []) {
        try {
            $query = "INSERT INTO security_audit (user_id, action, details, ip_address, user_agent, created_at)
                     VALUES (?, ?, ?, ?, ?, NOW())";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([
                $userId,
                $action,
                json_encode($details),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
        } catch (Exception $e) {
            error_log("SecurityService audit error: " . $e->getMessage());
            return false;
        }
    }
    
    public function detectSuspiciousActivity($userId) {
        // Detectar múltiplos logins falhados
        $query = "SELECT COUNT(*) as failed_attempts FROM security_audit 
                 WHERE user_id = ? AND action = 'login_failed' 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $failedAttempts = $stmt->fetch()['failed_attempts'];
        
        if ($failedAttempts >= 5) {
            return [
                'suspicious' => true,
                'reason' => 'Múltiplas tentativas de login falhadas',
                'action' => 'block_user'
            ];
        }
        
        // Detectar acessos de IPs diferentes
        $query = "SELECT COUNT(DISTINCT ip_address) as ip_count FROM security_audit 
                 WHERE user_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $ipCount = $stmt->fetch()['ip_count'];
        
        if ($ipCount > 3) {
            return [
                'suspicious' => true,
                'reason' => 'Acessos de múltiplos IPs',
                'action' => 'require_verification'
            ];
        }
        
        return ['suspicious' => false];
    }
    
    public function generateTwoFactorCode($userId) {
        $code = sprintf('%06d', mt_rand(0, 999999));
        $expires = date('Y-m-d H:i:s', time() + 300); // 5 minutos
        
        $query = "INSERT INTO two_factor_codes (user_id, code, expires_at)
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE code = ?, expires_at = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $code, $expires, $code, $expires]);
        
        return $code;
    }
    
    public function validateTwoFactorCode($userId, $code) {
        $query = "SELECT code FROM two_factor_codes 
                 WHERE user_id = ? AND expires_at > NOW()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $storedCode = $stmt->fetch()['code'] ?? null;
        
        if ($storedCode && hash_equals($storedCode, $code)) {
            // Remover código usado
            $query = "DELETE FROM two_factor_codes WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return true;
        }
        
        return false;
    }
    
    public function checkPasswordBreach($password) {
        // Implementar verificação contra bases de senhas vazadas
        // Por simplicidade, verificar contra senhas comuns
        $commonPasswords = [
            '123456', 'password', '123456789', '12345678',
            'qwerty', 'abc123', '111111', 'admin'
        ];
        
        return in_array(strtolower($password), $commonPasswords);
    }
    
    public function generateCSRFToken() {
        $token = $this->generateSecureToken();
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
    
    public function validateCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && 
               hash_equals($_SESSION['csrf_token'], $token);
    }
    
    public function sanitizeFileName($filename) {
        // Remove caracteres perigosos
        $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
        
        // Remove pontos múltiplos
        $filename = preg_replace('/\.+/', '.', $filename);
        
        // Remove pontos no início e fim
        $filename = trim($filename, '.');
        
        // Limitar tamanho
        return substr($filename, 0, 255);
    }
    
    public function getSecurityReport($userId = null) {
        $report = [];
        
        // Tentativas de login falhadas
        $query = "SELECT COUNT(*) as count FROM security_audit 
                 WHERE action = 'login_failed' 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)";
        if ($userId) {
            $query .= " AND user_id = ?";
        }
        $stmt = $this->db->prepare($query);
        $stmt->execute($userId ? [$userId] : []);
        $report['failed_logins_24h'] = $stmt->fetch()['count'];
        
        // IPs suspeitos
        $query = "SELECT ip_address, COUNT(*) as attempts FROM security_audit 
                 WHERE action = 'login_failed' 
                 AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
                 GROUP BY ip_address 
                 HAVING attempts >= 3";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $report['suspicious_ips'] = $stmt->fetchAll();
        
        return $report;
    }
}
