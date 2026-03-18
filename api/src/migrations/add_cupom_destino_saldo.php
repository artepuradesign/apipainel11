<?php
// src/migrations/add_cupom_destino_saldo.php
// Migração para adicionar coluna destino_saldo na tabela cupons

require_once __DIR__ . '/../../config/conexao.php';

function addCupomDestinoSaldo($db) {
    try {
        error_log("MIGRATION: Adicionando coluna destino_saldo na tabela cupons");
        
        // Verificar se a coluna já existe
        $checkQuery = "SHOW COLUMNS FROM cupons LIKE 'destino_saldo'";
        $stmt = $db->query($checkQuery);
        $columnExists = $stmt->fetch();
        
        if ($columnExists) {
            error_log("MIGRATION: Coluna destino_saldo já existe");
            return true;
        }
        
        // Adicionar coluna destino_saldo após valor
        $alterQuery = "
            ALTER TABLE cupons 
            ADD COLUMN destino_saldo enum('plano','carteira') NOT NULL DEFAULT 'plano' 
            COMMENT 'Destino do valor do cupom fixo' 
            AFTER valor
        ";
        
        $db->exec($alterQuery);
        error_log("MIGRATION: Coluna destino_saldo adicionada com sucesso");
        
        return true;
        
    } catch (Exception $e) {
        error_log("MIGRATION ERROR: " . $e->getMessage());
        return false;
    }
}

// Executar se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    $db = getDBConnection();
    
    if ($db) {
        if (addCupomDestinoSaldo($db)) {
            echo "✅ Coluna destino_saldo adicionada com sucesso!\n";
        } else {
            echo "❌ Erro ao adicionar coluna destino_saldo!\n";
        }
    } else {
        echo "❌ Erro na conexão com o banco!\n";
    }
}
?>
