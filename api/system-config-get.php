<?php
// system-config-get.php - Endpoint público para buscar configurações específicas por ID ou key

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/utils/Response.php';

try {
    $db = getDBConnection();
    
    // Buscar por ID ou key
    $id = $_GET['id'] ?? null;
    $key = $_GET['key'] ?? null;
    
    if (!$id && !$key) {
        Response::error('Parâmetro id ou key é obrigatório', 400);
        exit;
    }
    
    if ($id) {
        error_log("SYSTEM_CONFIG_PUBLIC: Buscando por ID: {$id}");
        $query = "SELECT id, config_key, config_value, config_type FROM system_config WHERE id = ?";
        $params = [$id];
    } else {
        error_log("SYSTEM_CONFIG_PUBLIC: Buscando por key: {$key}");
        $query = "SELECT id, config_key, config_value, config_type FROM system_config WHERE config_key = ?";
        $params = [$key];
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        error_log("SYSTEM_CONFIG_PUBLIC: Encontrado - " . json_encode($result));
        
        // Converter valor baseado no tipo
        $configValue = $result['config_value'];
        if ($result['config_type'] === 'decimal' || $result['config_type'] === 'float') {
            $configValue = (float)$configValue;
        } elseif ($result['config_type'] === 'integer') {
            $configValue = (int)$configValue;
        } elseif ($result['config_type'] === 'boolean') {
            $configValue = filter_var($configValue, FILTER_VALIDATE_BOOLEAN);
        }
        
        $response = [
            'id' => $result['id'],
            'config_key' => $result['config_key'],
            'config_value' => $configValue,
            'config_type' => $result['config_type']
        ];
        
        Response::success($response, 'Configuração encontrada');
    } else {
        $searchParam = $id ? "ID {$id}" : "key {$key}";
        error_log("SYSTEM_CONFIG_PUBLIC: Não encontrado - {$searchParam}");
        Response::error("Configuração não encontrada ({$searchParam})", 404);
    }
    
} catch (Exception $e) {
    error_log("SYSTEM_CONFIG_PUBLIC ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
?>