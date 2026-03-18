<?php
// src/models/BaseCpf.php

class BaseCpf {
    private $db;
    private $table = 'base_cpf';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE cpf LIKE ? OR nome LIKE ?";
            $params = ["%$search%", "%$search%"];
        }
        
        $query = "SELECT * FROM {$this->table} $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getCount($search = '') {
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = "WHERE cpf LIKE ? OR nome LIKE ?";
            $params = ["%$search%", "%$search%"];
        }
        
        $query = "SELECT COUNT(*) as total FROM {$this->table} $whereClause";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
    
    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByCpf($cpf) {
        $query = "SELECT * FROM {$this->table} WHERE cpf = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpf]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $fields = [
            'cpf','ref','situacao_cpf','nome','data_nascimento','sexo','mae','pai',
            'naturalidade','uf_naturalidade','cor','cns','estado_civil','escolaridade',
            'passaporte','nit','ctps','titulo_eleitor','zona','secao','nsu','pis',
            'aposentado','tipo_emprego','cbo','poder_aquisitivo','renda',
            'fx_poder_aquisitivo','csb8','csb8_faixa','csba','csba_faixa',
            'data_obito','foto','foto2',
            'fonte_dados','qualidade_dados','score'
        ];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setFields[] = $field;
                $value = $data[$field];

                // Normalizações de data/hora
                if ($field === 'data_nascimento' || $field === 'data_obito') {
                    if (is_string($value) && strpos($value, '/') !== false) {
                        $parts = explode('/', $value);
                        if (count($parts) === 3) {
                            $value = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
                        }
                    }
                    if ($value === '') { $value = null; }
                }

                $values[] = $value;
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
    
    public function update($id, $data) {
        $fields = [
            'cpf','ref','situacao_cpf','nome','data_nascimento','sexo','mae','pai', 
            'naturalidade','uf_naturalidade','cor','cns','estado_civil','escolaridade',
            'passaporte','nit','ctps','titulo_eleitor','zona','secao','nsu','pis',
            'aposentado','tipo_emprego','cbo','poder_aquisitivo','renda',
            'fx_poder_aquisitivo','csb8','csb8_faixa','csba','csba_faixa',
            'data_obito','foto','foto2',
            'fonte_dados','qualidade_dados','score'
        ];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setFields[] = "$field = ?";
                $value = $data[$field];

                // Normalizações de data/hora
                if ($field === 'data_nascimento' || $field === 'data_obito') {
                    if (is_string($value) && strpos($value, '/') !== false) {
                        $parts = explode('/', $value);
                        if (count($parts) === 3) {
                            $value = $parts[2] . '-' . $parts[1] . '-' . $parts[0];
                        }
                    }
                    if ($value === '') { $value = null; }
                }

                $values[] = $value;
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
    
    public function getCompleteData($cpfId) {
        // Buscar dados principais
        $cpfData = $this->getById($cpfId);
        if (!$cpfData) {
            return null;
        }
        
        // Buscar dados relacionados
        $cpfData['rg'] = $this->getRelatedData('base_rg', $cpfId);
        $cpfData['enderecos'] = $this->getRelatedData('base_endereco', $cpfId);
        $cpfData['telefones'] = $this->getRelatedData('base_telefone', $cpfId);
        $cpfData['emails'] = $this->getRelatedData('base_email', $cpfId);
        $cpfData['parentes'] = $this->getRelatedData('base_parente', $cpfId);
        $cpfData['vacinas'] = $this->getRelatedData('base_vacina', $cpfId);
        $cpfData['beneficios'] = $this->getRelatedData('base_beneficio', $cpfId);
        $cpfData['vivo'] = $this->getRelatedData('base_vivo', $cpfId);
        $cpfData['credilink'] = $this->getRelatedData('base_credilink', $cpfId);
        $cpfData['empresas_socio'] = $this->getRelatedData('base_empresa_socio', $cpfId);
        $cpfData['rais'] = $this->getRelatedData('base_rais', $cpfId);
        $cpfData['veiculos'] = $this->getRelatedData('base_historico_veiculo', $cpfId);
        $cpfData['cnh'] = $this->getRelatedData('base_cnh', $cpfId);
        
        return $cpfData;
    }
    
    private function getRelatedData($table, $cpfId) {
        $query = "SELECT * FROM $table WHERE cpf_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}