<?php
// src/controllers/BaseHistoricoVeiculoController.php

require_once __DIR__ . '/../models/BaseHistoricoVeiculo.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseHistoricoVeiculoController {
    private $model;
    
    public function __construct($db) {
        $this->model = new BaseHistoricoVeiculo($db);
    }
    
    public function create() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['cpf_id'])) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->model->create($data);
            Response::success(['id' => $id], 'Histórico de veículo criado com sucesso');
            
        } catch (Exception $e) {
            error_log("ERRO ao criar histórico de veículo: " . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] Iniciando busca...");
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] CPF ID recebido: " . ($cpfId ?? 'NULL'));
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] REQUEST_URI: " . $_SERVER['REQUEST_URI']);
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] Query params: " . json_encode($_GET));
            
            if (!$cpfId) {
                error_log("❌ [BASE_HISTORICO_VEICULO_CONTROLLER] CPF ID não fornecido");
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] Chamando model->getByCpfId({$cpfId})");
            $data = $this->model->getByCpfId($cpfId);
            
            error_log("🚗 [BASE_HISTORICO_VEICULO_CONTROLLER] Dados retornados: " . count($data) . " registros");
            Response::success($data, 'Histórico de veículos recuperado com sucesso');
            
        } catch (Exception $e) {
            error_log("❌ [BASE_HISTORICO_VEICULO_CONTROLLER] ERRO: " . $e->getMessage());
            error_log("❌ [BASE_HISTORICO_VEICULO_CONTROLLER] Stack trace: " . $e->getTraceAsString());
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function update() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (empty($data)) {
                Response::error('Nenhum dado fornecido para atualização', 400);
                return;
            }
            
            $this->model->update($id, $data);
            Response::success(null, 'Histórico de veículo atualizado com sucesso');
            
        } catch (Exception $e) {
            error_log("ERRO ao atualizar histórico de veículo: " . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $this->model->delete($id);
            Response::success(null, 'Histórico de veículo deletado com sucesso');
            
        } catch (Exception $e) {
            error_log("ERRO ao deletar histórico de veículo: " . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $this->model->deleteByCpfId($cpfId);
            Response::success(null, 'Históricos de veículos deletados com sucesso');
            
        } catch (Exception $e) {
            error_log("ERRO ao deletar históricos de veículos: " . $e->getMessage());
            Response::error($e->getMessage(), 500);
        }
    }
}
