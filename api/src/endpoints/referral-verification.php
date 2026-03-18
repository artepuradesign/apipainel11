<?php
// src/endpoints/referral-verification.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

try {
    $db = getDBConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id'])) {
            Response::error('user_id é obrigatório', 400);
            return;
        }
        
        $userId = (int)$input['user_id'];
        
        // Verificar dados do usuário
        $userQuery = "SELECT 
            id, email, full_name, codigo_indicacao, indicador_id, 
            codigo_usado_indicacao, saldo_plano, saldo_atualizado, 
            senha4, senha6, senha8, status
        FROM users WHERE id = ?";
        $userStmt = $db->prepare($userQuery);
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            Response::error('Usuário não encontrado', 404);
            return;
        }
        
        // Verificar carteiras
        $walletQuery = "SELECT 
            wallet_type, current_balance, available_balance, 
            total_deposited, status 
        FROM user_wallets WHERE user_id = ?";
        $walletStmt = $db->prepare($walletQuery);
        $walletStmt->execute([$userId]);
        $wallets = $walletStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Verificar transações
        $transactionQuery = "SELECT 
            amount, type, wallet_type, description, 
            reference_id, previous_balance, new_balance, 
            status, created_at
        FROM wallet_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10";
        $transactionStmt = $db->prepare($transactionQuery);
        $transactionStmt->execute([$userId]);
        $transactions = $transactionStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Verificar indicações
        $referralQuery = "SELECT 
            id, indicador_id, indicado_id, codigo_usado, 
            bonus_indicador, bonus_indicado, status, 
            bonus_paid, bonus_paid_at, created_at
        FROM indicacoes WHERE indicado_id = ? OR indicador_id = ?";
        $referralStmt = $db->prepare($referralQuery);
        $referralStmt->execute([$userId, $userId]);
        $referrals = $referralStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Análise dos dados
        $analysis = [
            'user_created' => !empty($user),
            'senhas_configuradas' => !empty($user['senha4']) && !empty($user['senha6']) && !empty($user['senha8']),
            'wallets_created' => count($wallets) >= 2,
            'has_referral' => !empty($user['indicador_id']) && !empty($user['codigo_usado_indicacao']),
            'bonus_processed' => count($referrals) > 0,
            'saldo_atualizado' => (int)$user['saldo_atualizado'] === 1,
            'saldo_plano_value' => (float)$user['saldo_plano'],
            'transactions_count' => count($transactions),
            'referrals_count' => count($referrals)
        ];
        
        // Buscar dados do indicador se existir
        $referrerData = null;
        if ($user['indicador_id']) {
            $referrerQuery = "SELECT id, full_name, email, codigo_indicacao FROM users WHERE id = ?";
            $referrerStmt = $db->prepare($referrerQuery);
            $referrerStmt->execute([$user['indicador_id']]);
            $referrerData = $referrerStmt->fetch(PDO::FETCH_ASSOC);
        }
        
        Response::success([
            'user_data' => $user,
            'wallets' => $wallets,
            'transactions' => $transactions,
            'referrals' => $referrals,
            'referrer' => $referrerData,
            'analysis' => $analysis,
            'summary' => [
                'status' => $analysis['user_created'] && $analysis['wallets_created'] ? 'OK' : 'INCOMPLETE',
                'referral_status' => $analysis['has_referral'] && $analysis['bonus_processed'] ? 'PROCESSED' : 'PENDING',
                'issues' => array_filter([
                    !$analysis['user_created'] ? 'Usuário não criado' : null,
                    !$analysis['senhas_configuradas'] ? 'Senhas não configuradas' : null,
                    !$analysis['wallets_created'] ? 'Carteiras não criadas' : null,
                    $analysis['has_referral'] && !$analysis['bonus_processed'] ? 'Indicação não processada' : null,
                    $analysis['has_referral'] && !$analysis['saldo_atualizado'] ? 'Saldo não atualizado' : null
                ])
            ]
        ], 'Verificação completa dos dados');
        
    } else {
        Response::error('Método não permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_VERIFICATION ERROR: " . $e->getMessage());
    Response::error('Erro interno: ' . $e->getMessage(), 500);
}
?>