
<?php
// src/routes/users.php

require_once __DIR__ . '/../controllers/UsersController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Tratar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Responder OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$usersController = new UsersController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("USERS_ROUTE: Método {$method}, Path: {$path}");

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

// Roteamento
switch ($method) {
    case 'GET':
        if (preg_match('/\/users\/(\d+)\/profile$/', $path, $matches)) {
            $usersController->getProfile($matches[1]);
        } elseif (preg_match('/\/users\/(\d+)\/wallets$/', $path, $matches)) {
            $usersController->getUserWallets($matches[1]);
        } elseif (preg_match('/\/users\/(\d+)$/', $path, $matches)) {
            $usersController->getById($matches[1]);
        } elseif ($path === '/users' || strpos($path, '/users') === 0) {
            $usersController->getAll();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/users\/(\d+)\/profile$/', $path, $matches)) {
            $usersController->updateProfile($matches[1]);
        } elseif (preg_match('/\/users\/(\d+)$/', $path, $matches)) {
            $usersController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
