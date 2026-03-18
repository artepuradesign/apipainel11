<?php
// src/controllers/CentralCashController.php

require_once __DIR__ . '/../models/CentralCash.php';
require_once __DIR__ . '/../utils/Response.php';

class CentralCashController {
    private $db;
    private $centralCash;
    
    public function __construct($db) {
        $this->db = $db;
        $this->centralCash = new CentralCash($db);
    }
    
    // Obter estatísticas do caixa central
    public function getStats() {
        try {
            // Obter saldo atual (último balance_after)
            $balanceQuery = "SELECT balance_after FROM central_cash ORDER BY id DESC LIMIT 1";
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute();
            $balanceResult = $balanceStmt->fetch(PDO::FETCH_ASSOC);
            $currentBalance = $balanceResult ? $balanceResult['balance_after'] : 0;
            
            // Receita diária (hoje)
            $dailyQuery = "SELECT SUM(amount) as daily_revenue FROM central_cash 
                          WHERE DATE(created_at) = CURDATE() 
                          AND transaction_type IN ('recarga', 'entrada', 'compra_modulo', 'plano')";
            $dailyStmt = $this->db->prepare($dailyQuery);
            $dailyStmt->execute();
            $dailyResult = $dailyStmt->fetch(PDO::FETCH_ASSOC);
            $dailyRevenue = $dailyResult['daily_revenue'] ?? 0;
            
            // Receita mensal
            $monthlyQuery = "SELECT SUM(amount) as monthly_revenue FROM central_cash 
                            WHERE MONTH(created_at) = MONTH(CURDATE()) 
                            AND YEAR(created_at) = YEAR(CURDATE())
                            AND transaction_type IN ('recarga', 'entrada', 'compra_modulo', 'plano')";
            $monthlyStmt = $this->db->prepare($monthlyQuery);
            $monthlyStmt->execute();
            $monthlyResult = $monthlyStmt->fetch(PDO::FETCH_ASSOC);
            $monthlyRevenue = $monthlyResult['monthly_revenue'] ?? 0;
            
            // Total de recargas
            $rechargesQuery = "SELECT SUM(amount) as total_recharges FROM central_cash 
                              WHERE transaction_type = 'recarga'";
            $rechargesStmt = $this->db->prepare($rechargesQuery);
            $rechargesStmt->execute();
            $rechargesResult = $rechargesStmt->fetch(PDO::FETCH_ASSOC);
            $totalRecharges = $rechargesResult['total_recharges'] ?? 0;
            
            // Total de saques
            $withdrawalsQuery = "SELECT SUM(amount) as total_withdrawals FROM central_cash 
                                WHERE transaction_type = 'saque'";
            $withdrawalsStmt = $this->db->prepare($withdrawalsQuery);
            $withdrawalsStmt->execute();
            $withdrawalsResult = $withdrawalsStmt->fetch(PDO::FETCH_ASSOC);
            $totalWithdrawals = $withdrawalsResult['total_withdrawals'] ?? 0;
            
            // Total de comissões
            $commissionsQuery = "SELECT SUM(amount) as total_commissions FROM central_cash 
                                WHERE transaction_type = 'comissao'";
            $commissionsStmt = $this->db->prepare($commissionsQuery);
            $commissionsStmt->execute();
            $commissionsResult = $commissionsStmt->fetch(PDO::FETCH_ASSOC);
            $totalCommissions = $commissionsResult['total_commissions'] ?? 0;
            
            // Total de consultas
            $consultationsQuery = "SELECT SUM(amount) as total_consultations FROM central_cash 
                                  WHERE transaction_type = 'consulta'";
            $consultationsStmt = $this->db->prepare($consultationsQuery);
            $consultationsStmt->execute();
            $consultationsResult = $consultationsStmt->fetch(PDO::FETCH_ASSOC);
            $totalConsultations = $consultationsResult['total_consultations'] ?? 0;
            
            // Contar usuários ativos
            $usersQuery = "SELECT COUNT(*) as users_count FROM users";
            $usersStmt = $this->db->prepare($usersQuery);
            $usersStmt->execute();
            $usersResult = $usersStmt->fetch(PDO::FETCH_ASSOC);
            $usersCount = $usersResult['users_count'] ?? 0;
            
            $stats = [
                'current_balance' => (float)$currentBalance,
                'daily_revenue' => (float)$dailyRevenue,
                'monthly_revenue' => (float)$monthlyRevenue,
                'total_recharges' => (float)$totalRecharges,
                'total_withdrawals' => (float)$totalWithdrawals,
                'total_commissions' => (float)$totalCommissions,
                'total_consultations' => (float)$totalConsultations,
                'users_count' => (int)$usersCount,
                'last_updated' => date('Y-m-d H:i:s')
            ];
            
            Response::success($stats);
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH_STATS_ERROR: " . $e->getMessage());
            Response::error('Erro ao obter estatísticas do caixa central', 500);
        }
    }
    
