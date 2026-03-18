<?php
// src/services/RegistrationService.php

require_once __DIR__ . '/ReferralTransactionService.php';
require_once __DIR__ . '/NotificationService.php';

class RegistrationService {
    private $db;
    private $referralService;
    private $notificationService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->referralService = new ReferralTransactionService($db);
        $this->notificationService = new NotificationService($db);
    }
    
    public function register($data) {
        try {
            error_log("REGISTRATION: === INÍCIO DO REGISTRO COMPLETO ===");
            error_log("REGISTRATION: Dados recebidos: " . json_encode(array_merge($data, ['password' => '[HIDDEN]'])));
            
            $this->db->beginTransaction();
            
            // 1. Criar usuário com TODOS os campos obrigatórios
            $userId = $this->createCompleteUser($data);
            error_log("REGISTRATION: ✅ Usuário criado com ID: {$userId}");
            
            // 2. Criar carteiras obrigatórias
            $this->createUserWallets($userId);
            error_log("REGISTRATION: ✅ Carteiras criadas para usuário {$userId}");
            
            // 3. Processar indicação se fornecida
            $bonusData = null;
            $referralCodeToProcess = null;
            
            // Determinar qual código de indicação usar
            if (isset($data['codigo_indicacao_usado']) && !empty($data['codigo_indicacao_usado'])) {
                $referralCodeToProcess = $data['codigo_indicacao_usado'];
                error_log("REGISTRATION: Processando indicação com código: {$referralCodeToProcess}");
            } elseif (isset($data['referralCode']) && !empty($data['referralCode'])) {
                $referralCodeToProcess = $data['referralCode'];
                error_log("REGISTRATION: Processando indicação com código (fallback): {$referralCodeToProcess}");
            } elseif (isset($data['indicador_id']) && !empty($data['indicador_id'])) {
                // Se veio o ID do indicador, buscar o código
                $codeQuery = "SELECT codigo_indicacao FROM users WHERE id = ? AND status = 'ativo'";
                $codeStmt = $this->db->prepare($codeQuery);
                $codeStmt->execute([$data['indicador_id']]);
                $referralCodeToProcess = $codeStmt->fetchColumn();
                error_log("REGISTRATION: Processando indicação pelo ID indicador: {$data['indicador_id']}, código: {$referralCodeToProcess}");
            }
            
            // Processar indicação se código foi encontrado
            if ($referralCodeToProcess) {
                $bonusResult = $this->processReferralOnRegistration($userId, $referralCodeToProcess);
                
                if ($bonusResult['success']) {
                    $bonusData = $bonusResult['data'];
                    error_log("REGISTRATION: ✅ Bônus processado: " . json_encode($bonusData));
                } else {
                    error_log("REGISTRATION: ⚠️ Falha no bônus: " . $bonusResult['message']);
                }
            } else {
                error_log("REGISTRATION: Nenhum código de indicação fornecido ou válido");
            }
            
            // 4. Buscar dados completos do usuário criado
            $userData = $this->getUserCompleteData($userId);
            
            // 5. Criar sessão de usuário
            $sessionToken = $this->createUserSession($userId);
            
            // 6. Criar notificação de boas-vindas
            $this->createWelcomeNotification($userId, $data['full_name']);
            
            $this->db->commit();
            error_log("REGISTRATION: === ✅ REGISTRO CONCLUÍDO COM SUCESSO ===");
            
            // Preparar resposta completa
            $responseData = [
                'user' => [
                    'id' => (int)$userData['id'],
                    'username' => $userData['username'],
                    'email' => $userData['email'],
                    'full_name' => $userData['full_name'],
                    'user_role' => $userData['user_role'] ?: 'assinante',
                    'codigo_indicacao' => $userData['codigo_indicacao'],
                    'status' => $userData['status'],
                    'saldo' => (float)$userData['saldo'],
                    'saldo_plano' => (float)$userData['saldo_plano'],
                    'created_at' => $userData['created_at']
                ],
                'session_token' => $sessionToken,
                'token' => $sessionToken
            ];
            
            // Adicionar dados de bônus se processado
            if ($bonusData) {
                $responseData['referral_bonus'] = $bonusData;
            }
            
            return [
                'success' => true,
                'data' => $responseData,
                'message' => 'Usuário registrado com sucesso'
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("REGISTRATION ERROR: " . $e->getMessage());
            error_log("REGISTRATION ERROR TRACE: " . $e->getTraceAsString());
            return [
                'success' => false,
                'message' => 'Erro no registro: ' . $e->getMessage()
            ];
        }
    }
    
    private function createCompleteUser($data) {
        // Gerar código de indicação único
        $codigoIndicacao = $this->generateReferralCode($data['full_name']);
        
        // Gerar senhas numéricas obrigatórias
        $senha4 = '0000';
        $senha6 = '000000';
        $senha8 = '00000000';
        
        error_log("REGISTRATION: Criando usuário com senhas - 4: {$senha4}, 6: {$senha6}, 8: {$senha8}");
        
        // Criar usuário com TODOS os campos obrigatórios
        $query = "INSERT INTO users (
            username, email, senhaalfa, password_hash, full_name, 
            codigo_indicacao, aceite_termos, status, user_role,
            senha4, senha6, senha8, saldo, saldo_plano, saldo_atualizado,
            tipoplano, data_inicio, tipo_pessoa, email_verificado, 
            telefone_verificado, tentativas_login, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo', ?, ?, ?, ?, 0, 0, 0, 'Pré-Pago', ?, 'fisica', 0, 0, 0, NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['email'],                    // username
            $data['email'],                    // email
            $data['password'],                 // senhaalfa
            md5($data['password']),           // password_hash
            $data['full_name'],               // full_name
            $codigoIndicacao,                 // codigo_indicacao
            $data['aceite_termos'] ?? true,   // aceite_termos
            $data['user_role'] ?? 'assinante', // user_role
            $senha4,                          // senha4
            $senha6,                          // senha6
            $senha8,                          // senha8
            date('Y-m-d')                     // data_inicio
        ]);
        
        $userId = $this->db->lastInsertId();
        error_log("REGISTRATION: ✅ Usuário criado com ID {$userId} - Código: {$codigoIndicacao}");
        
        return $userId;
    }
    
    private function createUserWallets($userId) {
        try {
            // Criar carteira principal
            $mainWalletQuery = "INSERT INTO user_wallets (
                user_id, wallet_type, current_balance, available_balance, 
                total_deposited, total_spent, status, created_at, updated_at
            ) VALUES (?, 'main', 0, 0, 0, 0, 'active', NOW(), NOW())";
            
            $mainStmt = $this->db->prepare($mainWalletQuery);
            $mainStmt->execute([$userId]);
            $mainWalletId = $this->db->lastInsertId();
            
            // Criar carteira de bônus
            $bonusWalletQuery = "INSERT INTO user_wallets (
                user_id, wallet_type, current_balance, available_balance, 
                total_deposited, total_spent, status, created_at, updated_at
            ) VALUES (?, 'bonus', 0, 0, 0, 0, 'active', NOW(), NOW())";
            
            $bonusStmt = $this->db->prepare($bonusWalletQuery);
            $bonusStmt->execute([$userId]);
            $bonusWalletId = $this->db->lastInsertId();
            
            // Criar carteira de plano (obrigatória para indicações)
            $planWalletQuery = "INSERT INTO user_wallets (
                user_id, wallet_type, current_balance, available_balance, 
                total_deposited, total_spent, status, created_at, updated_at
            ) VALUES (?, 'plan', 0, 0, 0, 0, 'active', NOW(), NOW())";
            
            $planStmt = $this->db->prepare($planWalletQuery);
            $planStmt->execute([$userId]);
            $planWalletId = $this->db->lastInsertId();
            
            error_log("REGISTRATION: ✅ Carteiras criadas - Main: {$mainWalletId}, Bonus: {$bonusWalletId}, Plan: {$planWalletId}");
            
        } catch (Exception $e) {
            error_log("REGISTRATION ERROR: Erro ao criar carteiras - " . $e->getMessage());
            throw new Exception("Erro ao criar carteiras do usuário");
        }
    }
    
    private function processReferralOnRegistration($userId, $referralCode) {
        try {
            error_log("REGISTRATION: === PROCESSANDO INDICAÇÃO ===");
            error_log("REGISTRATION: Código: {$referralCode}, Novo usuário: {$userId}");
            
            // Buscar indicador pelo código - CONSULTA DETALHADA
            $query = "SELECT id, full_name, codigo_indicacao FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log("REGISTRATION: 🔍 Buscando indicador com código: '{$referralCode}'");
            error_log("REGISTRATION: 📋 Query executada: " . $query);
            
            if (!$referrer) {
                error_log("REGISTRATION: ❌ Código de indicação não encontrado: '{$referralCode}'");
                
                // Verificar se existe usuário com esse código (mesmo que inativo)
                $debugQuery = "SELECT id, full_name, status FROM users WHERE codigo_indicacao = ?";
                $debugStmt = $this->db->prepare($debugQuery);
                $debugStmt->execute([$referralCode]);
                $debugResult = $debugStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($debugResult) {
                    error_log("REGISTRATION: ⚠️ Usuário encontrado mas com status: '{$debugResult['status']}'");
                } else {
                    error_log("REGISTRATION: ❌ Código '{$referralCode}' não existe na base de dados");
                }
                
                return [
                    'success' => false,
                    'message' => 'Código de indicação inválido'
                ];
            }
            
            $referrerId = (int)$referrer['id'];
            error_log("REGISTRATION: ✅ Indicador encontrado - ID: {$referrerId}, Nome: '{$referrer['full_name']}', Código: '{$referrer['codigo_indicacao']}'");
            
            // Processar bônus usando o serviço integrado que já atualiza indicador_id e saldos
            error_log("REGISTRATION: Chamando ReferralTransactionService->processRegistrationBonus");
            $bonusResult = $this->referralService->processRegistrationBonus($referrerId, $userId, $referralCode);
            error_log("REGISTRATION: Resultado do bônus: " . json_encode($bonusResult));
            
            if ($bonusResult['success']) {
                error_log("REGISTRATION: ✅ Bônus de indicação processado com sucesso!");
                error_log("REGISTRATION: ✅ ReferralTransactionService já atualizou todas as tabelas necessárias");
            } else {
                error_log("REGISTRATION: ❌ Erro ao processar bônus: " . $bonusResult['message']);
            }
            
            return $bonusResult;
            
        } catch (Exception $e) {
            error_log("REGISTRATION: ❌ Erro ao processar indicação - " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno ao processar indicação'
            ];
        }
    }
    
    private function generateReferralCode($fullName) {
        $nameCode = strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $fullName), 0, 3));
        if (strlen($nameCode) < 3) {
            $nameCode = str_pad($nameCode, 3, 'X');
        }
        
        $attempts = 0;
        do {
            $number = rand(1000, 9999);
            $code = $nameCode . $number;
            
            $query = "SELECT id FROM users WHERE codigo_indicacao = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            $exists = $stmt->fetch();
            
            $attempts++;
        } while ($exists && $attempts < 10);
        
        return $code;
    }
    
    private function getUserCompleteData($userId) {
        $query = "SELECT id, username, email, full_name, user_role, codigo_indicacao, status, saldo, saldo_plano, created_at FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function createWelcomeNotification($userId, $fullName) {
        try {
            $this->notificationService->createNotification(
                $userId,
                'system',
                'Bem-vindo à nossa plataforma!',
                "Olá {$fullName}! Seja muito bem-vindo(a)! Explore todos os recursos disponíveis.",
                '/dashboard',
                'Ir para o Dashboard',
                'high'
            );
        } catch (Exception $e) {
            error_log("REGISTRATION: Erro ao criar notificação de boas-vindas - " . $e->getMessage());
        }
    }
    
    private function createUserSession($userId) {
        try {
            $sessionToken = bin2hex(random_bytes(32));
            $expiresAt = date('Y-m-d H:i:s', strtotime('+7 days'));
            
            $sessionQuery = "INSERT INTO user_sessions (
                user_id, session_token, expires_at, status, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, 'active', ?, ?, NOW())";
            
            $sessionStmt = $this->db->prepare($sessionQuery);
            $sessionStmt->execute([
                $userId,
                $sessionToken,
                $expiresAt,
                $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
                $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
            ]);
            
            error_log("REGISTRATION: ✅ Sessão criada para usuário {$userId}");
            return $sessionToken;
            
        } catch (Exception $e) {
            error_log("REGISTRATION: Erro ao criar sessão - " . $e->getMessage());
            return null;
        }
    }
}
