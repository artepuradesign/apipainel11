<?php
// src/routes/base_tim.php - Rotas para administração de base_tim

require_once __DIR__ . '/../controllers/BaseTimController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseTimController = new BaseTimController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-tim\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // GET /base-tim/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseTimController->getByCpfId();
        } elseif (strpos($path, '/base-tim') !== false && isset($_GET['cpf_id'])) {
            // GET /base-tim?cpf_id={cpf_id}
            $baseTimController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-tim') !== false && !preg_match('/\/base-tim\/\d+/', $path)) {
            // POST /base-tim
            $baseTimController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-tim\/(\d+)$/', $path, $matches)) {
            // PUT /base-tim/{id}
            $_GET['id'] = $matches[1];
            $baseTimController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-tim\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // DELETE /base-tim/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseTimController->deleteByCpfId();
        } elseif (preg_match('/\/base-tim\/(\d+)$/', $path, $matches)) {
            // DELETE /base-tim/{id}
            $_GET['id'] = $matches[1];
            $baseTimController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
