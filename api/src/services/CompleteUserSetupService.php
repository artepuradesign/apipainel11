
<?php
// src/services/CompleteUserSetupService.php

class CompleteUserSetupService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createCompleteUserSetup($userId, $userData, $sessionData = []) {
        try {
            error_log("COMPLETE_USER_SETUP: Iniciando configuração completa para usuário ID: " . $userId);
            
            // 1. Criar perfil do usuário
            $this->createUserProfile($userId, $userData);
            
            // 2. Criar carteiras do usuário
            $this->createUserWallets($userId);
            
            // 3. Criar configurações do usuário
            $this->createUserSettings($userId);
            
            // 4. Criar auditoria do usuário
            $this->createUserAudit($userId, $userData, $sessionData);
            
            // 5. Criar log do sistema
            $this->createSystemLog($userId, $userData, $sessionData);
            
            // 6. Criar assinatura padrão se aplicável
            $this->createDefaultSubscription($userId);
            
            error_log("COMPLETE_USER_SETUP SUCCESS: Configuração completa criada para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR: " . $e->getMessage());
            throw new Exception("Erro ao criar configuração completa do usuário: " . $e->getMessage());
        }
    }
    
    private function createUserProfile($userId, $userData) {
        try {
            $query = "INSERT INTO user_profiles (
                user_id, bio, company, preferences, timezone, language, theme, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $bio = "Usuário registrado em " . date('Y-m-d');
            $company = $userData['tipo_pessoa'] === 'juridica' ? $userData['full_name'] : null;
            $preferences = json_encode([
                'notifications' => true,
                'email_alerts' => true,
                'theme' => 'light'
            ]);
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $userId,
                $bio,
                $company,
                $preferences,
                'America/Sao_Paulo',
                'pt-BR',
                'light'
            ]);
            
            error_log("COMPLETE_USER_SETUP: Perfil criado para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar perfil: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function createUserWallets($userId) {
        try {
            $walletTypes = ['main', 'bonus'];
            
            foreach ($walletTypes as $walletType) {
                $query = "INSERT INTO user_wallets (
                    user_id, wallet_type, current_balance, available_balance, 
                    total_deposited, total_spent, status, created_at
                ) VALUES (?, ?, 0.00, 0.00, 0.00, 0.00, 'active', NOW())";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([$userId, $walletType]);
            }
            
            error_log("COMPLETE_USER_SETUP: Carteiras criadas para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar carteiras: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function createUserSettings($userId) {
        try {
            $defaultSettings = [
                ['notifications_enabled', 'true', 'boolean', 'notifications'],
                ['email_alerts', 'true', 'boolean', 'notifications'],
                ['theme', 'light', 'string', 'appearance'],
                ['language', 'pt-BR', 'string', 'general'],
                ['timezone', 'America/Sao_Paulo', 'string', 'general']
            ];
            
            foreach ($defaultSettings as $setting) {
                $query = "INSERT INTO user_settings (
                    user_id, setting_key, setting_value, setting_type, category, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    $userId,
                    $setting[0],
                    $setting[1],
                    $setting[2],
                    $setting[3]
                ]);
            }
            
            error_log("COMPLETE_USER_SETUP: Configurações criadas para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar configurações: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function createUserAudit($userId, $userData, $sessionData) {
        try {
            $query = "INSERT INTO user_audit (
                user_id, action, category, description, old_values, new_values,
                ip_address, user_agent, created_at
            ) VALUES (?, 'account_created', 'registration', ?, NULL, ?, ?, ?, NOW())";
            
            $description = "Conta criada através do sistema de registro";
            $newValues = json_encode([
                'user_role' => $userData['user_role'] ?? 'assinante',
                'status' => 'ativo',
                'email' => $userData['email'],
                'registration_method' => 'web_form'
            ]);
            
            $ipAddress = $sessionData['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $sessionData['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $userId,
                $description,
                $newValues,
                $ipAddress,
                $userAgent
            ]);
            
            error_log("COMPLETE_USER_SETUP: Auditoria criada para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar auditoria: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function createSystemLog($userId, $userData, $sessionData) {
        try {
            $query = "INSERT INTO system_logs (
                user_id, log_level, action, module, description, details,
                ip_address, user_agent, created_at
            ) VALUES (?, 'info', 'user_registration', 'auth', ?, ?, ?, ?, NOW())";
            
            $description = "Novo usuário registrado no sistema";
            $details = json_encode([
                'timestamp' => date('Y-m-d H:i:s'),
                'user_id' => $userId,
                'email' => $userData['email'],
                'user_role' => $userData['user_role'] ?? 'assinante',
                'registration_source' => 'web_form',
                'auto_setup_completed' => true
            ]);
            
            $ipAddress = $sessionData['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $sessionData['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $userId,
                $description,
                $details,
                $ipAddress,
                $userAgent
            ]);
            
            error_log("COMPLETE_USER_SETUP: Log do sistema criado para usuário ID: " . $userId);
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar log do sistema: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function createDefaultSubscription($userId) {
        try {
            // Por enquanto, todos os usuários começam com Pré-Pago
            // No futuro, pode ser implementada lógica para planos específicos
            error_log("COMPLETE_USER_SETUP: Usuário ID {$userId} iniciado com plano Pré-Pago");
            
        } catch (Exception $e) {
            error_log("COMPLETE_USER_SETUP ERROR ao criar assinatura: " . $e->getMessage());
            // Não falha o processo por causa da assinatura
        }
    }
}
