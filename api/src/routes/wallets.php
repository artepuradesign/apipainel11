
<?php
// src/routes/wallets.php

require_once __DIR__ . '/../controllers/WalletsController.php';
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

$walletsController = new WalletsController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("WALLETS_ROUTE: Método {$method}, Path: {$path}");

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

// Roteamento
switch ($method) {
    case 'GET':
        if (preg_match('/\/wallets\/user\/(\d+)$/', $path, $matches)) {
            $walletsController->getByUser($matches[1]);
        } elseif (preg_match('/\/wallets\/user\/(\d+)\/balance$/', $path, $matches)) {
            $walletsController->getTotalBalance($matches[1]);
        } elseif (preg_match('/\/wallets\/(\d+)$/', $path, $matches)) {
            $walletsController->getById($matches[1]);
        } elseif ($path === '/wallets' || strpos($path, '/wallets') === 0) {
            $walletsController->getAll();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/wallets/transaction') !== false) {
            $walletsController->createTransaction();
        } elseif ($path === '/wallets' || strpos($path, '/wallets/create') !== false) {
            $walletsController->create();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/wallets\/(\d+)$/', $path, $matches)) {
            $walletsController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
