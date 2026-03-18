<?php
/**
 * EXEMPLO DE ARQUIVO DE CONFIGURAÇÃO DO MERCADO PAGO
 * 
 * Este arquivo deve ser colocado em: api/config/mercadopago.php
 * 
 * IMPORTANTE: Nunca commite este arquivo com as credenciais reais!
 * Adicione api/config/mercadopago.php ao .gitignore
 */

// Ambiente: 'sandbox' para testes ou 'production' para produção
define('MERCADOPAGO_ENVIRONMENT', 'sandbox');

/**
 * Access Token do Mercado Pago
 * 
 * Para obter suas credenciais:
 * 1. Acesse: https://www.mercadopago.com.br/developers/panel/app
 * 2. Crie uma aplicação ou selecione uma existente
 * 3. Vá em "Credenciais" no menu lateral
 * 4. Para testes, use as credenciais de "Credenciais de teste"
 * 5. Para produção, use as "Credenciais de produção"
 * 
 * SANDBOX (Testes):
 * - Use o Access Token de teste (TEST-...)
 * 
 * PRODUCTION (Produção):
 * - Use o Access Token de produção (APP_USR-...)
 */
define('MERCADOPAGO_ACCESS_TOKEN', 'TEST-1234567890123456-123456-abcdef1234567890abcdef1234567890-123456789');

/**
 * Public Key (opcional - usado para integrações client-side)
 * Não é necessário para criar pagamentos via server-side
 */
define('MERCADOPAGO_PUBLIC_KEY', 'TEST-abc123-def456-ghi789');

/**
 * Webhook URL (opcional)
 * URL que receberá notificações de mudança de status dos pagamentos
 * Exemplo: https://seu-dominio.com/api/mercadopago/webhook
 */
define('MERCADOPAGO_WEBHOOK_URL', '');

/**
 * Configurações adicionais
 */
define('MERCADOPAGO_PAYMENT_EXPIRATION_MINUTES', 30); // Tempo de expiração do PIX em minutos

/**
 * URLs da API do Mercado Pago
 */
define('MERCADOPAGO_API_BASE_URL', 
    MERCADOPAGO_ENVIRONMENT === 'sandbox' 
        ? 'https://api.mercadopago.com' 
        : 'https://api.mercadopago.com'
);

/**
 * Função auxiliar para obter o token de acesso
 */
function getMercadoPagoAccessToken() {
    return MERCADOPAGO_ACCESS_TOKEN;
}

/**
 * Função auxiliar para verificar se está em modo sandbox
 */
function isMercadoPagoSandbox() {
    return MERCADOPAGO_ENVIRONMENT === 'sandbox';
}
