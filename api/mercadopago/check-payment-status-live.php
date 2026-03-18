<?php
/**
 * Endpoint: GET /mercadopago/check-payment-status-live.php
 * Verifica o status de um pagamento PIX DIRETO na API do Mercado Pago
 * Este endpoint consulta a API em tempo real e atualiza o banco se necessário
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/MercadoPagoService.php';
require_once __DIR__ . '/../config/conexao.php';

// Habilitar CORS
CorsMiddleware::handle();

// Log inicial
error_log("🔍 [LIVE-CHECK] ========================================");
error_log("🔍 [LIVE-CHECK] Iniciando verificação ao vivo do pagamento");
error_log("🔍 [LIVE-CHECK] Timestamp: " . date('Y-m-d H:i:s'));
error_log("🔍 [LIVE-CHECK] Method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔍 [LIVE-CHECK] Query Params: " . json_encode($_GET));

// Conectar ao banco
try {
    $db = getDBConnection();
    error_log("🔍 [LIVE-CHECK] ✅ Conexão com banco estabelecida");
} catch (Exception $e) {
    error_log("🔍 [LIVE-CHECK] ❌ Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados', 500);
}

// Apenas GET é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    error_log("🔍 [LIVE-CHECK] ❌ Método não permitido: " . $_SERVER['REQUEST_METHOD']);
    Response::methodNotAllowed('Apenas GET é permitido');
}

try {
    $paymentId = $_GET['payment_id'] ?? null;
    
    error_log("🔍 [LIVE-CHECK] Payment ID recebido: " . ($paymentId ?? 'NULL'));
    
    if (!$paymentId) {
        error_log("🔍 [LIVE-CHECK] ❌ Payment ID não fornecido");
        Response::error('payment_id é obrigatório', 400);
    }
    
    // Buscar payment no banco para validar
    $mpService = new MercadoPagoService($db);
    $paymentInfo = $mpService->getPixPayment($paymentId);
    
    error_log("🔍 [LIVE-CHECK] Busca no banco - Success: " . ($paymentInfo['success'] ? 'true' : 'false'));
    
    if (!$paymentInfo['success']) {
        error_log("🔍 [LIVE-CHECK] ⚠️ Pagamento não encontrado no banco local");
        // Continuar mesmo assim para buscar na API do MP
    } else {
        error_log("🔍 [LIVE-CHECK] ✅ Pagamento encontrado no banco");
        error_log("🔍 [LIVE-CHECK] Status atual no banco: " . ($paymentInfo['data']['status'] ?? 'N/A'));
        error_log("🔍 [LIVE-CHECK] User ID: " . ($paymentInfo['data']['user_id'] ?? 'N/A'));
    }
    
    // Carregar configuração do Mercado Pago
    $config = require __DIR__ . '/../config/mercadopago.php';
    $accessToken = $config['access_token'] ?? null;
    
    if (empty($accessToken)) {
        error_log("🔍 [LIVE-CHECK] ❌ Access token não configurado");
        Response::error('Credenciais não configuradas', 500);
    }
    
    error_log("🔍 [LIVE-CHECK] 📡 Consultando API do Mercado Pago...");
    error_log("🔍 [LIVE-CHECK] URL: https://api.mercadopago.com/v1/payments/$paymentId");
    
    // Consultar API do Mercado Pago
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://api.mercadopago.com/v1/payments/$paymentId");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $accessToken",
        "Content-Type: application/json"
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    error_log("🔍 [LIVE-CHECK] Response HTTP Code: $httpCode");
    
    if (curl_errno($ch)) {
        $error = curl_error($ch);
        curl_close($ch);
        error_log("🔍 [LIVE-CHECK] ❌ Erro no CURL: $error");
        Response::error('Erro na requisição ao Mercado Pago: ' . $error, 500);
    }
    
    curl_close($ch);
    
    if ($httpCode !== 200) {
        error_log("🔍 [LIVE-CHECK] ❌ Erro ao buscar pagamento (HTTP $httpCode)");
        error_log("🔍 [LIVE-CHECK] Response body: $response");
        Response::error('Erro ao buscar pagamento no Mercado Pago', $httpCode);
    }
    
    $apiData = json_decode($response, true);
    
    if (!$apiData) {
        error_log("🔍 [LIVE-CHECK] ❌ Erro ao decodificar resposta da API");
        Response::error('Erro ao processar resposta do Mercado Pago', 500);
    }
    
    error_log("🔍 [LIVE-CHECK] ✅ Dados recebidos da API do MP");
    error_log("🔍 [LIVE-CHECK] Status na API: " . ($apiData['status'] ?? 'N/A'));
    error_log("🔍 [LIVE-CHECK] Status Detail: " . ($apiData['status_detail'] ?? 'N/A'));
    error_log("🔍 [LIVE-CHECK] Payment Type: " . ($apiData['payment_type_id'] ?? 'N/A'));
    error_log("🔍 [LIVE-CHECK] Transaction Amount: " . ($apiData['transaction_amount'] ?? 'N/A'));
    error_log("🔍 [LIVE-CHECK] Date Created: " . ($apiData['date_created'] ?? 'N/A'));
    error_log("🔍 [LIVE-CHECK] Date Approved: " . ($apiData['date_approved'] ?? 'N/A'));
    
    // Verificar se o status mudou e atualizar banco
    $currentStatus = $apiData['status'] ?? null;
    $dbStatus = $paymentInfo['data']['status'] ?? null;
    
    error_log("🔍 [LIVE-CHECK] Comparação de status:");
    error_log("🔍 [LIVE-CHECK] - Banco: $dbStatus");
    error_log("🔍 [LIVE-CHECK] - API MP: $currentStatus");
    
    if ($currentStatus && $paymentInfo['success'] && $currentStatus !== $dbStatus) {
        error_log("🔍 [LIVE-CHECK] 🔄 Status mudou! Atualizando banco...");
        
        // Atualizar status no banco
        $updateResult = $mpService->updatePixPaymentStatus($paymentId, $apiData);
        
        error_log("🔍 [LIVE-CHECK] Update Result: " . json_encode($updateResult));
        
        if ($updateResult['success']) {
            error_log("🔍 [LIVE-CHECK] ✅ Banco atualizado com sucesso");
            
            if ($updateResult['status'] === 'approved' && $updateResult['credited']) {
                error_log("🔍 [LIVE-CHECK] 💰 Saldo creditado ao usuário");
            }
        } else {
            error_log("🔍 [LIVE-CHECK] ⚠️ Erro ao atualizar banco: " . ($updateResult['error'] ?? 'N/A'));
        }
    } else {
        error_log("🔍 [LIVE-CHECK] ℹ️ Status não mudou, nenhuma atualização necessária");
    }
    
    // Preparar resposta com dados completos
    $responseData = [
        'payment_id' => $apiData['id'] ?? $paymentId,
        'status' => $apiData['status'] ?? 'unknown',
        'status_detail' => $apiData['status_detail'] ?? null,
        'transaction_amount' => $apiData['transaction_amount'] ?? 0,
        'payment_type_id' => $apiData['payment_type_id'] ?? null,
        'payment_method_id' => $apiData['payment_method_id'] ?? null,
        'date_created' => $apiData['date_created'] ?? null,
        'date_approved' => $apiData['date_approved'] ?? null,
        'date_last_updated' => $apiData['date_last_updated'] ?? null,
        'payer' => $apiData['payer'] ?? null,
        'external_reference' => $apiData['external_reference'] ?? null,
        'live_check_timestamp' => date('Y-m-d H:i:s'),
        'db_updated' => ($currentStatus !== $dbStatus)
    ];
    
    error_log("🔍 [LIVE-CHECK] ✅ Verificação concluída com sucesso");
    error_log("🔍 [LIVE-CHECK] ========================================");
    
    Response::success($responseData, 'Status verificado em tempo real');
    
} catch (Exception $e) {
    error_log("🔍 [LIVE-CHECK] ❌ Erro na verificação: " . $e->getMessage());
    error_log("🔍 [LIVE-CHECK] Stack trace: " . $e->getTraceAsString());
    Response::error('Erro ao verificar status do pagamento', 500);
}
