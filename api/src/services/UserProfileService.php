
<?php
// src/services/UserProfileService.php - Serviço para gerenciar perfis de usuário

class UserProfileService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getCompleteUserData($userId) {
        try {
            $query = "
                SELECT 
                    u.*,
                    up.avatar_url,
                    up.bio,
                    up.company,
                    up.website,
                    up.social_links,
                    up.preferences,
                    up.timezone,
                    up.language,
                    up.theme,
                    up.two_factor_enabled,
                    uw.current_balance,
                    uw.available_balance,
                    uw.frozen_balance,
                    uw.total_deposited,
                    uw.total_withdrawn,
                    uw.total_spent,
                    us.start_date as subscription_start_date,
                    us.end_date as subscription_end_date,
                    us.status as subscription_status
                FROM users u
                LEFT JOIN user_profiles up ON u.id = up.user_id
                LEFT JOIN user_wallets uw ON u.id = uw.user_id AND uw.wallet_type = 'main'
                LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.status = 'active' AND us.end_date >= CURDATE()
                WHERE u.id = ?
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                return ['success' => false, 'message' => 'Usuário não encontrado'];
            }
            
            // Processar campos JSON
            if ($userData['social_links']) {
                $userData['social_links'] = json_decode($userData['social_links'], true);
            }
            if ($userData['preferences']) {
                $userData['preferences'] = json_decode($userData['preferences'], true);
            }
            
            // Remover dados sensíveis
            unset($userData['password_hash']);
            unset($userData['password_reset_token']);
            unset($userData['email_verification_token']);
            unset($userData['two_factor_secret']);
            
            return [
                'success' => true,
                'data' => $userData
            ];
            
        } catch (Exception $e) {
            error_log("USER_PROFILE_SERVICE ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
    
    public function updateUserBasicInfo($userId, $data) {
        try {
            // Campos que podem ser atualizados (excluindo CPF e email)
            $allowedFields = [
                'full_name', 'cnpj', 'data_nascimento', 'telefone', 'cep',
                'endereco', 'numero', 'bairro', 'cidade', 'estado',
                'tipo_pessoa', 'telefone_verificado'
            ];
            
            $updateFields = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updateFields)) {
                return ['success' => false, 'message' => 'Nenhum campo válido para atualização'];
            }
            
            $updateFields[] = "updated_at = NOW()";
            $params[] = $userId;
            
            $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                return ['success' => true, 'message' => 'Informações atualizadas com sucesso'];
            }
            
            return ['success' => false, 'message' => 'Erro ao atualizar informações'];
            
        } catch (Exception $e) {
            error_log("UPDATE_USER_BASIC_INFO ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
    
    public function updateUserPasswords($userId, $passwords, $birthDate) {
        try {
            // Verificar data de nascimento para segurança
            $query = "SELECT data_nascimento FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user || $user['data_nascimento'] !== $birthDate) {
                return ['success' => false, 'message' => 'Data de nascimento incorreta'];
            }
            
            $updateFields = [];
            $params = [];
            
            if (isset($passwords['senhaalfa']) && !empty($passwords['senhaalfa'])) {
                $updateFields[] = "senhaalfa = ?, password_hash = ?";
                $params[] = $passwords['senhaalfa'];
                $params[] = password_hash($passwords['senhaalfa'], PASSWORD_DEFAULT);
            }
            
            if (isset($passwords['senha4']) && strlen($passwords['senha4']) === 4) {
                $updateFields[] = "senha4 = ?";
                $params[] = $passwords['senha4'];
            }
            
            if (isset($passwords['senha6']) && strlen($passwords['senha6']) === 6) {
                $updateFields[] = "senha6 = ?";
                $params[] = $passwords['senha6'];
            }
            
            if (isset($passwords['senha8']) && strlen($passwords['senha8']) === 8) {
                $updateFields[] = "senha8 = ?";
                $params[] = $passwords['senha8'];
            }
            
            if (empty($updateFields)) {
                return ['success' => false, 'message' => 'Nenhuma senha válida fornecida'];
            }
            
            $updateFields[] = "updated_at = NOW()";
            $params[] = $userId;
            
            $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute($params);
            
            if ($result) {
                return ['success' => true, 'message' => 'Senhas atualizadas com sucesso'];
            }
            
            return ['success' => false, 'message' => 'Erro ao atualizar senhas'];
            
        } catch (Exception $e) {
            error_log("UPDATE_USER_PASSWORDS ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
    
    public function getUserFinancialData($userId) {
        try {
            $query = "
                SELECT 
                    u.saldo,
                    u.saldo_plano,
                    u.saldo_atualizado,
                    u.tipoplano,
                    u.data_inicio,
                    u.data_fim,
                    uw.current_balance,
                    uw.available_balance,
                    uw.frozen_balance,
                    uw.total_deposited,
                    uw.total_withdrawn,
                    uw.total_spent,
                    uw.status as wallet_status
                FROM users u
                LEFT JOIN user_wallets uw ON u.id = uw.user_id AND uw.wallet_type = 'main'
                WHERE u.id = ?
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $financialData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($financialData) {
                return ['success' => true, 'data' => $financialData];
            }
            
            return ['success' => false, 'message' => 'Dados financeiros não encontrados'];
            
        } catch (Exception $e) {
            error_log("GET_USER_FINANCIAL_DATA ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
    
    public function getUserAuditHistory($userId, $page = 1, $limit = 20) {
        try {
            $offset = ($page - 1) * $limit;
            
            $query = "
                SELECT 
                    action,
                    category,
                    description,
                    ip_address,
                    created_at
                FROM user_audit 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            ";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            $auditHistory = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Contar total
            $countQuery = "SELECT COUNT(*) as total FROM user_audit WHERE user_id = ?";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute([$userId]);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            return [
                'success' => true,
                'data' => [
                    'history' => $auditHistory,
                    'pagination' => [
                        'current_page' => (int)$page,
                        'per_page' => (int)$limit,
                        'total' => (int)$total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            error_log("GET_USER_AUDIT_HISTORY ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => 'Erro interno do servidor'];
        }
    }
}
