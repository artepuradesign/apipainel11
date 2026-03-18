<?php
// src/endpoints/referral-test.php

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
require_once __DIR__ . '/../services/ReferralTransactionService.php';

try {
    $db = getDBConnection();
    
    $referralService = new ReferralTransactionService($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    
    if ($method === 'GET') {
        // Testar configurações e estatísticas gerais
        $configs = $referralService->getReferralConfig();
        
        // Buscar algumas estatísticas gerais
        $totalIndicacoesQuery = "SELECT COUNT(*) as total FROM indicacoes WHERE status = 'ativo'";
        $stmt = $db->prepare($totalIndicacoesQuery);
        $stmt->execute();
        $totalIndicacoes = $stmt->fetch()['total'];
        
        $totalBonusQuery = "SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'indicacao'";
        $stmt = $db->prepare($totalBonusQuery);
        $stmt->execute();
        $totalBonus = $stmt->fetch()['total'] ?? 0;
        
        Response::success([
            'sistema_indicacao' => 'Funcionando',
            'configuracoes' => $configs,
            'estatisticas_gerais' => [
                'total_indicacoes_ativas' => (int)$totalIndicacoes,
                'total_bonus_pagos' => (float)$totalBonus
            ],
            'endpoints_disponiveis' => [
                'POST /referral-test {"codigo": "CODIGO123"}' => 'Validar código',
                'POST /referral-test {"user_id": 123}' => 'Ver estatísticas do usuário',
                'POST /referral-test {"test_transaction": {"indicador_id": 1, "indicado_id": 2}}' => 'Testar transação (cuidado!)'
            ]
        ], 'Sistema de Indicação - Status');
        
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['codigo'])) {
            // Validar código de indicação
            $result = $referralService->validateReferralCode($input['codigo']);
            Response::success($result, 'Validação de Código');
            
        } elseif (isset($input['user_id'])) {
            // Ver estatísticas do usuário
            $result = $referralService->getReferralStats($input['user_id']);
            Response::success($result, 'Estatísticas do Usuário');
            
        } elseif (isset($input['test_transaction'])) {
            // CUIDADO: Apenas para testes em desenvolvimento
            if (APP_ENV !== 'production') {
                $test = $input['test_transaction'];
                $result = $referralService->processRegistrationBonus(
                    $test['indicador_id'],
                    $test['indicado_id'],
                    'TEST_CODE'
                );
                Response::success($result, 'Teste de Transação');
            } else {
                Response::error('Teste de transação não permitido em produção', 403);
            }
            
        } else {
            Response::error('Parâmetros inválidos', 400);
        }
        
    } else {
        Response::error('Método não permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_TEST ERROR: " . $e->getMessage());
    Response::error('Erro interno: ' . $e->getMessage(), 500);
}
?>