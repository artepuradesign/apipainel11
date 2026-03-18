<?php
// src/services/BaseCnpjService.php

require_once __DIR__ . '/../models/BaseCnpj.php';

class BaseCnpjService {
    private $db;
    private $baseCnpjModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCnpjModel = new BaseCnpj($db);
    }
    
    public function getCnpjByCnpj($cnpj) {
        // Limpar CNPJ (remover pontos, barras e traços)
        $cnpjLimpo = preg_replace('/\D/', '', $cnpj);
        
        if (strlen($cnpjLimpo) !== 14) {
            throw new Exception('CNPJ inválido');
        }
        
        return $this->baseCnpjModel->getByCnpj($cnpjLimpo);
    }
    
    public function getCnpjById($id) {
        return $this->baseCnpjModel->getById($id);
    }
    
    public function getAllCnpjs($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $cnpjs = $this->baseCnpjModel->getAll($limit, $offset, $search);
        $total = $this->baseCnpjModel->getCount($search);
        
        return [
            'data' => $cnpjs,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function createCnpj($data) {
        // Validar campos obrigatórios
        if (empty($data['cnpj'])) {
            throw new Exception('CNPJ é obrigatório');
        }
        
        if (empty($data['razao_social'])) {
            throw new Exception('Razão Social é obrigatória');
        }
        
        // Limpar CNPJ
        $data['cnpj'] = preg_replace('/\D/', '', $data['cnpj']);
        
        if (strlen($data['cnpj']) !== 14) {
            throw new Exception('CNPJ inválido');
        }
        
        // Verificar se já existe
        $existing = $this->baseCnpjModel->getByCnpj($data['cnpj']);
        if ($existing) {
            throw new Exception('CNPJ já cadastrado');
        }
        
        return $this->baseCnpjModel->create($data);
    }
    
    public function updateCnpj($id, $data) {
        $existing = $this->baseCnpjModel->getById($id);
        if (!$existing) {
            throw new Exception('CNPJ não encontrado');
        }
        
        // Se estiver atualizando o CNPJ, limpar
        if (isset($data['cnpj'])) {
            $data['cnpj'] = preg_replace('/\D/', '', $data['cnpj']);
            
            if (strlen($data['cnpj']) !== 14) {
                throw new Exception('CNPJ inválido');
            }
        }
        
        return $this->baseCnpjModel->update($id, $data);
    }
    
    public function deleteCnpj($id) {
        $existing = $this->baseCnpjModel->getById($id);
        if (!$existing) {
            throw new Exception('CNPJ não encontrado');
        }
        
        return $this->baseCnpjModel->delete($id);
    }
}
