<?php
// src/controllers/BaseSenhaEmailController.php

require_once __DIR__ . '/../models/BaseSenhaEmail.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseSenhaEmailController {
    private $db;
    private $baseSenhaEmailModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseSenhaEmailModel = new BaseSenhaEmail($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $senhas = $this->baseSenhaEmailModel->getByCpfId($cpfId);
            
            Response::success($senhas, 'Senhas de email carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar senhas de email: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByEmail() {
        try {
            $email = $_GET['email'] ?? null;
            
            if (!$email) {
                Response::error('Email é obrigatório', 400);
                return;
            }
            
            $senhas = $this->baseSenhaEmailModel->getByEmail($email);
            
            Response::success($senhas, 'Senhas de email carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar senhas de email: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            if (empty($input['cpf_id'])) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseSenhaEmailModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Senha de email criada com sucesso'
            ], 'Senha de email criada com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao criar senha de email: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseSenhaEmailModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Senha de email atualizada com sucesso'
                ], 'Senha de email atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar senha de email', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar senha de email: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseSenhaEmailModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Senha de email deletada com sucesso'
                ], 'Senha de email deletada com sucesso');
            } else {
                Response::error('Erro ao deletar senha de email', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar senha de email: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseSenhaEmailModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Senhas de email deletadas com sucesso'
                ], 'Senhas de email deletadas com sucesso');
            } else {
                Response::error('Erro ao deletar senhas de email', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar senhas de email: ' . $e->getMessage(), 400);
        }
    }
}
