<?php
// src/controllers/BaseFotoController.php

require_once __DIR__ . '/../services/BaseFotoService.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseFotoController {
    private $db;
    private $baseFotoService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseFotoService = new BaseFotoService($db);
    }
    
    public function getByCpfId() {
        try {
            if (!isset($_GET['cpf_id']) || empty($_GET['cpf_id'])) {
                Response::error('cpf_id é obrigatório', 400);
                return;
            }
            
            $fotos = $this->baseFotoService->getFotosByCpfId($_GET['cpf_id']);
            Response::success(['fotos' => $fotos], 'Fotos recuperadas com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados inválidos ou ausentes', 400);
                return;
            }
            
            $id = $this->baseFotoService->createFoto($input);
            Response::success(['id' => $id], 'Foto cadastrada com sucesso', 201);
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function update() {
        try {
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                Response::error('id é obrigatório', 400);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados inválidos ou ausentes', 400);
                return;
            }
            
            $success = $this->baseFotoService->updateFoto($_GET['id'], $input);
            
            if ($success) {
                Response::success(null, 'Foto atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar foto', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            if (!isset($_GET['id']) || empty($_GET['id'])) {
                Response::error('id é obrigatório', 400);
                return;
            }
            
            $success = $this->baseFotoService->deleteFoto($_GET['id']);
            
            if ($success) {
                Response::success(null, 'Foto removida com sucesso');
            } else {
                Response::error('Erro ao remover foto', 500);
            }
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }
}
