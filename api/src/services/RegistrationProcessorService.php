
<?php
// src/services/RegistrationProcessorService.php

require_once __DIR__ . '/ReferralOperationsService.php';
require_once __DIR__ . '/UserOperationsService.php';
require_once __DIR__ . '/UserCreationService.php';
require_once __DIR__ . '/UserDataInsertionService.php';
require_once __DIR__ . '/CompleteUserSetupService.php';
require_once __DIR__ . '/ReferralTransactionService.php';

class RegistrationProcessorService {
    private $db;
    private $referralOperationsService;
    private $userOperationsService;
    private $userCreationService;
    private $userDataInsertionService;
    private $completeUserSetupService;
    private $referralTransactionService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->referralOperationsService = new ReferralOperationsService($db);
        $this->userOperationsService = new UserOperationsService($db);
        $this->userCreationService = new UserCreationService($db);
        $this->userDataInsertionService = new UserDataInsertionService($db);
        $this->completeUserSetupService = new CompleteUserSetupService($db);
        $this->referralTransactionService = new ReferralTransactionService($db);
    }
    
    public function processRegistration($data) {
        error_log("REGISTRATION_PROCESSOR: Iniciando processamento do registro");
        
        // Processar indicação se fornecida
        $indicadorId = $this->processReferral($data);
        error_log("REGISTRATION_PROCESSOR: Indicador processado - ID: " . ($indicadorId ?: 'nenhum'));
        
        // Gerar código de indicação único baseado no email
        $codigoIndicacao = $this->userOperationsService->generateReferralCode($data['email']);
        error_log("REGISTRATION_PROCESSOR: Código de indicação gerado: " . $codigoIndicacao);
        
        // Criar usuário principal
        error_log("REGISTRATION_PROCESSOR: === INICIANDO CRIAÇÃO DO USUÁRIO ===");
        $userId = $this->userCreationService->createUser($data, $indicadorId, $codigoIndicacao);
        if (!$userId) {
            throw new Exception("Falha ao criar usuário principal");
        }
        error_log("REGISTRATION_PROCESSOR: ✅ Usuário criado com ID: " . $userId);
        
        // Inserir dados completos do usuário
        error_log("REGISTRATION_PROCESSOR: === INICIANDO INSERÇÃO DE DADOS COMPLETOS ===");
        try {
            $this->userDataInsertionService->insertCompleteUserData($userId, $data, $indicadorId, $codigoIndicacao);
            error_log("REGISTRATION_PROCESSOR: ✅ Dados completos inseridos para usuário ID: " . $userId);
        } catch (Exception $e) {
            error_log("REGISTRATION_PROCESSOR ❌ ERRO CRÍTICO na inserção de dados completos: " . $e->getMessage());
            throw new Exception("Erro ao configurar dados completos do usuário: " . $e->getMessage());
        }
        
        // Criar configurações completas do usuário
        error_log("REGISTRATION_PROCESSOR: === INICIANDO SETUP COMPLETO ===");
        try {
            $sessionData = [
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ];
            
            $this->completeUserSetupService->createCompleteUserSetup($userId, $data, $sessionData);
            error_log("REGISTRATION_PROCESSOR: ✅ Setup completo criado para usuário ID: " . $userId);
        } catch (Exception $e) {
            error_log("REGISTRATION_PROCESSOR ❌ ERRO CRÍTICO no setup completo: " . $e->getMessage());
            throw new Exception("Erro ao criar configurações do usuário: " . $e->getMessage());
        }
        
        // Processar bônus de indicação se aplicável - USANDO NOVO SERVIÇO INTEGRADO
        if ($indicadorId) {
            error_log("REGISTRATION_PROCESSOR: === PROCESSANDO BÔNUS DE INDICAÇÃO IMEDIATO ===");
            $codigoUsado = $data['codigo_indicacao_usado'] ?? '';
            try {
                $bonusResult = $this->referralTransactionService->processRegistrationBonus($indicadorId, $userId, $codigoUsado);
                if ($bonusResult['success']) {
                    error_log("REGISTRATION_PROCESSOR: ✅ Bônus de indicação creditado!");
                    error_log("REGISTRATION_PROCESSOR: ✅ Indicador: R$ {$bonusResult['data']['referrer_bonus']}");
                    error_log("REGISTRATION_PROCESSOR: ✅ Indicado: R$ {$bonusResult['data']['bonus_amount']}");
                    error_log("REGISTRATION_PROCESSOR: ✅ Notificações enviadas para ambos os usuários");
                } else {
                    error_log("REGISTRATION_PROCESSOR WARNING: " . $bonusResult['message']);
                }
            } catch (Exception $e) {
                error_log("REGISTRATION_PROCESSOR WARNING: Erro ao processar bônus: " . $e->getMessage());
                // Não falha o registro por causa do bônus
            }
        }
        
        // Verificar se as tabelas relacionadas foram populadas
        error_log("REGISTRATION_PROCESSOR: === VERIFICANDO TABELAS RELACIONADAS ===");
        $this->verifyRelatedTables($userId);
        
        return $userId;
    }
    
    // MÉTODO REMOVIDO - Agora usamos ReferralTransactionService
    
    private function getUserData($userId) {
        $query = "SELECT id, full_name, email FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function processReferral($data) {
        if (!isset($data['codigo_indicacao_usado']) || empty($data['codigo_indicacao_usado'])) {
            return null;
        }
        
        try {
            // Buscar usuário pelo código de indicação
            $query = "SELECT id FROM users WHERE codigo_indicacao = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['codigo_indicacao_usado']]);
            $indicador = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($indicador) {
                error_log("REGISTRATION_PROCESSOR: Indicador encontrado - ID: " . $indicador['id']);
                return $indicador['id'];
            } else {
                error_log("REGISTRATION_PROCESSOR: Código de indicação não encontrado: " . $data['codigo_indicacao_usado']);
                return null;
            }
        } catch (Exception $e) {
            error_log("REGISTRATION_PROCESSOR ERROR ao processar indicação: " . $e->getMessage());
            return null;
        }
    }
    
    private function verifyRelatedTables($userId) {
        try {
            $tables = [
                'user_profiles' => 'SELECT COUNT(*) as count FROM user_profiles WHERE user_id = ?',
                'user_settings' => 'SELECT COUNT(*) as count FROM user_settings WHERE user_id = ?',
                'user_wallets' => 'SELECT COUNT(*) as count FROM user_wallets WHERE user_id = ?',
                'user_subscriptions' => 'SELECT COUNT(*) as count FROM user_subscriptions WHERE user_id = ?',
                'user_audit' => 'SELECT COUNT(*) as count FROM user_audit WHERE user_id = ?',
                'system_logs' => 'SELECT COUNT(*) as count FROM system_logs WHERE user_id = ?'
            ];
            
            foreach ($tables as $tableName => $query) {
                $stmt = $this->db->prepare($query);
                $stmt->execute([$userId]);
                $result = $stmt->fetch();
                $count = $result['count'];
                
                if ($count > 0) {
                    error_log("VERIFICATION ✅ {$tableName}: {$count} registros encontrados");
                } else {
                    error_log("VERIFICATION ❌ {$tableName}: NENHUM registro encontrado!");
                }
            }
            
        } catch (Exception $e) {
            error_log("VERIFICATION ERROR: " . $e->getMessage());
        }
    }
}
