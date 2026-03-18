
<?php
// src/services/BalanceService.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Transaction.php';

class BalanceService {
    private $db;
    private $user;
    private $transaction;
    
    public function __construct($db) {
        $this->db = $db;
        $this->user = new User($db);
        $this->transaction = new Transaction($db);
    }
    
    public function addBalance($userId, $amount, $description = 'Adição de saldo') {
        try {
            $this->db->beginTransaction();
            
            // Atualizar saldo do usuário
            $query = "UPDATE usuarios SET balance = balance + ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if (!$stmt->execute([$amount, $userId])) {
                throw new Exception('Erro ao adicionar saldo');
            }
            
            // Criar transação de crédito
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = 'credito';
            $this->transaction->valor = $amount;
            $this->transaction->descricao = $description;
            $this->transaction->status = 'concluida';
            
            if (!$this->transaction->create()) {
                throw new Exception('Erro ao criar transação');
            }
            
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    public function debitBalance($userId, $amount, $description = 'Débito de saldo') {
        try {
            $this->db->beginTransaction();
            
            // Verificar saldo disponível
            $this->user->id = $userId;
            if (!$this->user->readOne()) {
                throw new Exception('Usuário não encontrado');
            }
            
            if ($this->user->balance < $amount) {
                throw new Exception('Saldo insuficiente');
            }
            
            // Debitar saldo
            $query = "UPDATE usuarios SET balance = balance - ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if (!$stmt->execute([$amount, $userId])) {
                throw new Exception('Erro ao debitar saldo');
            }
            
            // Criar transação de débito
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = 'debito';
            $this->transaction->valor = $amount;
            $this->transaction->descricao = $description;
            $this->transaction->status = 'concluida';
            
            if (!$this->transaction->create()) {
                throw new Exception('Erro ao criar transação');
            }
            
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    public function transferBalance($fromUserId, $toUserId, $amount, $description = 'Transferência') {
        try {
            $this->db->beginTransaction();
            
            // Debitar do remetente
            $this->debitBalance($fromUserId, $amount, $description . ' (enviado)');
            
            // Creditar ao destinatário
            $this->addBalance($toUserId, $amount, $description . ' (recebido)');
            
            $this->db->commit();
            return true;
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    public function getUserBalance($userId) {
        $this->user->id = $userId;
        if ($this->user->readOne()) {
            return $this->user->balance;
        }
        return 0;
    }
    
    public function getUserTransactions($userId, $limit = 20, $offset = 0) {
        return $this->transaction->getUserTransactions($userId, $limit, $offset);
    }
    
    public function getBalanceHistory($userId, $startDate = null, $endDate = null) {
        $query = "SELECT * FROM transacoes WHERE user_id = ?";
        $params = [$userId];
        
        if ($startDate) {
            $query .= " AND created_at >= ?";
            $params[] = $startDate;
        }
        
        if ($endDate) {
            $query .= " AND created_at <= ?";
            $params[] = $endDate;
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
