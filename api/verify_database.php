
<?php
// verify_database.php - Script para verificar a integridade dos dados

require_once __DIR__ . '/config/conexao.php';

try {
    // Usar pool de conexão
    $db = getDBConnection();
    
    echo "🔍 Verificando integridade do banco de dados...\n\n";
    
    // Verificar estrutura das tabelas principais
    $tables = [
        'users', 'plans', 'modules', 'panels', 'user_wallets', 
        'user_profiles', 'pix_keys', 'indicacoes', 'consultations',
        'wallet_transactions', 'notifications', 'support_tickets',
        'system_config', 'user_subscriptions'
    ];
    
    $tableStats = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $db->query("SELECT COUNT(*) as count FROM {$table}");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $tableStats[$table] = $result['count'];
            
            echo "✅ {$table}: {$result['count']} registros\n";
        } catch (Exception $e) {
            echo "❌ {$table}: ERRO - " . $e->getMessage() . "\n";
            $tableStats[$table] = 0;
        }
    }
    
    echo "\n📊 Análise detalhada:\n";
    
    // Verificar usuários por role
    echo "\n👥 Usuários por função:\n";
    $stmt = $db->query("SELECT user_role, COUNT(*) as count FROM users GROUP BY user_role ORDER BY count DESC");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "   - {$row['user_role']}: {$row['count']} usuários\n";
    }
    
    // Verificar usuários por status
    echo "\n📈 Usuários por status:\n";
    $stmt = $db->query("SELECT status, COUNT(*) as count FROM users GROUP BY status ORDER BY count DESC");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "   - {$row['status']}: {$row['count']} usuários\n";
    }
    
    // Verificar saldos
    echo "\n💰 Análise de saldos:\n";
    $stmt = $db->query("
        SELECT 
            COUNT(*) as total_users,
            SUM(saldo) as total_balance,
            AVG(saldo) as avg_balance,
            MAX(saldo) as max_balance,
            MIN(saldo) as min_balance
        FROM users 
        WHERE status = 'ativo'
    ");
    $balanceStats = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "   - Total de usuários ativos: {$balanceStats['total_users']}\n";
    echo "   - Saldo total: R$ " . number_format($balanceStats['total_balance'], 2, ',', '.') . "\n";
    echo "   - Saldo médio: R$ " . number_format($balanceStats['avg_balance'], 2, ',', '.') . "\n";
    echo "   - Maior saldo: R$ " . number_format($balanceStats['max_balance'], 2, ',', '.') . "\n";
    echo "   - Menor saldo: R$ " . number_format($balanceStats['min_balance'], 2, ',', '.') . "\n";
    
    // Verificar planos ativos
    echo "\n📋 Planos de usuários:\n";
    $stmt = $db->query("SELECT tipoplano, COUNT(*) as count FROM users GROUP BY tipoplano ORDER BY count DESC");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "   - {$row['tipoplano']}: {$row['count']} usuários\n";
    }
    
    // Verificar consultas por tipo
    if ($tableStats['consultations'] > 0) {
        echo "\n🔍 Consultas por tipo:\n";
        $stmt = $db->query("SELECT type, COUNT(*) as count FROM consultations GROUP BY type ORDER BY count DESC");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "   - {$row['type']}: {$row['count']} consultas\n";
        }
    }
    
    // Verificar integridade referencial
    echo "\n🔗 Verificação de integridade referencial:\n";
    
    // Usuários com wallets
    $stmt = $db->query("
        SELECT COUNT(*) as users_without_wallets 
        FROM users u 
        LEFT JOIN user_wallets uw ON u.id = uw.user_id 
        WHERE uw.user_id IS NULL AND u.status = 'ativo'
    ");
    $usersWithoutWallets = $stmt->fetch(PDO::FETCH_ASSOC)['users_without_wallets'];
    
    if ($usersWithoutWallets > 0) {
        echo "   ⚠️  {$usersWithoutWallets} usuários ativos sem carteira\n";
    } else {
        echo "   ✅ Todos os usuários ativos têm carteiras\n";
    }
    
    // Indicações válidas
    $stmt = $db->query("
        SELECT COUNT(*) as invalid_referrals 
        FROM indicacoes i 
        LEFT JOIN users u1 ON i.indicador_id = u1.id 
        LEFT JOIN users u2 ON i.indicado_id = u2.id 
        WHERE u1.id IS NULL OR u2.id IS NULL
    ");
    $invalidReferrals = $stmt->fetch(PDO::FETCH_ASSOC)['invalid_referrals'];
    
    if ($invalidReferrals > 0) {
        echo "   ⚠️  {$invalidReferrals} indicações com referências inválidas\n";
    } else {
        echo "   ✅ Todas as indicações são válidas\n";
    }
    
    // Resumo final
    echo "\n📋 Resumo da verificação:\n";
    $totalTables = count($tables);
    $validTables = count(array_filter($tableStats, function($count) { return $count >= 0; }));
    $tablesWithData = count(array_filter($tableStats, function($count) { return $count > 0; }));
    
    echo "   - Tabelas verificadas: {$validTables}/{$totalTables}\n";
    echo "   - Tabelas com dados: {$tablesWithData}/{$totalTables}\n";
    echo "   - Total de registros: " . array_sum($tableStats) . "\n";
    
    if ($validTables == $totalTables && $tablesWithData >= ($totalTables * 0.8)) {
        echo "\n🎉 Banco de dados está íntegro e bem populado!\n";
    } else {
        echo "\n⚠️  Algumas inconsistências foram encontradas. Revise os dados.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erro na verificação: " . $e->getMessage() . "\n";
}
?>
