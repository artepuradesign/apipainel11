<?php
// src/controllers/BaseCnhController.php

require_once __DIR__ . '/../models/BaseCnh.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseCnhController {
    private $db;
    private $baseCnhModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCnhModel = new BaseCnh($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $cnhs = $this->baseCnhModel->getByCpfId($cpfId);
            
            Response::success($cnhs, 'CNHs carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar CNHs: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_CNH_CREATE: Iniciando criação de CNH");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_CNH_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_CNH_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_CNH_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['cpf_id'])) {
                error_log("BASE_CNH_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseCnhModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'CNH criada com sucesso'
            ], 'CNH criada com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_CNH_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_CNH_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar CNH: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseCnhModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'CNH atualizada com sucesso'
                ], 'CNH atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar CNH', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar CNH: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseCnhModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'CNH deletada com sucesso'
                ], 'CNH deletada com sucesso');
            } else {
                Response::error('Erro ao deletar CNH', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar CNH: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseCnhModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'CNHs deletadas com sucesso'
                ], 'CNHs deletadas com sucesso');
            } else {
                Response::error('Erro ao deletar CNHs', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar CNHs: ' . $e->getMessage(), 400);
        }
    }
}