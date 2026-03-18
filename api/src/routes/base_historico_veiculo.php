<?php
// src/routes/base_historico_veiculo.php - Rotas para administração de base_historico_veiculo

require_once __DIR__ . '/../controllers/BaseHistoricoVeiculoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new BaseHistoricoVeiculoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

error_log("🚗 [ROUTE] base_historico_veiculo.php - Method: {$method}, Path: {$path}");

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-historico-veiculo\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-historico-veiculo/cpf/{cpf_id}
            error_log("🚗 [ROUTE] Match: /cpf/{cpf_id} - cpf_id: " . $matches[1]);
            $_GET['cpf_id'] = $matches[1];
            $controller->getByCpfId();
        } elseif (isset($_GET['cpf_id'])) {
            // GET /base-historico-veiculo?cpf_id={cpf_id}
            error_log("🚗 [ROUTE] Query string cpf_id: " . $_GET['cpf_id']);
            $controller->getByCpfId();
        } else {
            error_log("🚗 [ROUTE] Nenhum match encontrado");
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-historico-veiculo') !== false && !preg_match('/\/base-historico-veiculo\/\d+/', $path)) {
            // POST /base-historico-veiculo
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-historico-veiculo\/(\d+)$/', $path, $matches)) {
            // PUT /base-historico-veiculo/{id}
            $_GET['id'] = $matches[1];
            $controller->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-historico-veiculo\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-historico-veiculo/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $controller->deleteByCpfId();
        } elseif (preg_match('/\/base-historico-veiculo\/(\d+)$/', $path, $matches)) {
            // DELETE /base-historico-veiculo/{id}
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
