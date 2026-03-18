<?php
// src/controllers/BaseVacinaController.php

require_once __DIR__ . '/../models/BaseVacina.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseVacinaController {
    private $db;
    private $baseVacinaModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseVacinaModel = new BaseVacina($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $vacinas = $this->baseVacinaModel->getByCpfId($cpfId);
            
            Response::success($vacinas, 'Vacinas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar vacinas: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_VACINA_CREATE: Iniciando criação de vacina");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_VACINA_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_VACINA_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_VACINA_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar se cpf_id está presente
            if (empty($input['cpf_id'])) {
                error_log("BASE_VACINA_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseVacinaModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Vacina criada com sucesso'
            ], 'Vacina criada com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_VACINA_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_VACINA_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar vacina: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseVacinaModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Vacina atualizada com sucesso'
                ], 'Vacina atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar vacina', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar vacina: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseVacinaModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Vacina deletada com sucesso'
                ], 'Vacina deletada com sucesso');
            } else {
                Response::error('Erro ao deletar vacina', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar vacina: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseVacinaModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Vacinas deletadas com sucesso'
                ], 'Vacinas deletadas com sucesso');
            } else {
                Response::error('Erro ao deletar vacinas', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar vacinas: ' . $e->getMessage(), 400);
        }
    }
}