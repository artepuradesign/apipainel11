
<?php
// src/models/RateLimit.php

require_once 'BaseModel.php';

class RateLimit extends BaseModel {
    protected $table = 'rate_limits';
    
    public $id;
    public $identifier;
    public $endpoint;
    public $requests;
    public $window_start;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function checkRateLimit($identifier, $endpoint, $maxRequests, $windowMinutes) {
        $windowStart = date('Y-m-d H:i:s', strtotime("-{$windowMinutes} minutes"));
        
        // Limpar registros antigos
        $this->cleanOldRecords($windowStart);
        
        // Contar requisições na janela atual
        $query = "SELECT COUNT(*) as count FROM {$this->table} 
                 WHERE identifier = ? AND endpoint = ? AND window_start >= ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier, $endpoint, $windowStart]);
        $result = $stmt->fetch();
        
        $currentRequests = $result['count'];
        
        if ($currentRequests >= $maxRequests) {
            return false; // Rate limit excedido
        }
        
        // Registrar a requisição atual
        $this->identifier = $identifier;
        $this->endpoint = $endpoint;
        $this->requests = 1;
        $this->window_start = date('Y-m-d H:i:s');
        $this->create();
        
        return true;
    }
    
    public function getRemainingRequests($identifier, $endpoint, $maxRequests) {
        $windowStart = date('Y-m-d H:i:s', strtotime('-1 minute'));
        
        $query = "SELECT COUNT(*) as count FROM {$this->table} 
                 WHERE identifier = ? AND endpoint = ? AND window_start >= ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier, $endpoint, $windowStart]);
        $result = $stmt->fetch();
        
        $currentRequests = $result['count'];
        return max(0, $maxRequests - $currentRequests);
    }
    
    public function cleanOldRecords($windowStart) {
        $query = "DELETE FROM {$this->table} WHERE window_start < ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$windowStart]);
    }
    
    public function getTopLimiters($limit = 10) {
        $query = "SELECT identifier, endpoint, COUNT(*) as total_requests
                 FROM {$this->table} 
                 WHERE window_start >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
                 GROUP BY identifier, endpoint
                 ORDER BY total_requests DESC
                 LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
