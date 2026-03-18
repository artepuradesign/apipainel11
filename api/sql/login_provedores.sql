-- login_provedores.sql
-- Banco: MySQL
-- Tabela de provedores de login

-- =====================
-- 1) TABELA DE PROVEDORES
-- =====================
CREATE TABLE IF NOT EXISTS login_provedores (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uk_login_provedores_slug (slug),
  INDEX idx_login_provedores_ativo (ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 2) INSERIR PROVEDORES PADRÃO
-- =====================
INSERT IGNORE INTO login_provedores (nome, slug) VALUES
  ('Hotmail', 'hotmail'),
  ('Gmail', 'gmail'),
  ('Renner', 'renner'),
  ('Azul', 'azul');

-- =====================
-- 3) ADICIONAR NOVOS CAMPOS NA TABELA login_hotmail
-- =====================
ALTER TABLE login_hotmail
  ADD COLUMN cpf VARCHAR(14) NULL AFTER provedor,
  ADD COLUMN saldo DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER cpf,
  ADD COLUMN pontos INT NOT NULL DEFAULT 0 AFTER saldo,
  ADD COLUMN status ENUM('vendida','virgem','criada','usada','erro') NOT NULL DEFAULT 'virgem' AFTER pontos,
  ADD INDEX idx_login_hotmail_cpf (cpf),
  ADD INDEX idx_login_hotmail_status (status);

-- =====================
-- 4) SELECT (CONFERÊNCIA)
-- =====================
SELECT * FROM login_provedores ORDER BY nome;
SELECT * FROM login_hotmail WHERE ativo = 1 ORDER BY id DESC LIMIT 10;
