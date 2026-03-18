
<?php
// src/controllers/DashboardController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Transaction.php';
require_once __DIR__ . '/../models/Consulta.php';

class DashboardController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getStats() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            // Contar consultas de todas as tabelas
            // 1. Tabela consultations
            $queryConsultations = "SELECT COUNT(*) as total FROM consultations WHERE user_id = ?";
            $stmtConsultations = $this->db->prepare($queryConsultations);
            $stmtConsultations->execute([$userId]);
            $totalConsultations = (int)$stmtConsultations->fetch(PDO::FETCH_ASSOC)['total'];
            
            // 2. Tabela consultas_cpf
            $queryCpf = "SELECT COUNT(*) as total FROM consultas_cpf WHERE user_id = ?";
            $stmtCpf = $this->db->prepare($queryCpf);
            $stmtCpf->execute([$userId]);
            $totalCpf = (int)$stmtCpf->fetch(PDO::FETCH_ASSOC)['total'];
            
            // 3. Tabela consultas_cnpj
            $queryCnpj = "SELECT COUNT(*) as total FROM consultas_cnpj WHERE user_id = ?";
            $stmtCnpj = $this->db->prepare($queryCnpj);
            $stmtCnpj->execute([$userId]);
            $totalCnpj = (int)$stmtCnpj->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Somar todas as consultas
            $totalConsultas = $totalConsultations + $totalCpf + $totalCnpj;
            
            // Contar transações
            $queryTransacoes = "SELECT COUNT(*) as total FROM transactions WHERE user_id = ?";
            $stmtTransacoes = $this->db->prepare($queryTransacoes);
            $stmtTransacoes->execute([$userId]);
            $totalTransacoes = (int)$stmtTransacoes->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Calcular créditos e débitos
            $queryCreditos = "SELECT COALESCE(SUM(valor), 0) as total FROM transactions WHERE user_id = ? AND tipo = 'credito'";
            $stmtCreditos = $this->db->prepare($queryCreditos);
            $stmtCreditos->execute([$userId]);
            $totalCreditos = (float)$stmtCreditos->fetch(PDO::FETCH_ASSOC)['total'];
            
            $queryDebitos = "SELECT COALESCE(SUM(valor), 0) as total FROM transactions WHERE user_id = ? AND tipo = 'debito'";
            $stmtDebitos = $this->db->prepare($queryDebitos);
            $stmtDebitos->execute([$userId]);
            $totalDebitos = (float)$stmtDebitos->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Consultas bem-sucedidas
            $querySuccess = "SELECT COUNT(*) as total FROM consultations WHERE user_id = ? AND success = 1";
            $stmtSuccess = $this->db->prepare($querySuccess);
            $stmtSuccess->execute([$userId]);
            $totalSuccess = (int)$stmtSuccess->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Adicionar consultas_cpf (todas são bem-sucedidas)
            $totalSuccess += $totalCpf;
            
            // Adicionar consultas_cnpj bem-sucedidas
            $queryCnpjSuccess = "SELECT COUNT(*) as total FROM consultas_cnpj WHERE user_id = ? AND (status = 'completed' OR status IS NULL)";
            $stmtCnpjSuccess = $this->db->prepare($queryCnpjSuccess);
            $stmtCnpjSuccess->execute([$userId]);
            $totalSuccess += (int)$stmtCnpjSuccess->fetch(PDO::FETCH_ASSOC)['total'];
            
            $stats = [
                'total_consultas' => $totalConsultas,
                'total_consultas_sucesso' => $totalSuccess,
                'total_transacoes' => $totalTransacoes,
                'total_creditos' => $totalCreditos,
                'total_debitos' => $totalDebitos
            ];
            
            Response::success([
                'stats' => $stats
            ], 'Estatísticas obtidas com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter estatísticas: ' . $e->getMessage());
        }
    }
    
    public function getSummary() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            // Resumo da conta
            $query = "SELECT u.*, 
                        (SELECT COUNT(*) FROM consultations WHERE user_id = u.id) as total_consultas,
                        (SELECT COUNT(*) FROM consultations WHERE user_id = u.id AND DATE(created_at) = CURDATE()) as consultas_hoje
                      FROM users u WHERE u.id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $summary = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($summary, 'Resumo obtido com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter resumo: ' . $e->getMessage());
        }
    }
    
    public function getActivity() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $limit = $_GET['limit'] ?? 10;
            
            // Atividades recentes
            $query = "SELECT 'consulta' as tipo, tipo as subtipo, created_at, 'Consulta realizada' as descricao
                      FROM consultations WHERE user_id = ?
                      UNION ALL
                      SELECT 'transacao' as tipo, tipo as subtipo, created_at, descricao
                      FROM transactions WHERE user_id = ?
                      ORDER BY created_at DESC LIMIT ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $userId, $limit]);
            $activity = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($activity, 'Atividades obtidas com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter atividades: ' . $e->getMessage());
        }
    }
    
    public function getNotifications() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        try {
            $query = "SELECT * FROM notifications 
                      WHERE user_id = ? AND is_read = 0 
                      ORDER BY created_at DESC LIMIT 5";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($notifications, 'Notificações obtidas com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter notificações: ' . $e->getMessage());
        }
    }
    
    public function markNotificationRead() {
        $userId = $_SESSION['user_id'] ?? null;
        if (!$userId) {
            Response::unauthorized('Usuário não autenticado');
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['notification_id'])) {
            Response::error('ID da notificação é obrigatório', 400);
            return;
        }
        
        try {
            $query = "UPDATE notifications SET is_read = 1 
                      WHERE id = ? AND user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$input['notification_id'], $userId]);
            
            if ($result) {
                Response::success(null, 'Notificação marcada como lida');
            } else {
                Response::error('Erro ao marcar notificação');
            }
            
        } catch (Exception $e) {
            Response::serverError('Erro ao marcar notificação: ' . $e->getMessage());
        }
    }
}
