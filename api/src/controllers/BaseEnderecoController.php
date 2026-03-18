<?php
// src/controllers/BaseEnderecoController.php

require_once __DIR__ . '/../models/BaseEndereco.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseEnderecoController {
    private $db;
    private $baseEnderecoModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseEnderecoModel = new BaseEndereco($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $enderecos = $this->baseEnderecoModel->getByCpfId($cpfId);
            
            Response::success($enderecos, 'Endereços carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar endereços: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("BASE_ENDERECO_CREATE: Iniciando criação de endereço");
            
            $rawInput = file_get_contents('php://input');
            error_log("BASE_ENDERECO_CREATE: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("BASE_ENDERECO_CREATE: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("BASE_ENDERECO_CREATE: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['cpf_id'])) {
                error_log("BASE_ENDERECO_CREATE: cpf_id ausente");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->baseEnderecoModel->create($input);
            
            Response::success([
                'id' => $id,
                'message' => 'Endereço criado com sucesso'
            ], 'Endereço criado com sucesso');
            
        } catch (Exception $e) {
            error_log("BASE_ENDERECO_CREATE: Erro capturado - " . $e->getMessage());
            error_log("BASE_ENDERECO_CREATE: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar endereço: ' . $e->getMessage(), 400);
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
            
            $success = $this->baseEnderecoModel->update($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Endereço atualizado com sucesso'
                ], 'Endereço atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar endereço', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar endereço: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseEnderecoModel->delete($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Endereço deletado com sucesso'
                ], 'Endereço deletado com sucesso');
            } else {
                Response::error('Erro ao deletar endereço', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar endereço: ' . $e->getMessage(), 400);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $success = $this->baseEnderecoModel->deleteByCpfId($cpfId);
            
            if ($success) {
                Response::success([
                    'message' => 'Endereços deletados com sucesso'
                ], 'Endereços deletados com sucesso');
            } else {
                Response::error('Erro ao deletar endereços', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar endereços: ' . $e->getMessage(), 400);
        }
    }
}