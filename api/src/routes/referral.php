<?php
// src/routes/referral.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../services/ReferralTransactionService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/auth.php';

$db = null;

try {
    // Conectar ao banco usando conexao.php
    $db = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remover prefixo da API se existir
    $path = preg_replace('#^/api#', '', $path);
    
    error_log("REFERRAL_ROUTES: {$method} {$path}");
    
    // Headers CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Criar instância do serviço
    $referralService = new ReferralTransactionService($db);
    
    // Roteamento
    if ($method === 'POST' && $path === '/auth/process-referral-bonus') {
        processReferralBonus($db, $referralService);
    } elseif ($method === 'POST' && $path === '/auth/process-first-login-bonus') {
        processFirstLoginBonus($db, $referralService);
    } elseif ($method === 'GET' && $path === '/auth/referrals') {
        getUserReferrals($db, $referralService);
    } else {
        Response::error('Endpoint de indicação não encontrado: ' . $path, 404);
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_ROUTES ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
// Não fechar a conexão - o pool gerencia automaticamente

/**
 * Processa bônus de indicação no cadastro
 */
function processReferralBonus($db, $referralService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (!$input || !isset($input['user_id'])) {
            Response::error('ID do usuário é obrigatório', 400);
            return;
        }
        
        $userId = $input['user_id'];
        
        // Buscar dados do usuário indicado
        $userQuery = "SELECT indicador_id, codigo_usado_indicacao FROM users WHERE id = ?";
        $userStmt = $db->prepare($userQuery);
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            Response::error('Usuário não encontrado', 404);
            return;
        }
        
        if (!$user['indicador_id'] || !$user['codigo_usado_indicacao']) {
            Response::error('Nenhuma indicação encontrada para este usuário', 400);
            return;
        }
        
        // Processar bônus
        $result = $referralService->processRegistrationBonus(
            $user['indicador_id'], 
            $userId, 
            $user['codigo_usado_indicacao']
        );
        
        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            Response::error($result['message'], 400);
        }
        
    } catch (Exception $e) {
        error_log("PROCESS_REFERRAL_BONUS ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Processa bônus de primeiro login
 */
function processFirstLoginBonus($db, $referralService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        
        // Processar bônus de primeiro login
        $result = $referralService->processFirstLoginBonus($userId);
        
        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            Response::error($result['message'], 400);
        }
        
    } catch (Exception $e) {
        error_log("PROCESS_FIRST_LOGIN_BONUS ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Busca indicações do usuário
 */
function getUserReferrals($db, $referralService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        
        // Buscar indicações
        $result = $referralService->getUserReferrals($userId);
        
        if ($result['success']) {
            Response::success($result['data']);
        } else {
            Response::error($result['message'], 400);
        }
        
    } catch (Exception $e) {
        error_log("GET_USER_REFERRALS ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}