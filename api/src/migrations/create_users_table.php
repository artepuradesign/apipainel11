
<?php
// src/migrations/create_users_table.php - Migração atualizada para tabela users completa

function createUsersTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS users (
        id int(11) NOT NULL AUTO_INCREMENT,
        username varchar(50) NOT NULL,
        email varchar(100) NOT NULL,
        password_hash varchar(255) NOT NULL,
        full_name varchar(200) NOT NULL,
        cpf varchar(14) DEFAULT NULL,
        cnpj varchar(18) DEFAULT NULL,
        data_nascimento date DEFAULT NULL,
        telefone varchar(20) DEFAULT NULL,
        cep varchar(10) DEFAULT NULL,
        endereco text DEFAULT NULL,
        numero varchar(10) DEFAULT NULL,
        bairro varchar(100) DEFAULT NULL,
        cidade varchar(100) DEFAULT NULL,
        estado varchar(2) DEFAULT NULL,
        senhaalfa varchar(255) DEFAULT NULL,
        senha4 varchar(4) DEFAULT NULL,
        senha6 varchar(6) DEFAULT NULL,
        senha8 varchar(8) DEFAULT NULL,
        user_role enum('assinante','suporte','admin') DEFAULT 'assinante',
        status enum('ativo','inativo','suspenso','pendente') DEFAULT 'pendente',
        tipo_pessoa enum('fisica','juridica') DEFAULT 'fisica',
        saldo decimal(10,2) DEFAULT 0.00,
        saldo_plano decimal(10,2) DEFAULT 0.00,
        saldo_atualizado tinyint(1) DEFAULT 0,
        tipoplano varchar(100) DEFAULT 'Pré-Pago',
        data_inicio date DEFAULT NULL,
        data_fim date DEFAULT NULL,
        indicador_id int(11) DEFAULT NULL,
        codigo_indicacao varchar(20) DEFAULT NULL,
        aceite_termos tinyint(1) DEFAULT 0,
        email_verificado tinyint(1) DEFAULT 0,
        telefone_verificado tinyint(1) DEFAULT 0,
        ultimo_login datetime DEFAULT NULL,
        tentativas_login int(11) DEFAULT 0,
        bloqueado_ate datetime DEFAULT NULL,
        password_reset_token varchar(255) DEFAULT NULL,
        password_reset_expires datetime DEFAULT NULL,
        email_verification_token varchar(255) DEFAULT NULL,
        created_at timestamp NULL DEFAULT current_timestamp(),
        updated_at timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        UNIQUE KEY username (username),
        UNIQUE KEY email (email),
        UNIQUE KEY codigo_indicacao (codigo_indicacao),
        KEY idx_username (username),
        KEY idx_email (email),
        KEY idx_cpf (cpf),
        KEY idx_cnpj (cnpj),
        KEY idx_status (status),
        KEY idx_tipoplano (tipoplano),
        KEY idx_indicador (indicador_id),
        KEY idx_codigo_indicacao (codigo_indicacao),
        CONSTRAINT users_ibfk_1 FOREIGN KEY (indicador_id) REFERENCES users (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    try {
        $result = $db->exec($sql);
        
        // Incluir as outras migrações relacionadas
        require_once __DIR__ . '/update_users_table_complete.php';
        
        updateUsersTableComplete($db);
        createUserProfilesTable($db);
        createUserAuditTable($db);
        
        echo "✅ Sistema completo de usuários criado com sucesso!\n";
        return true;
        
    } catch (Exception $e) {
        echo "❌ Erro ao criar sistema de usuários: " . $e->getMessage() . "\n";
        return false;
    }
}

function dropUsersTable($db) {
    try {
        // Remover tabelas relacionadas primeiro devido às foreign keys
        $tables = ['user_audit', 'user_profiles', 'users'];
        
        foreach ($tables as $table) {
            $sql = "DROP TABLE IF EXISTS $table";
            $db->exec($sql);
            echo "✓ Tabela $table removida\n";
        }
        
        return true;
        
    } catch (Exception $e) {
        echo "❌ Erro ao remover tabelas: " . $e->getMessage() . "\n";
        return false;
    }
}
