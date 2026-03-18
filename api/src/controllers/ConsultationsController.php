<?php
// src/controllers/ConsultationsController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ConsultasCpfService.php';
require_once __DIR__ . '/../models/Consultations.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ConsultationsController {
    private $db;
    private $consultasCpfService;
    private $consultationsModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultasCpfService = new ConsultasCpfService($db);
        $this->consultationsModel = new Consultations($db);
    }
    
    public function getAll() {
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            $status = $_GET['status'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            $whereConditions = [];
            $params = [];
            
            if ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            $query = "SELECT * FROM consultations $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields
            foreach ($consultations as &$consultation) {
                if (isset($consultation['result_data'])) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if (isset($consultation['metadata'])) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM consultations $whereClause";
            $countParams = array_slice($params, 0, -2); // Remove limit and offset
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($countParams);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $result = [
                'data' => $consultations,
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_pages' => ceil($total / $limit)
            ];
            
            Response::success($result, 'Consultas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consultas: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByUser($userId) {
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            $status = $_GET['status'] ?? null;
            
            $offset = ($page - 1) * $limit;
            $whereConditions = ["user_id = ?"];
            $params = [(int)$userId];
            
            if ($status) {
                $whereConditions[] = "status = ?";
                $params[] = $status;
            }
            
            $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
            
            $query = "SELECT * FROM consultations $whereClause ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Decode JSON fields
            foreach ($consultations as &$consultation) {
                if (isset($consultation['result_data'])) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if (isset($consultation['metadata'])) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM consultations $whereClause";
            $countParams = array_slice($params, 0, -2); // Remove limit and offset
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($countParams);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $result = [
                'data' => $consultations,
                'total' => $total,
                'page' => (int)$page,
                'limit' => (int)$limit,
                'total_pages' => ceil($total / $limit)
            ];
            
            Response::success($result, 'Consultas do usuário carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consultas do usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $query = "SELECT * FROM consultations WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([(int)$id]);
            $consultation = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$consultation) {
                Response::error('Consulta não encontrada', 404);
                return;
            }
            
            // Decode JSON fields
            if (isset($consultation['result_data'])) {
                $consultation['result_data'] = json_decode($consultation['result_data'], true);
            }
            if (isset($consultation['metadata'])) {
                $consultation['metadata'] = json_decode($consultation['metadata'], true);
            }
            
            Response::success($consultation, 'Consulta carregada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consulta: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUserStats($userId) {
        try {
            $query = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                        SUM(cost) as total_cost
                      FROM consultations 
                      WHERE user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([(int)$userId]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $successRate = $stats['total'] > 0 ? ($stats['completed'] / $stats['total']) * 100 : 0;
            
            $result = [
                'success_rate' => round($successRate, 2),
                'total_cost' => (float)$stats['total_cost'],
                'total_consultations' => (int)$stats['total'],
                'completed' => (int)$stats['completed'],
                'failed' => (int)$stats['failed'],
                'processing' => (int)$stats['processing']
            ];
            
            Response::success($result, 'Estatísticas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("🚀 CONSULTATIONS_CONTROLLER: ===== INICIANDO CRIAÇÃO DE CONSULTA =====");
            error_log("🚀 CONSULTATIONS_CONTROLLER: Método: " . $_SERVER['REQUEST_METHOD']);
            error_log("🚀 CONSULTATIONS_CONTROLLER: URI: " . $_SERVER['REQUEST_URI']);
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                error_log("❌ CONSULTATIONS_CONTROLLER: Dados inválidos recebidos");
                Response::error('Dados inválidos', 400);
                return;
            }
            
            error_log("📊 CONSULTATIONS_CONTROLLER: Dados recebidos: " . json_encode($input, JSON_PRETTY_PRINT));
            
            // Remover a validação obrigatória do module_type, pois no contexto de CPF ele é implícito
            if (empty($input['user_id']) || empty($input['document'])) {
                error_log("CONSULTATIONS_CONTROLLER: Campos obrigatórios faltando - user_id: " . ($input['user_id'] ?? 'VAZIO') . ", document: " . ($input['document'] ?? 'VAZIO'));
                Response::error('Campos obrigatórios: user_id, document', 400);
                return;
            }
            
            // Definir module_type como 'cpf' se não estiver presente (contexto CPF)
            if (empty($input['module_type'])) {
                $input['module_type'] = 'cpf';
            }
            
            // Obter ID do usuário atual da autenticação
            $currentUserId = AuthMiddleware::getCurrentUserId();
            if (!$currentUserId) {
                error_log("CONSULTATIONS_CONTROLLER: Usuário não autenticado");
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            // Verificar se o usuário está tentando criar consulta para si mesmo ou se é admin
            if ($input['user_id'] != $currentUserId) {
                // TODO: Verificar se é admin ou tem permissão especial
                error_log("CONSULTATIONS_CONTROLLER: Usuário tentando criar consulta para outro usuário");
            }
            
            // Adicionar dados do contexto atual
            $consultationData = $input;
            $consultationData['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? null;
            $consultationData['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            // Logs de debug para verificar valores
            error_log("CONSULTATIONS_CONTROLLER: Custo recebido: " . ($consultationData['cost'] ?? 'NULL'));
            error_log("CONSULTATIONS_CONTROLLER: Metadata recebido: " . json_encode($consultationData['metadata'] ?? []));
            
            // Usar o serviço existente para processar a consulta (inclui desconto de saldo)
            $id = $this->consultasCpfService->createConsulta($consultationData);
            
            // Também registrar na nova tabela consultations
            try {
                $consultationData['status'] = 'completed'; // Status da consulta processada
                $consultationsId = $this->consultationsModel->create($consultationData);
                error_log("CONSULTATIONS_CONTROLLER: Consulta registrada na tabela consultations com ID: " . $consultationsId);
            } catch (Exception $e) {
                error_log("CONSULTATIONS_CONTROLLER: Erro ao registrar na tabela consultations: " . $e->getMessage());
                // Continue mesmo se falhar o registro na nova tabela
            }
            
            error_log("CONSULTATIONS_CONTROLLER: Consulta criada com sucesso - ID: " . $id);
            
            Response::success([
                'id' => $id,
                'consultations_id' => $consultationsId ?? null,
                'message' => 'Consulta criada com sucesso'
            ], 'Consulta criada com sucesso');
            
        } catch (Exception $e) {
            error_log("CONSULTATIONS_CONTROLLER CREATE ERROR: " . $e->getMessage());
            Response::error('Erro ao criar consulta: ' . $e->getMessage(), 400);
        }
    }
}