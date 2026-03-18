
<?php
// src/migrations/update_user_sessions_table.php

function updateUserSessionsTable($db) {
    try {
        error_log("MIGRATION: Atualizando estrutura da tabela user_sessions");
        
        // Verificar se as colunas necessárias existem
        $checkColumns = $db->query("DESCRIBE user_sessions");
        $existingColumns = [];
        
        while ($row = $checkColumns->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[] = $row['Field'];
        }
        
        // Adicionar colunas que estão faltando
        $columnsToAdd = [
            'refresh_token' => "ADD COLUMN refresh_token VARCHAR(255) UNIQUE DEFAULT NULL",
            'device_info' => "ADD COLUMN device_info JSON DEFAULT NULL",
            'location_info' => "ADD COLUMN location_info JSON DEFAULT NULL", 
            'status' => "ADD COLUMN status ENUM('ativa', 'expirada', 'revogada') DEFAULT 'ativa'",
            'updated_at' => "ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ];
        
        foreach ($columnsToAdd as $column => $sql) {
            if (!in_array($column, $existingColumns)) {
                $db->exec("ALTER TABLE user_sessions $sql");
                error_log("MIGRATION: Coluna '$column' adicionada com sucesso");
            }
        }
        
        // Atualizar colunas existentes se necessário
        if (in_array('is_active', $existingColumns)) {
            // Migrar dados de is_active para status
            $db->exec("UPDATE user_sessions SET status = CASE WHEN is_active = 1 THEN 'ativa' ELSE 'expirada' END");
            // Remover coluna is_active após migração
            $db->exec("ALTER TABLE user_sessions DROP COLUMN is_active");
            error_log("MIGRATION: Coluna 'is_active' migrada para 'status' e removida");
        }
        
        // Adicionar índices se não existirem
        try {
            $db->exec("ALTER TABLE user_sessions ADD INDEX idx_refresh_token (refresh_token)");
        } catch (Exception $e) {
            // Índice já existe
        }
        
        try {
            $db->exec("ALTER TABLE user_sessions ADD INDEX idx_status (status)");
        } catch (Exception $e) {
            // Índice já existe
        }
        
        error_log("MIGRATION: Tabela user_sessions atualizada com sucesso");
        return true;
        
    } catch (Exception $e) {
        error_log("MIGRATION ERROR: " . $e->getMessage());
        return false;
    }
}
