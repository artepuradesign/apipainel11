<?php
/**
 * Configuração do Mercado Pago - SERVIDOR EXTERNO
 * 
 * IMPORTANTE:
 * - Este arquivo contém credenciais de produção do Mercado Pago
 * - Mantenha este arquivo FORA do controle de versão em produção
 * - Use variáveis de ambiente para maior segurança
 * - Este arquivo está no servidor externo em: https://api.artepuradesign.com.br/config/mercadopago.php
 */

return [
    // Access Token de PRODUÇÃO
    // Em produção, use: getenv('MERCADOPAGO_ACCESS_TOKEN')
    'access_token' => getenv('MERCADOPAGO_ACCESS_TOKEN') ?: 'APP_USR-4356250371418070-100806-7161de81ce7962e921c72995bb35ab24-342770905',

    // Public Key (opcional, usado em alguns fluxos do Mercado Pago)
    'public_key' => getenv('MERCADOPAGO_PUBLIC_KEY') ?: 'APP_USR-e67170f1-e789-4f25-9c44-ed9d83d8b9bc',

    // Integrator ID (opcional, apenas se aplicável)
    'integrator_id' => getenv('MERCADOPAGO_INTEGRATOR_ID') ?: '342770905',
    
    // Webhook Secret (obtenha no painel do Mercado Pago > Webhooks)
    // IMPORTANTE: Configure esta chave após criar o webhook em "Suas integrações"
    'webhook_secret' => getenv('MERCADOPAGO_WEBHOOK_SECRET') ?: null,

    // Ambiente: true = produção, false = sandbox
    'production' => true,

    // Configurações padrão do PIX
    'pix' => [
        'expiration_minutes' => 30, // tempo padrão de expiração do QR Code
    ],
];
