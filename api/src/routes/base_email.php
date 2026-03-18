<?php
// src/routes/base_email.php - Rotas para administração de base_email

require_once __DIR__ . '/../controllers/BaseEmailController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseEmailController = new BaseEmailController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-email\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-email/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseEmailController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-email') !== false && !preg_match('/\/base-email\/\d+/', $path)) {
            // POST /base-email
            $baseEmailController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-email\/(\d+)$/', $path, $matches)) {
            // PUT /base-email/{id}
            $_GET['id'] = $matches[1];
            $baseEmailController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-email\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-email/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseEmailController->deleteByCpfId();
        } elseif (preg_match('/\/base-email\/(\d+)$/', $path, $matches)) {
            // DELETE /base-email/{id}
            $_GET['id'] = $matches[1];
            $baseEmailController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}