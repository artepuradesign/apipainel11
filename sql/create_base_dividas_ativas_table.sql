-- Tabela base_dividas_ativas: armazena dívidas ativas do contribuinte (SIDA)
-- Com relacionamento CASCADE para deletar automaticamente quando o CPF for excluído

CREATE TABLE IF NOT EXISTS base_dividas_ativas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cpf_id INT NOT NULL,
  tipo_devedor VARCHAR(100) DEFAULT NULL,
  nome_devedor VARCHAR(255) DEFAULT NULL,
  uf_devedor VARCHAR(2) DEFAULT NULL,
  numero_inscricao VARCHAR(50) DEFAULT NULL,
  tipo_situacao_inscricao VARCHAR(100) DEFAULT NULL,
  situacao_inscricao VARCHAR(100) DEFAULT NULL,
  receita_principal VARCHAR(255) DEFAULT NULL,
  data_inscricao DATE DEFAULT NULL,
  indicador_ajuizado VARCHAR(10) DEFAULT NULL,
  valor_consolidado DECIMAL(15,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cpf_id) REFERENCES base_cpf(id) ON DELETE CASCADE,
  INDEX idx_cpf_id (cpf_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
