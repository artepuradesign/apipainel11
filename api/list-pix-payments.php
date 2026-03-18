<?php
/**
 * Lista pagamentos PIX da tabela basepg_pix
 * Endpoint: GET /list-pix-payments.php
 */

// Log de acesso
error_log("📊 [LIST_PIX] Requisição recebida - Método: " . $_SERVER['REQUEST_METHOD']);

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Apenas GET permitido
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// Incluir arquivo de conexão
require_once __DIR__ . '/config/conexao.php';

try {
    // Parâmetros
    $userId = $_GET['user_id'] ?? null;
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = ($page - 1) * $limit;
    
    if (!$userId) {
        throw new Exception('user_id é obrigatório');
    }
    
    error_log("📊 LIST_PIX: user_id={$userId}, page={$page}, limit={$limit}");
    
    // Conectar ao banco usando a função do conexao.php
    $pdo = getDBConnection();
    error_log("✅ LIST_PIX: Conectado ao banco via getDBConnection()");
    
    // Contar total
    $countStmt = $pdo->prepare("SELECT COUNT(*) as total FROM basepg_pix WHERE user_id = ?");
    $countStmt->execute([$userId]);
    $total = (int)$countStmt->fetch()['total'];
    
    error_log("📊 LIST_PIX: Total encontrado: {$total}");
    
    // Buscar pagamentos
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
                created_at,
                updated_at,
                approved_at,
                expires_at,
                last_webhook_at
              FROM basepg_pix 
              WHERE user_id = ? 
              ORDER BY created_at DESC 
              LIMIT ? OFFSET ?";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute([$userId, $limit, $offset]);
    $payments = $stmt->fetchAll();
    
    error_log("✅ LIST_PIX: Encontrados " . count($payments) . " pagamentos");
    
    // Formatar dados
    foreach ($payments as &$payment) {
        $payment['amount'] = (float)$payment['amount'];
        $payment['amount_formatted'] = 'R$ ' . number_format($payment['amount'], 2, ',', '.');
        
        // Status traduzido
        $statusMap = [
            'pending' => 'Pendente',
            'approved' => 'Aprovado',
            'rejected' => 'Rejeitado',
            'cancelled' => 'Cancelado',
            'expired' => 'Expirado'
        ];
        $payment['status_label'] = $statusMap[$payment['status']] ?? $payment['status'];
        
        // Verificar expiração
        $payment['is_expired'] = false;
        if ($payment['status'] === 'pending' && $payment['expires_at']) {
            $payment['is_expired'] = time() > strtotime($payment['expires_at']);
        }
    }
    
    // Resposta
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Pagamentos listados com sucesso',
        'data' => [
            'payments' => $payments,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    error_log("❌ LIST_PIX DB ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro no banco de dados: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    error_log("❌ LIST_PIX ERROR: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE);
}
