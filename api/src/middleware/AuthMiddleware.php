
<?php
// src/middleware/AuthMiddleware.php

require_once __DIR__ . '/../models/UserSession.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    private $db;
    private static $currentUserId = null;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function handle() {
        try {
            // Log detalhado de debug
            error_log("AUTH_MIDDLEWARE: Iniciando validação - URL: " . $_SERVER['REQUEST_URI']);
            error_log("AUTH_MIDDLEWARE: Método: " . $_SERVER['REQUEST_METHOD']);
            
            // Obter token do header Authorization
            $headers = getallheaders();
            error_log("AUTH_MIDDLEWARE: Headers recebidos: " . json_encode($headers));
            
            // Tentar diferentes variações do header Authorization
            $authHeader = $headers['Authorization'] ?? 
                         $headers['authorization'] ?? 
                         $headers['AUTHORIZATION'] ?? 
                         $_SERVER['HTTP_AUTHORIZATION'] ?? '';
            
            error_log("AUTH_MIDDLEWARE: Authorization header completo: " . $authHeader);
            
            if (empty($authHeader)) {
                error_log("AUTH_MIDDLEWARE: Token de autorização não fornecido");
                error_log("AUTH_MIDDLEWARE: Headers disponíveis: " . implode(', ', array_keys($headers)));
                error_log("AUTH_MIDDLEWARE: $_SERVER vars relacionados: " . json_encode([
                    'HTTP_AUTHORIZATION' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'não existe',
                    'AUTHORIZATION' => $_SERVER['AUTHORIZATION'] ?? 'não existe'
                ]));
                Response::error('Token de autorização não fornecido', 401);
                return false;
            }
            
            // Extrair token (formato: Bearer TOKEN)
            if (strpos($authHeader, 'Bearer ') === 0) {
                $token = substr($authHeader, 7);
            } else {
                $token = $authHeader;
            }
            
            error_log("AUTH_MIDDLEWARE: Token extraído: " . substr($token, 0, 15) . '...');
            
            if (empty($token)) {
                error_log("AUTH_MIDDLEWARE: Token inválido (vazio)");
                Response::error('Token inválido', 401);
                return false;
            }
            
            // Validar sessão
            $userSession = new UserSession($this->db);
            
            error_log("AUTH_MIDDLEWARE: Iniciando validação de sessão...");
            if (!$userSession->validateSession($token)) {
                error_log("AUTH_MIDDLEWARE: Sessão inválida - Token: " . substr($token, 0, 15) . '...');

                // Verificar se o token existe na tabela (para diferenciar expiração vs revogação)
                $checkQuery = "SELECT * FROM user_sessions WHERE session_token = ?";
                $checkStmt = $this->db->prepare($checkQuery);
                $checkStmt->execute([$token]);
                $tokenRow = $checkStmt->fetch(PDO::FETCH_ASSOC);

                if ($tokenRow) {
                    $status = $tokenRow['status'] ?? null;
                    $userIdFromToken = $tokenRow['user_id'] ?? null;

                    // Se a sessão foi revogada, normalmente é porque houve novo login
                    if ($status && $status !== 'ativa' && $userIdFromToken) {
                        error_log("AUTH_MIDDLEWARE: Token revogado - Status: {$status} - User: {$userIdFromToken}");

                        // Buscar a sessão ativa mais recente (novo login)
                        $newSessionQuery = "SELECT id, ip_address, user_agent, device_info, location_info, created_at, last_activity
                                           FROM user_sessions
                                           WHERE user_id = ? AND status = 'ativa' AND expires_at > NOW()
                                           ORDER BY created_at DESC
                                           LIMIT 1";
                        $newStmt = $this->db->prepare($newSessionQuery);
                        $newStmt->execute([$userIdFromToken]);
                        $newSession = $newStmt->fetch(PDO::FETCH_ASSOC);

                        $formattedNewSession = null;
                        if ($newSession) {
                            $deviceInfo = json_decode($newSession['device_info'] ?? '', true) ?? [];
                            $locationInfo = json_decode($newSession['location_info'] ?? '', true) ?? [];

                            $formattedNewSession = [
                                'id' => (int)($newSession['id'] ?? 0),
                                'ip_address' => $newSession['ip_address'] ?? null,
                                'user_agent' => $newSession['user_agent'] ?? null,
                                'device' => $deviceInfo['device'] ?? 'Desconhecido',
                                'browser' => $deviceInfo['browser'] ?? 'Desconhecido',
                                'os' => $deviceInfo['os'] ?? 'Desconhecido',
                                'location' => $locationInfo['city'] ?? 'Desconhecido',
                                'country' => $locationInfo['country'] ?? 'BR',
                                'created_at' => $newSession['created_at'] ?? null,
                                'last_activity' => $newSession['last_activity'] ?? null,
                            ];
                        }

                        Response::error('Sessão revogada por novo login', 401, [
                            'reason' => 'logged_in_elsewhere',
                            'revoked_token_prefix' => substr($token, 0, 10) . '...',
                            'revoked_at' => $tokenRow['updated_at'] ?? null,
                            'new_session' => $formattedNewSession,
                        ]);
                        return false;
                    }

                    error_log("AUTH_MIDDLEWARE: Token encontrado na base mas inválido/expirado - Expires: " . ($tokenRow['expires_at'] ?? 'N/A'));
                } else {
                    error_log("AUTH_MIDDLEWARE: Token não encontrado na base de dados");
                }

                Response::error('Sessão inválida ou expirada', 401);
                return false;
            }
            
            // Armazenar ID do usuário para uso posterior
            self::$currentUserId = $userSession->user_id;
            
            // Iniciar sessão se não estiver iniciada
            if (session_status() === PHP_SESSION_NONE) {
                session_start();
            }
            
            // Armazenar na sessão PHP também
            $_SESSION['user_id'] = $userSession->user_id;
            
            error_log("AUTH_MIDDLEWARE: Autenticação bem-sucedida para usuário: " . self::$currentUserId);
            
            return true;
            
        } catch (Exception $e) {
            error_log("AUTH_MIDDLEWARE ERROR: " . $e->getMessage());
            error_log("AUTH_MIDDLEWARE ERROR TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno de autenticação', 500);
            return false;
        }
    }
    
    public static function getCurrentUserId() {
        return self::$currentUserId;
    }
    
    public function requireRole($requiredRole) {
        if (!$this->handle()) {
            return false;
        }
        
        try {
            // Buscar usuário atual na tabela users
            $query = "SELECT user_role FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([self::$currentUserId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('Usuário não encontrado', 404);
                return false;
            }
            
            // Verificar permissão
            $userRole = $user['user_role'];
            $roleHierarchy = ['assinante' => 1, 'suporte' => 2, 'admin' => 3];
            
            $userLevel = $roleHierarchy[$userRole] ?? 0;
            $requiredLevel = $roleHierarchy[$requiredRole] ?? 999;
            
            if ($userLevel < $requiredLevel) {
                Response::error('Acesso negado - permissão insuficiente', 403);
                return false;
            }
            
            return true;
            
        } catch (Exception $e) {
            error_log("AUTH_MIDDLEWARE ROLE ERROR: " . $e->getMessage());
            Response::error('Erro ao verificar permissões', 500);
            return false;
        }
    }
    
