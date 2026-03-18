
<?php
// middleware/CorsMiddleware.php - Middleware para CORS

class CorsMiddleware {
    public function handle() {
        // Obter origem da requisição
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        // Permitir todas as origens do Lovable e desenvolvimento
        if (strpos($origin, 'lovable') !== false || 
            strpos($origin, 'localhost') !== false ||
            strpos($origin, '127.0.0.1') !== false ||
            empty($origin)) {
            
            if (!empty($origin)) {
                header("Access-Control-Allow-Origin: $origin");
            } else {
                header("Access-Control-Allow-Origin: *");
            }
        } else {
            header("Access-Control-Allow-Origin: *");
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key, X-CSRF-Token');
        header('Access-Control-Allow-Credentials: false');
        header('Access-Control-Max-Age: 86400');
        header('Content-Type: application/json; charset=UTF-8');
        
        // Log CORS para debug
        error_log("CORS: Origin: " . $origin);
        
        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }
    }
}
