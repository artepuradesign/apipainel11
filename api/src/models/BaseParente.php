<?php
// src/models/BaseParente.php

class BaseParente {
    private $db;
    private $table = 'base_parente';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " WHERE nome_vinculo LIKE ? OR cpf_vinculo LIKE ? OR vinculo LIKE ?";
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
            $sql .= " WHERE nome_vinculo LIKE ? OR cpf_vinculo LIKE ? OR vinculo LIKE ?";
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
        error_log("BASE_PARENTE MODEL: getByCpfId chamado com cpfId={$cpfId}");
        $sql = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cpfId]);
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        error_log("BASE_PARENTE MODEL: Query retornou " . count($result) . " registros");
        
        return $result;
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (cpf_id, cpf_vinculo, nome_vinculo, vinculo) 
                VALUES (?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['cpf_id'],
            $data['cpf_vinculo'] ?? null,
            $data['nome_vinculo'],
            $data['vinculo']
        ]);
        
        if ($result) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        if (isset($data['cpf_vinculo'])) {
            $fields[] = "cpf_vinculo = ?";
            $params[] = $data['cpf_vinculo'];
        }
        
        if (isset($data['nome_vinculo'])) {
            $fields[] = "nome_vinculo = ?";
            $params[] = $data['nome_vinculo'];
        }
        
        if (isset($data['vinculo'])) {
            $fields[] = "vinculo = ?";
            $params[] = $data['vinculo'];
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
