
-- ===================================================================
-- ESTRUTURA COMPLETA DO BANCO DE CONSULTAS (DADOS PRINCIPAIS + REGISTROS)
-- ===================================================================

-- Ambiente compartilhado: importar diretamente no banco selecionado (Hostinger)
-- Removido CREATE DATABASE/USE para evitar erro #1044


-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senhaalfa VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    cnpj VARCHAR(18) UNIQUE,
    senha4 VARCHAR(4),
    senha6 VARCHAR(6),
    senha8 VARCHAR(8),
    full_name VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    telefone VARCHAR(20),
    cep VARCHAR(10),
    endereco TEXT,
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    indicador_id INT,
    tipoplano ENUM('queen', 'king') DEFAULT 'queen',
    data_inicio DATETIME,
    data_fim DATETIME,
    user_role ENUM('assinante', 'suporte') DEFAULT 'assinante',
    status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'pendente',
    saldo DECIMAL(10,2) DEFAULT 0.00,
    saldo_plano DECIMAL(10,2) DEFAULT 0.00,
    saldo_atualizado BOOLEAN DEFAULT FALSE,
    aceite_termos BOOLEAN DEFAULT FALSE,
    ultimo_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tipo_pessoa ENUM('fisica', 'juridica') DEFAULT 'fisica',
    FOREIGN KEY (indicador_id) REFERENCES usuarios(id)
);

-- =========================
-- 1. TABELAS PRINCIPAIS (BASES DE DADOS)
-- =========================

-- CPF - Base principal de CPFs
CREATE TABLE IF NOT EXISTS `base_cpf` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cpf` VARCHAR(14) NOT NULL UNIQUE,
  `nome` VARCHAR(200),
  `data_nascimento` DATE,
  `sexo` VARCHAR(10),
  `mae` VARCHAR(200),
  `pai` VARCHAR(200),
  `endereco` TEXT,
  `cidade` VARCHAR(100),
  `estado` VARCHAR(2),
  `situacao` VARCHAR(50),
  `score` INT(3),
  `restricoes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CNPJ - Base principal de CNPJs
CREATE TABLE IF NOT EXISTS `base_cnpj` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cnpj` VARCHAR(18) NOT NULL UNIQUE,
  `razao_social` VARCHAR(300),
  `nome_fantasia` VARCHAR(300),
  `natureza_juridica` VARCHAR(200),
  `porte_empresa` VARCHAR(50),
  `capital_social` DECIMAL(15,2),
  `cnae_principal` VARCHAR(20),
  `situacao` VARCHAR(50),
  `endereco` TEXT,
  `cidade` VARCHAR(100),
  `estado` VARCHAR(2),
  `telefone` VARCHAR(50),
  `email` VARCHAR(200),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Veículos - Base principal de veículos
CREATE TABLE IF NOT EXISTS `base_veiculos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `placa` VARCHAR(8) NOT NULL UNIQUE,
  `marca` VARCHAR(100),
  `modelo` VARCHAR(200),
  `ano_fabricacao` INT(4),
  `ano_modelo` INT(4),
  `cor` VARCHAR(50),
  `chassi` VARCHAR(17),
  `renavam` VARCHAR(11),
  `situacao` VARCHAR(100),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Produtos digitais
CREATE TABLE IF NOT EXISTS `produtos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nome_produto` VARCHAR(200) NOT NULL,
  `descricao` TEXT,
  `categoria` VARCHAR(100),
  `tipo_arquivo` ENUM('cdr','psd','pdf','txt','zip','outros') NOT NULL,
  `url_download` VARCHAR(500),
  `valor` DECIMAL(10,2) NOT NULL,
  `status` ENUM('ativo','inativo','expirado') DEFAULT 'ativo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Serviços
CREATE TABLE IF NOT EXISTS `servicos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `nome_servico` VARCHAR(200) NOT NULL,
  `descricao` TEXT,
  `categoria` VARCHAR(100),
  `valor` DECIMAL(10,2) NOT NULL,
  `status` ENUM('solicitado','concluido','cancelado') DEFAULT 'solicitado',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- QR Codes
CREATE TABLE IF NOT EXISTS `qrcodes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `codigo_qr` VARCHAR(100) UNIQUE NOT NULL,
  `tipo_qrcode` ENUM('url','texto','pix','contato','wifi','evento','produto') NOT NULL,
  `dados_qrcode` JSON NOT NULL,
  `status` ENUM('ativo','validado','expirado') DEFAULT 'ativo',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================
-- 2. TABELAS DE REGISTRO DE CONSULTAS
-- =========================

