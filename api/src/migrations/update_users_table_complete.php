
<?php
// src/migrations/update_users_table_complete.php

function updateUsersTableComplete($db) {
    try {
        // Verificar e adicionar colunas que podem estar faltando
        $alterations = [
            "ALTER TABLE users MODIFY COLUMN username varchar(50) NOT NULL",
            "ALTER TABLE users MODIFY COLUMN email varchar(100) NOT NULL",
            "ALTER TABLE users MODIFY COLUMN full_name varchar(200) NOT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS cnpj varchar(18) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS senha4 varchar(4) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS senha6 varchar(6) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS senha8 varchar(8) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS senhaalfa varchar(255) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS telefone_verificado tinyint(1) DEFAULT 0",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verificado tinyint(1) DEFAULT 0",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS tentativas_login int(11) DEFAULT 0",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS bloqueado_ate datetime DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token varchar(255) DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires datetime DEFAULT NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token varchar(255) DEFAULT NULL"
        ];
        
        foreach ($alterations as $sql) {
            try {
                $db->exec($sql);
                echo "✓ Executado: " . substr($sql, 0, 50) . "...\n";
            } catch (PDOException $e) {
                // Ignorar erros de colunas que já existem
                echo "→ Ignorado: " . substr($sql, 0, 50) . "... (já existe)\n";
            }
        }
        
        // Criar índices importantes se não existirem
        $indexes = [
            "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
            "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
            "CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf)",
            "CREATE INDEX IF NOT EXISTS idx_users_cnpj ON users(cnpj)",
            "CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)",
            "CREATE INDEX IF NOT EXISTS idx_users_tipoplano ON users(tipoplano)",
            "CREATE INDEX IF NOT EXISTS idx_users_indicador ON users(indicador_id)",
            "CREATE INDEX IF NOT EXISTS idx_users_codigo_indicacao ON users(codigo_indicacao)"
        ];
        
        foreach ($indexes as $sql) {
            try {
                $db->exec($sql);
                echo "✓ Índice criado: " . substr($sql, 40, 30) . "\n";
            } catch (PDOException $e) {
                echo "→ Índice já existe: " . substr($sql, 40, 30) . "\n";
            }
        }
        
        echo "✅ Tabela users atualizada com sucesso!\n";
        return true;
        
    } catch (Exception $e) {
        echo "❌ Erro ao atualizar tabela users: " . $e->getMessage() . "\n";
        return false;
    }
}

function createUserProfilesTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS user_profiles (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        avatar_url varchar(500) DEFAULT NULL,
        bio text DEFAULT NULL,
        company varchar(200) DEFAULT NULL,
        website varchar(500) DEFAULT NULL,
        social_links longtext CHECK (json_valid(social_links)),
        preferences longtext CHECK (json_valid(preferences)),
        timezone varchar(50) DEFAULT 'America/Sao_Paulo',
        language varchar(10) DEFAULT 'pt-BR',
        theme varchar(20) DEFAULT 'light',
        two_factor_enabled tinyint(1) DEFAULT 0,
        two_factor_secret varchar(100) DEFAULT NULL,
        created_at timestamp NULL DEFAULT current_timestamp(),
        updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY user_id (user_id),
        KEY idx_user_id (user_id),
        CONSTRAINT user_profiles_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    try {
        $db->exec($sql);
        echo "✅ Tabela user_profiles criada/verificada com sucesso!\n";
        return true;
    } catch (Exception $e) {
        echo "❌ Erro ao criar tabela user_profiles: " . $e->getMessage() . "\n";
        return false;
    }
}

function createUserAuditTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS user_audit (
        id int(11) NOT NULL AUTO_INCREMENT,
        user_id int(11) NOT NULL,
        action varchar(100) NOT NULL,
        category varchar(50) DEFAULT 'general',
        description text NOT NULL,
        old_values longtext CHECK (json_valid(old_values)),
        new_values longtext CHECK (json_valid(new_values)),
        ip_address varchar(45) DEFAULT NULL,
        user_agent text DEFAULT NULL,
        session_id varchar(100) DEFAULT NULL,
        created_at timestamp NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_user_audit (user_id,action),
        KEY idx_category (category),
        KEY idx_created_at (created_at),
        CONSTRAINT user_audit_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    try {
        $db->exec($sql);
        echo "✅ Tabela user_audit criada/verificada com sucesso!\n";
        return true;
    } catch (Exception $e) {
        echo "❌ Erro ao criar tabela user_audit: " . $e->getMessage() . "\n";
        return false;
    }
}
