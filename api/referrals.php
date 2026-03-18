<?php
// api/referrals.php - Endpoint para dados de indicação

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'src/config/database.php';
require_once 'src/middleware/AuthMiddleware.php';

try {
    $db = getDBConnection();
    $authMiddleware = new AuthMiddleware($db);
    
    // Verificar autenticação
    $user = $authMiddleware->authenticate();
    if (!$user) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Não autorizado']);
        exit;
    }
    
    $userId = $user['id'];
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            handleGetReferrals($db, $userId);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido']);
            break;
    }
    
} catch (Exception $e) {
    error_log("REFERRALS_API ERROR: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}

function handleGetReferrals($db, $userId) {
    try {
        // Buscar indicações feitas pelo usuário - apenas tabela indicacoes
        $referralsQuery = "SELECT 
            i.id,
            i.indicado_id,
            i.codigo_usado,
            i.bonus_indicador,
            i.bonus_indicado,
            i.status,
            i.bonus_paid,
            i.bonus_paid_at,
            i.created_at,
            CONCAT('Usuário ', i.indicado_id) as indicado_nome,
            CONCAT('user', i.indicado_id, '@email.com') as indicado_email,
            i.status as indicado_status
        FROM indicacoes i
        WHERE i.indicador_id = ?
        ORDER BY i.created_at DESC";
        
        $stmt = $db->prepare($referralsQuery);
        $stmt->execute([$userId]);
        $referrals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estatísticas - apenas tabela indicacoes
        $statsQuery = "SELECT 
            COUNT(*) as total_indicados,
            COUNT(CASE WHEN i.status = 'ativo' THEN 1 END) as indicados_ativos,
            COALESCE(SUM(CASE WHEN i.bonus_paid = 1 THEN i.bonus_indicador ELSE 0 END), 0) as total_bonus,
            COALESCE(SUM(CASE WHEN MONTH(i.created_at) = MONTH(NOW()) AND YEAR(i.created_at) = YEAR(NOW()) AND i.bonus_paid = 1 THEN i.bonus_indicador ELSE 0 END), 0) as bonus_este_mes
        FROM indicacoes i
        WHERE i.indicador_id = ?";
        
        $statsStmt = $db->prepare($statsQuery);
        $statsStmt->execute([$userId]);
        $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);
        
        // Buscar código de indicação do usuário
        $userQuery = "SELECT codigo_indicacao FROM users WHERE id = ?";
        $userStmt = $db->prepare($userQuery);
        $userStmt->execute([$userId]);
        $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => 'Dados de indicação obtidos com sucesso',
            'data' => [
                'user_referral_code' => $userData['codigo_indicacao'],
                'referrals' => $referrals,
                'stats' => [
                    'total_indicados' => (int)$stats['total_indicados'],
                    'indicados_ativos' => (int)$stats['indicados_ativos'],
                    'total_bonus' => (float)$stats['total_bonus'],
                    'bonus_este_mes' => (float)$stats['bonus_este_mes']
                ]
            ],
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        
    } catch (Exception $e) {
        error_log("GET_REFERRALS ERROR: " . $e->getMessage());
        throw $e;
    }
}
?>