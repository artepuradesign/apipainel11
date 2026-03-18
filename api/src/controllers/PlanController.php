
<?php
// src/controllers/PlanController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PlanController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        try {
            $query = "SELECT * FROM plans ORDER BY sort_order ASC, price ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $formattedPlans = array_map(function($plan) {
                return [
                    'id' => (int)$plan['id'],
                    'name' => $plan['name'],
                    'slug' => $plan['slug'],
                    'description' => $plan['description'],
                    'price' => (float)$plan['price'],
                    'original_price' => (float)($plan['original_price'] ?? $plan['price']),
                    'duration_days' => (int)$plan['duration_days'],
                    'max_consultations' => (int)($plan['consultation_limit'] ?? 0),
                    'max_api_calls' => (int)($plan['consultation_limit'] ?? 0),
                    'features' => json_decode($plan['features'] ?? '[]', true),
                    'modules_included' => json_decode($plan['modules_included'] ?? '[]', true),
                    'badge' => $plan['badge'],
                    'is_popular' => (bool)$plan['is_popular'],
                    'is_active' => (bool)$plan['is_active'],
                    'category' => $plan['category'],
                    'sort_order' => (int)$plan['sort_order'],
                    'created_at' => $plan['created_at'],
                    'updated_at' => $plan['updated_at']
                ];
            }, $plans);
            
            Response::success($formattedPlans);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar planos: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $query = "SELECT * FROM plans WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $plan = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plan) {
                Response::error('Plano não encontrado', 404);
                return;
            }
            
            $formattedPlan = [
                'id' => (int)$plan['id'],
                'name' => $plan['name'],
                'slug' => $plan['slug'],
                'description' => $plan['description'],
                'price' => (float)$plan['price'],
                'original_price' => (float)($plan['original_price'] ?? $plan['price']),
                'duration_days' => (int)$plan['duration_days'],
                'max_consultations' => (int)($plan['consultation_limit'] ?? 0),
                'max_api_calls' => (int)($plan['consultation_limit'] ?? 0),
                'features' => json_decode($plan['features'] ?? '[]', true),
                'modules_included' => json_decode($plan['modules_included'] ?? '[]', true),
                'badge' => $plan['badge'],
                'is_popular' => (bool)$plan['is_popular'],
                'is_active' => (bool)$plan['is_active'],
                'category' => $plan['category'],
                'sort_order' => (int)$plan['sort_order'],
                'created_at' => $plan['created_at'],
                'updated_at' => $plan['updated_at']
            ];
            
            Response::success($formattedPlan);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['name', 'slug', 'price'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            // Verificar se slug já existe
            $checkQuery = "SELECT id FROM plans WHERE slug = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$data['slug']]);
            if ($checkStmt->fetch()) {
                Response::error('Slug já existe', 400);
                return;
            }
            
            $insertQuery = "INSERT INTO plans 
                           (name, slug, description, price, original_price, duration_days, 
                            consultation_limit, features, modules_included, 
                            badge, is_popular, is_active, category, sort_order) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $insertStmt = $this->db->prepare($insertQuery);
            $insertStmt->execute([
                $data['name'],
                $data['slug'],
                $data['description'] ?? '',
                $data['price'],
                $data['original_price'] ?? $data['price'],
                $data['duration_days'] ?? 30,
                $data['max_consultations'] ?? -1,
                json_encode($data['features'] ?? []),
                json_encode($data['modules_included'] ?? []),
                $data['badge'] ?? null,
                $data['is_popular'] ?? false,
                $data['is_active'] ?? true,
                $data['category'] ?? 'basic',
                $data['sort_order'] ?? 0
            ]);
            
            $planId = $this->db->lastInsertId();
            
            // Log de auditoria
            $this->logUserAction($userId, 'plan_created', 'plans', "Plano {$data['name']} criado", [
                'plan_id' => $planId,
                'plan_name' => $data['name']
            ]);
            
            Response::success(['id' => $planId], 'Plano criado com sucesso', 201);
            
        } catch (Exception $e) {
            Response::error('Erro ao criar plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            // Buscar plano atual
            $currentQuery = "SELECT * FROM plans WHERE id = ?";
            $currentStmt = $this->db->prepare($currentQuery);
            $currentStmt->execute([$id]);
            $currentPlan = $currentStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$currentPlan) {
                Response::error('Plano não encontrado', 404);
                return;
            }
            
            // Verificar slug único se foi alterado
            if (isset($data['slug']) && $data['slug'] !== $currentPlan['slug']) {
                $checkQuery = "SELECT id FROM plans WHERE slug = ? AND id != ?";
                $checkStmt = $this->db->prepare($checkQuery);
                $checkStmt->execute([$data['slug'], $id]);
                if ($checkStmt->fetch()) {
                    Response::error('Slug já existe', 400);
                    return;
                }
            }
            
            $updateQuery = "UPDATE plans SET 
                           name = COALESCE(?, name),
                           slug = COALESCE(?, slug),
                           description = COALESCE(?, description),
                           price = COALESCE(?, price),
                           original_price = COALESCE(?, original_price),
                           duration_days = COALESCE(?, duration_days),
                           consultation_limit = COALESCE(?, consultation_limit),
                           features = COALESCE(?, features),
                           modules_included = COALESCE(?, modules_included),
                           badge = ?,
                           is_popular = COALESCE(?, is_popular),
                           is_active = COALESCE(?, is_active),
                           category = COALESCE(?, category),
                           sort_order = COALESCE(?, sort_order),
                           updated_at = NOW()
                           WHERE id = ?";
            
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([
                $data['name'] ?? null,
                $data['slug'] ?? null,
                $data['description'] ?? null,
                $data['price'] ?? null,
                $data['original_price'] ?? null,
                $data['duration_days'] ?? null,
                $data['max_consultations'] ?? null,
                isset($data['features']) ? json_encode($data['features']) : null,
                isset($data['modules_included']) ? json_encode($data['modules_included']) : null,
                $data['badge'] ?? $currentPlan['badge'],
                isset($data['is_popular']) ? (bool)$data['is_popular'] : null,
                isset($data['is_active']) ? (bool)$data['is_active'] : null,
                $data['category'] ?? null,
                $data['sort_order'] ?? null,
                $id
            ]);
            
            // Log de auditoria
            $this->logUserAction($userId, 'plan_updated', 'plans', "Plano {$currentPlan['name']} atualizado", [
                'plan_id' => $id,
                'old_values' => $currentPlan,
                'new_values' => $data
            ]);
            
            Response::success(null, 'Plano atualizado com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function delete($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Buscar plano atual
            $currentQuery = "SELECT * FROM plans WHERE id = ?";
            $currentStmt = $this->db->prepare($currentQuery);
            $currentStmt->execute([$id]);
            $currentPlan = $currentStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$currentPlan) {
                Response::error('Plano não encontrado', 404);
                return;
            }
            
            // Verificar se há assinaturas ativas
            $subscriptionsQuery = "SELECT COUNT(*) FROM user_subscriptions WHERE plan_id = ? AND status = 'active'";
            $subscriptionsStmt = $this->db->prepare($subscriptionsQuery);
            $subscriptionsStmt->execute([$id]);
            $subscriptionsCount = $subscriptionsStmt->fetchColumn();
            
            if ($subscriptionsCount > 0) {
                Response::error('Não é possível excluir o plano pois há assinaturas ativas', 400);
                return;
            }
            
            $deleteQuery = "DELETE FROM plans WHERE id = ?";
            $deleteStmt = $this->db->prepare($deleteQuery);
            $deleteStmt->execute([$id]);
            
            // Log de auditoria
            $this->logUserAction($userId, 'plan_deleted', 'plans', "Plano {$currentPlan['name']} excluído", [
                'plan_id' => $id,
                'plan_data' => $currentPlan
            ]);
            
            Response::success(null, 'Plano excluído com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao excluir plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function getPublicPlans() {
        try {
            $query = "SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order ASC, price ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $plans = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatar dados dos planos
            $formattedPlans = array_map(function($plan) {
                return [
                    'id' => $plan['id'],
                    'name' => $plan['name'],
                    'slug' => $plan['slug'],
                    'description' => $plan['description'],
                    'price' => (float)$plan['price'],
                    'original_price' => (float)($plan['original_price'] ?? $plan['price']),
                    'duration_days' => $plan['duration_days'],
                    'max_consultations' => (int)($plan['consultation_limit'] ?? 0),
                    'features' => json_decode($plan['features'] ?? '[]', true),
                    'modules_included' => json_decode($plan['modules_included'] ?? '[]', true),
                    'badge' => $plan['badge'],
                    'is_popular' => (bool)$plan['is_popular'],
                    'category' => $plan['category']
                ];
            }, $plans);
            
            Response::success($formattedPlans);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar planos: ' . $e->getMessage(), 500);
        }
    }
    
    public function purchasePlan() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        error_log("PURCHASE_PLAN: Iniciando compra de plano para usuário {$userId}");
        error_log("PURCHASE_PLAN: Dados recebidos: " . json_encode($data));
        
        $required = ['plan_id', 'payment_method'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            $this->db->beginTransaction();
            
            $planId = $data['plan_id'];
            $paymentMethod = $data['payment_method'];
            $amount = isset($data['amount']) ? (float)$data['amount'] : null;
            
            // Buscar dados do plano
            $planQuery = "SELECT * FROM plans WHERE id = ? AND is_active = 1";
            $planStmt = $this->db->prepare($planQuery);
            $planStmt->execute([$planId]);
            $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plan) {
                throw new Exception('Plano não encontrado ou inativo');
            }
            
            // Usar valor enviado ou valor do plano
            $planPrice = $amount ?? (float)$plan['price'];
            
            error_log("PURCHASE_PLAN: Plano encontrado - {$plan['name']}, Preço: R$ {$planPrice}");
            
            // Buscar saldo atual do usuário
            $userQuery = "SELECT saldo, saldo_plano, tipoplano FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                throw new Exception('Usuário não encontrado');
            }
            
            $currentWalletBalance = (float)($userData['saldo'] ?? 0);
            $currentPlanBalance = (float)($userData['saldo_plano'] ?? 0);
            
            error_log("PURCHASE_PLAN: Saldos atuais - Carteira: R$ {$currentWalletBalance}, Plano: R$ {$currentPlanBalance}");
            
            // Verificar método de pagamento
            $directPaymentMethods = ['pix', 'credit', 'paypal'];
            
            if (in_array($paymentMethod, $directPaymentMethods)) {
                // Compra direta via método de pagamento externo
                // Não deduz da carteira, apenas adiciona ao saldo do plano
                error_log("PURCHASE_PLAN: Compra direta via {$paymentMethod} - não deduzindo da carteira");
                $newWalletBalance = $currentWalletBalance; // Mantém carteira inalterada
                $newPlanBalance = $currentPlanBalance + $planPrice; // Adiciona valor ao plano
            } else {
                // Compra usando saldo da carteira (método antigo)
                if ($currentWalletBalance < $planPrice) {
                    throw new Exception("Saldo insuficiente para comprar este plano. Necessário: R$ {$planPrice}, Disponível: R$ {$currentWalletBalance}");
                }
                $newWalletBalance = $currentWalletBalance - $planPrice;
                $newPlanBalance = $currentPlanBalance + $planPrice;
            }
            
            error_log("PURCHASE_PLAN: Novos saldos calculados - Carteira: R$ {$newWalletBalance}, Plano: R$ {$newPlanBalance}");
            
            // Desativar planos ativos anteriores
            $deactivateQuery = "UPDATE user_subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'";
            $deactivateStmt = $this->db->prepare($deactivateQuery);
            $deactivateStmt->execute([$userId]);
            
            // Calcular datas de início e fim
            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime("+{$plan['duration_days']} days"));
            
            // Criar nova assinatura
            $subscriptionQuery = "INSERT INTO user_subscriptions 
                                (user_id, plan_id, status, start_date, end_date, amount_paid, payment_method, created_at, updated_at) 
                                VALUES (?, ?, 'active', ?, ?, ?, ?, NOW(), NOW())";
            $subscriptionStmt = $this->db->prepare($subscriptionQuery);
            $subscriptionStmt->execute([$userId, $planId, $startDate, $endDate, $planPrice, $paymentMethod]);
            $subscriptionId = $this->db->lastInsertId();
            
            error_log("PURCHASE_PLAN: Assinatura criada com ID {$subscriptionId}");
            
            // Atualizar dados do usuário (incluindo datas do plano)
            $updateUserQuery = "UPDATE users SET 
                               saldo = ?, 
                               saldo_plano = ?, 
                               tipoplano = ?,
                               data_inicio = ?,
                               data_fim = ?,
                               saldo_atualizado = 1,
                               updated_at = NOW() 
                               WHERE id = ?";
            $updateUserStmt = $this->db->prepare($updateUserQuery);
            $updateUserStmt->execute([$newWalletBalance, $newPlanBalance, $plan['name'], $startDate, $endDate, $userId]);
            
            error_log("PURCHASE_PLAN: Usuário atualizado - Novo tipo: {$plan['name']}");
            
            // Atualizar/Criar carteira principal
            $walletQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, last_transaction_at, updated_at) 
                           VALUES (?, 'main', ?, ?, NOW(), NOW()) 
                           ON DUPLICATE KEY UPDATE 
                           current_balance = VALUES(current_balance), 
                           available_balance = VALUES(available_balance), 
                           last_transaction_at = NOW(),
                           updated_at = NOW()";
            $walletStmt = $this->db->prepare($walletQuery);
            $walletStmt->execute([$userId, $newWalletBalance, $newWalletBalance]);
            
            // Atualizar/Criar carteira do plano
            $planWalletQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, last_transaction_at, updated_at) 
                               VALUES (?, 'plan', ?, ?, NOW(), NOW()) 
                               ON DUPLICATE KEY UPDATE 
                               current_balance = VALUES(current_balance), 
                               available_balance = VALUES(available_balance), 
                               last_transaction_at = NOW(),
                               updated_at = NOW()";
            $planWalletStmt = $this->db->prepare($planWalletQuery);
            $planWalletStmt->execute([$userId, $newPlanBalance, $newPlanBalance]);
            
            // Registrar transação de débito da carteira
            $debitTransactionQuery = "INSERT INTO wallet_transactions 
                                    (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status, reference_type, reference_id, created_at) 
                                    VALUES (?, 'main', 'plano', ?, ?, ?, ?, ?, 'completed', 'subscription', ?, NOW())";
            $debitStmt = $this->db->prepare($debitTransactionQuery);
            $debitStmt->execute([$userId, $planPrice, $currentWalletBalance, $newWalletBalance, "Compra do plano {$plan['name']}", $paymentMethod, $subscriptionId]);
            $debitTransactionId = $this->db->lastInsertId();
            
            // Registrar transação de crédito no saldo do plano
            $creditTransactionQuery = "INSERT INTO wallet_transactions 
                                     (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status, reference_type, reference_id, created_at) 
                                     VALUES (?, 'plan', 'entrada', ?, ?, ?, ?, ?, 'completed', 'subscription', ?, NOW())";
            $creditStmt = $this->db->prepare($creditTransactionQuery);
            $creditStmt->execute([$userId, $planPrice, $currentPlanBalance, $newPlanBalance, "Ativação do plano {$plan['name']}", $paymentMethod, $subscriptionId]);
            $creditTransactionId = $this->db->lastInsertId();
            
            error_log("PURCHASE_PLAN: Transações registradas - Débito: {$debitTransactionId}, Crédito: {$creditTransactionId}");
            
            // Registrar no caixa central
            $centralCashQuery = "INSERT INTO central_cash 
                               (transaction_type, amount, balance_before, balance_after, description, user_id, payment_method, reference_table, reference_id) 
                               VALUES ('plano', ?, ?, ?, ?, ?, ?, 'wallet_transactions', ?)";
            $centralStmt = $this->db->prepare($centralCashQuery);
            
            // Buscar saldo atual do caixa central
            $centralBalanceQuery = "SELECT COALESCE(SUM(CASE WHEN transaction_type IN ('entrada', 'recarga', 'plano') THEN amount ELSE -amount END), 0) FROM central_cash";
            $centralBalanceStmt = $this->db->prepare($centralBalanceQuery);
            $centralBalanceStmt->execute();
            $centralCurrentBalance = (float)$centralBalanceStmt->fetchColumn();
            $centralNewBalance = $centralCurrentBalance + $planPrice;
            
            error_log("PURCHASE_PLAN: Parâmetros do caixa central - Amount: {$planPrice}, BalanceBefore: {$centralCurrentBalance}, BalanceAfter: {$centralNewBalance}, UserId: {$userId}, PaymentMethod: {$paymentMethod}, ReferenceId: {$debitTransactionId}");
            
            $centralStmt->execute([$planPrice, $centralCurrentBalance, $centralNewBalance, "Compra do plano {$plan['name']}", $userId, $paymentMethod, $debitTransactionId]);
            
            // Log de auditoria
            $this->logUserAction($userId, 'plan_purchased', 'subscription', "Plano {$plan['name']} adquirido", [
                'plan_id' => $planId,
                'plan_name' => $plan['name'],
                'amount_paid' => $planPrice,
                'payment_method' => $paymentMethod
            ]);
            
            // ================================
            // CRIAR NOTIFICAÇÕES SINCRONIZADAS DE COMPRA DE PLANO
            // ================================
            error_log("PURCHASE_PLAN: Criando notificações sincronizadas de compra de plano...");
            
            // Buscar dados do usuário que comprou
            $buyerQuery = "SELECT full_name FROM users WHERE id = ?";
            $buyerStmt = $this->db->prepare($buyerQuery);
            $buyerStmt->execute([$userId]);
            $buyer = $buyerStmt->fetch(PDO::FETCH_ASSOC);
            $buyerName = $buyer ? $buyer['full_name'] : "Usuário ID {$userId}";
            
            // Usar o NotificationService para criar as notificações
            require_once __DIR__ . '/../services/NotificationService.php';
            $notificationService = new NotificationService($this->db);
            
            // Formatar valor em reais
            $formattedAmount = 'R$ ' . number_format($planPrice, 2, ',', '.');
            
            // 1) Criar notificação CONSOLIDADA para o usuário que comprou o plano
            $userTitle = 'Plano Ativado com Sucesso';
            $userMessage = "Plano: {$plan['name']}\nValor: {$formattedAmount}\nPeríodo: {$startDate} até {$endDate}\nStatus: Ativo\nMétodo: {$paymentMethod}";
            $userNotificationResult = $notificationService->createNotification(
                $userId,
                'user_plan_purchase_complete',
                $userTitle,
                $userMessage,
                '/dashboard/plans',
                'Ver Meus Planos',
                'high'
            );
            
            $notificationsCreated = $userNotificationResult['success'] ? 1 : 0;
            error_log("PURCHASE_PLAN: Notificação consolidada para usuário " . ($userNotificationResult['success'] ? 'criada' : 'FALHOU'));
            
            // 2) Buscar todos os usuários suporte e admin para notificação simultânea
            $supportQuery = "SELECT id FROM users WHERE (user_role = 'suporte' OR user_role = 'admin') AND status = 'ativo'";
            $supportStmt = $this->db->prepare($supportQuery);
            $supportStmt->execute();
            $supportUsers = $supportStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Criar notificações INSTANTÂNEAS para suportes/admins
            $adminTitle = 'Nova Compra de Plano';
            $adminMessage = "Usuário {$buyerName} adquiriu o plano {$plan['name']} de {$formattedAmount} via {$paymentMethod}.";
            $actionUrl = "/dashboard/admin?tab=transactions";
            
            foreach ($supportUsers as $supportUser) {
                $adminNotificationResult = $notificationService->createNotification(
                    $supportUser['id'],
                    'admin_plan_purchase_alert',
                    $adminTitle,
                    $adminMessage,
                    $actionUrl,
                    'Ver Detalhes',
                    'high'
                );
                
                if ($adminNotificationResult['success']) {
                    $notificationsCreated++;
                }
            }
            
            error_log("PURCHASE_PLAN: {$notificationsCreated} notificações sincronizadas criadas para compra do plano {$plan['name']} por {$buyerName}");
            
            $this->db->commit();
            
            error_log("PURCHASE_PLAN: Compra finalizada com sucesso para usuário {$userId}");
            
            Response::success([
                'transaction_id' => $debitTransactionId,
                'user_plan_id' => $subscriptionId,
                'new_balance' => [
                    'saldo' => $newWalletBalance,
                    'saldo_plano' => $newPlanBalance,
                    'total' => $newWalletBalance + $newPlanBalance
                ],
                'plan_details' => [
                    'name' => $plan['name'],
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'status' => 'active'
                ]
            ], 'Plano adquirido com sucesso');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("ERRO PURCHASE_PLAN: " . $e->getMessage());
            Response::error('Erro ao adquirir plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUserActivePlan() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            $query = "SELECT us.*, p.name as plan_name, p.price, p.features, p.description, p.consultation_limit
                      FROM user_subscriptions us
                      JOIN plans p ON us.plan_id = p.id
                      WHERE us.user_id = ? AND us.status = 'active' 
                      AND us.end_date >= CURDATE()
                      ORDER BY us.created_at DESC LIMIT 1";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $subscription = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$subscription) {
                Response::success(null, 'Nenhum plano ativo encontrado');
                return;
            }
            
            $formattedSubscription = [
                'id' => (int)$subscription['id'],
                'plan_id' => (int)$subscription['plan_id'],
                'plan_name' => $subscription['plan_name'],
                'description' => $subscription['description'],
                'price' => (float)$subscription['price'],
                'max_consultations' => (int)$subscription['consultation_limit'],
                'max_api_calls' => (int)$subscription['consultation_limit'],
                'features' => json_decode($subscription['features'] ?? '[]', true),
                'status' => $subscription['status'],
                'start_date' => $subscription['start_date'],
                'end_date' => $subscription['end_date'],
                'amount_paid' => (float)$subscription['amount_paid'],
                'payment_method' => $subscription['payment_method'],
                'created_at' => $subscription['created_at']
            ];
            
            Response::success($formattedSubscription, 'Plano ativo encontrado');
            
        } catch (Exception $e) {
            error_log("ERRO GET_USER_ACTIVE_PLAN: " . $e->getMessage());
            Response::error('Erro ao buscar plano ativo: ' . $e->getMessage(), 500);
        }
    }
    
    public function getPlanUsageStats() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            // Buscar plano ativo
            $planQuery = "SELECT us.*, p.name as plan_name, p.consultation_limit
                         FROM user_subscriptions us
                         JOIN plans p ON us.plan_id = p.id
                         WHERE us.user_id = ? AND us.status = 'active' 
                         AND us.end_date >= CURDATE()
                         ORDER BY us.created_at DESC LIMIT 1";
            
            $planStmt = $this->db->prepare($planQuery);
            $planStmt->execute([$userId]);
            $activePlan = $planStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$activePlan) {
                Response::success(null, 'Nenhum plano ativo encontrado');
                return;
            }
            
            // Buscar estatísticas de uso (assumindo que existe uma tabela de logs de consultas)
            $usageQuery = "SELECT COUNT(*) as consultations_used 
                          FROM user_consultations 
                          WHERE user_id = ? 
                          AND created_at >= ? 
                          AND created_at <= ?";
            
            $usageStmt = $this->db->prepare($usageQuery);
            $usageStmt->execute([$userId, $activePlan['start_date'], $activePlan['end_date']]);
            $usage = $usageStmt->fetch(PDO::FETCH_ASSOC);
            
            $consultationsUsed = (int)($usage['consultations_used'] ?? 0);
            $maxConsultations = (int)$activePlan['consultation_limit'];
            $consultationsRemaining = max(0, $maxConsultations - $consultationsUsed);
            
            $stats = [
                'plan_name' => $activePlan['plan_name'],
                'plan_period' => [
                    'start_date' => $activePlan['start_date'],
                    'end_date' => $activePlan['end_date']
                ],
                'consultations' => [
                    'used' => $consultationsUsed,
                    'total' => $maxConsultations,
                    'remaining' => $consultationsRemaining,
                    'percentage' => $maxConsultations > 0 ? ($consultationsUsed / $maxConsultations) * 100 : 0
                ]
            ];
            
            Response::success($stats, 'Estatísticas de uso obtidas');
            
        } catch (Exception $e) {
            error_log("ERRO GET_PLAN_USAGE_STATS: " . $e->getMessage());
            Response::error('Erro ao buscar estatísticas de uso: ' . $e->getMessage(), 500);
        }
    }
    
    private function logUserAction($userId, $action, $category, $description, $values = []) {
        try {
            $auditQuery = "INSERT INTO user_audit (user_id, action, category, description, new_values, ip_address, user_agent) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)";
            $auditStmt = $this->db->prepare($auditQuery);
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $auditStmt->execute([
                $userId,
                $action,
                $category,
                $description,
                json_encode($values),
                $ipAddress,
                $userAgent
            ]);
            
        } catch (Exception $e) {
            error_log("ERRO AUDIT LOG: " . $e->getMessage());
        }
    }
}
