
<?php
// routes/auth.php

// CORS Headers - DEVE SER A PRIMEIRA COISA
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

// Carregar configurações centralizadas
require_once __DIR__ . '/../config/conexao.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/controllers/AuthController.php';

// Error reporting usando constantes
error_reporting(E_ALL);
ini_set('display_errors', APP_DEBUG ? 1 : 0);
ini_set('log_errors', 1);

// Log da requisição
error_log("AUTH REQUEST: " . $_SERVER['REQUEST_METHOD'] . " " . $_SERVER['REQUEST_URI']);

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixo /api se existir
$path = str_replace('/api', '', $path);

error_log("AUTH PROCESSED PATH: " . $path);

$db = null;

try {
    // Conectar ao banco usando conexao.php
    $db = getDBConnection();
    
    if (!$db) {
        error_log("AUTH ERROR: Falha na conexão com banco de dados");
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro de conexão com banco de dados'
        ]);
        exit();
    }

    // Roteamento
    if ($method === 'POST' && strpos($path, '/auth/login') !== false) {
        error_log("AUTH: Processando login");
        $authController = new AuthController($db);
        $authController->login();

    } elseif ($method === 'POST' && strpos($path, '/auth/register') !== false) {
        error_log("AUTH: Processando register");
        $authController = new AuthController($db);
        $authController->register();

    } elseif ($method === 'POST' && strpos($path, '/auth/logout') !== false) {
        error_log("AUTH: Processando logout");
        $authController = new AuthController($db);
        $authController->logout();

    } elseif ($method === 'GET' && strpos($path, '/auth/me') !== false) {
        error_log("AUTH: Processando get current user");
        $authController = new AuthController($db);
        $authController->getCurrentUser();

    } elseif ($method === 'POST' && strpos($path, '/auth/validate-referral') !== false) {
        error_log("AUTH: Processando validação de referral");
        $authController = new AuthController($db);
        $authController->validateReferralCode();

    } elseif ($method === 'POST' && strpos($path, '/auth/validate-token') !== false) {
        error_log("AUTH: Processando validação de token");
        $authController = new AuthController($db);
        $authController->validateToken();

    } elseif ($method === 'POST' && strpos($path, '/auth/forgot-password') !== false) {
        error_log("AUTH: Processando recuperação de senha");
        $authController = new AuthController($db);
        $authController->forgotPassword();

    } elseif ($method === 'POST' && strpos($path, '/auth/reset-password') !== false) {
        error_log("AUTH: Processando redefinição de senha");
        $authController = new AuthController($db);
        $authController->resetPassword();

    } else {
        error_log("AUTH ERROR: Endpoint não encontrado - " . $path);
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Endpoint de autenticação não encontrado: ' . $path
        ]);
    }

} catch (Exception $e) {
    error_log("AUTH EXCEPTION: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'debug' => APP_DEBUG ? $e->getMessage() : 'Debug desabilitado'
    ]);
} finally {
    // Fechar conexão com banco
    $db = null;
    $database = null;
    error_log("AUTH: Conexão com banco fechada");
}
?>
