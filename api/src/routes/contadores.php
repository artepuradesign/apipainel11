<?php
// src/routes/contadores.php

require_once __DIR__ . '/../controllers/PageVisitController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Tratar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($db)) {
    Response::error('Erro de configuração do banco de dados', 500);
    exit;
}

$controller = new PageVisitController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);

error_log("CONTADORES_ROUTE: Método {$method}, Path: {$path}");

// POST /contadores/register - público (não requer auth)
if ($method === 'POST' && strpos($path, '/contadores/register') !== false) {
    $controller->register();
    exit;
}

// Rotas admin - requerem autenticação de suporte/admin
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$userId = AuthMiddleware::getCurrentUserId();
$userQuery = "SELECT user_role FROM users WHERE id = ?";
$userStmt = $db->prepare($userQuery);
$userStmt->execute([$userId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !in_array($user['user_role'], ['suporte', 'admin'])) {
    Response::error('Acesso negado - permissão insuficiente', 403);
    exit;
}

switch ($method) {
    case 'GET':
        if (strpos($path, '/contadores/summary') !== false) {
            $controller->getSummary();
        } elseif (strpos($path, '/contadores/daily') !== false) {
            $controller->getDailyStats();
        } elseif (strpos($path, '/contadores/top-users') !== false) {
            $controller->getTopUsers();
        } elseif (preg_match('#/contadores/details/(.+)$#', $path, $matches)) {
            $controller->getPageDetails($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;

    case 'DELETE':
        if (strpos($path, '/contadores/cleanup') !== false) {
            $controller->cleanup();
        } elseif (strpos($path, '/contadores/delete-page') !== false) {
            $controller->deleteByPage();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;

    default:
        Response::error('Método não permitido', 405);
        break;
}
