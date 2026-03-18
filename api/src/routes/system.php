<?php
// src/routes/system.php

require_once __DIR__ . '/../controllers/SystemController.php';
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

// Garantir que $db está disponível
if (!isset($db)) {
    Response::error('Erro de configuração do banco de dados', 500);
    exit;
}

// Verificar autenticação para endpoints que precisam
$authRequired = true;
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);

// Alguns endpoints do sistema podem não precisar de auth
if (strpos($path, '/system/referral-config') !== false) {
    // Este endpoint precisa de auth para buscar configurações específicas do usuário
    $authRequired = true;
}

if ($authRequired) {
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        exit; // Middleware já enviou a resposta de erro
    }
}

$systemController = new SystemController($db);
$method = $_SERVER['REQUEST_METHOD'];

error_log("SYSTEM_ROUTE: Método {$method}, Path: {$path}");

// Roteamento
switch ($method) {
    case 'GET':
        if (strpos($path, '/system/referral-config') !== false) {
            $systemController->getReferralConfig();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}