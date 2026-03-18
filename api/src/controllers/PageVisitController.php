<?php
// src/controllers/PageVisitController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../utils/Response.php';

class PageVisitController extends BaseController {
    
    public function __construct($db) {
        parent::__construct($db);
    }

    // Registrar visita (público - pode ser usuario ou visitante)
    public function register() {
        $input = $this->validateJsonInput();
        if (!$input['valid']) {
            Response::error('Dados inválidos', 400);
            return;
        }

        $data = $input['data'];
        $pagePath = $data['page_path'] ?? null;
        $pageTitle = $data['page_title'] ?? null;
        $userId = $data['user_id'] ?? null;
        $visitorType = $userId ? 'usuario' : 'visitante';

        if (!$pagePath) {
            Response::error('page_path é obrigatório', 400);
            return;
        }

        try {
            $stmt = $this->db->prepare(
                "INSERT INTO page_visits (page_path, page_title, user_id, visitor_type, ip_address, user_agent, referrer) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)"
            );
            $stmt->execute([
                $pagePath,
                $pageTitle,
                $userId,
                $visitorType,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null,
                $data['referrer'] ?? null
            ]);

            Response::success(['message' => 'Visita registrada']);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_REGISTER: " . $e->getMessage());
            Response::error('Erro ao registrar visita', 500);
        }
    }

