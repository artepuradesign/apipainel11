-- pdf_rg.sql
-- Banco: MySQL
-- Módulo: PDF RG (pedidos de confecção de RG em PDF)

-- =====================
-- 1) TABELA DE PEDIDOS
-- =====================
CREATE TABLE IF NOT EXISTS pdf_rg_pedidos (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 0,
  user_id INT NULL,

  -- Dados do documento
  cpf VARCHAR(11) NOT NULL,
  nome VARCHAR(200) NULL,
  dt_nascimento DATE NULL,
  naturalidade VARCHAR(120) NULL,
  filiacao_mae VARCHAR(200) NULL,
  filiacao_pai VARCHAR(200) NULL,
  diretor VARCHAR(60) NULL,

  -- Imagens opcionais
  assinatura_base64 LONGTEXT NULL,
  foto_base64 LONGTEXT NULL,

  -- Anexos (até 3 arquivos em base64)
  anexo1_base64 LONGTEXT NULL,
  anexo1_nome VARCHAR(255) NULL,
  anexo2_base64 LONGTEXT NULL,
  anexo2_nome VARCHAR(255) NULL,
  anexo3_base64 LONGTEXT NULL,
  anexo3_nome VARCHAR(255) NULL,

  -- QR Code
  qr_plan VARCHAR(10) NULL DEFAULT '1m',

  -- Status do pedido (nome): realizado, pagamento_confirmado, em_confeccao, entregue
  status VARCHAR(30) NOT NULL DEFAULT 'realizado',

  -- Preço pago
  preco_pago DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  desconto_aplicado DECIMAL(5,2) NOT NULL DEFAULT 0.00,

  -- PDF final enviado pelo admin
  pdf_entrega_base64 LONGTEXT NULL,
  pdf_entrega_nome VARCHAR(255) NULL,

  -- Timestamps por status
  realizado_at DATETIME NULL,
  pagamento_confirmado_at DATETIME NULL,
  em_confeccao_at DATETIME NULL,
  entregue_at DATETIME NULL,

  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,

  PRIMARY KEY (id),
  INDEX idx_pdfrg_user (user_id),
  INDEX idx_pdfrg_cpf (cpf),
  INDEX idx_pdfrg_status (status),
  INDEX idx_pdfrg_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
