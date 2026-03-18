<?php
/**
 * Webhook do Mercado Pago - URL: https://api.artepuradesign.com.br/mercadopago/webhook
 * Recebe notificações de pagamento e atualiza status no banco de dados
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/MercadoPagoService.php';
require_once __DIR__ . '/../src/services/NotificationService.php';
require_once __DIR__ . '/../config/conexao.php';

header('Content-Type: application/json');

// Log da requisição
$rawInput = file_get_contents('php://input');
error_log("🔔 [WEBHOOK] ========================================");
error_log("🔔 [WEBHOOK] MERCADO PAGO WEBHOOK RECEBIDO");
error_log("🔔 [WEBHOOK] Timestamp: " . date('Y-m-d H:i:s'));
error_log("🔔 [WEBHOOK] Method: " . $_SERVER['REQUEST_METHOD']);
error_log("🔔 [WEBHOOK] Headers: " . json_encode(getallheaders()));
error_log("🔔 [WEBHOOK] Body: " . $rawInput);
error_log("🔔 [WEBHOOK] Query Params: " . json_encode($_GET));

// Responder imediatamente para o Mercado Pago (200 OK)
http_response_code(200);

try {
    // Conectar ao banco
    $db = getDBConnection();
    
    // Parse do input (JSON ou form-data)
    $input = json_decode($rawInput, true);
    
    if (!$input) {
        parse_str($rawInput, $input);
    }
    
    // Também verificar query parameters
    if (isset($_GET['id']) && isset($_GET['topic'])) {
        $input = array_merge($input ?? [], $_GET);
    }
    
    error_log("🔔 [WEBHOOK] Parsed input: " . json_encode($input));
    
    // Validar estrutura da notificação
    if (!isset($input['type']) && !isset($input['topic'])) {
        error_log("🔔 [WEBHOOK] ❌ Webhook inválido: tipo/tópico não encontrado");
        echo json_encode(['status' => 'ignored', 'reason' => 'invalid_notification']);
        exit;
    }
    
    $type = $input['type'] ?? $input['topic'] ?? '';
    $action = $input['action'] ?? null;
    $dataId = $input['data']['id'] ?? $input['id'] ?? null;
    
    error_log("🔔 [WEBHOOK] Tipo: $type");
    error_log("🔔 [WEBHOOK] Ação: " . ($action ?? 'N/A'));
    error_log("🔔 [WEBHOOK] Data ID: " . ($dataId ?? 'N/A'));
    
    // Processar apenas notificações de pagamento
    if ($type === 'payment' || $type === 'merchant_order') {
        error_log("🔔 [WEBHOOK] ✅ Tipo válido para processamento");
        
        if (!$dataId) {
            error_log("🔔 [WEBHOOK] ❌ ID do pagamento não encontrado");
            echo json_encode(['status' => 'error', 'reason' => 'missing_payment_id']);
            exit;
        }
        
        error_log("🔔 [WEBHOOK] 📡 Buscando dados completos do pagamento na API do MP...");
        
        // Buscar informações completas do pagamento via API do Mercado Pago
        $config = require __DIR__ . '/../config/mercadopago.php';
        $accessToken = $config['access_token'];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.mercadopago.com/v1/payments/$dataId");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $accessToken",
            "Content-Type: application/json"
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        error_log("🔔 [WEBHOOK] Response from MP API (HTTP $httpCode)");
        error_log("🔔 [WEBHOOK] Response body: " . substr($response, 0, 500) . "...");
        
        if ($httpCode !== 200) {
            error_log("🔔 [WEBHOOK] ❌ Erro ao buscar pagamento: HTTP $httpCode");
            echo json_encode(['status' => 'error', 'reason' => 'failed_to_fetch_payment']);
            exit;
        }
        
        $paymentData = json_decode($response, true);
        
        if (!$paymentData) {
            error_log("🔔 [WEBHOOK] ❌ Erro ao decodificar resposta da API do MP");
            echo json_encode(['status' => 'error', 'reason' => 'invalid_mp_response']);
            exit;
        }
        
        error_log("🔔 [WEBHOOK] ✅ Dados do pagamento obtidos da API");
        error_log("🔔 [WEBHOOK] Status: " . ($paymentData['status'] ?? 'N/A'));
        error_log("🔔 [WEBHOOK] Status Detail: " . ($paymentData['status_detail'] ?? 'N/A'));
        error_log("🔔 [WEBHOOK] Amount: " . ($paymentData['transaction_amount'] ?? 'N/A'));
        
        // Atualizar status do pagamento no banco
        error_log("🔔 [WEBHOOK] 💾 Atualizando banco de dados...");
        $mpService = new MercadoPagoService($db);
        $result = $mpService->updatePixPaymentStatus($dataId, $paymentData);
        
        error_log("🔔 [WEBHOOK] Resultado da atualização: " . json_encode($result));
        
        // Se o pagamento foi aprovado, enviar notificação ao usuário
        if ($result['success'] && $result['status'] === 'approved') {
            error_log("🔔 [WEBHOOK] 🎉 Pagamento APROVADO!");
            
            // Buscar dados do pagamento para pegar o user_id
            $paymentInfo = $mpService->getPixPayment($dataId);
            
            if ($paymentInfo['success'] && isset($paymentInfo['data']['user_id'])) {
                $userId = $paymentInfo['data']['user_id'];
                $amount = $paymentInfo['data']['amount'];
                
                error_log("🔔 [WEBHOOK] 👤 User ID: $userId");
                error_log("🔔 [WEBHOOK] 💰 Amount: $amount");
                error_log("🔔 [WEBHOOK] 💳 Creditando saldo...");
                
                // Criar notificação de pagamento aprovado
                $notificationService = new NotificationService($db);
                $notificationService->createNotification(
                    $userId,
                    'payment',
                    'Pagamento PIX Aprovado! 🎉',
                    "Seu pagamento de R$ " . number_format($amount, 2, ',', '.') . " via PIX foi aprovado e o saldo foi creditado em sua conta.",
                    '/dashboard/pagamentos/meus-pagamentos',
                    'Ver Pagamentos',
                    'high'
                );
                
                error_log("🔔 [WEBHOOK] ✅ Notificação criada para usuário #$userId");
                
                if ($result['credited']) {
                    error_log("🔔 [WEBHOOK] ✅ Saldo creditado com sucesso");
                }
            } else {
                error_log("🔔 [WEBHOOK] ⚠️ User ID não encontrado no pagamento");
            }
        }
        
        error_log("🔔 [WEBHOOK] ✅ Webhook processado com sucesso");
        error_log("🔔 [WEBHOOK] ========================================");
        
        echo json_encode([
            'status' => 'processed',
            'payment_id' => $dataId,
            'result' => $result
        ]);
        
    } else {
        error_log("🔔 [WEBHOOK] ⚠️ Tipo de notificação ignorado: $type");
        error_log("🔔 [WEBHOOK] ========================================");
        echo json_encode(['status' => 'ignored', 'type' => $type]);
    }
    
} catch (Exception $e) {
    error_log("🔔 [WEBHOOK] ❌ ERRO no webhook: " . $e->getMessage());
    error_log("🔔 [WEBHOOK] Stack trace: " . $e->getTraceAsString());
    error_log("🔔 [WEBHOOK] ========================================");
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
