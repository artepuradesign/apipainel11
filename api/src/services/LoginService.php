
<?php
// src/services/LoginService.php

require_once __DIR__ . '/AuthenticationService.php';
require_once __DIR__ . '/UserActivationService.php';
require_once __DIR__ . '/UniqueSessionService.php';
require_once __DIR__ . '/AuditLogService.php';
require_once __DIR__ . '/UserDataService.php';
// ReferralBonusService removido - bônus agora é processado no registro

class LoginService {
    private $db;
    private $authService;
    private $activationService;
    private $uniqueSessionService;
    private $auditService;
    private $userDataService;
    // Removido: $referralBonusService
    
    public function __construct($db) {
        $this->db = $db;
        $this->authService = new AuthenticationService($db);
        $this->activationService = new UserActivationService($db);
        $this->uniqueSessionService = new UniqueSessionService($db);
        $this->auditService = new AuditLogService($db);
        $this->userDataService = new UserDataService();
        // Removido: $this->referralBonusService = new ReferralBonusService($db);
    }
    
    public function authenticate($email, $password) {
        try {
            error_log("LOGIN_SERVICE: Iniciando autenticação para email: " . $email);
            
            // Buscar usuário por email
            $user = $this->authService->findUserByEmail($email);
            
            if (!$user) {
                error_log("LOGIN_SERVICE: Usuário não encontrado para email: " . $email);
                return ['success' => false, 'message' => 'Email ou senha incorretos'];
            }
            
            error_log("LOGIN_SERVICE: Usuário encontrado - ID: " . $user['id'] . ", Email: " . $user['email']);
            
            // Verificar senha usando password_hash
            if (!$this->authService->verifyPassword($password, $user['password_hash'])) {
                error_log("LOGIN_SERVICE: Senha incorreta para usuário: " . $user['id']);
                $this->auditService->logFailedLogin($user['id'], 'wrong_password');
                return ['success' => false, 'message' => 'Email ou senha incorretos'];
            }
            
            error_log("LOGIN_SERVICE: Senha verificada com sucesso");
            
            // Verificar status da conta e retornar mensagem específica
            $userStatus = $user['status'] ?? 'ativo';
            
            if ($userStatus === 'suspenso') {
                error_log("LOGIN_SERVICE: Conta suspensa - ID: " . $user['id']);
                return [
                    'success' => false, 
                    'message' => 'Sua conta foi suspensa por tempo indeterminado. Entre em contato com o suporte para mais informações.',
                    'status_code' => 'account_suspended'
                ];
            }
            
            if ($userStatus === 'inativo') {
                error_log("LOGIN_SERVICE: Conta inativa - ID: " . $user['id']);
                return [
                    'success' => false, 
                    'message' => 'Sua conta está inativa. Entre em contato com o suporte para reativação.',
                    'status_code' => 'account_inactive'
                ];
            }
            
            if ($userStatus === 'pendente') {
                error_log("LOGIN_SERVICE: Conta pendente - ID: " . $user['id']);
                return [
                    'success' => false, 
                    'message' => 'Sua conta está pendente de aprovação. Aguarde a liberação pelo administrador.',
                    'status_code' => 'account_pending'
                ];
            }
            
            // Verificar se conta está ativa
            if ($userStatus !== 'ativo') {
                error_log("LOGIN_SERVICE: Conta não ativa - Status: " . $userStatus);
                return ['success' => false, 'message' => 'Conta não está ativa. Status: ' . $userStatus];
            }
            
            // Criar sessão única (invalida sessões anteriores)
            $userSession = $this->uniqueSessionService->createUniqueSession(
                $user['id'],
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            );
            
            if (!$userSession) {
                error_log("LOGIN_SERVICE: Falha ao criar sessão única");
                return ['success' => false, 'message' => 'Erro ao criar sessão'];
            }
            
            error_log("LOGIN_SERVICE: Sessão única criada com sucesso - Token: " . substr($userSession->session_token, 0, 10) . "...");
            
            // Atualizar device_info e location_info da sessão
            $this->updateSessionInfo($userSession->id);
            // Não precisamos mais processar no primeiro login
            
            // Atualizar último login
            $this->authService->updateLastLogin($user['id']);
            
            // Log de sucesso
            $this->auditService->logSuccessfulLogin($user['id']);
            
            // Preparar dados de resposta
            $userData = $this->userDataService->prepareUserData($user);
            
            error_log("LOGIN_SERVICE SUCCESS: Login realizado com sucesso para usuário ID: " . $user['id']);
            
            return [
                'success' => true,
                'data' => [
                    'user' => $userData,
                    'token' => $userSession->session_token,
                    'session_token' => $userSession->session_token,
                    'expires_in' => 21600, // 6 horas
                    'session_id' => $userSession->id
                ],
                'message' => 'Login realizado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("LOGIN_SERVICE ERROR: " . $e->getMessage());
            error_log("LOGIN_SERVICE ERROR TRACE: " . $e->getTraceAsString());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
    
    private function isFirstLogin($userId) {
        try {
            // Verificar se já existe algum login registrado nas sessões
            $query = "SELECT COUNT(*) as login_count FROM user_sessions WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Se não existir nenhuma sessão anterior, é o primeiro login
            return (int)$result['login_count'] === 0;
            
        } catch (Exception $e) {
            error_log("Error checking first login: " . $e->getMessage());
            // Em caso de erro, assumir que não é primeiro login para evitar duplicatas
            return false;
        }
    }
    
    private function updateSessionInfo($sessionId) {
        try {
            // Extrair informações do user agent
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            // Detectar navegador
            $browser = 'Desconhecido';
            if (preg_match('/Firefox\/([\d.]+)/', $userAgent, $matches)) {
                $browser = 'Firefox';
            } elseif (preg_match('/Chrome\/([\d.]+)/', $userAgent, $matches)) {
                $browser = 'Chrome';
            } elseif (preg_match('/Safari\/([\d.]+)/', $userAgent, $matches) && !preg_match('/Chrome/', $userAgent)) {
                $browser = 'Safari';
            } elseif (preg_match('/Edge\/([\d.]+)/', $userAgent, $matches)) {
                $browser = 'Edge';
            } elseif (preg_match('/MSIE|Trident/', $userAgent)) {
                $browser = 'Internet Explorer';
            }
            
            // Detectar sistema operacional
            $os = 'Desconhecido';
            if (preg_match('/Windows NT 10/', $userAgent)) {
                $os = 'Windows 10';
            } elseif (preg_match('/Windows NT 11/', $userAgent)) {
                $os = 'Windows 11';
            } elseif (preg_match('/Windows/', $userAgent)) {
                $os = 'Windows';
            } elseif (preg_match('/Macintosh|Mac OS X/', $userAgent)) {
                $os = 'macOS';
            } elseif (preg_match('/Linux/', $userAgent)) {
                $os = 'Linux';
            } elseif (preg_match('/Android/', $userAgent)) {
                $os = 'Android';
            } elseif (preg_match('/iPhone|iPad|iPod/', $userAgent)) {
                $os = 'iOS';
            }
            
            // Detectar tipo de dispositivo
            $device = 'Desktop';
            if (preg_match('/Mobile|Android|iPhone|iPad|iPod/', $userAgent)) {
                $device = 'Mobile';
            } elseif (preg_match('/Tablet/', $userAgent)) {
                $device = 'Tablet';
            }
            
            // Preparar device_info JSON
            $deviceInfo = json_encode([
                'browser' => $browser,
                'os' => $os,
                'device' => $device,
                'user_agent' => $userAgent
            ]);
            
            // Obter informações de localização baseada no IP
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $locationInfo = json_encode([
                'ip' => $ipAddress,
                'city' => 'Desconhecido',
                'country' => 'BR'
            ]);
            
            // Atualizar sessão com informações
            $query = "UPDATE user_sessions 
                     SET device_info = ?, location_info = ?, updated_at = NOW() 
                     WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$deviceInfo, $locationInfo, $sessionId]);
            
            error_log("LOGIN_SERVICE: Informações de sessão atualizadas - Browser: $browser, OS: $os, Device: $device");
            
        } catch (Exception $e) {
            error_log("LOGIN_SERVICE UPDATE_SESSION_INFO ERROR: " . $e->getMessage());
            // Não bloquear o login se falhar ao atualizar informações da sessão
        }
    }
}
