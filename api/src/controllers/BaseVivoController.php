<?php
// src/controllers/BaseVivoController.php

require_once __DIR__ . '/../models/BaseVivo.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseVivoController {
    private $db;
    private $baseVivoModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseVivoModel = new BaseVivo($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $registros = $this->baseVivoModel->getByCpfId($cpfId);
            
            Response::success($registros, 'Registros Vivo carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registros Vivo: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_VIVO_CREATE: Iniciando criação de registro Vivo");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_VIVO_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_VIVO_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_VIVO_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            if (empty($input['cpf_id'])) {
                error_log("BASE_VIVO_CREATE: cpf_id ausente");
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $id = $this->baseVivoModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Registro Vivo criado com sucesso'
            ], 'Registro Vivo criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_VIVO_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_VIVO_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar registro Vivo: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseVivoModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro Vivo atualizado com sucesso'
                ], 'Registro Vivo atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar registro Vivo', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar registro Vivo: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseVivoModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Registro Vivo deletado com sucesso'
                ], 'Registro Vivo deletado com sucesso');
            } else {
                Response::error('Erro ao deletar registro Vivo', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registro Vivo: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $success = $this->baseVivoModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Registros Vivo deletados com sucesso'
                ], 'Registros Vivo deletados com sucesso');
            } else {
                Response::error('Erro ao deletar registros Vivo', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar registros Vivo: ' . $e->getMessage(), 400);
        }
    }
}
