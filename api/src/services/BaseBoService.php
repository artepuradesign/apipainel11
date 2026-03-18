<?php
// src/services/BaseBoService.php

require_once __DIR__ . '/../models/BaseBo.php';

class BaseBoService {
    private $db;
    private $baseBoModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseBoModel = new BaseBo($db);
    }
    
    public function getAllBoletins($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $boletins = $this->baseBoModel->getAll($limit, $offset, $search);
        $total = $this->baseBoModel->getCount($search);
        
        return [
            'data' => $boletins,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getBoletimById($id) {
        return $this->baseBoModel->getById($id);
    }
    
    public function getBoletinsByCpfId($cpfId) {
        return $this->baseBoModel->getByCpfId($cpfId);
    }
    
    public function createBoletim($data) {
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        return $this->baseBoModel->create($data);
    }
    
    public function updateBoletim($id, $data) {
        $existing = $this->baseBoModel->getById($id);
        if (!$existing) {
            throw new Exception('Boletim de ocorrência não encontrado');
        }
        
        return $this->baseBoModel->update($id, $data);
    }
    
    public function deleteBoletim($id) {
        $existing = $this->baseBoModel->getById($id);
        if (!$existing) {
            throw new Exception('Boletim de ocorrência não encontrado');
        }
        
        return $this->baseBoModel->delete($id);
    }
}
