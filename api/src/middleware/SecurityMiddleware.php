
<?php
// src/middleware/SecurityMiddleware.php

class SecurityMiddleware {
    private $allowedOrigins;
    private $blockedIPs;
    
    public function __construct() {
        $this->allowedOrigins = [
            $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:3001'
        ];
        
        $this->blockedIPs = [
            // Lista de IPs bloqueados
        ];
    }
    
    public function handle() {
        // Verificar IP bloqueado
        if ($this->isIPBlocked()) {
            $this->sendBlockedResponse();
            return false;
        }
        
        // Headers de segurança
        $this->setSecurityHeaders();
        
        // Verificar CSRF para requisições POST/PUT/DELETE
        if (in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT', 'DELETE', 'PATCH'])) {
            if (!$this->validateCSRF()) {
                $this->sendCSRFError();
                return false;
            }
        }
        
        // Verificar rate limiting básico
        if (!$this->checkBasicRateLimit()) {
            $this->sendRateLimitError();
            return false;
        }
        
        return true;
    }
    
    private function isIPBlocked() {
        $clientIP = $this->getClientIP();
        return in_array($clientIP, $this->blockedIPs);
    }
    
    private function setSecurityHeaders() {
        // Headers de segurança básicos
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');
        header('Referrer-Policy: strict-origin-when-cross-origin');
        header('Content-Security-Policy: default-src \'self\'');
        
        // Header contra clickjacking
        header('X-Frame-Options: SAMEORIGIN');
        
        // Header HSTS (apenas em HTTPS)
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }
    }
    
    private function validateCSRF() {
        // Verificar token CSRF em headers ou POST data
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? $_POST['csrf_token'] ?? null;
        
        if (!$token) {
            return false;
        }
        
        // Verificar se o token é válido
        return $this->isValidCSRFToken($token);
    }
    
    private function isValidCSRFToken($token) {
        // Implementar validação de token CSRF
        // Por simplicidade, verificar se existe na sessão
        session_start();
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    private function checkBasicRateLimit() {
        $clientIP = $this->getClientIP();
        $cacheKey = 'rate_limit_' . md5($clientIP);
        
        // Verificar cache de rate limit (implementação básica)
        $requestCount = $this->getCacheValue($cacheKey, 0);
        
        if ($requestCount > 100) { // 100 requests por minuto
            return false;
        }
        
        // Incrementar contador
        $this->setCacheValue($cacheKey, $requestCount + 1, 60); // TTL de 1 minuto
        
        return true;
    }
    
    private function getCacheValue($key, $default = null) {
        // Implementação básica usando arquivos
        $cacheFile = sys_get_temp_dir() . '/cache_' . $key;
        
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            if ($data && $data['expires'] > time()) {
                return $data['value'];
            }
        }
        
        return $default;
    }
    
    private function setCacheValue($key, $value, $ttl) {
        $cacheFile = sys_get_temp_dir() . '/cache_' . $key;
        $data = [
            'value' => $value,
            'expires' => time() + $ttl
        ];
        file_put_contents($cacheFile, json_encode($data));
    }
    
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    private function sendBlockedResponse() {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Acesso negado',
            'error_code' => 'IP_BLOCKED'
        ]);
        exit;
    }
    
    private function sendCSRFError() {
        http_response_code(403);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Token CSRF inválido',
            'error_code' => 'INVALID_CSRF_TOKEN'
        ]);
        exit;
    }
    
    private function sendRateLimitError() {
        http_response_code(429);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Muitas requisições',
            'error_code' => 'RATE_LIMIT_EXCEEDED'
        ]);
        exit;
    }
    
    public function generateCSRFToken() {
        session_start();
        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;
        return $token;
    }
    
    public function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([$this, 'sanitizeInput'], $input);
        }
        
        // Remover tags HTML e scripts
        $input = strip_tags($input);
        
        // Escapar caracteres especiais
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        // Remover caracteres de controle
        $input = preg_replace('/[\x00-\x1F\x7F]/', '', $input);
        
        return trim($input);
    }
    
    public function validateSQLInjection($input) {
        $dangerous_patterns = [
            '/union\s+select/i',
            '/drop\s+table/i',
            '/delete\s+from/i',
            '/insert\s+into/i',
            '/update\s+set/i',
            '/exec\s*\(/i',
            '/script\s*>/i'
        ];
        
        foreach ($dangerous_patterns as $pattern) {
            if (preg_match($pattern, $input)) {
                return false;
            }
        }
        
        return true;
    }
}
