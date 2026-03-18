<?php
// src/migrations/update_notifications_table.php

require_once __DIR__ . '/../config/database.php';

function updateNotificationsTable($db) {
    try {
        error_log("MIGRATION: Atualizando tabela notifications...");
        
        // Verificar se as colunas já existem
        $checkColumns = "SHOW COLUMNS FROM notifications";
        $stmt = $db->prepare($checkColumns);
        $stmt->execute();
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $columnsToAdd = [];
        
        if (!in_array('title', $columns)) {
            $columnsToAdd[] = "ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT ''";
        }
        
        if (!in_array('action_url', $columns)) {
            $columnsToAdd[] = "ADD COLUMN action_url VARCHAR(500) DEFAULT NULL";
        }
        
        if (!in_array('action_text', $columns)) {
            $columnsToAdd[] = "ADD COLUMN action_text VARCHAR(100) DEFAULT NULL";
        }
        
        if (!in_array('priority', $columns)) {
            $columnsToAdd[] = "ADD COLUMN priority ENUM('low','medium','high','critical') DEFAULT 'medium'";
        }
        
        if (!in_array('read_at', $columns)) {
            $columnsToAdd[] = "ADD COLUMN read_at TIMESTAMP NULL DEFAULT NULL";
        }
        
        if (!in_array('updated_at', $columns)) {
            $columnsToAdd[] = "ADD COLUMN updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
        }
        
        // Executar alterações se necessário
        if (!empty($columnsToAdd)) {
            $alterQuery = "ALTER TABLE notifications " . implode(', ', $columnsToAdd);
            error_log("MIGRATION: Executando: " . $alterQuery);
            $db->exec($alterQuery);
            error_log("MIGRATION: Colunas adicionadas com sucesso");
        } else {
            error_log("MIGRATION: Tabela notifications já está atualizada");
        }
        
        // Verificar se precisa atualizar o tipo de message para TEXT se ainda for VARCHAR
        $messageColumn = "SHOW COLUMNS FROM notifications LIKE 'message'";
        $stmt = $db->prepare($messageColumn);
        $stmt->execute();
        $messageInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($messageInfo && strpos($messageInfo['Type'], 'varchar') !== false) {
            error_log("MIGRATION: Alterando coluna message para TEXT");
            $db->exec("ALTER TABLE notifications MODIFY COLUMN message TEXT NOT NULL");
        }
        
        // Adicionar índices se não existirem
        $indexes = [
            "idx_user_read" => "CREATE INDEX idx_user_read ON notifications (user_id, is_read)",
            "idx_type" => "CREATE INDEX idx_type ON notifications (type)",
            "idx_priority" => "CREATE INDEX idx_priority ON notifications (priority)",
            "idx_created_at" => "CREATE INDEX idx_created_at ON notifications (created_at DESC)"
        ];
        
        foreach ($indexes as $indexName => $indexQuery) {
            try {
                $db->exec($indexQuery);
                error_log("MIGRATION: Índice {$indexName} criado");
            } catch (PDOException $e) {
                if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                    error_log("MIGRATION: Índice {$indexName} já existe");
                } else {
                    error_log("MIGRATION ERROR: Erro ao criar índice {$indexName}: " . $e->getMessage());
                }
            }
        }
        
        error_log("MIGRATION: Tabela notifications atualizada com sucesso");
        return true;
        
    } catch (Exception $e) {
        error_log("MIGRATION ERROR: Erro ao atualizar tabela notifications: " . $e->getMessage());
        return false;
    }
}

// Executar se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    try {
        $db = getDBConnection();
        if (updateNotificationsTable($db)) {
            echo "✅ Migração da tabela notifications concluída com sucesso\n";
        } else {
            echo "❌ Erro na migração da tabela notifications\n";
        }
    } catch (Exception $e) {
        echo "❌ Erro: " . $e->getMessage() . "\n";
    }
}