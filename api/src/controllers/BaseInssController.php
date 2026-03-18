<?php
// src/controllers/BaseInssController.php

require_once __DIR__ . '/../models/BaseInss.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseInssController {
    private $db;
    private $baseInssModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseInssModel = new BaseInss($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $beneficios = $this->baseInssModel->getByCpfId($cpfId);
            
            Response::success($beneficios, 'Benefícios INSS carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar benefícios INSS: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByCpf() {
        try {
            $cpf = $_GET['cpf'] ?? null;
            
            if (!$cpf) {
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $beneficios = $this->baseInssModel->getByCpf($cpf);
            
            Response::success($beneficios, 'Benefícios INSS carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar benefícios INSS: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_INSS_CREATE: Iniciando criação de benefício INSS");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_INSS_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_INSS_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_INSS_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar se cpf está presente
            if (empty($input['cpf'])) {
                error_log("BASE_INSS_CREATE: cpf ausente");
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $id = $this->baseInssModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Benefício INSS criado com sucesso'
            ], 'Benefício INSS criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_INSS_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_INSS_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar benefício INSS: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseInssModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Benefício INSS atualizado com sucesso'
                ], 'Benefício INSS atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar benefício INSS', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar benefício INSS: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseInssModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Benefício INSS deletado com sucesso'
                ], 'Benefício INSS deletado com sucesso');
            } else {
                Response::error('Erro ao deletar benefício INSS', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar benefício INSS: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseInssModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Benefícios INSS deletados com sucesso'
                ], 'Benefícios INSS deletados com sucesso');
            } else {
                Response::error('Erro ao deletar benefícios INSS', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar benefícios INSS: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpf() {
        try {
            $cpf = $_GET['cpf'] ?? null;
            
            if (!$cpf) {
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $success = $this->baseInssModel->deleteByCpf($cpf);
            
            if ($success) {
                Response::success([
                    'message' => 'Benefícios INSS deletados com sucesso'
                ], 'Benefícios INSS deletados com sucesso');
            } else {
                Response::error('Erro ao deletar benefícios INSS', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar benefícios INSS: ' . $e->getMessage(), 400);
        }
    }
}