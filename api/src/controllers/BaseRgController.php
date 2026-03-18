<?php
// src/controllers/BaseRgController.php

require_once __DIR__ . '/../models/BaseRg.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseRgController {
    private $db;
    private $baseRgModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseRgModel = new BaseRg($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $rgs = $this->baseRgModel->getByCpfId($cpfId);
            
            Response::success($rgs, 'RGs carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar RGs: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_RG_CREATE: Iniciando criação de RG");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_RG_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_RG_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_RG_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['cpf_id'])) {
                error_log("BASE_RG_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseRgModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'RG criado com sucesso'
            ], 'RG criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_RG_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_RG_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar RG: ' . $e->getMessage(), 400);
        }
    }
    
    public function update() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $success = $this->baseRgModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'RG atualizado com sucesso'
                ], 'RG atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar RG', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar RG: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseRgModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'RG deletado com sucesso'
                ], 'RG deletado com sucesso');
            } else {
                Response::error('Erro ao deletar RG', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar RG: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseRgModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'RGs deletados com sucesso'
                ], 'RGs deletados com sucesso');
            } else {
                Response::error('Erro ao deletar RGs', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar RGs: ' . $e->getMessage(), 400);
        }
    }
}