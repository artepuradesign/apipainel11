<?php
// src/routes/base_vacina.php - Rotas para administração de base_vacina

require_once __DIR__ . '/../controllers/BaseVacinaController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseVacinaController = new BaseVacinaController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-vacina\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-vacina/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseVacinaController->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-vacina') !== false && !preg_match('/\/base-vacina\/\d+/', $path)) {
            // POST /base-vacina
            $baseVacinaController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-vacina\/(\d+)$/', $path, $matches)) {
            // PUT /base-vacina/{id}
            $_GET['id'] = $matches[1];
            $baseVacinaController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-vacina\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-vacina/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $baseVacinaController->deleteByCpfId();
        } elseif (preg_match('/\/base-vacina\/(\d+)$/', $path, $matches)) {
            // DELETE /base-vacina/{id}
            $_GET['id'] = $matches[1];
            $baseVacinaController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}