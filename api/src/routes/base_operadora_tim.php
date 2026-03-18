<?php
// src/routes/base_operadora_tim.php - Rotas para administração de base_operadora_tim

require_once __DIR__ . '/../controllers/BaseOperadoraTimController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new BaseOperadoraTimController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-operadora-tim\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-operadora-tim/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $controller->getByCpfId();
        } elseif (strpos($path, '/base-operadora-tim') !== false && isset($_GET['cpf_id'])) {
            // GET /base-operadora-tim?cpf_id={cpf_id}
            $controller->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/base-operadora-tim') !== false && !preg_match('/\/base-operadora-tim\/\d+/', $path)) {
            // POST /base-operadora-tim
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (preg_match('/\/base-operadora-tim\/(\d+)$/', $path, $matches)) {
            // PUT /base-operadora-tim/{id}
            $_GET['id'] = $matches[1];
            $controller->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('/\/base-operadora-tim\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-operadora-tim/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $controller->deleteByCpfId();
        } elseif (preg_match('/\/base-operadora-tim\/(\d+)$/', $path, $matches)) {
            // DELETE /base-operadora-tim/{id}
            $_GET['id'] = $matches[1];
            $controller->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
