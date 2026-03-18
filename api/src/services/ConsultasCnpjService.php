<?php
// src/services/ConsultasCnpjService.php

require_once __DIR__ . '/../models/ConsultasCnpj.php';

class ConsultasCnpjService {
    private $db;
    private $consultasCnpjModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultasCnpjModel = new ConsultasCnpj($db);
    }
    
    public function createConsulta($data) {
        // Validar campos obrigatórios
        if (empty($data['user_id'])) {
            throw new Exception('user_id é obrigatório');
        }
        
        if (empty($data['cnpj'])) {
            throw new Exception('CNPJ é obrigatório');
        }
        
        // Limpar CNPJ
        $data['cnpj'] = preg_replace('/\D/', '', $data['cnpj']);
        
        if (strlen($data['cnpj']) !== 14) {
            throw new Exception('CNPJ inválido');
        }
        
        // Definir valores padrão
        if (!isset($data['cost'])) {
            $data['cost'] = 0;
        }
        
        if (!isset($data['status'])) {
            $data['status'] = 'completed';
        }
        
        if (!isset($data['saldo_usado'])) {
            $data['saldo_usado'] = 'carteira';
        }
        
        return $this->consultasCnpjModel->create($data);
    }
    
    public function getConsultaById($id) {
        return $this->consultasCnpjModel->getById($id);
    }
    
    public function getConsultasByUserId($userId, $page = 1, $limit = 10) {
        $offset = ($page - 1) * $limit;
        $consultas = $this->consultasCnpjModel->getByUserId($userId, $limit, $offset);
        $total = $this->consultasCnpjModel->getCount($userId);
        
        return [
            'data' => $consultas,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getAllConsultas($page = 1, $limit = 50) {
        $offset = ($page - 1) * $limit;
        $consultas = $this->consultasCnpjModel->getAll($limit, $offset);
        $total = $this->consultasCnpjModel->getCount();
        
        return [
            'data' => $consultas,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getStats($userId = null) {
        return $this->consultasCnpjModel->getStats($userId);
    }
}
