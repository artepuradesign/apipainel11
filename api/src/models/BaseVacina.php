<?php
// src/models/BaseVacina.php

class BaseVacina {
    private $db;
    private $table = 'base_vacina';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        try {
            $sql = "SELECT * FROM {$this->table}";
            $params = [];
            
            if (!empty($search)) {
                $sql .= " WHERE nome_vacina LIKE ? OR aplicador_vacina LIKE ? OR nome_estabelecimento LIKE ?";
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
            error_log("Erro ao buscar registros Vacina: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados de vacina');
        }
    }
    
    public function getCount($search = '') {
        try {
            $sql = "SELECT COUNT(*) FROM {$this->table}";
            $params = [];
            
            if (!empty($search)) {
                $sql .= " WHERE nome_vacina LIKE ? OR aplicador_vacina LIKE ? OR nome_estabelecimento LIKE ?";
                $searchParam = "%{$search}%";
                $params = [$searchParam, $searchParam, $searchParam];
            }
            
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
            
            return $stmt->fetchColumn();
        } catch (PDOException $e) {
            error_log("Erro ao contar registros Vacina: " . $e->getMessage());
            throw new Exception('Erro ao contar dados de vacina');
        }
    }
    
    public function getById($id) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar Vacina por ID: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados de vacina');
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY data_aplicacao DESC");
            $stmt->execute([$cpfId]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("Erro ao buscar Vacina por CPF ID: " . $e->getMessage());
            throw new Exception('Erro ao buscar dados de vacina');
        }
    }
    
    public function create($data) {
        try {
            $fields = [
                'cpf_id', 'vaina', 'cor', 'cns', 'mae', 'nome_vacina',
                'descricao_vacina', 'lote_vacina', 'grupo_atendimento',
                'data_aplicacao', 'status', 'nome_estabelecimento',
                'aplicador_vacina', 'uf', 'municipio', 'bairro', 'cep'
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
            error_log("Erro ao criar Vacina: " . $e->getMessage());
            throw new Exception('Erro ao criar dados de vacina: ' . $e->getMessage());
        }
    }
    
    public function update($id, $data) {
        try {
            $fields = [
                'vaina', 'cor', 'cns', 'mae', 'nome_vacina',
                'descricao_vacina', 'lote_vacina', 'grupo_atendimento',
                'data_aplicacao', 'status', 'nome_estabelecimento',
                'aplicador_vacina', 'uf', 'municipio', 'bairro', 'cep'
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
            error_log("Erro ao atualizar Vacina: " . $e->getMessage());
            throw new Exception('Erro ao atualizar dados de vacina: ' . $e->getMessage());
        }
    }
    
    public function delete($id) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE id = ?");
            $stmt->execute([$id]);
            
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Erro ao deletar Vacina: " . $e->getMessage());
            throw new Exception('Erro ao deletar dados de vacina');
        }
    }
    
    public function deleteByCpfId($cpfId) {
        try {
            $stmt = $this->db->prepare("DELETE FROM {$this->table} WHERE cpf_id = ?");
            $stmt->execute([$cpfId]);
            
            return $stmt->rowCount();
        } catch (PDOException $e) {
            error_log("Erro ao deletar Vacina por CPF ID: " . $e->getMessage());
            throw new Exception('Erro ao deletar dados de vacina');
        }
    }
}