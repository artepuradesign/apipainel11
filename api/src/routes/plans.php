
<?php
// src/routes/plans.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/PlansController.php';
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

// Obter conexão do pool
$db = getDBConnection();

$plansController = new PlansController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("PLANS_ROUTE: Método {$method}, Path: {$path}");

// Endpoints públicos
$publicEndpoints = ['/plans/active', '/plans/public', '/plans'];
$isPublicEndpoint = false;
foreach ($publicEndpoints as $publicPath) {
    if (strpos($path, $publicPath) === 0) {
        $isPublicEndpoint = true;
        break;
    }
}

// Verificar autenticação para endpoints não públicos (desabilitado temporariamente para debug)
// if (!$isPublicEndpoint) {
//     $authMiddleware = new AuthMiddleware($db);
//     if (!$authMiddleware->handle()) {
//         exit;
//     }
// }

// Roteamento
switch ($method) {
    case 'GET':
        if (strpos($path, '/plans/active') !== false) {
            $plansController->getActive();
        } elseif (preg_match('/\/plans\/(\d+)\/details$/', $path, $matches)) {
            $plansController->getDetails($matches[1]);
        } elseif (preg_match('/\/plans\/(\d+)$/', $path, $matches)) {
            $plansController->getById($matches[1]);
        } elseif ($path === '/plans' || strpos($path, '/plans') === 0) {
            $plansController->getAll();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (preg_match('/\/plans\/(\d+)\/migrate$/', $path, $matches)) {
            $plansController->migrateSubscribers($matches[1]);
        } elseif ($path === '/plans' || strpos($path, '/plans/create') !== false) {
            $plansController->create();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/plans\/(\d+)$/', $path, $matches)) {
            $plansController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/plans\/(\d+)$/', $path, $matches)) {
            $plansController->delete($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
