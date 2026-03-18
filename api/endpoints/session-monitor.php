<?php
// endpoints/session-monitor.php - Monitor de sessões múltiplas

require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../src/utils/Response.php';

// Aplicar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Aplicar autenticação
try {
    $db = getConnection();
    $authMiddleware = new AuthMiddleware($db);
    
    if (!$authMiddleware->handle()) {
        exit;
    }
    
    // Obter user_id do middleware
    $userId = $authMiddleware->getUserId();
    
    if (!$userId) {
        Response::error('Usuário não autenticado', 401);
        exit;
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remover prefixo
    $path = str_replace('/session-monitor', '', $path);
    $path = str_replace('/api/session-monitor', '', $path);
    
    switch ($method) {
        case 'GET':
            if ($path === '/active' || $path === '' || $path === '/') {
                // GET /session-monitor/active - Listar sessões ativas
                getActiveSessions($db, $userId);
            } else {
                Response::error('Endpoint não encontrado', 404);
            }
            break;
            
        case 'POST':
            if ($path === '/verify') {
                // POST /session-monitor/verify - Verificar sessão atual
                verifyCurrentSession($db, $userId);
            } else {
                Response::error('Endpoint não encontrado', 404);
            }
            break;
            
        case 'DELETE':
            if (preg_match('/^\/(\d+)$/', $path, $matches)) {
                // DELETE /session-monitor/{id} - Encerrar sessão específica
                $sessionId = (int)$matches[1];
                terminateSession($db, $userId, $sessionId);
            } elseif ($path === '/others') {
                // DELETE /session-monitor/others - Encerrar outras sessões
                terminateOtherSessions($db, $userId);
            } else {
                Response::error('Endpoint não encontrado', 404);
            }
            break;
            
        default:
            Response::error('Método não permitido', 405);
            break;
    }
    
} catch (Exception $e) {
    error_log("SESSION_MONITOR ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}

function getActiveSessions($db, $userId) {
    try {
        $query = "SELECT 
                    id,
                    session_token,
                    ip_address,
                    user_agent,
                    device_info,
                    location_info,
                    last_activity,
                    created_at,
                    expires_at
                  FROM user_sessions
                  WHERE user_id = ? 
                  AND status = 'ativa' 
                  AND expires_at > NOW()
                  ORDER BY last_activity DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatar sessões
        $formattedSessions = array_map(function($session) {
            $deviceInfo = json_decode($session['device_info'], true) ?? [];
            $locationInfo = json_decode($session['location_info'], true) ?? [];
            
            return [
                'id' => (int)$session['id'],
                'session_token' => substr($session['session_token'], 0, 10) . '...', // Ocultar token completo
                'ip_address' => $session['ip_address'],
                'user_agent' => $session['user_agent'],
                'device' => $deviceInfo['device'] ?? 'Desconhecido',
                'browser' => $deviceInfo['browser'] ?? 'Desconhecido',
                'os' => $deviceInfo['os'] ?? 'Desconhecido',
                'location' => $locationInfo['city'] ?? 'Desconhecido',
                'country' => $locationInfo['country'] ?? 'BR',
                'last_activity' => $session['last_activity'],
                'created_at' => $session['created_at'],
                'expires_at' => $session['expires_at']
            ];
        }, $sessions);
        
        Response::success([
            'sessions' => $formattedSessions,
            'total' => count($formattedSessions)
        ], 'Sessões ativas carregadas');
        
    } catch (Exception $e) {
        error_log("GET_ACTIVE_SESSIONS ERROR: " . $e->getMessage());
        Response::error('Erro ao buscar sessões', 500);
    }
}

function verifyCurrentSession($db, $userId) {
    try {
        // Obter token da requisição atual
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);
        
        if (!$token) {
            Response::error('Token não fornecido', 400);
            return;
        }
        
        // Verificar se a sessão ainda é válida
        $query = "SELECT COUNT(*) as count
                  FROM user_sessions
                  WHERE user_id = ? 
                  AND session_token = ?
                  AND status = 'ativa' 
                  AND expires_at > NOW()";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId, $token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $isValid = $result['count'] > 0;
        
        // Verificar se há novas sessões
        $countQuery = "SELECT COUNT(*) as total_sessions
                       FROM user_sessions
                       WHERE user_id = ? 
                       AND status = 'ativa' 
                       AND expires_at > NOW()";
        
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute([$userId]);
        $countResult = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'valid' => $isValid,
            'total_sessions' => (int)$countResult['total_sessions'],
            'has_multiple_sessions' => $countResult['total_sessions'] > 1
        ], 'Verificação de sessão concluída');
        
    } catch (Exception $e) {
        error_log("VERIFY_CURRENT_SESSION ERROR: " . $e->getMessage());
        Response::error('Erro ao verificar sessão', 500);
    }
}

function terminateSession($db, $userId, $sessionId) {
    try {
        // Verificar se a sessão pertence ao usuário
        $checkQuery = "SELECT id FROM user_sessions WHERE id = ? AND user_id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$sessionId, $userId]);
        
        if (!$checkStmt->fetch()) {
            Response::error('Sessão não encontrada ou não autorizada', 404);
            return;
        }
        
        // Revogar sessão
        $query = "UPDATE user_sessions 
                  SET status = 'revogada', updated_at = NOW() 
                  WHERE id = ? AND user_id = ?";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([$sessionId, $userId]);
        
        if ($result) {
            Response::success(['session_id' => $sessionId], 'Sessão encerrada com sucesso');
        } else {
            Response::error('Erro ao encerrar sessão', 500);
        }
        
    } catch (Exception $e) {
        error_log("TERMINATE_SESSION ERROR: " . $e->getMessage());
        Response::error('Erro ao encerrar sessão', 500);
    }
}

function terminateOtherSessions($db, $userId) {
    try {
        // Obter token da sessão atual
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        $currentToken = str_replace('Bearer ', '', $authHeader);
        
        // Revogar todas as outras sessões
        $query = "UPDATE user_sessions 
                  SET status = 'revogada', updated_at = NOW() 
                  WHERE user_id = ? 
                  AND session_token != ? 
                  AND status = 'ativa'";
        
        $stmt = $db->prepare($query);
        $result = $stmt->execute([$userId, $currentToken]);
        
        if ($result) {
            $affected = $stmt->rowCount();
            Response::success([
                'terminated_sessions' => $affected
            ], "Outras sessões encerradas: {$affected}");
        } else {
            Response::error('Erro ao encerrar sessões', 500);
        }
        
    } catch (Exception $e) {
        error_log("TERMINATE_OTHER_SESSIONS ERROR: " . $e->getMessage());
        Response::error('Erro ao encerrar sessões', 500);
    }
}
