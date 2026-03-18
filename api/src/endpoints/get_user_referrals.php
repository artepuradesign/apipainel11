<?php
// api/src/endpoints/get_user_referrals.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    
    // Buscar indicações do usuário (como indicador)
    $referralsQuery = "SELECT 
                        i.id,
                        i.indicado_id,
                        i.codigo,
                        i.status,
                        i.bonus_indicador,
                        i.bonus_indicado,
                        i.first_login_bonus_processed,
                        i.first_login_at,
                        i.created_at,
                        u.full_name as indicado_nome,
                        u.email as indicado_email,
                        u.created_at as indicado_cadastro
                       FROM indicacoes i
                       LEFT JOIN users u ON i.indicado_id = u.id
                       WHERE i.indicador_id = ?
                       ORDER BY i.created_at DESC
                       LIMIT 10";
    
    $stmt = $db->prepare($referralsQuery);
    $stmt->execute([$userId]);
    $referrals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Buscar estatísticas
    $statsQuery = "SELECT 
                    COUNT(*) as total_indicados,
                    COUNT(CASE WHEN first_login_bonus_processed = 1 THEN 1 END) as indicados_ativos,
                    SUM(CASE WHEN first_login_bonus_processed = 1 THEN bonus_indicador ELSE 0 END) as total_bonus
                   FROM indicacoes 
                   WHERE indicador_id = ?";
    
    $stmt = $db->prepare($statsQuery);
    $stmt->execute([$userId]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    Response::success([
        'referrals' => $referrals,
        'stats' => [
            'total_indicados' => (int)$stats['total_indicados'],
            'indicados_ativos' => (int)$stats['indicados_ativos'],
            'total_bonus' => (float)($stats['total_bonus'] ?? 0)
        ]
    ], 'Dados de indicação carregados com sucesso');
    
} catch (Exception $e) {
    error_log("GET_USER_REFERRALS ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}