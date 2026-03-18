
// Sistema de migrations para MySQL
export const migrations = {
  '001_create_users_table': `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      senhaalfa VARCHAR(16) DEFAULT NULL,
      cpf VARCHAR(15) UNIQUE DEFAULT NULL,
      senha4 VARCHAR(4) DEFAULT NULL,
      senha6 VARCHAR(6) DEFAULT NULL,
      senha8 VARCHAR(8) DEFAULT NULL,
      full_name VARCHAR(200) NOT NULL,
      indicador_id INT DEFAULT NULL,
      tipoplano VARCHAR(100) DEFAULT 'Pré-Pago',
      data_inicio DATE DEFAULT NULL,
      data_fim DATE DEFAULT NULL,
      user_role ENUM('assinante', 'suporte') DEFAULT 'assinante',
      status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'pendente',
      saldo DOUBLE DEFAULT 0.00,
      saldo_atualizado TINYINT(1) DEFAULT 0,
      aceite_termos TINYINT(1) DEFAULT 0,
      ultimo_login DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '002_create_contas_bancarias_table': `
    CREATE TABLE IF NOT EXISTS contas_bancarias (
      id INT AUTO_INCREMENT PRIMARY KEY,
      id_usuario INT NOT NULL,
      instituicao VARCHAR(200) NOT NULL,
      agencia VARCHAR(10) NOT NULL,
      conta VARCHAR(10) NOT NULL,
      tipodeconta VARCHAR(25) NOT NULL,
      saldo DOUBLE DEFAULT 0,
      status VARCHAR(25) DEFAULT 'ativa',
      saldo_atualizado TINYINT(1) DEFAULT 0,
      datacad TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '003_create_wallet_transactions_table': `
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tipo ENUM('entrada', 'saida', 'bonus', 'ajuste', 'indicacao', 'recarga') NOT NULL,
      valor DOUBLE NOT NULL,
      descricao TEXT,
      referencia_id VARCHAR(100) DEFAULT NULL,
      status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'confirmado',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '004_create_logs_table': `
    CREATE TABLE IF NOT EXISTS logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT DEFAULT NULL,
      acao VARCHAR(255) NOT NULL,
      modulo VARCHAR(100) DEFAULT NULL,
      detalhes TEXT,
      ip_address VARCHAR(45),
      user_agent TEXT,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '005_create_consultas_table': `
    CREATE TABLE IF NOT EXISTS consultas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      tipo ENUM('cpf', 'cnpj', 'veiculo', 'score', 'personalizada') NOT NULL,
      documento VARCHAR(20) NOT NULL,
      resultado JSON DEFAULT NULL,
      custo DOUBLE DEFAULT 0.00,
      status ENUM('sucesso', 'erro', 'pendente') DEFAULT 'pendente',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '006_create_indicacoes_table': `
    CREATE TABLE IF NOT EXISTS indicacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      indicador_id INT NOT NULL,
      indicado_id INT NOT NULL,
      bonus_indicador DOUBLE DEFAULT 5.00,
      bonus_indicado DOUBLE DEFAULT 5.00,
      status ENUM('ativo', 'inativo') DEFAULT 'ativo',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (indicado_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_indicacao (indicador_id, indicado_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '007_create_pix_keys_table': `
    CREATE TABLE IF NOT EXISTS pix_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      chave_pix VARCHAR(100) NOT NULL,
      tipo_chave ENUM('cpf', 'email', 'telefone') NOT NULL,
      is_primary TINYINT(1) DEFAULT 0,
      status ENUM('ativa', 'inativa') DEFAULT 'ativa',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_pix_key (chave_pix),
      INDEX idx_user_pix (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '008_insert_default_users': `
    INSERT IGNORE INTO users (id, username, email, senhaalfa, cpf, full_name, tipoplano, user_role, saldo, status, aceite_termos) VALUES
    (1, 'anjoip', 'anjoip@email.com', '112233', '123.456.789-00', 'Anjo IP', 'Pré-Pago', 'assinante', 0.00, 'ativo', 1),
    (2, 'artepura', 'suporte@apipainel.com', '332211', '987.654.321-00', 'SUPORTE', 'Rei de Espadas', 'suporte', 1000.00, 'ativo', 1);
  `,

  '009_create_user_profiles_table': `
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      company VARCHAR(200) DEFAULT NULL,
      website VARCHAR(255) DEFAULT NULL,
      social_links JSON DEFAULT NULL,
      preferences JSON DEFAULT NULL,
      timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
      language VARCHAR(10) DEFAULT 'pt-BR',
      theme VARCHAR(20) DEFAULT 'light',
      two_factor_enabled TINYINT(1) DEFAULT 0,
      two_factor_secret VARCHAR(100) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_profile (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `,

  '010_create_user_settings_table': `
    CREATE TABLE IF NOT EXISTS user_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      setting_key VARCHAR(100) NOT NULL,
      setting_value TEXT NOT NULL,
      setting_type ENUM('string', 'integer', 'decimal', 'boolean', 'json') DEFAULT 'string',
      category VARCHAR(50) DEFAULT 'general',
      is_encrypted TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_setting (user_id, setting_key),
      INDEX idx_user_category (user_id, category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
   `
};

export const getMigrationsList = (): string[] => {
  return Object.keys(migrations).sort();
};

export const getMigrationSQL = (migrationName: string): string => {
  return migrations[migrationName as keyof typeof migrations] || '';
};

export const getExecutedMigrations = (): string[] => {
  const executed = localStorage.getItem('executed_migrations');
  return executed ? JSON.parse(executed) : [];
};

export const markMigrationAsExecuted = (migrationName: string): void => {
  const executed = getExecutedMigrations();
  if (!executed.includes(migrationName)) {
    executed.push(migrationName);
    localStorage.setItem('executed_migrations', JSON.stringify(executed));
  }
};

export const resetMigrations = (): void => {
  localStorage.removeItem('executed_migrations');
};
