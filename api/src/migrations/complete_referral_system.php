
<?php
// src/migrations/complete_referral_system.php

function completeReferralSystem($db) {
    try {
        echo "🔧 Completando sistema de indicações...\n";
        
        // 1. Garantir que a configuração de bônus existe
        $configCheck = "SELECT id FROM system_config WHERE config_key = 'referral_bonus_amount'";
        $configStmt = $db->prepare($configCheck);
        $configStmt->execute();
        
        if (!$configStmt->fetch()) {
            $configInsert = "INSERT INTO system_config (config_key, config_value, config_type, category, description, is_public, created_at) 
                            VALUES ('referral_bonus_amount', '5.00', 'number', 'referral', 'Valor do bônus de indicação em reais', 0, NOW())";
            $db->exec($configInsert);
            echo "✅ Configuração de bônus criada: R$ 5,00\n";
        } else {
            echo "✅ Configuração de bônus já existe\n";
        }
        
        // 2. Criar carteiras para usuários que não têm
        $createWalletsQuery = "INSERT IGNORE INTO user_wallets (user_id, wallet_type, current_balance, available_balance, status, created_at, updated_at)
                              SELECT u.id, 'plan', COALESCE(u.saldo_plano, 0.00), COALESCE(u.saldo_plano, 0.00), 'active', NOW(), NOW()
                              FROM users u
                              WHERE u.status = 'ativo'
                              AND NOT EXISTS (SELECT 1 FROM user_wallets uw WHERE uw.user_id = u.id AND uw.wallet_type = 'plan')";
        
        $walletsResult = $db->exec($createWalletsQuery);
        echo "✅ {$walletsResult} carteiras criadas para usuários\n";
        
        // 3. Verificar se há usuários com indicador_id que não estão na tabela indicacoes
        $checkMigrationQuery = "SELECT COUNT(*) as count FROM users u
                               WHERE u.indicador_id IS NOT NULL 
                               AND u.indicador_id != 0
                               AND NOT EXISTS (
                                   SELECT 1 FROM indicacoes i 
                                   WHERE i.indicador_id = u.indicador_id 
                                   AND i.indicado_id = u.id
                               )";
        
        $checkStmt = $db->prepare($checkMigrationQuery);
        $checkStmt->execute();
        $pendingMigration = $checkStmt->fetchColumn();
        
        echo "📊 {$pendingMigration} registros precisam ser migrados\n";
        
        // 4. Criar procedure para migração automática
        $procedureSQL = "
        DROP PROCEDURE IF EXISTS ProcessReferralMigration;
        
        DELIMITER $$
        CREATE PROCEDURE ProcessReferralMigration()
        BEGIN
            DECLARE done INT DEFAULT FALSE;
            DECLARE v_indicado_id, v_indicador_id INT;
            DECLARE v_codigo_usado VARCHAR(20);
            DECLARE v_created_at DATETIME;
            DECLARE v_bonus DECIMAL(10,2) DEFAULT 5.00;
            
            DECLARE migration_cursor CURSOR FOR
                SELECT u.id, u.indicador_id, u.codigo_usado_indicacao, u.created_at
                FROM users u
                WHERE u.indicador_id IS NOT NULL 
                AND u.indicador_id != 0
                AND NOT EXISTS (
                    SELECT 1 FROM indicacoes i 
                    WHERE i.indicador_id = u.indicador_id 
                    AND i.indicado_id = u.id
                );
            
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
            
            OPEN migration_cursor;
            
            migration_loop: LOOP
                FETCH migration_cursor INTO v_indicado_id, v_indicador_id, v_codigo_usado, v_created_at;
                
                IF done THEN
                    LEAVE migration_loop;
                END IF;
                
                -- Inserir na tabela indicacoes
                INSERT IGNORE INTO indicacoes (
                    indicador_id, indicado_id, codigo_usado, bonus_indicador, 
                    bonus_indicado, status, bonus_paid, bonus_paid_at, created_at, updated_at
                ) VALUES (
                    v_indicador_id, v_indicado_id, COALESCE(v_codigo_usado, 'MIGRATED'), 
                    v_bonus, v_bonus, 'ativo', 1, v_created_at, v_created_at, NOW()
                );
                
            END LOOP;
            
            CLOSE migration_cursor;
            
            SELECT ROW_COUNT() as migrated_records;
        END$$
        DELIMITER ;
        ";
        
        $db->exec($procedureSQL);
        echo "✅ Procedure de migração criada\n";
        
        return true;
        
    } catch (Exception $e) {
        echo "❌ ERRO: " . $e->getMessage() . "\n";
        return false;
    }
}

// Execução direta se chamado via CLI
if (php_sapi_name() === 'cli' && isset($argv[0]) && basename($argv[0]) === 'complete_referral_system.php') {
    require_once __DIR__ . '/../config/database.php';
    
    try {
        $db = getDBConnection();
        if (completeReferralSystem($db)) {
            echo "\n🎉 Sistema de indicações completado com sucesso!\n";
        }
    } catch (Exception $e) {
        echo "\n❌ Erro: " . $e->getMessage() . "\n";
        exit(1);
    }
}
