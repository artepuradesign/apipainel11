<?php
// src/controllers/BaseCnpjController.php

require_once __DIR__ . '/../services/BaseCnpjService.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseCnpjController {
    private $baseCnpjService;
    
    public function __construct($db) {
        $this->baseCnpjService = new BaseCnpjService($db);
    }
    
    public function getByCnpj() {
        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $cnpj = end($segments);
            
            if (empty($cnpj)) {
                Response::badRequest('CNPJ não informado');
                return;
            }
            
            $result = $this->baseCnpjService->getCnpjByCnpj($cnpj);
            
            if ($result) {
                Response::success($result, 'CNPJ encontrado');
            } else {
                Response::notFound('CNPJ não encontrado');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function getById() {
        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $id = end($segments);
            
            if (!is_numeric($id)) {
                Response::badRequest('ID inválido');
                return;
            }
            
            $result = $this->baseCnpjService->getCnpjById($id);
            
            if ($result) {
                Response::success($result, 'CNPJ encontrado');
            } else {
                Response::notFound('CNPJ não encontrado');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function getAll() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $result = $this->baseCnpjService->getAllCnpjs($page, $limit, $search);
            Response::success($result, 'CNPJs recuperados com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Dados inválidos');
                return;
            }
            
            $id = $this->baseCnpjService->createCnpj($data);
            
            if ($id) {
                Response::success(['id' => $id], 'CNPJ cadastrado com sucesso', 201);
            } else {
                Response::error('Erro ao cadastrar CNPJ');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function update() {
        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $id = end($segments);
            
            if (!is_numeric($id)) {
                Response::badRequest('ID inválido');
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::badRequest('Dados inválidos');
                return;
            }
            
            $success = $this->baseCnpjService->updateCnpj($id, $data);
            
            if ($success) {
                Response::success(null, 'CNPJ atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar CNPJ');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function delete() {
        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $id = end($segments);
            
            if (!is_numeric($id)) {
                Response::badRequest('ID inválido');
                return;
            }
            
            $success = $this->baseCnpjService->deleteCnpj($id);
            
            if ($success) {
                Response::success(null, 'CNPJ excluído com sucesso');
            } else {
                Response::error('Erro ao excluir CNPJ');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
}
