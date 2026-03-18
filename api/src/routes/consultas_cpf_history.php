<?php
// src/routes/consultas_cpf_history.php - Rotas para histórico de consultas CPF

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/ConsultasCpfHistoryController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Obter conexão do pool
$db = getDBConnection();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$historyController = new ConsultasCpfHistoryController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/consultas-cpf-history/stats') !== false) {
            $historyController->getStats();
        } elseif (strpos($path, '/consultas-cpf-history') !== false) {
            $historyController->getHistory();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}