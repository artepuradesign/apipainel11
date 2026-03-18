<?php
// src/controllers/BaseTelefoneController.php

require_once __DIR__ . '/../models/BaseTelefone.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseTelefoneController {
    private $db;
    private $baseTelefoneModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseTelefoneModel = new BaseTelefone($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $telefones = $this->baseTelefoneModel->getByCpfId($cpfId);
            
            Response::success($telefones, 'Telefones carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar telefones: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_TELEFONE_CREATE: Iniciando criação de telefone");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_TELEFONE_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_TELEFONE_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_TELEFONE_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['cpf_id'])) {
                error_log("BASE_TELEFONE_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseTelefoneModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Telefone criado com sucesso'
            ], 'Telefone criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_TELEFONE_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_TELEFONE_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar telefone: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseTelefoneModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Telefone atualizado com sucesso'
                ], 'Telefone atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar telefone', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar telefone: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseTelefoneModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Telefone deletado com sucesso'
                ], 'Telefone deletado com sucesso');
            } else {
                Response::error('Erro ao deletar telefone', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar telefone: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseTelefoneModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Telefones deletados com sucesso'
                ], 'Telefones deletados com sucesso');
            } else {
                Response::error('Erro ao deletar telefones', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar telefones: ' . $e->getMessage(), 400);
        }
    }
}