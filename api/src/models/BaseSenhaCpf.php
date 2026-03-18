<?php
// src/models/BaseSenhaCpf.php

class BaseSenhaCpf {
    private $db;
    private $table = 'base_senha_cpf';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = ['cpf_id', 'cpf', 'senha', 'observacao'];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setFields[] = $field;
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('Nenhum campo válido fornecido');
        }
        
        $placeholders = str_repeat('?,', count($setFields) - 1) . '?';
        $query = "INSERT INTO {$this->table} (" . implode(',', $setFields) . ") VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($values);
        
        return $this->db->lastInsertId();
    }
    
    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByCpf($cpf) {
        $query = "SELECT * FROM {$this->table} WHERE cpf = ? ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpf]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        $fields = ['cpf', 'senha', 'observacao'];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setFields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('Nenhum campo válido fornecido');
        }
        
        $values[] = $id;
        $query = "UPDATE {$this->table} SET " . implode(',', $setFields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($query);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$id]);
    }
    
    public function deleteByCpfId($cpfId) {
        $query = "DELETE FROM {$this->table} WHERE cpf_id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$cpfId]);
    }
}
