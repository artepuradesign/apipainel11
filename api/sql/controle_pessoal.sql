-- Tabela única para centralizar dados dos módulos de controle pessoal
-- Compatível com: agenda, financeiro, novo cliente, relatórios e venda simples

CREATE TABLE IF NOT EXISTS controle_pessoal (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    modulo ENUM('agenda', 'financeiro', 'novocliente', 'relatorios', 'vendasimples') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    cliente_nome VARCHAR(255) NULL,
    cliente_contato VARCHAR(120) NULL,
    valor DECIMAL(12,2) NULL DEFAULT 0.00,
    data_referencia DATE NOT NULL,
    status ENUM('pendente', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_controle_pessoal_user (user_id),
    INDEX idx_controle_pessoal_modulo (modulo),
    INDEX idx_controle_pessoal_data (data_referencia),
    INDEX idx_controle_pessoal_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
