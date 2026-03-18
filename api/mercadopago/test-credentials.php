<?php
/**
 * Endpoint: GET /mercadopago/test-credentials.php
 * Testa as credenciais do Mercado Pago
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';

// Habilitar CORS
CorsMiddleware::handle();

// Apenas GET é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::methodNotAllowed('Apenas GET é permitido');
}

try {
    // Carregar configuração
    $config = require __DIR__ . '/../config/mercadopago.php';
    $accessToken = $config['access_token'] ?? null;
    
    if (empty($accessToken)) {
        Response::error('Credenciais não configuradas', 500);
    }

    // Fazer requisição de teste à API do Mercado Pago
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/v1/payment_methods');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        Response::error('Erro na requisição: ' . $error, 500);
    }
    
    curl_close($ch);

    if ($httpCode === 200) {
        Response::success([
            'environment' => $config['production'] ? 'production' : 'sandbox',
            'status' => 'connected'
        ], 'Credenciais válidas');
    } else {
        $errorData = json_decode($response, true);
        $errorMessage = $errorData['message'] ?? 'Credenciais inválidas';
        Response::error($errorMessage, $httpCode);
    }
} catch (Exception $e) {
    Response::error('Erro ao testar credenciais: ' . $e->getMessage(), 500);
}
