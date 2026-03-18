<?php
// src/controllers/ConsultasCnpjController.php

require_once __DIR__ . '/../services/ConsultasCnpjService.php';
require_once __DIR__ . '/../utils/Response.php';

class ConsultasCnpjController {
    private $consultasCnpjService;
    
    public function __construct($db) {
        $this->consultasCnpjService = new ConsultasCnpjService($db);
    }
    
    public function create() {
        try {
            $rawInput = file_get_contents('php://input');
            error_log("📥 [CONSULTAS_CNPJ] Raw input recebido: " . $rawInput);
            
            $data = json_decode($rawInput, true);
            
            if (!$data) {
                error_log("❌ [CONSULTAS_CNPJ] Erro ao decodificar JSON");
                Response::badRequest('Dados inválidos');
                return;
            }
            
            error_log("✅ [CONSULTAS_CNPJ] Dados decodificados: " . json_encode($data));
            
            // Mapear 'document' para 'cnpj' se necessário
            if (isset($data['document']) && !isset($data['cnpj'])) {
                $data['cnpj'] = $data['document'];
                error_log("🔄 [CONSULTAS_CNPJ] Mapeando 'document' para 'cnpj': " . $data['cnpj']);
            }
            
            $id = $this->consultasCnpjService->createConsulta($data);
            
            if ($id) {
                error_log("✅ [CONSULTAS_CNPJ] Consulta criada com sucesso. ID: " . $id);
                Response::success(['id' => $id], 'Consulta registrada com sucesso', 201);
            } else {
                error_log("❌ [CONSULTAS_CNPJ] Erro ao criar consulta");
                Response::error('Erro ao registrar consulta');
            }
        } catch (Exception $e) {
            error_log("❌ [CONSULTAS_CNPJ] Exceção: " . $e->getMessage());
            Response::error($e->getMessage());
        }
    }
    
    public function getById() {
        try {
            $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
            $segments = explode('/', trim($path, '/'));
            $id = end($segments);
            
            if (!is_numeric($id)) {
                Response::badRequest('ID inválido');
                return;
            }
            
            $result = $this->consultasCnpjService->getConsultaById($id);
            
            if ($result) {
                Response::success($result, 'Consulta encontrada');
            } else {
                Response::notFound('Consulta não encontrada');
            }
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function getByUserId() {
        try {
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            
            if (!$userId) {
                Response::badRequest('user_id é obrigatório');
                return;
            }
            
            $result = $this->consultasCnpjService->getConsultasByUserId($userId, $page, $limit);
            Response::success($result, 'Consultas recuperadas com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function getAll() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            
            $result = $this->consultasCnpjService->getAllConsultas($page, $limit);
            Response::success($result, 'Consultas recuperadas com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
    
    public function getStats() {
        try {
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            
            $result = $this->consultasCnpjService->getStats($userId);
            Response::success($result, 'Estatísticas recuperadas com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage());
        }
    }
}
