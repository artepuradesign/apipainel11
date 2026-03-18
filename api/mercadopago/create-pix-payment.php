<?php
/**
 * Endpoint: POST /mercadopago/create-pix-payment.php
 * Cria um pagamento PIX no Mercado Pago
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/MercadoPagoService.php';
require_once __DIR__ . '/../config/conexao.php';

// Habilitar CORS
CorsMiddleware::handle();

// Conectar ao banco
try {
    $db = getDBConnection();
} catch (Exception $e) {
    Response::error('Erro de conexão com banco de dados', 500);
}

// Apenas POST é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::methodNotAllowed('Apenas POST é permitido');
}

try {
    error_log("✅ [CREATE-PIX] ========================================");
    error_log("✅ [CREATE-PIX] Iniciando criação de pagamento PIX");
    error_log("✅ [CREATE-PIX] Timestamp: " . date('Y-m-d H:i:s'));
    
    // Carregar configuração
    $config = require __DIR__ . '/../config/mercadopago.php';
    $accessToken = $config['access_token'] ?? null;
    
    if (empty($accessToken)) {
        error_log("✅ [CREATE-PIX] ❌ Access token não configurado");
        Response::error('Credenciais não configuradas', 500);
    }
    
    error_log("✅ [CREATE-PIX] ✅ Credenciais carregadas");

    // Ler dados do POST
    $inputData = file_get_contents('php://input');
    $data = json_decode($inputData, true);
    
    error_log("✅ [CREATE-PIX] Dados recebidos: " . json_encode($data));

    if (json_last_error() !== JSON_ERROR_NONE) {
        Response::error('JSON inválido', 400);
    }

    // Validar dados obrigatórios
    if (empty($data['email']) || empty($data['transactionAmount'])) {
        error_log("✅ [CREATE-PIX] ❌ Dados obrigatórios faltando");
        Response::error('Email e valor da transação são obrigatórios', 400);
    }
    
    error_log("✅ [CREATE-PIX] ✅ Validação de dados OK");
    error_log("✅ [CREATE-PIX] Email: " . $data['email']);
    error_log("✅ [CREATE-PIX] Valor: " . $data['transactionAmount']);
    error_log("✅ [CREATE-PIX] User ID: " . ($data['user_id'] ?? 'NULL'));

    // Tempo de expiração do PIX (padrão: 30 minutos)
    $expirationMinutes = $config['pix']['expiration_minutes'] ?? 30;
    $expirationTime = "P0DT0H{$expirationMinutes}M0S"; // Formato ISO 8601
    
    error_log("✅ [CREATE-PIX] Tempo de expiração: $expirationMinutes minutos");

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
                    'expiration_time' => $expirationTime
                ]
            ]
        ],
        'payer' => [
            'email' => $data['email']
        ]
    ];

    // Adicionar dados opcionais do pagador
    if (!empty($data['payerFirstName']) && !empty($data['payerLastName'])) {
        $payload['payer']['first_name'] = $data['payerFirstName'];
        $payload['payer']['last_name'] = $data['payerLastName'];
    }

    if (!empty($data['identificationType']) && !empty($data['identificationNumber'])) {
        $payload['payer']['identification'] = [
            'type' => $data['identificationType'],
            'number' => $data['identificationNumber']
        ];
    }

    error_log("✅ [CREATE-PIX] Payload preparado para enviar ao MP:");
    error_log("✅ [CREATE-PIX] " . json_encode($payload, JSON_PRETTY_PRINT));
    
    // Criar order no Mercado Pago
    error_log("✅ [CREATE-PIX] 📡 Enviando requisição para Mercado Pago...");
    
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
    
    error_log("✅ [CREATE-PIX] Response HTTP Code: $httpCode");
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        Response::error('Erro na requisição: ' . $error, 500);
    }
    
    curl_close($ch);

    if ($httpCode === 201 || $httpCode === 200) {
        $responseData = json_decode($response, true);
        
        error_log("✅ [CREATE-PIX] ========== RESPOSTA COMPLETA DA API MERCADO PAGO ==========");
        error_log("✅ [CREATE-PIX] " . json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        error_log("✅ [CREATE-PIX] ================================================================");
        
        // Extrair informações do pagamento
        $payment = $responseData['transactions']['payments'][0] ?? null;
        
        if (!$payment) {
            error_log("✅ [CREATE-PIX] ❌ Payment não encontrado na resposta");
            Response::error('Erro ao processar resposta do Mercado Pago', 500);
        }
        
        error_log("✅ [CREATE-PIX] ========== ESTRUTURA DO PAYMENT ==========");
        error_log("✅ [CREATE-PIX] " . json_encode($payment, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        error_log("✅ [CREATE-PIX] ===============================================");
        
        // SEMPRE extrair payment_id da URL do ticket (ÚNICO ID CORRETO)
        // Este é o ID numérico que deve ser usado para todas as operações
        $paymentId = null;
        $orderId = $responseData['id'] ?? null;  // ID da order (alfanumérico)
        $ticketUrl = $payment['payment_method']['ticket_url'] ?? null;
        
        // Extrair ID da URL do ticket - OBRIGATÓRIO
        if ($ticketUrl && preg_match('/\/payments\/(\d+)\//', $ticketUrl, $matches)) {
            $paymentId = $matches[1];
            error_log("✅ [CREATE-PIX] 🎯 Payment ID extraído da URL do ticket: $paymentId");
        } else {
            error_log("✅ [CREATE-PIX] ❌ ERRO: Não foi possível extrair Payment ID da URL do ticket");
            error_log("✅ [CREATE-PIX] Ticket URL: " . ($ticketUrl ?? 'NULL'));
            Response::error('Não foi possível extrair Payment ID da URL do ticket', 500);
        }
        
        error_log("✅ [CREATE-PIX] ========== ANÁLISE DOS IDs ==========");
        error_log("✅ [CREATE-PIX] 🔍 Payment ID (payment['id']): " . ($paymentId ?? 'NULL'));
        error_log("✅ [CREATE-PIX] 🔍 Tipo do Payment ID: " . (is_numeric($paymentId) ? 'NUMÉRICO ✅' : 'ALFANUMÉRICO'));
        error_log("✅ [CREATE-PIX] 🔍 Order ID (responseData['id']): " . ($orderId ?? 'NULL'));
        error_log("✅ [CREATE-PIX] 🔍 Tipo do Order ID: " . (is_numeric($orderId) ? 'NUMÉRICO' : 'ALFANUMÉRICO'));
        error_log("✅ [CREATE-PIX] 🔍 Ticket URL: " . ($ticketUrl ?? 'NULL'));
        error_log("✅ [CREATE-PIX] ================================================");
        
        // Validar que temos um payment_id válido
        if (!$paymentId) {
            error_log("✅ [CREATE-PIX] ❌ ERRO: Payment ID não encontrado na resposta!");
            error_log("✅ [CREATE-PIX] ❌ Resposta completa: " . json_encode($responseData));
            Response::error('Payment ID não encontrado na resposta do Mercado Pago', 500);
        }
        
        error_log("✅ [CREATE-PIX] ========== RESUMO DO PAGAMENTO CRIADO ==========");
        error_log("✅ [CREATE-PIX] ✅ Payment criado com sucesso!");
        error_log("✅ [CREATE-PIX] 🎯 Payment ID (USADO NO BANCO): $paymentId");
        error_log("✅ [CREATE-PIX] 📦 Order ID (referência): $orderId");
        error_log("✅ [CREATE-PIX] 💰 Valor: " . ($payment['amount'] ?? 'N/A'));
        error_log("✅ [CREATE-PIX] 📊 Status: " . ($payment['status'] ?? 'N/A'));
        error_log("✅ [CREATE-PIX] ======================================================");

        // Preparar dados para salvar no banco
        // payment_id = ID numérico extraído da URL do ticket (129380868868)
        // transaction_id = ID alfanumérico da order (PAY01K76Z8KZHO51KRWFWMWAXK52X)
        
        // Garantir email em minúsculas e nome completo
        $payerEmail = strtolower($data['email']);
        $payerName = $data['payer_name'] ?? null;
        
        $paymentDataForDb = [
            'id' => (string)$paymentId,  // ✅ ID numérico da URL do ticket
            'order_id' => (string)$orderId,  // ID da order
            'transaction_amount' => $payment['amount'],
            'description' => 'RECARGA PIX',
            'external_reference' => $payload['external_reference'],
            'status' => $payment['status'],
            'status_detail' => $payment['status_detail'] ?? null,
            'payer' => [
                'email' => $payerEmail,
                'name' => $payerName
            ],
            'point_of_interaction' => [
                'transaction_data' => [
                    'qr_code' => $payment['payment_method']['qr_code'] ?? null,
                    'qr_code_base64' => $payment['payment_method']['qr_code_base64'] ?? null,
                    'transaction_id' => (string)$orderId  // ✅ ID alfanumérico da order
                ]
            ],
            'date_of_expiration' => date('Y-m-d\TH:i:s.000P', strtotime("+{$expirationMinutes} minutes"))
        ];
        
        error_log("✅ [CREATE-PIX] 🔍 Verificação FINAL antes de salvar no banco:");
        error_log("✅ [CREATE-PIX] 🔍 Payment ID (tipo): " . gettype($paymentDataForDb['id']));
        error_log("✅ [CREATE-PIX] 🔍 Payment ID (valor): " . $paymentDataForDb['id']);
        error_log("✅ [CREATE-PIX] 🔍 Payment ID (strlen): " . strlen($paymentDataForDb['id']));
        
        error_log("✅ [CREATE-PIX] Dados preparados para salvar no banco:");
        error_log("✅ [CREATE-PIX] Payment ID: " . $paymentDataForDb['id']);
        error_log("✅ [CREATE-PIX] Order ID: " . ($paymentDataForDb['order_id'] ?? 'N/A'));
        error_log("✅ [CREATE-PIX] Status: " . $paymentDataForDb['status']);

        // Salvar no banco de dados
        $mpService = new MercadoPagoService($db);
        $userId = $data['user_id'] ?? null;
        
        error_log("✅ [CREATE-PIX] Salvando no banco para user_id: " . ($userId ?? 'NULL'));
        
        if ($userId) {
            $saveResult = $mpService->savePixPayment($userId, $paymentDataForDb);
            
            if (!$saveResult['success']) {
                error_log("✅ [CREATE-PIX] ⚠️ Pagamento criado no MP mas não salvo no banco: " . $saveResult['error']);
            } else {
                error_log("✅ [CREATE-PIX] ✅ Pagamento PIX salvo no banco!");
                error_log("✅ [CREATE-PIX] Internal ID: " . $saveResult['internal_id']);
                error_log("✅ [CREATE-PIX] Payment ID salvo: " . $saveResult['payment_id']);
            }
        } else {
            error_log("✅ [CREATE-PIX] ⚠️ user_id não fornecido, pagamento não foi salvo no banco");
        }

        $result = [
            'success' => true,
            'order_id' => $orderId,
            'status' => $payment['status'] ?? 'pending',
            'payment_id' => $paymentId,  // CORRIGIDO: usar o payment_id correto
            'qr_code' => $payment['payment_method']['qr_code'] ?? null,
            'qr_code_base64' => $payment['payment_method']['qr_code_base64'] ?? null,
            'ticket_url' => $payment['payment_method']['ticket_url'] ?? null
        ];
        
        error_log("✅ [CREATE-PIX] ✅ Resposta final preparada:");
        error_log("✅ [CREATE-PIX] " . json_encode($result));
        error_log("✅ [CREATE-PIX] ========================================");

        Response::success($result, 'Pagamento PIX criado com sucesso');
    } else {
        $errorData = json_decode($response, true);
        $errorMessage = $errorData['message'] ?? 'Erro ao criar pagamento';
        
        error_log("✅ [CREATE-PIX] ❌ Erro na resposta do MP:");
        error_log("✅ [CREATE-PIX] HTTP Code: $httpCode");
        error_log("✅ [CREATE-PIX] Error: $errorMessage");
        error_log("✅ [CREATE-PIX] Response: $response");
        error_log("✅ [CREATE-PIX] ========================================");
        
        Response::error($errorMessage, $httpCode);
    }
} catch (Exception $e) {
    error_log("✅ [CREATE-PIX] ❌ Exception: " . $e->getMessage());
    error_log("✅ [CREATE-PIX] Stack trace: " . $e->getTraceAsString());
    error_log("✅ [CREATE-PIX] ========================================");
    Response::error('Erro ao criar pagamento PIX: ' . $e->getMessage(), 500);
}
