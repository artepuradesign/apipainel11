<?php
/**
 * Middleware para configurar CORS
 * Permite requisições do frontend Lovable
 */

class CorsMiddleware {
    public static function handle() {
        // Permitir origens específicas ou todas (*)
        $allowedOrigins = [
            'https://b01f7d44-900a-4278-be98-21844e70d303.lovableproject.com',
            'http://localhost:8080',
            'http://localhost:5173',
        ];

        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        
        $isAllowedOrigin = in_array($origin, $allowedOrigins);
        if ($isAllowedOrigin) {
            header("Access-Control-Allow-Origin: $origin");
        } else {
            // Importante: NÃO envie Allow-Credentials com Origin '*'
            header("Access-Control-Allow-Origin: *");
        }
        
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
        // Incluir X-API-KEY/x-api-key (o frontend envia esse header em algumas rotas)
        header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Idempotency-Key, X-API-Key, X-Api-Key, x-api-key");
        if ($isAllowedOrigin) {
            header("Access-Control-Allow-Credentials: true");
        }
        header("Access-Control-Max-Age: 3600");

        // Responder a requisições OPTIONS (preflight)
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
