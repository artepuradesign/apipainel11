
<?php
// src/middleware/ApiKeyMiddleware.php

require_once __DIR__ . '/../../config/conexao.php';

class ApiKeyMiddleware {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function validateGlobalApiKey() {
        $headers = getallheaders();
        $apiKey = null;
        
        // Verificar Authorization header (Bearer token)
        if (isset($headers['Authorization'])) {
            $auth = $headers['Authorization'];
            if (strpos($auth, 'Bearer ') === 0) {
                $apiKey = substr($auth, 7);
            }
        }
        
        // Verificar X-API-Key header
        if (!$apiKey && isset($headers['X-API-Key'])) {
            $apiKey = $headers['X-API-Key'];
        }
        
        // Verificar query parameter
        if (!$apiKey && isset($_GET['api_key'])) {
            $apiKey = $_GET['api_key'];
        }
        
        if (!$apiKey) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'message' => 'API Key é obrigatória',
                'error_code' => 'MISSING_API_KEY'
            ], JSON_UNESCAPED_UNICODE);
            return false;
        }
        
        // Verificar se é a API Key global do conexao.php
        $globalApiKey = API_KEY;
        if ($apiKey === $globalApiKey) {
            return true;
        }
        
        // Se chegou até aqui, a API Key é inválida
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'API Key inválida',
            'error_code' => 'INVALID_API_KEY'
        ], JSON_UNESCAPED_UNICODE);
        return false;
    }
    
    public function handle() {
        return $this->validateGlobalApiKey();
    }
}
?>
