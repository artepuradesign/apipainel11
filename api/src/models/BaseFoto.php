<?php
// src/models/BaseFoto.php

class BaseFoto {
    private $db;
    private $table = 'base_foto';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY id ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $query = "INSERT INTO {$this->table} (cpf_id, cpf, nome, photo) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['cpf_id'],
            $data['cpf'] ?? null,
            $data['nome'] ?? null,
            $data['photo'] ?? null
        ]);
        
        return $this->db->lastInsertId();
    }
    
    public function update($id, $data) {
        $setFields = [];
        $values = [];
        
        if (isset($data['nome'])) {
            $setFields[] = "nome = ?";
            $values[] = $data['nome'];
        }
        
        if (isset($data['photo'])) {
            $setFields[] = "photo = ?";
            $values[] = $data['photo'];
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
    
    public function findByCpfAndNome($cpfId, $nome) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? AND nome = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId, $nome]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
