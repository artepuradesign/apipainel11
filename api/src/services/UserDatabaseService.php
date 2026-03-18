
<?php
// src/services/UserDatabaseService.php

class UserDatabaseService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function insertUser($userData) {
        try {
            error_log("USER_DATABASE: Iniciando inserção do usuário principal");
            
            // Query com TODOS os campos obrigatórios da tabela users
            $query = "INSERT INTO users (
                username, email, password_hash, full_name, cpf, cnpj,
                data_nascimento, telefone, cep, endereco, numero, bairro,
                cidade, estado, senhaalfa, senha4, senha6, senha8,
                user_role, status, tipo_pessoa, saldo, saldo_plano, saldo_atualizado,
                tipoplano, data_inicio, data_fim, indicador_id, codigo_indicacao,
                aceite_termos, email_verificado, telefone_verificado,
                ultimo_login, tentativas_login, bloqueado_ate,
                password_reset_token, password_reset_expires, email_verification_token,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, NOW(), NOW()
            )";
            
            $stmt = $this->db->prepare($query);
            
            // Preparar todos os valores
            $values = [
                $userData['username'],                                    // username
                $userData['email'],                                      // email
                $userData['password_hash'],                              // password_hash
                $userData['full_name'],                                  // full_name
                $userData['cpf'] ?? null,                               // cpf
                $userData['cnpj'] ?? null,                              // cnpj
                $userData['data_nascimento'] ?? null,                   // data_nascimento
                $userData['telefone'] ?? null,                          // telefone
                $userData['cep'] ?? null,                               // cep
                $userData['endereco'] ?? null,                          // endereco
                $userData['numero'] ?? null,                            // numero
                $userData['bairro'] ?? null,                            // bairro
                $userData['cidade'] ?? null,                            // cidade
                $userData['estado'] ?? null,                            // estado
                $userData['senhaalfa'],                                 // senhaalfa
                $userData['senha4'],                                    // senha4
                $userData['senha6'],                                    // senha6
                $userData['senha8'],                                    // senha8
                $userData['user_role'],                                 // user_role
                $userData['status'],                                    // status
                $userData['tipo_pessoa'],                               // tipo_pessoa
                $userData['saldo'],                                     // saldo
                $userData['saldo_plano'],                               // saldo_plano
                $userData['saldo_atualizado'],                          // saldo_atualizado
                $userData['tipoplano'],                                 // tipoplano
                $userData['data_inicio'],                               // data_inicio
                $userData['data_fim'] ?? null,                          // data_fim
                $userData['indicador_id'] ?? null,                      // indicador_id
                $userData['codigo_indicacao'],                          // codigo_indicacao
                $userData['aceite_termos'],                             // aceite_termos
                $userData['email_verificado'],                          // email_verificado
                $userData['telefone_verificado'],                       // telefone_verificado
                null,                                                   // ultimo_login
                $userData['tentativas_login'],                          // tentativas_login
                null,                                                   // bloqueado_ate
                null,                                                   // password_reset_token
                null,                                                   // password_reset_expires
                null                                                    // email_verification_token
            ];
            
            $result = $stmt->execute($values);
            
            if (!$result) {
                error_log("USER_DATABASE ERROR: Falha na execução da query de inserção");
                throw new Exception("Falha ao inserir usuário no banco de dados");
            }
            
            $userId = $this->db->lastInsertId();
            
            if (!$userId) {
                error_log("USER_DATABASE ERROR: ID do usuário não foi gerado");
                throw new Exception("ID do usuário não foi gerado");
            }
            
            error_log("USER_DATABASE SUCCESS: Usuário inserido com ID: " . $userId);
            error_log("USER_DATABASE: - Username: " . $userData['username']);
            error_log("USER_DATABASE: - Email: " . $userData['email']);
            error_log("USER_DATABASE: - Role: " . $userData['user_role']);
            error_log("USER_DATABASE: - Status: " . $userData['status']);
            error_log("USER_DATABASE: - Tipo pessoa: " . $userData['tipo_pessoa']);
            error_log("USER_DATABASE: - Senhas numéricas geradas: 4({$userData['senha4']}), 6({$userData['senha6']}), 8({$userData['senha8']})");
            
            return $userId;
            
        } catch (Exception $e) {
            error_log("USER_DATABASE ERROR: " . $e->getMessage());
            error_log("USER_DATABASE TRACE: " . $e->getTraceAsString());
            throw $e;
        }
    }
    
    public function getUserData($userId) {
        try {
            $query = "SELECT 
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
                uw.current_balance,
                uw.available_balance
            FROM users u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_wallets uw ON u.id = uw.user_id AND uw.wallet_type = 'main'
            WHERE u.id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            $userData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                error_log("USER_DATABASE ERROR: Usuário ID {$userId} não encontrado");
                throw new Exception("Usuário não encontrado");
            }
            
            // Remover campos sensíveis da resposta
            unset($userData['password_hash']);
            unset($userData['password_reset_token']);
            unset($userData['email_verification_token']);
            
            error_log("USER_DATABASE: Dados do usuário recuperados com sucesso para ID: " . $userId);
            
            return $userData;
            
        } catch (Exception $e) {
            error_log("USER_DATABASE ERROR ao buscar dados: " . $e->getMessage());
            throw $e;
        }
    }
}
