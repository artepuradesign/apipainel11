<?php
// src/controllers/BaseParenteController.php

require_once __DIR__ . '/../services/BaseParenteService.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseParenteController {
    private $baseParenteService;
    
    public function __construct($db) {
        $this->baseParenteService = new BaseParenteService($db);
    }
    
    public function index() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $result = $this->baseParenteService->getAllParentes($page, $limit, $search);
            
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function show($id) {
        try {
            $parente = $this->baseParenteService->getParenteById($id);
            
            if ($parente) {
                Response::success($parente);
            } else {
                Response::error('Parente não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            error_log("BASE_PARENTE CONTROLLER: getByCpfId chamado com cpfId={$cpfId}");
            $parentes = $this->baseParenteService->getParentesByCpfId($cpfId);
            error_log("BASE_PARENTE CONTROLLER: Encontrados " . count($parentes) . " parentes");
            
            // Retornar no formato esperado pelo frontend
            Response::success([
                'data' => $parentes,
                'total' => count($parentes)
            ]);
        } catch (Exception $e) {
            error_log("BASE_PARENTE CONTROLLER ERROR: " . $e->getMessage());
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
            
            $id = $this->baseParenteService->createParente($data);
            
            if ($id) {
                $parente = $this->baseParenteService->getParenteById($id);
                Response::success($parente, 201);
            } else {
                Response::error('Erro ao criar parente', 500);
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
            
            $result = $this->baseParenteService->updateParente($id, $data);
            
            if ($result) {
                $parente = $this->baseParenteService->getParenteById($id);
                Response::success($parente);
            } else {
                Response::error('Erro ao atualizar parente', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function delete($id) {
        try {
            $result = $this->baseParenteService->deleteParente($id);
            
            if ($result) {
                Response::success(['message' => 'Parente deletado com sucesso']);
            } else {
                Response::error('Erro ao deletar parente', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
