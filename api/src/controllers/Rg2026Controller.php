<?php
// src/controllers/Rg2026Controller.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/Rg2026.php';

class Rg2026Controller {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new Rg2026($db);
    }

    public function create() {
        try {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input) {
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }

            $id = $this->model->createRegistro($input);
            Response::success(['id' => (int)$id], 'Registro RG-2026 criado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar RG-2026: ' . $e->getMessage(), 400);
        }
    }

    /**
     * Variante para rotas que já montaram o array e querem injetar user_id/module_id.
     */
    public function createFromArray($input) {
        try {
            if (!$input || !is_array($input)) {
                Response::error('Dados inválidos', 400);
                return;
            }

            $id = $this->model->createRegistro($input);
            Response::success(['id' => (int)$id], 'Registro RG-2026 criado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar RG-2026: ' . $e->getMessage(), 400);
        }
    }

    public function list() {
        try {
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
            $search = $_GET['search'] ?? null;

            $rows = $this->model->listRegistros($userId, $limit, $offset, $search);
            $total = $this->model->countRegistros($userId, $search);

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ]
            ], 'Registros RG-2026 carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar RG-2026: ' . $e->getMessage(), 500);
        }
    }

    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }

            $success = $this->model->deleteRegistro((int)$id);
            if ($success) {
                Response::success(['id' => (int)$id], 'Registro RG-2026 deletado com sucesso');
            } else {
                Response::error('Erro ao deletar RG-2026', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar RG-2026: ' . $e->getMessage(), 400);
        }
    }
}
