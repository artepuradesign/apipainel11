
<?php
// create_table.php - Script para criar a tabela users se não existir

require_once __DIR__ . '/config/conexao.php';

try {
    // Usar pool de conexão
    $db = getDBConnection();
    
    echo "Verificando se a tabela 'users' existe...\n";
    
    // Verificar se a tabela existe
    $checkQuery = "SHOW TABLES LIKE 'users'";
    $stmt = $db->prepare($checkQuery);
    $stmt->execute();
    $tableExists = $stmt->rowCount() > 0;
    
    if ($tableExists) {
        echo "✅ Tabela 'users' já existe!\n";
    } else {
        echo "❌ Tabela 'users' não existe. Criando...\n";
        
        // Criar tabela users
        $createTableSQL = "
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(255) NOT NULL,
            cpf VARCHAR(14) UNIQUE DEFAULT NULL,
            cnpj VARCHAR(18) UNIQUE DEFAULT NULL,
            data_nascimento DATE DEFAULT NULL,
            telefone VARCHAR(20) DEFAULT NULL,
            cep VARCHAR(10) DEFAULT NULL,
            endereco TEXT DEFAULT NULL,
            numero VARCHAR(10) DEFAULT NULL,
            bairro VARCHAR(100) DEFAULT NULL,
            cidade VARCHAR(100) DEFAULT NULL,
            estado VARCHAR(2) DEFAULT NULL,
            senhaalfa VARCHAR(255) DEFAULT NULL,
            senha4 VARCHAR(4) DEFAULT NULL,
            senha6 VARCHAR(6) DEFAULT NULL,
            senha8 VARCHAR(8) DEFAULT NULL,
            user_role ENUM('assinante', 'suporte') DEFAULT 'assinante',
            status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'ativo',
            tipo_pessoa ENUM('fisica', 'juridica') DEFAULT 'fisica',
            saldo DECIMAL(10,2) DEFAULT 0.00,
            saldo_plano DECIMAL(10,2) DEFAULT 0.00,
            saldo_atualizado BOOLEAN DEFAULT FALSE,
            tipoplano VARCHAR(100) DEFAULT 'Gratuito',
            data_inicio DATETIME DEFAULT NULL,
            data_fim DATETIME DEFAULT NULL,
            indicador_id INT DEFAULT NULL,
            codigo_indicacao VARCHAR(20) UNIQUE DEFAULT NULL,
            aceite_termos BOOLEAN DEFAULT FALSE,
            email_verificado BOOLEAN DEFAULT FALSE,
            telefone_verificado BOOLEAN DEFAULT FALSE,
            ultimo_login DATETIME DEFAULT NULL,
            tentativas_login INT DEFAULT 0,
            bloqueado_ate DATETIME DEFAULT NULL,
            password_reset_token VARCHAR(255) DEFAULT NULL,
            password_reset_expires DATETIME DEFAULT NULL,
            email_verification_token VARCHAR(255) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_email (email),
            INDEX idx_username (username),
            INDEX idx_cpf (cpf),
            INDEX idx_status (status),
            INDEX idx_role (user_role),
            INDEX idx_codigo_indicacao (codigo_indicacao),
            
            FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($createTableSQL);
        echo "✅ Tabela 'users' criada com sucesso!\n";
        
        // Criar tabela indicacoes se não existir
        $createIndicacoesSQL = "
        CREATE TABLE IF NOT EXISTS indicacoes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            indicador_id INT NOT NULL,
            indicado_id INT NOT NULL,
            codigo_usado VARCHAR(50) DEFAULT NULL,
            bonus_indicador DECIMAL(10,2) DEFAULT 5.00,
            bonus_indicado DECIMAL(10,2) DEFAULT 5.00,
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (indicado_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE KEY unique_indicacao (indicador_id, indicado_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        ";
        
        $db->exec($createIndicacoesSQL);
        echo "✅ Tabela 'indicacoes' criada com sucesso!\n";
    }
    
    // Verificar estrutura da tabela
    $describeQuery = "DESCRIBE users";
    $stmt = $db->prepare($describeQuery);
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n📋 Estrutura da tabela 'users':\n";
    foreach ($columns as $column) {
        echo "- {$column['Field']} ({$column['Type']})\n";
    }
    
    echo "\n🎉 Banco de dados configurado com sucesso!\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
?>
