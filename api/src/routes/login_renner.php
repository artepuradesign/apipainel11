<?php
// src/routes/login_renner.php - Rotas para Login Renner (módulo 164)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/LoginRennerController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new LoginRennerController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/login-renner/minhas-compras') !== false) {
            $controller->minhasCompras();
        } elseif (strpos($path, '/login-renner/provedores') !== false) {
            $controller->listProvedores();
        } elseif (strpos($path, '/login-renner/logins') !== false || $path === '/login-renner') {
            $controller->listLogins();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/login-renner/comprar') !== false) {
            $controller->comprar();
        } elseif (strpos($path, '/login-renner/criar') !== false) {
            $controller->criar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (strpos($path, '/login-renner/atualizar') !== false) {
            $controller->atualizar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (strpos($path, '/login-renner/excluir') !== false) {
            $controller->excluir();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
