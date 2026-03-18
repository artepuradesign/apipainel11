<?php
// src/controllers/BaseCertidaoController.php

require_once __DIR__ . '/../models/BaseCertidao.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseCertidaoController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new BaseCertidao($db);
    }

    public function getByCpfId() {
        try {
            $cpfId = $_GET['cpf_id'] ?? null;

            if (!$cpfId) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }

            $data = $this->model->getByCpfId($cpfId);

            // Pode retornar null (sem registro) ou o objeto da certidão
            Response::success($data, 'Certidão carregada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar certidão: ' . $e->getMessage(), 500);
        }
    }

    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['cpf_id'])) {
                Response::error('CPF ID é obrigatório', 400);
                return;
            }

            $id = $this->model->create($input);
            Response::success(['id' => $id], 'Certidão criada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar certidão: ' . $e->getMessage(), 500);
        }
    }
}
