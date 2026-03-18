<?php
// api/complete_referral_system.php - Script para completar sistema de indicações

echo "🚀 COMPLETANDO SISTEMA DE INDICAÇÕES\n";
echo "====================================\n\n";

require_once __DIR__ . '/src/config/database.php';
require_once __DIR__ . '/src/migrations/complete_wallet_system.php';
require_once __DIR__ . '/src/utils/WalletSystemMigrator.php';

try {
    $db = getDBConnection();
    echo "✅ Conexão com banco estabelecida\n\n";
    
    // Executar migração do sistema de carteira
    echo "📋 PASSO 1: Completando estrutura do banco de dados\n";
    echo "================================================\n";
    if (completeWalletSystem($db)) {
        echo "✅ Estrutura do banco completada\n\n";
    } else {
        throw new Exception("Falha na migração do sistema");
    }
    
    // Migrar dados existentes
    echo "📋 PASSO 2: Migrando dados existentes\n";
    echo "====================================\n";
    $migrator = new WalletSystemMigrator($db);
    
    echo "2.1. Criando carteiras para usuários existentes...\n";
    $walletsCreated = $migrator->migrateAllUsersWallets();
    
    echo "2.2. Criando transações de indicação faltantes...\n";
    $transactionsCreated = $migrator->createMissingReferralTransactions();
    
    echo "\n📋 PASSO 3: Verificando configuração do sistema\n";
    echo "==============================================\n";
    
    // Verificar configuração de bônus
    $configQuery = "SELECT config_key, config_value FROM system_config WHERE config_key = 'referral_bonus_amount'";
    $stmt = $db->prepare($configQuery);
    $stmt->execute();
    $config = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($config) {
        echo "✅ Configuração de bônus: R$ {$config['config_value']}\n";
    } else {
        echo "⚠️ Configuração de bônus não encontrada, criando...\n";
        $insertConfig = "INSERT INTO system_config (config_key, config_value, config_type, description, status) 
                        VALUES ('referral_bonus_amount', '5.00', 'decimal', 'Valor do bônus de indicação', 'active')";
        $db->exec($insertConfig);
        echo "✅ Configuração de bônus criada: R$ 5,00\n";
    }
    
    // Verificar estatísticas
    echo "\n📊 ESTATÍSTICAS DO SISTEMA:\n";
    echo "==========================\n";
    
    $statsQueries = [
        'Total de usuários' => "SELECT COUNT(*) as count FROM users WHERE status = 'ativo'",
        'Indicações ativas' => "SELECT COUNT(*) as count FROM indicacoes WHERE status = 'ativo'",
        'Bônus processados' => "SELECT COUNT(*) as count FROM indicacoes WHERE first_login_bonus_processed = 1",
        'Transações de indicação' => "SELECT COUNT(*) as count FROM wallet_transactions WHERE type = 'indicacao'",
        'Total em bônus pagos' => "SELECT SUM(amount) as total FROM wallet_transactions WHERE type = 'indicacao'"
    ];
    
    foreach ($statsQueries as $label => $query) {
        $stmt = $db->prepare($query);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($label === 'Total em bônus pagos') {
            $value = 'R$ ' . number_format($result['total'] ?? 0, 2, ',', '.');
        } else {
            $value = $result['count'] ?? $result['total'] ?? 0;
        }
        
        echo "• {$label}: {$value}\n";
    }
    
    echo "\n🎉 SISTEMA DE INDICAÇÕES COMPLETADO COM SUCESSO!\n";
    echo "==============================================\n";
    echo "✅ Estrutura do banco de dados atualizada\n";
    echo "✅ Carteiras de usuários migradas\n";
    echo "✅ Transações de indicação criadas\n";
    echo "✅ Configurações verificadas\n";
    echo "\n🔍 PRÓXIMOS PASSOS:\n";
    echo "1. Teste o cadastro com código de indicação\n";
    echo "2. Verifique se as transações aparecem no histórico\n";
    echo "3. Confirme se os saldos estão sendo creditados corretamente\n";
    echo "\n💡 ENDPOINTS PRINCIPAIS:\n";
    echo "• GET /api/wallet/transactions - Histórico de transações\n";
    echo "• GET /api/referrals - Dados de indicações\n";
    echo "• POST /auth/validate-referral - Validar código de indicação\n";
    
} catch (Exception $e) {
    echo "\n❌ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
    exit(1);
}