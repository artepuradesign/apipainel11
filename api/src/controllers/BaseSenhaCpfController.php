<?php
// src/controllers/BaseSenhaCpfController.php

require_once __DIR__ . '/../models/BaseSenhaCpf.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseSenhaCpfController {
    private $db;
    private $baseSenhaCpfModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseSenhaCpfModel = new BaseSenhaCpf($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $senhas = $this->baseSenhaCpfModel->getByCpfId($cpfId);
            
            Response::success($senhas, 'Senhas de CPF carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar senhas de CPF: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByCpf() {
        try {
            $cpf = $_GET['cpf'] ?? null;
            
            if (!$cpf) {
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $senhas = $this->baseSenhaCpfModel->getByCpf($cpf);
            
            Response::success($senhas, 'Senhas de CPF carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar senhas de CPF: ' . $e->getMessage(), 500);
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
            
            $id = $this->baseSenhaCpfModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Senha de CPF criada com sucesso'
            ], 'Senha de CPF criada com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao criar senha de CPF: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseSenhaCpfModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Senha de CPF atualizada com sucesso'
                ], 'Senha de CPF atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar senha de CPF', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar senha de CPF: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseSenhaCpfModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Senha de CPF deletada com sucesso'
                ], 'Senha de CPF deletada com sucesso');
            } else {
                Response::error('Erro ao deletar senha de CPF', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar senha de CPF: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseSenhaCpfModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Senhas de CPF deletadas com sucesso'
                ], 'Senhas de CPF deletadas com sucesso');
            } else {
                Response::error('Erro ao deletar senhas de CPF', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar senhas de CPF: ' . $e->getMessage(), 400);
        }
    }
}
