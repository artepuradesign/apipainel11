
<?php
// src/models/SystemLog.php

require_once 'BaseModel.php';

class SystemLog extends BaseModel {
    protected $table = 'system_logs';
    
    public $id;
    public $user_id;
    public $action;
    public $description;
    public $ip_address;
    public $user_agent;
    public $level;
    public $context;
    public $created_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function log($action, $description, $userId = null, $level = 'info', $context = null) {
        $this->user_id = $userId;
        $this->action = $action;
        $this->description = $description;
        $this->ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $this->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        $this->level = $level;
        $this->context = $context ? json_encode($context) : null;
        
        return $this->create();
    }
    
    public function getRecentLogs($limit = 100, $level = null) {
        $query = "SELECT sl.*, u.full_name 
                 FROM {$this->table} sl
                 LEFT JOIN usuarios u ON sl.user_id = u.id";
        
        if ($level) {
            $query .= " WHERE sl.level = ?";
        }
        
        $query .= " ORDER BY sl.created_at DESC LIMIT ?";
        
        $stmt = $this->db->prepare($query);
        $params = $level ? [$level, $limit] : [$limit];
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function getUserLogs($userId, $limit = 50) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }
    
    public function cleanOldLogs($days = 30) {
        $query = "DELETE FROM {$this->table} WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$days]);
    }
}
