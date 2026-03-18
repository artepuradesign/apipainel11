<?php
// src/routes/historico.php - Rotas para histórico completo do usuário

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/HistoricoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("HISTORICO: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$historicoController = new HistoricoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/historico/completo') !== false) {
            $historicoController->getHistoricoCompleto();
        } elseif (strpos($path, '/historico/estatisticas') !== false) {
            $historicoController->getEstatisticas();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}