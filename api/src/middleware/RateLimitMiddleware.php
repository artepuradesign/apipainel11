
<?php
// src/middleware/RateLimitMiddleware.php

require_once __DIR__ . '/../models/RateLimit.php';

class RateLimitMiddleware {
    private $db;
    private $rateLimit;
    
    public function __construct($db) {
        $this->db = $db;
        $this->rateLimit = new RateLimit($db);
    }
    
    public function handle($maxRequests = 60, $windowMinutes = 1) {
        $identifier = $this->getIdentifier();
        $endpoint = $this->getEndpoint();
        
        // Verificar rate limit
        if (!$this->rateLimit->checkRateLimit($identifier, $endpoint, $maxRequests, $windowMinutes)) {
            $this->sendRateLimitResponse($maxRequests, $windowMinutes);
            return false;
        }
        
        // Adicionar headers informativos
        $remaining = $this->rateLimit->getRemainingRequests($identifier, $endpoint, $maxRequests);
        header('X-RateLimit-Limit: ' . $maxRequests);
        header('X-RateLimit-Remaining: ' . $remaining);
        header('X-RateLimit-Reset: ' . (time() + ($windowMinutes * 60)));
        
        return true;
    }
    
    private function getIdentifier() {
        // Usar IP + User-Agent como identificador
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
        
        // Se usuário autenticado, usar ID do usuário
        if (isset($_SESSION['user_id'])) {
            return 'user_' . $_SESSION['user_id'];
        }
        
        return 'ip_' . md5($ip . $userAgent);
    }
    
    private function getEndpoint() {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        
        // Remover query parameters para agrupar endpoints similares
        $endpoint = strtok($uri, '?');
        
        return $method . ':' . $endpoint;
    }
    
    private function sendRateLimitResponse($maxRequests, $windowMinutes) {
        http_response_code(429);
        header('Content-Type: application/json');
        header('Retry-After: ' . ($windowMinutes * 60));
        
        echo json_encode([
            'success' => false,
            'message' => 'Rate limit exceeded',
            'error_code' => 'RATE_LIMIT_EXCEEDED',
            'details' => [
                'max_requests' => $maxRequests,
                'window_minutes' => $windowMinutes,
                'retry_after' => $windowMinutes * 60
            ]
        ]);
        exit;
    }
}
