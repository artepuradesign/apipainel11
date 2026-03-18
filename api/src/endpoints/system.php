<?php
// src/endpoints/system.php

require_once __DIR__ . '/../services/ReferralConfigService.php';
require_once __DIR__ . '/../utils/Response.php';

function handleSystemEndpoints($db, $method, $path) {
    if ($method === 'GET' && $path === '/system/referral-config') {
        getReferralConfig($db);
    } else {
        Response::error('Endpoint não encontrado: ' . $path, 404);
    }
}

function getReferralConfig($db) {
    try {
        $configService = new ReferralConfigService($db);
        $config = $configService->getReferralConfig();
        
        Response::success($config);
        
    } catch (Exception $e) {
        error_log("Erro ao buscar config de referral: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}