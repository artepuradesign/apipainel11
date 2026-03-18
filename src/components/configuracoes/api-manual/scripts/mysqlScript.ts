
export const generateMySQLScript = () => {
  return `-- Script MySQL Completo para Sistema de Consultas APD
-- Versão: 3.0 - Atualizado
-- Data: ${new Date().toLocaleDateString('pt-BR')}
-- Desenvolvido por: Arte Pura Design (APD)
-- Website: https://artepuradesign.com.br

-- =====================================================
-- CRIAÇÃO DO BANCO DE DADOS E CONFIGURAÇÕES INICIAIS
-- =====================================================

CREATE DATABASE IF NOT EXISTS sistema_consultas_apd 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_consultas_apd;

-- =====================================================
-- TABELA DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150),
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(20),
    cep VARCHAR(10),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    tipoplano VARCHAR(50) DEFAULT 'Pré-Pago',
    data_inicio DATE,
    data_fim DATE,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    saldo_bonus DECIMAL(10,2) DEFAULT 0.00,
    user_role ENUM('assinante', 'suporte', 'admin') DEFAULT 'assinante',
    status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'pendente',
    aceite_termos BOOLEAN DEFAULT FALSE,
    saldo_atualizado BOOLEAN DEFAULT FALSE,
    indicador_id INT,
    ultimo_login TIMESTAMP NULL,
    device_fingerprint VARCHAR(255),
    ip_cadastro VARCHAR(45),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    avatar_url VARCHAR(500),
    preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_login (login),
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_status (status),
    INDEX idx_indicador (indicador_id),
    INDEX idx_device_fingerprint (device_fingerprint),
    INDEX idx_created_at (created_at),
    INDEX idx_role_status (user_role, status),
    
    FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE TOKENS DE AUTENTICAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS auth_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    token_type ENUM('access', 'refresh', 'email_verification', 'password_reset') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_token_type (token_type),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE CHAVES PIX
-- =====================================================

CREATE TABLE IF NOT EXISTS pix_keys (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pix_key VARCHAR(100) NOT NULL,
    pix_type ENUM('cpf', 'email', 'telefone', 'chave_aleatoria') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_pix_key (pix_key),
    INDEX idx_is_active (is_active),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE TRANSAÇÕES FINANCEIRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS financial_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('DEPOSIT', 'WITHDRAWAL', 'CONSULTATION', 'BONUS', 'REFUND', 'FEE') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    fee_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    external_transaction_id VARCHAR(100),
    description TEXT,
    metadata JSON,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_type (transaction_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_external_id (external_transaction_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE HISTÓRICO DE CONSULTAS
-- =====================================================

CREATE TABLE IF NOT EXISTS consultation_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    consultation_type ENUM('CPF', 'CNPJ', 'VEHICLE', 'NAME_SEARCH', 'MOTHER_SEARCH', 'FATHER_SEARCH', 'PHONE', 'EMAIL') NOT NULL,
    document VARCHAR(100) NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    response_data JSON,
    error_message TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    processing_time_ms INT,
    api_provider VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_consultation_type (consultation_type),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success),
    INDEX idx_document (document),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE LOGS DE ACESSO E AUDITORIA
-- =====================================================

CREATE TABLE IF NOT EXISTS access_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    action VARCHAR(100),
    resource VARCHAR(200),
    method VARCHAR(10),
    status_code INT,
    response_time_ms INT,
    success BOOLEAN DEFAULT TRUE,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address),
    INDEX idx_action (action),
    INDEX idx_status_code (status_code),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_is_public (is_public),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE MÓDULOS E SERVIÇOS
-- =====================================================

CREATE TABLE IF NOT EXISTS modules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    endpoint VARCHAR(200),
    price DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    requires_auth BOOLEAN DEFAULT TRUE,
    rate_limit_per_minute INT DEFAULT 60,
    max_daily_usage INT DEFAULT 1000,
    icon VARCHAR(50),
    category VARCHAR(50),
    version VARCHAR(20) DEFAULT '1.0',
    dependencies JSON,
    config JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_category (category),
    INDEX idx_endpoint (endpoint)
);

-- =====================================================
-- TABELA DE PERMISSÕES DE USUÁRIO POR MÓDULO
-- =====================================================

CREATE TABLE IF NOT EXISTS user_module_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    has_access BOOLEAN DEFAULT FALSE,
    usage_limit INT DEFAULT -1,
    usage_count INT DEFAULT 0,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    granted_by INT NULL,
    
    INDEX idx_user_module (user_id, module_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_has_access (has_access),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_module (user_id, module_id)
);

-- =====================================================
-- TABELA DE SESSÕES ATIVAS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_fingerprint VARCHAR(255),
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_device_fingerprint (device_fingerprint),
    INDEX idx_last_activity (last_activity),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE SISTEMA DE INDICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_system (
    id INT PRIMARY KEY AUTO_INCREMENT,
    referrer_id INT NOT NULL,
    referred_id INT NOT NULL,
    referral_code VARCHAR(50),
    bonus_amount DECIMAL(10,2) DEFAULT 5.00,
    commission_rate DECIMAL(5,4) DEFAULT 0.05,
    status ENUM('pending', 'completed', 'failed', 'expired') DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_referrer_id (referrer_id),
    INDEX idx_referred_id (referred_id),
    INDEX idx_referral_code (referral_code),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_referred (referred_id)
);

-- =====================================================
-- TABELA DE PLANOS DE ASSINATURA
-- =====================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle ENUM('monthly', 'quarterly', 'yearly', 'lifetime') NOT NULL,
    features JSON,
    consultation_limit INT DEFAULT -1,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_slug (slug),
    INDEX idx_is_active (is_active),
    INDEX idx_sort_order (sort_order)
);

-- =====================================================
-- TABELA DE ASSINATURAS DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS user_subscriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_id INT NOT NULL,
    status ENUM('active', 'cancelled', 'expired', 'suspended') DEFAULT 'active',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    auto_renew BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50),
    external_subscription_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_plan_id (plan_id),
    INDEX idx_status (status),
    INDEX idx_ends_at (ends_at),
    INDEX idx_external_id (external_subscription_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
);


-- =====================================================
-- TABELA DE NEWSLETTER
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150),
    status ENUM('active', 'unsubscribed', 'bounced') DEFAULT 'active',
    source VARCHAR(50) DEFAULT 'website',
    tags JSON,
    ip_address VARCHAR(45),
    confirmed_at TIMESTAMP NULL,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABELA DE CAMPANHAS DE NEWSLETTER
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_campaigns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    template VARCHAR(100),
    status ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled') DEFAULT 'draft',
    recipient_count INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    open_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    sent_at TIMESTAMP NULL,
    scheduled_for TIMESTAMP NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at),
    INDEX idx_created_by (created_by),
    INDEX idx_scheduled_for (scheduled_for),
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE SUPORTE E CHAMADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    priority ENUM('baixa', 'normal', 'alta', 'urgente') DEFAULT 'normal',
    status ENUM('aberto', 'em-andamento', 'aguardando-cliente', 'resolvido', 'fechado') DEFAULT 'aberto',
    assigned_to INT NULL,
    satisfaction_rating INT NULL,
    satisfaction_comment TEXT NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELA DE RESPOSTAS DE CHAMADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT NOT NULL,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_internal (is_internal),
    
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- TABELA DE NOTIFICAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =====================================================

-- Configurações iniciais do sistema
INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, category, is_public) VALUES
('api_base_url', 'https://api.artepuradesign.com.br', 'string', 'URL base da API de consultas', 'api', FALSE),
('api_timeout', '30', 'number', 'Timeout das requisições em segundos', 'api', FALSE),
('api_key', '', 'string', 'Chave da API principal', 'api', FALSE),
('database_url', '', 'string', 'URL de conexão do banco de dados', 'database', FALSE),
('max_daily_consultations', '100', 'number', 'Máximo de consultas por dia por usuário', 'limits', TRUE),
('referral_bonus', '5.00', 'number', 'Valor do bônus de indicação', 'financial', TRUE),
('welcome_bonus', '5.00', 'number', 'Valor do bônus de boas-vindas', 'financial', TRUE),
('maintenance_mode', 'false', 'boolean', 'Modo de manutenção ativo', 'system', TRUE),
('min_withdrawal_amount', '10.00', 'number', 'Valor mínimo para saque', 'financial', TRUE),
('system_commission', '0.05', 'number', 'Comissão do sistema (5%)', 'financial', FALSE),
('site_name', 'Sistema APD', 'string', 'Nome do site', 'general', TRUE),
('support_email', 'suporte@artepuradesign.com.br', 'string', 'Email de suporte', 'general', TRUE),
('company_name', 'Arte Pura Design', 'string', 'Nome da empresa', 'general', TRUE),
('company_website', 'https://artepuradesign.com.br', 'string', 'Website da empresa', 'general', TRUE),
('rate_limit_requests', '120', 'number', 'Limite de requisições por minuto', 'api', FALSE),
('jwt_expiration', '3600', 'number', 'Tempo de expiração do JWT em segundos', 'security', FALSE),
('enable_two_factor', 'false', 'boolean', 'Habilitar autenticação de dois fatores', 'security', TRUE),
('backup_retention_days', '30', 'number', 'Dias de retenção de backup', 'system', FALSE);

-- Módulos disponíveis
INSERT IGNORE INTO modules (name, slug, description, endpoint, price, category, icon) VALUES
('Consulta CPF', 'cpf-consultation', 'Consulta completa de dados do CPF', '/api/v2/cpf', 2.50, 'consultation', 'user'),
('Consulta CNPJ', 'cnpj-consultation', 'Consulta completa de dados do CNPJ', '/api/v2/cnpj', 3.00, 'consultation', 'building'),
('Consulta Veículo', 'vehicle-consultation', 'Consulta de dados do veículo por placa', '/api/v2/vehicle', 4.00, 'consultation', 'car'),
('Busca por Nome', 'name-search', 'Busca pessoas por nome completo', '/api/v2/search/name', 2.00, 'search', 'search'),
('Busca por Nome da Mãe', 'mother-search', 'Busca pessoas pelo nome da mãe', '/api/v2/search/mother', 2.00, 'search', 'user-search'),
('Busca por Nome do Pai', 'father-search', 'Busca pessoas pelo nome do pai', '/api/v2/search/father', 2.00, 'search', 'user-search'),
('Checker Lista', 'batch-checker', 'Verificação em lote de documentos', '/api/v2/batch/check', 1.50, 'utility', 'list-checks'),
('Validação Telefone', 'phone-validation', 'Validação de números de telefone', '/api/v2/validate/phone', 1.00, 'validation', 'phone'),
('Validação Email', 'email-validation', 'Validação de endereços de email', '/api/v2/validate/email', 0.50, 'validation', 'mail');

-- Planos de assinatura
INSERT IGNORE INTO subscription_plans (name, slug, description, price, billing_cycle, features, consultation_limit) VALUES
('Básico', 'basic', 'Plano básico com consultas limitadas', 29.90, 'monthly', '["100 consultas CPF", "50 consultas CNPJ", "Suporte por email"]', 150),
('Profissional', 'professional', 'Plano profissional com mais recursos', 79.90, 'monthly', '["500 consultas CPF", "300 consultas CNPJ", "200 consultas Veículo", "Suporte prioritário", "API Access"]', 1000),
('Empresarial', 'enterprise', 'Plano empresarial com consultas ilimitadas', 199.90, 'monthly', '["Consultas ilimitadas", "Suporte 24/7", "API completa", "Relatórios avançados", "Integração personalizada"]', -1),
('Anual Básico', 'basic-yearly', 'Plano básico anual com desconto', 299.90, 'yearly', '["100 consultas CPF", "50 consultas CNPJ", "Suporte por email", "2 meses grátis"]', 150),
('Anual Profissional', 'professional-yearly', 'Plano profissional anual com desconto', 799.90, 'yearly', '["500 consultas CPF", "300 consultas CNPJ", "200 consultas Veículo", "Suporte prioritário", "API Access", "2 meses grátis"]', 1000);

-- =====================================================
-- PROCEDURES ARMAZENADOS ATUALIZADOS
-- =====================================================

DELIMITER //

-- Procedure para atualizar saldo do usuário com transação
CREATE PROCEDURE IF NOT EXISTS UpdateUserBalance(
    IN p_user_id INT,
    IN p_amount DECIMAL(10,2),
    IN p_transaction_type VARCHAR(50),
    IN p_description VARCHAR(200),
    IN p_payment_method VARCHAR(50)
)
BEGIN
    DECLARE current_balance DECIMAL(10,2);
    DECLARE transaction_id INT;
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    SELECT saldo INTO current_balance FROM users WHERE id = p_user_id FOR UPDATE;
    
    IF current_balance IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Usuário não encontrado';
    END IF;
    
    -- Inserir transação financeira
    INSERT INTO financial_transactions (user_id, transaction_type, amount, net_amount, status, payment_method, description) 
    VALUES (p_user_id, p_transaction_type, p_amount, p_amount, 'completed', p_payment_method, p_description);
    
    SET transaction_id = LAST_INSERT_ID();
    
    -- Atualizar saldo do usuário
    IF p_transaction_type IN ('DEPOSIT', 'BONUS', 'REFUND') THEN
        UPDATE users SET saldo = saldo + p_amount, updated_at = NOW() WHERE id = p_user_id;
    ELSEIF p_transaction_type IN ('WITHDRAWAL', 'CONSULTATION', 'FEE') THEN
        IF current_balance >= p_amount THEN
            UPDATE users SET saldo = saldo - p_amount, updated_at = NOW() WHERE id = p_user_id;
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente';
        END IF;
    END IF;
    
    -- Inserir no histórico de consultas se for uma consulta
    IF p_transaction_type = 'CONSULTATION' THEN
        INSERT INTO consultation_history (user_id, consultation_type, document, cost, success) 
        VALUES (p_user_id, 'SYSTEM', p_description, p_amount, TRUE);
    END IF;
    
    COMMIT;
    
    SELECT transaction_id as transaction_id, 'SUCCESS' as status;
END //

-- Procedure para processar consulta
CREATE PROCEDURE IF NOT EXISTS ProcessConsultation(
    IN p_user_id INT,
    IN p_consultation_type VARCHAR(50),
    IN p_document VARCHAR(100),
    IN p_cost DECIMAL(10,2),
    IN p_ip_address VARCHAR(45),
    IN p_user_agent TEXT
)
BEGIN
    DECLARE current_balance DECIMAL(10,2);
    DECLARE consultation_id INT;
    DECLARE exit handler for sqlexception
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    SELECT saldo INTO current_balance FROM users WHERE id = p_user_id FOR UPDATE;
    
    IF current_balance < p_cost THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente para realizar a consulta';
    END IF;
    
    -- Debitar saldo
    UPDATE users SET saldo = saldo - p_cost WHERE id = p_user_id;
    
    -- Inserir consulta
    INSERT INTO consultation_history (user_id, consultation_type, document, cost, ip_address, user_agent) 
    VALUES (p_user_id, p_consultation_type, p_document, p_cost, p_ip_address, p_user_agent);
    
    SET consultation_id = LAST_INSERT_ID();
    
    -- Inserir transação financeira
    INSERT INTO financial_transactions (user_id, transaction_type, amount, net_amount, status, description) 
    VALUES (p_user_id, 'CONSULTATION', p_cost, p_cost, 'completed', CONCAT('Consulta ', p_consultation_type, ' - ', p_document));
    
    COMMIT;
    
    SELECT consultation_id as consultation_id, 'SUCCESS' as status;
END //

-- Procedure para limpeza automática de dados
CREATE PROCEDURE IF NOT EXISTS AutoCleanupData()
BEGIN
    DECLARE cleaned_rows INT DEFAULT 0;
    
    -- Limpar logs de acesso antigos (mais de 90 dias)
    DELETE FROM access_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    SET cleaned_rows = cleaned_rows + ROW_COUNT();
    
    -- Limpar tokens expirados
    DELETE FROM auth_tokens WHERE expires_at < NOW() OR is_revoked = TRUE;
    SET cleaned_rows = cleaned_rows + ROW_COUNT();
    
    -- Limpar sessões expiradas
    DELETE FROM user_sessions WHERE expires_at < NOW() OR is_active = FALSE;
    SET cleaned_rows = cleaned_rows + ROW_COUNT();
    
    -- Limpar notificações expiradas
    DELETE FROM notifications WHERE expires_at < NOW();
    SET cleaned_rows = cleaned_rows + ROW_COUNT();
    
    -- Arquivar histórico muito antigo (mais de 2 anos)
    DELETE FROM consultation_history 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 2 YEAR) 
    AND consultation_type NOT IN ('CPF', 'CNPJ');
    SET cleaned_rows = cleaned_rows + ROW_COUNT();
    
    SELECT cleaned_rows as total_cleaned_rows, NOW() as cleaned_at;
END //

DELIMITER ;

-- =====================================================
-- VIEWS ATUALIZADAS PARA RELATÓRIOS
-- =====================================================

-- View para dashboard administrativo
CREATE OR REPLACE VIEW admin_dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE status = 'ativo') as active_users,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()) as new_users_today,
    (SELECT COUNT(*) FROM consultation_history WHERE DATE(created_at) = CURDATE()) as consultations_today,
    (SELECT SUM(amount) FROM financial_transactions WHERE transaction_type = 'DEPOSIT' AND DATE(created_at) = CURDATE()) as revenue_today,
    (SELECT COUNT(*) FROM support_tickets WHERE status IN ('aberto', 'em-andamento')) as open_tickets,
    (SELECT AVG(processing_time_ms) FROM consultation_history WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) as avg_response_time_ms;

-- View para relatórios financeiros
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE(ft.created_at) as date,
    SUM(CASE WHEN ft.transaction_type = 'DEPOSIT' THEN ft.amount ELSE 0 END) as total_deposits,
    SUM(CASE WHEN ft.transaction_type = 'WITHDRAWAL' THEN ft.amount ELSE 0 END) as total_withdrawals,
    SUM(CASE WHEN ft.transaction_type = 'CONSULTATION' THEN ft.amount ELSE 0 END) as consultation_revenue,
    SUM(CASE WHEN ft.transaction_type = 'BONUS' THEN ft.amount ELSE 0 END) as bonuses_paid,
    COUNT(DISTINCT ft.user_id) as active_users,
    COUNT(CASE WHEN ft.transaction_type = 'CONSULTATION' THEN 1 END) as total_consultations
FROM financial_transactions ft
WHERE ft.status = 'completed'
GROUP BY DATE(ft.created_at)
ORDER BY date DESC;

-- View para top usuários por uso
CREATE OR REPLACE VIEW top_users_by_usage AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    u.tipoplano,
    COUNT(ch.id) as total_consultations,
    SUM(ch.cost) as total_spent,
    MAX(ch.created_at) as last_consultation
FROM users u
LEFT JOIN consultation_history ch ON u.id = ch.user_id
WHERE u.status = 'ativo'
GROUP BY u.id, u.full_name, u.email, u.tipoplano
ORDER BY total_consultations DESC, total_spent DESC
LIMIT 100;

-- =====================================================
-- TRIGGERS PARA LOGS E AUDITORIA
-- =====================================================

DELIMITER //

CREATE TRIGGER IF NOT EXISTS user_balance_audit
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.saldo != NEW.saldo THEN
        INSERT INTO access_logs (user_id, action, resource, details) 
        VALUES (NEW.id, 'balance_updated', 'users', 
                JSON_OBJECT(
                    'old_balance', OLD.saldo, 
                    'new_balance', NEW.saldo,
                    'difference', NEW.saldo - OLD.saldo,
                    'timestamp', NOW()
                ));
    END IF;
END //

CREATE TRIGGER IF NOT EXISTS user_status_audit
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO access_logs (user_id, action, resource, details) 
        VALUES (NEW.id, 'status_changed', 'users', 
                JSON_OBJECT(
                    'old_status', OLD.status, 
                    'new_status', NEW.status,
                    'timestamp', NOW()
                ));
    END IF;
END //

CREATE TRIGGER IF NOT EXISTS new_user_audit
AFTER INSERT ON users
FOR EACH ROW
BEGIN
    INSERT INTO access_logs (user_id, action, resource, details) 
    VALUES (NEW.id, 'user_created', 'users', 
            JSON_OBJECT(
                'email', NEW.email, 
                'role', NEW.user_role,
                'plan', NEW.tipoplano,
                'timestamp', NOW()
            ));
            
    -- Criar notificação de boas-vindas
    INSERT INTO notifications (user_id, type, title, message) 
    VALUES (NEW.id, 'welcome', 'Bem-vindo ao Sistema APD!', 
            'Sua conta foi criada com sucesso. Explore nossos serviços de consulta.');
END //

DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_users_role_status_created ON users(user_role, status, created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_user_date ON consultation_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_financial_user_type_date ON financial_transactions(user_id, transaction_type, created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_action_date ON access_logs(user_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_status_priority ON support_tickets(status, priority, created_at);

-- Índices para relatórios
CREATE INDEX IF NOT EXISTS idx_consultation_history_date ON consultation_history(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_users_registration_date ON users(DATE(created_at));

-- =====================================================
-- CONFIGURAÇÕES FINAIS E OTIMIZAÇÕES
-- =====================================================

-- Configurar charset e collation para todas as tabelas
ALTER DATABASE sistema_consultas_apd CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Otimizar tabelas após criação
OPTIMIZE TABLE users, consultation_history, financial_transactions, access_logs, system_settings;

-- =====================================================
-- VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar integridade das foreign keys
SET foreign_key_checks = 1;

-- Mostrar estatísticas finais
SELECT 
    'Database setup completed successfully!' as status,
    NOW() as completed_at,
    DATABASE() as database_name,
    @@version as mysql_version;

-- Resumo das tabelas criadas
SELECT 
    TABLE_NAME as 'Tabela',
    TABLE_ROWS as 'Registros',
    ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as 'Tamanho_MB',
    TABLE_COLLATION as 'Collation'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

-- Resumo dos índices
SELECT 
    TABLE_NAME as 'Tabela',
    INDEX_NAME as 'Índice',
    COLUMN_NAME as 'Coluna',
    CARDINALITY as 'Cardinalidade'
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME, INDEX_NAME;

COMMIT;
`;
};
