
<?php
// src/routes/wallet.php - Rotas para carteira

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/WalletController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("WALLET: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Debug: log da requisição antes da autenticação
error_log("WALLET_ROUTE: Request recebida - Method: " . $method . ", Path: " . $path);

// Endpoint de teste sem autenticação
if (strpos($path, '/wallet/test') !== false && $method === 'GET') {
    Response::success([
        'message' => 'Wallet API funcionando',
        'timestamp' => date('Y-m-d H:i:s'),
        'method' => $method,
        'path' => $path,
        'authenticated' => false
    ], 'Teste de conectividade OK');
    exit;
}

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    error_log("WALLET_ROUTE: Falha na autenticação");
    exit;
}

error_log("WALLET_ROUTE: Autenticação OK, prosseguindo...");

$walletController = new WalletController($db);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

switch ($method) {
    case 'GET':
        if (strpos($path, '/wallet/balance') !== false) {
            $walletController->getUserBalance();
        } elseif (strpos($path, '/wallet/profile') !== false) {
            $walletController->getUserProfile();
        } elseif (strpos($path, '/wallet/transactions') !== false) {
            $walletController->getTransactionHistory();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/wallet/add-balance') !== false) {
            $walletController->addBalance();
        } elseif (strpos($path, '/wallet/purchase-plan') !== false) {
            $walletController->purchasePlan();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
