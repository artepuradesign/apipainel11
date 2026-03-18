
<?php
// src/services/ReportService.php

require_once __DIR__ . '/../models/Report.php';

class ReportService {
    private $db;
    private $report;
    
    public function __construct($db) {
        $this->db = $db;
        $this->report = new Report($db);
    }
    
    public function generateUserReport($userId, $reportType, $startDate, $endDate) {
        try {
            switch ($reportType) {
                case 'consultations':
                    $data = $this->report->generateConsultationReport($userId, $startDate, $endDate);
                    break;
                case 'financial':
                    $data = $this->report->generateFinancialReport($userId, $startDate, $endDate);
                    break;
                default:
                    throw new Exception('Tipo de relatório não suportado');
            }
            
            // Salvar relatório
            $this->report->user_id = $userId;
            $this->report->title = ucfirst($reportType) . ' Report';
            $this->report->type = $reportType;
            $this->report->data = json_encode($data);
            $this->report->filters = json_encode([
                'start_date' => $startDate,
                'end_date' => $endDate
            ]);
            
            if ($this->report->create()) {
                return [
                    'success' => true,
                    'report_id' => $this->report->id,
                    'data' => $data
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao salvar relatório'
            ];
        } catch (Exception $e) {
            error_log("ReportService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function generateSystemReport() {
        try {
            $data = $this->report->getSystemStats();
            
            // Adicionar estatísticas detalhadas
            $data['detailed_stats'] = $this->getDetailedSystemStats();
            
            return [
                'success' => true,
                'data' => $data
            ];
        } catch (Exception $e) {
            error_log("ReportService system error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao gerar relatório do sistema'
            ];
        }
    }
    
    public function exportReport($reportId, $format = 'json') {
        try {
            $this->report->id = $reportId;
            if (!$this->report->readOne()) {
                return [
                    'success' => false,
                    'message' => 'Relatório não encontrado'
                ];
            }
            
            $data = json_decode($this->report->data, true);
            
            switch ($format) {
                case 'csv':
                    return $this->exportToCsv($data);
                case 'pdf':
                    return $this->exportToPdf($data);
                case 'excel':
                    return $this->exportToExcel($data);
                default:
                    return [
                        'success' => true,
                        'format' => 'json',
                        'data' => $data
                    ];
            }
        } catch (Exception $e) {
            error_log("ReportService export error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao exportar relatório'
            ];
        }
    }
    
    private function getDetailedSystemStats() {
        $stats = [];
        
        // Usuários por plano
        $query = "SELECT tipoplano, COUNT(*) as count FROM usuarios GROUP BY tipoplano";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['users_by_plan'] = $stmt->fetchAll();
        
        // Consultas por tipo
        $query = "SELECT tipo, COUNT(*) as count FROM consultas 
                 WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
                 GROUP BY tipo";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['consultations_by_type'] = $stmt->fetchAll();
        
        // Transações por tipo
        $query = "SELECT tipo, COUNT(*) as count, SUM(valor) as total 
                 FROM transacoes 
                 WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
                 GROUP BY tipo";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['transactions_by_type'] = $stmt->fetchAll();
        
        return $stats;
    }
    
    private function exportToCsv($data) {
        $csv = "sep=,\n"; // Para Excel reconhecer vírgula como separador
        
        if (is_array($data) && !empty($data)) {
            // Cabeçalhos
            $headers = array_keys($data[0]);
            $csv .= implode(',', $headers) . "\n";
            
            // Dados
            foreach ($data as $row) {
                $csv .= implode(',', array_map(function($field) {
                    return '"' . str_replace('"', '""', $field) . '"';
                }, $row)) . "\n";
            }
        }
        
        return [
            'success' => true,
            'format' => 'csv',
            'content' => $csv,
            'filename' => 'report_' . date('Y-m-d_H-i-s') . '.csv'
        ];
    }
    
    private function exportToPdf($data) {
        // Implementar geração de PDF
        return [
            'success' => false,
            'message' => 'Exportação PDF não implementada'
        ];
    }
    
    private function exportToExcel($data) {
        // Implementar geração de Excel
        return [
            'success' => false,
            'message' => 'Exportação Excel não implementada'
        ];
    }
    
    public function scheduleReport($userId, $reportType, $frequency = 'monthly') {
        try {
            $query = "INSERT INTO scheduled_reports (user_id, type, frequency, next_run, status) 
                     VALUES (?, ?, ?, ?, 'active')";
            
            $nextRun = $this->calculateNextRun($frequency);
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$userId, $reportType, $frequency, $nextRun])) {
                return [
                    'success' => true,
                    'message' => 'Relatório agendado com sucesso'
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao agendar relatório'
            ];
        } catch (Exception $e) {
            error_log("ReportService schedule error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao agendar relatório'
            ];
        }
    }
    
    private function calculateNextRun($frequency) {
        switch ($frequency) {
            case 'daily':
                return date('Y-m-d H:i:s', strtotime('+1 day'));
            case 'weekly':
                return date('Y-m-d H:i:s', strtotime('+1 week'));
            case 'monthly':
                return date('Y-m-d H:i:s', strtotime('+1 month'));
            default:
                return date('Y-m-d H:i:s', strtotime('+1 month'));
        }
    }
}
