<?php
// src/controllers/BaseEmailController.php

require_once __DIR__ . '/../models/BaseEmail.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseEmailController {
    private $db;
    private $baseEmailModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseEmailModel = new BaseEmail($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $emails = $this->baseEmailModel->getByCpfId($cpfId);
            
            Response::success($emails, 'Emails carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar emails: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_EMAIL_CREATE: Iniciando criação de email");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_EMAIL_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_EMAIL_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_EMAIL_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['cpf_id'])) {
                error_log("BASE_EMAIL_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseEmailModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Email criado com sucesso'
            ], 'Email criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_EMAIL_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_EMAIL_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar email: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseEmailModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Email atualizado com sucesso'
                ], 'Email atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar email', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar email: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseEmailModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Email deletado com sucesso'
                ], 'Email deletado com sucesso');
            } else {
                Response::error('Erro ao deletar email', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar email: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseEmailModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Emails deletados com sucesso'
                ], 'Emails deletados com sucesso');
            } else {
                Response::error('Erro ao deletar emails', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar emails: ' . $e->getMessage(), 400);
        }
    }
}