    // Resumo geral (admin)
    public function getSummary() {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = ($page - 1) * $limit;
            $search = $_GET['search'] ?? '';
            $dateFrom = $_GET['date_from'] ?? null;
            $dateTo = $_GET['date_to'] ?? null;

            $where = '';
            $params = [];

            if ($search) {
                $where .= " WHERE page_path LIKE ?";
                $params[] = "%{$search}%";
            }

            if ($dateFrom) {
                $where .= ($where ? ' AND' : ' WHERE') . " created_at >= ?";
                $params[] = $dateFrom;
            }
            if ($dateTo) {
                $where .= ($where ? ' AND' : ' WHERE') . " created_at <= ?";
                $params[] = $dateTo . ' 23:59:59';
            }

            // Total de páginas distintas
            $countQuery = "SELECT COUNT(DISTINCT page_path) as total FROM page_visits" . $where;
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($params);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            // Resumo agrupado por página
            $query = "SELECT 
                        page_path,
                        COUNT(*) as total_visits,
                        COUNT(DISTINCT CASE WHEN visitor_type = 'usuario' THEN user_id END) as unique_users,
                        SUM(CASE WHEN visitor_type = 'visitante' THEN 1 ELSE 0 END) as visitor_count,
                        SUM(CASE WHEN visitor_type = 'usuario' THEN 1 ELSE 0 END) as user_count,
                        MAX(created_at) as last_visit,
                        MIN(created_at) as first_visit
                      FROM page_visits" . $where . "
                      GROUP BY page_path
                      ORDER BY total_visits DESC
                      LIMIT ? OFFSET ?";

            $params[] = $limit;
            $params[] = $offset;

            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Stats globais
            $statsQuery = "SELECT 
                            COUNT(*) as total_all_visits,
                            COUNT(DISTINCT page_path) as total_pages,
                            COUNT(DISTINCT CASE WHEN visitor_type = 'usuario' THEN user_id END) as total_unique_users,
                            SUM(CASE WHEN visitor_type = 'visitante' THEN 1 ELSE 0 END) as total_visitors,
                            SUM(CASE WHEN visitor_type = 'usuario' THEN 1 ELSE 0 END) as total_user_visits
                           FROM page_visits";
            $statsStmt = $this->db->prepare($statsQuery);
            $statsStmt->execute();
            $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

            Response::success([
                'summary' => $results,
                'stats' => $stats,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_SUMMARY: " . $e->getMessage());
            Response::error('Erro ao buscar resumo', 500);
        }
    }

    // Detalhes de visitas por página (admin)
    public function getPageDetails($pagePath) {
        try {
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = ($page - 1) * $limit;

            $decodedPath = urldecode($pagePath);

            $countStmt = $this->db->prepare("SELECT COUNT(*) as total FROM page_visits WHERE page_path = ?");
            $countStmt->execute([$decodedPath]);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

            $query = "SELECT pv.*, u.full_name, u.email
                      FROM page_visits pv
                      LEFT JOIN users u ON pv.user_id = u.id
                      WHERE pv.page_path = ?
                      ORDER BY pv.created_at DESC
                      LIMIT " . (int)$limit . " OFFSET " . (int)$offset;
            $stmt = $this->db->prepare($query);
            $stmt->execute([$decodedPath]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success([
                'visits' => $results,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_DETAILS: " . $e->getMessage());
            Response::error('Erro ao buscar detalhes', 500);
        }
    }

    // Top usuários (admin)
    public function getTopUsers() {
        try {
            $limit = isset($_GET['limit']) ? max(1, min((int)$_GET['limit'], 100)) : 20;

            $query = "SELECT 
                        pv.user_id, u.full_name, u.email,
                        COUNT(*) as total_visits,
                        COUNT(DISTINCT pv.page_path) as pages_visited,
                        MAX(pv.created_at) as last_visit
                      FROM page_visits pv
                      INNER JOIN users u ON pv.user_id = u.id
                      WHERE pv.visitor_type = 'usuario' AND pv.user_id IS NOT NULL
                      GROUP BY pv.user_id, u.full_name, u.email
                      ORDER BY total_visits DESC
                      LIMIT " . $limit;
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success(['users' => $results]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_TOP_USERS: " . $e->getMessage());
            Response::error('Erro ao buscar top users: ' . $e->getMessage(), 500);
        }
    }

    // Visitas por dia (admin - gráfico)
    public function getDailyStats() {
        try {
            $days = isset($_GET['days']) ? (int)$_GET['days'] : 30;

            $query = "SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as total_visits,
                        SUM(CASE WHEN visitor_type = 'usuario' THEN 1 ELSE 0 END) as user_visits,
                        SUM(CASE WHEN visitor_type = 'visitante' THEN 1 ELSE 0 END) as visitor_visits,
                        COUNT(DISTINCT CASE WHEN visitor_type = 'usuario' THEN user_id END) as unique_users
                      FROM page_visits
                      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                      GROUP BY DATE(created_at)
                      ORDER BY date DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$days]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            Response::success(['daily' => $results]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_DAILY: " . $e->getMessage());
            Response::error('Erro ao buscar stats diárias', 500);
        }
    }

    // Deletar registros antigos (admin)
    public function cleanup() {
        $input = $this->validateJsonInput();
        $days = $input['data']['days'] ?? 90;

        try {
            $stmt = $this->db->prepare("DELETE FROM page_visits WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)");
            $stmt->execute([$days]);
            $deleted = $stmt->rowCount();

            Response::success(['message' => "Removidos {$deleted} registros com mais de {$days} dias"]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_CLEANUP: " . $e->getMessage());
            Response::error('Erro ao limpar registros', 500);
        }
    }

    // Deletar todos os registros de uma página (admin)
    public function deleteByPage() {
        $input = $this->validateJsonInput();
        $pagePath = $input['data']['page_path'] ?? null;

        if (!$pagePath) {
            Response::error('page_path é obrigatório', 400);
            return;
        }

        try {
            $stmt = $this->db->prepare("DELETE FROM page_visits WHERE page_path = ?");
            $stmt->execute([$pagePath]);
            $deleted = $stmt->rowCount();

            Response::success(['message' => "Removidos {$deleted} registros da página {$pagePath}"]);
        } catch (Exception $e) {
            error_log("PAGE_VISIT_DELETE: " . $e->getMessage());
            Response::error('Erro ao deletar registros', 500);
        }
    }
}
