
<?php
// src/models/Consultation.php

require_once 'BaseModel.php';

class Consultation extends BaseModel {
    protected $table = 'consultations';
    
    public function getByUser($userId, $limit = 50) {
        $query = "SELECT c.*, m.title as module_title FROM {$this->table} c 
                 LEFT JOIN modules m ON c.module_id = m.id 
                 WHERE c.user_id = ? 
                 ORDER BY c.created_at DESC LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByType($type, $limit = 100) {
        return $this->getAll(['type' => $type], 'created_at DESC', $limit);
    }
    
    public function getSuccessRate($userId = null, $moduleId = null) {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful
                  FROM {$this->table} WHERE 1=1";
        $params = [];
        
        if ($userId) {
            $query .= " AND user_id = ?";
            $params[] = $userId;
        }
        
        if ($moduleId) {
            $query .= " AND module_id = ?";
            $params[] = $moduleId;
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            return ($result['successful'] / $result['total']) * 100;
        }
        
        return 0;
    }
    
    public function getTotalCost($userId, $startDate = null, $endDate = null) {
        $query = "SELECT SUM(cost) as total_cost FROM {$this->table} WHERE user_id = ?";
        $params = [$userId];
        
        if ($startDate) {
            $query .= " AND created_at >= ?";
            $params[] = $startDate;
        }
        
        if ($endDate) {
            $query .= " AND created_at <= ?";
            $params[] = $endDate;
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total_cost'] ?? 0;
    }
}