    // Obter transações recentes
    public function getRecentTransactions() {
        try {
            $limit = $_GET['limit'] ?? 50;
            
            $query = "SELECT * FROM central_cash 
                     ORDER BY created_at DESC 
                     LIMIT :limit";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Converter campos numéricos
            foreach ($transactions as &$transaction) {
                $transaction['id'] = (int)$transaction['id'];
                $transaction['amount'] = (float)$transaction['amount'];
                $transaction['balance_before'] = (float)$transaction['balance_before'];
                $transaction['balance_after'] = (float)$transaction['balance_after'];
                $transaction['user_id'] = $transaction['user_id'] ? (int)$transaction['user_id'] : null;
                $transaction['reference_id'] = $transaction['reference_id'] ? (int)$transaction['reference_id'] : null;
                $transaction['created_by'] = $transaction['created_by'] ? (int)$transaction['created_by'] : null;
            }
            
            Response::success($transactions);
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH_TRANSACTIONS_ERROR: " . $e->getMessage());
            Response::error('Erro ao obter transações do caixa central', 500);
        }
    }
    
    // Obter saldo atual
    public function getCurrentBalance() {
        try {
            $query = "SELECT balance_after as balance, created_at as last_updated 
                     FROM central_cash 
                     ORDER BY id DESC 
                     LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $balance = [
                'balance' => $result ? (float)$result['balance'] : 0,
                'last_updated' => $result ? $result['last_updated'] : date('Y-m-d H:i:s')
            ];
            
            Response::success($balance);
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH_BALANCE_ERROR: " . $e->getMessage());
            Response::error('Erro ao obter saldo do caixa central', 500);
        }
    }
    
    // Adicionar nova transação
    public function addTransaction() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados de entrada inválidos', 400);
                return;
            }
            
            $type = $input['type'] ?? '';
            $amount = $input['amount'] ?? 0;
            $description = $input['description'] ?? '';
            $userId = $input['user_id'] ?? null;
            $metadata = $input['metadata'] ?? null;
            
            if (!$type || !$amount || !$description) {
                Response::error('Campos obrigatórios: type, amount, description', 400);
                return;
            }
            
            // Obter saldo atual
            $balanceQuery = "SELECT balance_after FROM central_cash ORDER BY id DESC LIMIT 1";
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute();
            $balanceResult = $balanceStmt->fetch(PDO::FETCH_ASSOC);
            $currentBalance = $balanceResult ? $balanceResult['balance_after'] : 0;
            
            // Calcular novo saldo
            $newBalance = $currentBalance;
            if (in_array($type, ['recarga', 'entrada', 'plano', 'compra_modulo'])) {
                $newBalance += $amount;
            } else {
                $newBalance -= $amount;
            }
            
            // Inserir nova transação
            $insertQuery = "INSERT INTO central_cash 
                           (transaction_type, amount, balance_before, balance_after, description, user_id, metadata) 
                           VALUES (?, ?, ?, ?, ?, ?, ?)";
            $insertStmt = $this->db->prepare($insertQuery);
            $metadataJson = $metadata ? json_encode($metadata) : null;
            
            $insertStmt->execute([
                $type,
                $amount,
                $currentBalance,
                $newBalance,
                $description,
                $userId,
                $metadataJson
            ]);
            
            $transactionId = $this->db->lastInsertId();
            
            // Buscar a transação criada
            $selectQuery = "SELECT * FROM central_cash WHERE id = ?";
            $selectStmt = $this->db->prepare($selectQuery);
            $selectStmt->execute([$transactionId]);
            $transaction = $selectStmt->fetch(PDO::FETCH_ASSOC);
            
            // Converter campos numéricos
            $transaction['id'] = (int)$transaction['id'];
            $transaction['amount'] = (float)$transaction['amount'];
            $transaction['balance_before'] = (float)$transaction['balance_before'];
            $transaction['balance_after'] = (float)$transaction['balance_after'];
            $transaction['user_id'] = $transaction['user_id'] ? (int)$transaction['user_id'] : null;
            $transaction['reference_id'] = $transaction['reference_id'] ? (int)$transaction['reference_id'] : null;
            $transaction['created_by'] = $transaction['created_by'] ? (int)$transaction['created_by'] : null;
            
            Response::success($transaction);
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH_ADD_TRANSACTION_ERROR: " . $e->getMessage());
            Response::error('Erro ao adicionar transação ao caixa central', 500);
        }
    }
}