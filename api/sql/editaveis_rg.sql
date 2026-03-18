-- editaveis_rg.sql
-- Banco: MySQL
-- Módulo: Editáveis RG - CorelDraw (ID 85)

-- =====================
-- 1) TABELA DE ARQUIVOS DISPONÍVEIS (admin cadastra)
-- =====================
CREATE TABLE IF NOT EXISTS editaveis_rg_arquivos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 85,

  titulo VARCHAR(255) NOT NULL,
  descricao TEXT NULL,
  categoria VARCHAR(100) NULL DEFAULT 'RG CorelDraw',

  -- Tipo do arquivo (ex: RG, CNH, TITULO, etc.) - permite filtrar por módulo futuro
  tipo VARCHAR(100) NOT NULL DEFAULT 'RG',
  -- Versão do arquivo (ex: 2024, 2025, v1, v2, etc.)
  versao VARCHAR(50) NULL DEFAULT NULL,

  formato VARCHAR(20) NULL DEFAULT '.CDR',
  tamanho_arquivo VARCHAR(50) NULL,

  -- URL ou path do arquivo para download (após compra)
  arquivo_url TEXT NOT NULL,
  -- Imagem de preview/thumbnail
  preview_url TEXT NULL,

  preco DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  ativo TINYINT(1) NOT NULL DEFAULT 1,

  downloads_total INT UNSIGNED NOT NULL DEFAULT 0,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_editaveis_rg_ativo (ativo),
  INDEX idx_editaveis_rg_categoria (categoria),
  INDEX idx_editaveis_rg_tipo (tipo),
  INDEX idx_editaveis_rg_versao (versao),
  INDEX idx_editaveis_rg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 2) TABELA DE COMPRAS (registro de cada compra do usuário)
-- =====================
CREATE TABLE IF NOT EXISTS editaveis_rg_compras (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 85,
  user_id INT NOT NULL,
  arquivo_id BIGINT UNSIGNED NOT NULL,

  preco_pago DECIMAL(10,2) NOT NULL,
  desconto_aplicado DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  metodo_pagamento VARCHAR(50) NOT NULL DEFAULT 'saldo',

  -- Quantas vezes baixou
  downloads_count INT UNSIGNED NOT NULL DEFAULT 0,
  ultimo_download_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_editaveis_compras_user (user_id),
  INDEX idx_editaveis_compras_arquivo (arquivo_id),
  UNIQUE KEY uk_user_arquivo (user_id, arquivo_id),

  FOREIGN KEY (arquivo_id) REFERENCES editaveis_rg_arquivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 3) INSERTS DE EXEMPLO (arquivos disponíveis)
-- =====================
INSERT INTO editaveis_rg_arquivos (module_id, titulo, descricao, categoria, tipo, versao, formato, tamanho_arquivo, arquivo_url, preview_url, preco)
VALUES
(85, 'RG Frente - Modelo Padrão', 'Arquivo editável RG frente modelo padrão nacional', 'RG CorelDraw', 'RG', '2024', '.CDR', '15 MB', 'https://cdn.example.com/editaveis/rg-frente-padrao.cdr', NULL, 5.00),
(85, 'RG Verso - Modelo Padrão', 'Arquivo editável RG verso modelo padrão nacional', 'RG CorelDraw', 'RG', '2024', '.CDR', '12 MB', 'https://cdn.example.com/editaveis/rg-verso-padrao.cdr', NULL, 5.00),
(85, 'RG Completo - Modelo 2024', 'Arquivo editável RG frente e verso modelo 2024', 'RG CorelDraw', 'RG', '2024', '.CDR', '28 MB', 'https://cdn.example.com/editaveis/rg-completo-2024.cdr', NULL, 10.00);

-- =====================
-- 4) SELECT (CONFERÊNCIA)
-- =====================
SELECT * FROM editaveis_rg_arquivos WHERE ativo = 1 ORDER BY id DESC;
SELECT * FROM editaveis_rg_compras ORDER BY id DESC LIMIT 50;
