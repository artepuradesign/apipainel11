<?php
// src/controllers/BaseCnsController.php

require_once __DIR__ . '/../utils/Response.php';

// Resolver includes de forma tolerante a diferentes estruturas de deploy
// Importante: este helper pode existir em outras rotas/controllers.
// Evita Fatal error "Cannot redeclare" quando múltiplos arquivos declaram o mesmo nome.
if (!function_exists('require_once_candidates')) {
    function require_once_candidates(array $candidates, string $label): void {
        foreach ($candidates as $path) {
            if (!$path) continue;
            $real = realpath($path);
            if ($real && file_exists($real)) {
                require_once $real;
                return;
            }
        }

        Response::error(
            "Arquivo obrigatório não encontrado ($label). Verifique o deploy da pasta src/ no servidor.",
            500
        );
        exit;
    }
}

$controllersDir = realpath(__DIR__);
$srcDir = $controllersDir ? realpath($controllersDir . '/..') : null; // .../src
$rootDir = $srcDir ? realpath($srcDir . '/..') : null;               // .../

require_once_candidates([
    __DIR__ . '/../models/BaseCns.php',
    $srcDir ? ($srcDir . '/models/BaseCns.php') : null,
    $rootDir ? ($rootDir . '/api/src/models/BaseCns.php') : null,
    $rootDir ? ($rootDir . '/src/models/BaseCns.php') : null,
], 'BaseCns.php');

class BaseCnsController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new BaseCns($db);
    }

    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;
            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }

            $data = $this->model->getByCpfId($cpfId);
            Response::success($data, 'CNS carregado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar CNS: ' . $e->getMessage(), 500);
        }
    }

    public function getById() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }

            $data = $this->model->getById($id);
            if (!$data) {
                Response::notFound('Registro CNS não encontrado');
                return;
            }

            Response::success($data);
        } catch (Exception $e) {
            Response::error('Erro ao buscar CNS: ' . $e->getMessage(), 500);
        }
    }

    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                Response::badRequest('Dados inválidos');
                return;
            }

            $id = $this->model->create($input);
            $created = $this->model->getById($id);
            Response::success($created, 'CNS criado com sucesso', 201);
        } catch (Exception $e) {
            Response::error('Erro ao criar CNS: ' . $e->getMessage(), 500);
        }
    }

    public function update() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input) {
                Response::badRequest('Dados inválidos');
                return;
            }

            $ok = $this->model->update($id, $input);
            if (!$ok) {
                Response::error('Falha ao atualizar CNS', 500);
                return;
            }

            $updated = $this->model->getById($id);
            Response::success($updated, 'CNS atualizado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao atualizar CNS: ' . $e->getMessage(), 500);
        }
    }

    public function delete() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }

            $ok = $this->model->delete($id);
            if (!$ok) {
                Response::error('Falha ao excluir CNS', 500);
                return;
            }

            Response::success(['id' => $id], 'CNS excluído com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao excluir CNS: ' . $e->getMessage(), 500);
        }
    }
}
