<?php
// src/routes/base_foto.php - Rotas para administração de base_foto

require_once __DIR__ . '/../controllers/BaseFotoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseFotoController = new BaseFotoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/base-foto/by-cpf-id') !== false) {
            $baseFotoController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-foto/create') !== false || (strpos($path, '/base-foto') !== false && !strpos($path, '/base-foto/'))) {
            $baseFotoController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-foto\/(\d+)$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $baseFotoController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-foto\/(\d+)$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $baseFotoController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
