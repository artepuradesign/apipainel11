<?php
// src/models/BaseDividasAtivas.php

class BaseDividasAtivas {
    private $db;
    private $table = 'base_dividas_ativas';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = [
            'cpf_id', 'tipo_devedor', 'nome_devedor', 'uf_devedor', 
            'numero_inscricao', 'tipo_situacao_inscricao', 'situacao_inscricao', 
            'receita_principal', 'data_inscricao', 'indicador_ajuizado', 'valor_consolidado'
        ];
        
        $setFields = [];
        $values = [];
        
        // Sempre incluir cpf_id se estiver presente
        if (isset($data['cpf_id'])) {
            $setFields[] = 'cpf_id';
            $values[] = $data['cpf_id'];
        }
        
        // Para os demais campos, aceitar até mesmo valores vazios
        foreach ($fields as $field) {
            if ($field !== 'cpf_id' && isset($data[$field])) {
                $setFields[] = $field;
                // Aceitar qualquer valor, incluindo strings vazias
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        $placeholders = str_repeat('?,', count($setFields) - 1) . '?';
        $query = "INSERT INTO {$this->table} (" . implode(',', $setFields) . ") VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($values);
        
        return $this->db->lastInsertId();
    }
    
    public function getByCpf($cpf) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpf]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        $fields = [
            'tipo_devedor', 'nome_devedor', 'uf_devedor', 
            'numero_inscricao', 'tipo_situacao_inscricao', 'situacao_inscricao', 
            'receita_principal', 'data_inscricao', 'indicador_ajuizado', 'valor_consolidado'
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
    
    public function deleteByCpf($cpf) {
        $query = "DELETE FROM {$this->table} WHERE cpf_id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$cpf]);
    }
}