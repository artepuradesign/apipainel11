<?php
// src/routes/login_gmail.php - Rotas para Login Gmail (módulo 163)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/LoginGmailController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new LoginGmailController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/login-gmail/minhas-compras') !== false) {
            $controller->minhasCompras();
        } elseif (strpos($path, '/login-gmail/provedores') !== false) {
            $controller->listProvedores();
        } elseif (strpos($path, '/login-gmail/logins') !== false || $path === '/login-gmail') {
            $controller->listLogins();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/login-gmail/comprar') !== false) {
            $controller->comprar();
        } elseif (strpos($path, '/login-gmail/criar') !== false) {
            $controller->criar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (strpos($path, '/login-gmail/atualizar') !== false) {
            $controller->atualizar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (strpos($path, '/login-gmail/excluir') !== false) {
            $controller->excluir();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
