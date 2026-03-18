
<?php
// src/models/Payment.php

require_once 'BaseModel.php';

class Payment extends BaseModel {
    protected $table = 'payments';
    
    public $id;
    public $user_id;
    public $amount;
    public $method;
    public $status;
    public $reference;
    public $gateway_response;
    public $metadata;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserPayments($userId, $limit = 20, $offset = 0) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll();
    }
    
    public function getTotalRevenue() {
        $query = "SELECT SUM(amount) as total FROM {$this->table} 
                 WHERE status = 'concluido'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch()['total'] ?? 0;
    }
    
    public function getPaymentsByStatus($status) {
        $query = "SELECT * FROM {$this->table} WHERE status = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$status]);
        return $stmt->fetchAll();
    }
}
