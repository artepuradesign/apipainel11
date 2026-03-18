<?php
// src/controllers/BaseCreditinkController.php

require_once __DIR__ . '/../models/BaseCredilink.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseCreditinkController {
    private $db;
    private $baseCreditinkModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCreditinkModel = new BaseCredilink($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $credilinks = $this->baseCreditinkModel->getByCpfId($cpfId);
            
            Response::success($credilinks, 'Dados Credilink carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar dados Credilink: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_CREDILINK_CREATE: Iniciando criação de Credilink");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_CREDILINK_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_CREDILINK_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_CREDILINK_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar se cpf_id está presente
            if (empty($input['cpf_id'])) {
                error_log("BASE_CREDILINK_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseCreditinkModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Credilink criado com sucesso'
            ], 'Credilink criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_CREDILINK_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_CREDILINK_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar Credilink: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseCreditinkModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Credilink atualizado com sucesso'
                ], 'Credilink atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar Credilink', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar Credilink: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseCreditinkModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Credilink deletado com sucesso'
                ], 'Credilink deletado com sucesso');
            } else {
                Response::error('Erro ao deletar Credilink', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar Credilink: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseCreditinkModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Dados Credilink deletados com sucesso'
                ], 'Dados Credilink deletados com sucesso');
            } else {
                Response::error('Erro ao deletar dados Credilink', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar dados Credilink: ' . $e->getMessage(), 400);
        }
    }
}