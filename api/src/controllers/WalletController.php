<?php
// src/controllers/WalletController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class WalletController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function addBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['amount', 'payment_method'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
            }
        }
        
        try {
            $this->db->beginTransaction();
            
            $amount = (float)$data['amount'];
            $paymentMethod = $data['payment_method'];
            $description = $data['description'] ?? "Recarga via {$paymentMethod}";
            $walletType = $data['wallet_type'] ?? 'main';
            
            // Valor para o caixa central (considera desconto de cupom se aplicável)
            $centralCashAmount = isset($data['central_cash_amount']) ? (float)$data['central_cash_amount'] : $amount;
            
            // Dados do cupom se aplicável
            $cupomData = isset($data['cupom_data']) ? $data['cupom_data'] : null;
            
            // Buscar saldo atual do usuário
            $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                throw new Exception('Usuário não encontrado');
            }
            
            if ($walletType === 'plan') {
                // Operação na carteira do plano
                $currentBalance = (float)($userData['saldo_plano'] ?? 0);
                $newBalance = $currentBalance + $amount;
                
                // Atualizar saldo_plano na tabela users
                $updateQuery = "UPDATE users SET saldo_plano = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$newBalance, $userId]);
                
                // Criar ou atualizar carteira plan
                $walletQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, total_deposited) 
                               VALUES (?, 'plan', ?, ?, ?) 
                               ON DUPLICATE KEY UPDATE 
                               current_balance = VALUES(current_balance), 
                               available_balance = VALUES(available_balance), 
                               last_transaction_at = NOW(),
                               updated_at = NOW()";
                $walletStmt = $this->db->prepare($walletQuery);
                $walletStmt->execute([$userId, $newBalance, $newBalance, 0]);
                
                // Registrar transação na wallet_transactions como tipo plan/consulta
                $transType = $amount < 0 ? 'consulta' : 'recarga';
                $transactionQuery = "INSERT INTO wallet_transactions 
                                    (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                                    VALUES (?, 'plan', ?, ?, ?, ?, ?, ?, 'completed')";
                $transactionStmt = $this->db->prepare($transactionQuery);
                $transactionStmt->execute([$userId, $transType, $amount, $currentBalance, $newBalance, $description, $paymentMethod]);
                $transactionId = $this->db->lastInsertId();
                
                error_log("WALLET_CONTROLLER: Operação PLAN - Valor: R$ {$amount}, Saldo anterior: R$ {$currentBalance}, Novo saldo: R$ {$newBalance}");
            } else {
                // Operação na carteira principal (main) - lógica original
                $currentBalance = (float)($userData['saldo'] ?? 0);
                $newBalance = $currentBalance + $amount;
                
                // Atualizar saldo na tabela users
                $updateQuery = "UPDATE users SET saldo = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$newBalance, $userId]);
                
                // Criar ou atualizar carteira principal
                $walletQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, total_deposited) 
                               VALUES (?, 'main', ?, ?, ?) 
                               ON DUPLICATE KEY UPDATE 
                               current_balance = VALUES(current_balance), 
                               available_balance = VALUES(available_balance), 
                               total_deposited = total_deposited + VALUES(total_deposited),
                               last_transaction_at = NOW(),
                               updated_at = NOW()";
                $walletStmt = $this->db->prepare($walletQuery);
                $walletStmt->execute([$userId, $newBalance, $newBalance, $amount]);
                
                // Registrar transação na wallet_transactions
                $transType = $amount < 0 ? 'consulta' : 'recarga';
                $transactionQuery = "INSERT INTO wallet_transactions 
                                    (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                                    VALUES (?, 'main', ?, ?, ?, ?, ?, ?, 'completed')";
                $transactionStmt = $this->db->prepare($transactionQuery);
                $transactionStmt->execute([$userId, $transType, $amount, $currentBalance, $newBalance, $description, $paymentMethod]);
                $transactionId = $this->db->lastInsertId();
                
                error_log("WALLET_CONTROLLER: Operação MAIN - Valor: R$ {$amount}, Novo saldo: R$ {$newBalance}");
            }
            
            error_log("WALLET_CONTROLLER: Operação processada - WalletType: {$walletType}, Valor: R$ {$amount}, Novo saldo: R$ {$newBalance}");
            
            // Registrar no caixa central APENAS para recargas (amount > 0) e carteira principal
            // Consultas (amount < 0) e débitos do plano NÃO devem ir para o caixa central
            if ($amount > 0 && $walletType === 'main') {
                // Buscar saldo atual do caixa central
                $centralBalanceQuery = "SELECT COALESCE(SUM(CASE WHEN transaction_type IN ('entrada', 'recarga', 'plano') THEN amount ELSE -amount END), 0) FROM central_cash";
                $centralBalanceStmt = $this->db->prepare($centralBalanceQuery);
                $centralBalanceStmt->execute();
                $centralCurrentBalance = (float)$centralBalanceStmt->fetchColumn();
                
                // Registrar entrada do valor efetivamente pago no caixa central
                $centralCashQuery = "INSERT INTO central_cash 
                                   (transaction_type, amount, balance_before, balance_after, description, user_id, payment_method, reference_table, reference_id) 
                                   VALUES ('recarga', ?, ?, ?, ?, ?, ?, 'wallet_transactions', ?)";
                $centralStmt = $this->db->prepare($centralCashQuery);
                
                $centralNewBalance = $centralCurrentBalance + $centralCashAmount;
                $centralStmt->execute([$centralCashAmount, $centralCurrentBalance, $centralNewBalance, $description, $userId, $paymentMethod, $transactionId]);
                
                error_log("WALLET_CONTROLLER: Registrado no caixa central - Valor: R$ {$centralCashAmount}");
            } else {
                error_log("WALLET_CONTROLLER: Operação de débito/consulta - NÃO registra no caixa central (walletType: {$walletType}, amount: {$amount})");
            }
            
            // Registrar auditoria
            $finalBalance = $cupomData ? ($currentBalance + $amount) : $newBalance;
            $this->logUserAction($userId, 'balance_added', 'wallet', $description, 
                ['old_balance' => $currentBalance, 'new_balance' => $finalBalance, 'amount_added' => $amount, 'payment_method' => $paymentMethod]);
            
            $this->db->commit();
            
            $finalBalance = $cupomData ? ($currentBalance + $amount) : $newBalance;
            Response::success([
                'transaction_id' => $transactionId,
                'old_balance' => $currentBalance,
                'new_balance' => $finalBalance,
                'amount_added' => $amount
            ], 'Saldo adicionado com sucesso');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("ERRO ADD_BALANCE: " . $e->getMessage());
            Response::error('Erro ao adicionar saldo: ' . $e->getMessage(), 500);
        }
    }
    
    public function purchasePlan() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['plan_id', 'payment_method'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
            }
        }
        
        try {
            $this->db->beginTransaction();
            
            $planId = (int)$data['plan_id'];
            $paymentMethod = $data['payment_method'];
            
            // Buscar dados do plano
            $planQuery = "SELECT * FROM plans WHERE id = ? AND is_active = 1";
            $planStmt = $this->db->prepare($planQuery);
            $planStmt->execute([$planId]);
            $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$plan) {
                Response::error('Plano não encontrado ou inativo', 404);
                return;
            }
            
            $planPrice = (float)$plan['price'];
            $planName = $plan['name'];
            
            // Buscar saldo atual do usuário na tabela correta
            $userQuery = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            $currentSaldo = (float)($userData['saldo'] ?? 0);
            $currentSaldoPlano = (float)($userData['saldo_plano'] ?? 0);
            
            // Verificar se tem saldo suficiente
            if ($paymentMethod === 'saldo' && $currentSaldo < $planPrice) {
                Response::error('Saldo insuficiente para comprar o plano', 400);
                return;
            }
            
            $newSaldo = $currentSaldo;
            $newSaldoPlano = $currentSaldoPlano + $planPrice;
            
            // Se pagamento com saldo, deduzir do saldo
            if ($paymentMethod === 'saldo') {
                $newSaldo = $currentSaldo - $planPrice;
            }
            
            // Atualizar saldos na tabela users
            $updateUserQuery = "UPDATE users SET saldo = ?, saldo_plano = ?, saldo_atualizado = 1, tipoplano = ?, updated_at = NOW() WHERE id = ?";
            $updateUserStmt = $this->db->prepare($updateUserQuery);
            $updateUserStmt->execute([$newSaldo, $newSaldoPlano, $planName, $userId]);
            
            // Registrar transação de débito (se pagamento com saldo)
            if ($paymentMethod === 'saldo') {
                $debitQuery = "INSERT INTO wallet_transactions 
                              (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                              VALUES (?, 'main', 'plano', ?, ?, ?, ?, ?, 'completed')";
                $debitStmt = $this->db->prepare($debitQuery);
                $debitStmt->execute([$userId, $planPrice, $currentSaldo, $newSaldo, "Compra do plano {$planName}", $paymentMethod]);
            }
            
            // Registrar transação de crédito no saldo do plano
            $creditQuery = "INSERT INTO wallet_transactions 
                           (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                           VALUES (?, 'plan', 'plano', ?, ?, ?, ?, ?, 'completed')";
            $creditStmt = $this->db->prepare($creditQuery);
            $creditStmt->execute([$userId, $planPrice, $currentSaldoPlano, $newSaldoPlano, "Plano {$planName} ativado", $paymentMethod]);
            $transactionId = $this->db->lastInsertId();
            
            // Criar subscription
            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime("+{$plan['duration_days']} days"));
            
            $subscriptionQuery = "INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, end_date, payment_method, amount_paid) 
                                 VALUES (?, ?, 'active', ?, ?, ?, ?)";
            $subscriptionStmt = $this->db->prepare($subscriptionQuery);
            $subscriptionStmt->execute([$userId, $planId, $startDate, $endDate, $paymentMethod, $planPrice]);
            
            // Atualizar dados do usuário na tabela users
            $updateUserQuery = "UPDATE users SET 
                               tipoplano = ?,
                               data_inicio = ?,
                               data_fim = ?,
                               updated_at = NOW() 
                               WHERE id = ?";
            $updateUserStmt = $this->db->prepare($updateUserQuery);
            $updateUserStmt->execute([$planName, $startDate, $endDate, $userId]);
            
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
            
            $centralStmt->execute([$planPrice, $centralCurrentBalance, $centralNewBalance, "Compra do plano {$planName} - Usuário {$userId}", $userId, $paymentMethod, $transactionId]);
            
            // Registrar auditoria
            $this->logUserAction($userId, 'plan_purchased', 'plan', "Plano {$planName} adquirido", 
                ['plan_id' => $planId, 'plan_name' => $planName, 'amount' => $planPrice, 'payment_method' => $paymentMethod]);
            
            $this->db->commit();
            
            Response::success([
                'transaction_id' => $transactionId,
                'plan_name' => $planName,
                'amount' => $planPrice,
                'new_saldo' => $newSaldo,
                'new_saldo_plano' => $newSaldoPlano
            ], 'Plano adquirido com sucesso');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("ERRO PURCHASE_PLAN: " . $e->getMessage());
            Response::error('Erro ao adquirir plano: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUserBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Buscar dados da tabela users
            $userQuery = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            // Buscar dados das carteiras
            $walletQuery = "SELECT wallet_type, current_balance, available_balance FROM user_wallets WHERE user_id = ?";
            $walletStmt = $this->db->prepare($walletQuery);
            $walletStmt->execute([$userId]);
            $wallets = $walletStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'user_balance' => [
                    'saldo' => (float)($userData['saldo'] ?? 0),
                    'saldo_plano' => (float)($userData['saldo_plano'] ?? 0),
                    'total' => (float)($userData['saldo'] ?? 0) + (float)($userData['saldo_plano'] ?? 0)
                ],
                'wallets' => []
            ];
            
            foreach ($wallets as $wallet) {
                $response['wallets'][$wallet['wallet_type']] = [
                    'current_balance' => (float)$wallet['current_balance'],
                    'available_balance' => (float)$wallet['available_balance']
                ];
            }
            
            Response::success($response);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar saldo: ' . $e->getMessage(), 500);
        }
    }

    public function getUserProfile() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Buscar dados completos do usuário
            $userQuery = "SELECT id, email, full_name, user_role, saldo, saldo_plano, status, 
                         tipoplano, codigo_indicacao, cpf, cnpj, data_nascimento, telefone, 
                         cep, endereco, numero, bairro, cidade, estado, tipo_pessoa, 
                         aceite_termos, email_verificado, telefone_verificado, ultimo_login, 
                         created_at, updated_at 
                         FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            // Formatar dados para resposta
            $profileData = [
                'id' => (int)$userData['id'],
                'email' => $userData['email'],
                'full_name' => $userData['full_name'],
                'user_role' => $userData['user_role'],
                'saldo' => (float)$userData['saldo'],
                'saldo_plano' => (float)$userData['saldo_plano'],
                'status' => $userData['status'],
                'tipoplano' => $userData['tipoplano'],
                'codigo_indicacao' => $userData['codigo_indicacao'],
                'cpf' => $userData['cpf'],
                'cnpj' => $userData['cnpj'],
                'data_nascimento' => $userData['data_nascimento'],
                'telefone' => $userData['telefone'],
                'cep' => $userData['cep'],
                'endereco' => $userData['endereco'],
                'numero' => $userData['numero'],
                'bairro' => $userData['bairro'],
                'cidade' => $userData['cidade'],
                'estado' => $userData['estado'],
                'tipo_pessoa' => $userData['tipo_pessoa'],
                'aceite_termos' => (bool)$userData['aceite_termos'],
                'email_verificado' => (bool)$userData['email_verificado'],
                'telefone_verificado' => (bool)$userData['telefone_verificado'],
                'ultimo_login' => $userData['ultimo_login'],
                'created_at' => $userData['created_at'],
                'updated_at' => $userData['updated_at']
            ];
            
            Response::success($profileData);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar perfil: ' . $e->getMessage(), 500);
        }
    }
    
    public function getTransactionHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $limit = $_GET['limit'] ?? 50;
            $offset = $_GET['offset'] ?? 0;
            $type = $_GET['type'] ?? null;
            
            $query = "SELECT * FROM wallet_transactions WHERE user_id = ?";
            $params = [$userId];
            
            if ($type) {
                $query .= " AND type = ?";
                $params[] = $type;
            }
            
            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatear dados
            $formattedTransactions = array_map(function($transaction) {
                return [
                    'id' => $transaction['id'],
                    'type' => $transaction['type'],
                    'amount' => (float)$transaction['amount'],
                    'balance_before' => (float)$transaction['balance_before'],
                    'balance_after' => (float)$transaction['balance_after'],
                    'description' => $transaction['description'],
                    'payment_method' => $transaction['payment_method'],
                    'status' => $transaction['status'],
                    'created_at' => $transaction['created_at']
                ];
            }, $transactions);
            
            Response::success($formattedTransactions);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar histórico: ' . $e->getMessage(), 500);
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
