
<?php
// src/controllers/UsersController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class UsersController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        try {
            $query = "SELECT id, username, email, full_name, user_role, status, 
                            tipoplano, saldo, created_at, ultimo_login 
                     FROM users ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $formattedUsers = array_map(function($user) {
                return [
                    'id' => (int)$user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'user_role' => $user['user_role'],
                    'status' => $user['status'],
                    'tipoplano' => $user['tipoplano'],
                    'saldo' => (float)$user['saldo'],
                    'created_at' => $user['created_at'],
                    'ultimo_login' => $user['ultimo_login']
                ];
            }, $users);
            
            Response::success($formattedUsers);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar usuários: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $query = "SELECT * FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            // Remover dados sensíveis
            unset($user['password_hash']);
            unset($user['senhaalfa']);
            unset($user['senha4']);
            unset($user['senha6']);
            unset($user['senha8']);
            unset($user['password_reset_token']);
            unset($user['email_verification_token']);
            
            $formattedUser = [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'cpf' => $user['cpf'],
                'cnpj' => $user['cnpj'],
                'data_nascimento' => $user['data_nascimento'],
                'telefone' => $user['telefone'],
                'cep' => $user['cep'],
                'endereco' => $user['endereco'],
                'numero' => $user['numero'],
                'bairro' => $user['bairro'],
                'cidade' => $user['cidade'],
                'estado' => $user['estado'],
                'user_role' => $user['user_role'],
                'status' => $user['status'],
                'tipo_pessoa' => $user['tipo_pessoa'],
                'saldo' => (float)$user['saldo'],
                'saldo_plano' => (float)$user['saldo_plano'],
                'tipoplano' => $user['tipoplano'],
                'data_inicio' => $user['data_inicio'],
                'data_fim' => $user['data_fim'],
                'indicador_id' => $user['indicador_id'] ? (int)$user['indicador_id'] : null,
                'codigo_indicacao' => $user['codigo_indicacao'],
                'aceite_termos' => (bool)$user['aceite_termos'],
                'email_verificado' => (bool)$user['email_verificado'],
                'telefone_verificado' => (bool)$user['telefone_verificado'],
                'ultimo_login' => $user['ultimo_login'],
                'created_at' => $user['created_at'],
                'updated_at' => $user['updated_at']
            ];
            
            Response::success($formattedUser);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function getProfile($id) {
        try {
            $query = "SELECT u.*, up.* FROM users u 
                     LEFT JOIN user_profiles up ON u.id = up.user_id 
                     WHERE u.id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            $profile = [
                'id' => (int)$user['id'],
                'username' => $user['username'],
                'email' => $user['email'],
                'full_name' => $user['full_name'],
                'avatar_url' => $user['avatar_url'],
                'bio' => $user['bio'],
                'company' => $user['company'],
                'website' => $user['website'],
                'social_links' => json_decode($user['social_links'] ?? '{}', true),
                'preferences' => json_decode($user['preferences'] ?? '{}', true),
                'timezone' => $user['timezone'] ?? 'America/Sao_Paulo',
                'language' => $user['language'] ?? 'pt-BR',
                'theme' => $user['theme'] ?? 'light',
                'two_factor_enabled' => (bool)($user['two_factor_enabled'] ?? false)
            ];
            
            Response::success($profile);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar perfil: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateProfile($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Verificar se usuário existe
            $query = "SELECT id FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            // Verificar se perfil existe
            $query = "SELECT id FROM user_profiles WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            $profileExists = $stmt->fetch();
            
            $profileData = [
                'user_id' => $id,
                'avatar_url' => $data['avatar_url'] ?? null,
                'bio' => $data['bio'] ?? null,
                'company' => $data['company'] ?? null,
                'website' => $data['website'] ?? null,
                'social_links' => json_encode($data['social_links'] ?? []),
                'preferences' => json_encode($data['preferences'] ?? []),
                'timezone' => $data['timezone'] ?? 'America/Sao_Paulo',
                'language' => $data['language'] ?? 'pt-BR',
                'theme' => $data['theme'] ?? 'light'
            ];
            
            if ($profileExists) {
                // Atualizar perfil existente
                $query = "UPDATE user_profiles SET 
                         avatar_url = ?, bio = ?, company = ?, website = ?,
                         social_links = ?, preferences = ?, timezone = ?,
                         language = ?, theme = ?, updated_at = NOW()
                         WHERE user_id = ?";
                $stmt = $this->db->prepare($query);
                $result = $stmt->execute([
                    $profileData['avatar_url'],
                    $profileData['bio'],
                    $profileData['company'],
                    $profileData['website'],
                    $profileData['social_links'],
                    $profileData['preferences'],
                    $profileData['timezone'],
                    $profileData['language'],
                    $profileData['theme'],
                    $id
                ]);
            } else {
                // Criar novo perfil
                $query = "INSERT INTO user_profiles 
                         (user_id, avatar_url, bio, company, website, social_links, 
                          preferences, timezone, language, theme) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $this->db->prepare($query);
                $result = $stmt->execute([
                    $profileData['user_id'],
                    $profileData['avatar_url'],
                    $profileData['bio'],
                    $profileData['company'],
                    $profileData['website'],
                    $profileData['social_links'],
                    $profileData['preferences'],
                    $profileData['timezone'],
                    $profileData['language'],
                    $profileData['theme']
                ]);
            }
            
            if ($result) {
                Response::success(null, 'Perfil atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar perfil', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar perfil: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $query = "SELECT id FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            $updateData = [];
            $allowedFields = ['full_name', 'telefone', 'cep', 'endereco', 'numero', 
                            'bairro', 'cidade', 'estado', 'status', 'user_role'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
            
            if (empty($updateData)) {
                Response::error('Nenhum dado válido para atualização', 400);
                return;
            }
            
            $setParts = array_map(function($field) {
                return "{$field} = ?";
            }, array_keys($updateData));
            
            $query = "UPDATE users SET " . implode(', ', $setParts) . ", updated_at = NOW() WHERE id = ?";
            $params = array_values($updateData);
            $params[] = $id;
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                Response::success(null, 'Usuário atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar usuário', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUserWallets($userId) {
        try {
            $query = "SELECT * FROM user_wallets WHERE user_id = ? ORDER BY wallet_type ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $wallets = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $formattedWallets = array_map(function($wallet) {
                return [
                    'id' => (int)$wallet['id'],
                    'wallet_type' => $wallet['wallet_type'],
                    'current_balance' => (float)$wallet['current_balance'],
                    'available_balance' => (float)$wallet['available_balance'],
                    'status' => $wallet['status']
                ];
            }, $wallets);
            
            Response::success($formattedWallets);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar carteiras do usuário: ' . $e->getMessage(), 500);
        }
    }
}
