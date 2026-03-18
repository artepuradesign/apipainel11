<?php
// src/controllers/HistoricoController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/HistoricoService.php';

class HistoricoController {
    private $db;
    private $historicoService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->historicoService = new HistoricoService($db);
    }
    
    /**
     * Buscar histórico completo do usuário
     */
    public function getHistoricoCompleto() {
        try {
            $userId = $_GET['user_id'] ?? null;
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            
            if (!$userId) {
                Response::error('ID do usuário é obrigatório', 400);
                return;
            }
            
            // Filtros opcionais
            $filters = [
                'balance_type' => $_GET['balance_type'] ?? null,
                'date_from' => $_GET['date_from'] ?? null,
                'date_to' => $_GET['date_to'] ?? null
            ];
            
            // Remover filtros vazios
            $filters = array_filter($filters, function($value) {
                return !empty($value);
            });
            
            $result = $this->historicoService->getHistoricoCompleto($userId, $page, $limit, $filters);
            
            Response::success($result, 'Histórico carregado com sucesso');
        } catch (Exception $e) {
            error_log("HISTORICO_CONTROLLER: Erro ao carregar histórico: " . $e->getMessage());
            Response::error('Erro ao carregar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Buscar estatísticas do usuário
     */
    public function getEstatisticas() {
        try {
            $userId = $_GET['user_id'] ?? null;
            
            if (!$userId) {
                Response::error('ID do usuário é obrigatório', 400);
                return;
            }
            
            $stats = $this->historicoService->getEstatisticasUsuario($userId);
            
            Response::success($stats, 'Estatísticas carregadas com sucesso');
        } catch (Exception $e) {
            error_log("HISTORICO_CONTROLLER: Erro ao carregar estatísticas: " . $e->getMessage());
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
}