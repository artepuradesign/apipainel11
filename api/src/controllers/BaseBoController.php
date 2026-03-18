<?php
// src/controllers/BaseBoController.php

require_once __DIR__ . '/../services/BaseBoService.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseBoController {
    private $baseBoService;
    
    public function __construct($db) {
        $this->baseBoService = new BaseBoService($db);
    }
    
    public function index() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $search = isset($_GET['search']) ? $_GET['search'] : '';
            
            $result = $this->baseBoService->getAllBoletins($page, $limit, $search);
            
            Response::success($result);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function show($id) {
        try {
            $boletim = $this->baseBoService->getBoletimById($id);
            
            if ($boletim) {
                Response::success($boletim);
            } else {
                Response::error('Boletim de ocorrência não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            $boletins = $this->baseBoService->getBoletinsByCpfId($cpfId);
            
            Response::success([
                'data' => $boletins,
                'total' => count($boletins)
            ]);
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
            
            $id = $this->baseBoService->createBoletim($data);
            
            if ($id) {
                $boletim = $this->baseBoService->getBoletimById($id);
                Response::success($boletim, 201);
            } else {
                Response::error('Erro ao criar boletim de ocorrência', 500);
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
            
            $result = $this->baseBoService->updateBoletim($id, $data);
            
            if ($result) {
                $boletim = $this->baseBoService->getBoletimById($id);
                Response::success($boletim);
            } else {
                Response::error('Erro ao atualizar boletim de ocorrência', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function delete($id) {
        try {
            $result = $this->baseBoService->deleteBoletim($id);
            
            if ($result) {
                Response::success(['message' => 'Boletim de ocorrência deletado com sucesso']);
            } else {
                Response::error('Erro ao deletar boletim de ocorrência', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
