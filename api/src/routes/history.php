
<?php
// src/routes/history.php - Rotas para histórico de transações

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/HistoryController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("HISTORY: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$historyController = new HistoryController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/history/transactions') !== false) {
            $historyController->getTransactions();
        } elseif (strpos($path, '/history/referrals') !== false) {
            $historyController->getReferralEarnings();
        } elseif (strpos($path, '/history/consultations') !== false) {
            $historyController->getConsultations();
        } elseif (strpos($path, '/history/all') !== false) {
            $historyController->getAllHistory();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (strpos($path, '/history/transactions/clear') !== false) {
            $historyController->clearTransactions();
        } elseif (strpos($path, '/history/referrals/clear') !== false) {
            $historyController->clearReferrals();
        } elseif (strpos($path, '/history/consultations/clear') !== false) {
            $historyController->clearConsultations();
        } elseif (strpos($path, '/history/clear-all') !== false) {
            $historyController->clearAllHistory();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
