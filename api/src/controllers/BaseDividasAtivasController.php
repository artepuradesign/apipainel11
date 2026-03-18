<?php
// src/controllers/BaseDividasAtivasController.php

require_once __DIR__ . '/../models/BaseDividasAtivas.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseDividasAtivasController {
    private $db;
    private $baseDividasAtivasModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseDividasAtivasModel = new BaseDividasAtivas($db);
    }
    
    public function getByCpf() {
        try {
            $cpf = $_GET['cpf_id'] ?? null;
            
            if (!$cpf) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $dividas = $this->baseDividasAtivasModel->getByCpf($cpf);
            
            Response::success($dividas, 'Dívidas Ativas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar Dívidas Ativas: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_DIVIDAS_ATIVAS_CREATE: Iniciando criação de Dívida Ativa");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_DIVIDAS_ATIVAS_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_DIVIDAS_ATIVAS_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_DIVIDAS_ATIVAS_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar se cpf_id está presente
            if (empty($input['cpf_id'])) {
                error_log("BASE_DIVIDAS_ATIVAS_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseDividasAtivasModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Dívida Ativa criada com sucesso'
            ], 'Dívida Ativa criada com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_DIVIDAS_ATIVAS_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_DIVIDAS_ATIVAS_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar Dívida Ativa: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseDividasAtivasModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Dívida Ativa atualizada com sucesso'
                ], 'Dívida Ativa atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar Dívida Ativa', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar Dívida Ativa: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseDividasAtivasModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Dívida Ativa deletada com sucesso'
                ], 'Dívida Ativa deletada com sucesso');
            } else {
                Response::error('Erro ao deletar Dívida Ativa', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar Dívida Ativa: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpf() {
        try {
            $cpf = $_GET['cpf_id'] ?? null;
            
            if (!$cpf) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseDividasAtivasModel->deleteByCpf($cpf);
            
            if ($success) {
                Response::success([
                    'message' => 'Dívidas Ativas deletadas com sucesso'
                ], 'Dívidas Ativas deletadas com sucesso');
            } else {
                Response::error('Erro ao deletar Dívidas Ativas', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar Dívidas Ativas: ' . $e->getMessage(), 400);
        }
    }
}