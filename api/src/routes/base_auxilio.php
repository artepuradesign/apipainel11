<?php
// src/routes/base_auxilio.php - Rotas para administração de base_auxilio

require_once __DIR__ . '/../controllers/BaseAuxilioController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseAuxilioController = new BaseAuxilioController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-auxilio\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // GET /base-auxilio/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseAuxilioController->getByCpfId();
        } elseif (strpos($path, '/base-auxilio') !== false && isset($_GET['cpf_id'])) {
            // GET /base-auxilio?cpf_id={cpf_id}
            $baseAuxilioController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-auxilio') !== false && !preg_match('/\/base-auxilio\/\d+/', $path)) {
            // POST /base-auxilio
            $baseAuxilioController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-auxilio\/(\d+)$/', $path, $matches)) {
            // PUT /base-auxilio/{id}
            $_GET['id'] = $matches[1];
            $baseAuxilioController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-auxilio\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // DELETE /base-auxilio/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseAuxilioController->deleteByCpfId();
        } elseif (preg_match('/\/base-auxilio\/(\d+)$/', $path, $matches)) {
            // DELETE /base-auxilio/{id}
            $_GET['id'] = $matches[1];
            $baseAuxilioController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
