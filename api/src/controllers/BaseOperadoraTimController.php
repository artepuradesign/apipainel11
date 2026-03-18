<?php
// src/controllers/BaseOperadoraTimController.php

require_once __DIR__ . '/../models/BaseOperadoraTim.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseOperadoraTimController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new BaseOperadoraTim($db);
    }

    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }

            $rows = $this->model->getByCpfId($cpfId);
            Response::success($rows, 'Operadora TIM carregada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar Operadora TIM: ' . $e->getMessage(), 500);
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
                Response::error('cpf_id é obrigatório', 400);
                return;
            }

            $id = $this->model->create($input);
            Response::success(['id' => $id], 'Operadora TIM criada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar Operadora TIM: ' . $e->getMessage(), 400);
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
                Response::success(['id' => $id], 'Operadora TIM atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar Operadora TIM', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao atualizar Operadora TIM: ' . $e->getMessage(), 400);
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
                Response::success(['id' => $id], 'Operadora TIM deletada com sucesso');
            } else {
                Response::error('Erro ao deletar Operadora TIM', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar Operadora TIM: ' . $e->getMessage(), 400);
        }
    }

    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }

            $success = $this->model->deleteByCpfId($cpfId);
            if ($success) {
                Response::success(['message' => 'Registros da Operadora TIM deletados'], 'Registros deletados com sucesso');
            } else {
                Response::error('Erro ao deletar registros da Operadora TIM', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar Operadora TIM: ' . $e->getMessage(), 400);
        }
    }
}
