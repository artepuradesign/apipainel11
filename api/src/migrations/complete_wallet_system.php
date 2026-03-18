<?php
// src/migrations/complete_wallet_system.php

require_once __DIR__ . '/../config/database.php';

function completeWalletSystem($db) {
    echo "🚀 Completando sistema de carteira e indicações...\n";
    
    try {
        $db->beginTransaction();
        
        // 1. Criar/Atualizar tabela wallet_transactions
        echo "1. Criando/atualizando tabela wallet_transactions...\n";
        createWalletTransactionsTable($db);
        
        // 2. Criar/Atualizar tabela user_wallets
        echo "2. Criando/atualizando tabela user_wallets...\n";
        createUserWalletsTable($db);
        
        // 3. Criar/Atualizar tabela indicacoes
        echo "3. Criando/atualizando tabela indicacoes...\n";
        updateIndicacoesTable($db);
        
        // 4. Criar triggers para manter consistência
        echo "4. Criando triggers...\n";
        createWalletTriggers($db);
        
        // 5. Migrar dados existentes se necessário
        echo "5. Migrando dados existentes...\n";
        migrateLegacyData($db);
        
        $db->commit();
        echo "\n🎉 Sistema de carteira completado com sucesso!\n";
        
        return true;
        
    } catch (Exception $e) {
        $db->rollback();
        echo "\n❌ Erro na migração: " . $e->getMessage() . "\n";
        return false;
    }
}

function createWalletTransactionsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wallet_type ENUM('main', 'plan', 'bonus', 'referral') DEFAULT 'plan',
        type ENUM('recarga', 'bonus', 'indicacao', 'plano', 'consulta', 'saque', 'entrada', 'saida', 'transferencia') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        balance_before DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        balance_after DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        description TEXT,
        reference_type VARCHAR(50) DEFAULT NULL,
        reference_id INT DEFAULT NULL,
        payment_method VARCHAR(50) DEFAULT NULL,
        external_transaction_id VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
        metadata JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_wallet_type (wallet_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_reference (reference_type, reference_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    echo "   ✅ Tabela wallet_transactions criada/atualizada\n";
}

function createUserWalletsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS user_wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wallet_type ENUM('main', 'plan', 'bonus', 'referral') DEFAULT 'plan',
        current_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        frozen_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_deposited DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'BRL',
        status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
        last_transaction_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_wallet (user_id, wallet_type),
        INDEX idx_user_id (user_id),
        INDEX idx_wallet_type (wallet_type),
        INDEX idx_status (status),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $db->exec($sql);
    echo "   ✅ Tabela user_wallets criada/atualizada\n";
}

function updateIndicacoesTable($db) {
    // Verificar se a tabela indicacoes existe
    $checkTable = "SHOW TABLES LIKE 'indicacoes'";
    $result = $db->query($checkTable);
    
    if ($result->rowCount() == 0) {
        // Criar tabela indicacoes se não existir
        $sql = "
        CREATE TABLE indicacoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            indicador_id INT NOT NULL,
            indicado_id INT NOT NULL,
            codigo VARCHAR(20) NOT NULL,
            status ENUM('ativo', 'inativo', 'processado') DEFAULT 'ativo',
            bonus_indicador DECIMAL(10,2) DEFAULT 5.00,
            bonus_indicado DECIMAL(10,2) DEFAULT 5.00,
            commission_percentage DECIMAL(5,2) DEFAULT 5.0,
            first_login_bonus_processed BOOLEAN DEFAULT FALSE,
            first_login_at DATETIME DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_indicador (indicador_id),
            INDEX idx_indicado (indicado_id),
            INDEX idx_codigo (codigo),
            INDEX idx_status (status),
            INDEX idx_processed (first_login_bonus_processed),
            
            FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (indicado_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_referral (indicador_id, indicado_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($sql);
        echo "   ✅ Tabela indicacoes criada\n";
    } else {
        // Adicionar campos faltantes se necessário
        $fields = [
            'commission_percentage' => 'ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 5.0',
            'first_login_bonus_processed' => 'ADD COLUMN first_login_bonus_processed BOOLEAN DEFAULT FALSE',
            'first_login_at' => 'ADD COLUMN first_login_at DATETIME DEFAULT NULL',
            'updated_at' => 'ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ];
        
        foreach ($fields as $fieldName => $alterStatement) {
            try {
                $checkQuery = "SHOW COLUMNS FROM indicacoes LIKE '{$fieldName}'";
                $result = $db->query($checkQuery);
                
                if ($result->rowCount() == 0) {
                    $alterQuery = "ALTER TABLE indicacoes {$alterStatement}";
                    $db->exec($alterQuery);
                    echo "   ✅ Campo '{$fieldName}' adicionado à tabela indicacoes\n";
                }
            } catch (Exception $e) {
                echo "   ⚠️ Campo '{$fieldName}' já existe ou erro: " . $e->getMessage() . "\n";
            }
        }
    }
}

function createWalletTriggers($db) {
    // Trigger para atualizar user_wallets quando uma transação é inserida
    $triggerSql = "
    CREATE TRIGGER IF NOT EXISTS update_wallet_on_transaction
    AFTER INSERT ON wallet_transactions
    FOR EACH ROW
    BEGIN
        INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, last_transaction_at)
        VALUES (NEW.user_id, NEW.wallet_type, NEW.balance_after, NEW.balance_after, NOW())
        ON DUPLICATE KEY UPDATE
            current_balance = NEW.balance_after,
            available_balance = NEW.balance_after,
            last_transaction_at = NOW(),
            updated_at = NOW();
    END;
    ";
    
    try {
        $db->exec($triggerSql);
        echo "   ✅ Trigger update_wallet_on_transaction criado\n";
    } catch (Exception $e) {
        echo "   ⚠️ Trigger já existe ou erro: " . $e->getMessage() . "\n";
    }
}

function migrateLegacyData($db) {
    try {
        // Migrar saldos dos usuários para as carteiras
        $migrateSql = "
        INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, created_at)
        SELECT 
            id as user_id,
            'plan' as wallet_type,
            COALESCE(saldo_plano, 0) as current_balance,
            COALESCE(saldo_plano, 0) as available_balance,
            created_at
        FROM users 
        WHERE id NOT IN (SELECT user_id FROM user_wallets WHERE wallet_type = 'plan')
        AND COALESCE(saldo_plano, 0) > 0
        ";
        
        $result = $db->exec($migrateSql);
        echo "   ✅ Migrados {$result} saldos de plano para user_wallets\n";
        
        // Migrar saldo principal
        $migrateMainSql = "
        INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance, created_at)
        SELECT 
            id as user_id,
            'main' as wallet_type,
            COALESCE(saldo, 0) as current_balance,
            COALESCE(saldo, 0) as available_balance,
            created_at
        FROM users 
        WHERE id NOT IN (SELECT user_id FROM user_wallets WHERE wallet_type = 'main')
        AND COALESCE(saldo, 0) > 0
        ";
        
        $result2 = $db->exec($migrateMainSql);
        echo "   ✅ Migrados {$result2} saldos principais para user_wallets\n";
        
    } catch (Exception $e) {
        echo "   ⚠️ Erro na migração de dados: " . $e->getMessage() . "\n";
    }
}

// Execução direta se chamado via CLI
if (php_sapi_name() === 'cli' && isset($argv[0]) && basename($argv[0]) === 'complete_wallet_system.php') {
    try {
        $db = getDBConnection();
        completeWalletSystem($db);
    } catch (Exception $e) {
        echo "Erro de conexão: " . $e->getMessage() . "\n";
        exit(1);
    }
}