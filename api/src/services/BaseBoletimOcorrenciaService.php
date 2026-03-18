<?php
// src/services/BaseBoletimOcorrenciaService.php

require_once __DIR__ . '/../models/BaseBoletimOcorrencia.php';

class BaseBoletimOcorrenciaService {
    private $db;
    private $baseBoletimOcorrenciaModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseBoletimOcorrenciaModel = new BaseBoletimOcorrencia($db);
    }
    
    public function getAllBoletins($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $boletins = $this->baseBoletimOcorrenciaModel->getAll($limit, $offset, $search);
        $total = $this->baseBoletimOcorrenciaModel->getCount($search);
        
        return [
            'data' => $boletins,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getBoletimById($id) {
        return $this->baseBoletimOcorrenciaModel->getById($id);
    }
    
    public function getBoletinsByCpfId($cpfId) {
        return $this->baseBoletimOcorrenciaModel->getByCpfId($cpfId);
    }
    
    public function createBoletim($data) {
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        return $this->baseBoletimOcorrenciaModel->create($data);
    }
    
    public function updateBoletim($id, $data) {
        $existing = $this->baseBoletimOcorrenciaModel->getById($id);
        if (!$existing) {
            throw new Exception('Boletim de ocorrência não encontrado');
        }
        
        return $this->baseBoletimOcorrenciaModel->update($id, $data);
    }
    
    public function deleteBoletim($id) {
        $existing = $this->baseBoletimOcorrenciaModel->getById($id);
        if (!$existing) {
            throw new Exception('Boletim de ocorrência não encontrado');
        }
        
        return $this->baseBoletimOcorrenciaModel->delete($id);
    }
}
