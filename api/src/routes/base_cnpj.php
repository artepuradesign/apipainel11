<?php
// src/routes/base_cnpj.php - Rotas para gerenciamento de CNPJs

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/BaseCnpjController.php';
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

$baseCnpjController = new BaseCnpjController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/base-cnpj/all') !== false) {
            $baseCnpjController->getAll();
        } elseif (strpos($path, '/base-cnpj/by-cnpj') !== false) {
            $baseCnpjController->getByCnpj();
        } elseif (preg_match('/\/base-cnpj\/\d+$/', $path)) {
            $baseCnpjController->getById();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-cnpj/create') !== false || strpos($path, '/base-cnpj') !== false) {
            $baseCnpjController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-cnpj\/\d+$/', $path)) {
            $baseCnpjController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-cnpj\/\d+$/', $path)) {
            $baseCnpjController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
