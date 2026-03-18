
<?php
// src/models/Transaction.php

require_once 'BaseModel.php';

class Transaction extends BaseModel {
    protected $table = 'transacoes';
    
    public $id;
    public $user_id;
    public $tipo;
    public $valor;
    public $descricao;
    public $status;
    public $reference;
    public $metadata;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserTransactions($userId, $limit = 20, $offset = 0) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll();
    }
    
    public function getTotalByUser($userId) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch()['total'];
    }
    
    public function getBalanceByUser($userId) {
        $query = "SELECT 
                    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_credito,
                    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debito
                  FROM {$this->table} WHERE user_id = ? AND status = 'concluida'";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
}
