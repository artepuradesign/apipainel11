<?php
// src/services/BaseCpfService.php

require_once __DIR__ . '/../models/BaseCpf.php';

class BaseCpfService {
    private $db;
    private $baseCpfModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCpfModel = new BaseCpf($db);
    }
    
    public function getAllCpfs($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $cpfs = $this->baseCpfModel->getAll($limit, $offset, $search);
        $total = $this->baseCpfModel->getCount($search);
        
        // Decode JSON fields for frontend
        foreach ($cpfs as &$cpf) {
            $this->decodeJsonFields($cpf);
        }
        
        return [
            'data' => $cpfs,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getCpfById($id) {
        $cpf = $this->baseCpfModel->getById($id);
        
        if ($cpf) {
            $this->decodeJsonFields($cpf);
        }
        
        return $cpf;
    }
    
    public function getCpfByCpf($cpfNumber) {
        $cpf = $this->baseCpfModel->getByCpf($cpfNumber);
        
        if ($cpf) {
            $this->decodeJsonFields($cpf);
        }
        
        return $cpf;
    }
    
    public function createCpf($data) {
        // Validate required fields
        if (empty($data['cpf'])) {
            throw new Exception('CPF é obrigatório');
        }
        
        if (empty($data['nome'])) {
            throw new Exception('Nome é obrigatório');
        }
        
        // Check if CPF already exists
        $existing = $this->baseCpfModel->getByCpf($data['cpf']);
        if ($existing) {
            throw new Exception('CPF já existe na base de dados');
        }
        
        // Validate CPF format
        if (!$this->isValidCpf($data['cpf'])) {
            throw new Exception('CPF inválido');
        }
        
        return $this->baseCpfModel->create($data);
    }
    
    public function updateCpf($id, $data) {
        $existing = $this->baseCpfModel->getById($id);
        if (!$existing) {
            throw new Exception('CPF não encontrado');
        }
        
        // If CPF is being changed, validate it
        if (isset($data['cpf']) && $data['cpf'] !== $existing['cpf']) {
            if (!$this->isValidCpf($data['cpf'])) {
                throw new Exception('CPF inválido');
            }
            
            $cpfExists = $this->baseCpfModel->getByCpf($data['cpf']);
            if ($cpfExists) {
                throw new Exception('CPF já existe na base de dados');
            }
        }
        
        return $this->baseCpfModel->update($id, $data);
    }
    
    public function deleteCpf($id) {
        $existing = $this->baseCpfModel->getById($id);
        if (!$existing) {
            throw new Exception('CPF não encontrado');
        }
        
        return $this->baseCpfModel->delete($id);
    }
    
    private function decodeJsonFields(&$cpf) {
        $jsonFields = [
            'parentes', 'telefones', 'emails', 'enderecos', 'vacinas_covid', 
            'empresas_socio', 'cnpj_mei', 'dividas_ativas', 'auxilio_emergencial',
            'rais_historico', 'inss_dados', 'operadora_vivo', 'operadora_claro',
            'operadora_tim', 'historico_veiculos', 'senhas_vazadas_email',
            'senhas_vazadas_cpf', 'cloud_cpf', 'cloud_email'
        ];
        
        foreach ($jsonFields as $field) {
            if (isset($cpf[$field]) && !empty($cpf[$field])) {
                $decoded = json_decode($cpf[$field], true);
                $cpf[$field] = $decoded !== null ? $decoded : $cpf[$field];
            }
        }
    }
    
    private function isValidCpf($cpf) {
        $cpf = preg_replace('/\D/', '', $cpf);
        
        if (strlen($cpf) !== 11) {
            return false;
        }
        
        if (preg_match('/(\d)\1{10}/', $cpf)) {
            return false;
        }
        
        for ($t = 9; $t < 11; $t++) {
            for ($d = 0, $c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }
        
        return true;
    }
}