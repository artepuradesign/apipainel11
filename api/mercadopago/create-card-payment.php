<?php
/**
 * Endpoint: POST /mercadopago/create-card-payment.php
 * Cria pagamento por cartão no Mercado Pago e credita saldo quando aprovado
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/MercadoPagoService.php';
require_once __DIR__ . '/../config/conexao.php';

CorsMiddleware::handle();

try {
    $db = getDBConnection();
} catch (Exception $e) {
    Response::error('Erro de conexão com banco de dados', 500);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed('Apenas POST é permitido');
}

function mpRequest(string $url, string $accessToken, array $payload): array {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json',
        'X-Idempotency-Key: ' . uniqid('idempotency_', true)
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        throw new Exception('Erro na requisição: ' . $error);
    }

    curl_close($ch);

    $decoded = json_decode($response, true);

    return [
        'http_code' => $httpCode,
        'data' => is_array($decoded) ? $decoded : [],
        'raw' => $response
    ];
}

try {
    $config = require __DIR__ . '/../config/mercadopago.php';
    $accessToken = $config['access_token'] ?? null;

    if (empty($accessToken)) {
        Response::error('Credenciais não configuradas', 500);
    }

    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error('JSON inválido', 400);
    }

    $requiredFields = [
        'transactionAmount',
        'email',
        'identificationType',
        'identificationNumber',
        'cardholderName',
        'cardNumber',
        'expirationMonth',
        'expirationYear',
        'securityCode'
    ];

    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            Response::error("Campo obrigatório ausente: {$field}", 400);
        }
    }

    $amount = (float)$data['transactionAmount'];
    if ($amount <= 0) {
        Response::error('Valor do pagamento inválido', 400);
    }

    $tokenPayload = [
        'card_number' => preg_replace('/\D/', '', $data['cardNumber']),
        'expiration_month' => (int)$data['expirationMonth'],
        'expiration_year' => (int)$data['expirationYear'],
        'security_code' => preg_replace('/\D/', '', $data['securityCode']),
        'cardholder' => [
            'name' => strtoupper(trim($data['cardholderName'])),
            'identification' => [
                'type' => strtoupper(trim($data['identificationType'])),
                'number' => preg_replace('/\D/', '', $data['identificationNumber'])
            ]
        ]
    ];

    $tokenResult = mpRequest('https://api.mercadopago.com/v1/card_tokens', $accessToken, $tokenPayload);

    if (!in_array($tokenResult['http_code'], [200, 201], true) || empty($tokenResult['data']['id'])) {
        $message = $tokenResult['data']['message'] ?? 'Erro ao tokenizar cartão';
        Response::error($message, 400);
    }

    $cardToken = $tokenResult['data'];

    $paymentPayload = [
        'transaction_amount' => round($amount, 2),
        'token' => $cardToken['id'],
        'description' => $data['description'] ?? 'Recarga de Saldo',
        'installments' => isset($data['installments']) ? max(1, (int)$data['installments']) : 1,
        'payment_method_id' => $cardToken['payment_method_id'] ?? null,
        'payer' => [
            'email' => strtolower(trim($data['email'])),
            'identification' => [
                'type' => strtoupper(trim($data['identificationType'])),
                'number' => preg_replace('/\D/', '', $data['identificationNumber'])
            ]
        ],
        'external_reference' => 'recarga_card_' . uniqid()
    ];

    $paymentResult = mpRequest('https://api.mercadopago.com/v1/payments', $accessToken, $paymentPayload);

    if (!in_array($paymentResult['http_code'], [200, 201], true) || empty($paymentResult['data']['id'])) {
        $message = $paymentResult['data']['message'] ?? 'Erro ao criar pagamento com cartão';
        Response::error($message, 400);
    }

    $paymentData = $paymentResult['data'];
    $paymentId = (string)$paymentData['id'];
    $status = $paymentData['status'] ?? 'pending';
    $userId = isset($data['user_id']) ? (int)$data['user_id'] : 0;

    // Registrar no histórico de payments
    if ($userId > 0) {
        $stmt = $db->prepare("INSERT INTO payments (user_id, amount, method, status, reference, gateway_response, metadata, created_at, updated_at)
                              VALUES (?, ?, 'cartao', ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([
            $userId,
            $amount,
            $status,
            'mp_card_' . $paymentId,
            json_encode($paymentData),
            json_encode([
                'gateway' => 'mercadopago',
                'payment_id' => $paymentId,
                'status_detail' => $paymentData['status_detail'] ?? null
            ])
        ]);
    }

    // Creditar saldo automaticamente se aprovado
    if ($status === 'approved' && $userId > 0) {
        $mpService = new MercadoPagoService($db);
        $credited = $mpService->creditApprovedCardPayment($userId, $amount, $paymentId);

        if (!$credited) {
            Response::error('Pagamento aprovado, mas houve erro ao creditar saldo', 500);
        }
    }

    Response::success([
        'payment_id' => $paymentId,
        'status' => $status,
        'status_detail' => $paymentData['status_detail'] ?? null,
        'transaction_amount' => $paymentData['transaction_amount'] ?? $amount,
        'payment_method_id' => $paymentData['payment_method_id'] ?? null
    ], 'Pagamento com cartão processado com sucesso');
} catch (Exception $e) {
    error_log('❌ [CREATE-CARD] Erro: ' . $e->getMessage());
    Response::error('Erro ao criar pagamento por cartão: ' . $e->getMessage(), 500);
}
