<?php
// src/controllers/BaseClaroController.php

require_once __DIR__ . '/../models/BaseClaro.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseClaroController {
    private $db;
    private $baseClaroModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseClaroModel = new BaseClaro($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $registros = $this->baseClaroModel->getByCpfId($cpfId);
            
            Response::success($registros, 'Registros Claro carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registros Claro: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_CLARO_CREATE: Iniciando criação de registro Claro");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_CLARO_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_CLARO_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_CLARO_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            if (empty($input['cpf_id'])) {
                error_log("BASE_CLARO_CREATE: cpf_id ausente");
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $id = $this->baseClaroModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Registro Claro criado com sucesso'
            ], 'Registro Claro criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_CLARO_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_CLARO_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar registro Claro: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseClaroModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro Claro atualizado com sucesso'
                ], 'Registro Claro atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar registro Claro', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar registro Claro: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseClaroModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro Claro deletado com sucesso'
                ], 'Registro Claro deletado com sucesso');
            } else {
                Response::error('Erro ao deletar registro Claro', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registro Claro: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $success = $this->baseClaroModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Registros Claro deletados com sucesso'
                ], 'Registros Claro deletados com sucesso');
            } else {
                Response::error('Erro ao deletar registros Claro', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registros Claro: ' . $e->getMessage(), 400);
        }
    }
}
