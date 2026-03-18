
<?php
// src/models/Consulta.php

require_once 'BaseModel.php';

class Consulta extends BaseModel {
    protected $table = 'consultas';
    
    public $id;
    public $user_id;
    public $tipo;
    public $documento;
    public $status;
    public $custo;
    public $resultado;
    public $ip_address;
    public $user_agent;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserConsultations($userId, $limit = 20, $offset = 0) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        return $stmt->fetchAll();
    }
    
    public function getTodayConsultations($userId = null) {
        $query = "SELECT COUNT(*) as total FROM {$this->table} 
                 WHERE DATE(created_at) = CURDATE()";
        $params = [];
        
        if ($userId) {
            $query .= " AND user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch()['total'];
    }
    
    public function getConsultationsByType($type, $limit = 100) {
        $query = "SELECT * FROM {$this->table} WHERE tipo = ? 
                 ORDER BY created_at DESC LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$type, $limit]);
        return $stmt->fetchAll();
    }
}
