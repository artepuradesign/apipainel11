<?php
// src/services/BaseParenteService.php

require_once __DIR__ . '/../models/BaseParente.php';

class BaseParenteService {
    private $db;
    private $baseParenteModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseParenteModel = new BaseParente($db);
    }
    
    public function getAllParentes($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $parentes = $this->baseParenteModel->getAll($limit, $offset, $search);
        $total = $this->baseParenteModel->getCount($search);
        
        return [
            'data' => $parentes,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getParenteById($id) {
        return $this->baseParenteModel->getById($id);
    }
    
    public function getParentesByCpfId($cpfId) {
        return $this->baseParenteModel->getByCpfId($cpfId);
    }
    
    public function createParente($data) {
        // Validate required fields
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        if (empty($data['nome_vinculo'])) {
            throw new Exception('Nome do vínculo é obrigatório');
        }
        
        if (empty($data['vinculo'])) {
            throw new Exception('Tipo de vínculo é obrigatório');
        }
        
        return $this->baseParenteModel->create($data);
    }
    
    public function updateParente($id, $data) {
        $existing = $this->baseParenteModel->getById($id);
        if (!$existing) {
            throw new Exception('Parente não encontrado');
        }
        
        return $this->baseParenteModel->update($id, $data);
    }
    
    public function deleteParente($id) {
        $existing = $this->baseParenteModel->getById($id);
        if (!$existing) {
            throw new Exception('Parente não encontrado');
        }
        
        return $this->baseParenteModel->delete($id);
    }
}
