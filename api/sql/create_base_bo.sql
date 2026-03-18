-- Criação da tabela base_bo para Boletim de Ocorrência
CREATE TABLE IF NOT EXISTS `base_bo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cpf_id` INT NOT NULL,
  `numero_ano` VARCHAR(50) DEFAULT NULL COMMENT 'Nº/Ano do boletim, ex: 267237/2021',
  `unidade` VARCHAR(255) DEFAULT NULL COMMENT 'Unidade policial, ex: 11º Distrito de Polícia Civil',
  `data_fato` VARCHAR(20) DEFAULT NULL COMMENT 'Data do fato, ex: 24/11/2021',
  `data_registro` VARCHAR(20) DEFAULT NULL COMMENT 'Data do registro, ex: 09/12/2021',
  `natureza` VARCHAR(255) DEFAULT NULL COMMENT 'Natureza da ocorrência, ex: 1. Preservação de Direito',
  `bo_link` VARCHAR(100) DEFAULT NULL COMMENT 'Nome do arquivo PDF sem extensão, ex: 775821',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cpf_id` (`cpf_id`),
  INDEX `idx_numero_ano` (`numero_ano`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
