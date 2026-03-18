<?php
// src/routes/base_endereco.php - Rotas para administração de base_endereco

require_once __DIR__ . '/../controllers/BaseEnderecoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseEnderecoController = new BaseEnderecoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-endereco\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-endereco/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseEnderecoController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-endereco') !== false && !preg_match('/\/base-endereco\/\d+/', $path)) {
            // POST /base-endereco
            $baseEnderecoController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-endereco\/(\d+)$/', $path, $matches)) {
            // PUT /base-endereco/{id}
            $_GET['id'] = $matches[1];
            $baseEnderecoController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-endereco\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-endereco/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseEnderecoController->deleteByCpfId();
        } elseif (preg_match('/\/base-endereco\/(\d+)$/', $path, $matches)) {
            // DELETE /base-endereco/{id}
            $_GET['id'] = $matches[1];
            $baseEnderecoController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}