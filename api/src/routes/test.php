
<?php
// src/routes/test.php - Rotas para teste da API

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/ApiKeyMiddleware.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($method === 'GET' && strpos($path, '/test/api-key') !== false) {
    // Teste de validação de API Key
    $apiKeyMiddleware = new ApiKeyMiddleware($db);
    
    if ($apiKeyMiddleware->validateGlobalApiKey()) {
        Response::success([
            'api_key_valid' => true,
            'message' => 'API Key válida e funcionando',
            'timestamp' => date('Y-m-d H:i:s'),
            'request_method' => $method,
            'request_path' => $path
        ], 'Teste de API Key realizado com sucesso');
    }
    
} elseif ($method === 'GET' && strpos($path, '/test/connection') !== false) {
    // Teste básico de conexão
    Response::success([
        'connection' => 'OK',
        'database' => $db ? 'Connected' : 'Not Connected',
        'php_version' => PHP_VERSION,
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => [
            'software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'host' => $_SERVER['HTTP_HOST'] ?? 'localhost'
        ]
    ], 'Teste de conexão realizado com sucesso');
    
} else {
    Response::error('Endpoint de teste não encontrado', 404);
}
