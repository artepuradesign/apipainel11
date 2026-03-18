<?php
// src/controllers/BaseAuxilioController.php

require_once __DIR__ . '/../models/BaseAuxilio.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseAuxilioController {
    private $db;
    private $baseAuxilioModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseAuxilioModel = new BaseAuxilio($db);
    }
    
    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            $auxilios = $this->baseAuxilioModel->getByCpfId($cpfId);
            Response::success($auxilios, 'Auxílios carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar auxílios: ' . $e->getMessage(), 500);
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
            $id = $this->baseAuxilioModel->create($input);
            Response::success(['id' => $id], 'Auxílio criado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar auxílio: ' . $e->getMessage(), 400);
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
            $success = $this->baseAuxilioModel->update($id, $input);
            if ($success) {
                Response::success(['id' => $id], 'Auxílio atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar auxílio', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao atualizar auxílio: ' . $e->getMessage(), 400);
        }
    }

    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            $success = $this->baseAuxilioModel->delete($id);
            if ($success) {
                Response::success(['id' => $id], 'Auxílio deletado com sucesso');
            } else {
                Response::error('Erro ao deletar auxílio', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar auxílio: ' . $e->getMessage(), 400);
        }
    }

    public function deleteByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            $success = $this->baseAuxilioModel->deleteByCpfId($cpfId);
            if ($success) {
                Response::success([], 'Auxílios deletados com sucesso');
            } else {
                Response::error('Erro ao deletar auxílios', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar auxílios: ' . $e->getMessage(), 400);
        }
    }
}
