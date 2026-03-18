<?php
// src/routes/central_cash.php

require_once __DIR__ . '/../controllers/CentralCashController.php';
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

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit; // Middleware já enviou a resposta de erro
}

// Verificar se é usuário de suporte/admin
$userId = AuthMiddleware::getCurrentUserId();
$userQuery = "SELECT user_role FROM users WHERE id = ?";
$userStmt = $db->prepare($userQuery);
$userStmt->execute([$userId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !in_array($user['user_role'], ['suporte', 'admin'])) {
    Response::error('Acesso negado - permissão insuficiente', 403);
    exit;
}

$centralCashController = new CentralCashController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("CENTRAL_CASH_ROUTE: Método {$method}, Path: {$path}");

// Roteamento
switch ($method) {
    case 'GET':
        if (strpos($path, '/central-cash/stats') !== false) {
            $centralCashController->getStats();
        } elseif (strpos($path, '/central-cash/transactions') !== false) {
            $centralCashController->getRecentTransactions();
        } elseif (strpos($path, '/central-cash/balance') !== false) {
            $centralCashController->getCurrentBalance();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/central-cash/transaction') !== false) {
            $centralCashController->addTransaction();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}