<?php
// get-config-id6.php - Endpoint para buscar especificamente o ID 6 da system_config

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/src/config/database.php';

try {
    $db = getDBConnection();
    
    if (!$db) {
        throw new Exception("Erro de conexão com o banco de dados");
    }
    
    // Buscar APENAS o ID 6 da system_config
    $query = "SELECT config_value FROM system_config WHERE id = 6";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result && isset($result['config_value'])) {
        $bonusAmount = (float)$result['config_value'];
        
        echo json_encode([
            'success' => true,
            'data' => [
                'config_value' => $bonusAmount,
                'referral_bonus_amount' => $bonusAmount
            ],
            'message' => 'Valor do bônus ID 6 obtido com sucesso',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
        error_log("CONFIG_ID6: Valor encontrado = {$bonusAmount}");
        
    } else {
        error_log("CONFIG_ID6 ERROR: ID 6 não encontrado!");
        
        echo json_encode([
            'success' => false,
            'message' => 'Valor do bônus não encontrado (ID 6)',
            'data' => null,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
    
} catch (Exception $e) {
    error_log("CONFIG_ID6 CRITICAL ERROR: " . $e->getMessage());
    
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