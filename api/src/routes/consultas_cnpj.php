<?php
// src/routes/consultas_cnpj.php - Rotas para histórico de consultas CNPJ

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/ConsultasCnpjController.php';
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

$consultasCnpjController = new ConsultasCnpjController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/consultas-cnpj/all') !== false) {
            $consultasCnpjController->getAll();
        } elseif (strpos($path, '/consultas-cnpj/stats') !== false) {
            $consultasCnpjController->getStats();
        } elseif (strpos($path, '/consultas-cnpj/by-user') !== false) {
            $consultasCnpjController->getByUserId();
        } elseif (preg_match('/\/consultas-cnpj\/\d+$/', $path)) {
            $consultasCnpjController->getById();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/consultas-cnpj/create') !== false || strpos($path, '/consultas-cnpj') !== false) {
            $consultasCnpjController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
