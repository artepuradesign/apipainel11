<?php
// src/routes/base_rg.php - Rotas para administração de base_rg

require_once __DIR__ . '/../controllers/BaseRgController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseRgController = new BaseRgController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-rg\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-rg/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseRgController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-rg') !== false && !preg_match('/\/base-rg\/\d+/', $path)) {
            // POST /base-rg
            $baseRgController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-rg\/(\d+)$/', $path, $matches)) {
            // PUT /base-rg/{id}
            $_GET['id'] = $matches[1];
            $baseRgController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-rg\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-rg/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseRgController->deleteByCpfId();
        } elseif (preg_match('/\/base-rg\/(\d+)$/', $path, $matches)) {
            // DELETE /base-rg/{id}
            $_GET['id'] = $matches[1];
            $baseRgController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}