// Método estático para compatibilidade com as rotas
public static function authenticate() {
    global $db;
    if (!isset($db)) {
        throw new Exception('Conexão com banco não disponível');
    }
    $auth = new AuthMiddleware($db);
    if ($auth->handle()) {
        return self::$currentUserId;
    }
    return false;
}

// Método estático para verificar token e retornar user_id
public static function verifyToken() {
    global $db;
    if (!isset($db)) {
        throw new Exception('Conexão com banco não disponível');
    }
    
    try {
        // Obter token do header Authorization
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? 
                     $headers['authorization'] ?? 
                     $headers['AUTHORIZATION'] ?? 
                     $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        
        if (empty($authHeader)) {
            Response::error('Token de autorização não fornecido', 401);
            return false;
        }
        
        // Extrair token (formato: Bearer TOKEN)
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
        } else {
            $token = $authHeader;
        }
        
        if (empty($token)) {
            Response::error('Token inválido', 401);
            return false;
        }
        
        // Validar sessão
        require_once __DIR__ . '/../models/UserSession.php';
        $userSession = new UserSession($db);
        
        if (!$userSession->validateSession($token)) {
            Response::error('Sessão inválida ou expirada', 401);
            return false;
        }
        
        return $userSession->user_id;
        
    } catch (Exception $e) {
        error_log("AUTH_MIDDLEWARE verifyToken ERROR: " . $e->getMessage());
        Response::error('Erro interno de autenticação', 500);
        return false;
    }
}
}
