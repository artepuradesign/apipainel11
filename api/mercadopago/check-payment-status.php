<?php
/**
 * Endpoint: GET /mercadopago/check-payment-status.php
 * Verifica o status de um pagamento PIX
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

// Apenas GET é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::methodNotAllowed('Apenas GET é permitido');
}

try {
    $paymentId = $_GET['payment_id'] ?? null;
    
    if (!$paymentId) {
        Response::error('payment_id é obrigatório', 400);
    }
    
    $mpService = new MercadoPagoService($db);
    $result = $mpService->getPixPayment($paymentId);
    
    if ($result['success']) {
        Response::success($result['data'], 'Status do pagamento obtido com sucesso');
    } else {
        Response::error($result['error'] ?? 'Pagamento não encontrado', 404);
    }
    
} catch (Exception $e) {
    error_log('Erro ao buscar status: ' . $e->getMessage());
    Response::error('Erro ao buscar status do pagamento', 500);
}
