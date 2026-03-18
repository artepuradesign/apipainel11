
<?php
// src/migrations/create_missing_tables.php

function createMissingTables($db) {
    try {
        error_log("MIGRATION: Criando tabelas faltantes");
        
        // 1. Tabela user_profiles
        $sql_user_profiles = "
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            avatar_url VARCHAR(500) DEFAULT NULL,
            bio TEXT DEFAULT NULL,
            company VARCHAR(200) DEFAULT NULL,
            website VARCHAR(500) DEFAULT NULL,
            social_links JSON DEFAULT NULL,
            preferences JSON DEFAULT NULL,
            timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
            language VARCHAR(10) DEFAULT 'pt-BR',
            theme VARCHAR(20) DEFAULT 'light',
            two_factor_enabled BOOLEAN DEFAULT FALSE,
            two_factor_secret VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_id (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // 2. Tabela user_settings  
        $sql_user_settings = "
        CREATE TABLE IF NOT EXISTS user_settings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            setting_key VARCHAR(100) NOT NULL,
            setting_value TEXT NOT NULL,
            setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
            category VARCHAR(50) DEFAULT 'general',
            is_public BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_setting (user_id, setting_key),
            INDEX idx_user_setting (user_id, setting_key),
            INDEX idx_category (category)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // 3. Tabela user_wallets
        $sql_user_wallets = "
        CREATE TABLE IF NOT EXISTS user_wallets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            wallet_type ENUM('main', 'bonus', 'plan', 'referral') DEFAULT 'main',
            current_balance DECIMAL(15,2) DEFAULT 0.00,
            available_balance DECIMAL(15,2) DEFAULT 0.00,
            frozen_balance DECIMAL(15,2) DEFAULT 0.00,
            total_deposited DECIMAL(15,2) DEFAULT 0.00,
            total_withdrawn DECIMAL(15,2) DEFAULT 0.00,
            total_spent DECIMAL(15,2) DEFAULT 0.00,
            currency VARCHAR(5) DEFAULT 'BRL',
            status ENUM('active', 'suspended', 'frozen') DEFAULT 'active',
            last_transaction_at TIMESTAMP NULL DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_user_wallet_type (user_id, wallet_type),
            INDEX idx_user_wallet (user_id, wallet_type),
            INDEX idx_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // 4. Tabela user_audit
        $sql_user_audit = "
        CREATE TABLE IF NOT EXISTS user_audit (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            category VARCHAR(50) DEFAULT 'general',
            description TEXT NOT NULL,
            old_values JSON DEFAULT NULL,
            new_values JSON DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent TEXT DEFAULT NULL,
            session_id VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_audit (user_id, action),
            INDEX idx_category (category),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // 5. Tabela audit_logs (logs gerais)
        $sql_audit_logs = "
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            entity_type VARCHAR(50) NOT NULL,
            entity_id INT DEFAULT NULL,
            user_id INT DEFAULT NULL,
            action VARCHAR(100) NOT NULL,
            description TEXT NOT NULL,
            old_values JSON DEFAULT NULL,
            new_values JSON DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            user_agent TEXT DEFAULT NULL,
            session_id VARCHAR(100) DEFAULT NULL,
            severity ENUM('low', 'normal', 'high', 'critical') DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            INDEX idx_entity (entity_type, entity_id),
            INDEX idx_user_id (user_id),
            INDEX idx_action (action),
            INDEX idx_severity (severity),
            INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // 6. Tabela user_devices
        $sql_user_devices = "
        CREATE TABLE IF NOT EXISTS user_devices (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            device_name VARCHAR(200) NOT NULL,
            device_type ENUM('desktop', 'mobile', 'tablet', 'other') DEFAULT 'desktop',
            device_os VARCHAR(100) DEFAULT NULL,
            device_browser VARCHAR(100) DEFAULT NULL,
            device_fingerprint VARCHAR(255) UNIQUE DEFAULT NULL,
            ip_address VARCHAR(45) DEFAULT NULL,
            is_trusted BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            last_used_at TIMESTAMP NULL DEFAULT NULL,
            location_info JSON DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_user_device (user_id),
            INDEX idx_fingerprint (device_fingerprint),
            INDEX idx_trusted (is_trusted),
            INDEX idx_active (is_active)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        // Executar criação das tabelas
        $tables = [
            'user_profiles' => $sql_user_profiles,
            'user_settings' => $sql_user_settings, 
            'user_wallets' => $sql_user_wallets,
            'user_audit' => $sql_user_audit,
            'audit_logs' => $sql_audit_logs,
            'user_devices' => $sql_user_devices
        ];
        
        foreach ($tables as $tableName => $sql) {
            $db->exec($sql);
            error_log("MIGRATION: Tabela '$tableName' criada com sucesso");
        }
        
        error_log("MIGRATION: Todas as tabelas faltantes foram criadas");
        return true;
        
    } catch (Exception $e) {
        error_log("MIGRATION ERROR: " . $e->getMessage());
        return false;
    }
}
