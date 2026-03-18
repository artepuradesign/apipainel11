
<?php
// src/models/UserPlan.php

require_once 'BaseModel.php';

class UserPlan extends BaseModel {
    protected $table = 'user_plans';
    
    public $id;
    public $user_id;
    public $plan_id;
    public $status;
    public $start_date;
    public $end_date;
    public $auto_renew;
    public $features_used;
    public $limits_remaining;
    public $last_reset;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function assignPlanToUser($userId, $planId, $duration = 30) {
        // Desativar plano atual se existir
        $this->deactivateCurrentPlan($userId);
        
        $this->user_id = $userId;
        $this->plan_id = $planId;
        $this->status = 'ativo';
        $this->start_date = date('Y-m-d');
        $this->end_date = date('Y-m-d', strtotime("+{$duration} days"));
        $this->auto_renew = 1;
        $this->features_used = json_encode([]);
        $this->limits_remaining = $this->getPlanLimits($planId);
        $this->last_reset = date('Y-m-d');
        
        if ($this->create()) {
            // Atualizar tabela users (não usuarios)
            $query = "UPDATE users SET 
                     tipoplano = (SELECT name FROM plans WHERE id = ?), 
                     data_inicio = ?,
                     data_fim = ?,
                     updated_at = NOW()
                     WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$planId, $this->start_date, $this->end_date, $userId]);
            return true;
        }
        return false;
    }
    
    public function getUserActivePlan($userId) {
        $query = "SELECT up.*, p.name as plan_name, p.price, p.features, p.description
                 FROM {$this->table} up
                 JOIN plans p ON up.plan_id = p.id
                 WHERE up.user_id = ? AND up.status = 'ativo' 
                 AND up.end_date >= CURDATE()
                 ORDER BY up.created_at DESC LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
    
    public function checkFeatureAccess($userId, $featureName) {
        $activePlan = $this->getUserActivePlan($userId);
        if (!$activePlan) {
            return false;
        }
        
        $features = json_decode($activePlan['features'], true);
        return in_array($featureName, $features);
    }
    
    public function consumeFeature($userId, $featureName, $amount = 1) {
        $activePlan = $this->getUserActivePlan($userId);
        if (!$activePlan) {
            return false;
        }
        
        $limitsRemaining = json_decode($activePlan['limits_remaining'], true);
        $featuresUsed = json_decode($activePlan['features_used'], true);
        
        // Verificar se há limite para esta feature
        if (isset($limitsRemaining[$featureName])) {
            if ($limitsRemaining[$featureName] < $amount) {
                return false; // Limite excedido
            }
            $limitsRemaining[$featureName] -= $amount;
        }
        
        // Atualizar uso
        if (!isset($featuresUsed[$featureName])) {
            $featuresUsed[$featureName] = 0;
        }
        $featuresUsed[$featureName] += $amount;
        
        // Atualizar no banco
        $query = "UPDATE {$this->table} 
                 SET features_used = ?, limits_remaining = ? 
                 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            json_encode($featuresUsed),
            json_encode($limitsRemaining),
            $activePlan['id']
        ]);
    }
    
    public function resetMonthlyLimits($userId = null) {
        $whereClause = $userId ? "WHERE user_id = ?" : "";
        $params = $userId ? [$userId] : [];
        
        $query = "SELECT id, plan_id FROM {$this->table} 
                 WHERE status = 'ativo' {$whereClause}";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        $userPlans = $stmt->fetchAll();
        
        foreach ($userPlans as $userPlan) {
            $limits = $this->getPlanLimits($userPlan['plan_id']);
            
            $updateQuery = "UPDATE {$this->table} 
                           SET limits_remaining = ?, features_used = ?, last_reset = CURDATE()
                           WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([
                json_encode($limits),
                json_encode([]),
                $userPlan['id']
            ]);
        }
        
        return true;
    }
    
    public function renewPlan($userPlanId, $duration = 30) {
        $query = "UPDATE {$this->table} 
                 SET end_date = DATE_ADD(end_date, INTERVAL ? DAY)
                 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$duration, $userPlanId]);
    }
    
    public function upgradePlan($userId, $newPlanId) {
        $currentPlan = $this->getUserActivePlan($userId);
        if (!$currentPlan) {
            return $this->assignPlanToUser($userId, $newPlanId);
        }
        
        // Calcular dias restantes
        $endDate = new DateTime($currentPlan['end_date']);
        $today = new DateTime();
        $daysRemaining = $today->diff($endDate)->days;
        
        // Desativar plano atual
        $this->deactivateCurrentPlan($userId);
        
        // Criar novo plano com os dias restantes
        return $this->assignPlanToUser($userId, $newPlanId, $daysRemaining);
    }
    
    public function downgradePlan($userId, $newPlanId) {
        return $this->upgradePlan($userId, $newPlanId);
    }
    
    public function getExpiredPlans() {
        $query = "SELECT up.*, u.full_name, u.email, p.name as plan_name
                 FROM {$this->table} up
                 JOIN usuarios u ON up.user_id = u.id
                 JOIN plans p ON up.plan_id = p.id
                 WHERE up.status = 'ativo' AND up.end_date < CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getPlanUsageStats($userId) {
        $activePlan = $this->getUserActivePlan($userId);
        if (!$activePlan) {
            return null;
        }
        
        $featuresUsed = json_decode($activePlan['features_used'], true) ?? [];
        $limitsRemaining = json_decode($activePlan['limits_remaining'], true) ?? [];
        
        $stats = [];
        foreach ($limitsRemaining as $feature => $remaining) {
            $used = $featuresUsed[$feature] ?? 0;
            $total = $used + $remaining;
            $stats[$feature] = [
                'used' => $used,
                'remaining' => $remaining,
                'total' => $total,
                'percentage' => $total > 0 ? ($used / $total) * 100 : 0
            ];
        }
        
        return $stats;
    }
    
    private function deactivateCurrentPlan($userId) {
        $query = "UPDATE {$this->table} SET status = 'inativo' WHERE user_id = ? AND status = 'ativo'";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$userId]);
    }
    
    private function getPlanLimits($planId) {
        $query = "SELECT features FROM plans WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$planId]);
        $plan = $stmt->fetch();
        
        if (!$plan) {
            return [];
        }
        
        // Converter features em limites (exemplo)
        $features = json_decode($plan['features'], true);
        $limits = [];
        
        foreach ($features as $feature) {
            if (strpos($feature, 'consultas') !== false) {
                if (strpos($feature, 'ilimitadas') !== false) {
                    $limits['consultas'] = -1; // Ilimitado
                } else {
                    preg_match('/(\d+)/', $feature, $matches);
                    $limits['consultas'] = $matches[1] ?? 0;
                }
            }
        }
        
        return $limits;
    }
}
