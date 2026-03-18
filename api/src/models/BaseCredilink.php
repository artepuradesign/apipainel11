<?php
// src/models/BaseCredilink.php

class BaseCredilink {
    private $db;
    private $table = 'base_credilink';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        try {
            $sql = "SELECT * FROM {$this->table}";
            $params = [];
            
            if (!empty($search)) {
                $sql .= " WHERE nome LIKE ? OR email LIKE ? OR telefones LIKE ?";
                $searchParam = "%{$search}%";
                $params = [$searchParam, $searchParam, $searchParam];
            }
            
            $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar registros Credilink: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados Credilink');
        }
    }
    
    public function getCount($search = '') {
        try {
            $sql = "SELECT COUNT(*) FROM {$this->table}";
            $params = [];
            
            if (!empty($search)) {
                $sql .= " WHERE nome LIKE ? OR email LIKE ? OR telefones LIKE ?";
                $searchParam = "%{$search}%";
                $params = [$searchParam, $searchParam, $searchParam];
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Erro ao contar registros Credilink: " . $e->getMessage());
            throw new Exception('Erro ao contar dados Credilink');
        }
    }
    
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar Credilink por ID: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados Credilink');
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY created_at DESC");
            $stmt->execute([$cpfId]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar Credilink por CPF ID: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados Credilink');
        }
    }
    
    public function create($data) {
        try {
            $fields = [
                'cpf_id', 'nome', 'nome_mae', 'email', 'data_obito',
                'status_receita_federal', 'percentual_participacao', 'cbo',
                'renda_presumida', 'telefones', 'uf', 'estado', 'cidade',
                'tipo_endereco', 'logradouro', 'complemento', 'bairro',
                'numero', 'cep'
            ];
            
            $validData = [];
            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $validData[$field] = $data[$field];
                }
            }
            
            if (empty($validData['cpf_id'])) {
                throw new Exception('CPF ID é obrigatório');
            }
            
            $columns = implode(', ', array_keys($validData));
            $placeholders = ':' . implode(', :', array_keys($validData));
            
            $sql = "INSERT INTO {$this->table} ({$columns}) VALUES ({$placeholders})";
            $stmt = $this->db->prepare($sql);
            
            foreach ($validData as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            
            $stmt->execute();
            
            return $this->db->lastInsertId();
        } catch (PDOException $e) {
            error_log("Erro ao criar Credilink: " . $e->getMessage());
            throw new Exception('Erro ao criar dados Credilink: ' . $e->getMessage());
        }
    }
    
    public function update($id, $data) {
        try {
            $fields = [
                'nome', 'nome_mae', 'email', 'data_obito',
                'status_receita_federal', 'percentual_participacao', 'cbo',
                'renda_presumida', 'telefones', 'uf', 'estado', 'cidade',
                'tipo_endereco', 'logradouro', 'complemento', 'bairro',
                'numero', 'cep'
            ];
            
            $validData = [];
            foreach ($fields as $field) {
                if (array_key_exists($field, $data)) {
                    $validData[$field] = $data[$field];
                }
            }
            
            if (empty($validData)) {
                throw new Exception('Nenhum dado válido fornecido para atualização');
            }
            
            $setParts = [];
            foreach ($validData as $key => $value) {
                $setParts[] = "{$key} = :{$key}";
            }
            $setClause = implode(', ', $setParts);
            
            $sql = "UPDATE {$this->table} SET {$setClause} WHERE id = :id";
            $stmt = $this->db->prepare($sql);
            
            foreach ($validData as $key => $value) {
                $stmt->bindValue(":{$key}", $value);
            }
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            
            $stmt->execute();
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Erro ao atualizar Credilink: " . $e->getMessage());
            throw new Exception('Erro ao atualizar dados Credilink: ' . $e->getMessage());
        }
    }
    
    public function delete($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Erro ao deletar Credilink: " . $e->getMessage());
            throw new Exception('Erro ao deletar dados Credilink');
        }
    }
    
    public function deleteByCpfId($cpfId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE cpf_id = ?");
            $stmt->execute([$cpfId]);
            
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Erro ao deletar Credilink por CPF ID: " . $e->getMessage());
            throw new Exception('Erro ao deletar dados Credilink');
        }
    }
}