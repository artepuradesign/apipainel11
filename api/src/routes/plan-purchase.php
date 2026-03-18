<?php
// src/routes/plan-purchase.php

// Verificar se $db está disponível (passado do index.php principal)
if (!isset($db)) {
    Response::error('Conexão com banco não disponível', 500);
    exit();
}

require_once __DIR__ . '/../controllers/PlanController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Debug inicial
error_log("=== PLAN PURCHASE ROUTE DEBUG ===");
error_log("REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
error_log("REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME']);

// Tratar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Responder OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar se a requisição é para plan/purchase
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Normalizar path
$path = preg_replace('#^/api#', '', $path);
$path = rtrim($path, '/');

error_log("PLAN_PURCHASE_ROUTE: Método {$method}, Path: {$path}");
error_log("PLAN_PURCHASE_DEBUG: Verificando rotas disponíveis...");

// Verificar autenticação apenas para rotas que precisam
$needsAuth = in_array($path, ['/plan/purchase', '/user/active-plan', '/user/plan-usage']);

if ($needsAuth) {
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        exit;
    }
}

// Inicializar controller
$planController = new PlanController($db);

// Roteamento melhorado
error_log("PLAN_PURCHASE_DEBUG: Iniciando roteamento para path: {$path}");

switch ($method) {
    case 'POST':
        error_log("PLAN_PURCHASE_DEBUG: Processando POST request");
        
        if ($path === '/plan/purchase' || $path === '/plan/purchase/') {
            error_log("PLAN_PURCHASE_DEBUG: Rota /plan/purchase identificada - Executando purchasePlan()");
            try {
                $planController->purchasePlan();
            } catch (Exception $e) {
                error_log("PLAN_PURCHASE_ERROR: " . $e->getMessage());
                Response::error('Erro interno: ' . $e->getMessage(), 500);
            }
        } else {
            error_log("PLAN_PURCHASE_DEBUG: Endpoint POST não encontrado para path: {$path}");
            Response::error("Endpoint não encontrado: {$path}", 404);
        }
        break;
        
    case 'GET':
        error_log("PLAN_PURCHASE_DEBUG: Processando GET request");
        
        if ($path === '/user/active-plan' || $path === '/user/active-plan/') {
            error_log("PLAN_PURCHASE_DEBUG: Rota /user/active-plan identificada");
            try {
                $planController->getUserActivePlan();
            } catch (Exception $e) {
                error_log("PLAN_PURCHASE_ERROR: " . $e->getMessage());
                Response::error('Erro interno: ' . $e->getMessage(), 500);
            }
        } elseif ($path === '/user/plan-usage' || $path === '/user/plan-usage/') {
            error_log("PLAN_PURCHASE_DEBUG: Rota /user/plan-usage identificada");
            try {
                $planController->getPlanUsageStats();
            } catch (Exception $e) {
                error_log("PLAN_PURCHASE_ERROR: " . $e->getMessage());
                Response::error('Erro interno: ' . $e->getMessage(), 500);
            }
        } else {
            error_log("PLAN_PURCHASE_DEBUG: Endpoint GET não encontrado para path: {$path}");
            Response::error("Endpoint não encontrado: {$path}", 404);
        }
        break;
        
    default:
        error_log("PLAN_PURCHASE_DEBUG: Método HTTP não permitido: {$method}");
        Response::error('Método HTTP não permitido', 405);
        break;
}
?>