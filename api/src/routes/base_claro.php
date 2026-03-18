<?php
// src/routes/base_claro.php - Rotas para administração de base_claro

require_once __DIR__ . '/../controllers/BaseClaroController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseClaroController = new BaseClaroController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-claro\/cpf\/([^\/]+)$/', $path, $matches)) {
            // GET /base-claro/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseClaroController->getByCpfId();
        } elseif (preg_match('/\/base-claro\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // GET /base-claro/cpf-id/{cpf_id} (compatibilidade)
            $_GET['cpf_id'] = $matches[1];
            $baseClaroController->getByCpfId();
        } elseif (strpos($path, '/base-claro') !== false && isset($_GET['cpf_id'])) {
            // GET /base-claro?cpf_id={cpf_id}
            $baseClaroController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-claro') !== false && !preg_match('/\/base-claro\/\d+/', $path)) {
            // POST /base-claro
            $baseClaroController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-claro\/(\d+)$/', $path, $matches)) {
            // PUT /base-claro/{id}
            $_GET['id'] = $matches[1];
            $baseClaroController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-claro\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // DELETE /base-claro/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseClaroController->deleteByCpfId();
        } elseif (preg_match('/\/base-claro\/(\d+)$/', $path, $matches)) {
            // DELETE /base-claro/{id}
            $_GET['id'] = $matches[1];
            $baseClaroController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
