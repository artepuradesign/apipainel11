<?php
// src/services/BaseCreditinkService.php

require_once __DIR__ . '/../models/BaseCredilink.php';

class BaseCreditinkService {
    private $db;
    private $baseCreditinkModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCreditinkModel = new BaseCredilink($db);
    }
    
    public function getAllCredilinks($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $credilinks = $this->baseCreditinkModel->getAll($limit, $offset, $search);
        $total = $this->baseCreditinkModel->getCount($search);
        
        return [
            'data' => $credilinks,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getCreditinkById($id) {
        return $this->baseCreditinkModel->getById($id);
    }
    
    public function getCreditinksByCpfId($cpfId) {
        return $this->baseCreditinkModel->getByCpfId($cpfId);
    }
    
    public function createCredilink($data) {
        // Validar CPF ID obrigatório
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        // Limpar e validar dados
        $cleanData = $this->validateAndCleanData($data);
        
        return $this->baseCreditinkModel->create($cleanData);
    }
    
    public function updateCredilink($id, $data) {
        $existing = $this->baseCreditinkModel->getById($id);
        if (!$existing) {
            throw new Exception('Registro Credilink não encontrado');
        }
        
        // Limpar e validar dados
        $cleanData = $this->validateAndCleanData($data, false);
        
        return $this->baseCreditinkModel->update($id, $cleanData);
    }
    
    public function deleteCredilink($id) {
        $existing = $this->baseCreditinkModel->getById($id);
        if (!$existing) {
            throw new Exception('Registro Credilink não encontrado');
        }
        
        return $this->baseCreditinkModel->delete($id);
    }
    
    public function deleteCreditinksByCpfId($cpfId) {
        return $this->baseCreditinkModel->deleteByCpfId($cpfId);
    }
    
    private function validateAndCleanData($data, $isCreate = true) {
        $cleanData = [];
        
        // CPF ID - obrigatório apenas na criação
        if ($isCreate && empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        if (!empty($data['cpf_id'])) {
            $cleanData['cpf_id'] = (int)$data['cpf_id'];
        }
        
        // Nome
        if (!empty($data['nome'])) {
            $cleanData['nome'] = $this->sanitizeString($data['nome'], 200);
        }
        
        // Nome da mãe
        if (!empty($data['nome_mae'])) {
            $cleanData['nome_mae'] = $this->sanitizeString($data['nome_mae'], 200);
        }
        
        // Email
        if (!empty($data['email'])) {
            $email = filter_var($data['email'], FILTER_VALIDATE_EMAIL);
            if ($email === false) {
                throw new Exception('Email inválido');
            }
            $cleanData['email'] = substr($email, 0, 150);
        }
        
        // Data de óbito
        if (!empty($data['data_obito'])) {
            $cleanData['data_obito'] = $this->sanitizeString($data['data_obito'], 50);
        }
        
        // Status da Receita Federal
        if (!empty($data['status_receita_federal'])) {
            $cleanData['status_receita_federal'] = $this->sanitizeString($data['status_receita_federal'], 100);
        }
        
        // Percentual de participação
        if (!empty($data['percentual_participacao'])) {
            $cleanData['percentual_participacao'] = $this->sanitizeString($data['percentual_participacao'], 50);
        }
        
        // CBO
        if (!empty($data['cbo'])) {
            $cleanData['cbo'] = $this->sanitizeString($data['cbo'], 100);
        }
        
        // Renda presumida
        if (!empty($data['renda_presumida'])) {
            $renda = filter_var($data['renda_presumida'], FILTER_VALIDATE_FLOAT);
            if ($renda === false) {
                throw new Exception('Renda presumida deve ser um valor numérico');
            }
            $cleanData['renda_presumida'] = $renda;
        }
        
        // Telefones
        if (!empty($data['telefones'])) {
            $cleanData['telefones'] = $this->sanitizeString($data['telefones'], 255);
        }
        
        // UF
        if (!empty($data['uf'])) {
            $cleanData['uf'] = strtoupper(substr($data['uf'], 0, 2));
        }
        
        // Estado
        if (!empty($data['estado'])) {
            $cleanData['estado'] = $this->sanitizeString($data['estado'], 100);
        }
        
        // Cidade
        if (!empty($data['cidade'])) {
            $cleanData['cidade'] = $this->sanitizeString($data['cidade'], 150);
        }
        
        // Tipo de endereço
        if (!empty($data['tipo_endereco'])) {
            $cleanData['tipo_endereco'] = $this->sanitizeString($data['tipo_endereco'], 50);
        }
        
        // Logradouro
        if (!empty($data['logradouro'])) {
            $cleanData['logradouro'] = $this->sanitizeString($data['logradouro'], 200);
        }
        
        // Complemento
        if (!empty($data['complemento'])) {
            $cleanData['complemento'] = $this->sanitizeString($data['complemento'], 100);
        }
        
        // Bairro
        if (!empty($data['bairro'])) {
            $cleanData['bairro'] = $this->sanitizeString($data['bairro'], 100);
        }
        
        // Número
        if (!empty($data['numero'])) {
            $cleanData['numero'] = $this->sanitizeString($data['numero'], 20);
        }
        
        // CEP
        if (!empty($data['cep'])) {
            $cep = preg_replace('/\D/', '', $data['cep']);
            if (strlen($cep) === 8) {
                $cleanData['cep'] = $cep;
            } else {
                throw new Exception('CEP deve ter 8 dígitos');
            }
        }
        
        return $cleanData;
    }
    
    private function sanitizeString($string, $maxLength) {
        $clean = trim(strip_tags($string));
        return substr($clean, 0, $maxLength);
    }
}