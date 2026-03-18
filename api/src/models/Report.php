
<?php
// src/models/Report.php

require_once 'BaseModel.php';

class Report extends BaseModel {
    protected $table = 'reports';
    
    public $id;
    public $user_id;
    public $title;
    public $type;
    public $data;
    public $filters;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function generateConsultationReport($userId, $startDate, $endDate) {
        $query = "SELECT 
                    tipo,
                    COUNT(*) as total,
                    SUM(custo) as total_custo,
                    AVG(custo) as custo_medio
                 FROM consultas 
                 WHERE user_id = ? AND created_at BETWEEN ? AND ?
                 GROUP BY tipo";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }
    
    public function generateFinancialReport($userId, $startDate, $endDate) {
        $query = "SELECT 
                    tipo,
                    COUNT(*) as total_transacoes,
                    SUM(valor) as total_valor
                 FROM transacoes 
                 WHERE user_id = ? AND created_at BETWEEN ? AND ?
                 GROUP BY tipo";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $startDate, $endDate]);
        return $stmt->fetchAll();
    }
    
    public function getSystemStats() {
        $stats = [];
        
        // Total de usuários
        $query = "SELECT COUNT(*) as total FROM usuarios";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['total_users'] = $stmt->fetch()['total'];
        
        // Total de consultas hoje
        $query = "SELECT COUNT(*) as total FROM consultas WHERE DATE(created_at) = CURDATE()";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['consultations_today'] = $stmt->fetch()['total'];
        
        // Receita total
        $query = "SELECT SUM(amount) as total FROM payments WHERE status = 'aprovado'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['total_revenue'] = $stmt->fetch()['total'] ?? 0;
        
        return $stats;
    }
}
