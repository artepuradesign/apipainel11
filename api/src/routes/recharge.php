<?php
// routes/recharge.php

require_once __DIR__ . '/../controllers/RechargeController.php';

// Verificar se database está disponível
if (!isset($db)) {
    error_log("RECHARGE_ROUTES: Database connection not available");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection not available']);
    exit;
}

error_log("RECHARGE_ROUTES: Database connection OK, METHOD: " . $_SERVER['REQUEST_METHOD'] . ", URI: " . $_SERVER['REQUEST_URI']);

$rechargeController = new RechargeController($db);

// Mapear endpoints
$endpoint = $_SERVER['REQUEST_URI'];
$endpoint = parse_url($endpoint, PHP_URL_PATH);
$endpoint = str_replace('/api', '', $endpoint);

error_log("RECHARGE_ROUTES: Endpoint processado: " . $endpoint);

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($endpoint) {
            case '/recharge/pix-keys':
                $rechargeController->getPixKeys();
                break;
            case '/recharge/history':
                $rechargeController->getRechargeHistory();
                break;
            default:
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Endpoint não encontrado: ' . $endpoint]);
        }
        break;
    
    case 'POST':
        switch ($endpoint) {
            case '/recharge/process':
                error_log("RECHARGE_ROUTES: Processando endpoint /recharge/process");
                $rechargeController->processRecharge();
                break;
            case '/recharge/validate-pix':
                error_log("RECHARGE_ROUTES: Processando endpoint /recharge/validate-pix");
                $rechargeController->validatePixPayment();
                break;
            default:
                error_log("RECHARGE_ROUTES: Endpoint POST não encontrado: " . $endpoint);
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Endpoint não encontrado: ' . $endpoint]);
        }
        break;
    
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}