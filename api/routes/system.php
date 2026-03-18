
<?php
// routes/system.php - Rotas do sistema

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Carregar configurações centralizadas PRIMEIRO
require_once '../config/conexao.php';
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    if ($method === 'GET' && strpos($path, '/system/status') !== false) {
        // Status do sistema
        try {
            $db = getDBConnection();
            $dbStatus = true;
        } catch (Exception $e) {
            $dbStatus = false;
        }
        
        $response = [
            'success' => true,
            'message' => 'Sistema funcionando normalmente',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0',
            'environment' => APP_ENV,
            'database_status' => $dbStatus ? 'connected' : 'disconnected',
            'server_info' => [
                'php_version' => PHP_VERSION,
                'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time')
            ]
        ];
        
        http_response_code(200);
        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
    } elseif ($method === 'GET' && strpos($path, '/system/health') !== false) {
        // Health check básico
        $response = [
            'success' => true,
            'message' => 'API está funcionando corretamente!',
            'timestamp' => date('Y-m-d H:i:s'),
            'status' => 'healthy'
        ];
        
        http_response_code(200);
        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint do sistema não encontrado'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    error_log("System route error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'error' => APP_DEBUG ? $e->getMessage() : 'Debug desabilitado'
    ], JSON_UNESCAPED_UNICODE);
}
