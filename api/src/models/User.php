
<?php
// src/models/User.php

require_once 'BaseModel.php';

class User extends BaseModel {
    protected $table = 'users';
    
    public function findByEmail($email) {
        $query = "SELECT * FROM {$this->table} WHERE email = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function findByReferralCode($code) {
        $query = "SELECT * FROM {$this->table} WHERE codigo_indicacao = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateLastLogin($userId) {
        $query = "UPDATE {$this->table} SET ultimo_login = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$userId]);
    }
    
    /**
     * Buscar usuário por ID e definir como objeto atual
     */
    public function readOne() {
        if (!isset($this->id)) {
            return false;
        }
        
        $user = $this->findById($this->id);
        if ($user) {
            // Definir propriedades do objeto
            foreach ($user as $key => $value) {
                $this->$key = $value;
            }
            return true;
        }
        
        return false;
    }
}
