<?php
// get-bonus-amount.php - Endpoint simples para buscar valor do bônus (ID 6)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/services/BonusConfigService.php';

try {
    // Usar o novo serviço que lê diretamente do bonus.php
    $bonusConfigService = BonusConfigService::getInstance();
    $bonusAmount = $bonusConfigService->getBonusAmount();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'referral_bonus_amount' => $bonusAmount,
            'referral_system_enabled' => true,
            'referral_bonus_enabled' => true,
            'referral_commission_enabled' => false,
            'referral_commission_percentage' => 0
        ],
        'message' => 'Valor do bônus obtido do bonus.php',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
    error_log("BONUS_AMOUNT: Valor obtido do bonus.php = {$bonusAmount}");
    
} catch (Exception $e) {
    error_log("BONUS_AMOUNT CRITICAL ERROR: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor',
        'error' => $e->getMessage(),
        'data' => null,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>