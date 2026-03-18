
<?php
// routes/users.php

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Carregar configurações centralizadas PRIMEIRO
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/controllers/UserController.php';

// Error reporting
$debug = APP_DEBUG;
error_reporting(E_ALL);
ini_set('display_errors', $debug ? 1 : 0);
ini_set('log_errors', 1);

error_log("USERS REQUEST: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$db = null;
$database = null;

try {
    $db = getDBConnection();
    
    if (!$db) {
        error_log("USERS ERROR: Database connection failed");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro de conexão com banco de dados'
        ]);
        exit();
    }

    $userController = new UserController($db);

    switch ($method) {
        case 'GET':
            if (strpos($path, '/users/profile') !== false) {
                $userController->getProfile();
            } elseif (strpos($path, '/users/balance') !== false) {
                $userController->getBalance();
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        case 'PUT':
            if (strpos($path, '/users/profile') !== false) {
                $userController->updateProfile();
            } elseif (strpos($path, '/users/balance') !== false) {
                $userController->updateBalance();
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método não permitido'
            ]);
            break;
    }

} catch (Exception $e) {
    error_log("USERS EXCEPTION: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'debug' => $debug ? $e->getMessage() : 'Debug desabilitado'
    ]);
} finally {
    // Fechar conexão com banco
    $db = null;
    $database = null;
    error_log("USERS: Conexão com banco fechada");
}
?>
