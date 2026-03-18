<?php
// src/routes/revendas.php - Rotas do sistema de revenda

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/RevendasController.php';
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

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("REVENDAS_ROUTE: Método {$method}, Path: {$path}");

// Obter conexão do pool
$db = getDBConnection();

$revendasController = new RevendasController($db);

// Endpoints públicos (não precisam de autenticação)
$publicEndpoints = ['/revendas/validate'];
$isPublicEndpoint = false;
foreach ($publicEndpoints as $publicPath) {
    if (strpos($path, $publicPath) === 0) {
        $isPublicEndpoint = true;
        break;
    }
}

// Verificar autenticação para endpoints privados
if (!$isPublicEndpoint) {
    error_log("REVENDAS_ROUTE: Endpoint privado, verificando autenticação...");
    
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        error_log("REVENDAS_ROUTE: Autenticação falhou!");
        exit;
    }
    
    $authenticatedUserId = AuthMiddleware::getCurrentUserId();
    error_log("REVENDAS_ROUTE: Autenticação OK! User ID: {$authenticatedUserId}");
}

// Roteamento
switch ($method) {
    case 'GET':
        if (preg_match('/\/revendas\/validate\/([^\/]+)$/', $path, $matches)) {
            // Validar código de revenda (público)
            $revendasController->validateReferralCode($matches[1]);
        } elseif (preg_match('/\/revendas\/status\/(\d+)$/', $path, $matches)) {
            // Obter status da revenda de um usuário
            $revendasController->getRevendaStatus($matches[1]);
        } elseif (strpos($path, '/revendas/dashboard') !== false) {
            // Dashboard com estatísticas
            $revendasController->getDashboard();
        } elseif (strpos($path, '/revendas/config') !== false) {
            // Configurações do sistema
            $revendasController->getConfig();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/revendas/toggle') !== false) {
            // Ativar/desativar revenda
            $revendasController->toggleRevendaStatus();
        } elseif (strpos($path, '/revendas/bonus/registration') !== false) {
            // Processar bônus de cadastro
            $revendasController->processRegistrationBonus();
        } elseif (strpos($path, '/revendas/commission/plan-activation') !== false) {
            // Processar comissão de ativação de plano
            $revendasController->processPlanActivationCommission();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
