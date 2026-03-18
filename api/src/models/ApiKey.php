
<?php
// src/models/ApiKey.php

require_once 'BaseModel.php';

class ApiKey extends BaseModel {
    protected $table = 'api_keys';
    
    public $id;
    public $user_id;
    public $name;
    public $key;
    public $permissions;
    public $status;
    public $last_used;
    public $expires_at;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function validateKey($apiKey) {
        $query = "SELECT ak.*, u.status as user_status 
                 FROM {$this->table} ak
                 JOIN usuarios u ON ak.user_id = u.id
                 WHERE ak.key = ? AND ak.status = 'ativo' 
                 AND u.status = 'ativo'
                 AND (ak.expires_at IS NULL OR ak.expires_at > NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$apiKey]);
        return $stmt->fetch();
    }
    
    public function updateLastUsed($keyId) {
        $query = "UPDATE {$this->table} SET last_used = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$keyId]);
    }
    
    public function getUserKeys($userId) {
        $query = "SELECT id, name, LEFT(`key`, 10) as key_preview, permissions, 
                         status, created_at, last_used, expires_at
                 FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function revokeKey($keyId, $userId) {
        $query = "UPDATE {$this->table} SET status = 'revogada' 
                 WHERE id = ? AND user_id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$keyId, $userId]);
    }
}
