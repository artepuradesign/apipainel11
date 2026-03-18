<?php
// src/routes/base_vivo.php - Rotas para administração de base_vivo

require_once __DIR__ . '/../controllers/BaseVivoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseVivoController = new BaseVivoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-vivo\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // GET /base-vivo/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseVivoController->getByCpfId();
        } elseif (strpos($path, '/base-vivo') !== false && isset($_GET['cpf_id'])) {
            // GET /base-vivo?cpf_id={cpf_id}
            $baseVivoController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-vivo') !== false && !preg_match('/\/base-vivo\/\d+/', $path)) {
            // POST /base-vivo
            $baseVivoController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-vivo\/(\d+)$/', $path, $matches)) {
            // PUT /base-vivo/{id}
            $_GET['id'] = $matches[1];
            $baseVivoController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-vivo\/cpf-id\/([^\/]+)$/', $path, $matches)) {
            // DELETE /base-vivo/cpf-id/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseVivoController->deleteByCpfId();
        } elseif (preg_match('/\/base-vivo\/(\d+)$/', $path, $matches)) {
            // DELETE /base-vivo/{id}
            $_GET['id'] = $matches[1];
            $baseVivoController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
