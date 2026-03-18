
<?php
// src/routes/consultations.php

require_once __DIR__ . '/../controllers/ConsultationsController.php';
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

$consultationsController = new ConsultationsController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("CONSULTATIONS_ROUTE: Método {$method}, Path: {$path}");
error_log("CONSULTATIONS_ROUTE: ARQUIVO CONSULTATIONS.PHP FOI EXECUTADO!");

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

// Roteamento
error_log("CONSULTATIONS_ROUTE_DEBUG: Original Path: {$_SERVER['REQUEST_URI']}");
error_log("CONSULTATIONS_ROUTE_DEBUG: Processed Path: {$path}");
error_log("CONSULTATIONS_ROUTE_DEBUG: Method: {$method}");

switch ($method) {
    case 'GET':
        // Teste diferentes patterns para debug
        error_log("CONSULTATIONS_ROUTE_DEBUG: Testing patterns for path: {$path}");
        
        if (preg_match('#/consultations/user/(\d+)$#', $path, $matches)) {
            error_log("CONSULTATIONS_ROUTE_DEBUG: Matched user pattern, user_id: {$matches[1]}");
            $consultationsController->getByUser($matches[1]);
        } elseif (preg_match('#/consultations/user/(\d+)/stats$#', $path, $matches)) {
            error_log("CONSULTATIONS_ROUTE_DEBUG: Matched user stats pattern, user_id: {$matches[1]}");
            $consultationsController->getUserStats($matches[1]);
        } elseif (preg_match('#/consultations/(\d+)$#', $path, $matches)) {
            error_log("CONSULTATIONS_ROUTE_DEBUG: Matched consultation by ID pattern, id: {$matches[1]}");
            $consultationsController->getById($matches[1]);
        } elseif ($path === '/consultations') {
            error_log("CONSULTATIONS_ROUTE_DEBUG: Matched getAll pattern");
            $consultationsController->getAll();
        } else {
            error_log("CONSULTATIONS_ROUTE_DEBUG: No pattern matched for path: {$path}");
            Response::error('Endpoint não encontrado: ' . $path, 404);
        }
        break;
        
    case 'POST':
        error_log("CONSULTATIONS_ROUTE_DEBUG: POST case - path recebido: '{$path}'");
        error_log("CONSULTATIONS_ROUTE_DEBUG: Testando patterns:");
        error_log("CONSULTATIONS_ROUTE_DEBUG: - path === '/consultations': " . ($path === '/consultations' ? 'TRUE' : 'FALSE'));
        error_log("CONSULTATIONS_ROUTE_DEBUG: - path === '/api/consultations': " . ($path === '/api/consultations' ? 'TRUE' : 'FALSE'));
        error_log("CONSULTATIONS_ROUTE_DEBUG: - regex match: " . (preg_match('#/consultations/?$#', $path) ? 'TRUE' : 'FALSE'));
        
        if ($path === '/consultations' || $path === '/api/consultations' || preg_match('#/consultations/?$#', $path) || strpos($path, 'consultations') !== false) {
            error_log("CONSULTATIONS_ROUTE_DEBUG: Matched POST consultations pattern");
            $consultationsController->create();
        } else {
            error_log("CONSULTATIONS_ROUTE_DEBUG: No POST pattern matched for path: '{$path}'");
            Response::error('Endpoint não encontrado: ' . $path, 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
