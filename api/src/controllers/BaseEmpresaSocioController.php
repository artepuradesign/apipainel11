<?php
// src/controllers/BaseEmpresaSocioController.php

require_once __DIR__ . '/../services/BaseEmpresaSocioService.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseEmpresaSocioController {
    private $baseEmpresaSocioService;
    
    public function __construct($db) {
        $this->baseEmpresaSocioService = new BaseEmpresaSocioService($db);
    }
    
    public function index() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $result = $this->baseEmpresaSocioService->getAllEmpresasSocio($page, $limit, $search);
            
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function show($id) {
        try {
            $empresa = $this->baseEmpresaSocioService->getEmpresaSocioById($id);
            
            if ($empresa) {
                Response::success($empresa);
            } else {
                Response::error('Empresa sócio não encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            $empresas = $this->baseEmpresaSocioService->getEmpresasSocioByCpfId($cpfId);
            Response::success($empresas);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function store() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $id = $this->baseEmpresaSocioService->createEmpresaSocio($data);
            
            if ($id) {
                $empresa = $this->baseEmpresaSocioService->getEmpresaSocioById($id);
                Response::success($empresa, 201);
            } else {
                Response::error('Erro ao criar empresa sócio', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function update($id) {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $result = $this->baseEmpresaSocioService->updateEmpresaSocio($id, $data);
            
            if ($result) {
                $empresa = $this->baseEmpresaSocioService->getEmpresaSocioById($id);
                Response::success($empresa);
            } else {
                Response::error('Erro ao atualizar empresa sócio', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function delete($id) {
        try {
            $result = $this->baseEmpresaSocioService->deleteEmpresaSocio($id);
            
            if ($result) {
                Response::success(['message' => 'Empresa sócio deletada com sucesso']);
            } else {
                Response::error('Erro ao deletar empresa sócio', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
