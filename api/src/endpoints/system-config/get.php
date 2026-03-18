<?php
// src/endpoints/system-config/get.php
// Reutiliza $db do roteador (public/index.php ou index.php)

require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../services/SystemConfigService.php';

try {
    // Reaproveitar conexão do roteador pai, ou criar nova se necessário
    if (!isset($db) || !$db) {
        require_once __DIR__ . '/../../../config/conexao.php';
        $db = getDBConnection();
    }
    
    if (!$db) {
        Response::error('Erro de conexão com o banco de dados', 500);
        exit;
    }
    
    $systemConfigService = new SystemConfigService($db);
    
    // Check if specific config key is requested
    $configKey = $_GET['key'] ?? null;
    $category = $_GET['category'] ?? null;
    
    if ($configKey) {
        $value = $systemConfigService->getConfigValue($configKey);
        
        if ($value !== null) {
            Response::success([
                'config_key' => $configKey,
                'config_value' => $value
            ], 'Configuração obtida com sucesso');
        } else {
            Response::error('Configuração não encontrada', 404);
        }
    } else {
        $configs = $systemConfigService->getAllConfigs($category);
        Response::success($configs, 'Configurações obtidas com sucesso');
    }
    
} catch (Exception $e) {
    error_log("SYSTEM_CONFIG_GET ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
}
