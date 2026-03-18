<?php
// src/services/BaseVacinaService.php

require_once __DIR__ . '/../models/BaseVacina.php';

class BaseVacinaService {
    private $db;
    private $baseVacinaModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseVacinaModel = new BaseVacina($db);
    }
    
    public function getAllVacinas($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $vacinas = $this->baseVacinaModel->getAll($limit, $offset, $search);
        $total = $this->baseVacinaModel->getCount($search);
        
        return [
            'data' => $vacinas,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getVacinaById($id) {
        return $this->baseVacinaModel->getById($id);
    }
    
    public function getVacinasByCpfId($cpfId) {
        return $this->baseVacinaModel->getByCpfId($cpfId);
    }
    
    public function createVacina($data) {
        // Validar CPF ID obrigatório
        if (empty($data['cpf_id'])) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        // Limpar e validar dados
        $cleanData = $this->validateAndCleanData($data);
        
        return $this->baseVacinaModel->create($cleanData);
    }
    
    public function updateVacina($id, $data) {
        $existing = $this->baseVacinaModel->getById($id);
        if (!$existing) {
            throw new Exception('Registro de vacina não encontrado');
        }
        
        // Limpar e validar dados
        $cleanData = $this->validateAndCleanData($data, false);
        
        return $this->baseVacinaModel->update($id, $cleanData);
    }
    
    public function deleteVacina($id) {
        $existing = $this->baseVacinaModel->getById($id);
        if (!$existing) {
            throw new Exception('Registro de vacina não encontrado');
        }
        
        return $this->baseVacinaModel->delete($id);
    }
    
    public function deleteVacinasByCpfId($cpfId) {
        return $this->baseVacinaModel->deleteByCpfId($cpfId);
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
        
        // Vaina
        if (!empty($data['vaina'])) {
            $cleanData['vaina'] = $this->sanitizeString($data['vaina'], 100);
        }
        
        // Cor
        if (!empty($data['cor'])) {
            $cleanData['cor'] = $this->sanitizeString($data['cor'], 50);
        }
        
        // CNS
        if (!empty($data['cns'])) {
            $cleanData['cns'] = preg_replace('/\D/', '', $data['cns']);
            if (strlen($cleanData['cns']) > 20) {
                $cleanData['cns'] = substr($cleanData['cns'], 0, 20);
            }
        }
        
        // Mãe
        if (!empty($data['mae'])) {
            $cleanData['mae'] = $this->sanitizeString($data['mae'], 200);
        }
        
        // Nome da vacina
        if (!empty($data['nome_vacina'])) {
            $cleanData['nome_vacina'] = $this->sanitizeString($data['nome_vacina'], 200);
        }
        
        // Descrição da vacina
        if (!empty($data['descricao_vacina'])) {
            $cleanData['descricao_vacina'] = $this->sanitizeString($data['descricao_vacina'], 200);
        }
        
        // Lote da vacina
        if (!empty($data['lote_vacina'])) {
            $cleanData['lote_vacina'] = $this->sanitizeString($data['lote_vacina'], 100);
        }
        
        // Grupo de atendimento
        if (!empty($data['grupo_atendimento'])) {
            $cleanData['grupo_atendimento'] = $this->sanitizeString($data['grupo_atendimento'], 255);
        }
        
        // Data de aplicação
        if (!empty($data['data_aplicacao'])) {
            // Validar formato de data
            $dateTime = DateTime::createFromFormat('Y-m-d\TH:i:s.v\Z', $data['data_aplicacao']);
            if (!$dateTime) {
                $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $data['data_aplicacao']);
            }
            if (!$dateTime) {
                $dateTime = DateTime::createFromFormat('Y-m-d', $data['data_aplicacao']);
            }
            
            if ($dateTime) {
                $cleanData['data_aplicacao'] = $dateTime->format('Y-m-d H:i:s');
            } else {
                throw new Exception('Data de aplicação inválida');
            }
        }
        
        // Status
        if (!empty($data['status'])) {
            $cleanData['status'] = $this->sanitizeString($data['status'], 50);
        }
        
        // Nome do estabelecimento
        if (!empty($data['nome_estabelecimento'])) {
            $cleanData['nome_estabelecimento'] = $this->sanitizeString($data['nome_estabelecimento'], 255);
        }
        
        // Aplicador da vacina
        if (!empty($data['aplicador_vacina'])) {
            $cleanData['aplicador_vacina'] = $this->sanitizeString($data['aplicador_vacina'], 200);
        }
        
        // UF
        if (!empty($data['uf'])) {
            $cleanData['uf'] = strtoupper(substr($data['uf'], 0, 2));
        }
        
        // Município
        if (!empty($data['municipio'])) {
            $cleanData['municipio'] = $this->sanitizeString($data['municipio'], 150);
        }
        
        // Bairro
        if (!empty($data['bairro'])) {
            $cleanData['bairro'] = $this->sanitizeString($data['bairro'], 100);
        }
        
        // CEP
        if (!empty($data['cep'])) {
            $cep = preg_replace('/\D/', '', $data['cep']);
            $cleanData['cep'] = substr($cep, 0, 10);
        }
        
        return $cleanData;
    }
    
    private function sanitizeString($string, $maxLength) {
        $clean = trim(strip_tags($string));
        return substr($clean, 0, $maxLength);
    }
}