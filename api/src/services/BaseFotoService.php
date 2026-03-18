<?php
// src/services/BaseFotoService.php

require_once __DIR__ . '/../models/BaseFoto.php';
require_once __DIR__ . '/../models/BaseCpf.php';

class BaseFotoService {
    private $db;
    private $baseFotoModel;
    private $baseCpfModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseFotoModel = new BaseFoto($db);
        $this->baseCpfModel = new BaseCpf($db);
    }
    
    public function getFotosByCpfId($cpfId) {
        return $this->baseFotoModel->getByCpfId($cpfId);
    }
    
    public function createFoto($data) {
        // Se recebeu CPF ao invés de cpf_id, buscar o ID
        if (isset($data['cpf']) && !isset($data['cpf_id'])) {
            $cpf = preg_replace('/\D/', '', $data['cpf']);
            $cpfData = $this->baseCpfModel->getByCpf($cpf);
            
            if (!$cpfData) {
                throw new Exception('CPF não encontrado na base de dados');
            }
            
            $data['cpf_id'] = $cpfData['id'];
        }
        
        // Validar campos obrigatórios
        if (empty($data['cpf_id'])) {
            throw new Exception('cpf_id é obrigatório');
        }
        
        if (empty($data['photo'])) {
            throw new Exception('Nome da foto é obrigatório');
        }
        
        return $this->baseFotoModel->create($data);
    }
    
    public function updateFoto($id, $data) {
        $existing = $this->baseFotoModel->getById($id);
        if (!$existing) {
            throw new Exception('Foto não encontrada');
        }
        
        return $this->baseFotoModel->update($id, $data);
    }
    
    public function deleteFoto($id) {
        $existing = $this->baseFotoModel->getById($id);
        if (!$existing) {
            throw new Exception('Foto não encontrada');
        }
        
        return $this->baseFotoModel->delete($id);
    }
}
