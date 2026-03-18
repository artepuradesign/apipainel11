
<?php
// health.php - Endpoint de verificação de saúde da API

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config/conexao.php';

try {
    $response = [
        'success' => true,
        'message' => 'API está funcionando corretamente!',
        'timestamp' => date('Y-m-d H:i:s'),
        'server_info' => [
            'php_version' => PHP_VERSION,
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'request_method' => $_SERVER['REQUEST_METHOD'],
            'request_uri' => $_SERVER['REQUEST_URI'] ?? '/',
            'http_host' => $_SERVER['HTTP_HOST'] ?? 'localhost',
            'memory_usage' => memory_get_usage(true),
            'memory_peak' => memory_get_peak_usage(true)
        ],
        'environment' => [
            'app_env' => APP_ENV,
            'debug_mode' => APP_DEBUG,
            'timezone' => date_default_timezone_get()
        ],
        'status' => 'healthy'
    ];
    
    // Testar conexão com banco de dados reutilizando o pool
    try {
        $db = getDBConnection();
        $dbConnected = false;
        
        if ($db) {
            try {
                // Ping simples sem abrir nova conexão
                $db->query('SELECT 1');
                $dbConnected = true;
            } catch (Exception $pingError) {
                $dbConnected = false;
            }
        }
        
        $response['database'] = [
            'status' => $dbConnected ? 'connected' : 'disconnected',
            'host' => DB_HOST,
            'database' => DB_NAME
        ];
        
    } catch (Exception $dbError) {
        $response['database'] = [
            'status' => 'error',
            'message' => $dbError->getMessage()
        ];
    }
    
    http_response_code(200);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor: ' . $e->getMessage(),
        'status' => 'error',
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
}
