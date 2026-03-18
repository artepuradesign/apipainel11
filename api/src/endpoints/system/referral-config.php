<?php
// api/src/endpoints/system/referral-config.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../services/ReferralConfigService.php';

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
    
    $configService = new ReferralConfigService($db);
    
    try {
        $config = $configService->getReferralConfig();
        
        // Usar valor real da system_config ID 6
        $response = [
            'referral_system_enabled' => true,
            'referral_bonus_enabled' => true,
            'referral_commission_enabled' => false,
            'referral_bonus_amount' => $config['referral_bonus_amount'], // Valor real do ID 6
            'referral_commission_percentage' => $config['referral_commission_percentage']
        ];
        
        error_log("REFERRAL_ENDPOINT: Valor real do ID 6 retornado: " . $config['referral_bonus_amount']);
        Response::success($response, 'Configurações de indicação carregadas com sucesso');
        
    } catch (Exception $e) {
        error_log("REFERRAL_ENDPOINT ERROR: Falha ao buscar ID 6 - " . $e->getMessage());
        Response::error('Erro ao carregar configuração de bônus da system_config', 500);
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_CONFIG ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}