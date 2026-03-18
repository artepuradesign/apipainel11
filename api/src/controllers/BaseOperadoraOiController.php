<?php
// src/controllers/BaseOperadoraOiController.php

require_once __DIR__ . '/../models/BaseOperadoraOi.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseOperadoraOiController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new BaseOperadoraOi($db);
    }

    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }

            $rows = $this->model->getByCpfId($cpfId);
            Response::success($rows, 'Operadora OI carregada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar Operadora OI: ' . $e->getMessage(), 500);
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

            $id = $this->model->create($input);
            Response::success(['id' => $id], 'Operadora OI criada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar Operadora OI: ' . $e->getMessage(), 400);
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

            $success = $this->model->update($id, $input);
            if ($success) {
                Response::success(['id' => $id], 'Operadora OI atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar Operadora OI', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao atualizar Operadora OI: ' . $e->getMessage(), 400);
        }
    }

    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }

            $success = $this->model->delete($id);
            if ($success) {
                Response::success(['id' => $id], 'Operadora OI deletada com sucesso');
            } else {
                Response::error('Erro ao deletar Operadora OI', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar Operadora OI: ' . $e->getMessage(), 400);
        }
    }

    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }

            $success = $this->model->deleteByCpfId($cpfId);
            if ($success) {
                Response::success(['message' => 'Registros da Operadora OI deletados'], 'Registros deletados com sucesso');
            } else {
                Response::error('Erro ao deletar registros da Operadora OI', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar Operadora OI: ' . $e->getMessage(), 400);
        }
    }
}
