<?php
// src/controllers/UserAuditController.php - Controller para logs de auditoria

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UserAuditController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Obter logs de acesso do usuário autenticado
     */
    public function getUserAccessLogs() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            // Buscar parâmetros da query
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            
            // Query para buscar logs de auditoria do usuário
            $query = "SELECT 
                        id,
                        action,
                        category,
                        description,
                        ip_address,
                        user_agent,
                        created_at
                     FROM user_audit 
                     WHERE user_id = ?";
            
            $params = [$userId];
            
            // Filtrar por categoria se especificada
            if ($category) {
                $query .= " AND category = ?";
                $params[] = $category;
            }
            
            $query .= " ORDER BY created_at DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatar dados para o frontend
            $formattedLogs = array_map(function($log) {
                return [
                    'id' => $log['id'],
                    'action' => $log['action'],
                    'category' => $log['category'],
                    'description' => $log['description'],
                    'ip' => $log['ip_address'] ?: 'N/A',
                    'user_agent' => $log['user_agent'] ?: 'N/A',
                    'timestamp' => $log['created_at'],
                    'device' => $this->extractDeviceInfo($log['user_agent']),
                    'browser' => $this->extractBrowserInfo($log['user_agent']),
                    'page' => $this->extractPageFromAction($log['action'], $log['description'])
                ];
            }, $logs);
            
            Response::success($formattedLogs, 'Logs de acesso obtidos com sucesso');
            
        } catch (Exception $e) {
            error_log("USER_AUDIT_CONTROLLER ERROR (getUserAccessLogs): " . $e->getMessage());
            Response::error('Erro ao obter logs de acesso: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Registrar novo log de auditoria
     */
    public function createAuditLog() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['action']) || !isset($input['description'])) {
                Response::error('Ação e descrição são obrigatórias', 400);
                return;
            }
            
            // Obter informações da requisição
            $ipAddress = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            
            $query = "INSERT INTO user_audit 
                     (user_id, action, category, description, old_values, new_values, ip_address, user_agent, session_id) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $userId,
                $input['action'],
                $input['category'] ?? 'general',
                $input['description'],
                isset($input['old_values']) ? json_encode($input['old_values']) : null,
                isset($input['new_values']) ? json_encode($input['new_values']) : null,
                $ipAddress,
                $userAgent,
                $input['session_id'] ?? null
            ]);
            
            if ($result) {
                Response::success(['id' => $this->db->lastInsertId()], 'Log de auditoria criado com sucesso');
            } else {
                Response::error('Erro ao criar log de auditoria', 500);
            }
            
        } catch (Exception $e) {
            error_log("USER_AUDIT_CONTROLLER ERROR (createAuditLog): " . $e->getMessage());
            Response::error('Erro ao criar log de auditoria: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obter estatísticas de auditoria do usuário
     */
    public function getUserAuditStats() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            // Estatísticas básicas
            $statsQuery = "SELECT 
                            category,
                            COUNT(*) as count,
                            MAX(created_at) as last_activity
                          FROM user_audit 
                          WHERE user_id = ? 
                          GROUP BY category 
                          ORDER BY count DESC";
            
            $stmt = $this->db->prepare($statsQuery);
            $stmt->execute([$userId]);
            $categoryStats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Total de logs
            $totalQuery = "SELECT COUNT(*) as total FROM user_audit WHERE user_id = ?";
            $totalStmt = $this->db->prepare($totalQuery);
            $totalStmt->execute([$userId]);
            $total = $totalStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Último acesso
            $lastAccessQuery = "SELECT created_at FROM user_audit WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
            $lastStmt = $this->db->prepare($lastAccessQuery);
            $lastStmt->execute([$userId]);
            $lastAccess = $lastStmt->fetch(PDO::FETCH_ASSOC);
            
            $stats = [
                'total_logs' => (int)$total,
                'last_access' => $lastAccess ? $lastAccess['created_at'] : null,
                'categories' => $categoryStats
            ];
            
            Response::success($stats, 'Estatísticas de auditoria obtidas com sucesso');
            
        } catch (Exception $e) {
            error_log("USER_AUDIT_CONTROLLER ERROR (getUserAuditStats): " . $e->getMessage());
            Response::error('Erro ao obter estatísticas: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Extrair informações do dispositivo do user agent
     */
    private function extractDeviceInfo($userAgent) {
        if (!$userAgent) return 'Dispositivo Desconhecido';
        
        // Detecção básica de dispositivo
        if (strpos($userAgent, 'Mobile') !== false || strpos($userAgent, 'Android') !== false) {
            return 'Celular';
        } elseif (strpos($userAgent, 'iPad') !== false || strpos($userAgent, 'Tablet') !== false) {
            return 'Tablet';
        } else {
            return 'Computador';
        }
    }
    
    /**
     * Extrair informações do navegador do user agent
     */
    private function extractBrowserInfo($userAgent) {
        if (!$userAgent) return 'Navegador Desconhecido';
        
        // Detecção básica de navegador
        if (strpos($userAgent, 'Chrome') !== false) {
            return 'Chrome';
        } elseif (strpos($userAgent, 'Firefox') !== false) {
            return 'Firefox';
        } elseif (strpos($userAgent, 'Safari') !== false) {
            return 'Safari';
        } elseif (strpos($userAgent, 'Edge') !== false) {
            return 'Edge';
        } else {
            return 'Outro';
        }
    }
    
    /**
     * Extrair página da ação e descrição
     */
    private function extractPageFromAction($action, $description) {
        // Mapeamento básico de ações para páginas
        $actionPageMap = [
            'login_success' => '/login',
            'logout' => '/dashboard',
            'profile_update' => '/dashboard/minha-conta',
            'wallet_recharge' => '/dashboard/carteira',
            'plan_purchase' => '/dashboard/planos',
            'consultation_cpf' => '/dashboard/consultar-cpf',
            'consultation_cnpj' => '/dashboard/consultar-cnpj',
            'consultation_vehicle' => '/dashboard/consultar-veiculo',
            'dashboard_access' => '/dashboard'
        ];
        
        // Se existe mapeamento direto
        if (isset($actionPageMap[$action])) {
            return $actionPageMap[$action];
        }
        
        // Tentar extrair da descrição
        if (strpos($description, 'dashboard') !== false) {
            return '/dashboard';
        }
        
        return '/dashboard';
    }
}