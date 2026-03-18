<?php
// src/models/BaseEmpresaSocio.php

class BaseEmpresaSocio {
    private $db;
    private $table = 'base_empresa_socio';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        $sql = "SELECT * FROM {$this->table}";
        $params = [];
        
        if (!empty($search)) {
            $sql .= " WHERE socio_nome LIKE ? OR socio_cpf LIKE ? OR empresa_cnpj LIKE ?";
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
            $sql .= " WHERE socio_nome LIKE ? OR socio_cpf LIKE ? OR empresa_cnpj LIKE ?";
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
        $sql = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY id ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $sql = "INSERT INTO {$this->table} (cpf_id, socio_nome, socio_cpf, socio_data_entrada, socio_qualificacao, empresa_cnpj) 
                VALUES (?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['cpf_id'],
            $data['socio_nome'] ?? null,
            $data['socio_cpf'] ?? null,
            $data['socio_data_entrada'] ?? null,
            $data['socio_qualificacao'] ?? null,
            $data['empresa_cnpj'] ?? null
        ]);
        
        if ($result) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $params = [];
        
        if (isset($data['socio_nome'])) {
            $fields[] = "socio_nome = ?";
            $params[] = $data['socio_nome'];
        }
        
        if (isset($data['socio_cpf'])) {
            $fields[] = "socio_cpf = ?";
            $params[] = $data['socio_cpf'];
        }
        
        if (isset($data['socio_data_entrada'])) {
            $fields[] = "socio_data_entrada = ?";
            $params[] = $data['socio_data_entrada'];
        }
        
        if (isset($data['socio_qualificacao'])) {
            $fields[] = "socio_qualificacao = ?";
            $params[] = $data['socio_qualificacao'];
        }
        
        if (isset($data['empresa_cnpj'])) {
            $fields[] = "empresa_cnpj = ?";
            $params[] = $data['empresa_cnpj'];
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
