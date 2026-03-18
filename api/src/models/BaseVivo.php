<?php
// src/models/BaseVivo.php

class BaseVivo {
    private $db;
    private $table = 'base_vivo';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = [
            'cpf_id', 'telefone', 'data_primeira_recarga', 'data_ultima_recarga',
            'plano', 'numero', 'uf', 'tipo_pessoa', 'data_instalacao',
            'telefone_anterior', 'descricao_estado_linha', 'descricao_produto',
            'nome_assinante', 'descricao_email', 'tipo_endereco',
            'data_vigencia_inclusao', 'endereco', 'numero_endereco',
            'complemento', 'bairro', 'cep', 'maior_atraso',
            'menor_atraso', 'flag_divida', 'ano_mes_contrato', 'valor_fatura'
        ];
        
        $setFields = [];
        $values = [];
        
        if (isset($data['cpf_id'])) {
            $setFields[] = 'cpf_id';
            $values[] = $data['cpf_id'];
        }
        
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
            'telefone', 'data_primeira_recarga', 'data_ultima_recarga',
            'plano', 'numero', 'uf', 'tipo_pessoa', 'data_instalacao',
            'telefone_anterior', 'descricao_estado_linha', 'descricao_produto',
            'nome_assinante', 'descricao_email', 'tipo_endereco',
            'data_vigencia_inclusao', 'endereco', 'numero_endereco',
            'complemento', 'bairro', 'cep', 'maior_atraso',
            'menor_atraso', 'flag_divida', 'ano_mes_contrato', 'valor_fatura'
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
