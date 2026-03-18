<?php
// src/services/BaseEmpresaSocioService.php

require_once __DIR__ . '/../models/BaseEmpresaSocio.php';

class BaseEmpresaSocioService {
    private $db;
    private $baseEmpresaSocioModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseEmpresaSocioModel = new BaseEmpresaSocio($db);
    }
    
    public function getAllEmpresasSocio($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $empresas = $this->baseEmpresaSocioModel->getAll($limit, $offset, $search);
        $total = $this->baseEmpresaSocioModel->getCount($search);
        
        return [
            'data' => $empresas,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getEmpresaSocioById($id) {
        return $this->baseEmpresaSocioModel->getById($id);
    }
    
    public function getEmpresasSocioByCpfId($cpfId) {
        return $this->baseEmpresaSocioModel->getByCpfId($cpfId);
    }
    
    public function createEmpresaSocio($data) {
        // Validate required fields
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        return $this->baseEmpresaSocioModel->create($data);
    }
    
    public function updateEmpresaSocio($id, $data) {
        $existing = $this->baseEmpresaSocioModel->getById($id);
        if (!$existing) {
            throw new Exception('Empresa sócio não encontrada');
        }
        
        return $this->baseEmpresaSocioModel->update($id, $data);
    }
    
    public function deleteEmpresaSocio($id) {
        $existing = $this->baseEmpresaSocioModel->getById($id);
        if (!$existing) {
            throw new Exception('Empresa sócio não encontrada');
        }
        
        return $this->baseEmpresaSocioModel->delete($id);
    }
}
