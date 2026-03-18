-- rg_2026_registros.sql
-- Banco: MySQL (externo)
-- Módulo: RG 2026 (ID 57)

-- =====================
-- 1) CRIAR TABELA
-- =====================
CREATE TABLE IF NOT EXISTS rg_2026_registros (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  module_id INT NOT NULL DEFAULT 57,
  user_id INT NULL,

  -- Obrigatórios
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(11) NOT NULL,
  dt_nascimento DATE NOT NULL,
  filiacao_mae VARCHAR(200) NOT NULL,

  -- Opcionais
  nome_social VARCHAR(200) NULL,
  sexo ENUM('M','F','O') NULL,
  nacionalidade VARCHAR(120) NULL,
  naturalidade VARCHAR(120) NULL,
  validade DATE NULL,
  assinatura_base64 LONGTEXT NULL,
  foto_base64 LONGTEXT NULL,
  numero_folha VARCHAR(30) NULL,
  numero_qrcode VARCHAR(60) NULL,
  filiacao_pai VARCHAR(200) NULL,
  orgao_expedidor VARCHAR(120) NULL,
  local_emissao VARCHAR(120) NULL,
  dt_emissao DATE NULL,
  diretor VARCHAR(40) NULL,

  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,

  PRIMARY KEY (id),
  INDEX idx_rg2026_user (user_id),
  INDEX idx_rg2026_cpf (cpf),
  INDEX idx_rg2026_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- 2) INSERT (MÍNIMO)
-- =====================
-- Campos obrigatórios: nome, cpf, dt_nascimento, filiacao_mae
INSERT INTO rg_2026_registros
(module_id, user_id, nome, cpf, dt_nascimento, filiacao_mae, created_at, updated_at)
VALUES
(57, 123, 'JOAO DA SILVA', '12345678901', '1990-05-20', 'MARIA DA SILVA', NOW(), NOW());

-- =====================
-- 3) INSERT (COMPLETO)
-- =====================
INSERT INTO rg_2026_registros
(
  module_id, user_id,
  nome, nome_social, cpf, sexo, dt_nascimento,
  nacionalidade, naturalidade, validade,
  assinatura_base64, foto_base64,
  numero_folha, numero_qrcode,
  filiacao_mae, filiacao_pai,
  orgao_expedidor, local_emissao, dt_emissao,
  diretor,
  created_at, updated_at
)
VALUES
(
  57, 123,
  'JOAO DA SILVA', 'JOAO DA SILVA', '12345678901', 'M', '1990-05-20',
  'BRASILEIRA', 'SAO PAULO - SP', '2030-05-20',
  NULL, NULL,
  '12', '987654',
  'MARIA DA SILVA', 'JOSE DA SILVA',
  'SSP', 'SAO PAULO', '2026-02-23',
  'Maranhão',
  NOW(), NOW()
);

-- =====================
-- 4) SELECT (CONFERÊNCIA)
-- =====================
SELECT *
FROM rg_2026_registros
ORDER BY id DESC
LIMIT 50;

-- Buscar por CPF (somente números)
SELECT id, nome, cpf, dt_nascimento, filiacao_mae, created_at
FROM rg_2026_registros
WHERE cpf = '12345678901'
ORDER BY id DESC;

-- Buscar por user_id
SELECT id, nome, cpf, created_at
FROM rg_2026_registros
WHERE user_id = 123
ORDER BY id DESC;
