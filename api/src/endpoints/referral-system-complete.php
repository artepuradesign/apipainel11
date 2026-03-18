<?php
// api/src/endpoints/referral-system-complete.php
// Endpoint completo e unificado para o sistema de indicação

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/WalletService.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../services/ConfigService.php';

try {
    $db = getDBConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    
    // Log da requisição
    error_log("REFERRAL_SYSTEM_COMPLETE: {$method} {$pathInfo}");
    
    // Roteamento baseado no PATH_INFO
    switch ($pathInfo) {
        case '/validate-code':
            if ($method === 'POST') {
                validateReferralCode($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        case '/process-registration-bonus':
            if ($method === 'POST') {
                processRegistrationBonus($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        case '/user-data':
            if ($method === 'GET') {
                getUserReferralData($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        case '/transactions':
            if ($method === 'GET') {
                getWalletTransactions($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        case '/balance':
            if ($method === 'GET') {
                getWalletBalance($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        case '/config':
            if ($method === 'GET') {
                getReferralConfig($db);
            } else {
                Response::error('Método não permitido', 405);
            }
            break;
            
        default:
            Response::error('Endpoint não encontrado', 404);
            break;
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_SYSTEM_COMPLETE ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}

/**
 * Validar código de indicação
 */
function validateReferralCode($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['code']) || empty($input['code'])) {
            Response::error('Código de indicação é obrigatório', 400);
            return;
        }
        
        $code = trim($input['code']);
        error_log("VALIDATE_CODE: Validando código {$code}");
        
        // Buscar usuário pelo código
        $query = "SELECT id, full_name, email FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
        $stmt = $db->prepare($query);
        $stmt->execute([$code]);
        $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($referrer) {
            error_log("VALIDATE_CODE: Código válido - Usuário: {$referrer['id']} ({$referrer['full_name']})");
            
            Response::success([
                'valid' => true,
                'referrer_id' => (int)$referrer['id'],
                'referrer_name' => $referrer['full_name'],
                'referrer_email' => $referrer['email'],
                'code' => $code
            ], 'Código de indicação válido');
        } else {
            error_log("VALIDATE_CODE: Código inválido: {$code}");
            Response::error('Código de indicação inválido', 404);
        }
        
    } catch (Exception $e) {
        error_log("VALIDATE_CODE ERROR: " . $e->getMessage());
        Response::error('Erro ao validar código: ' . $e->getMessage(), 500);
    }
}

/**
 * Processar bônus de indicação no cadastro
 */
function processRegistrationBonus($db) {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['referral_code'])) {
            Response::error('user_id e referral_code são obrigatórios', 400);
            return;
        }
        
        $userId = (int)$input['user_id'];
        $referralCode = trim($input['referral_code']);
        
        error_log("PROCESS_BONUS: === PROCESSANDO BÔNUS ===");
        error_log("PROCESS_BONUS: Usuário: {$userId}, Código: {$referralCode}");
        
        // Verificar se o código é válido
        $referrerQuery = "SELECT id, full_name FROM users WHERE codigo_indicacao = ? AND status = 'ativo' AND id != ?";
        $stmt = $db->prepare($referrerQuery);
        $stmt->execute([$referralCode, $userId]);
        $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$referrer) {
            error_log("PROCESS_BONUS: Código inválido ou usuário inativo");
            Response::error('Código de indicação inválido', 404);
            return;
        }
        
        $referrerId = $referrer['id'];
        error_log("PROCESS_BONUS: Indicador: {$referrerId} ({$referrer['full_name']})");
        
        // Verificar se já existe indicação
        $existingQuery = "SELECT id FROM indicacoes WHERE indicado_id = ? LIMIT 1";
        $stmt = $db->prepare($existingQuery);
        $stmt->execute([$userId]);
        
        if ($stmt->fetch()) {
            error_log("PROCESS_BONUS: Indicação já existe");
            Response::error('Usuário já possui indicação processada', 409);
            return;
        }
        
        // Atualizar código usado
        $updateUserQuery = "UPDATE users SET codigo_usado_indicacao = ? WHERE id = ?";
        $stmt = $db->prepare($updateUserQuery);
        $stmt->execute([$referralCode, $userId]);
        
        
        // Buscar valor do bônus do arquivo bonus.php
        require_once __DIR__ . '/../services/BonusConfigService.php';
        require_once __DIR__ . '/../services/ReferralTransactionService.php';
        
        $bonusConfigService = BonusConfigService::getInstance();
        $bonusAmount = $bonusConfigService->getBonusAmount();
        error_log("REFERRAL_ENDPOINT: Valor do bônus do bonus.php: R$ {$bonusAmount}");
        
        // Usar ReferralTransactionService em vez da procedure
        $referralTransactionService = new ReferralTransactionService($db);
        $result = $referralTransactionService->processRegistrationBonus($referrerId, $userId, $referralCode);
        
        if ($result['success']) {
            error_log("PROCESS_BONUS: === SUCESSO ===");
            error_log("PROCESS_BONUS: Indicador ID: {$referrerId}, Indicado ID: {$userId}");
            error_log("PROCESS_BONUS: Bônus: R$ {$bonusAmount}");
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'bonus_processed' => true,
                'bonus_amount' => $bonusAmount,
                'referrer_bonus' => $bonusAmount,
                'referred_bonus' => $bonusAmount,
                'referrer_id' => $referrerId,
                'referred_id' => $userId,
                'message' => 'Bônus processado com sucesso!',
                'transaction_details' => $result,
                'timestamp' => date('Y-m-d H:i:s')
            ]);
        } else {
            error_log("PROCESS_BONUS: Erro: " . $result['message']);
            throw new Exception($result['message'] ?? 'Erro desconhecido no processamento do bônus');
        }
        
    } catch (Exception $e) {
        error_log("PROCESS_BONUS ERROR: " . $e->getMessage());
        Response::error('Erro ao processar bônus: ' . $e->getMessage(), 500);
    }
}

/**
 * Buscar dados de indicação do usuário
 */
function getUserReferralData($db) {
    try {
        // Verificar token
        $userId = getUserIdFromToken($db);
        if (!$userId) {
            Response::error('Token inválido ou expirado', 401);
            return;
        }
        
        error_log("GET_USER_DATA: Buscando dados para usuário {$userId}");
        
        // Buscar indicações
        $referralsQuery = "SELECT 
            i.id,
            i.indicado_id,
            i.codigo,
            i.bonus_indicador,
            i.bonus_indicado,
            i.status,
            i.first_login_bonus_processed,
            i.created_at,
            u.full_name as indicado_nome,
            u.email as indicado_email
        FROM indicacoes i
        LEFT JOIN users u ON i.indicado_id = u.id
        WHERE i.indicador_id = ?
        ORDER BY i.created_at DESC
        LIMIT 50";
        
        $stmt = $db->prepare($referralsQuery);
        $stmt->execute([$userId]);
        $referrals = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular estatísticas
        $statsQuery = "SELECT 
            COUNT(*) as total_indicados,
            COUNT(CASE WHEN first_login_bonus_processed = 1 THEN 1 END) as indicados_ativos,
            SUM(CASE WHEN first_login_bonus_processed = 1 THEN bonus_indicador ELSE 0 END) as total_bonus
        FROM indicacoes 
        WHERE indicador_id = ?";
        
        $stmt = $db->prepare($statsQuery);
        $stmt->execute([$userId]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Bônus deste mês
        $monthlyQuery = "SELECT 
            SUM(CASE WHEN first_login_bonus_processed = 1 THEN bonus_indicador ELSE 0 END) as bonus_este_mes
        FROM indicacoes 
        WHERE indicador_id = ? 
        AND MONTH(created_at) = MONTH(CURRENT_DATE())
        AND YEAR(created_at) = YEAR(CURRENT_DATE())";
        
        $stmt = $db->prepare($monthlyQuery);
        $stmt->execute([$userId]);
        $monthly = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Saldo da carteira
        $walletQuery = "SELECT current_balance FROM user_wallets WHERE user_id = ? AND wallet_type = 'plan'";
        $stmt = $db->prepare($walletQuery);
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'stats' => [
                'total_indicados' => (int)($stats['total_indicados'] ?? 0),
                'indicados_ativos' => (int)($stats['indicados_ativos'] ?? 0),
                'total_bonus' => (float)($stats['total_bonus'] ?? 0),
                'bonus_este_mes' => (float)($monthly['bonus_este_mes'] ?? 0)
            ],
            'referrals' => $referrals,
            'wallet' => [
                'plan_balance' => (float)($wallet['current_balance'] ?? 0),
                'wallet_balance' => 0
            ]
        ], 'Dados carregados com sucesso');
        
    } catch (Exception $e) {
        error_log("GET_USER_DATA ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar dados: ' . $e->getMessage(), 500);
    }
}

/**
 * Buscar transações da carteira
 */
function getWalletTransactions($db) {
    try {
        $userId = getUserIdFromToken($db);
        if (!$userId) {
            Response::error('Token inválido ou expirado', 401);
            return;
        }
        
        $limit = (int)($_GET['limit'] ?? 50);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $query = "SELECT * FROM wallet_transactions 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        Response::success($transactions, 'Transações carregadas');
        
    } catch (Exception $e) {
        error_log("GET_TRANSACTIONS ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar transações: ' . $e->getMessage(), 500);
    }
}

/**
 * Buscar saldo da carteira
 */
function getWalletBalance($db) {
    try {
        $userId = getUserIdFromToken($db);
        if (!$userId) {
            Response::error('Token inválido ou expirado', 401);
            return;
        }
        
        $query = "SELECT current_balance FROM user_wallets WHERE user_id = ? AND wallet_type = 'plan'";
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $wallet = $stmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'plan_balance' => (float)($wallet['current_balance'] ?? 0),
            'wallet_balance' => 0
        ], 'Saldo carregado');
        
    } catch (Exception $e) {
        error_log("GET_BALANCE ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar saldo: ' . $e->getMessage(), 500);
    }
}

/**
 * Buscar configurações do sistema
 */
function getReferralConfig($db) {
    try {
        $query = "SELECT config_key, config_value FROM system_config 
                 WHERE config_key LIKE 'referral_%' AND status = 'active'";
        $stmt = $db->prepare($query);
        $stmt->execute();
        $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $configData = [
            'referral_system_enabled' => true,
            'referral_bonus_enabled' => true,
            'referral_commission_enabled' => true,
            'referral_bonus_amount' => 5.00,
            'referral_commission_percentage' => 5.0
        ];
        
        foreach ($configs as $config) {
            $key = $config['config_key'];
            $value = $config['config_value'];
            
            if (in_array($key, ['referral_system_enabled', 'referral_bonus_enabled', 'referral_commission_enabled'])) {
                $configData[$key] = ($value === 'true' || $value === '1');
            } else {
                $configData[$key] = (float)$value;
            }
        }
        
        Response::success($configData, 'Configurações carregadas');
        
    } catch (Exception $e) {
        error_log("GET_CONFIG ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar configurações: ' . $e->getMessage(), 500);
    }
}

/**
 * Obter ID do usuário do token
 */
function getUserIdFromToken($db) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }
    
    $token = substr($authHeader, 7);
    
    $query = "SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > NOW() AND status = 'active'";
    $stmt = $db->prepare($query);
    $stmt->execute([$token]);
    $session = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $session ? $session['user_id'] : null;
}
?>