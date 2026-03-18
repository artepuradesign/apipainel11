<?php
// src/controllers/BaseAuxilioEmergencialController.php

require_once __DIR__ . '/../models/BaseAuxilioEmergencial.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseAuxilioEmergencialController {
    private $db;
    private $baseAuxilioEmergencialModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseAuxilioEmergencialModel = new BaseAuxilioEmergencial($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $auxilios = $this->baseAuxilioEmergencialModel->getByCpfId($cpfId);
            
            Response::success($auxilios, 'Auxílios Emergenciais carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar Auxílios Emergenciais: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Iniciando criação de Auxílio Emergencial");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar se cpf_id está presente
            if (empty($input['cpf_id'])) {
                error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: cpf_id ausente");
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $id = $this->baseAuxilioEmergencialModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Auxílio Emergencial criado com sucesso'
            ], 'Auxílio Emergencial criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_AUXILIO_EMERGENCIAL_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar Auxílio Emergencial: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseAuxilioEmergencialModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Auxílio Emergencial atualizado com sucesso'
                ], 'Auxílio Emergencial atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar Auxílio Emergencial', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar Auxílio Emergencial: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseAuxilioEmergencialModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Auxílio Emergencial deletado com sucesso'
                ], 'Auxílio Emergencial deletado com sucesso');
            } else {
                Response::error('Erro ao deletar Auxílio Emergencial', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar Auxílio Emergencial: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $success = $this->baseAuxilioEmergencialModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Auxílios Emergenciais deletados com sucesso'
                ], 'Auxílios Emergenciais deletados com sucesso');
            } else {
                Response::error('Erro ao deletar Auxílios Emergenciais', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar Auxílios Emergenciais: ' . $e->getMessage(), 400);
        }
    }
}