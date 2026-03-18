<?php
// src/controllers/BaseRaisController.php

require_once __DIR__ . '/../models/BaseRais.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/BaseController.php';

class BaseRaisController extends BaseController {
    private $model;
    
    public function __construct($db) {
        parent::__construct($db);
        $this->model = new BaseRais($db);
    }
    
    public function getAll() {
        try {
            $data = $this->model->getAll();
            Response::success($data, 'Registros RAIS recuperados com sucesso');
        } catch (Exception $e) {
            error_log("ERRO ao buscar registros RAIS: " . $e->getMessage());
            Response::serverError('Erro ao buscar registros RAIS', ['error' => $e->getMessage()]);
        }
    }
    
    public function getByCpfId($cpfId) {
        try {
            error_log("Buscando RAIS para CPF ID: " . $cpfId);
            $data = $this->model->getByCpfId($cpfId);
            error_log("RAIS encontrados: " . count($data));
            Response::success($data, 'Registros RAIS recuperados com sucesso');
        } catch (Exception $e) {
            error_log("ERRO ao buscar RAIS por CPF ID: " . $e->getMessage());
            Response::serverError('Erro ao buscar registros RAIS', ['error' => $e->getMessage()]);
        }
    }
    
    public function getById($id) {
        try {
            $data = $this->model->getById($id);
            
            if (!$data) {
                Response::notFound('Registro RAIS não encontrado');
                return;
            }
            
            Response::success($data, 'Registro RAIS recuperado com sucesso');
        } catch (Exception $e) {
            error_log("ERRO ao buscar registro RAIS: " . $e->getMessage());
            Response::serverError('Erro ao buscar registro RAIS', ['error' => $e->getMessage()]);
        }
    }
    
    public function create() {
        try {
            $validation = $this->validateJsonInput();
            
            if (!$validation['valid']) {
                Response::error('Dados inválidos fornecidos', 400, ['raw' => $validation['raw']]);
                return;
            }
            
            $data = $validation['data'];
            
            // Validação básica
            if (!isset($data['cpf_id'])) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }
            
            $id = $this->model->create($data);
            
            if ($id) {
                Response::success(['id' => $id], 'Registro RAIS criado com sucesso', 201);
            } else {
                Response::serverError('Erro ao criar registro RAIS');
            }
        } catch (Exception $e) {
            error_log("ERRO ao criar registro RAIS: " . $e->getMessage());
            Response::serverError('Erro ao criar registro RAIS', ['error' => $e->getMessage()]);
        }
    }
    
    public function update($id) {
        try {
            $validation = $this->validateJsonInput();
            
            if (!$validation['valid']) {
                Response::error('Dados inválidos fornecidos', 400, ['raw' => $validation['raw']]);
                return;
            }
            
            $data = $validation['data'];
            
            // Verificar se o registro existe
            $existing = $this->model->getById($id);
            if (!$existing) {
                Response::notFound('Registro RAIS não encontrado');
                return;
            }
            
            if ($this->model->update($id, $data)) {
                Response::success(null, 'Registro RAIS atualizado com sucesso');
            } else {
                Response::serverError('Erro ao atualizar registro RAIS');
            }
        } catch (Exception $e) {
            error_log("ERRO ao atualizar registro RAIS: " . $e->getMessage());
            Response::serverError('Erro ao atualizar registro RAIS', ['error' => $e->getMessage()]);
        }
    }
    
    public function delete($id) {
        try {
            // Verificar se o registro existe
            $existing = $this->model->getById($id);
            if (!$existing) {
                Response::notFound('Registro RAIS não encontrado');
                return;
            }
            
            if ($this->model->delete($id)) {
                Response::success(null, 'Registro RAIS deletado com sucesso');
            } else {
                Response::serverError('Erro ao deletar registro RAIS');
            }
        } catch (Exception $e) {
            error_log("ERRO ao deletar registro RAIS: " . $e->getMessage());
            Response::serverError('Erro ao deletar registro RAIS', ['error' => $e->getMessage()]);
        }
    }
}
