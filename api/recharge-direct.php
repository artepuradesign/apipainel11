<?php
// recharge-direct.php - Endpoint direto para teste

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log da requisição
error_log("RECHARGE_DIRECT: Requisição recebida - METHOD: " . $_SERVER['REQUEST_METHOD'] . ", URI: " . $_SERVER['REQUEST_URI']);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    error_log("RECHARGE_DIRECT: Input recebido: " . json_encode($input));
    
    // Simular sucesso
    $response = [
        'success' => true,
        'message' => 'Recarga processada com sucesso (teste direto)',
        'data' => [
            'transaction_id' => 'TEST_' . time(),
            'amount' => $input['amount'] ?? 0,
            'payment_method' => $input['payment_method'] ?? 'unknown',
            'user_id' => $input['user_id'] ?? 0,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ];
    
    echo json_encode($response);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>