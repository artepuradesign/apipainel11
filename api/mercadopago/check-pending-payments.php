<?php
/**
 * Verifica pagamentos PIX pendentes e atualiza status automaticamente
 * Este endpoint deve ser chamado periodicamente (via cron ou polling)
 */

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/services/MercadoPagoService.php';
require_once __DIR__ . '/../config/conexao.php';

CorsMiddleware::handle();

error_log("🔄 [CHECK-PENDING] ========================================");
error_log("🔄 [CHECK-PENDING] Verificando pagamentos pendentes");
error_log("🔄 [CHECK-PENDING] Timestamp: " . date('Y-m-d H:i:s'));

try {
    $db = getDBConnection();
    $mpService = new MercadoPagoService($db);
    
    // Carregar configuração do Mercado Pago
    $config = require __DIR__ . '/../config/mercadopago.php';
    $accessToken = $config['access_token'] ?? null;
    
    if (empty($accessToken)) {
        error_log("🔄 [CHECK-PENDING] ❌ Access token não configurado");
        Response::error('Credenciais não configuradas', 500);
    }
    
    // Buscar pagamentos pendentes criados nas últimas 2 horas
    $query = "SELECT * FROM basepg_pix 
              WHERE status IN ('pending', 'in_process') 
              AND created_at > DATE_SUB(NOW(), INTERVAL 2 HOUR)
              ORDER BY created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $pendingPayments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $totalPending = count($pendingPayments);
    error_log("🔄 [CHECK-PENDING] Total de pagamentos pendentes: $totalPending");
    
    $updated = 0;
    $approved = 0;
    $rejected = 0;
    $errors = 0;
    
    foreach ($pendingPayments as $payment) {
        $paymentId = $payment['payment_id'];
        error_log("🔄 [CHECK-PENDING] Verificando payment_id: $paymentId");
        
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
        curl_close($ch);
        
        if ($httpCode !== 200) {
            error_log("🔄 [CHECK-PENDING] ❌ Erro ao buscar payment $paymentId (HTTP $httpCode)");
            $errors++;
            continue;
        }
        
        $apiData = json_decode($response, true);
        
        if (!$apiData) {
            error_log("🔄 [CHECK-PENDING] ❌ Erro ao decodificar resposta para payment $paymentId");
            $errors++;
            continue;
        }
        
        $currentStatus = $apiData['status'] ?? null;
        $dbStatus = $payment['status'];
        
        // Se o status mudou, atualizar
        if ($currentStatus && $currentStatus !== $dbStatus) {
            error_log("🔄 [CHECK-PENDING] Status mudou: $dbStatus → $currentStatus");
            
            $updateResult = $mpService->updatePixPaymentStatus($paymentId, $apiData);
            
            if ($updateResult['success']) {
                $updated++;
                
                if ($updateResult['status'] === 'approved') {
                    $approved++;
                    error_log("🔄 [CHECK-PENDING] ✅ Pagamento $paymentId APROVADO e creditado");
                } elseif ($updateResult['status'] === 'rejected') {
                    $rejected++;
                    error_log("🔄 [CHECK-PENDING] ❌ Pagamento $paymentId REJEITADO");
                }
            } else {
                $errors++;
                error_log("🔄 [CHECK-PENDING] ⚠️ Erro ao atualizar payment $paymentId");
            }
        }
    }
    
    $result = [
        'total_pending' => $totalPending,
        'updated' => $updated,
        'approved' => $approved,
        'rejected' => $rejected,
        'errors' => $errors
    ];
    
    error_log("🔄 [CHECK-PENDING] ✅ Verificação concluída: " . json_encode($result));
    error_log("🔄 [CHECK-PENDING] ========================================");
    
    Response::success($result, 'Verificação de pagamentos pendentes concluída');
    
} catch (Exception $e) {
    error_log("🔄 [CHECK-PENDING] ❌ Erro: " . $e->getMessage());
    Response::error('Erro ao verificar pagamentos pendentes', 500);
}
