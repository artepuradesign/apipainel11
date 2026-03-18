
<?php
// src/services/TransactionService.php

require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/User.php';

class TransactionService {
    private $db;
    private $transaction;
    private $user;
    
    public function __construct($db) {
        $this->db = $db;
        $this->transaction = new Transaction($db);
        $this->user = new User($db);
    }
    
    public function createTransaction($userId, $type, $amount, $description, $reference = null) {
        try {
            $this->db->beginTransaction();
            
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = $type;
            $this->transaction->valor = $amount;
            $this->transaction->descricao = $description;
            $this->transaction->status = 'pendente';
            $this->transaction->reference = $reference;
            
            if ($this->transaction->create()) {
                $this->db->commit();
                return [
                    'success' => true,
                    'transaction_id' => $this->transaction->id
                ];
            }
            
            $this->db->rollback();
            return [
                'success' => false,
                'message' => 'Erro ao criar transação'
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("TransactionService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    public function processTransaction($transactionId) {
        try {
            $this->transaction->id = $transactionId;
            if (!$this->transaction->readOne()) {
                return [
                    'success' => false,
                    'message' => 'Transação não encontrada'
                ];
            }
            
            $this->db->beginTransaction();
            
            // Processar baseado no tipo
            $result = $this->processTransactionByType();
            
            if ($result['success']) {
                $this->transaction->status = 'concluida';
                $this->transaction->processed_at = date('Y-m-d H:i:s');
            } else {
                $this->transaction->status = 'falhou';
                $this->transaction->error_message = $result['message'];
            }
            
            $this->transaction->update();
            $this->db->commit();
            
            return $result;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("TransactionService process error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao processar transação'
            ];
        }
    }
    
    private function processTransactionByType() {
        switch ($this->transaction->tipo) {
            case 'credito':
                return $this->processCreditTransaction();
            case 'debito':
                return $this->processDebitTransaction();
            case 'transferencia':
                return $this->processTransferTransaction();
            default:
                return [
                    'success' => false,
                    'message' => 'Tipo de transação não suportado'
                ];
        }
    }
    
    private function processCreditTransaction() {
        $query = "UPDATE usuarios SET saldo = saldo + ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        if ($stmt->execute([$this->transaction->valor, $this->transaction->user_id])) {
            return ['success' => true];
        }
        
        return [
            'success' => false,
            'message' => 'Erro ao creditar saldo'
        ];
    }
    
    private function processDebitTransaction() {
        // Verificar saldo antes de debitar
        $this->user->id = $this->transaction->user_id;
        if (!$this->user->readOne()) {
            return [
                'success' => false,
                'message' => 'Usuário não encontrado'
            ];
        }
        
        if ($this->user->saldo < $this->transaction->valor) {
            return [
                'success' => false,
                'message' => 'Saldo insuficiente'
            ];
        }
        
        $query = "UPDATE usuarios SET saldo = saldo - ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        if ($stmt->execute([$this->transaction->valor, $this->transaction->user_id])) {
            return ['success' => true];
        }
        
        return [
            'success' => false,
            'message' => 'Erro ao debitar saldo'
        ];
    }
    
    private function processTransferTransaction() {
        // Implementar lógica de transferência
        return ['success' => true];
    }
    
    public function getUserTransactions($userId, $limit = 20, $offset = 0) {
        return $this->transaction->getUserTransactions($userId, $limit, $offset);
    }
    
    public function getTransactionStats($userId = null) {
        $today = date('Y-m-d');
        $thisMonth = date('Y-m');
        
        $whereClause = $userId ? "WHERE user_id = ? AND" : "WHERE";
        $params = $userId ? [$userId] : [];
        
        // Transações hoje
        $query = "SELECT COUNT(*) as count, SUM(valor) as total 
                 FROM transacoes 
                 {$whereClause} DATE(created_at) = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute(array_merge($params, [$today]));
        $todayStats = $stmt->fetch();
        
        // Transações este mês
        $query = "SELECT COUNT(*) as count, SUM(valor) as total 
                 FROM transacoes 
                 {$whereClause} DATE_FORMAT(created_at, '%Y-%m') = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute(array_merge($params, [$thisMonth]));
        $monthStats = $stmt->fetch();
        
        return [
            'today' => [
                'count' => $todayStats['count'] ?? 0,
                'total' => $todayStats['total'] ?? 0
            ],
            'month' => [
                'count' => $monthStats['count'] ?? 0,
                'total' => $monthStats['total'] ?? 0
            ]
        ];
    }
}
