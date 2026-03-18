
<?php
// src/controllers/SystemLogsController.php

require_once '../models/SystemLog.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class SystemLogsController {
    private $db;
    private $systemLog;
    
    public function __construct($db) {
        $this->db = $db;
        $this->systemLog = new SystemLog($db);
    }
    
    public function getUserAccessLogs() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Buscar logs de login e acesso do usuário específico
            $query = "SELECT 
                        sl.*,
                        u.full_name as user_name
                      FROM system_logs sl
                      LEFT JOIN users u ON sl.user_id = u.id
                      WHERE sl.user_id = ? 
                      AND sl.action IN ('login', 'access', 'page_view')
                      ORDER BY sl.created_at DESC 
                      LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $logs = $stmt->fetchAll();
            
            $accessLogs = array_map(function($log) {
                return [
                    'id' => $log['id'],
                    'action' => $log['action'],
                    'description' => $log['description'],
                    'ip_address' => $log['ip_address'],
                    'user_agent' => $log['user_agent'],
                    'created_at' => $log['created_at'],
                    'details' => $log['details'] ? json_decode($log['details'], true) : null
                ];
            }, $logs);
            
            Response::success($accessLogs);
        } catch (Exception $e) {
            Response::error('Erro ao buscar logs de acesso: ' . $e->getMessage(), 500);
        }
    }
    
    public function getAllSystemLogs() {
        // Apenas usuários de suporte podem ver todos os logs
        $userId = AuthMiddleware::getCurrentUserId();
        $userRole = AuthMiddleware::getCurrentUserRole();
        
        if ($userRole !== 'suporte' && $userRole !== 'admin') {
            Response::error('Acesso negado', 403);
        }
        
        try {
            $limit = $_GET['limit'] ?? 100;
            $level = $_GET['level'] ?? null;
            
            $logs = $this->systemLog->getRecentLogs($limit, $level);
            
            Response::success($logs);
        } catch (Exception $e) {
            Response::error('Erro ao buscar logs do sistema: ' . $e->getMessage(), 500);
        }
    }
    
    public function logUserAccess() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $page = $data['page'] ?? '/dashboard';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
            
            // Detectar dispositivo
            $device = 'Desktop Computer';
            if (preg_match('/Mobile/', $userAgent)) {
                $device = 'Mobile Device';
            } elseif (preg_match('/Tablet/', $userAgent)) {
                $device = 'Tablet Device';
            }
            
            // Detectar browser
            $browser = 'Other';
            if (preg_match('/Chrome/', $userAgent)) {
                $browser = 'Chrome';
            } elseif (preg_match('/Firefox/', $userAgent)) {
                $browser = 'Firefox';
            } elseif (preg_match('/Safari/', $userAgent)) {
                $browser = 'Safari';
            } elseif (preg_match('/Edge/', $userAgent)) {
                $browser = 'Edge';
            }
            
            $details = [
                'page' => $page,
                'device' => $device,
                'browser' => $browser,
                'timestamp' => date('Y-m-d H:i:s')
            ];
            
            $this->systemLog->log(
                'page_view',
                'Usuário acessou a página: ' . $page,
                $userId,
                'info',
                $details
            );
            
            Response::success(['message' => 'Log de acesso registrado com sucesso']);
        } catch (Exception $e) {
            Response::error('Erro ao registrar log de acesso: ' . $e->getMessage(), 500);
        }
    }
}
