<?php
// src/routes/login_hotmail.php - Rotas para Login Hotmail (módulo 162)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/LoginHotmailController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new LoginHotmailController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/login-hotmail/minhas-compras') !== false) {
            $controller->minhasCompras();
        } elseif (strpos($path, '/login-hotmail/provedores') !== false) {
            $controller->listProvedores();
        } elseif (strpos($path, '/login-hotmail/logins') !== false || $path === '/login-hotmail') {
            $controller->listLogins();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/login-hotmail/comprar') !== false) {
            $controller->comprar();
        } elseif (strpos($path, '/login-hotmail/criar') !== false) {
            $controller->criar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (strpos($path, '/login-hotmail/atualizar') !== false) {
            $controller->atualizar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (strpos($path, '/login-hotmail/excluir') !== false) {
            $controller->excluir();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
