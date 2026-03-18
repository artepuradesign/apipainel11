<?php
// api/src/endpoints/wallet/transaction-history.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../middleware/AuthMiddleware.php';

try {
    $db = getDBConnection();
    
    // Verificar autenticação
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        Response::error('Token de autorização necessário', 401);
        exit;
    }
    
    $token = substr($authHeader, 7);
    
    // Verificar token válido
    $query = "SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW() AND status = 'active'";
    $stmt = $db->prepare($query);
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$session) {
        Response::error('Token inválido ou expirado', 401);
        exit;
    }
    
    $userId = $session['user_id'];
    $limit = $_GET['limit'] ?? 50;
    $offset = $_GET['offset'] ?? 0;
    $type = $_GET['type'] ?? null;
    $walletType = $_GET['wallet_type'] ?? null;
    
    // Construir query para buscar transações com informações detalhadas
    $query = "SELECT 
                wt.id,
                wt.user_id,
                wt.wallet_type,
                wt.type,
                wt.amount,
                wt.balance_before,
                wt.balance_after,
                wt.description,
                wt.reference_type,
                wt.reference_id,
                wt.payment_method,
                wt.status,
                wt.created_at,
                wt.updated_at,
                -- Informações de indicação se aplicável
                CASE 
                    WHEN wt.type = 'indicacao' AND wt.reference_type = 'referral_registration' THEN
                        (SELECT u.full_name FROM users u WHERE u.id = wt.reference_id)
                    ELSE NULL
                END as referral_user_name,
                -- Informações adicionais se necessário
                CASE
                    WHEN wt.reference_type = 'first_login_bonus' THEN 'Bônus de Primeiro Login'
                    WHEN wt.reference_type = 'referral_registration' THEN 'Bônus de Indicação'
                    WHEN wt.type = 'indicacao' THEN 'Sistema de Indicações'
                    ELSE wt.description
                END as formatted_description
              FROM wallet_transactions wt
              WHERE wt.user_id = ?";
    
    $params = [$userId];
    
    if ($type) {
        $query .= " AND wt.type = ?";
        $params[] = $type;
    }
    
    if ($walletType) {
        $query .= " AND wt.wallet_type = ?";
        $params[] = $walletType;
    }
    
    $query .= " ORDER BY wt.created_at DESC LIMIT ? OFFSET ?";
    $params[] = (int)$limit;
    $params[] = (int)$offset;
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar também informações de saldo atual
    $balanceQuery = "SELECT 
                        saldo as main_balance,
                        saldo_plano as plan_balance,
                        (saldo + saldo_plano) as total_balance
                     FROM users WHERE id = ?";
    $balanceStmt = $db->prepare($balanceQuery);
    $balanceStmt->execute([$userId]);
    $balanceInfo = $balanceStmt->fetch(PDO::FETCH_ASSOC);
    
    // Formatear dados das transações
    $formattedTransactions = array_map(function($transaction) {
        return [
            'id' => (int)$transaction['id'],
            'user_id' => (int)$transaction['user_id'],
            'wallet_type' => $transaction['wallet_type'],
            'type' => $transaction['type'],
            'amount' => (float)$transaction['amount'],
            'balance_before' => (float)$transaction['balance_before'],
            'balance_after' => (float)$transaction['balance_after'],
            'description' => $transaction['formatted_description'] ?: $transaction['description'],
            'original_description' => $transaction['description'],
            'reference_type' => $transaction['reference_type'],
            'reference_id' => $transaction['reference_id'],
            'referral_user_name' => $transaction['referral_user_name'],
            'payment_method' => $transaction['payment_method'],
            'status' => $transaction['status'],
            'created_at' => $transaction['created_at'],
            'updated_at' => $transaction['updated_at'],
            // Campo adicional para facilitar exibição no frontend
            'is_referral_bonus' => in_array($transaction['type'], ['indicacao']) || 
                                   in_array($transaction['reference_type'], ['referral_registration', 'first_login_bonus']),
            'transaction_display_type' => $transaction['type'] === 'indicacao' ? 'Bônus de Indicação' : 
                                         ucfirst($transaction['type'])
        ];
    }, $transactions);
    
    // Estatísticas rápidas
    $statsQuery = "SELECT 
                    COUNT(*) as total_transactions,
                    SUM(CASE WHEN type = 'indicacao' THEN amount ELSE 0 END) as total_referral_bonus,
                    SUM(CASE WHEN type = 'recarga' THEN amount ELSE 0 END) as total_recharges,
                    SUM(CASE WHEN type IN ('consulta', 'plano', 'saque') THEN amount ELSE 0 END) as total_spent
                   FROM wallet_transactions WHERE user_id = ?";
    $statsStmt = $db->prepare($statsQuery);
    $statsStmt->execute([$userId]);
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success([
        'transactions' => $formattedTransactions,
        'pagination' => [
            'limit' => (int)$limit,
            'offset' => (int)$offset,
            'total' => (int)$stats['total_transactions']
        ],
        'balance_info' => [
            'main_balance' => (float)($balanceInfo['main_balance'] ?? 0),
            'plan_balance' => (float)($balanceInfo['plan_balance'] ?? 0),
            'total_balance' => (float)($balanceInfo['total_balance'] ?? 0)
        ],
        'stats' => [
            'total_transactions' => (int)$stats['total_transactions'],
            'total_referral_bonus' => (float)($stats['total_referral_bonus'] ?? 0),
            'total_recharges' => (float)($stats['total_recharges'] ?? 0),
            'total_spent' => (float)($stats['total_spent'] ?? 0)
        ]
    ], 'Histórico de transações carregado com sucesso');
    
} catch (Exception $e) {
    error_log("TRANSACTION_HISTORY ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}