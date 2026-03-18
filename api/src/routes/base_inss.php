<?php
// src/routes/base_inss.php - Rotas para administração de base_inss

require_once __DIR__ . '/../controllers/BaseInssController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseInssController = new BaseInssController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-inss\/cpf\/([^\/]+)$/', $path, $matches)) {
            // GET /base-inss/cpf/{cpf}
            $_GET['cpf'] = $matches[1];
            $baseInssController->getByCpf();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-inss') !== false && !preg_match('/\/base-inss\/\d+/', $path)) {
            // POST /base-inss
            $baseInssController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-inss\/(\d+)$/', $path, $matches)) {
            // PUT /base-inss/{id}
            $_GET['id'] = $matches[1];
            $baseInssController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-inss\/cpf\/([^\/]+)$/', $path, $matches)) {
            // DELETE /base-inss/cpf/{cpf}
            $_GET['cpf'] = $matches[1];
            $baseInssController->deleteByCpf();
        } elseif (preg_match('/\/base-inss\/(\d+)$/', $path, $matches)) {
            // DELETE /base-inss/{id}
            $_GET['id'] = $matches[1];
            $baseInssController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}