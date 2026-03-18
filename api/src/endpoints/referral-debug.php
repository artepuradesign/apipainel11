<?php
// api/src/endpoints/referral-debug.php - Endpoint para debug do sistema de indicação

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ReferralTransactionService.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Diagnóstico geral do sistema
        
        // 1. Verificar estrutura das tabelas
        $tables = ['users', 'indicacoes', 'wallet_transactions', 'system_config'];
        $tableStatus = [];
        
        foreach ($tables as $table) {
            try {
                $query = "SHOW TABLES LIKE '{$table}'";
                $stmt = $db->prepare($query);
                $stmt->execute();
                $exists = $stmt->fetch() !== false;
                
                if ($exists) {
                    // Verificar colunas importantes
                    $columnsQuery = "SHOW COLUMNS FROM {$table}";
                    $columnsStmt = $db->prepare($columnsQuery);
                    $columnsStmt->execute();
                    $columns = $columnsStmt->fetchAll(PDO::FETCH_COLUMN);
                    
                    $tableStatus[$table] = [
                        'exists' => true,
                        'columns' => $columns
                    ];
                } else {
                    $tableStatus[$table] = ['exists' => false];
                }
            } catch (Exception $e) {
                $tableStatus[$table] = ['error' => $e->getMessage()];
            }
        }
        
        // 2. Verificar últimos usuários com código de indicação
        $usersQuery = "SELECT id, email, full_name, codigo_indicacao, indicador_id, codigo_usado_indicacao, created_at 
                       FROM users 
                       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) 
                       ORDER BY created_at DESC 
                       LIMIT 10";
        $usersStmt = $db->prepare($usersQuery);
        $usersStmt->execute();
        $recentUsers = $usersStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 3. Verificar últimas indicações
        $indicacoesQuery = "SELECT i.*, 
                           u1.full_name as indicador_nome, 
                           u2.full_name as indicado_nome 
                           FROM indicacoes i 
                           LEFT JOIN users u1 ON i.indicador_id = u1.id 
                           LEFT JOIN users u2 ON i.indicado_id = u2.id 
                           ORDER BY i.created_at DESC 
                           LIMIT 10";
        $indicacoesStmt = $db->prepare($indicacoesQuery);
        $indicacoesStmt->execute();
        $recentIndicacoes = $indicacoesStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 4. Verificar últimas transações de bônus
        $transactionsQuery = "SELECT * FROM wallet_transactions 
                             WHERE type = 'indicacao' 
                             ORDER BY created_at DESC 
                             LIMIT 10";
        $transactionsStmt = $db->prepare($transactionsQuery);
        $transactionsStmt->execute();
        $recentTransactions = $transactionsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // 5. Verificar configuração do sistema
        $configQuery = "SELECT * FROM system_config WHERE config_key = 'referral_bonus_amount'";
        $configStmt = $db->prepare($configQuery);
        $configStmt->execute();
        $config = $configStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'status' => 'Sistema de Indicação - Diagnóstico',
            'table_status' => $tableStatus,
            'recent_users' => $recentUsers,
            'recent_indicacoes' => $recentIndicacoes,
            'recent_transactions' => $recentTransactions,
            'system_config' => $config,
            'recommendations' => [
                'total_users_today' => count($recentUsers),
                'total_indicacoes_today' => count($recentIndicacoes),
                'total_bonus_transactions_today' => count($recentTransactions)
            ]
        ], 'Diagnóstico do Sistema de Indicação');
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Processar comandos específicos de debug
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (isset($input['test_referral'])) {
            // Testar processamento de indicação
            $referralCode = $input['test_referral'];
            
            // Buscar usuário pelo código
            $query = "SELECT id, full_name FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $db->prepare($query);
            $stmt->execute([$referralCode]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                Response::success([
                    'code' => $referralCode,
                    'referrer_found' => true,
                    'referrer' => $user,
                    'test_result' => 'Código válido - usuário encontrado'
                ], 'Teste de Código de Indicação');
            } else {
                Response::error('Código de indicação não encontrado: ' . $referralCode, 404);
            }
            
        } elseif (isset($input['manual_bonus'])) {
            // Processar bônus manualmente (apenas para debug)
            $userId = $input['manual_bonus']['user_id'];
            $referralCode = $input['manual_bonus']['referral_code'];
            
            $referralService = new ReferralTransactionService($db);
            
            // Buscar indicador
            $query = "SELECT id FROM users WHERE codigo_indicacao = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($referrer) {
                $result = $referralService->processRegistrationBonus($referrer['id'], $userId, $referralCode);
                
                if ($result['success']) {
                    Response::success($result, 'Bônus processado manualmente');
                } else {
                    Response::error($result['message'], 400);
                }
            } else {
                Response::error('Indicador não encontrado', 404);
            }
            
        } else {
            Response::error('Comando de debug não reconhecido', 400);
        }
        
    } else {
        Response::error('Método não permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("REFERRAL_DEBUG ERROR: " . $e->getMessage());
    Response::error('Erro interno: ' . $e->getMessage(), 500);
}