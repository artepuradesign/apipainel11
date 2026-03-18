<?php
// src/models/BaseBo.php

class BaseBo {
    private $db;
    private $table = 'base_bo';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " WHERE numero_ano LIKE ? OR unidade LIKE ? OR natureza LIKE ?";
            $searchParam = "%{$search}%";
            $params = [$searchParam, $searchParam, $searchParam];
        }
        
        $sql .= " ORDER BY id DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getCount($search = '') {
        $sql = "SELECT COUNT(*) as total FROM {$this->table}";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " WHERE numero_ano LIKE ? OR unidade LIKE ? OR natureza LIKE ?";
            $searchParam = "%{$search}%";
            $params = [$searchParam, $searchParam, $searchParam];
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return (int) $result['total'];
    }
    
    public function getById($id) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByCpfId($cpfId) {
        $sql = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY data_registro DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} 
                (cpf_id, numero_ano, unidade, data_fato, data_registro, natureza, bo_link) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['cpf_id'],
            $data['numero_ano'] ?? null,
            $data['unidade'] ?? null,
            $data['data_fato'] ?? null,
            $data['data_registro'] ?? null,
            $data['natureza'] ?? null,
            $data['bo_link'] ?? null
        ]);
        
        if ($result) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        $allowedFields = ['numero_ano', 'unidade', 'data_fato', 'data_registro', 'natureza', 'bo_link'];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $params[] = $id;
        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }
    
    public function delete($id) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        
        return $stmt->execute([$id]);
    }
}
