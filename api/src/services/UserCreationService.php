<?php
// src/services/UserCreationService.php

require_once __DIR__ . '/PasswordGenerationService.php';
require_once __DIR__ . '/UsernameGenerationService.php';
require_once __DIR__ . '/ReferralLookupService.php';
require_once __DIR__ . '/UserDatabaseService.php';

class UserCreationService {
    private $db;
    private $passwordService;
    private $usernameService;
    private $referralService;
    private $databaseService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->passwordService = new PasswordGenerationService();
        $this->usernameService = new UsernameGenerationService($db);
        $this->referralService = new ReferralLookupService($db);
        $this->databaseService = new UserDatabaseService($db);
    }
    
    public function createUser($data, $indicadorId = null, $codigoIndicacao = null) {
        try {
            error_log("USER_CREATION: Iniciando criação de usuário com TODOS os campos obrigatórios");
            
            // Gerar hash da senha (MD5 mais curto)
            $passwordHash = $this->passwordService->generatePasswordHash($data['password']);
            
            // Gerar username automático baseado no email
            $username = $this->usernameService->generateUsername($data['email']);
            
            // Gerar senhas numéricas OBRIGATÓRIAS (todas como 0)
            $passwords = $this->passwordService->generateRequiredPasswords();
            
            // Buscar indicador_id pelo código de indicação se fornecido
            $finalIndicadorId = $this->processReferralCode($data, $indicadorId);
            
            // Data de início será definida apenas na compra de plano
            $dataInicio = null;
            
            // Gerar código de indicação único para este usuário
            $codigoIndicacaoUsuario = $this->generateUniqueReferralCode($username);
            
            // Preparar dados do usuário com TODOS os campos obrigatórios
            $userData = [
                'username' => $username,
                'email' => trim($data['email']),
                'password_hash' => $passwordHash,
                'full_name' => trim($data['full_name']),
                'user_role' => $data['user_role'] ?? 'assinante',
                'status' => 'ativo',
                'tipoplano' => 'Pré-Pago',
                'saldo' => 0.00,
                'saldo_plano' => 0.00,
                'saldo_atualizado' => 0, // NOVO CAMPO OBRIGATÓRIO
                'codigo_indicacao' => $codigoIndicacaoUsuario,
                'indicador_id' => $finalIndicadorId,
                'aceite_termos' => isset($data['aceite_termos']) ? ($data['aceite_termos'] ? 1 : 0) : 1,
                'senhaalfa' => $data['password'], // Usar senha SEM HASH
                'senha4' => $passwords['senha4'], // OBRIGATÓRIO - agora 0000
                'senha6' => $passwords['senha6'], // OBRIGATÓRIO - agora 000000
                'senha8' => $passwords['senha8'], // OBRIGATÓRIO - agora 00000000
                'data_inicio' => $dataInicio, // Será definida na compra de plano
                'data_fim' => null, // Permitir NULL inicialmente
                'tipo_pessoa' => 'fisica',
                'email_verificado' => 0,
                'telefone_verificado' => 0, // NOVO CAMPO
                'cpf' => null, // Permitir NULL inicialmente
                'cnpj' => null, // Permitir NULL inicialmente
                'data_nascimento' => null, // Permitir NULL inicialmente
                'telefone' => null, // Permitir NULL inicialmente
                'cep' => null, // Permitir NULL inicialmente
                'endereco' => null, // Permitir NULL inicialmente
                'numero' => null, // Permitir NULL inicialmente
                'bairro' => null, // Permitir NULL inicialmente
                'cidade' => null, // Permitir NULL inicialmente
                'estado' => null, // Permitir NULL inicialmente
                'ultimo_login' => null, // Será preenchido no primeiro login
                'tentativas_login' => 0, // Iniciar com 0
                'bloqueado_ate' => null, // NULL por padrão
                'password_reset_token' => null, // NULL por padrão
                'password_reset_expires' => null, // NULL por padrão
                'email_verification_token' => null // NULL por padrão
            ];
            
            // Logs detalhados dos campos obrigatórios
            error_log("USER_CREATION: Campos obrigatórios sendo inseridos:");
            error_log("USER_CREATION: - username: " . $username);
            error_log("USER_CREATION: - email: " . $userData['email']);
            error_log("USER_CREATION: - senhaalfa: " . $userData['senhaalfa']);
            error_log("USER_CREATION: - senha4: " . $passwords['senha4']);
            error_log("USER_CREATION: - senha6: " . $passwords['senha6']);
            error_log("USER_CREATION: - senha8: " . $passwords['senha8']);
            error_log("USER_CREATION: - user_role: " . $userData['user_role']);
            error_log("USER_CREATION: - status: " . $userData['status']);
            error_log("USER_CREATION: - tipo_pessoa: " . $userData['tipo_pessoa']);
            error_log("USER_CREATION: - saldo: " . $userData['saldo']);
            error_log("USER_CREATION: - saldo_plano: " . $userData['saldo_plano']);
            error_log("USER_CREATION: - saldo_atualizado: " . $userData['saldo_atualizado']);
            error_log("USER_CREATION: - tipoplano: " . $userData['tipoplano']);
            error_log("USER_CREATION: - data_inicio: " . ($dataInicio ?: 'NULL'));
            error_log("USER_CREATION: - indicador_id: " . ($finalIndicadorId ?: 'NULL'));
            error_log("USER_CREATION: - codigo_indicacao gerado: " . $codigoIndicacaoUsuario);
            error_log("USER_CREATION: - aceite_termos: " . $userData['aceite_termos']);
            error_log("USER_CREATION: - email_verificado: " . $userData['email_verificado']);
            error_log("USER_CREATION: - telefone_verificado: " . $userData['telefone_verificado']);
            error_log("USER_CREATION: - tentativas_login: " . $userData['tentativas_login']);
            
            // Insert do usuário
            $userId = $this->databaseService->insertUser($userData);
            
            error_log("USER_CREATION SUCCESS: Usuário criado com ID: " . $userId);
            error_log("USER_CREATION SUCCESS: - Senhas geradas - 4: {$passwords['senha4']}, 6: {$passwords['senha6']}, 8: {$passwords['senha8']}");
            error_log("USER_CREATION SUCCESS: - Data início: " . ($dataInicio ?: 'NULL'));
            error_log("USER_CREATION SUCCESS: - Indicador ID: " . ($finalIndicadorId ?: 'nenhum'));
            
            // Criar registro na tabela de indicações se existir indicador
            if ($finalIndicadorId) {
                $this->referralService->createReferralRecord($userId, $finalIndicadorId, $data['codigo_indicacao_usado'] ?? null);
            }
            
            return $userId;
            
        } catch (Exception $e) {
            error_log("USER_CREATION ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function processReferralCode($data, $indicadorId) {
        $finalIndicadorId = null;
        
        if (isset($data['codigo_indicacao_usado']) && !empty($data['codigo_indicacao_usado'])) {
            $finalIndicadorId = $this->referralService->findIndicadorIdByCode($data['codigo_indicacao_usado']);
            error_log("USER_CREATION: Código de indicação usado: " . $data['codigo_indicacao_usado'] . ", Indicador ID: " . ($finalIndicadorId ?: 'não encontrado'));
        } elseif ($indicadorId) {
            $finalIndicadorId = $indicadorId;
            error_log("USER_CREATION: Indicador ID passado diretamente: " . $finalIndicadorId);
        }
        
        return $finalIndicadorId;
    }
    
    private function generateUniqueReferralCode($username) {
        $baseCode = strtoupper(substr($username, 0, 3)) . sprintf('%04d', mt_rand(1000, 9999));
        $code = $baseCode;
        $counter = 1;
        
        while ($this->codeExists($code)) {
            $code = $baseCode . $counter;
            $counter++;
        }
        
        return $code;
    }
    
    private function codeExists($code) {
        try {
            $query = "SELECT id FROM users WHERE codigo_indicacao = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }
    
    public function getUserData($userId) {
        return $this->databaseService->getUserData($userId);
    }
}
