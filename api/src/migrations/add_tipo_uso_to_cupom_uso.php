<?php
// src/migrations/add_tipo_uso_to_cupom_uso.php

function addTipoUsoColumn($db) {
    try {
        error_log("MIGRATION: Adicionando coluna tipo_uso à tabela cupom_uso");
        
        // Verificar se a coluna já existe
        $checkColumnQuery = "SHOW COLUMNS FROM cupom_uso LIKE 'tipo_uso'";
        $stmt = $db->prepare($checkColumnQuery);
        $stmt->execute();
        $columnExists = $stmt->fetch();
        
        if (!$columnExists) {
            // Adicionar coluna tipo_uso
            $addColumnQuery = "ALTER TABLE cupom_uso ADD COLUMN tipo_uso enum('bonus','desconto') NOT NULL DEFAULT 'bonus' AFTER valor_desconto";
            $db->exec($addColumnQuery);
            error_log("MIGRATION: Coluna tipo_uso adicionada com sucesso");
            
            // Adicionar índice
            $addIndexQuery = "ALTER TABLE cupom_uso ADD KEY idx_tipo_uso (tipo_uso)";
            $db->exec($addIndexQuery);
            error_log("MIGRATION: Índice para tipo_uso adicionado");
        } else {
            error_log("MIGRATION: Coluna tipo_uso já existe, pulando migração");
        }
        
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
        if (addTipoUsoColumn($db)) {
            echo "✅ Migração executada com sucesso!\n";
        } else {
            echo "❌ Erro na migração!\n";
        }
    } else {
        echo "❌ Erro na conexão com o banco!\n";
    }
}
?>