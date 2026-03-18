<?php
// src/migrations/create_cupons_table.php

function createCuponsTable($db) {
    try {
        error_log("MIGRATION: Criando tabela de cupons");
        
        // Criar tabela cupons
        $createCuponsTable = "
        CREATE TABLE IF NOT EXISTS cupons (
            id int(11) NOT NULL AUTO_INCREMENT,
            codigo varchar(50) NOT NULL UNIQUE,
            descricao text,
            tipo enum('fixo','percentual') NOT NULL DEFAULT 'fixo',
            valor decimal(10,2) NOT NULL,
            destino_saldo enum('plano','carteira') NOT NULL DEFAULT 'plano' COMMENT 'Destino do valor do cupom fixo',
            status enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
            uso_limite int(11) DEFAULT NULL,
            uso_atual int(11) NOT NULL DEFAULT 0,
            valido_ate datetime DEFAULT NULL,
            user_ids TEXT DEFAULT NULL COMMENT 'JSON array de IDs de usuários permitidos (NULL = todos)',
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_codigo (codigo),
            KEY idx_status (status),
            KEY idx_valido_ate (valido_ate)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($createCuponsTable);
        error_log("MIGRATION: Tabela cupons criada com sucesso");
        
        // Criar tabela cupom_uso
        $createCupomUsoTable = "
        CREATE TABLE IF NOT EXISTS cupom_uso (
            id int(11) NOT NULL AUTO_INCREMENT,
            cupom_id int(11) NOT NULL,
            user_id int(11) NOT NULL,
            valor_desconto decimal(10,2) NOT NULL,
            tipo_uso enum('bonus','desconto') NOT NULL DEFAULT 'bonus',
            used_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY idx_cupom_id (cupom_id),
            KEY idx_user_id (user_id),
            KEY idx_used_at (used_at),
            KEY idx_tipo_uso (tipo_uso),
            UNIQUE KEY unique_cupom_user (cupom_id, user_id),
            FOREIGN KEY (cupom_id) REFERENCES cupons(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($createCupomUsoTable);
        error_log("MIGRATION: Tabela cupom_uso criada com sucesso");
        
        // Cupons de exemplo removidos conforme solicitado
        
        return true;
        
    } catch (Exception $e) {
        error_log("MIGRATION ERROR: " . $e->getMessage());
        return false;
    }
}

// Executar se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    require_once __DIR__ . '/../../config/conexao.php';
    
    // Usar pool de conexão
    $db = getDBConnection();
    
    if ($db) {
        if (createCuponsTable($db)) {
            echo "✅ Tabelas de cupons criadas com sucesso!\n";
        } else {
            echo "❌ Erro ao criar tabelas de cupons!\n";
        }
    } else {
        echo "❌ Erro na conexão com o banco!\n";
    }
}
?>