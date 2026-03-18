
<?php
// src/controllers/AuthController.php

require_once __DIR__ . '/../services/LoginService.php';
require_once __DIR__ . '/../services/AuthService.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthController {
    private $loginService;
    private $authService;
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
        $this->loginService = new LoginService($db);
        $this->authService = new AuthService($db);
    }
    
    public function login() {
        try {
            error_log("=== AUTHCONTROLLER LOGIN START ===");
            error_log("AUTHCONTROLLER: Headers: " . json_encode(getallheaders()));
            error_log("AUTHCONTROLLER: Method: " . $_SERVER['REQUEST_METHOD']);
            error_log("AUTHCONTROLLER: URI: " . $_SERVER['REQUEST_URI']);
            
            // Forçar headers JSON
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            error_log("AUTHCONTROLLER RAW INPUT: " . $rawInput);
            
            if (empty($rawInput)) {
                error_log("AUTHCONTROLLER ERROR: Input vazio");
                Response::error('Dados não fornecidos', 400);
                return;
            }
            
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                error_log("AUTHCONTROLLER ERROR: JSON inválido - " . json_last_error_msg());
                Response::error('Dados inválidos', 400);
                return;
            }
            
            if (!isset($input['email']) || !isset($input['password'])) {
                error_log("AUTHCONTROLLER ERROR: Campos obrigatórios ausentes");
                Response::error('Email e senha são obrigatórios', 400);
                return;
            }
            
            error_log("AUTHCONTROLLER: Verificando se loginService existe");
            if (!$this->loginService) {
                error_log("AUTHCONTROLLER ERROR: LoginService não inicializado");
                Response::error('Erro interno: serviço não disponível', 500);
                return;
            }
            
            error_log("AUTHCONTROLLER: Chamando authenticate para email: " . $input['email']);
            $result = $this->loginService->authenticate($input['email'], $input['password']);
            
            error_log("AUTHCONTROLLER: Resultado authenticate: " . json_encode(['success' => $result['success'], 'message' => $result['message']]));
            
            if ($result['success']) {
                Response::success($result['data'], $result['message']);
            } else {
                $httpCode = 401;
                // Usar 403 para problemas de status da conta
                if (isset($result['status_code']) && in_array($result['status_code'], ['account_suspended', 'account_inactive', 'account_pending'])) {
                    $httpCode = 403;
                }
                
                http_response_code($httpCode);
                echo json_encode([
                    'success' => false,
                    'message' => $result['message'],
                    'status_code' => $result['status_code'] ?? 'auth_error'
                ]);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER LOGIN EXCEPTION: " . $e->getMessage());
            error_log("AUTHCONTROLLER STACK TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
        } catch (Error $e) {
            error_log("AUTHCONTROLLER LOGIN FATAL ERROR: " . $e->getMessage());
            error_log("AUTHCONTROLLER FATAL STACK TRACE: " . $e->getTraceAsString());
            Response::error('Erro fatal no servidor: ' . $e->getMessage(), 500);
        }
    }
    
    public function register() {
        try {
            error_log("AUTH_CONTROLLER: === PROCESSANDO REGISTRO ===");
            
            // Garantir headers JSON
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            
            $rawInput = file_get_contents('php://input');
            error_log("AUTH_CONTROLLER RAW INPUT: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                error_log("AUTH_CONTROLLER ERROR: JSON inválido no registro");
                Response::error('JSON inválido: ' . json_last_error_msg(), 400);
                return;
            }
            
            error_log("AUTH_CONTROLLER: Input decodificado: " . json_encode(array_merge($input, ['password' => '[HIDDEN]'])));
            
            // Validar campos obrigatórios
            $required = ['email', 'password', 'full_name'];
            $missing = [];
            
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty(trim($input[$field]))) {
                    $missing[] = $field;
                }
            }
            
            if (!empty($missing)) {
                error_log("AUTH_CONTROLLER ERROR: Campos obrigatórios ausentes: " . implode(', ', $missing));
                Response::error('Campos obrigatórios ausentes: ' . implode(', ', $missing), 400);
                return;
            }
            
            // Validar email
            if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
                error_log("AUTH_CONTROLLER ERROR: Email inválido");
                Response::error('Email inválido', 400);
                return;
            }
            
            // Definir aceite de termos como true se não fornecido
            if (!isset($input['aceite_termos'])) {
                $input['aceite_termos'] = true;
            }
            
            error_log("AUTH_CONTROLLER: Chamando AuthService->register");
            $result = $this->authService->register($input);
            
            if ($result['success']) {
                error_log("AUTH_CONTROLLER SUCCESS: Registro realizado com sucesso");
                Response::success($result['data'], $result['message'], 201);
            } else {
                error_log("AUTH_CONTROLLER ERROR: " . $result['message']);
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log("AUTH_CONTROLLER REGISTER EXCEPTION: " . $e->getMessage());
            error_log("AUTH_CONTROLLER STACK TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }
    
    public function getCurrentUser() {
        try {
            $headers = getallheaders();
            $token = null;
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
            
            if (!$token) {
                Response::error('Token não fornecido', 401);
                return;
            }
            
            $result = $this->authService->getCurrentUser($token);
            
            if ($result['success']) {
                Response::success($result['data'], $result['message']);
            } else {
                Response::error($result['message'], 401);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER GET_CURRENT_USER EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function logout() {
        try {
            $headers = getallheaders();
            $token = null;
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
            
            if (!$token) {
                Response::error('Token não fornecido', 401);
                return;
            }
            
            $result = $this->authService->logout($token);
            
            if ($result['success']) {
                Response::success(null, $result['message']);
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER LOGOUT EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function validateReferralCode() {
        try {
            // Garantir headers JSON SEMPRE
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            
            // Handle OPTIONS request
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                http_response_code(200);
                exit;
            }
            
            $rawInput = file_get_contents('php://input');
            error_log("VALIDATE_REFERRAL RAW INPUT: " . $rawInput);
            
            if (empty($rawInput)) {
                Response::error('Dados não fornecidos', 400);
                return;
            }
            
            $input = json_decode($rawInput, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                error_log("VALIDATE_REFERRAL JSON ERROR: " . json_last_error_msg());
                Response::error('JSON inválido fornecido: ' . json_last_error_msg(), 400);
                return;
            }
            
            if (!$input || !isset($input['code']) || trim($input['code']) === '') {
                Response::error('Código de indicação é obrigatório', 400);
                return;
            }
            
            $code = trim($input['code']);
            error_log("VALIDATE_REFERRAL: Validando código: " . $code);
            
            $result = $this->authService->validateReferralCode($code);
            
            if ($result['success']) {
                error_log("VALIDATE_REFERRAL SUCCESS: " . json_encode($result['data']));
                Response::success($result['data'], $result['message']);
            } else {
                error_log("VALIDATE_REFERRAL FAILED: " . $result['message']);
                Response::error($result['message'], 404);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER VALIDATE_REFERRAL EXCEPTION: " . $e->getMessage());
            error_log("AUTHCONTROLLER VALIDATE_REFERRAL TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
        } catch (Throwable $e) {
            error_log("AUTHCONTROLLER VALIDATE_REFERRAL FATAL: " . $e->getMessage());
            Response::error('Erro crítico do servidor', 500);
        }
    }
    
    public function validateToken() {
        try {
            $headers = getallheaders();
            $token = null;
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
            
            if (!$token) {
                Response::error('Token não fornecido', 401);
                return;
            }
            
            $result = $this->authService->validateToken($token);
            
            if ($result['success']) {
                Response::success($result['data'], $result['message']);
            } else {
                Response::error($result['message'], 401);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER VALIDATE_TOKEN EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function updateProfile() {
        try {
            $headers = getallheaders();
            $token = null;
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
            
            if (!$token) {
                Response::error('Token não fornecido', 401);
                return;
            }
            
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            
            if (!$data) {
                Response::error('Dados não fornecidos', 400);
                return;
            }
            
            $result = $this->authService->updateProfile($token, $data);
            
            if ($result['success']) {
                Response::success($result['data'], $result['message']);
            } else {
                Response::error($result['message'], $result['status_code'] ?? 400);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER UPDATE_PROFILE EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    public function changePassword() {
        try {
            error_log("AUTHCONTROLLER: === PROCESSANDO ALTERAÇÃO DE SENHA ===");
            
            // Garantir headers JSON
            header('Content-Type: application/json; charset=utf-8');
            header('Access-Control-Allow-Origin: *');
            header('Access-Control-Allow-Methods: POST, OPTIONS');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            
            // Handle OPTIONS request
            if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
                http_response_code(200);
                exit;
            }
            
            // Extrair token do header Authorization
            $headers = getallheaders();
            $token = null;
            
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
            
            if (!$token) {
                error_log("AUTHCONTROLLER: Token não fornecido");
                Response::error('Token não fornecido', 401);
                return;
            }
            
            $rawInput = file_get_contents('php://input');
            error_log("AUTHCONTROLLER CHANGE_PASSWORD RAW INPUT: " . $rawInput);
            
            if (empty($rawInput)) {
                Response::error('Dados não fornecidos', 400);
                return;
            }
            
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                error_log("AUTHCONTROLLER: JSON inválido na alteração de senha");
                Response::error('JSON inválido: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (!isset($input['current_password']) || !isset($input['new_password'])) {
                error_log("AUTHCONTROLLER: Campos obrigatórios ausentes na alteração de senha");
                Response::error('Senha atual e nova senha são obrigatórios', 400);
                return;
            }
            
            $currentPassword = trim($input['current_password']);
            $newPassword = trim($input['new_password']);
            
            if (empty($currentPassword) || empty($newPassword)) {
                Response::error('Senha atual e nova senha não podem estar vazias', 400);
                return;
            }
            
            error_log("AUTHCONTROLLER: Chamando AuthService->changePassword");
            $result = $this->authService->changePassword($token, $currentPassword, $newPassword);
            
            if ($result['success']) {
                error_log("AUTHCONTROLLER: Senha alterada com sucesso");
                Response::success(null, $result['message']);
            } else {
                error_log("AUTHCONTROLLER: Erro ao alterar senha: " . $result['message']);
                Response::error($result['message'], $result['status_code'] ?? 400);
            }
            
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER CHANGE_PASSWORD EXCEPTION: " . $e->getMessage());
            error_log("AUTHCONTROLLER CHANGE_PASSWORD TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
        }
    }

    public function forgotPassword() {
        try {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);

            if (!$input || !isset($input['email'])) {
                Response::error('Email é obrigatório', 400);
                return;
            }

            $email = trim(strtolower($input['email']));

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                Response::error('Email inválido', 400);
                return;
            }

            $result = $this->authService->forgotPassword($email);

            if ($result['success']) {
                Response::success(null, $result['message']);
            } else {
                Response::error($result['message'], $result['status_code'] ?? 400);
            }
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER FORGOT_PASSWORD EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }

    public function resetPassword() {
        try {
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);

            if (!$input || !isset($input['token']) || !isset($input['new_password'])) {
                Response::error('Token e nova senha são obrigatórios', 400);
                return;
            }

            $token = trim($input['token']);
            $newPassword = trim($input['new_password']);

            if (strlen($newPassword) < 6) {
                Response::error('A nova senha deve ter pelo menos 6 caracteres', 400);
                return;
            }

            $result = $this->authService->resetPassword($token, $newPassword);

            if ($result['success']) {
                Response::success(null, $result['message']);
            } else {
                Response::error($result['message'], $result['status_code'] ?? 400);
            }
        } catch (Exception $e) {
            error_log("AUTHCONTROLLER RESET_PASSWORD EXCEPTION: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
}
