<?php
// src/controllers/BaseTimController.php

require_once __DIR__ . '/../models/BaseTim.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseTimController {
    private $db;
    private $baseTimModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseTimModel = new BaseTim($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $registros = $this->baseTimModel->getByCpfId($cpfId);
            
            Response::success($registros, 'Registros TIM carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registros TIM: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_TIM_CREATE: Iniciando criação de registro TIM");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_TIM_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_TIM_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_TIM_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            if (empty($input['cpf_id'])) {
                error_log("BASE_TIM_CREATE: cpf_id ausente");
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $id = $this->baseTimModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Registro TIM criado com sucesso'
            ], 'Registro TIM criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_TIM_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_TIM_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar registro TIM: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseTimModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro TIM atualizado com sucesso'
                ], 'Registro TIM atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar registro TIM', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar registro TIM: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseTimModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro TIM deletado com sucesso'
                ], 'Registro TIM deletado com sucesso');
            } else {
                Response::error('Erro ao deletar registro TIM', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registro TIM: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $success = $this->baseTimModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Registros TIM deletados com sucesso'
                ], 'Registros TIM deletados com sucesso');
            } else {
                Response::error('Erro ao deletar registros TIM', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registros TIM: ' . $e->getMessage(), 400);
        }
    }
}
