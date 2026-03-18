<?php
// api/src/endpoints/test_user_balance.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

try {
    $db = getDBConnection();
    
    // Verificar se o usuário está logado via token
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
    
    // Buscar dados do usuário
    $userQuery = "SELECT 
                    id, full_name, email, saldo, saldo_plano,
                    created_at, codigo_indicacao
                  FROM users 
                  WHERE id = ?";
    $userStmt = $db->prepare($userQuery);
    $userStmt->execute([$userId]);
    $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
    
    // Buscar transações da carteira
    $transactionsQuery = "SELECT 
                            id, type, amount, balance_before, balance_after,
                            description, reference_type, reference_id,
                            status, created_at
                          FROM wallet_transactions 
                          WHERE user_id = ? 
                          ORDER BY created_at DESC 
                          LIMIT 10";
    $transactionStmt = $db->prepare($transactionsQuery);
    $transactionStmt->execute([$userId]);
    $transactions = $transactionStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar indicações relacionadas (como indicador)
    $referralsQuery = "SELECT 
                        i.id, i.referrer_id, i.referred_id, i.codigo, 
                        i.status, i.comissao, i.data_conversao, i.created_at,
                        u.full_name as referred_name
                       FROM indicacoes i
                       LEFT JOIN users u ON i.referred_id = u.id
                       WHERE i.referrer_id = ?
                       ORDER BY i.created_at DESC";
    $referralStmt = $db->prepare($referralsQuery);
    $referralStmt->execute([$userId]);
    $referrals = $referralStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar se foi indicado por alguém
    $wasReferredQuery = "SELECT 
                          i.id, i.referrer_id, i.codigo, i.status, 
                          i.comissao, i.created_at,
                          u.full_name as referrer_name
                         FROM indicacoes i
                         LEFT JOIN users u ON i.referrer_id = u.id
                         WHERE i.referred_id = ?";
    $wasReferredStmt = $db->prepare($wasReferredQuery);
    $wasReferredStmt->execute([$userId]);
    $wasReferred = $wasReferredStmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success([
        'user' => $userData,
        'transactions' => $transactions,
        'referrals_made' => $referrals,
        'was_referred' => $wasReferred,
        'summary' => [
            'saldo_atual' => (float)$userData['saldo'],
            'saldo_plano_atual' => (float)$userData['saldo_plano'],
            'total_transactions' => count($transactions),
            'total_referrals_made' => count($referrals),
            'was_referred_by' => $wasReferred ? $wasReferred['referrer_name'] : null
        ]
    ], 'Dados de saldo carregados com sucesso');
    
} catch (Exception $e) {
    error_log("TEST_USER_BALANCE ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}