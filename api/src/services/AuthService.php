<?php
// src/services/AuthService.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../models/UserSession.php';
require_once __DIR__ . '/UserDataService.php';
require_once __DIR__ . '/AuthenticationService.php';
require_once __DIR__ . '/RegistrationService.php';
require_once __DIR__ . '/../utils/UserValidation.php';
require_once __DIR__ . '/EmailService.php';

class AuthService {
    private $db;
    private $userDataService;
    private $authenticationService;
    private $registrationService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->userDataService = new UserDataService();
        $this->authenticationService = new AuthenticationService($db);
        $this->registrationService = new RegistrationService($db);
    }
    
    public function validateToken($token) {
        try {
            error_log("AUTH_SERVICE: Validating token: " . substr($token, 0, 10) . '...');
            
            // Usar UserSession para validar o token
            $userSession = new UserSession($this->db);
            
            if (!$userSession->validateSession($token)) {
                error_log("AUTH_SERVICE: Token inválido ou expirado");
                return [
                    'success' => false,
                    'message' => 'Token inválido ou expirado'
                ];
            }
            
            // Buscar dados do usuário
            $query = "SELECT * FROM users WHERE id = ? AND status IN ('ativo', 'pendente')";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userSession->user_id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                error_log("AUTH_SERVICE: Usuário não encontrado para ID: " . $userSession->user_id);
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ];
            }
            
            // Preparar dados do usuário
            $userData = $this->userDataService->prepareUserData($user);
            
            error_log("AUTH_SERVICE: Token validado com sucesso para usuário: " . $user['email']);
            
            return [
                'success' => true,
                'data' => [
                    'user' => $userData,
                    'session_valid' => true
                ],
                'message' => 'Token válido'
            ];
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE VALIDATE_TOKEN ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao validar token'
            ];
        }
    }
    
    public function getCurrentUser($token) {
        try {
            error_log("AUTH_SERVICE: Getting current user for token: " . substr($token, 0, 10) . '...');
            
            // Validar token primeiro
            $tokenValidation = $this->validateToken($token);
            
            if (!$tokenValidation['success']) {
                return $tokenValidation;
            }
            
            $userId = $tokenValidation['data']['user']['id'];
            
            // Buscar dados completos do usuário incluindo assinatura ativa
            $userWithSubscription = $this->getUserWithActiveSubscription($userId);
            
            return [
                'success' => true,
                'data' => [
                    'user' => $userWithSubscription,
                    'session_valid' => true
                ],
                'message' => 'Usuário atual obtido com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE GET_CURRENT_USER ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao obter usuário atual'
            ];
        }
    }
    
    private function getUserWithActiveSubscription($userId) {
        try {
            // Buscar dados básicos do usuário
            $userQuery = "SELECT * FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                throw new Exception("Usuário não encontrado");
            }
            
            // Preparar dados básicos do usuário
            $userData = $this->userDataService->prepareUserData($user);
            
            // Buscar assinatura ativa
            $subscriptionQuery = "
                SELECT us.*, p.name as plan_name, p.price 
                FROM user_subscriptions us 
                LEFT JOIN plans p ON us.plan_id = p.id 
                WHERE us.user_id = ? 
                AND us.status = 'active' 
                AND us.end_date >= CURDATE() 
                ORDER BY us.created_at DESC 
                LIMIT 1
            ";
            $subscriptionStmt = $this->db->prepare($subscriptionQuery);
            $subscriptionStmt->execute([$userId]);
            $subscription = $subscriptionStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($subscription) {
                // Incluir dados da assinatura ativa no usuário
                $userData['subscription_start_date'] = $subscription['start_date'];
                $userData['subscription_end_date'] = $subscription['end_date'];
                $userData['subscription_status'] = $subscription['status'];
                $userData['subscription_auto_renew'] = (bool)$subscription['auto_renew'];
                $userData['subscription_amount_paid'] = floatval($subscription['amount_paid']);
                $userData['subscription_plan_name'] = $subscription['plan_name'];
                
                // Atualizar dados do plano se a assinatura estiver ativa
                if ($subscription['plan_name']) {
                    $userData['tipoplano'] = $subscription['plan_name'];
                }
                
                // Sincronizar datas do plano (priorizar dados da assinatura)
                $userData['data_inicio'] = $subscription['start_date'];
                $userData['data_fim'] = $subscription['end_date'];
                
                error_log("AUTH_SERVICE: Assinatura ativa encontrada para usuário $userId: " . $subscription['plan_name']);
            } else {
                // Usuário sem assinatura ativa
                $userData['subscription_start_date'] = null;
                $userData['subscription_end_date'] = null;
                $userData['subscription_status'] = null;
                $userData['subscription_auto_renew'] = false;
                $userData['subscription_amount_paid'] = 0.00;
                $userData['subscription_plan_name'] = null;
                
                error_log("AUTH_SERVICE: Nenhuma assinatura ativa para usuário $userId");
            }
            
            return $userData;
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE GET_USER_WITH_SUBSCRIPTION ERROR: " . $e->getMessage());
            // Em caso de erro, retornar dados básicos do usuário
            return $this->userDataService->prepareUserData($user ?? []);
        }
    }
    
    public function logout($token) {
        try {
            error_log("AUTH_SERVICE: Logging out token: " . substr($token, 0, 10) . '...');
            
            $userSession = new UserSession($this->db);
            
            // Primeiro, obter o user_id da sessão antes de revogá-la
            if (!$userSession->validateSession($token)) {
                error_log("AUTH_SERVICE: Sessão já inválida ou expirada");
                return [
                    'success' => true,
                    'message' => 'Logout realizado com sucesso'
                ];
            }
            
            $userId = $userSession->user_id;
            error_log("AUTH_SERVICE: Invalidando todas as sessões do user_id: " . $userId);
            
            // Revogar a sessão atual
            if ($userSession->revokeSession($token)) {
                // Invalidar todas as outras sessões ativas do usuário
                $pool = ConnectionPool::getInstance();
                $sessionsInvalidated = $pool->invalidateUserSessions($userId);
                
                error_log("AUTH_SERVICE: Logout realizado com sucesso. {$sessionsInvalidated} sessões invalidadas.");
                return [
                    'success' => true,
                    'message' => 'Logout realizado com sucesso'
                ];
            } else {
                error_log("AUTH_SERVICE: Falha ao revogar sessão");
                return [
                    'success' => false,
                    'message' => 'Falha ao realizar logout'
                ];
            }
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE LOGOUT ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao realizar logout'
            ];
        }
    }
    
    public function register($data) {
        try {
            error_log("AUTH_SERVICE: Delegando registro para RegistrationService");
            return $this->registrationService->register($data);
        } catch (Exception $e) {
            error_log("AUTH_SERVICE REGISTER ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno no registro: ' . $e->getMessage()
            ];
        }
    }
    
    public function validateReferralCode($code) {
        try {
            error_log("AUTH_SERVICE: Validating referral code: " . $code);
            
            if (empty(trim($code))) {
                error_log("AUTH_SERVICE: Código vazio fornecido");
                return [
                    'success' => false,
                    'message' => 'Código de indicação não pode estar vazio'
                ];
            }
            
            $trimmedCode = trim($code);
            
            $query = "SELECT id, full_name, email, codigo_indicacao FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$trimmedCode]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                error_log("AUTH_SERVICE: Código válido encontrado - User ID: " . $user['id'] . ", Nome: " . $user['full_name']);
                return [
                    'success' => true,
                    'data' => [
                        'referrer_id' => intval($user['id']),
                        'referrer_name' => $user['full_name'],
                        'referrer_email' => $user['email'],
                        'referralCode' => $user['codigo_indicacao']
                    ],
                    'message' => 'Código de indicação válido'
                ];
            } else {
                error_log("AUTH_SERVICE: Código não encontrado na base de dados: " . $trimmedCode);
                return [
                    'success' => false,
                    'message' => 'Código de indicação não encontrado'
                ];
            }
            
        } catch (Exception $e) {
            error_log("AUTH_SERVICE VALIDATE_REFERRAL ERROR: " . $e->getMessage());
            error_log("AUTH_SERVICE VALIDATE_REFERRAL TRACE: " . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => 'Erro interno ao validar código de indicação: ' . $e->getMessage()
            ];
        } catch (Throwable $e) {
            error_log("AUTH_SERVICE VALIDATE_REFERRAL FATAL: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro crítico ao validar código de indicação'
            ];
        }
    }
    
    public function changePassword($token, $currentPassword, $newPassword) {
        try {
            error_log("AUTH_SERVICE: Changing password for token: " . substr($token, 0, 10) . '...');
            
            // Validar token primeiro
            $tokenValidation = $this->validateToken($token);
            
            if (!$tokenValidation['success']) {
                return [
                    'success' => false,
                    'message' => 'Token inválido ou expirado',
                    'status_code' => 401
                ];
            }
            
            $userId = $tokenValidation['data']['user']['id'];
            error_log("AUTH_SERVICE: Alterando senha para usuário ID: " . $userId);
            
            // Buscar usuário atual para validar senha atual
            $userQuery = "SELECT password_hash, senhaalfa FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado',
                    'status_code' => 404
                ];
            }
            
            // Verificar senha atual usando o AuthenticationService
            $authService = new AuthenticationService($this->db);
            $passwordValid = $authService->verifyPassword($currentPassword, $user['senhaalfa']);
            
            if (!$passwordValid) {
                error_log("AUTH_SERVICE: Senha atual incorreta para usuário ID: " . $userId);
                return [
                    'success' => false,
                    'message' => 'Senha atual incorreta',
                    'status_code' => 401
                ];
            }
            
            // Validar nova senha
            if (strlen($newPassword) < 6) {
                return [
                    'success' => false,
                    'message' => 'A nova senha deve ter pelo menos 6 caracteres',
                    'status_code' => 400
                ];
            }
            
            $this->db->beginTransaction();
            
            // Atualizar senha (mantendo consistência com formato do registro)
            // password_hash = MD5 para compatibilidade com o sistema existente
            // senhaalfa = texto plano para compatibilidade
            $md5Hash = md5($newPassword);
            $updateQuery = "UPDATE users SET password_hash = ?, senhaalfa = ?, updated_at = NOW() WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            
            if (!$updateStmt->execute([$md5Hash, $newPassword, $userId])) {
                $this->db->rollback();
                error_log("AUTH_SERVICE: Erro ao executar UPDATE password query");
                return [
                    'success' => false,
                    'message' => 'Erro ao atualizar senha no banco de dados',
                    'status_code' => 500
                ];
            }
            
            // INVALIDAR TODAS AS SESSÕES DO USUÁRIO para forçar novo login
            $invalidateSessionsQuery = "UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE user_id = ? AND status = 'active'";
            $invalidateStmt = $this->db->prepare($invalidateSessionsQuery);
            
            if (!$invalidateStmt->execute([$userId])) {
                $this->db->rollback();
                error_log("AUTH_SERVICE: Erro ao invalidar sessões do usuário");
                return [
                    'success' => false,
                    'message' => 'Erro ao invalidar sessões ativas',
                    'status_code' => 500
                ];
            }
            
            $sessionsInvalidated = $invalidateStmt->rowCount();
            error_log("AUTH_SERVICE: {$sessionsInvalidated} sessões invalidadas para usuário {$userId}");
            
            $this->db->commit();
            
            error_log("AUTH_SERVICE: Senha alterada com sucesso para usuário: " . $userId);
            
            return [
                'success' => true,
                'message' => 'Senha alterada com sucesso. Faça login novamente.',
                'force_logout' => true
            ];
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            
            error_log("AUTH_SERVICE CHANGE_PASSWORD ERROR: " . $e->getMessage());
            error_log("AUTH_SERVICE CHANGE_PASSWORD TRACE: " . $e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => 'Erro interno ao alterar senha: ' . $e->getMessage(),
                'status_code' => 500
            ];
        }
    }

    public function forgotPassword($email) {
        try {
            $query = "SELECT id, email, status FROM users WHERE email = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // Retorna mensagem genérica para evitar enumeração de usuários
            if (!$user || !in_array($user['status'], ['ativo', 'pendente'])) {
                return [
                    'success' => true,
                    'message' => 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.'
                ];
            }

            $token = bin2hex(random_bytes(32));
            $tokenHash = hash('sha256', $token);

            $updateQuery = "UPDATE users SET password_reset_token = ?, password_reset_expires = DATE_ADD(NOW(), INTERVAL 30 MINUTE), updated_at = NOW() WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updated = $updateStmt->execute([$tokenHash, $user['id']]);

            if (!$updated) {
                return [
                    'success' => false,
                    'message' => 'Não foi possível processar a recuperação de senha',
                    'status_code' => 500,
                ];
            }

            $emailService = new EmailService();
            $emailService->sendPasswordResetEmail($email, $token);

            return [
                'success' => true,
                'message' => 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.'
            ];
        } catch (Exception $e) {
            error_log("AUTH_SERVICE FORGOT_PASSWORD ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao solicitar recuperação de senha',
                'status_code' => 500,
            ];
        }
    }

    public function resetPassword($token, $newPassword) {
        try {
            if (strlen($newPassword) < 6) {
                return [
                    'success' => false,
                    'message' => 'A nova senha deve ter pelo menos 6 caracteres',
                    'status_code' => 400,
                ];
            }

            $tokenHash = hash('sha256', $token);

            $userQuery = "SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW() LIMIT 1";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$tokenHash]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            if (!$user) {
                return [
                    'success' => false,
                    'message' => 'Token inválido ou expirado',
                    'status_code' => 400,
                ];
            }

            $this->db->beginTransaction();

            $md5Hash = md5($newPassword);
            $updateQuery = "UPDATE users SET password_hash = ?, senhaalfa = ?, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW() WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateOk = $updateStmt->execute([$md5Hash, $newPassword, $user['id']]);

            if (!$updateOk) {
                $this->db->rollback();
                return [
                    'success' => false,
                    'message' => 'Não foi possível atualizar a senha',
                    'status_code' => 500,
                ];
            }

            $invalidateQuery = "UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE user_id = ? AND status = 'active'";
            $invalidateStmt = $this->db->prepare($invalidateQuery);
            $invalidateStmt->execute([$user['id']]);

            $this->db->commit();

            return [
                'success' => true,
                'message' => 'Senha redefinida com sucesso. Faça login novamente.'
            ];
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }

            error_log("AUTH_SERVICE RESET_PASSWORD ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao redefinir senha',
                'status_code' => 500,
            ];
        }
    }
    
    public function updateProfile($token, $data) {
        try {
            error_log("AUTH_SERVICE: Updating profile for token: " . substr($token, 0, 10) . '...');
            
            // Validar token primeiro
            $tokenValidation = $this->validateToken($token);
            
            if (!$tokenValidation['success']) {
                return [
                    'success' => false,
                    'message' => 'Token inválido ou expirado',
                    'status_code' => 401
                ];
            }
            
            $userId = $tokenValidation['data']['user']['id'];
            error_log("AUTH_SERVICE: Atualizando perfil para usuário ID: " . $userId);
            
            // Campos permitidos para atualização
            $allowedFields = [
                'full_name', 'cpf', 'cnpj', 'data_nascimento', 'telefone', 
                'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'tipo_pessoa'
            ];
            
            $updateFields = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "{$field} = ?";
                    
                    // Conversão especial para data de nascimento
                    if ($field === 'data_nascimento') {
                        $convertedDate = UserValidation::convertBrazilianDateToISO($data[$field]);
                        if ($convertedDate === null && !empty($data[$field])) {
                            return [
                                'success' => false,
                                'message' => "Formato de data inválido para data_nascimento: {$data[$field]}. Use DD/MM/YYYY",
                                'status_code' => 400
                            ];
                        }
                        $params[] = $convertedDate;
                    } else {
                        $params[] = $data[$field];
                    }
                }
            }
            
            if (empty($updateFields)) {
                return [
                    'success' => false,
                    'message' => 'Nenhum campo válido fornecido para atualização',
                    'status_code' => 400
                ];
            }
            
            $this->db->beginTransaction();
            
            // Atualizar na tabela users
            $params[] = $userId;
            $query = "UPDATE users SET " . implode(', ', $updateFields) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            
            if (!$stmt->execute($params)) {
                $this->db->rollback();
                error_log("AUTH_SERVICE: Erro ao executar UPDATE query");
                return [
                    'success' => false,
                    'message' => 'Erro ao atualizar perfil no banco de dados',
                    'status_code' => 500
                ];
            }
            
            $this->db->commit();
            
            error_log("AUTH_SERVICE: Perfil atualizado com sucesso para usuário: " . $userId);
            
            // Buscar dados atualizados
            $updatedUserQuery = "SELECT * FROM users WHERE id = ?";
            $updatedStmt = $this->db->prepare($updatedUserQuery);
            $updatedStmt->execute([$userId]);
            $updatedUser = $updatedStmt->fetch(PDO::FETCH_ASSOC);
            
            $userData = $this->userDataService->prepareUserData($updatedUser);
            
            return [
                'success' => true,
                'data' => [
                    'user' => $userData
                ],
                'message' => 'Perfil atualizado com sucesso'
            ];
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            
            error_log("AUTH_SERVICE UPDATE_PROFILE ERROR: " . $e->getMessage());
            error_log("AUTH_SERVICE UPDATE_PROFILE TRACE: " . $e->getTraceAsString());
            
            return [
                'success' => false,
                'message' => 'Erro interno ao atualizar perfil: ' . $e->getMessage(),
                'status_code' => 500
            ];
        }
    }
}