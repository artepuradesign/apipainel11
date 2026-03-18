<?php
// get-referral-config.php - Endpoint para buscar configurações de indicação

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/services/ReferralConfigService.php';
require_once __DIR__ . '/src/utils/Response.php';

try {
    $db = getDBConnection();
    $referralConfigService = new ReferralConfigService($db);
    
    $config = $referralConfigService->getReferralConfig();
    
    Response::success($config, 'Configurações de indicação obtidas com sucesso');
    
} catch (Exception $e) {
    error_log("GET_REFERRAL_CONFIG ERROR: " . $e->getMessage());
    Response::error('Erro ao buscar configurações de indicação', 500);
}
?>