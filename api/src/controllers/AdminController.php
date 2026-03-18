
<?php
// src/controllers/AdminController.php

require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class AdminController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getDashboardStats() {
        AuthMiddleware::requireAdmin();
        
        try {
            $stats = [];
            
            // Total de usuários
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM usuarios");
            $stmt->execute();
            $stats['totalUsers'] = (int)$stmt->fetch()['total'];
            
            // Usuários ativos
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM usuarios WHERE status = 'ativo'");
            $stmt->execute();
            $stats['activeUsers'] = (int)$stmt->fetch()['total'];
            
            // Total de consultas
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM consultas");
            $stmt->execute();
            $stats['totalConsultations'] = (int)$stmt->fetch()['total'];
            
            // Consultas hoje
            $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM consultas WHERE DATE(created_at) = CURDATE()");
            $stmt->execute();
            $stats['todayConsultations'] = (int)$stmt->fetch()['total'];
            
            // Total de receita
            $stmt = $this->db->prepare("SELECT SUM(amount) as total FROM payments WHERE status = 'concluido'");
            $stmt->execute();
            $result = $stmt->fetch();
            $stats['totalRevenue'] = (float)($result['total'] ?? 0);
            
            Response::success($stats);
        } catch (Exception $e) {
            Response::error('Erro ao buscar estatísticas: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUsers() {
        AuthMiddleware::requireAdmin();
        
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT id, login, email, full_name, status, tipoplano, saldo, created_at 
                     FROM usuarios ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$limit, $offset]);
            $users = $stmt->fetchAll();
            
            $countQuery = "SELECT COUNT(*) as total FROM usuarios";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute();
            $total = (int)$countStmt->fetch()['total'];
            
            $userData = array_map(function($user) {
                return [
                    'id' => (int)$user['id'],
                    'login' => $user['login'],
                    'email' => $user['email'],
                    'fullName' => $user['full_name'],
                    'status' => $user['status'],
                    'plan' => $user['tipoplano'],
                    'balance' => (float)$user['saldo'],
                    'createdAt' => $user['created_at']
                ];
            }, $users);
            
            Response::paginated($userData, $total, $page, $limit);
        } catch (Exception $e) {
            Response::error('Erro ao buscar usuários: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateUserStatus($id) {
        AuthMiddleware::requireAdmin();
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['status'])) {
            Response::error('Status é obrigatório', 400);
        }
        
        try {
            $query = "UPDATE usuarios SET status = ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$data['status'], $id])) {
                Response::success(null, 'Status do usuário atualizado');
            } else {
                Response::error('Erro ao atualizar status', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
}
