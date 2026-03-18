<?php
/**
 * Endpoint: /pix-payments
 * Lista e gerencia pagamentos PIX da tabela basepg_pix
 */

error_log("🟢 PIX_PAYMENTS.PHP: Arquivo carregado!");
error_log("🟢 PIX_PAYMENTS.PHP: REQUEST_METHOD=" . $_SERVER['REQUEST_METHOD']);
error_log("🟢 PIX_PAYMENTS.PHP: REQUEST_URI=" . $_SERVER['REQUEST_URI']);

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("🟢 PIX_PAYMENTS.PHP: Respondendo OPTIONS");
    http_response_code(200);
    exit;
}

error_log("🟢 PIX_PAYMENTS.PHP: Carregando conexão...");
require_once __DIR__ . '/config/conexao.php';
error_log("🟢 PIX_PAYMENTS.PHP: Conexão carregada!");

// Conectar ao banco
try {
    $db = getDBConnection();
    error_log("✅ PIX_PAYMENTS: Conexão estabelecida com sucesso");
} catch (Exception $e) {
    error_log("❌ PIX_PAYMENTS: Erro de conexão: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com banco de dados',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
error_log("🔵 PIX_PAYMENTS: ========================================");
error_log("🔵 PIX_PAYMENTS: Método: {$method}");
error_log("🔵 PIX_PAYMENTS: URI: {$requestUri}");
error_log("🔵 PIX_PAYMENTS: ========================================");

// GET - Listar pagamentos PIX
if ($method === 'GET') {
    try {
        $userId = $_GET['user_id'] ?? null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        if (!$userId) {
            error_log("⚠️ PIX_PAYMENTS: user_id não fornecido");
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'user_id é obrigatório',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit;
        }
        
        error_log("🔍 PIX_PAYMENTS: Buscando pagamentos para user_id={$userId}, page={$page}, limit={$limit}");
        
        // Contar total de pagamentos
        $countStmt = $db->prepare("SELECT COUNT(*) as total FROM basepg_pix WHERE user_id = ?");
        $countStmt->execute([$userId]);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        error_log("📊 PIX_PAYMENTS: Total de pagamentos encontrados: {$total}");
        
        // Buscar pagamentos com paginação
        $query = "SELECT 
                    id,
                    user_id,
                    payment_id,
                    amount,
                    description,
                    external_reference,
                    qr_code,
                    qr_code_base64,
                    transaction_id,
                    status,
                    status_detail,
                    payer_email,
                    payer_identification_type,
                    payer_identification_number,
                    expires_at,
                    approved_at,
                    last_webhook_at,
                    created_at,
                    updated_at
                  FROM basepg_pix 
                  WHERE user_id = ? 
                  ORDER BY created_at DESC 
                  LIMIT ? OFFSET ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("📦 PIX_PAYMENTS: Retornando " . count($payments) . " pagamentos");
        
        // Formatar datas e valores
        foreach ($payments as &$payment) {
            $payment['amount'] = (float)$payment['amount'];
            $payment['amount_formatted'] = 'R$ ' . number_format($payment['amount'], 2, ',', '.');
            
            // Traduzir status
            $statusMap = [
                'pending' => 'Pendente',
                'approved' => 'Aprovado',
                'rejected' => 'Rejeitado',
                'cancelled' => 'Cancelado',
                'expired' => 'Expirado',
                'in_process' => 'Em Processamento'
            ];
            $payment['status_label'] = $statusMap[$payment['status']] ?? $payment['status'];
        }
        
        error_log("✅ PIX_PAYMENTS: Enviando resposta com sucesso");
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Pagamentos listados com sucesso',
            'data' => [
                'payments' => $payments,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => (int)$total,
                    'total_pages' => ceil($total / $limit)
                ]
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("❌ PIX_PAYMENTS ERROR: " . $e->getMessage());
        error_log("❌ PIX_PAYMENTS TRACE: " . $e->getTraceAsString());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao buscar pagamentos: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// DELETE - Deletar pagamento PIX
if ($method === 'DELETE') {
    try {
        // Pegar o ID do pagamento da URL
        $uri = $_SERVER['REQUEST_URI'];
        preg_match('/\/pix-payments\/(\d+)/', $uri, $matches);
        $paymentId = $matches[1] ?? null;
        
        if (!$paymentId) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'ID do pagamento é obrigatório',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit;
        }
        
        error_log("🗑️ PIX_PAYMENTS: Deletando pagamento ID: {$paymentId}");
        
        // Verificar se o pagamento existe
        $checkStmt = $db->prepare("SELECT id FROM basepg_pix WHERE id = ?");
        $checkStmt->execute([$paymentId]);
        $exists = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$exists) {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'message' => 'Pagamento não encontrado',
                'timestamp' => date('Y-m-d H:i:s')
            ]);
            exit;
        }
        
        // Deletar o pagamento
        $deleteStmt = $db->prepare("DELETE FROM basepg_pix WHERE id = ?");
        $deleteStmt->execute([$paymentId]);
        
        error_log("✅ PIX_PAYMENTS: Pagamento deletado com sucesso");
        
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Pagamento deletado com sucesso',
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("❌ PIX_PAYMENTS DELETE ERROR: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao deletar pagamento: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

// Método não permitido
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Método não permitido',
    'timestamp' => date('Y-m-d H:i:s')
]);
