<?php
// src/models/BaseAuxilio.php

class BaseAuxilio {
    private $db;
    private $table = 'base_auxilio';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = [
            'cpf_id', 'uf', 'mes_disponibilizacao', 'enquadramento', 
            'parcela', 'observacao', 'valor_beneficio'
        ];
        
        $setFields = [];
        $values = [];
        
        // cpf_id obrigatório
        if (isset($data['cpf_id'])) {
            $setFields[] = 'cpf_id';
            $values[] = $data['cpf_id'];
        }
        
        // Demais campos são opcionais
        foreach ($fields as $field) {
            if ($field !== 'cpf_id' && isset($data[$field])) {
                $setFields[] = $field;
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('cpf_id é obrigatório');
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
    
    public function update($id, $data) {
        $fields = [
            'uf', 'mes_disponibilizacao', 'enquadramento', 
            'parcela', 'observacao', 'valor_beneficio'
        ];
        
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
