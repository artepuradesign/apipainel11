-- =====================================================
-- Migration: Adicionar contatos de redes sociais
-- Tabela: system_config
-- Data: 2026-02-24
-- Descrição: Insere registros de contatos sociais 
--            para botões flutuantes da página inicial
-- =====================================================

INSERT INTO `system_config` (`config_key`, `config_value`, `config_type`, `category`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
('contact_whatsapp_number', '5598981074836', 'string', 'contacts', 'Número do WhatsApp com código do país (apenas números)', 1, NOW(), NOW()),
('contact_whatsapp_message', 'Olá, pode me ajudar? Estou no site apipainel.com.br', 'string', 'contacts', 'Mensagem padrão do WhatsApp', 1, NOW(), NOW()),
('contact_telegram_username', 'apipainel_bot', 'string', 'contacts', 'Username do Telegram (sem @)', 1, NOW(), NOW()),
('contact_instagram_username', 'apipainel', 'string', 'contacts', 'Username do Instagram (sem @)', 1, NOW(), NOW()),
('contact_tiktok_username', 'apipainel', 'string', 'contacts', 'Username do TikTok (sem @)', 1, NOW(), NOW()),
('contact_whatsapp_enabled', 'true', 'boolean', 'contacts', 'Exibir botão do WhatsApp', 1, NOW(), NOW()),
('contact_telegram_enabled', 'true', 'boolean', 'contacts', 'Exibir botão do Telegram', 1, NOW(), NOW()),
('contact_instagram_enabled', 'true', 'boolean', 'contacts', 'Exibir botão do Instagram', 1, NOW(), NOW()),
('contact_tiktok_enabled', 'true', 'boolean', 'contacts', 'Exibir botão do TikTok', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();
