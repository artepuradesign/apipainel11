<?php
// src/routes/base_telefone.php - Rotas para administração de base_telefone

require_once __DIR__ . '/../controllers/BaseTelefoneController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseTelefoneController = new BaseTelefoneController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-telefone\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-telefone/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseTelefoneController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-telefone') !== false && !preg_match('/\/base-telefone\/\d+/', $path)) {
            // POST /base-telefone
            $baseTelefoneController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-telefone\/(\d+)$/', $path, $matches)) {
            // PUT /base-telefone/{id}
            $_GET['id'] = $matches[1];
            $baseTelefoneController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-telefone\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-telefone/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseTelefoneController->deleteByCpfId();
        } elseif (preg_match('/\/base-telefone\/(\d+)$/', $path, $matches)) {
            // DELETE /base-telefone/{id}
            $_GET['id'] = $matches[1];
            $baseTelefoneController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}