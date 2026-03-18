<?php
// src/controllers/ConsultasCpfHistoryController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ConsultasCpfHistoryController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Buscar histórico combinado de consultas CPF das tabelas consultas_cpf e consultations
     */
    public function getHistory() {
        try {
            error_log("CPF_HISTORY: Iniciando busca do histórico");
            
            // Verificar autenticação
            $authMiddleware = new AuthMiddleware($this->db);
            $userInfo = $authMiddleware->getCurrentUser();
            
            if (!$userInfo) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $userId = $userInfo['id'];
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 50);
            $offset = ($page - 1) * $limit;
            
            error_log("CPF_HISTORY: Buscando para usuário {$userId}, página {$page}, limite {$limit}");
            
            // Buscar da tabela consultas_cpf
            $queryConsultasCpf = "
                SELECT 
                    id,
                    'consultas_cpf' as source_table,
                    cpf_consultado as document,
                    resultado as result_data,
                    valor_cobrado as cost,
                    desconto_aplicado,
                    saldo_usado,
                    'completed' as status,
                    created_at,
                    created_at as updated_at
                FROM consultas_cpf 
                WHERE user_id = ?
            ";
            
            // Buscar da tabela consultations (apenas CPF) - extrair saldo_usado do metadata
            $queryConsultations = "
                SELECT 
                    id,
                    'consultations' as source_table,
                    document,
                    result_data,
                    cost,
                    metadata,
                    NULL as desconto_aplicado,
                    NULL as saldo_usado,
                    status,
                    created_at,
                    updated_at
                FROM consultations 
                WHERE user_id = ? AND module_type = 'cpf'
            ";
            
            // Query unificada com UNION ALL
            $unifiedQuery = "
                ($queryConsultasCpf)
                UNION ALL
                ($queryConsultations)
                ORDER BY created_at DESC
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($unifiedQuery);
            $stmt->execute([$userId, $userId, $limit, $offset]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Processar dados para formatação consistente
            $formattedHistory = [];
            foreach ($history as $item) {
                $formatted = [
                    'id' => (int)$item['id'],
                    'source_table' => $item['source_table'],
                    'document' => $item['document'],
                    'cost' => (float)$item['cost'],
                    'status' => $item['status'],
                    'created_at' => $item['created_at'],
                    'updated_at' => $item['updated_at']
                ];
                
                // Decodificar JSON se necessário
                if ($item['result_data']) {
                    $formatted['result_data'] = is_string($item['result_data']) 
                        ? json_decode($item['result_data'], true) 
                        : $item['result_data'];
                }
                
                // Processar campos específicos baseado na tabela de origem
                if ($item['source_table'] === 'consultas_cpf') {
                    $formatted['desconto_aplicado'] = (float)($item['desconto_aplicado'] ?? 0);
                    $formatted['saldo_usado'] = $item['saldo_usado'] ?? 'carteira';
                    
                    error_log("CPF_HISTORY: Registro consultas_cpf - ID: {$item['id']}, saldo_usado RAW: '{$item['saldo_usado']}', saldo_usado FORMATTED: '{$formatted['saldo_usado']}'");
                } else if ($item['source_table'] === 'consultations') {
                    // Para consultations, extrair saldo_usado do metadata
                    $metadata = null;
                    if ($item['metadata']) {
                        $metadata = is_string($item['metadata']) ? json_decode($item['metadata'], true) : $item['metadata'];
                    }
                    
                    $formatted['desconto_aplicado'] = 0; // consultations não tem desconto direto
                    $formatted['saldo_usado'] = $metadata['saldo_usado'] ?? 'carteira';
                    
                    error_log("CPF_HISTORY: Registro consultations - ID: {$item['id']}, saldo_usado (metadata): '{$formatted['saldo_usado']}', metadata: " . json_encode($metadata));
                    
                    // Adicionar campos do metadata se disponíveis
                    if ($metadata) {
                        $formatted['metadata'] = $metadata;
                        if (isset($metadata['original_price'])) {
                            $formatted['original_price'] = (float)$metadata['original_price'];
                        }
                        if (isset($metadata['discount'])) {
                            $formatted['desconto_aplicado'] = (float)$metadata['discount'];
                        }
                    }
                }
                
                $formattedHistory[] = $formatted;
            }
            
            // Contar total de registros
            $countQuery = "
                SELECT COUNT(*) as total FROM (
                    SELECT id FROM consultas_cpf WHERE user_id = ?
                    UNION ALL
                    SELECT id FROM consultations WHERE user_id = ? AND module_type = 'cpf'
                ) as combined
            ";
            
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute([$userId, $userId]);
            $totalCount = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            $totalPages = ceil($totalCount / $limit);
            
            error_log("CPF_HISTORY: Encontrados {$totalCount} registros, retornando " . count($formattedHistory));
            
            Response::success([
                'data' => $formattedHistory,
                'pagination' => [
                    'total' => $totalCount,
                    'page' => $page,
                    'limit' => $limit,
                    'total_pages' => $totalPages,
                    'has_next' => $page < $totalPages,
                    'has_prev' => $page > 1
                ]
            ], 'Histórico de consultas CPF carregado com sucesso');
            
        } catch (Exception $e) {
            error_log("CPF_HISTORY_ERROR: " . $e->getMessage());
            error_log("CPF_HISTORY_STACK: " . $e->getTraceAsString());
            Response::error('Erro ao carregar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Buscar estatísticas do histórico de consultas CPF
     */
    public function getStats() {
        try {
            $authMiddleware = new AuthMiddleware($this->db);
            $userInfo = $authMiddleware->getCurrentUser();
            
            if (!$userInfo) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $userId = $userInfo['id'];
            
            // Estatísticas das consultas_cpf
            $statsCpfQuery = "
                SELECT 
                    COUNT(*) as total_cpf,
                    SUM(valor_cobrado) as total_cost_cpf,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_cpf,
                    COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as this_month_cpf
                FROM consultas_cpf 
                WHERE user_id = ?
            ";
            
            // Estatísticas das consultations (apenas CPF)
            $statsConsultationsQuery = "
                SELECT 
                    COUNT(*) as total_consultations,
                    SUM(cost) as total_cost_consultations,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today_consultations,
                    COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as this_month_consultations
                FROM consultations 
                WHERE user_id = ? AND module_type = 'cpf'
            ";
            
            $stmtCpf = $this->db->prepare($statsCpfQuery);
            $stmtCpf->execute([$userId]);
            $statsCpf = $stmtCpf->fetch(PDO::FETCH_ASSOC);
            
            $stmtConsultations = $this->db->prepare($statsConsultationsQuery);
            $stmtConsultations->execute([$userId]);
            $statsConsultations = $stmtConsultations->fetch(PDO::FETCH_ASSOC);
            
            // Combinar estatísticas
            $combinedStats = [
                'total' => (int)$statsCpf['total_cpf'] + (int)$statsConsultations['total_consultations'],
                'completed' => (int)$statsCpf['total_cpf'] + (int)$statsConsultations['completed'], // consultas_cpf são sempre completed
                'failed' => (int)$statsConsultations['failed'],
                'processing' => (int)$statsConsultations['processing'],
                'today' => (int)$statsCpf['today_cpf'] + (int)$statsConsultations['today_consultations'],
                'this_month' => (int)$statsCpf['this_month_cpf'] + (int)$statsConsultations['this_month_consultations'],
                'total_cost' => (float)$statsCpf['total_cost_cpf'] + (float)$statsConsultations['total_cost_consultations']
            ];
            
            Response::success($combinedStats, 'Estatísticas carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("CPF_HISTORY_STATS_ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
}