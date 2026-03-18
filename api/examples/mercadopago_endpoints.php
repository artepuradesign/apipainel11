<?php
/**
 * EXEMPLO DE ENDPOINTS PARA INTEGRAÇÃO MERCADO PAGO
 * 
 * Este arquivo deve ser colocado no servidor externo PHP
 * As rotas devem ser configuradas conforme a estrutura do seu servidor
 * 
 * Endpoints necessários:
 * - GET  /mercadopago/test-credentials
 * - GET  /mercadopago/document-types
 * - POST /mercadopago/create-pix-payment
 */

require_once __DIR__ . '/../config/mercadopago.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Habilitar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

/**
 * Endpoint: GET /mercadopago/test-credentials
 * Testa as credenciais do Mercado Pago
 */
if ($method === 'GET' && strpos($path, '/mercadopago/test-credentials') !== false) {
    try {
        $accessToken = MERCADOPAGO_ACCESS_TOKEN;
        
        if (empty($accessToken)) {
            Response::error('Credenciais não configuradas', 500);
            exit;
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
        curl_close($ch);

        if ($httpCode === 200) {
            Response::success([
                'environment' => MERCADOPAGO_ENVIRONMENT ?? 'production',
                'status' => 'connected'
            ], 'Credenciais válidas');
        } else {
            Response::error('Credenciais inválidas', 401);
        }
    } catch (Exception $e) {
        Response::error('Erro ao testar credenciais: ' . $e->getMessage(), 500);
    }
    exit;
}

/**
 * Endpoint: GET /mercadopago/document-types
 * Retorna os tipos de documento aceitos
 */
if ($method === 'GET' && strpos($path, '/mercadopago/document-types') !== false) {
    try {
        $accessToken = MERCADOPAGO_ACCESS_TOKEN;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/v1/identification_types');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $data = json_decode($response, true);
            Response::success($data, 'Tipos de documento obtidos com sucesso');
        } else {
            Response::error('Erro ao buscar tipos de documento', $httpCode);
        }
    } catch (Exception $e) {
        Response::error('Erro ao buscar tipos de documento: ' . $e->getMessage(), 500);
    }
    exit;
}

/**
 * Endpoint: POST /mercadopago/create-pix-payment
 * Cria um pagamento PIX no Mercado Pago
 */
if ($method === 'POST' && strpos($path, '/mercadopago/create-pix-payment') !== false) {
    try {
        $accessToken = MERCADOPAGO_ACCESS_TOKEN;
        $data = json_decode(file_get_contents('php://input'), true);

        // Validar dados recebidos
        if (!isset($data['email']) || !isset($data['transactionAmount'])) {
            Response::error('Dados incompletos', 400);
            exit;
        }

        // Preparar payload para o Mercado Pago
        $payload = [
            'type' => 'online',
            'total_amount' => number_format((float)$data['transactionAmount'], 2, '.', ''),
            'external_reference' => 'ext_ref_' . uniqid(),
            'processing_mode' => 'automatic',
            'transactions' => [
                'payments' => [
                    [
                        'amount' => number_format((float)$data['transactionAmount'], 2, '.', ''),
                        'payment_method' => [
                            'id' => 'pix',
                            'type' => 'bank_transfer'
                        ],
                        'expiration_time' => 'P0DT0H30M0S' // 30 minutos
                    ]
                ]
            ],
            'payer' => [
                'email' => $data['email']
            ]
        ];

        // Adicionar dados do pagador se fornecidos
        if (isset($data['payerFirstName']) && isset($data['payerLastName'])) {
            $payload['payer']['first_name'] = $data['payerFirstName'];
            $payload['payer']['last_name'] = $data['payerLastName'];
        }

        if (isset($data['identificationType']) && isset($data['identificationNumber'])) {
            $payload['payer']['identification'] = [
                'type' => $data['identificationType'],
                'number' => $data['identificationNumber']
            ];
        }

        // Fazer requisição para criar order no Mercado Pago
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com/v1/orders');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Content-Type: application/json',
            'X-Idempotency-Key: ' . uniqid('idempotency_')
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 201 || $httpCode === 200) {
            $responseData = json_decode($response, true);
            
            // Extrair informações do pagamento
            $payment = $responseData['transactions']['payments'][0] ?? null;
            
            if (!$payment) {
                Response::error('Erro ao processar resposta do Mercado Pago', 500);
                exit;
            }

            $result = [
                'success' => true,
                'order_id' => $responseData['id'] ?? null,
                'status' => $responseData['status'] ?? 'unknown',
                'payment_id' => $payment['id'] ?? null,
                'qr_code' => $payment['payment_method']['qr_code'] ?? null,
                'qr_code_base64' => $payment['payment_method']['qr_code_base64'] ?? null,
                'ticket_url' => $payment['payment_method']['ticket_url'] ?? null
            ];

            Response::success($result, 'Pagamento PIX criado com sucesso');
        } else {
            $errorData = json_decode($response, true);
            $errorMessage = $errorData['message'] ?? 'Erro ao criar pagamento';
            
            Response::error($errorMessage, $httpCode);
        }
    } catch (Exception $e) {
        Response::error('Erro ao criar pagamento PIX: ' . $e->getMessage(), 500);
    }
    exit;
}

// Se chegou até aqui, endpoint não encontrado
Response::notFound('Endpoint não encontrado');
