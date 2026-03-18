<?php
// Script completo para corrigir o sistema de indicação
echo "🔧 CORRIGINDO SISTEMA DE INDICAÇÃO\n";
echo "=================================\n\n";

require_once __DIR__ . '/src/config/database.php';

try {
    $db = getDBConnection();
    echo "✅ Conexão estabelecida\n\n";
    
    $db->beginTransaction();
    
    // 1. CRIAR TABELA SYSTEM_CONFIG
    echo "📋 PASSO 1: Criando tabela system_config\n";
    $systemConfigSql = "
    CREATE TABLE IF NOT EXISTS system_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT NOT NULL,
        config_description TEXT DEFAULT NULL,
        data_type ENUM('string', 'integer', 'decimal', 'boolean', 'json') DEFAULT 'string',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_config_key (config_key),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($systemConfigSql);
    echo "✅ Tabela system_config criada\n";
    
    // 2. CRIAR TABELA USER_WALLETS
    echo "📋 PASSO 2: Criando tabela user_wallets\n";
    $userWalletsSql = "
    CREATE TABLE IF NOT EXISTS user_wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wallet_type ENUM('main', 'plan', 'bonus', 'referral') DEFAULT 'plan',
        current_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        available_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        frozen_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_deposited DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_withdrawn DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        total_spent DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'BRL',
        status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
        last_transaction_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        UNIQUE KEY unique_user_wallet (user_id, wallet_type),
        INDEX idx_user_id (user_id),
        INDEX idx_wallet_type (wallet_type),
        INDEX idx_status (status),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($userWalletsSql);
    echo "✅ Tabela user_wallets criada\n";
    
    // 3. CRIAR TABELA WALLET_TRANSACTIONS
    echo "📋 PASSO 3: Criando tabela wallet_transactions\n";
    $walletTransactionsSql = "
    CREATE TABLE IF NOT EXISTS wallet_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        wallet_id INT DEFAULT NULL,
        wallet_type ENUM('main', 'plan', 'bonus', 'referral') DEFAULT 'plan',
        type ENUM('recarga', 'bonus', 'indicacao', 'plano', 'consulta', 'saque', 'entrada', 'saida', 'transferencia', 'bonus_referral', 'welcome_bonus') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        balance_before DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        balance_after DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        description TEXT,
        reference_type VARCHAR(50) DEFAULT NULL,
        reference_id INT DEFAULT NULL,
        payment_method VARCHAR(50) DEFAULT NULL,
        external_transaction_id VARCHAR(255) DEFAULT NULL,
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'completed',
        metadata JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_wallet_type (wallet_type),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_reference (reference_type, reference_id),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($walletTransactionsSql);
    echo "✅ Tabela wallet_transactions criada\n";
    
    // 4. CRIAR/ATUALIZAR TABELA INDICACOES
    echo "📋 PASSO 4: Criando/atualizando tabela indicacoes\n";
    $indicacoesSql = "
    CREATE TABLE IF NOT EXISTS indicacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        indicador_id INT NOT NULL,
        indicado_id INT NOT NULL,
        codigo VARCHAR(20) NOT NULL,
        status ENUM('ativo', 'inativo', 'processado', 'confirmada') DEFAULT 'ativo',
        bonus_indicador DECIMAL(10,2) DEFAULT 5.00,
        bonus_indicado DECIMAL(10,2) DEFAULT 5.00,
        comissao DECIMAL(10,2) DEFAULT 5.00,
        commission_percentage DECIMAL(5,2) DEFAULT 5.0,
        first_login_bonus_processed BOOLEAN DEFAULT FALSE,
        first_login_at DATETIME DEFAULT NULL,
        data_conversao DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_indicador (indicador_id),
        INDEX idx_indicado (indicado_id),
        INDEX idx_codigo (codigo),
        INDEX idx_status (status),
        INDEX idx_processed (first_login_bonus_processed),
        
        FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (indicado_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_referral (indicador_id, indicado_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    $db->exec($indicacoesSql);
    echo "✅ Tabela indicacoes criada/atualizada\n";
    
    // 5. INSERIR CONFIGURAÇÕES DO SISTEMA
    echo "📋 PASSO 5: Inserindo configurações\n";
    $configs = [
        ['referral_system_enabled', 'true', 'Ativar/desativar sistema de indicações', 'boolean'],
        ['referral_bonus_enabled', 'true', 'Ativar/desativar bônus de indicação', 'boolean'],
        ['referral_commission_enabled', 'true', 'Ativar/desativar comissões', 'boolean'],
        ['referral_bonus_amount', '5.00', 'Valor do bônus de indicação', 'decimal'],
        ['referral_commission_percentage', '5.0', 'Percentual de comissão', 'decimal']
    ];
    
    foreach ($configs as $config) {
        $checkQuery = "SELECT id FROM system_config WHERE config_key = ?";
        $stmt = $db->prepare($checkQuery);
        $stmt->execute([$config[0]]);
        
        if (!$stmt->fetch()) {
            $insertQuery = "INSERT INTO system_config (config_key, config_value, config_description, data_type) VALUES (?, ?, ?, ?)";
            $stmt = $db->prepare($insertQuery);
            $stmt->execute($config);
            echo "✅ Configuração {$config[0]} inserida\n";
        } else {
            echo "ℹ️ Configuração {$config[0]} já existe\n";
        }
    }
    
    // 6. CRIAR CARTEIRAS PARA USUÁRIOS EXISTENTES
    echo "📋 PASSO 6: Criando carteiras para usuários existentes\n";
    $createWalletsSql = "
    INSERT IGNORE INTO user_wallets (user_id, wallet_type, current_balance, available_balance, created_at)
    SELECT 
        u.id,
        'plan',
        COALESCE(u.saldo_plano, 0),
        COALESCE(u.saldo_plano, 0),
        u.created_at
    FROM users u
    WHERE u.status = 'ativo'
    ";
    $walletsCreated = $db->exec($createWalletsSql);
    echo "✅ {$walletsCreated} carteiras criadas\n";
    
    // 7. CRIAR PROCEDURE PARA PROCESSAR BÔNUS
    echo "📋 PASSO 7: Criando procedure\n";
    $procedureSql = "
    DROP PROCEDURE IF EXISTS ProcessarBonusIndicacao;
    
    CREATE PROCEDURE ProcessarBonusIndicacao(
        IN p_indicador_id INT,
        IN p_indicado_id INT,
        IN p_codigo VARCHAR(20)
    )
    BEGIN
        DECLARE v_bonus_amount DECIMAL(10,2) DEFAULT 5.00;
        DECLARE v_indicacao_id INT;
        DECLARE v_referrer_wallet_id INT;
        DECLARE v_referred_wallet_id INT;
        DECLARE v_referrer_old_balance DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_referred_old_balance DECIMAL(10,2) DEFAULT 0.00;
        DECLARE v_referrer_new_balance DECIMAL(10,2);
        DECLARE v_referred_new_balance DECIMAL(10,2);
        
        DECLARE EXIT HANDLER FOR SQLEXCEPTION
        BEGIN
            ROLLBACK;
            SELECT 'error' as status, 'Erro interno na procedure' as message, 0 as bonus_amount, 0 as indicacao_id;
        END;
        
        START TRANSACTION;
        
        -- Buscar valor do bônus
        SELECT COALESCE(config_value, '5.00') INTO v_bonus_amount 
        FROM system_config 
        WHERE config_key = 'referral_bonus_amount' 
        LIMIT 1;
        
        -- Inserir indicação
        INSERT INTO indicacoes (
            indicador_id, indicado_id, codigo, status, 
            bonus_indicador, bonus_indicado, comissao,
            first_login_bonus_processed, data_conversao,
            created_at, updated_at
        ) VALUES (
            p_indicador_id, p_indicado_id, p_codigo, 'confirmada',
            v_bonus_amount, v_bonus_amount, v_bonus_amount,
            1, NOW(), NOW(), NOW()
        );
        
        SET v_indicacao_id = LAST_INSERT_ID();
        
        -- Obter/criar carteira do indicador
        INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance)
        VALUES (p_indicador_id, 'plan', 0.00, 0.00)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);
        SET v_referrer_wallet_id = LAST_INSERT_ID();
        
        -- Obter/criar carteira do indicado
        INSERT INTO user_wallets (user_id, wallet_type, current_balance, available_balance)
        VALUES (p_indicado_id, 'plan', 0.00, 0.00)
        ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);
        SET v_referred_wallet_id = LAST_INSERT_ID();
        
        -- Obter saldos atuais
        SELECT current_balance INTO v_referrer_old_balance 
        FROM user_wallets WHERE id = v_referrer_wallet_id;
        
        SELECT current_balance INTO v_referred_old_balance 
        FROM user_wallets WHERE id = v_referred_wallet_id;
        
        -- Calcular novos saldos
        SET v_referrer_new_balance = v_referrer_old_balance + v_bonus_amount;
        SET v_referred_new_balance = v_referred_old_balance + v_bonus_amount;
        
        -- Atualizar carteiras
        UPDATE user_wallets SET 
            current_balance = v_referrer_new_balance,
            available_balance = v_referrer_new_balance,
            total_deposited = total_deposited + v_bonus_amount,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE id = v_referrer_wallet_id;
        
        UPDATE user_wallets SET 
            current_balance = v_referred_new_balance,
            available_balance = v_referred_new_balance,
            total_deposited = total_deposited + v_bonus_amount,
            last_transaction_at = NOW(),
            updated_at = NOW()
        WHERE id = v_referred_wallet_id;
        
        -- Criar transações
        INSERT INTO wallet_transactions (
            user_id, wallet_id, wallet_type, type, amount,
            balance_before, balance_after, description,
            reference_type, reference_id, status, created_at, updated_at
        ) VALUES (
            p_indicador_id, v_referrer_wallet_id, 'plan', 'bonus_referral', v_bonus_amount,
            v_referrer_old_balance, v_referrer_new_balance,
            'Bônus por indicar novo usuário',
            'indicacao', v_indicacao_id, 'completed', NOW(), NOW()
        );
        
        INSERT INTO wallet_transactions (
            user_id, wallet_id, wallet_type, type, amount,
            balance_before, balance_after, description,
            reference_type, reference_id, status, created_at, updated_at
        ) VALUES (
            p_indicado_id, v_referred_wallet_id, 'plan', 'welcome_bonus', v_bonus_amount,
            v_referred_old_balance, v_referred_new_balance,
            'Bônus de boas-vindas por indicação',
            'indicacao', v_indicacao_id, 'completed', NOW(), NOW()
        );
        
        -- Sincronizar com tabela users
        UPDATE users SET saldo_plano = v_referrer_new_balance WHERE id = p_indicador_id;
        UPDATE users SET saldo_plano = v_referred_new_balance WHERE id = p_indicado_id;
        
        COMMIT;
        
        SELECT 'success' as status, 'Bônus processado com sucesso' as message, v_bonus_amount as bonus_amount, v_indicacao_id as indicacao_id;
    END
    ";
    
    $db->exec($procedureSql);
    echo "✅ Procedure ProcessarBonusIndicacao criada\n";
    
    $db->commit();
    
    // 8. VERIFICAR ESTATÍSTICAS FINAIS
    echo "\n📊 VERIFICAÇÃO FINAL:\n";
    $tables = ['system_config', 'user_wallets', 'wallet_transactions', 'indicacoes'];
    
    foreach ($tables as $table) {
        $countQuery = "SELECT COUNT(*) as count FROM {$table}";
        $stmt = $db->prepare($countQuery);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "• {$table}: {$result['count']} registros\n";
    }
    
    echo "\n🎉 SISTEMA DE INDICAÇÃO CORRIGIDO COM SUCESSO!\n";
    echo "===============================================\n";
    echo "✅ Todas as tabelas criadas e configuradas\n";
    echo "✅ Procedure de processamento criada\n";
    echo "✅ Configurações inseridas\n";
    echo "✅ Carteiras migradas\n\n";
    echo "🔍 PRÓXIMOS TESTES:\n";
    echo "1. Teste validação de código de indicação\n";
    echo "2. Teste cadastro com código\n";
    echo "3. Verifique se bônus são creditados\n";
    echo "4. Confirme transações no histórico\n\n";
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollback();
    }
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}