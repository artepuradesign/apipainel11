<?php
// src/endpoints/auth.php

require_once __DIR__ . '/../models/Referral.php';
require_once __DIR__ . '/../services/ReferralConfigService.php';
require_once __DIR__ . '/../services/UserReferralService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/auth.php';

function handleAuthReferrals($db, $method, $path) {
    if ($method === 'GET' && $path === '/auth/referrals') {
        getUserReferrals($db);
    } else {
        Response::error('Endpoint de autenticação não encontrado: ' . $path, 404);
    }
}

function getUserReferrals($db) {
    try {
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        error_log("AUTH_REFERRALS: Buscando referrals para usuário {$userId}");
        
        // Usar o novo serviço que busca da tabela users
        $userReferralService = new UserReferralService($db);
        
        // Tentar migrar dados da tabela users para indicacoes se necessário
        $userReferralService->migrateUsersToIndicacoes();
        
        // Buscar indicações do usuário (da tabela users)
        $referrals = $userReferralService->getUserReferralsFromUsers($userId);
        
        // Buscar estatísticas
        $stats = $userReferralService->getReferralStats($userId);
        
        error_log("AUTH_REFERRALS: Encontrados " . count($referrals) . " referrals");
        error_log("AUTH_REFERRALS: Stats: " . json_encode($stats));
        
        Response::success([
            'stats' => $stats,
            'referrals' => $referrals
        ]);
        
    } catch (Exception $e) {
        error_log("AUTH_REFERRALS ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}