-- Registro de consultas CPF
CREATE TABLE IF NOT EXISTS `consultas_cpf` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `cpf_consultado` VARCHAR(14) NOT NULL,
  `resultado` JSON,
  `valor_cobrado` DECIMAL(8,2) NOT NULL,
  `desconto_aplicado` DECIMAL(8,2) DEFAULT 0.00,
  `saldo_usado` ENUM('plano','carteira') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Registro de consultas CNPJ
CREATE TABLE IF NOT EXISTS `consultas_cnpj` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `cnpj_consultado` VARCHAR(18) NOT NULL,
  `resultado` JSON,
  `valor_cobrado` DECIMAL(8,2) NOT NULL,
  `desconto_aplicado` DECIMAL(8,2) DEFAULT 0.00,
  `saldo_usado` ENUM('plano','carteira') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Registro de consultas Veículos
CREATE TABLE IF NOT EXISTS `consultas_veiculos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `placa_consultada` VARCHAR(8) NOT NULL,
  `resultado` JSON,
  `valor_cobrado` DECIMAL(8,2) NOT NULL,
  `desconto_aplicado` DECIMAL(8,2) DEFAULT 0.00,
  `saldo_usado` ENUM('plano','carteira') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Registro de geração de QR Codes
CREATE TABLE IF NOT EXISTS `qrcode_transacoes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `qrcode_id` INT NOT NULL,
  `valor_cobrado` DECIMAL(8,2) NOT NULL,
  `saldo_usado` ENUM('plano','carteira') NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`qrcode_id`) REFERENCES `qrcodes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de transações do wallet
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_type ENUM('main', 'plan') NOT NULL,
    type ENUM('credit', 'debit', 'bonus', 'adjustment', 'consultation') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_type VARCHAR(50),
    reference_id INT,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela de planos
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL,
    limite_consultas INT DEFAULT 0,
    recursos JSON,
    configuracoes JSON,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    destaque BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 0,
    naipe VARCHAR(20) DEFAULT 'spades',
    tipo_carta VARCHAR(20) DEFAULT 'queen',
    desconto_percentual INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de módulos
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    icon VARCHAR(50),
    preco DECIMAL(10,2) DEFAULT 0.00,
    categoria VARCHAR(50),
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    caminho VARCHAR(255),
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de depoimentos
CREATE TABLE IF NOT EXISTS depoimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    nota INT DEFAULT 5,
    avatar VARCHAR(255),
    cargo VARCHAR(100),
    empresa VARCHAR(100),
    status ENUM('ativo', 'inativo', 'pendente') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir dados iniciais
INSERT INTO planos (nome, descricao, preco, limite_consultas, recursos, configuracoes, destaque, ordem, naipe, tipo_carta) VALUES
('Plano Queen', 'Plano básico com recursos essenciais', 39.90, 100, '["Consulta CPF", "Consulta CNPJ", "Suporte básico"]', '{"colors": {"primary": "#EC4899", "secondary": "#BE185D", "accent": "#F9A8D4"}, "cardTheme": "elegant", "gradient": "pink"}', false, 1, 'hearts', 'queen'),
('Plano King', 'Plano premium com todos os recursos', 79.90, 500, '["Consulta CPF", "Consulta CNPJ", "Consulta Score", "Consulta Veículos", "Suporte prioritário", "API Access"]', '{"colors": {"primary": "#3B82F6", "secondary": "#1E40AF", "accent": "#60A5FA"}, "cardTheme": "premium", "gradient": "blue"}', true, 2, 'spades', 'king');

INSERT INTO modulos (titulo, descricao, icon, categoria, caminho, ordem) VALUES
('Consulta CPF', 'Consulta dados completos de CPF', 'user', 'consultas', '/consulta-cpf', 1),
('Consulta CNPJ', 'Consulta dados empresariais', 'building', 'consultas', '/consulta-cnpj', 2),
('Consulta Score', 'Verificação de score de crédito', 'trending-up', 'financeiro', '/consulta-score', 3),
('Consulta Veículos', 'Dados de veículos por placa', 'car', 'veiculos', '/consulta-veiculo', 4);

INSERT INTO depoimentos (nome, mensagem, nota, cargo, empresa, status) VALUES
('João Silva', 'Excelente plataforma! Muito fácil de usar e os resultados são precisos.', 5, 'Empresário', 'Silva & Cia', 'ativo'),
('Maria Santos', 'O suporte é fantástico e a API é muito bem documentada.', 5, 'Desenvolvedora', 'Tech Solutions', 'ativo'),
('Pedro Oliveira', 'Uso há 6 meses e nunca tive problemas. Recomendo!', 5, 'Analista', 'DataCorp', 'ativo');
