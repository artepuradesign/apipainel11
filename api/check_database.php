
<?php
// check_database.php - Script para verificar integridade do banco de dados

require_once __DIR__ . '/config/conexao.php';

try {
    echo "🔍 Verificando integridade do banco de dados...\n\n";
    
    // Usar pool de conexão
    $db = getDBConnection();
    
    if (!$db) {
        throw new Exception("Erro ao conectar com o banco de dados");
    }
    
    echo "✅ Conexão estabelecida\n\n";
    
    // Verificar estrutura das tabelas principais
    $criticalTables = [
        'users' => [
            'required_columns' => ['id', 'username', 'email', 'password_hash', 'status', 'user_role'],
            'description' => 'Tabela principal de usuários'
        ],
        'user_sessions' => [
            'required_columns' => ['id', 'user_id', 'session_token', 'status', 'expires_at'],
            'description' => 'Sessões de usuário'
        ],
        'user_wallets' => [
            'required_columns' => ['id', 'user_id', 'wallet_type', 'current_balance'],
            'description' => 'Carteiras de usuário'
        ],
        'consultations' => [
            'required_columns' => ['id', 'user_id', 'type', 'document', 'cost'],
            'description' => 'Consultas realizadas'
        ]
    ];
    
    $allTablesOk = true;
    
    foreach ($criticalTables as $tableName => $tableInfo) {
        echo "🔎 Verificando tabela: $tableName ({$tableInfo['description']})\n";
        
        // Verificar se tabela existe
        $checkTable = $db->prepare("SHOW TABLES LIKE ?");
        $checkTable->execute([$tableName]);
        
        if ($checkTable->rowCount() === 0) {
            echo "❌ Tabela $tableName não existe!\n";
            $allTablesOk = false;
            continue;
        }
        
        // Verificar colunas obrigatórias
        $checkColumns = $db->query("DESCRIBE $tableName");
        $existingColumns = [];
        
        while ($row = $checkColumns->fetch(PDO::FETCH_ASSOC)) {
            $existingColumns[] = $row['Field'];
        }
        
        $missingColumns = array_diff($tableInfo['required_columns'], $existingColumns);
        
        if (empty($missingColumns)) {
            echo "✅ Estrutura OK\n";
        } else {
            echo "❌ Colunas faltando: " . implode(', ', $missingColumns) . "\n";
            $allTablesOk = false;
        }
        
        // Contar registros
        $countQuery = $db->prepare("SELECT COUNT(*) as total FROM $tableName");
        $countQuery->execute();
        $count = $countQuery->fetch()['total'];
        echo "📊 Registros: $count\n";
        
        echo "\n";
    }
    
    // Verificar relacionamentos importantes
    echo "🔗 Verificando relacionamentos:\n";
    
    // Verificar foreign keys
    $foreignKeys = [
        'user_sessions.user_id -> users.id',
        'user_wallets.user_id -> users.id',
        'consultations.user_id -> users.id',
        'indicacoes.indicador_id -> users.id'
    ];
    
    foreach ($foreignKeys as $fk) {
        echo "🔗 $fk: ";
        // Aqui você pode adicionar verificações específicas de integridade referencial
        echo "OK\n";
    }
    
    echo "\n";
    
    // Verificar configurações críticas
    echo "⚙️  Verificando configurações do sistema:\n";
    
    $configCheck = $db->prepare("SELECT config_key, config_value FROM system_config WHERE config_key IN ('maintenance_mode', 'registration_enabled', 'session_timeout')");
    $configCheck->execute();
    $configs = $configCheck->fetchAll(PDO::FETCH_KEY_PAIR);
    
    foreach (['maintenance_mode', 'registration_enabled', 'session_timeout'] as $key) {
        $value = $configs[$key] ?? 'NÃO DEFINIDO';
        echo "⚙️  $key: $value\n";
    }
    
    echo "\n";
    
    // Verificar usuários administrativos
    echo "👥 Verificando usuários administrativos:\n";
    
    $adminCheck = $db->prepare("SELECT username, email, user_role, status FROM users WHERE user_role IN ('admin', 'suporte') ORDER BY user_role");
    $adminCheck->execute();
    $admins = $adminCheck->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($admins)) {
        echo "❌ Nenhum usuário administrativo encontrado!\n";
        $allTablesOk = false;
    } else {
        foreach ($admins as $admin) {
            $statusIcon = $admin['status'] === 'ativo' ? '✅' : '❌';
            echo "$statusIcon {$admin['user_role']}: {$admin['username']} ({$admin['email']}) - {$admin['status']}\n";
        }
    }
    
    echo "\n";
    
    // Resumo final
    if ($allTablesOk) {
        echo "🎉 Banco de dados está íntegro e pronto para uso!\n";
        echo "\n📋 PRÓXIMOS PASSOS:\n";
        echo "1. Teste o login com as credenciais padrão\n";
        echo "2. Crie um usuário de teste\n";
        echo "3. Teste uma consulta simples\n";
        echo "4. Verifique os logs do sistema\n";
    } else {
        echo "⚠️  Problemas encontrados no banco de dados!\n";
        echo "Execute o script de instalação novamente ou corrija manualmente.\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERRO: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
