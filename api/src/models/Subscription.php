
<?php
// src/models/Subscription.php

require_once 'BaseModel.php';

class Subscription extends BaseModel {
    protected $table = 'subscriptions';
    
    public $id;
    public $user_id;
    public $plan_id;
    public $status;
    public $start_date;
    public $end_date;
    public $next_billing_date;
    public $amount;
    public $billing_cycle;
    public $auto_renew;
    public $cancelled_at;
    public $cancellation_reason;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function createSubscription($userId, $planId, $amount, $billingCycle = 'monthly') {
        $this->user_id = $userId;
        $this->plan_id = $planId;
        $this->status = 'active';
        $this->start_date = date('Y-m-d');
        $this->amount = $amount;
        $this->billing_cycle = $billingCycle;
        $this->auto_renew = 1;
        
        // Calcular próxima data de cobrança
        switch ($billingCycle) {
            case 'monthly':
                $this->end_date = date('Y-m-d', strtotime('+1 month'));
                $this->next_billing_date = date('Y-m-d', strtotime('+1 month'));
                break;
            case 'quarterly':
                $this->end_date = date('Y-m-d', strtotime('+3 months'));
                $this->next_billing_date = date('Y-m-d', strtotime('+3 months'));
                break;
            case 'yearly':
                $this->end_date = date('Y-m-d', strtotime('+1 year'));
                $this->next_billing_date = date('Y-m-d', strtotime('+1 year'));
                break;
        }
        
        return $this->create();
    }
    
    public function getUserActiveSubscription($userId) {
        $query = "SELECT s.*, p.name as plan_name, p.features 
                 FROM {$this->table} s
                 JOIN plans p ON s.plan_id = p.id
                 WHERE s.user_id = ? AND s.status = 'active' 
                 AND s.end_date >= CURDATE()
                 ORDER BY s.created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
    
    public function renewSubscription() {
        if ($this->status !== 'active' || !$this->auto_renew) {
            return false;
        }
        
        // Estender as datas baseado no ciclo de cobrança
        switch ($this->billing_cycle) {
            case 'monthly':
                $this->end_date = date('Y-m-d', strtotime($this->end_date . ' +1 month'));
                $this->next_billing_date = date('Y-m-d', strtotime($this->next_billing_date . ' +1 month'));
                break;
            case 'quarterly':
                $this->end_date = date('Y-m-d', strtotime($this->end_date . ' +3 months'));
                $this->next_billing_date = date('Y-m-d', strtotime($this->next_billing_date . ' +3 months'));
                break;
            case 'yearly':
                $this->end_date = date('Y-m-d', strtotime($this->end_date . ' +1 year'));
                $this->next_billing_date = date('Y-m-d', strtotime($this->next_billing_date . ' +1 year'));
                break;
        }
        
        return $this->update();
    }
    
    public function cancelSubscription($reason = null) {
        $this->status = 'cancelled';
        $this->auto_renew = 0;
        $this->cancelled_at = date('Y-m-d H:i:s');
        $this->cancellation_reason = $reason;
        
        return $this->update();
    }
    
    public function pauseSubscription() {
        $this->status = 'paused';
        return $this->update();
    }
    
    public function resumeSubscription() {
        $this->status = 'active';
        return $this->update();
    }
    
    public function getSubscriptionsForRenewal($daysAhead = 3) {
        $targetDate = date('Y-m-d', strtotime("+{$daysAhead} days"));
        
        $query = "SELECT s.*, u.email, u.full_name, p.name as plan_name
                 FROM {$this->table} s
                 JOIN usuarios u ON s.user_id = u.id
                 JOIN plans p ON s.plan_id = p.id
                 WHERE s.status = 'active' 
                 AND s.auto_renew = 1 
                 AND s.next_billing_date <= ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$targetDate]);
        return $stmt->fetchAll();
    }
    
    public function getExpiredSubscriptions() {
        $query = "SELECT s.*, u.email, u.full_name
                 FROM {$this->table} s
                 JOIN usuarios u ON s.user_id = u.id
                 WHERE s.status = 'active' 
                 AND s.end_date < CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getSubscriptionStats() {
        $stats = [];
        
        // Total de assinaturas ativas
        $query = "SELECT COUNT(*) as total FROM {$this->table} WHERE status = 'active'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['active_subscriptions'] = $stmt->fetch()['total'];
        
        // Receita mensal recorrente
        $query = "SELECT SUM(amount) as total FROM {$this->table} 
                 WHERE status = 'active' AND billing_cycle = 'monthly'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['monthly_recurring_revenue'] = $stmt->fetch()['total'] ?? 0;
        
        // Taxa de cancelamento
        $query = "SELECT 
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
                    COUNT(*) as total
                 FROM {$this->table} 
                 WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch();
        $stats['churn_rate'] = $result['total'] > 0 ? ($result['cancelled'] / $result['total']) * 100 : 0;
        
        return $stats;
    }
}
