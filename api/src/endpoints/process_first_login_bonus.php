<?php
// api/src/endpoints/process_first_login_bonus.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ReferralTransactionService.php';
require_once __DIR__ . '/../services/BonusConfigService.php';

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
    
    error_log("FIRST_LOGIN_BONUS: Processando para usuário ID: {$userId}");
    
    // Buscar se o usuário foi indicado e ainda não recebeu o bônus
    $referralQuery = "SELECT indicador_id, id, first_login_bonus_processed 
                     FROM indicacoes 
                     WHERE indicado_id = ? AND status = 'ativo' AND first_login_bonus_processed = 0
                     LIMIT 1";
    
    $referralStmt = $db->prepare($referralQuery);
    $referralStmt->execute([$userId]);
    $referral = $referralStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$referral) {
        error_log("FIRST_LOGIN_BONUS: Nenhuma indicação pendente encontrada para usuário {$userId}");
        Response::success(['processed' => false], 'Nenhuma indicação pendente para processamento');
        exit;
    }
    
    $referrerId = $referral['indicador_id'];
    error_log("FIRST_LOGIN_BONUS: Indicação encontrada - Indicador: {$referrerId}");
    
    // Obter valor do bônus dinamicamente
    $bonusConfigService = BonusConfigService::getInstance();
    $bonusAmount = $bonusConfigService->getBonusAmount();
    
    // Processar bônus de primeiro login
    $referralTransactionService = new ReferralTransactionService($db);
    $result = $referralTransactionService->processFirstLoginBonus($userId, $referrerId, $bonusAmount);
    
    if ($result['success']) {
        error_log("FIRST_LOGIN_BONUS: Bônus processado com sucesso");
        Response::success([
            'processed' => true,
            'transaction_id' => $result['transaction_id'],
            'bonus_amount' => $result['bonus_amount'],
            'referrer_id' => $referrerId,
            'balance_after' => $result['balance_after']
        ], 'Bônus de primeiro login processado com sucesso');
    } else {
        error_log("FIRST_LOGIN_BONUS: Erro ao processar bônus: " . $result['message']);
        Response::error('Erro ao processar bônus: ' . $result['message'], 500);
    }
    
} catch (Exception $e) {
    error_log("FIRST_LOGIN_BONUS ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}