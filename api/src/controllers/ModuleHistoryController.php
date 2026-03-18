
<?php
// src/controllers/ModuleHistoryController.php
// Controller para histórico e estatísticas por módulo (page_route)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ModuleHistoryController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Buscar histórico de consultas por page_route
     * GET /module-history?page_route=/dashboard/consultar-nome-completo&limit=5
     */
    public function getHistory() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $pageRoute = $_GET['page_route'] ?? '';
            $limit = min((int)($_GET['limit'] ?? 5), 50);
            $offset = (int)($_GET['offset'] ?? 0);
            
            if (empty($pageRoute)) {
                Response::error('page_route é obrigatório', 400);
                return;
            }
            
            error_log("MODULE_HISTORY: Buscando histórico para page_route={$pageRoute}, user_id={$userId}, limit={$limit}");
            
            // Buscar consultas onde metadata.page_route = $pageRoute
            $query = "SELECT 
                        id, user_id, module_type, document, cost, status, 
                        result_data, metadata, created_at, updated_at
                      FROM consultations 
                      WHERE user_id = ? 
                        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.page_route')) = ?
                      ORDER BY created_at DESC 
                      LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $pageRoute, $limit, $offset]);
            $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("MODULE_HISTORY: Encontradas " . count($consultations) . " consultas");
            
            // Decode JSON fields
            foreach ($consultations as &$consultation) {
                if (isset($consultation['result_data'])) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if (isset($consultation['metadata'])) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            // Contar total
            $countQuery = "SELECT COUNT(*) as total 
                          FROM consultations 
                          WHERE user_id = ? 
                            AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.page_route')) = ?";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute([$userId, $pageRoute]);
            $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            Response::success([
                'data' => $consultations,
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset
            ], 'Histórico carregado com sucesso');
            
        } catch (Exception $e) {
            error_log("MODULE_HISTORY ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Buscar estatísticas de consultas por page_route
     * GET /module-history/stats?page_route=/dashboard/consultar-nome-completo
     */
    public function getStats() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $pageRoute = $_GET['page_route'] ?? '';
            
            if (empty($pageRoute)) {
                Response::error('page_route é obrigatório', 400);
                return;
            }
            
            error_log("MODULE_HISTORY_STATS: Buscando stats para page_route={$pageRoute}, user_id={$userId}");
            
            // Estatísticas gerais
            $query = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status IN ('completed', 'naoencontrado') THEN 1 ELSE 0 END) as completed,
                        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                        COALESCE(SUM(cost), 0) as total_cost
                      FROM consultations 
                      WHERE user_id = ? 
                        AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.page_route')) = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $pageRoute]);
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Consultas hoje
            $todayQuery = "SELECT COUNT(*) as today
                          FROM consultations 
                          WHERE user_id = ? 
                            AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.page_route')) = ?
                            AND DATE(created_at) = CURDATE()";
            $todayStmt = $this->db->prepare($todayQuery);
            $todayStmt->execute([$userId, $pageRoute]);
            $today = (int)$todayStmt->fetch(PDO::FETCH_ASSOC)['today'];
            
            // Consultas este mês
            $monthQuery = "SELECT COUNT(*) as this_month
                          FROM consultations 
                          WHERE user_id = ? 
                            AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.page_route')) = ?
                            AND MONTH(created_at) = MONTH(CURDATE())
                            AND YEAR(created_at) = YEAR(CURDATE())";
            $monthStmt = $this->db->prepare($monthQuery);
            $monthStmt->execute([$userId, $pageRoute]);
            $thisMonth = (int)$monthStmt->fetch(PDO::FETCH_ASSOC)['this_month'];
            
            $result = [
                'total' => (int)$stats['total'],
                'completed' => (int)$stats['completed'],
                'failed' => (int)$stats['failed'],
                'processing' => (int)$stats['processing'],
                'total_cost' => (float)$stats['total_cost'],
                'today' => $today,
                'this_month' => $thisMonth
            ];
            
            error_log("MODULE_HISTORY_STATS: " . json_encode($result));
            
            Response::success($result, 'Estatísticas carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("MODULE_HISTORY_STATS ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
}
