<?php
// src/routes/base_cnh.php - Rotas para administração de base_cnh

require_once __DIR__ . '/../controllers/BaseCnhController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseCnhController = new BaseCnhController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-cnh\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-cnh/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseCnhController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-cnh') !== false && !preg_match('/\/base-cnh\/\d+/', $path)) {
            // POST /base-cnh
            $baseCnhController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-cnh\/(\d+)$/', $path, $matches)) {
            // PUT /base-cnh/{id}
            $_GET['id'] = $matches[1];
            $baseCnhController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-cnh\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-cnh/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseCnhController->deleteByCpfId();
        } elseif (preg_match('/\/base-cnh\/(\d+)$/', $path, $matches)) {
            // DELETE /base-cnh/{id}
            $_GET['id'] = $matches[1];
            $baseCnhController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}