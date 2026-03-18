
<?php
// src/controllers/ReportController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ReportService.php';

class ReportController {
    private $db;
    private $reportService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->reportService = new ReportService($db);
    }
    
    public function getFinancialReport() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            
            $report = $this->reportService->generateFinancialReport($userId, $startDate, $endDate);
            
            Response::success($report, 'Relatório financeiro gerado com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao gerar relatório financeiro: ' . $e->getMessage());
        }
    }
    
    public function getConsultationsReport() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            $type = $_GET['type'] ?? null;
            
            $report = $this->reportService->generateConsultationsReport($userId, $startDate, $endDate, $type);
            
            Response::success($report, 'Relatório de consultas gerado com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao gerar relatório de consultas: ' . $e->getMessage());
        }
    }
    
    public function getUsersReport() {
        // Verificar se é admin
        if (!$this->isAdmin()) {
            Response::forbidden('Acesso negado');
            return;
        }
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            
            $report = $this->reportService->generateUsersReport($startDate, $endDate);
            
            Response::success($report, 'Relatório de usuários gerado com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao gerar relatório de usuários: ' . $e->getMessage());
        }
    }
    
    public function getReferralsReport() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            
            $report = $this->reportService->generateReferralsReport($userId, $startDate, $endDate);
            
            Response::success($report, 'Relatório de indicações gerado com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao gerar relatório de indicações: ' . $e->getMessage());
        }
    }
    
    public function generateCustomReport() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['type']) || !isset($input['filters'])) {
            Response::error('Tipo e filtros são obrigatórios', 400);
            return;
        }
        
        try {
            $report = $this->reportService->generateCustomReport(
                $userId,
                $input['type'],
                $input['filters']
            );
            
            Response::success($report, 'Relatório personalizado gerado com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao gerar relatório personalizado: ' . $e->getMessage());
        }
    }
    
    public function exportReport() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $type = $_GET['type'] ?? 'financial';
            $format = $_GET['format'] ?? 'csv';
            $startDate = $_GET['start_date'] ?? date('Y-m-01');
            $endDate = $_GET['end_date'] ?? date('Y-m-t');
            
            $export = $this->reportService->exportReport($userId, $type, $format, $startDate, $endDate);
            
            if ($export['success']) {
                // Definir headers para download
                header('Content-Type: ' . $export['content_type']);
                header('Content-Disposition: attachment; filename="' . $export['filename'] . '"');
                echo $export['content'];
                exit;
            } else {
                Response::error($export['message'], 400);
            }
            
        } catch (Exception $e) {
            Response::serverError('Erro ao exportar relatório: ' . $e->getMessage());
        }
    }
    
    private function isAdmin() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) return false;
        
        $query = "SELECT user_role FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user && in_array($user['user_role'], ['admin', 'suporte']);
    }
}
