
<?php
// src/models/CentralCash.php

require_once 'BaseModel.php';

class CentralCash extends BaseModel {
    protected $table = 'central_cash';
    
    public $id;
    public $total_balance;
    public $reserved_balance;
    public $available_balance;
    public $daily_transactions;
    public $monthly_transactions;
    public $last_update;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getCurrentBalance() {
        $query = "SELECT * FROM {$this->table} ORDER BY last_update DESC LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        
        if ($result) {
            foreach ($result as $key => $value) {
                if (property_exists($this, $key)) {
                    $this->$key = $value;
                }
            }
            return true;
        }
        
        // Se não existir registro, criar o primeiro
        return $this->initializeCash();
    }
    
    public function updateBalance($amount, $type = 'add') {
        if (!$this->getCurrentBalance()) {
            return false;
        }
        
        if ($type === 'add') {
            $this->total_balance += $amount;
            $this->available_balance += $amount;
        } else {
            $this->total_balance -= $amount;
            $this->available_balance -= $amount;
        }
        
        $this->last_update = date('Y-m-d H:i:s');
        return $this->update();
    }
    
    public function reserveBalance($amount) {
        if (!$this->getCurrentBalance()) {
            return false;
        }
        
        if ($this->available_balance < $amount) {
            return false; // Saldo insuficiente
        }
        
        $this->available_balance -= $amount;
        $this->reserved_balance += $amount;
        $this->last_update = date('Y-m-d H:i:s');
        
        return $this->update();
    }
    
    public function releaseReservedBalance($amount) {
        if (!$this->getCurrentBalance()) {
            return false;
        }
        
        $this->reserved_balance -= $amount;
        $this->available_balance += $amount;
        $this->last_update = date('Y-m-d H:i:s');
        
        return $this->update();
    }
    
    public function confirmTransaction($amount) {
        if (!$this->getCurrentBalance()) {
            return false;
        }
        
        $this->reserved_balance -= $amount;
        $this->total_balance -= $amount;
        $this->daily_transactions++;
        $this->monthly_transactions++;
        $this->last_update = date('Y-m-d H:i:s');
        
        return $this->update();
    }
    
    public function getDailyStats() {
        $query = "SELECT 
                    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_credit,
                    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debit,
                    COUNT(*) as total_transactions
                 FROM transacoes 
                 WHERE DATE(created_at) = CURDATE() AND status = 'concluida'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    public function getMonthlyStats() {
        $query = "SELECT 
                    SUM(CASE WHEN tipo = 'credito' THEN valor ELSE 0 END) as total_credit,
                    SUM(CASE WHEN tipo = 'debito' THEN valor ELSE 0 END) as total_debit,
                    COUNT(*) as total_transactions
                 FROM transacoes 
                 WHERE MONTH(created_at) = MONTH(CURDATE()) 
                 AND YEAR(created_at) = YEAR(CURDATE()) 
                 AND status = 'concluida'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetch();
    }
    
    private function initializeCash() {
        $this->total_balance = 0.00;
        $this->reserved_balance = 0.00;
        $this->available_balance = 0.00;
        $this->daily_transactions = 0;
        $this->monthly_transactions = 0;
        $this->last_update = date('Y-m-d H:i:s');
        
        return $this->create();
    }
    
    public function resetDailyCounters() {
        $this->daily_transactions = 0;
        $this->last_update = date('Y-m-d H:i:s');
        return $this->update();
    }
    
    public function resetMonthlyCounters() {
        $this->monthly_transactions = 0;
        $this->last_update = date('Y-m-d H:i:s');
        return $this->update();
    }
}
