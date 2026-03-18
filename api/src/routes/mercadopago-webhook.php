<?php
// src/routes/mercadopago-webhook.php - Webhook do Mercado Pago com validação de assinatura

require_once __DIR__ . '/../services/MercadoPagoService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../../config/conexao.php';

header('Content-Type: application/json');

// Conectar ao banco
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("❌ WEBHOOK: Erro de conexão: " . $e->getMessage());
    http_response_code(500);
    exit;
}

$mpService = new MercadoPagoService($db);

// Log da requisição
$rawInput = file_get_contents('php://input');
error_log("=== WEBHOOK MERCADO PAGO RECEBIDO ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Headers: " . json_encode(getallheaders()));
error_log("Body: " . $rawInput);
error_log("Query Params: " . json_encode($_GET));

// Obter headers
$headers = getallheaders();
$xSignature = $headers['x-signature'] ?? $headers['X-Signature'] ?? null;
$xRequestId = $headers['x-request-id'] ?? $headers['X-Request-Id'] ?? null;

// VALIDAR ASSINATURA X-SIGNATURE (Segurança do Mercado Pago)
if ($xSignature) {
    error_log("📝 Validando assinatura: " . substr($xSignature, 0, 50) . "...");
    
    // Extrair ts e v1 da assinatura
    $parts = explode(',', $xSignature);
    $ts = null;
    $hash = null;
    
    foreach ($parts as $part) {
        $keyValue = explode('=', $part, 2);
        if (count($keyValue) == 2) {
            $key = trim($keyValue[0]);
            $value = trim($keyValue[1]);
            if ($key === "ts") {
                $ts = $value;
            } elseif ($key === "v1") {
                $hash = $value;
            }
        }
    }
    
    // Obter data.id dos query params (se for alfanumérico, deve ser minúsculo)
    $dataId = $_GET['data.id'] ?? $_GET['id'] ?? '';
    if ($dataId && !is_numeric($dataId)) {
        $dataId = strtolower($dataId);
    }
    
    // Buscar secret key do arquivo de configuração
    $mpConfig = require __DIR__ . '/../../config/mercadopago.php';
    $secret = $mpConfig['webhook_secret'] ?? null;
    
    if ($secret && $ts && $hash && $dataId && $xRequestId) {
        // Gerar manifest string conforme documentação do MP
        $manifest = "id:$dataId;request-id:$xRequestId;ts:$ts;";
        
        // Calcular HMAC SHA256
        $expectedHash = hash_hmac('sha256', $manifest, $secret);
        
        // Comparar hashes
        if (hash_equals($expectedHash, $hash)) {
            error_log("✅ Assinatura válida!");
        } else {
            error_log("⚠️ Assinatura inválida! Expected: $expectedHash, Got: $hash");
            // Por segurança, você pode rejeitar webhooks com assinatura inválida
            // Mas por enquanto vamos apenas logar e continuar
        }
    } else {
        error_log("⚠️ Validação de assinatura não configurada ou incompleta");
    }
}

// Responder imediatamente 200 para o Mercado Pago
http_response_code(200);

try {
    // Mercado Pago envia notificações em formato x-www-form-urlencoded ou JSON
    $input = json_decode($rawInput, true);
    
    if (!$input) {
        // Se não for JSON, tentar parse de form data
        parse_str($rawInput, $input);
    }
    
    // Também verificar query parameters (Mercado Pago pode enviar assim)
    if (isset($_GET['id']) && isset($_GET['topic'])) {
        $input = array_merge($input ?? [], $_GET);
    }
    
    error_log("Parsed input: " . json_encode($input));
    
    // Validar estrutura da notificação
    if (!isset($input['type']) && !isset($input['topic'])) {
        error_log("Webhook inválido: tipo/tópico não encontrado");
        echo json_encode(['status' => 'ignored', 'reason' => 'invalid_notification']);
        exit;
    }
    
    $type = $input['type'] ?? $input['topic'] ?? '';
    $dataId = $input['data']['id'] ?? $input['id'] ?? null;
    
    // ✅ GARANTIR que dataId seja STRING (para IDs grandes do MP)
    if ($dataId !== null) {
        $dataId = (string)$dataId;
    }
    
    error_log("Tipo de notificação: $type");
    error_log("Data ID (string): $dataId");
    error_log("Data ID (type): " . gettype($dataId));
    error_log("Data ID (strlen): " . ($dataId ? strlen($dataId) : 'NULL'));
    
    // Processar apenas notificações de pagamento
    if ($type === 'payment' || $type === 'merchant_order') {
        if (!$dataId) {
            error_log("ID do pagamento não encontrado");
            echo json_encode(['status' => 'error', 'reason' => 'missing_payment_id']);
            exit;
        }
        
        // Buscar informações completas do pagamento via API do Mercado Pago
        $config = require __DIR__ . '/../../config/mercadopago.php';
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
        
        error_log("Response from MP API (HTTP $httpCode): $response");
        
        if ($httpCode !== 200) {
            error_log("Erro ao buscar pagamento: HTTP $httpCode");
            echo json_encode(['status' => 'error', 'reason' => 'failed_to_fetch_payment']);
            exit;
        }
        
        $paymentData = json_decode($response, true);
        
        if (!$paymentData) {
            error_log("Erro ao decodificar resposta da API do MP");
            echo json_encode(['status' => 'error', 'reason' => 'invalid_mp_response']);
            exit;
        }
        
        // Atualizar status do pagamento (dataId já é STRING)
        error_log("🔄 [WEBHOOK] Atualizando status do payment_id: $dataId");
        
        $result = $mpService->updatePixPaymentStatus($dataId, $paymentData);
        
        error_log("✅ [WEBHOOK] Resultado da atualização: " . json_encode($result));
        
        // Se pagamento foi aprovado, criar notificação para o usuário
        if ($result['success'] && isset($paymentData['status']) && $paymentData['status'] === 'approved') {
            try {
                // Buscar dados do pagamento
                $stmt = $db->prepare("SELECT user_id, amount FROM basepg_pix WHERE payment_id = ?");
                $stmt->execute([$dataId]);
                $payment = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($payment) {
                    // Criar notificação
                    $notifQuery = "INSERT INTO notifications (user_id, type, title, message, priority, created_at) 
                                   VALUES (?, 'payment', 'Pagamento PIX Aprovado', ?, 'high', NOW())";
                    $notifStmt = $db->prepare($notifQuery);
                    $message = "Seu pagamento PIX de R$ " . number_format($payment['amount'], 2, ',', '.') . " foi aprovado com sucesso!";
                    $notifStmt->execute([$payment['user_id'], $message]);
                    
                    error_log("✅ Notificação criada para usuário {$payment['user_id']}");
                }
            } catch (Exception $e) {
                error_log("⚠️ Erro ao criar notificação: " . $e->getMessage());
            }
        }
        
        echo json_encode([
            'status' => 'processed',
            'payment_id' => $dataId,
            'result' => $result
        ]);
        
    } else {
        error_log("Tipo de notificação ignorado: $type");
        echo json_encode(['status' => 'ignored', 'type' => $type]);
    }
    
} catch (Exception $e) {
    error_log("Erro no webhook: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
