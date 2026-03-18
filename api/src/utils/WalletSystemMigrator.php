<?php
// src/utils/WalletSystemMigrator.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../services/WalletService.php';

class WalletSystemMigrator {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function ensureUserWalletExists($userId) {
        try {
            // Verificar se carteira do plano existe
            $checkQuery = "SELECT id FROM user_wallets WHERE user_id = ? AND wallet_type = 'plan'";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId]);
            
            if (!$checkStmt->fetch()) {
                // Buscar saldo atual do usuário
                $userQuery = "SELECT saldo_plano FROM users WHERE id = ?";
                $userStmt = $this->db->prepare($userQuery);
                $userStmt->execute([$userId]);
                $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                $currentBalance = (float)($userData['saldo_plano'] ?? 0);
                
                // Criar carteira
                $insertQuery = "INSERT INTO user_wallets (
                    user_id, wallet_type, current_balance, available_balance, 
                    status, created_at, updated_at
                ) VALUES (?, 'plan', ?, ?, 'active', NOW(), NOW())";
                
                $insertStmt = $this->db->prepare($insertQuery);
                $insertStmt->execute([$userId, $currentBalance, $currentBalance]);
                
                error_log("WALLET_MIGRATOR: Carteira criada para usuário {$userId} com saldo R$ {$currentBalance}");
            }
            
            return true;
        } catch (Exception $e) {
            error_log("WALLET_MIGRATOR ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function syncUserBalanceWithWallet($userId) {
        try {
            // Buscar saldo da tabela users
            $userQuery = "SELECT saldo_plano FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$userData) {
                return false;
            }
            
            $userBalance = (float)($userData['saldo_plano'] ?? 0);
            
            // Atualizar carteira
            $updateQuery = "UPDATE user_wallets SET 
                           current_balance = ?, 
                           available_balance = ?,
                           updated_at = NOW()
                           WHERE user_id = ? AND wallet_type = 'plan'";
            
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$userBalance, $userBalance, $userId]);
            
            error_log("WALLET_MIGRATOR: Saldo sincronizado para usuário {$userId}: R$ {$userBalance}");
            
            return true;
        } catch (Exception $e) {
            error_log("WALLET_MIGRATOR SYNC ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    public function createMissingReferralTransactions() {
        try {
            // Buscar indicações que foram processadas mas não têm transações na wallet_transactions
            $query = "SELECT 
                        i.indicador_id,
                        i.indicado_id,
                        i.bonus_indicador,
                        i.bonus_indicado,
                        i.first_login_at,
                        i.created_at,
                        u1.full_name as indicador_nome,
                        u2.full_name as indicado_nome
                      FROM indicacoes i
                      LEFT JOIN users u1 ON i.indicador_id = u1.id
                      LEFT JOIN users u2 ON i.indicado_id = u2.id
                      WHERE i.first_login_bonus_processed = 1
                      AND NOT EXISTS (
                          SELECT 1 FROM wallet_transactions wt 
                          WHERE wt.user_id = i.indicador_id 
                          AND wt.type = 'indicacao' 
                          AND wt.reference_type = 'referral_registration'
                          AND wt.reference_id = i.indicado_id
                      )";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $missingTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $walletService = new WalletService($this->db);
            $created = 0;
            
            foreach ($missingTransactions as $referral) {
                try {
                    // Criar transação para o indicador
                    $indicadorResult = $walletService->createTransaction(
                        $referral['indicador_id'],
                        'indicacao',
                        $referral['bonus_indicador'],
                        "Bônus por indicação - {$referral['indicado_nome']} se cadastrou",
                        'referral_registration',
                        $referral['indicado_id']
                    );
                    
                    // Criar transação para o indicado
                    $indicadoResult = $walletService->createTransaction(
                        $referral['indicado_id'],
                        'indicacao',
                        $referral['bonus_indicado'],
                        "Bônus de boas-vindas - indicado por {$referral['indicador_nome']}",
                        'referral_registration',
                        $referral['indicador_id']
                    );
                    
                    if ($indicadorResult['success'] && $indicadoResult['success']) {
                        $created += 2;
                        error_log("WALLET_MIGRATOR: Transações criadas para indicação {$referral['indicador_id']} -> {$referral['indicado_id']}");
                    }
                    
                } catch (Exception $e) {
                    error_log("WALLET_MIGRATOR: Erro ao criar transação para indicação: " . $e->getMessage());
                }
            }
            
            echo "✅ {$created} transações de indicação criadas\n";
            return $created;
            
        } catch (Exception $e) {
            error_log("WALLET_MIGRATOR CREATE_TRANSACTIONS ERROR: " . $e->getMessage());
            return 0;
        }
    }
    
    public function migrateAllUsersWallets() {
        try {
            // Buscar todos os usuários
            $query = "SELECT id, saldo_plano FROM users WHERE status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $migrated = 0;
            foreach ($users as $user) {
                if ($this->ensureUserWalletExists($user['id'])) {
                    $this->syncUserBalanceWithWallet($user['id']);
                    $migrated++;
                }
            }
            
            echo "✅ {$migrated} carteiras de usuários processadas\n";
            return $migrated;
            
        } catch (Exception $e) {
            error_log("WALLET_MIGRATOR MIGRATE_ALL ERROR: " . $e->getMessage());
            return 0;
        }
    }
}

// Execução direta se chamado via CLI
if (php_sapi_name() === 'cli' && isset($argv[0]) && basename($argv[0]) === 'WalletSystemMigrator.php') {
    try {
        $db = getDBConnection();
        $migrator = new WalletSystemMigrator($db);
        
        echo "🚀 Iniciando migração do sistema de carteiras...\n";
        
        echo "1. Migrando carteiras de usuários...\n";
        $migrator->migrateAllUsersWallets();
        
        echo "2. Criando transações de indicação faltantes...\n";
        $migrator->createMissingReferralTransactions();
        
        echo "\n🎉 Migração concluída!\n";
        
    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage() . "\n";
        exit(1);
    }
}