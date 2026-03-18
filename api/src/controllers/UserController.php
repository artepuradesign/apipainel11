
<?php
// src/controllers/UserController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/UserValidation.php';

class UserController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['username', 'email', 'password', 'full_name', 'user_role'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
            }
        }
        
        try {
            $this->db->beginTransaction();
            
            // Verificar se usuário já existe
            $checkQuery = "SELECT id FROM users WHERE username = ? OR email = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$data['username'], $data['email']]);
            
            if ($checkStmt->fetch()) {
                Response::error('Usuário ou email já cadastrado', 400);
                return;
            }
            
            // Gerar código de indicação único
            $codigoIndicacao = $this->generateReferralCode($data['username']);
            
            // Criar usuário
            $userQuery = "INSERT INTO users 
                         (username, email, password_hash, full_name, user_role, status, codigo_indicacao, aceite_termos, created_at) 
                         VALUES (?, ?, ?, ?, ?, 'ativo', ?, ?, NOW())";
            
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([
                $data['username'],
                $data['email'],
                password_hash($data['password'], PASSWORD_DEFAULT),
                $data['full_name'],
                $data['user_role'],
                $codigoIndicacao,
                $data['aceite_termos'] ?? 1
            ]);
            
            $userId = $this->db->lastInsertId();
            
            // Criar perfil do usuário
            $profileQuery = "INSERT INTO user_profiles (user_id, timezone, language, theme) 
                           VALUES (?, 'America/Sao_Paulo', 'pt-BR', 'light')";
            $profileStmt = $this->db->prepare($profileQuery);
            $profileStmt->execute([$userId]);
            
            // Criar carteira principal
            $walletQuery = "INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, status) 
                          VALUES (?, 'main', 0.00, 0.00, 'active')";
            $walletStmt = $this->db->prepare($walletQuery);
            $walletStmt->execute([$userId]);
            
            // Criar configurações padrão
            $defaultSettings = [
                ['notifications_email', '1', 'boolean', 'notifications'],
                ['notifications_push', '1', 'boolean', 'notifications'],
                ['auto_logout', '30', 'number', 'security'],
                ['theme', 'light', 'string', 'appearance']
            ];
            
            $settingQuery = "INSERT INTO user_settings (user_id, setting_key, setting_value, setting_type, category) 
                           VALUES (?, ?, ?, ?, ?)";
            $settingStmt = $this->db->prepare($settingQuery);
            
            foreach ($defaultSettings as $setting) {
                $settingStmt->execute([$userId, $setting[0], $setting[1], $setting[2], $setting[3]]);
            }
            
            // Criar subscrição padrão (plano grátis)
            $subscriptionQuery = "INSERT INTO user_subscriptions 
                                (user_id, plan_id, status, start_date, end_date, auto_renew, amount_paid) 
                                VALUES (?, 1, 'active', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 0, 0.00)";
            $subscriptionStmt = $this->db->prepare($subscriptionQuery);
            $subscriptionStmt->execute([$userId]);
            
            // Log de auditoria
            $this->logUserAction($userId, 'user_registered', 'account', 'Usuário registrado no sistema', [
                'username' => $data['username'],
                'email' => $data['email'],
                'user_role' => $data['user_role']
            ]);
            
            $this->db->commit();
            
            Response::success([
                'user_id' => $userId,
                'username' => $data['username'],
                'email' => $data['email'],
                'codigo_indicacao' => $codigoIndicacao
            ], 'Usuário registrado com sucesso', 201);
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("ERRO REGISTER: " . $e->getMessage());
            Response::error('Erro ao registrar usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateProfile() {
        // Usar o ID do usuário armazenado na sessão (via auth.php)
        $userId = $_SESSION['auth_user_id'] ?? AuthMiddleware::getCurrentUserId();
        
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!$data) {
            Response::error('Dados não fornecidos', 400);
            return;
        }
        
        try {
            $this->db->beginTransaction();
            
            // Campos permitidos para atualização na tabela users
            $userFields = ['full_name', 'cpf', 'cnpj', 'data_nascimento', 'telefone', 'cep', 'endereco', 'numero', 'bairro', 'cidade', 'estado', 'tipo_pessoa'];
            $userUpdateFields = [];
            $userParams = [];
            
            foreach ($userFields as $field) {
                if (isset($data[$field])) {
                    $userUpdateFields[] = "{$field} = ?";
                    
                    // Conversão especial para data de nascimento
                    if ($field === 'data_nascimento') {
                        $convertedDate = UserValidation::convertBrazilianDateToISO($data[$field]);
                        if ($convertedDate === null && !empty($data[$field])) {
                            throw new Exception("Formato de data inválido para data_nascimento: {$data[$field]}. Use DD/MM/YYYY");
                        }
                        $userParams[] = $convertedDate;
                    } else {
                        $userParams[] = $data[$field];
                    }
                }
            }
            
            if (!empty($userUpdateFields)) {
                $userParams[] = $userId;
                $userQuery = "UPDATE users SET " . implode(', ', $userUpdateFields) . ", updated_at = NOW() WHERE id = ?";
                $userStmt = $this->db->prepare($userQuery);
                $userStmt->execute($userParams);
            }
            
            // Campos para atualização no perfil
            $profileFields = ['bio', 'company', 'website', 'timezone', 'language', 'theme'];
            $profileUpdateFields = [];
            $profileParams = [];
            
            foreach ($profileFields as $field) {
                if (isset($data[$field])) {
                    $profileUpdateFields[] = "{$field} = ?";
                    $profileParams[] = $data[$field];
                }
            }
            
            if (!empty($profileUpdateFields)) {
                $profileParams[] = $userId;
                $profileQuery = "UPDATE user_profiles SET " . implode(', ', $profileUpdateFields) . ", updated_at = NOW() WHERE user_id = ?";
                $profileStmt = $this->db->prepare($profileQuery);
                $profileStmt->execute($profileParams);
            }
            
            // Log de auditoria
            $this->logUserAction($userId, 'profile_updated', 'profile', 'Perfil atualizado', $data);
            
            $this->db->commit();
            
            Response::success(null, 'Perfil atualizado com sucesso');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("ERRO UPDATE_PROFILE: " . $e->getMessage());
            Response::error('Erro ao atualizar perfil: ' . $e->getMessage(), 500);
        }
    }
    
    public function getProfile() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT u.*, up.avatar_url, up.bio, up.company, up.website, up.timezone, up.language, up.theme 
                     FROM users u 
                     LEFT JOIN user_profiles up ON u.id = up.user_id 
                     WHERE u.id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            // Remover senha do retorno
            unset($userData['password_hash']);
            unset($userData['password_reset_token']);
            
            Response::success($userData);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar perfil: ' . $e->getMessage(), 500);
        }
    }
    
    public function getBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            error_log("USER_CONTROLLER: Buscando saldo para usuário ID: " . $userId);
            
            $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $responseData = [
                    'balance' => (float)$result['saldo'],
                    'plan_balance' => (float)$result['saldo_plano'],
                    'total_balance' => (float)$result['saldo'] + (float)$result['saldo_plano'],
                    'formatted' => 'R$ ' . number_format((float)$result['saldo'], 2, ',', '.')
                ];
                
                error_log("USER_CONTROLLER: Saldo encontrado: " . json_encode($responseData));
                Response::success($responseData);
            } else {
                error_log("USER_CONTROLLER: Usuário não encontrado para ID: " . $userId);
                Response::error('Usuário não encontrado', 404);
            }
        } catch (Exception $e) {
            error_log("USER_CONTROLLER GET_BALANCE ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar saldo: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            error_log("USER_CONTROLLER: Atualizando saldo para usuário ID: " . $userId);
            error_log("USER_CONTROLLER: Dados recebidos: " . json_encode($data));
            
            if (!isset($data['amount']) || !is_numeric($data['amount'])) {
                error_log("USER_CONTROLLER: Valor inválido fornecido");
                Response::error('Valor deve ser um número válido', 400);
                return;
            }
            
            $amount = (float)$data['amount'];
            $type = $data['type'] ?? 'add'; // 'add' ou 'set'
            $description = $data['description'] ?? 'Atualização de saldo';
            
            if ($amount < 0 && $type === 'add') {
                error_log("USER_CONTROLLER: Tentativa de adicionar valor negativo");
                Response::error('Valor deve ser positivo para adição', 400);
                return;
            }
            
            $this->db->beginTransaction();
            
            if ($type === 'set') {
                // Definir saldo específico
                $query = "UPDATE users SET saldo = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$amount, $userId]);
                
                error_log("USER_CONTROLLER: Saldo definido para: " . $amount);
            } else {
                // Adicionar ao saldo atual
                $query = "UPDATE users SET saldo = saldo + ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$amount, $userId]);
                
                error_log("USER_CONTROLLER: Saldo incrementado em: " . $amount);
            }
            
            // Registrar transação se a tabela existir
            try {
                $transQuery = "INSERT INTO transacoes (user_id, tipo, valor, descricao, status, created_at) 
                              VALUES (?, ?, ?, ?, 'concluida', NOW())";
                $transStmt = $this->db->prepare($transQuery);
                $transStmt->execute([
                    $userId, 
                    $amount >= 0 ? 'credito' : 'debito',
                    abs($amount), 
                    $description
                ]);
                
                error_log("USER_CONTROLLER: Transação registrada");
            } catch (Exception $transError) {
                error_log("USER_CONTROLLER: Erro ao registrar transação (ignorado): " . $transError->getMessage());
            }
            
            // Log de auditoria
            $this->logUserAction($userId, 'balance_updated', 'financial', $description, [
                'amount' => $amount,
                'type' => $type,
                'description' => $description
            ]);
            
            $this->db->commit();
            
            // Buscar saldo atualizado
            $balanceQuery = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute([$userId]);
            $newBalance = $balanceStmt->fetch(PDO::FETCH_ASSOC);
            
            $responseData = [
                'balance' => (float)$newBalance['saldo'],
                'plan_balance' => (float)$newBalance['saldo_plano'],
                'total_balance' => (float)$newBalance['saldo'] + (float)$newBalance['saldo_plano'],
                'formatted' => 'R$ ' . number_format((float)$newBalance['saldo'], 2, ',', '.')
            ];
            
            error_log("USER_CONTROLLER: Saldo atualizado com sucesso: " . json_encode($responseData));
            Response::success($responseData, 'Saldo atualizado com sucesso');
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("USER_CONTROLLER UPDATE_BALANCE ERROR: " . $e->getMessage());
            error_log("USER_CONTROLLER UPDATE_BALANCE ERROR TRACE: " . $e->getTraceAsString());
            Response::error('Erro ao atualizar saldo: ' . $e->getMessage(), 500);
        }
    }
    
    private function generateReferralCode($username) {
        $base = strtoupper(substr($username, 0, 3));
        $random = sprintf('%04d', mt_rand(1000, 9999));
        return $base . $random;
    }
    
    private function logUserAction($userId, $action, $category, $description, $values = []) {
        try {
            $auditQuery = "INSERT INTO user_audit (user_id, action, category, description, new_values, ip_address, user_agent) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)";
            $auditStmt = $this->db->prepare($auditQuery);
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $auditStmt->execute([
                $userId,
                $action,
                $category,
                $description,
                json_encode($values),
                $ipAddress,
                $userAgent
            ]);
            
        } catch (Exception $e) {
            error_log("ERRO AUDIT LOG: " . $e->getMessage());
        }
    }
}
