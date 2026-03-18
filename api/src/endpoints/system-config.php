<?php
// src/endpoints/system-config.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/ReferralConfigService.php';

try {
    $db = getDBConnection();
    
    if (!$db) {
        throw new Exception("Erro de conexão com o banco de dados");
    }
    
    $referralConfigService = new ReferralConfigService($db);
    
    // Buscar todas as configurações do sistema
    $query = "SELECT config_key, config_value, config_type, description FROM system_config WHERE config_key IN ('referral_bonus_amount', 'referral_system_enabled', 'referral_bonus_enabled', 'referral_commission_enabled', 'referral_commission_percentage')";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Organizar configurações
    $systemConfig = [];
    foreach ($configs as $config) {
        $systemConfig[] = [
            'config_key' => $config['config_key'],
            'config_value' => $config['config_value'],
            'config_type' => $config['config_type'],
            'description' => $config['description'] ?? ''
        ];
    }
    
    // Se não encontrou nenhuma configuração, criar valores padrão
    if (empty($systemConfig)) {
        $systemConfig = [
            [
                'config_key' => 'referral_bonus_amount',
                'config_value' => '3',
                'config_type' => 'number',
                'description' => 'Valor do bônus de indicação'
            ],
            [
                'config_key' => 'referral_system_enabled',
                'config_value' => 'true',
                'config_type' => 'boolean',
                'description' => 'Sistema de indicação habilitado'
            ],
            [
                'config_key' => 'referral_bonus_enabled',
                'config_value' => 'true',
                'config_type' => 'boolean',
                'description' => 'Bônus de indicação habilitado'
            ]
        ];
    }
    
    error_log("SYSTEM_CONFIG: Configurações encontradas: " . json_encode($systemConfig));
    
    echo json_encode([
        'success' => true,
        'message' => 'Configurações do sistema carregadas com sucesso',
        'data' => $systemConfig,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    error_log("SYSTEM_CONFIG ERROR: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao carregar configurações do sistema',
        'error' => $e->getMessage(),
        'data' => null,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>