<?php
// src/migrations/migrate_referral_system.php

require_once __DIR__ . '/create_system_config_table.php';
require_once __DIR__ . '/create_referral_commissions_table.php';
require_once __DIR__ . '/create_indicacoes_table.php';

function migrateReferralSystem($db) {
    echo "🚀 Executando migração do sistema de indicações...\n";
    
    try {
        $db->beginTransaction();
        
        // 1. Criar/atualizar tabela system_config
        echo "1. Criando tabela system_config...\n";
        createSystemConfigTable($db);
        seedSystemConfigData($db);
        echo "✅ Tabela system_config criada e populada\n";
        
        // 2. Criar tabela referral_commissions
        echo "2. Criando tabela referral_commissions...\n";
        createReferralCommissionsTable($db);
        echo "✅ Tabela referral_commissions criada\n";
        
        // 3. Atualizar tabela indicacoes com novos campos
        echo "3. Atualizando tabela indicacoes...\n";
        updateIndicacoesTable($db);
        echo "✅ Tabela indicacoes atualizada\n";
        
        $db->commit();
        echo "\n🎉 Migração do sistema de indicações concluída com sucesso!\n";
        
        return true;
        
    } catch (Exception $e) {
        $db->rollback();
        echo "\n❌ Erro na migração: " . $e->getMessage() . "\n";
        return false;
    }
}

function updateIndicacoesTable($db) {
    // Adicionar novos campos se não existirem
    $fields = [
        'commission_percentage' => 'ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 5.0 AFTER bonus_indicado',
        'first_login_bonus_processed' => 'ADD COLUMN first_login_bonus_processed BOOLEAN DEFAULT FALSE AFTER status',
        'first_login_at' => 'ADD COLUMN first_login_at DATETIME DEFAULT NULL AFTER first_login_bonus_processed',
        'updated_at' => 'ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER first_login_at'
    ];
    
    foreach ($fields as $fieldName => $alterStatement) {
        try {
            // Verificar se a coluna já existe
            $checkQuery = "SHOW COLUMNS FROM indicacoes LIKE '{$fieldName}'";
            $result = $db->query($checkQuery);
            
            if ($result->rowCount() == 0) {
                // A coluna não existe, então adicionar
                $alterQuery = "ALTER TABLE indicacoes {$alterStatement}";
                $db->exec($alterQuery);
                echo "   - Campo '{$fieldName}' adicionado\n";
            } else {
                echo "   - Campo '{$fieldName}' já existe\n";
            }
        } catch (Exception $e) {
            // Log do erro mas continua a migração
            echo "   - Erro ao adicionar campo '{$fieldName}': " . $e->getMessage() . "\n";
        }
    }
    
    // Atualizar registros existentes para definir commission_percentage se for NULL
    try {
        $updateQuery = "UPDATE indicacoes SET commission_percentage = 5.0 WHERE commission_percentage IS NULL";
        $db->exec($updateQuery);
        echo "   - Percentuais de comissão atualizados para registros existentes\n";
    } catch (Exception $e) {
        echo "   - Erro ao atualizar percentuais: " . $e->getMessage() . "\n";
    }
}

// Execução direta se chamado via CLI
if (php_sapi_name() === 'cli' && isset($argv[0]) && basename($argv[0]) === 'migrate_referral_system.php') {
    require_once __DIR__ . '/../../config/database.php';
    
    try {
        $db = getDBConnection();
        migrateReferralSystem($db);
    } catch (Exception $e) {
        echo "Erro de conexão: " . $e->getMessage() . "\n";
        exit(1);
    }
}