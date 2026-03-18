<?php
// src/models/BaseCnpj.php

class BaseCnpj {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getByCnpj($cnpj) {
        $stmt = $this->db->prepare("
            SELECT * FROM base_cnpj 
            WHERE cnpj = ? 
            LIMIT 1
        ");
        $stmt->bind_param("s", $cnpj);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            // Decodificar JSON dos sócios se existir
            if (!empty($row['socios'])) {
                $row['socios'] = json_decode($row['socios'], true);
            }
            
            return $row;
        }
        
        return null;
    }
    
    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT * FROM base_cnpj 
            WHERE id = ? 
            LIMIT 1
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            
            // Decodificar JSON dos sócios se existir
            if (!empty($row['socios'])) {
                $row['socios'] = json_decode($row['socios'], true);
            }
            
            return $row;
        }
        
        return null;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        if (!empty($search)) {
            $searchParam = "%{$search}%";
            $stmt = $this->db->prepare("
                SELECT * FROM base_cnpj 
                WHERE cnpj LIKE ? 
                   OR razao_social LIKE ? 
                   OR nome_fantasia LIKE ?
                ORDER BY id DESC 
                LIMIT ? OFFSET ?
            ");
            $stmt->bind_param("sssii", $searchParam, $searchParam, $searchParam, $limit, $offset);
        } else {
            $stmt = $this->db->prepare("
                SELECT * FROM base_cnpj 
                ORDER BY id DESC 
                LIMIT ? OFFSET ?
            ");
            $stmt->bind_param("ii", $limit, $offset);
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $cnpjs = [];
        
        while ($row = $result->fetch_assoc()) {
            // Decodificar JSON dos sócios se existir
            if (!empty($row['socios'])) {
                $row['socios'] = json_decode($row['socios'], true);
            }
            $cnpjs[] = $row;
        }
        
        return $cnpjs;
    }
    
    public function getCount($search = '') {
        if (!empty($search)) {
            $searchParam = "%{$search}%";
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as total FROM base_cnpj 
                WHERE cnpj LIKE ? 
                   OR razao_social LIKE ? 
                   OR nome_fantasia LIKE ?
            ");
            $stmt->bind_param("sss", $searchParam, $searchParam, $searchParam);
        } else {
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM base_cnpj");
        }
        
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return (int)$row['total'];
    }
    
    public function create($data) {
        // Codificar sócios para JSON se existir
        $socios = null;
        if (isset($data['socios']) && is_array($data['socios'])) {
            $socios = json_encode($data['socios']);
        }
        
        $stmt = $this->db->prepare("
            INSERT INTO base_cnpj (
                cnpj, razao_social, nome_fantasia, natureza_juridica,
                capital_social, data_inicio, porte, tipo,
                telefone_1, telefone_2, email, situacao,
                situacao_data, situacao_motivo, logradouro, numero,
                complemento, bairro, cep, uf, municipio, mei, socios
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->bind_param(
            "ssssdssssssssssssssssss",
            $data['cnpj'],
            $data['razao_social'],
            $data['nome_fantasia'],
            $data['natureza_juridica'],
            $data['capital_social'],
            $data['data_inicio'],
            $data['porte'],
            $data['tipo'],
            $data['telefone_1'],
            $data['telefone_2'],
            $data['email'],
            $data['situacao'],
            $data['situacao_data'],
            $data['situacao_motivo'],
            $data['logradouro'],
            $data['numero'],
            $data['complemento'],
            $data['bairro'],
            $data['cep'],
            $data['uf'],
            $data['municipio'],
            $data['mei'],
            $socios
        );
        
        if ($stmt->execute()) {
            return $this->db->insert_id;
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $fields = [];
        $values = [];
        $types = '';
        
        $allowedFields = [
            'cnpj', 'razao_social', 'nome_fantasia', 'natureza_juridica',
            'capital_social', 'data_inicio', 'porte', 'tipo',
            'telefone_1', 'telefone_2', 'email', 'situacao',
            'situacao_data', 'situacao_motivo', 'logradouro', 'numero',
            'complemento', 'bairro', 'cep', 'uf', 'municipio', 'mei', 'socios'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                
                if ($field === 'socios' && is_array($data[$field])) {
                    $values[] = json_encode($data[$field]);
                    $types .= 's';
                } else if ($field === 'capital_social') {
                    $values[] = $data[$field];
                    $types .= 'd';
                } else {
                    $values[] = $data[$field];
                    $types .= 's';
                }
            }
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $types .= 'i';
        
        $sql = "UPDATE base_cnpj SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM base_cnpj WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
