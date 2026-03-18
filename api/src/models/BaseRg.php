<?php
// src/models/BaseRg.php

class BaseRg {
    private $db;
    private $table = 'base_rg';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = [
            'cpf_id', 'mai', 'rg', 'dni', 'dt_expedicao', 'nome', 'filiacao',
            'naturalidade', 'dt_nascimento', 'registro_civil', 'titulo_eleitor',
            'titulo_zona', 'titulo_secao', 'ctps', 'ctps_serie', 'ctps_uf',
            'nis', 'pis', 'pasep', 'rg_profissional', 'cert_militar', 'cnh',
            'cns', 'rg_anterior', 'via_p', 'via', 'diretor', 'orgao_expedidor',
            'uf_emissao', 'fator_rh', 'qrcode', 'numeracao_folha', 'observacao'
        ];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $value = $data[$field];
                
                // Tratar strings vazias como NULL para campos não obrigatórios
                if ($value === '' && $field !== 'cpf_id' && $field !== 'nome') {
                    $value = null;
                }
                
                // Tratar formatação de datas
                if (($field === 'dt_expedicao' || $field === 'dt_nascimento') && !empty($value)) {
                    // Converter formato dd/mm/yyyy para yyyy-mm-dd
                    if (strpos($value, '/') !== false) {
                        $parts = explode('/', $value);
                        if (count($parts) === 3 && strlen($parts[2]) === 4) {
                            $value = $parts[2] . '-' . str_pad($parts[1], 2, '0', STR_PAD_LEFT) . '-' . str_pad($parts[0], 2, '0', STR_PAD_LEFT);
                        }
                    }
                }
                
                $setFields[] = $field;
                $values[] = $value;
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('Nenhum campo válido fornecido');
        }
        
        // Verificar se cpf_id foi fornecido
        if (!isset($data['cpf_id']) || empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        $placeholders = str_repeat('?,', count($setFields) - 1) . '?';
        $query = "INSERT INTO {$this->table} (" . implode(',', $setFields) . ") VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($values);
        
        return $this->db->lastInsertId();
    }
    
    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function update($id, $data) {
        $fields = [
            'mai', 'rg', 'dni', 'dt_expedicao', 'nome', 'filiacao',
            'naturalidade', 'dt_nascimento', 'registro_civil', 'titulo_eleitor',
            'titulo_zona', 'titulo_secao', 'ctps', 'ctps_serie', 'ctps_uf',
            'nis', 'pis', 'pasep', 'rg_profissional', 'cert_militar', 'cnh',
            'cns', 'rg_anterior', 'via_p', 'via', 'diretor', 'orgao_expedidor',
            'uf_emissao', 'fator_rh', 'qrcode', 'numeracao_folha', 'observacao'
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