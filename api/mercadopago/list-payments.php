<?php
/**
 * Endpoint: GET /mercadopago/list-payments.php
 * Lista pagamentos PIX do usuário
 */

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/conexao.php';

// Conectar ao banco
try {
    $db = getDBConnection();
    error_log("✅ LIST_PAYMENTS: Conexão estabelecida com sucesso");
} catch (Exception $e) {
    error_log("❌ LIST_PAYMENTS: Erro de conexão: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com banco de dados']);
    exit;
}

// Apenas GET é permitido
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Apenas GET é permitido']);
    exit;
}

try {
    $userId = $_GET['user_id'] ?? null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;
    
    if (!$userId) {
        error_log("⚠️ LIST_PAYMENTS: user_id não fornecido");
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'user_id é obrigatório']);
        exit;
    }
    
    error_log("🔍 LIST_PAYMENTS: Buscando pagamentos para user_id={$userId}, page={$page}, limit={$limit}");
    
    // Contar total de pagamentos
    $countStmt = $db->prepare("SELECT COUNT(*) as total FROM basepg_pix WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    error_log("📊 LIST_PAYMENTS: Total de pagamentos encontrados: {$total}");
    
    // Buscar pagamentos com paginação
    $query = "SELECT 
                id,
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
    
    error_log("📦 LIST_PAYMENTS: Retornando " . count($payments) . " pagamentos");
    
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
            'in_process' => 'Em Processamento'
        ];
        $payment['status_label'] = $statusMap[$payment['status']] ?? $payment['status'];
        
        // Verificar se expirou
        if ($payment['status'] === 'pending' && $payment['expires_at']) {
            $expiryTime = strtotime($payment['expires_at']);
            $now = time();
            $payment['is_expired'] = $now > $expiryTime;
        } else {
            $payment['is_expired'] = false;
        }
    }
    
    error_log("✅ LIST_PAYMENTS: Enviando resposta com sucesso");
    
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
    error_log("❌ LIST_PAYMENTS ERROR: " . $e->getMessage());
    error_log("❌ LIST_PAYMENTS TRACE: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro ao buscar pagamentos: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
}
