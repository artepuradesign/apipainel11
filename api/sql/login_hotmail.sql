-- login_hotmail.sql
-- Banco: MySQL
-- Módulo: Login Hotmail (ID 162)

-- =====================
-- 1) TABELA DE LOGINS HOTMAIL (admin cadastra)
-- =====================
CREATE TABLE IF NOT EXISTS login_hotmail (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 162,

  email VARCHAR(255) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  provedor VARCHAR(100) NOT NULL DEFAULT 'hotmail',
  observacao TEXT NULL,

  ativo TINYINT(1) NOT NULL DEFAULT 1,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_login_hotmail_email (email),
  INDEX idx_login_hotmail_provedor (provedor),
  INDEX idx_login_hotmail_ativo (ativo),
  INDEX idx_login_hotmail_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 2) TABELA DE COMPRAS (registro de cada compra do usuário)
-- =====================
CREATE TABLE IF NOT EXISTS login_hotmail_compras (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 162,
  user_id INT NOT NULL,
  login_id BIGINT UNSIGNED NOT NULL,

  preco_pago DECIMAL(10,2) NOT NULL,
  desconto_aplicado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo_pagamento VARCHAR(50) NOT NULL DEFAULT 'saldo',

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_login_hotmail_compras_user (user_id),
  INDEX idx_login_hotmail_compras_login (login_id),
  UNIQUE KEY uk_user_login (user_id, login_id),

  FOREIGN KEY (login_id) REFERENCES login_hotmail(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 3) SELECT (CONFERÊNCIA)
-- =====================
SELECT * FROM login_hotmail WHERE ativo = 1 ORDER BY id DESC;
SELECT * FROM login_hotmail_compras ORDER BY id DESC LIMIT 50;
