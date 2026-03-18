
<?php
// src/controllers/DashboardAdminController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class DashboardAdminController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getStats() {
        try {
            error_log("DASHBOARD_ADMIN: Buscando estatísticas do dashboard");
            
            // Saldo em Caixa - soma ABS de todas as entradas do central_cash (incluindo negativos) + consultas realizadas
            $cashQuery = "SELECT 
                            COALESCE((SELECT SUM(ABS(amount)) FROM central_cash WHERE transaction_type IN ('recarga', 'plano', 'compra_modulo', 'entrada', 'compra_login', 'consulta')), 0) +
                            COALESCE((SELECT SUM(cost) FROM consultations WHERE status = 'completed' AND cost > 0), 0)
                          as total_cash";
            $cashStmt = $this->db->prepare($cashQuery);
            $cashStmt->execute();
            $cashResult = $cashStmt->fetch(PDO::FETCH_ASSOC);

            // Planos Comprados - soma apenas PIX, Cartão e PayPal (exclui cupom)
            $plansQuery = "SELECT COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as plan_sales 
                          FROM central_cash 
                          WHERE transaction_type = 'plano'
                          AND payment_method IN ('pix', 'credit', 'paypal')
                          AND amount > 0";
            $plansStmt = $this->db->prepare($plansQuery);
            $plansStmt->execute();
            $plansResult = $plansStmt->fetch(PDO::FETCH_ASSOC);

            // Total de Usuários
            $usersQuery = "SELECT COUNT(*) as total_users FROM users WHERE status = 'ativo'";
            $usersStmt = $this->db->prepare($usersQuery);
            $usersStmt->execute();
            $usersResult = $usersStmt->fetch(PDO::FETCH_ASSOC);

            // Indicações - contar TODAS as indicações e somar o valor total pago
            $commissionsQuery = "SELECT 
                                   COUNT(*) as total_referrals,
                                   COALESCE(SUM(amount), 0) as total_commissions_value
                                FROM wallet_transactions 
                                WHERE type = 'indicacao' 
                                AND amount > 0";
            $commissionsStmt = $this->db->prepare($commissionsQuery);
            $commissionsStmt->execute();
            $commissionsResult = $commissionsStmt->fetch(PDO::FETCH_ASSOC);

            // Total de Módulos (soma todos os módulos ativos de todos os painéis)
            $modulesQuery = "SELECT COUNT(*) as total_modules 
                           FROM modules 
                           WHERE is_active = 1 AND operational_status = 'on'";
            $modulesStmt = $this->db->prepare($modulesQuery);
            $modulesStmt->execute();
            $modulesResult = $modulesStmt->fetch(PDO::FETCH_ASSOC);

            // Total em Recargas - APENAS recargas de saldo via PIX/Cartão/PayPal (SEM compra de planos, SEM cupom)
            $rechargesQuery = "SELECT COALESCE(SUM(amount), 0) as total_recharges 
                              FROM central_cash 
                              WHERE transaction_type = 'recarga' 
                              AND payment_method IN ('pix', 'credit', 'paypal')
                              AND amount > 0";
            $rechargesStmt = $this->db->prepare($rechargesQuery);
            $rechargesStmt->execute();
            $rechargesResult = $rechargesStmt->fetch(PDO::FETCH_ASSOC);

            // Total de Saques
            $withdrawalsQuery = "SELECT COALESCE(SUM(amount), 0) as total_withdrawals 
                                FROM central_cash WHERE transaction_type = 'saque'";
            $withdrawalsStmt = $this->db->prepare($withdrawalsQuery);
            $withdrawalsStmt->execute();
            $withdrawalsResult = $withdrawalsStmt->fetch(PDO::FETCH_ASSOC);

            // Consultas Realizadas
            $consultationsQuery = "SELECT COUNT(*) as total_consultations FROM consultations";
            $consultationsStmt = $this->db->prepare($consultationsQuery);
            $consultationsStmt->execute();
            $consultationsResult = $consultationsStmt->fetch(PDO::FETCH_ASSOC);

            // Usuários Online (últimos 5 minutos)
            $onlineUsersQuery = "SELECT COUNT(DISTINCT user_id) as users_online 
                                FROM user_sessions 
                                WHERE last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND status = 'ativa'";
            $onlineUsersStmt = $this->db->prepare($onlineUsersQuery);
            $onlineUsersStmt->execute();
            $onlineUsersResult = $onlineUsersStmt->fetch(PDO::FETCH_ASSOC);

            // Pagamentos PIX - apenas entradas com valor positivo
            $pixQuery = "SELECT COALESCE(SUM(amount), 0) as total_pix 
                        FROM central_cash 
                        WHERE payment_method = 'pix' 
                        AND amount > 0";
            $pixStmt = $this->db->prepare($pixQuery);
            $pixStmt->execute();
            $pixResult = $pixStmt->fetch(PDO::FETCH_ASSOC);

            // Pagamentos Cartão de Crédito - apenas entradas com valor positivo
            $cardQuery = "SELECT COALESCE(SUM(amount), 0) as total_card 
                         FROM central_cash 
                         WHERE payment_method = 'credit' 
                         AND amount > 0";
            $cardStmt = $this->db->prepare($cardQuery);
            $cardStmt->execute();
            $cardResult = $cardStmt->fetch(PDO::FETCH_ASSOC);

            // Pagamentos PayPal - apenas entradas com valor positivo
            $paypalQuery = "SELECT COALESCE(SUM(amount), 0) as total_paypal 
                           FROM central_cash 
                           WHERE payment_method = 'paypal' 
                           AND amount > 0";
            $paypalStmt = $this->db->prepare($paypalQuery);
            $paypalStmt->execute();
            $paypalResult = $paypalStmt->fetch(PDO::FETCH_ASSOC);

            // Total de Cupons Usados - Tabela correta cupom_uso
            try {
                $couponsQuery = "SELECT COALESCE(SUM(valor_desconto), 0) as total_coupons_used 
                                FROM cupom_uso";
                $couponsStmt = $this->db->prepare($couponsQuery);
                $couponsStmt->execute();
                $couponsResult = $couponsStmt->fetch(PDO::FETCH_ASSOC);
            } catch (Exception $e) {
                error_log("DASHBOARD_ADMIN: Tabela cupom_uso não encontrada - " . $e->getMessage());
                $couponsResult = ['total_coupons_used' => 0];
            }

            // Painéis Ativos
            $activePanels = $this->getActivePanelsFromExternalAPI();

            $stats = [
                'cash_balance' => floatval($cashResult['total_cash']) ?: 0,
                'active_plans' => $activePanels ?: 0,
                'total_users' => intval($usersResult['total_users']) ?: 0,
                'total_referrals' => intval($commissionsResult['total_referrals']) ?: 0,
                'total_commissions' => floatval($commissionsResult['total_commissions_value']) ?: 0,
                'total_modules' => intval($modulesResult['total_modules']) ?: 0,
                'total_recharges' => floatval($rechargesResult['total_recharges']) ?: 0,
                'plan_sales' => floatval($plansResult['plan_sales']) ?: 0,
                'total_withdrawals' => floatval($withdrawalsResult['total_withdrawals']) ?: 0,
                'total_consultations' => intval($consultationsResult['total_consultations']) ?: 0,
                'users_online' => intval($onlineUsersResult['users_online']) ?: 0,
                'payment_pix' => floatval($pixResult['total_pix']) ?: 0,
                'payment_card' => floatval($cardResult['total_card']) ?: 0,
                'payment_paypal' => floatval($paypalResult['total_paypal']) ?: 0,
                'total_coupons_used' => floatval($couponsResult['total_coupons_used']) ?: 0
            ];
            
            error_log("DASHBOARD_ADMIN: Estatísticas carregadas - " . json_encode($stats));
            Response::success($stats, 'Estatísticas carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }

    private function getActivePanelsFromExternalAPI() {
        try {
            // Verificar se há configuração para API externa de painéis
            // Por enquanto, vamos usar a contagem de painéis ativos locais
            $panelsQuery = "SELECT COUNT(*) as active_panels 
                           FROM panels 
                           WHERE is_active = 1";
            $panelsStmt = $this->db->prepare($panelsQuery);
            $panelsStmt->execute();
            $panelsResult = $panelsStmt->fetch(PDO::FETCH_ASSOC);
            
            return intval($panelsResult['active_panels']) ?: 0;
        } catch (Exception $e) {
            error_log("Erro ao buscar painéis ativos: " . $e->getMessage());
            return 0;
        }
    }
    
    public function getUsers() {
        try {
            error_log("DASHBOARD_ADMIN: Buscando usuários");
            
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT u.*, 
                             COUNT(DISTINCT c.id) as total_consultations,
                             COALESCE(SUM(wt.amount), 0) as total_spent,
                             MAX(uss.last_activity) as last_login,
                             usub.plan_id as subscription_plan_id,
                             usub.metadata as subscription_metadata,
                             COALESCE(p.discount_percentage, 0) as plan_discount_percentage
                      FROM users u
                      LEFT JOIN consultations c ON u.id = c.user_id
                      LEFT JOIN wallet_transactions wt ON u.id = wt.user_id AND wt.type = 'saida'
                      LEFT JOIN user_sessions uss ON u.id = uss.user_id
                      LEFT JOIN user_subscriptions usub ON u.id = usub.user_id AND usub.status = 'active'
                      LEFT JOIN plans p ON usub.plan_id = p.id
                      GROUP BY u.id
                      ORDER BY u.created_at DESC
                      LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$limit, $offset]);
            
            $users = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $users[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['full_name'],
                    'email' => $row['email'],
                    'login' => $row['username'],
                    'cpf' => $row['cpf'],
                    'telefone' => $row['telefone'],
                    'plan' => $row['tipoplano'],
                    'balance' => floatval($row['saldo']),
                    'saldo' => floatval($row['saldo']),
                    'saldo_plano' => floatval($row['saldo_plano']),
                    'data_inicio' => $row['data_inicio'],
                    'data_fim' => $row['data_fim'],
                    'plan_discount' => $this->getDiscountFromSubscription($row),
                    'status' => $row['status'],
                    'user_role' => $row['user_role'],
                    'full_name' => $row['full_name'],
                    'total_consultations' => intval($row['total_consultations']),
                    'total_spent' => floatval($row['total_spent']),
                    'last_login' => $row['last_login'],
                    'created_at' => $row['created_at'],
                    'is_online' => $this->isUserOnline($row['id'])
                ];
            }
            
            // Contar total de usuários (excluindo os excluídos)
            $countQuery = "SELECT COUNT(*) as total FROM users";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute();
            $totalResult = $countStmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("DASHBOARD_ADMIN: " . count($users) . " usuários carregados");
            Response::success([
                'users' => $users, 
                'total' => intval($totalResult['total']),
                'page' => intval($page),
                'limit' => intval($limit)
            ], 'Usuários carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN USERS ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar usuários: ' . $e->getMessage(), 500);
        }
    }
    
    public function getActivities() {
        try {
            error_log("DASHBOARD_ADMIN: Buscando atividades recentes");
            
            $type = $_GET['type'] ?? 'all';
            $limit = $_GET['limit'] ?? 20;
            
            // Buscar atividades do system_logs
            $whereClause = $type !== 'all' ? "WHERE sl.action = ?" : "";
            
            $query = "SELECT sl.*, u.full_name as user_name, u.username as user_login
                      FROM system_logs sl
                      LEFT JOIN users u ON sl.user_id = u.id
                      $whereClause
                      ORDER BY sl.created_at DESC
                      LIMIT ?";
            
            $stmt = $this->db->prepare($query);
            
            $params = [];
            if ($type !== 'all') {
                $params[] = $type;
            }
            $params[] = intval($limit);
            
            $stmt->execute($params);
            
            $activities = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $activities[] = [
                    'id' => (int)$row['id'],
                    'type' => $row['action'],
                    'description' => $row['description'],
                    'user_name' => $row['user_name'],
                    'user_login' => $row['user_login'],
                    'module' => $row['module'],
                    'level' => $row['log_level'],
                    'created_at' => $row['created_at']
                ];
            }
            
            error_log("DASHBOARD_ADMIN: " . count($activities) . " atividades carregadas");
            Response::success(['activities' => $activities], 'Atividades carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN ACTIVITIES ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar atividades: ' . $e->getMessage(), 500);
        }
    }
    
    public function getTransactions() {
        try {
            error_log("DASHBOARD_ADMIN: Buscando transações do caixa central, bônus de indicação e consultas");
            
            $limit = $_GET['limit'] ?? 50;
            $filter = $_GET['filter'] ?? 'all';
            
            error_log("DASHBOARD_ADMIN: Filtro aplicado: " . $filter);
            
            // Se filtro específico, buscar direto da tabela correta
            if ($filter === 'pix') {
                $query = "SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before as cash_balance_before, cc.balance_after as cash_balance_after,
                            u.full_name as user_name, u.email as user_email, u.username as user_login,
                            u.id as user_id, u.cpf as user_cpf, u.telefone as user_telefone,
                            u.saldo as user_saldo, u.saldo_plano as user_saldo_plano,
                            u.tipoplano as user_plano, u.status as user_status,
                            u.codigo_indicacao as user_codigo_indicacao, u.created_at as user_created_at,
                            cc.payment_method, cc.created_at, cc.external_id,
                            cc.reference_table, cc.reference_id, cc.created_by, cc.metadata,
                            wt.balance_before as user_balance_before, wt.balance_after as user_balance_after,
                            'central_cash' as source_table, NULL as module_name
                         FROM central_cash cc
                         LEFT JOIN users u ON cc.user_id = u.id
                         LEFT JOIN wallet_transactions wt ON cc.reference_table = 'wallet_transactions' AND cc.reference_id = wt.id
                         WHERE cc.payment_method = 'pix' AND cc.amount > 0
                         ORDER BY cc.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'card') {
                $query = "SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before, cc.balance_after, u.full_name as user_name,
                            cc.payment_method, cc.created_at, 'central_cash' as source_table, NULL as module_name
                         FROM central_cash cc
                         LEFT JOIN users u ON cc.user_id = u.id
                         WHERE cc.payment_method = 'credit' AND cc.amount > 0
                         ORDER BY cc.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'paypal') {
                $query = "SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before, cc.balance_after, u.full_name as user_name,
                            cc.payment_method, cc.created_at, 'central_cash' as source_table, NULL as module_name
                         FROM central_cash cc
                         LEFT JOIN users u ON cc.user_id = u.id
                         WHERE cc.payment_method = 'paypal' AND cc.amount > 0
                         ORDER BY cc.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'caixa') {
                $query = "
                    (
                        SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before as cash_balance_before, cc.balance_after as cash_balance_after,
                            u.full_name as user_name,
                            u.email as user_email, u.username as user_login, u.id as user_id,
                            u.cpf as user_cpf, u.telefone as user_telefone,
                            u.saldo as user_saldo, u.saldo_plano as user_saldo_plano,
                            u.tipoplano as user_plano, u.status as user_status,
                            u.codigo_indicacao as user_codigo_indicacao,
                            u.created_at as user_created_at,
                            cc.payment_method, cc.created_at, cc.external_id,
                            cc.reference_table, cc.reference_id, cc.created_by, cc.metadata,
                            wt.balance_before as user_balance_before, wt.balance_after as user_balance_after,
                            'central_cash' as source_table,
                            NULL as module_name
                        FROM central_cash cc
                        LEFT JOIN users u ON cc.user_id = u.id
                        LEFT JOIN wallet_transactions wt ON cc.reference_table = 'wallet_transactions' AND cc.reference_id = wt.id
                        WHERE cc.transaction_type IN ('recarga', 'plano', 'compra_modulo', 'entrada', 'compra_login', 'consulta')
                    )
                    UNION ALL
                    (
                        SELECT 
                            CONCAT('cons_', c.id) as id,
                            'consulta' as type,
                            CONCAT('Consulta: ', c.document) as description,
                            c.cost as amount,
                            0 as cash_balance_before,
                            0 as cash_balance_after,
                            u.full_name as user_name,
                            u.email as user_email, u.username as user_login, u.id as user_id,
                            u.cpf as user_cpf, u.telefone as user_telefone,
                            u.saldo as user_saldo, u.saldo_plano as user_saldo_plano,
                            u.tipoplano as user_plano, u.status as user_status,
                            u.codigo_indicacao as user_codigo_indicacao,
                            u.created_at as user_created_at,
                            'saldo' as payment_method,
                            c.created_at,
                            NULL as external_id,
                            NULL as reference_table, NULL as reference_id, NULL as created_by, c.metadata,
                            NULL as user_balance_before, NULL as user_balance_after,
                            'consultations' as source_table,
                            COALESCE(
                                JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.module_title')),
                                CASE 
                                    WHEN c.module_type = 'nome' THEN 'NOME COMPLETO'
                                    WHEN c.module_type = 'cpf' THEN 'CPF'
                                    ELSE UPPER(COALESCE(c.module_type, 'CONSULTA'))
                                END
                            ) as module_name
                        FROM consultations c
                        LEFT JOIN users u ON c.user_id = u.id
                        WHERE c.status = 'completed' AND c.cost > 0
                    )
                    ORDER BY created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'recargas') {
                $query = "SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before as cash_balance_before, cc.balance_after as cash_balance_after,
                            u.full_name as user_name, u.email as user_email, u.username as user_login,
                            u.id as user_id, u.cpf as user_cpf, u.telefone as user_telefone,
                            u.saldo as user_saldo, u.saldo_plano as user_saldo_plano,
                            u.tipoplano as user_plano, u.status as user_status,
                            u.codigo_indicacao as user_codigo_indicacao, u.created_at as user_created_at,
                            cc.payment_method, cc.created_at, cc.external_id,
                            cc.reference_table, cc.reference_id, cc.created_by, cc.metadata,
                            wt.balance_before as user_balance_before, wt.balance_after as user_balance_after,
                            'central_cash' as source_table, NULL as module_name
                         FROM central_cash cc
                         LEFT JOIN users u ON cc.user_id = u.id
                         LEFT JOIN wallet_transactions wt ON cc.reference_table = 'wallet_transactions' AND cc.reference_id = wt.id
                         WHERE cc.transaction_type = 'recarga' AND cc.payment_method IN ('pix', 'credit', 'paypal') AND cc.amount > 0
                         ORDER BY cc.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'planos') {
                $query = "SELECT cc.id, cc.transaction_type as type, cc.description, cc.amount,
                            cc.balance_before, cc.balance_after, u.full_name as user_name,
                            u.email as user_email, u.username as user_login, u.id as user_id,
                            cc.payment_method, cc.created_at, cc.external_id,
                            'central_cash' as source_table, NULL as module_name
                         FROM central_cash cc
                         LEFT JOIN users u ON cc.user_id = u.id
                         WHERE cc.transaction_type = 'plano' AND cc.payment_method IN ('pix', 'credit', 'paypal') AND cc.amount > 0
                         ORDER BY cc.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } elseif ($filter === 'indicacoes') {
                $query = "SELECT CONCAT('wt_', wt.id) as id, wt.type, 
                            CONCAT('Bônus de Indicação - ', wt.description) as description,
                            wt.amount, wt.balance_before as user_balance_before, wt.balance_after as user_balance_after,
                            u.full_name as user_name, u.email as user_email, u.username as user_login,
                            u.id as user_id, u.cpf as user_cpf, u.telefone as user_telefone,
                            u.saldo as user_saldo, u.saldo_plano as user_saldo_plano,
                            u.tipoplano as user_plano, u.status as user_status,
                            u.codigo_indicacao as user_codigo_indicacao, u.created_at as user_created_at,
                            COALESCE(wt.payment_method, 'Sistema') as payment_method,
                            wt.created_at, wt.reference_id, wt.metadata,
                            'wallet_transactions' as source_table, NULL as module_name
                         FROM wallet_transactions wt
                         LEFT JOIN users u ON wt.user_id = u.id
                         WHERE wt.type = 'indicacao' AND wt.amount > 0
                         ORDER BY wt.created_at DESC LIMIT ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            } else {
                // Query original - todas as transações
                $query = "
                    (
                        SELECT 
                            cc.id,
                            cc.transaction_type as type,
                            cc.description,
                            cc.amount,
                            cc.balance_before,
                            cc.balance_after,
                            u.full_name as user_name,
                            cc.payment_method,
                            cc.created_at,
                            'central_cash' as source_table,
                            NULL as module_name
                        FROM central_cash cc
                        LEFT JOIN users u ON cc.user_id = u.id
                        WHERE cc.transaction_type != 'consulta'
                    )
                    UNION ALL
                    (
                        SELECT 
                            CONCAT('wt_', wt.id) as id,
                            wt.type,
                            CASE 
                                WHEN wt.type = 'indicacao' THEN CONCAT('Bônus de Indicação - ', wt.description)
                                ELSE wt.description
                            END as description,
                            wt.amount,
                            wt.balance_before,
                            wt.balance_after,
                            u.full_name as user_name,
                            COALESCE(wt.payment_method, 'Sistema') as payment_method,
                            wt.created_at,
                            'wallet_transactions' as source_table,
                            NULL as module_name
                        FROM wallet_transactions wt
                        LEFT JOIN users u ON wt.user_id = u.id
                        WHERE wt.type = 'indicacao'
                    )
                    UNION ALL
                    (
                        SELECT 
                            CONCAT('cons_', c.id) as id,
                            'consulta' as type,
                            CONCAT('Consulta: ', c.document) as description,
                            c.cost as amount,
                            0 as balance_before,
                            0 as balance_after,
                            u.full_name as user_name,
                            'saldo' as payment_method,
                            c.created_at,
                            'consultations' as source_table,
                            COALESCE(
                                JSON_UNQUOTE(JSON_EXTRACT(c.metadata, '$.module_title')),
                                CASE 
                                    WHEN c.module_type = 'nome' THEN 'NOME COMPLETO'
                                    WHEN c.module_type = 'cpf' THEN 'CPF'
                                    ELSE UPPER(COALESCE(c.module_type, 'CONSULTA'))
                                END
                            ) as module_name
                        FROM consultations c
                        LEFT JOIN users u ON c.user_id = u.id
                        WHERE c.status = 'completed' AND c.cost > 0
                    )
                    ORDER BY created_at DESC
                    LIMIT ?";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([intval($limit)]);
            }
            
            $transactions = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $transaction = [
                    'id' => $row['id'],
                    'type' => $row['type'] ?? null,
                    'description' => $row['description'] ?? null,
                    'amount' => floatval($row['amount'] ?? 0),
                    'user_name' => $row['user_name'] ?? null,
                    'payment_method' => $row['payment_method'] ?? null,
                    'created_at' => $row['created_at'] ?? null,
                    'source' => $row['source_table'] ?? null,
                    'module_name' => $row['module_name'] ?? null,
                ];

                // Campos extras do usuário (quando disponíveis via JOIN)
                if (isset($row['user_email'])) $transaction['user_email'] = $row['user_email'];
                if (isset($row['user_login'])) $transaction['user_login'] = $row['user_login'];
                if (isset($row['user_id'])) $transaction['user_id'] = $row['user_id'];
                if (isset($row['user_cpf'])) $transaction['user_cpf'] = $row['user_cpf'];
                if (isset($row['user_telefone'])) $transaction['user_telefone'] = $row['user_telefone'];
                if (isset($row['user_saldo'])) $transaction['user_saldo'] = floatval($row['user_saldo']);
                if (isset($row['user_saldo_plano'])) $transaction['user_saldo_plano'] = floatval($row['user_saldo_plano']);
                if (isset($row['user_plano'])) $transaction['user_plano'] = $row['user_plano'];
                if (isset($row['user_status'])) $transaction['user_status'] = $row['user_status'];
                if (isset($row['user_codigo_indicacao'])) $transaction['user_codigo_indicacao'] = $row['user_codigo_indicacao'];
                if (isset($row['user_created_at'])) $transaction['user_created_at'] = $row['user_created_at'];

                // Saldos da carteira do usuário (via wallet_transactions)
                if (isset($row['user_balance_before'])) $transaction['user_balance_before'] = floatval($row['user_balance_before']);
                if (isset($row['user_balance_after'])) $transaction['user_balance_after'] = floatval($row['user_balance_after']);

                // Saldos do caixa central
                if (isset($row['cash_balance_before'])) $transaction['cash_balance_before'] = floatval($row['cash_balance_before']);
                if (isset($row['cash_balance_after'])) $transaction['cash_balance_after'] = floatval($row['cash_balance_after']);
                // Fallback para queries que usam balance_before/after diretamente
                if (!isset($transaction['cash_balance_before']) && isset($row['balance_before'])) {
                    $transaction['balance_before'] = floatval($row['balance_before']);
                }
                if (!isset($transaction['cash_balance_after']) && isset($row['balance_after'])) {
                    $transaction['balance_after'] = floatval($row['balance_after']);
                }

                // Campos extras da transação
                if (isset($row['external_id'])) $transaction['external_id'] = $row['external_id'];
                if (isset($row['reference_table'])) $transaction['reference_table'] = $row['reference_table'];
                if (isset($row['reference_id'])) $transaction['reference_id'] = $row['reference_id'];
                if (isset($row['created_by'])) $transaction['created_by'] = $row['created_by'];
                if (isset($row['metadata'])) $transaction['metadata'] = $row['metadata'];

                $transactions[] = $transaction;
            }
            
            error_log("DASHBOARD_ADMIN: " . count($transactions) . " transações carregadas (filtro: $filter)");
            Response::success(['transactions' => $transactions], 'Transações carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN TRANSACTIONS ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar transações: ' . $e->getMessage(), 500);
        }
    }
    
    private function isUserOnline($userId) {
        try {
            $query = "SELECT COUNT(*) as count FROM user_sessions 
                     WHERE user_id = ? AND last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE) AND status = 'ativa'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return intval($result['count']) > 0;
        } catch (Exception $e) {
            error_log("IS_USER_ONLINE ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function getOnlineUsers() {
        try {
            error_log("DASHBOARD_ADMIN: Buscando usuários online detalhados");
            
            // Buscar usuários com sessões ativas nos últimos 5 minutos
            // Inclui saldo_plano, data_fim para dias restantes, e total de indicações
            $query = "SELECT DISTINCT u.id, u.username, u.email, u.full_name, u.cpf, u.telefone, 
                             u.tipoplano as plan, u.saldo as balance, u.saldo_plano as plan_balance,
                             u.status, u.user_role, u.data_fim,
                             us.last_activity as last_login,
                             us.ip_address, us.user_agent,
                             COUNT(DISTINCT c.id) as total_consultations,
                             COALESCE(SUM(CASE WHEN wt.type = 'saida' THEN wt.amount ELSE 0 END), 0) as total_spent,
                             (SELECT COUNT(*) FROM wallet_transactions wt2 
                              WHERE wt2.user_id = u.id AND wt2.type = 'indicacao' AND wt2.amount > 0) as total_referrals
                      FROM users u
                      INNER JOIN user_sessions us ON u.id = us.user_id
                      LEFT JOIN consultations c ON u.id = c.user_id
                      LEFT JOIN wallet_transactions wt ON u.id = wt.user_id
                      WHERE us.last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                      AND us.status = 'ativa'
                      GROUP BY u.id, us.last_activity, us.ip_address, us.user_agent
                      ORDER BY us.last_activity DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $onlineUsers = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $onlineUsers[] = [
                    'id' => (int)$row['id'],
                    'name' => $row['full_name'],
                    'email' => $row['email'],
                    'login' => $row['username'],
                    'cpf' => $row['cpf'],
                    'telefone' => $row['telefone'],
                    'plan' => $row['plan'],
                    'balance' => floatval($row['balance']),
                    'plan_balance' => floatval($row['plan_balance'] ?? 0),
                    'status' => $row['status'],
                    'user_role' => $row['user_role'],
                    'full_name' => $row['full_name'],
                    'total_consultations' => intval($row['total_consultations']),
                    'total_spent' => floatval($row['total_spent']),
                    'total_referrals' => intval($row['total_referrals'] ?? 0),
                    'remaining_days' => $row['data_fim'] ? max(0, (int)((strtotime($row['data_fim']) - time()) / 86400)) : 0,
                    'last_login' => $row['last_login'],
                    'ip_address' => $row['ip_address'],
                    'user_agent' => $row['user_agent'],
                    'is_online' => true
                ];
            }
            
            // Contar total de usuários online
            $countQuery = "SELECT COUNT(DISTINCT user_id) as total 
                          FROM user_sessions 
                          WHERE last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                          AND status = 'ativa'";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute();
            $totalResult = $countStmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("DASHBOARD_ADMIN: " . count($onlineUsers) . " usuários online carregados");
            Response::success([
                'users' => $onlineUsers,
                'total' => intval($totalResult['total']),
                'timestamp' => date('Y-m-d H:i:s')
            ], 'Usuários online carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN ONLINE_USERS ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar usuários online: ' . $e->getMessage(), 500);
        }
    }
    
    public function createUser() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            error_log("DASHBOARD_ADMIN CREATE_USER: Dados recebidos: " . json_encode($data));
            
            $required = ['email', 'full_name', 'user_role'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    Response::error("Campo {$field} é obrigatório", 400);
                    return;
                }
            }
            
            // Verificar se usuário já existe
            $checkQuery = "SELECT id FROM users WHERE email = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$data['email']]);
            
            if ($checkStmt->fetch()) {
                Response::error('Email já cadastrado', 400);
                return;
            }
            
            $this->db->beginTransaction();
            
            // Preparar dados
            $username = $data['username'] ?? $data['email'];
            $password = $data['password'] ?? '123456';
            $saldo = $data['saldo'] ?? 0;
            $saldoPlano = $data['saldo_plano'] ?? 0;
            $tipoplano = $data['tipoplano'] ?? 'Pré-Pago';
            $dataInicio = $data['data_inicio'] ?? date('Y-m-d');
            $dataFim = $data['data_fim'] ?? date('Y-m-d', strtotime('+30 days'));
            
            // Gerar codigo_indicacao
            $prefix = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $data['full_name']), 0, 3));
            $suffix = rand(1000, 9999);
            $codigoIndicacao = $prefix . $suffix;
            
            // Gerar senhas padrão
            $senhaalfa = $password;
            $senha4 = '0000';
            $senha6 = '000000';
            $senha8 = '00000000';
            
            // INSERT completo na tabela users com todos os campos
            $userQuery = "INSERT INTO users 
                         (username, email, password_hash, full_name, user_role, status, 
                          saldo, saldo_plano, tipoplano, data_inicio, data_fim,
                          senhaalfa, senha4, senha6, senha8, codigo_indicacao,
                          cpf, cnpj, telefone, endereco, cep, cidade, estado,
                          aceite_termos, created_at) 
                         VALUES (?, ?, ?, ?, ?, 'ativo', 
                                 ?, ?, ?, ?, ?,
                                 ?, ?, ?, ?, ?,
                                 ?, ?, ?, ?, ?, ?, ?,
                                 1, NOW())";
            
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([
                $username,
                $data['email'],
                md5($password),
                $data['full_name'],
                $data['user_role'],
                $saldo,
                $saldoPlano,
                $tipoplano,
                $dataInicio,
                $dataFim,
                $senhaalfa,
                $senha4,
                $senha6,
                $senha8,
                $codigoIndicacao,
                $data['cpf'] ?? null,
                $data['cnpj'] ?? null,
                $data['telefone'] ?? null,
                $data['endereco'] ?? null,
                $data['cep'] ?? null,
                $data['cidade'] ?? null,
                $data['estado'] ?? null
            ]);
            
            $userId = $this->db->lastInsertId();
            error_log("DASHBOARD_ADMIN CREATE_USER: Usuário criado com ID {$userId}");
            
            // Criar subscription com desconto no metadata
            $discount = isset($data['plan_discount']) ? (int)$data['plan_discount'] : 0;
            
            // Buscar plan_id
            $planQuery = "SELECT id FROM plans WHERE name = ? AND is_active = 1 LIMIT 1";
            $planStmt = $this->db->prepare($planQuery);
            $planStmt->execute([$tipoplano]);
            $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plan) {
                // Criar plano se não existir
                $createPlanQuery = "INSERT INTO plans (name, price, discount_percentage, duration_days, is_active, created_at, updated_at) VALUES (?, 0, 0, 30, 1, NOW(), NOW())";
                $createPlanStmt = $this->db->prepare($createPlanQuery);
                $createPlanStmt->execute([$tipoplano]);
                $planId = $this->db->lastInsertId();
                error_log("DASHBOARD_ADMIN CREATE_USER: Plano '{$tipoplano}' criado com ID {$planId}");
            } else {
                $planId = $plan['id'];
            }
            
            // Criar subscription com metadata contendo o desconto
            $metadata = json_encode(['discount_percentage' => $discount]);
            $subQuery = "INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method, amount_paid, auto_renew, metadata, created_at) 
                         VALUES (?, ?, 'active', ?, ?, 'admin', 0.00, 0, ?, NOW())";
            $subStmt = $this->db->prepare($subQuery);
            $subStmt->execute([$userId, $planId, $dataInicio, $dataFim, $metadata]);
            
            error_log("DASHBOARD_ADMIN CREATE_USER: Subscription criada - Plan ID: {$planId}, Desconto: {$discount}%, Metadata: {$metadata}");
            
            $this->db->commit();
            
            // Enviar notificação de notas se houver
            if (isset($data['notes']) && !empty(trim($data['notes']))) {
                require_once __DIR__ . '/../services/NotificationService.php';
                $notificationService = new NotificationService($this->db);
                $notificationService->createNotification(
                    $userId,
                    'info',
                    'Mensagem do Administrador',
                    $data['notes'],
                    null,
                    null,
                    'medium'
                );
            }
            
            Response::success([
                'id' => $userId,
                'email' => $data['email'],
                'full_name' => $data['full_name'],
                'plan_discount' => $discount
            ], 'Usuário criado com sucesso', 201);
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("DASHBOARD_ADMIN CREATE_USER ERROR: " . $e->getMessage());
            Response::error('Erro ao criar usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateUser($userId) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Buscar dados atuais do usuário antes de atualizar
            $checkQuery = "SELECT * FROM users WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId]);
            $currentUser = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$currentUser) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            $allowedFields = [
                'full_name', 'email', 'user_role', 'status', 'saldo', 'saldo_plano', 
                'tipoplano', 'cpf', 'cnpj', 'telefone', 'endereco', 'cep', 'cidade', 'estado',
                'data_inicio', 'data_fim'
            ];
            
            $updateFields = [];
            $updateParams = [];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateFields[] = "{$field} = ?";
                    $updateParams[] = $data[$field];
                }
            }
            
            if (empty($updateFields)) {
                Response::error('Nenhum dado válido para atualização', 400);
                return;
            }
            
            $updateParams[] = $userId;
            $query = "UPDATE users SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($updateParams);
            
            if ($result) {
                // Se houve mudança de plano, atualizar subscription
                if (isset($data['tipoplano']) && $data['tipoplano'] !== $currentUser['tipoplano']) {
                    $this->handlePlanChangeSubscription($userId, $data);
                } else {
                    // Mesmo sem trocar plano, sincronizar datas na subscription ativa
                    $this->syncSubscriptionDates($userId, $data);
                }
                
                // Atualizar desconto do plano na subscription ativa (se enviado)
                $this->updatePlanDiscount($userId, $data);
                
                // Registrar transações de carteira para alterações de saldo
                $this->registerBalanceTransactions($userId, $currentUser, $data);
                
                // Enviar notificações sobre as alterações
                $this->sendUpdateNotifications($userId, $currentUser, $data);
                
                Response::success(null, 'Usuário atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar usuário', 500);
            }
            
        } catch (\Throwable $e) {
            error_log("DASHBOARD_ADMIN UPDATE_USER ERROR: " . $e->getMessage() . " | Trace: " . $e->getTraceAsString());
            Response::error('Erro ao atualizar usuário: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Quando o plano muda, atualiza apenas a subscription (NÃO sobrescreve datas na tabela users)
     * As datas na tabela users já foram salvas pelo UPDATE principal via $allowedFields
     */
    private function handlePlanChangeSubscription($userId, $newData) {
        try {
            // Buscar o novo plano
            $planQuery = "SELECT id, discount_percentage FROM plans WHERE name = ? AND is_active = 1 LIMIT 1";
            $planStmt = $this->db->prepare($planQuery);
            $planStmt->execute([$newData['tipoplano']]);
            $newPlan = $planStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$newPlan) {
                error_log("ADMIN_PLAN_CHANGE: Plano '{$newData['tipoplano']}' não encontrado");
                return;
            }
            
            $newPlanId = (int)$newPlan['id'];
            $newDiscountPercentage = (int)$newPlan['discount_percentage'];
            
            // Usar as datas que já foram salvas na tabela users (enviadas pelo frontend)
            $startDate = $newData['data_inicio'] ?? date('Y-m-d');
            $endDate = $newData['data_fim'] ?? date('Y-m-d', strtotime('+30 days'));
            
            // Desativar assinaturas anteriores
            $deactivateQuery = "UPDATE user_subscriptions SET status = 'cancelled', updated_at = NOW() WHERE user_id = ? AND status = 'active'";
            $deactivateStmt = $this->db->prepare($deactivateQuery);
            $deactivateStmt->execute([$userId]);
            
            // Criar nova assinatura com desconto do plano (ou o enviado pelo frontend)
            $discount = isset($newData['plan_discount']) ? (int)$newData['plan_discount'] : $newDiscountPercentage;
            $metadata = json_encode(['discount_percentage' => $discount]);
            
            $subscriptionQuery = "INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method, amount_paid, auto_renew, metadata, created_at) 
                                 VALUES (?, ?, 'active', ?, ?, 'admin', 0.00, 0, ?, NOW())";
            $subscriptionStmt = $this->db->prepare($subscriptionQuery);
            $subscriptionStmt->execute([$userId, $newPlanId, $startDate, $endDate, $metadata]);
            
            error_log("ADMIN_PLAN_CHANGE: User {$userId} - Plano atualizado para {$newData['tipoplano']}, Datas: {$startDate} a {$endDate}, Desconto: {$discount}%");
            
        } catch (Exception $e) {
            error_log("HANDLE_PLAN_CHANGE ERROR: " . $e->getMessage());
        }
    }
    
    /**
     * Sincroniza datas da tabela users na subscription ativa (quando o plano NÃO muda)
     */
    private function syncSubscriptionDates($userId, $newData) {
        try {
            $hasDateChange = isset($newData['data_inicio']) || isset($newData['data_fim']);
            if (!$hasDateChange) return;

            $subQuery = "SELECT id FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1";
            $subStmt = $this->db->prepare($subQuery);
            $subStmt->execute([$userId]);
            $subscription = $subStmt->fetch(PDO::FETCH_ASSOC);

            if (!$subscription) return;

            $fields = [];
            $params = [];

            if (isset($newData['data_inicio'])) {
                $fields[] = "start_date = ?";
                $params[] = $newData['data_inicio'];
            }
            if (isset($newData['data_fim'])) {
                $fields[] = "end_date = ?";
                $params[] = $newData['data_fim'];
            }

            $fields[] = "updated_at = NOW()";
            $params[] = $subscription['id'];

            $updateQuery = "UPDATE user_subscriptions SET " . implode(', ', $fields) . " WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute($params);

            error_log("SYNC_SUB_DATES: User {$userId} - Subscription {$subscription['id']} datas sincronizadas");
        } catch (Exception $e) {
            error_log("SYNC_SUB_DATES ERROR: " . $e->getMessage());
        }
    }


    /**
     * Extrai o desconto do campo metadata JSON da subscription
     */
    private function getDiscountFromSubscription($row) {
        // Primeiro tenta ler do metadata JSON da subscription
        if (!empty($row['subscription_metadata'])) {
            $metadata = json_decode($row['subscription_metadata'], true);
            if (is_array($metadata) && isset($metadata['discount_percentage'])) {
                return (int)$metadata['discount_percentage'];
            }
        }
        // Fallback: desconto do plano compartilhado
        return (int)($row['plan_discount_percentage'] ?? 0);
    }
    
    private function updatePlanDiscount($userId, $newData) {
        try {
            if (!isset($newData['plan_discount'])) {
                return;
            }
            
            // Se o plano já mudou, a subscription já foi criada com o desconto em handlePlanChangeSubscription
            if (isset($newData['tipoplano'])) {
                // Verificar se já existe subscription ativa e atualizar metadata
                $subQuery = "SELECT id, metadata FROM user_subscriptions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1";
                $subStmt = $this->db->prepare($subQuery);
                $subStmt->execute([$userId]);
                $subscription = $subStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($subscription) {
                    $metadata = !empty($subscription['metadata']) ? json_decode($subscription['metadata'], true) : [];
                    if (!is_array($metadata)) $metadata = [];
                    $metadata['discount_percentage'] = (int)$newData['plan_discount'];
                    
                    $updateQuery = "UPDATE user_subscriptions SET metadata = ? WHERE id = ?";
                    $updateStmt = $this->db->prepare($updateQuery);
                    $updateStmt->execute([json_encode($metadata), $subscription['id']]);
                }
                return;
            }
            
            $discount = (int)$newData['plan_discount'];
            
            // Buscar a subscription ativa do usuário
            $subQuery = "SELECT usub.id, usub.plan_id, usub.metadata FROM user_subscriptions usub WHERE usub.user_id = ? AND usub.status = 'active' ORDER BY usub.id DESC LIMIT 1";
            $subStmt = $this->db->prepare($subQuery);
            $subStmt->execute([$userId]);
            $subscription = $subStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($subscription) {
                // Atualizar desconto no campo metadata JSON (per-user, sem criar coluna nova)
                $metadata = !empty($subscription['metadata']) ? json_decode($subscription['metadata'], true) : [];
                if (!is_array($metadata)) $metadata = [];
                $metadata['discount_percentage'] = $discount;
                
                $updateQuery = "UPDATE user_subscriptions SET metadata = ? WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([json_encode($metadata), $subscription['id']]);
                
                error_log("ADMIN_DISCOUNT_UPDATE: User {$userId} - Subscription ID: {$subscription['id']}, Desconto salvo no metadata: {$discount}%");
            } else {
                // Sem subscription ativa - criar uma nova
                $userQuery = "SELECT tipoplano, data_inicio, data_fim FROM users WHERE id = ?";
                $userStmt = $this->db->prepare($userQuery);
                $userStmt->execute([$userId]);
                $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                $planName = $userData['tipoplano'] ?? 'Pré-Pago';
                
                // Buscar ou criar o plano na tabela plans
                $planQuery = "SELECT id FROM plans WHERE name = ? LIMIT 1";
                $planStmt = $this->db->prepare($planQuery);
                $planStmt->execute([$planName]);
                $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$plan) {
                    $createPlanQuery = "INSERT INTO plans (name, price, discount_percentage, is_active, created_at, updated_at) VALUES (?, 0, 0, 1, NOW(), NOW())";
                    $createPlanStmt = $this->db->prepare($createPlanQuery);
                    $createPlanStmt->execute([$planName]);
                    $planId = $this->db->lastInsertId();
                    error_log("ADMIN_DISCOUNT_UPDATE: Plano '{$planName}' criado com ID {$planId}");
                } else {
                    $planId = $plan['id'];
                }
                
                // Criar subscription com desconto no metadata JSON
                $startDate = $userData['data_inicio'] ?? date('Y-m-d');
                $endDate = $userData['data_fim'] ?? date('Y-m-d', strtotime('+30 days'));
                $metadata = json_encode(['discount_percentage' => $discount]);
                
                $createSubQuery = "INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method, amount_paid, auto_renew, metadata, created_at) VALUES (?, ?, 'active', ?, ?, 'admin', 0.00, 0, ?, NOW())";
                $createSubStmt = $this->db->prepare($createSubQuery);
                $createSubStmt->execute([$userId, $planId, $startDate, $endDate, $metadata]);
                
                error_log("ADMIN_DISCOUNT_UPDATE: User {$userId} - Subscription criada com metadata desconto: {$discount}%");
            }
            
        } catch (Exception $e) {
            error_log("UPDATE_PLAN_DISCOUNT ERROR: " . $e->getMessage());
        }
    }
    
    private function registerBalanceTransactions($userId, $currentUser, $newData) {
        try {
            require_once __DIR__ . '/../services/WalletService.php';
            $walletService = new WalletService($this->db);
            
            // Transação para saldo da carteira (main)
            if (isset($newData['saldo'])) {
                $oldSaldo = (float)($currentUser['saldo'] ?? 0);
                $newSaldo = (float)$newData['saldo'];
                $diff = $newSaldo - $oldSaldo;
                
                if ($diff != 0) {
                    $type = $diff > 0 ? 'entrada' : 'saida';
                    $description = $diff > 0 
                        ? 'Créditos adicionados pelo Administrador' 
                        : 'Saldo ajustado pelo Administrador';
                    
                    // Inserir transação diretamente para evitar validação de saldo insuficiente
                    $transactionQuery = "INSERT INTO wallet_transactions (
                        user_id, wallet_type, type, amount, balance_before, balance_after, 
                        description, reference_type, payment_method, status, created_at
                    ) VALUES (?, 'main', ?, ?, ?, ?, ?, 'admin_adjustment', 'admin', 'completed', NOW())";
                    
                    $stmt = $this->db->prepare($transactionQuery);
                    $stmt->execute([
                        $userId, $type, abs($diff), $oldSaldo, $newSaldo, $description
                    ]);
                    
                    error_log("ADMIN_BALANCE: Transação carteira registrada - User {$userId}, Diff: R$ {$diff}");
                }
            }
            
            // Transação para saldo do plano
            if (isset($newData['saldo_plano'])) {
                $oldSaldoPlano = (float)($currentUser['saldo_plano'] ?? 0);
                $newSaldoPlano = (float)$newData['saldo_plano'];
                $diffPlano = $newSaldoPlano - $oldSaldoPlano;
                
                if ($diffPlano != 0) {
                    $type = $diffPlano > 0 ? 'entrada' : 'saida';
                    $description = $diffPlano > 0 
                        ? 'Créditos de plano adicionados pelo Administrador' 
                        : 'Saldo do plano ajustado pelo Administrador';
                    
                    $transactionQuery = "INSERT INTO wallet_transactions (
                        user_id, wallet_type, type, amount, balance_before, balance_after, 
                        description, reference_type, payment_method, status, created_at
                    ) VALUES (?, 'plan', ?, ?, ?, ?, ?, 'admin_adjustment', 'admin', 'completed', NOW())";
                    
                    $stmt = $this->db->prepare($transactionQuery);
                    $stmt->execute([
                        $userId, $type, abs($diffPlano), $oldSaldoPlano, $newSaldoPlano, $description
                    ]);
                    
                    error_log("ADMIN_BALANCE: Transação plano registrada - User {$userId}, Diff: R$ {$diffPlano}");
                }
            }
            
        } catch (Exception $e) {
            error_log("REGISTER_BALANCE_TRANSACTIONS ERROR: " . $e->getMessage());
        }
    }
    
    private function sendUpdateNotifications($userId, $currentUser, $newData) {
        try {
            require_once __DIR__ . '/../services/NotificationService.php';
            $notificationService = new NotificationService($this->db);
            
            // Notificação de alteração de plano
            if (isset($newData['tipoplano']) && $newData['tipoplano'] !== $currentUser['tipoplano']) {
                // Calcular dias para a notificação
                $planQuery = "SELECT duration_days FROM plans WHERE name = ? AND is_active = 1 LIMIT 1";
                $planStmt = $this->db->prepare($planQuery);
                $planStmt->execute([$newData['tipoplano']]);
                $newPlan = $planStmt->fetch(PDO::FETCH_ASSOC);
                $newPlanDays = $newPlan ? (int)$newPlan['duration_days'] : 30;
                
                $daysRemaining = 0;
                if (!empty($currentUser['data_fim'])) {
                    $endDate = new DateTime($currentUser['data_fim']);
                    $today = new DateTime();
                    if ($endDate > $today) {
                        $daysRemaining = $today->diff($endDate)->days;
                    }
                }
                $totalDays = $daysRemaining + $newPlanDays;
                
                $message = 'O Administrador atualizou o seu plano de "' . ($currentUser['tipoplano'] ?? 'Nenhum') . '" para "' . $newData['tipoplano'] . '". ';
                $message .= 'Dias restantes do plano anterior: ' . $daysRemaining . ' + Dias do novo plano: ' . $newPlanDays . ' = Total: ' . $totalDays . ' dias.';
                
                $notificationService->createNotification(
                    $userId,
                    'system',
                    'Plano Atualizado pelo Administrador',
                    $message,
                    null,
                    null,
                    'high'
                );
            }
            
            // Notificação de alteração de saldo da carteira
            if (isset($newData['saldo'])) {
                $oldSaldo = (float)($currentUser['saldo'] ?? 0);
                $newSaldo = (float)$newData['saldo'];
                $diff = $newSaldo - $oldSaldo;
                
                if ($diff != 0) {
                    $formattedDiff = 'R$ ' . number_format(abs($diff), 2, ',', '.');
                    if ($diff > 0) {
                        $notificationService->createNotification(
                            $userId,
                            'success',
                            'Créditos Recebidos na Carteira',
                            'Você recebeu créditos de ' . $formattedDiff . ' na sua carteira pelo Administrador. Saldo anterior: R$ ' . number_format($oldSaldo, 2, ',', '.') . ' → Novo saldo: R$ ' . number_format($newSaldo, 2, ',', '.'),
                            null,
                            null,
                            'high'
                        );
                    } else {
                        $notificationService->createNotification(
                            $userId,
                            'warning',
                            'Saldo da Carteira Ajustado',
                            'O Administrador ajustou o saldo da sua carteira. Foram removidos ' . $formattedDiff . '. Saldo anterior: R$ ' . number_format($oldSaldo, 2, ',', '.') . ' → Novo saldo: R$ ' . number_format($newSaldo, 2, ',', '.'),
                            null,
                            null,
                            'high'
                        );
                    }
                }
            }
            
            // Notificação de alteração de saldo do plano
            if (isset($newData['saldo_plano'])) {
                $oldSaldoPlano = (float)($currentUser['saldo_plano'] ?? 0);
                $newSaldoPlano = (float)$newData['saldo_plano'];
                $diffPlano = $newSaldoPlano - $oldSaldoPlano;
                
                if ($diffPlano != 0) {
                    $formattedDiff = 'R$ ' . number_format(abs($diffPlano), 2, ',', '.');
                    if ($diffPlano > 0) {
                        $notificationService->createNotification(
                            $userId,
                            'success',
                            'Créditos Recebidos no Plano',
                            'Você recebeu créditos de ' . $formattedDiff . ' no saldo do plano pelo Administrador. Saldo anterior: R$ ' . number_format($oldSaldoPlano, 2, ',', '.') . ' → Novo saldo: R$ ' . number_format($newSaldoPlano, 2, ',', '.'),
                            null,
                            null,
                            'high'
                        );
                    } else {
                        $notificationService->createNotification(
                            $userId,
                            'warning',
                            'Saldo do Plano Ajustado',
                            'O Administrador ajustou o saldo do seu plano. Foram removidos ' . $formattedDiff . '. Saldo anterior: R$ ' . number_format($oldSaldoPlano, 2, ',', '.') . ' → Novo saldo: R$ ' . number_format($newSaldoPlano, 2, ',', '.'),
                            null,
                            null,
                            'high'
                        );
                    }
                }
            }
            
            // Notificação de observações
            if (isset($newData['notes']) && !empty(trim($newData['notes']))) {
                $notificationService->createNotification(
                    $userId,
                    'info',
                    'Mensagem do Administrador',
                    $newData['notes'],
                    null,
                    null,
                    'medium'
                );
            }
            
            // Notificação de alteração de status - enviar APENAS para o usuário editado, nunca para o admin
            if (isset($newData['status']) && $newData['status'] !== $currentUser['status']) {
                // Obter ID do admin autenticado para evitar enviar notificação para ele
                $adminId = AuthMiddleware::getCurrentUserId();
                
                // Só enviar notificação se o usuário editado NÃO é o admin logado
                if ((int)$userId !== (int)$adminId) {
                    $statusMessages = [
                        'ativo' => ['title' => 'Conta Ativada', 'message' => 'Sua conta foi ativada pelo Administrador. Você já pode acessar o sistema normalmente.'],
                        'inativo' => ['title' => 'Conta Desativada', 'message' => 'Sua conta foi desativada pelo Administrador. Entre em contato com o suporte para mais informações.'],
                        'suspenso' => ['title' => 'Conta Suspensa', 'message' => 'Sua conta foi suspensa por tempo indeterminado pelo Administrador. Entre em contato com o suporte.'],
                        'pendente' => ['title' => 'Conta Pendente', 'message' => 'Sua conta está pendente de aprovação pelo Administrador.'],
                    ];
                    
                    $status = $newData['status'];
                    $statusInfo = $statusMessages[$status] ?? ['title' => 'Status Atualizado', 'message' => 'O status da sua conta foi alterado pelo Administrador.'];
                    
                    $notificationService->createNotification(
                        $userId,
                        'status_change',
                        $statusInfo['title'],
                        $statusInfo['message'],
                        null,
                        null,
                        'high'
                    );
                }
            }
            
            // Notificação de alteração de nome
            if (isset($newData['full_name']) && $newData['full_name'] !== $currentUser['full_name']) {
                $notificationService->createNotification(
                    $userId,
                    'info',
                    'Dados Atualizados',
                    'O Administrador atualizou o seu nome de "' . ($currentUser['full_name'] ?? '') . '" para "' . $newData['full_name'] . '".',
                    null,
                    null,
                    'low'
                );
            }
            
        } catch (Exception $e) {
            error_log("SEND_UPDATE_NOTIFICATIONS ERROR: " . $e->getMessage());
        }
    }
    
    public function toggleUserStatus($userId) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['status'])) {
                Response::error('Status é obrigatório', 400);
                return;
            }
            
            $query = "UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$data['status'], $userId])) {
                // Enviar notificação para o usuário editado (não para o admin)
                try {
                    require_once __DIR__ . '/../services/NotificationService.php';
                    $notificationService = new NotificationService($this->db);
                    
                    $adminId = AuthMiddleware::getCurrentUserId();
                    
                    // Só enviar notificação se o usuário editado NÃO é o admin logado
                    if ((int)$userId !== (int)$adminId) {
                        $statusMessages = [
                            'ativo' => ['title' => 'Conta Ativada', 'message' => 'Sua conta foi ativada pelo Administrador. Você já pode acessar o sistema normalmente.'],
                            'inativo' => ['title' => 'Conta Desativada', 'message' => 'Sua conta foi desativada pelo Administrador. Entre em contato com o suporte para mais informações.'],
                            'suspenso' => ['title' => 'Conta Suspensa', 'message' => 'Sua conta foi suspensa por tempo indeterminado pelo Administrador. Entre em contato com o suporte.'],
                            'pendente' => ['title' => 'Conta Pendente', 'message' => 'Sua conta está pendente de aprovação pelo Administrador.'],
                        ];
                        
                        $status = $data['status'];
                        $statusInfo = $statusMessages[$status] ?? ['title' => 'Status Atualizado', 'message' => 'O status da sua conta foi alterado pelo Administrador.'];
                        
                        $notificationService->createNotification(
                            $userId,
                            'status_change',
                            $statusInfo['title'],
                            $statusInfo['message'],
                            null,
                            null,
                            'high'
                        );
                    }
                } catch (Exception $notifError) {
                    error_log("TOGGLE_STATUS NOTIFICATION ERROR: " . $notifError->getMessage());
                }
                
                Response::success(null, 'Status do usuário atualizado');
            } else {
                Response::error('Erro ao atualizar status', 400);
            }
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN TOGGLE_STATUS ERROR: " . $e->getMessage());
            Response::error('Erro ao atualizar status: ' . $e->getMessage(), 500);
        }
    }
    
    public function deleteUser($userId) {
        try {
            // Verificar se userId é válido
            if (!$userId || !is_numeric($userId)) {
                Response::error('ID de usuário inválido', 400);
                return;
            }
            
            // Verificar se usuário existe
            $checkQuery = "SELECT id FROM users WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            $this->db->beginTransaction();
            
            // Excluir dados relacionados em ordem para evitar problemas de chave estrangeira
            // Usando try-catch individual para cada tabela (algumas podem não existir)
            
            $tablesToClean = [
                ['table' => 'user_sessions', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'user_subscriptions', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'user_audit', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'user_wallets', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'wallet_transactions', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'user_settings', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'user_profiles', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'consultations', 'column' => 'user_id', 'action' => 'DELETE'],
                ['table' => 'notifications', 'column' => 'user_id', 'action' => 'DELETE'],
            ];
            
            foreach ($tablesToClean as $tableInfo) {
                try {
                    $query = "DELETE FROM {$tableInfo['table']} WHERE {$tableInfo['column']} = ?";
                    $stmt = $this->db->prepare($query);
                    $stmt->execute([$userId]);
                } catch (Exception $e) {
                    // Tabela pode não existir - continuar
                    error_log("DELETE_USER: Tabela {$tableInfo['table']} não encontrada ou erro: " . $e->getMessage());
                }
            }
            
            // Atualizar referências para NULL (não deletar)
            $tablesToNullify = [
                ['table' => 'central_cash', 'column' => 'user_id'],
                ['table' => 'system_logs', 'column' => 'user_id'],
            ];
            
            foreach ($tablesToNullify as $tableInfo) {
                try {
                    $query = "UPDATE {$tableInfo['table']} SET {$tableInfo['column']} = NULL WHERE {$tableInfo['column']} = ?";
                    $stmt = $this->db->prepare($query);
                    $stmt->execute([$userId]);
                } catch (Exception $e) {
                    error_log("DELETE_USER: Erro ao nullificar {$tableInfo['table']}: " . $e->getMessage());
                }
            }
            
            // Tratar indicações
            try {
                $indicationQuery = "DELETE FROM indicacoes WHERE indicado_id = ?";
                $indicationStmt = $this->db->prepare($indicationQuery);
                $indicationStmt->execute([$userId]);
            } catch (Exception $e) {
                error_log("DELETE_USER: Tabela indicacoes não encontrada: " . $e->getMessage());
            }
            
            // Atualizar usuários que este usuário indicou
            try {
                $updateIndicatorQuery = "UPDATE users SET indicador_id = NULL WHERE indicador_id = ?";
                $updateIndicatorStmt = $this->db->prepare($updateIndicatorQuery);
                $updateIndicatorStmt->execute([$userId]);
            } catch (Exception $e) {
                error_log("DELETE_USER: Erro ao atualizar indicador_id: " . $e->getMessage());
            }
            
            // Finalmente excluir o usuário
            $deleteUserQuery = "DELETE FROM users WHERE id = ?";
            $deleteUserStmt = $this->db->prepare($deleteUserQuery);
            $result = $deleteUserStmt->execute([$userId]);
            
            if (!$result) {
                throw new Exception('Falha ao excluir usuário da tabela principal');
            }
            
            $this->db->commit();
            
            Response::success(null, 'Usuário excluído permanentemente com sucesso');
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            error_log("DASHBOARD_ADMIN DELETE_USER ERROR: " . $e->getMessage());
            error_log("DASHBOARD_ADMIN DELETE_USER STACK: " . $e->getTraceAsString());
            Response::error('Erro ao excluir usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function resetUserPassword($userId) {
        try {
            // Verificar se userId é válido
            if (!$userId || !is_numeric($userId)) {
                Response::error('ID de usuário inválido', 400);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            $newPassword = isset($data['new_password']) && !empty($data['new_password']) 
                ? $data['new_password'] 
                : '123456';
            
            // Validar senha mínima
            if (strlen($newPassword) < 6) {
                Response::error('A senha deve ter no mínimo 6 caracteres', 400);
                return;
            }
            
            // Verificar se usuário existe
            $checkQuery = "SELECT id FROM users WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId]);
            
            if (!$checkStmt->fetch()) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            $query = "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([password_hash($newPassword, PASSWORD_DEFAULT), $userId])) {
                Response::success(null, 'Senha resetada com sucesso');
            } else {
                Response::error('Erro ao resetar senha', 500);
            }
            
        } catch (Exception $e) {
            error_log("DASHBOARD_ADMIN RESET_PASSWORD ERROR: " . $e->getMessage());
            Response::error('Erro ao resetar senha: ' . $e->getMessage(), 500);
        }
    }
}
