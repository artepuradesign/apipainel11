
<?php
// src/routes/api.php - Roteador principal da API

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/ApiKeyMiddleware.php';
require_once __DIR__ . '/../middleware/RateLimitMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Carregar configurações centralizadas PRIMEIRO
require_once __DIR__ . '/../../config/conexao.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("API_ROUTES: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

$rateLimitMiddleware = new RateLimitMiddleware($db);
if (!$rateLimitMiddleware->handle()) {
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

// Se vazio, redirecionar para home
if (empty($path) || $path === '/') {
    $path = '/home';
}

error_log("API_ROUTER: Método {$method}, Path: {$path}");

// Endpoints públicos que não precisam de API Key
$publicEndpoints = [
    '/home', '/plans', '/panels', '/modules', '/modules/public', '/panels/public', '/testimonials', 
    '/system/status', '/test', '/webhooks', '/n8n', '/revendas/validate', '/contadores/register'
];
$isPublicEndpoint = false;
foreach ($publicEndpoints as $publicPath) {
    if (strpos($path, $publicPath) === 0) {
        $isPublicEndpoint = true;
        break;
    }
}

// Validar API Key global para endpoints não públicos
if (!$isPublicEndpoint) {
    $apiKeyMiddleware = new ApiKeyMiddleware($db);
    if (!$apiKeyMiddleware->validateGlobalApiKey()) {
        exit; // Middleware já enviou a resposta de erro
    }
}

// Roteamento principal expandido
if (strpos($path, '/auth') === 0) {
    require_once __DIR__ . '/auth.php';
} elseif (strpos($path, '/admin') === 0) {
    require_once __DIR__ . '/admin.php';
} elseif (strpos($path, '/dashboard-admin') === 0) {
    require_once __DIR__ . '/dashboard_admin.php';
} elseif (strpos($path, '/dashboard') === 0) {
    require_once __DIR__ . '/dashboard.php';
} elseif (strpos($path, '/payments') === 0) {
    require_once __DIR__ . '/payments.php';
} elseif (strpos($path, '/consultations') === 0) {
    require_once __DIR__ . '/consultations.php';
} elseif (strpos($path, '/consultas-nome') === 0) {
    require_once __DIR__ . '/consultas-nome.php';
} elseif (strpos($path, '/consultas') === 0) {
    require_once __DIR__ . '/consultas.php';
} elseif (strpos($path, '/wallet') === 0) {
    require_once __DIR__ . '/wallet.php';
} elseif (strpos($path, '/support') === 0) {
    require_once __DIR__ . '/support.php';
} elseif (strpos($path, '/reports') === 0) {
    require_once __DIR__ . '/reports.php';
} elseif (strpos($path, '/users') === 0) {
    require_once __DIR__ . '/users.php';
} elseif (strpos($path, '/plans') === 0) {
    require_once __DIR__ . '/plans.php';
} elseif (strpos($path, '/modules') === 0) {
    require_once __DIR__ . '/modules.php';
} elseif (strpos($path, '/panels') === 0) {
    require_once __DIR__ . '/panels.php';
} elseif (strpos($path, '/notifications') === 0) {
    require_once __DIR__ . '/notifications.php';
} elseif (strpos($path, '/system-config') === 0) {
    require_once __DIR__ . '/system_config.php';
} elseif (strpos($path, '/system') === 0) {
    require_once __DIR__ . '/system.php';
} elseif (strpos($path, '/history') === 0) {
    require_once __DIR__ . '/history.php';
} elseif (strpos($path, '/webhooks') === 0) {
    require_once __DIR__ . '/webhooks.php';
} elseif (strpos($path, '/recharge') === 0) {
    error_log("API_ROUTER: Roteando para recharge.php - Path: " . $path);
    require_once __DIR__ . '/recharge.php';
} elseif (strpos($path, '/tabelas') === 0) {
    require_once __DIR__ . '/tabelas.php';
} elseif (strpos($path, '/base-auxilio-emergencial') === 0) {
    require_once __DIR__ . '/base_auxilio_emergencial.php';
} elseif (strpos($path, '/base-cnpj-mei') === 0) {
    // Usa rota padronizada (CRUD completo com AuthMiddleware + CORS)
    require_once __DIR__ . '/base_cnpj_mei.php';
} elseif (strpos($path, '/base-dividas-ativas') === 0) {
    require_once __DIR__ . '/base_dividas_ativas.php';
} elseif (strpos($path, '/base-gestao') === 0) {
    require_once __DIR__ . '/base_gestao.php';
} elseif (strpos($path, '/base-documento') === 0) {
    require_once __DIR__ . '/../../routes/base-documento.php';
} elseif (strpos($path, '/base-senha-email') === 0) {
    require_once __DIR__ . '/base_senha_email.php';
} elseif (strpos($path, '/base-senha-cpf') === 0) {
    require_once __DIR__ . '/base_senha_cpf.php';
} elseif (strpos($path, '/n8n') === 0) {
    require_once __DIR__ . '/n8n.php';
} elseif (strpos($path, '/revendas') === 0) {
    require_once __DIR__ . '/revendas.php';
} elseif (strpos($path, '/home') === 0 || strpos($path, '/testimonials') === 0) {
    require_once __DIR__ . '/public.php';
} elseif (strpos($path, '/proxy-busca-nome') === 0) {
    require_once __DIR__ . '/proxy-busca-nome.php';
} elseif (strpos($path, '/editaveis-rg') === 0) {
    require_once __DIR__ . '/editaveis_rg.php';
} elseif (strpos($path, '/controle-pessoal') === 0) {
    require_once __DIR__ . '/controle_pessoal.php';
} elseif (strpos($path, '/controlepessoal-agenda') === 0) {
    require_once __DIR__ . '/controlepessoal_agenda.php';
} elseif (strpos($path, '/controlepessoal-financeiro') === 0) {
    require_once __DIR__ . '/controlepessoal_financeiro.php';
} elseif (strpos($path, '/controlepessoal-novocliente') === 0) {
    require_once __DIR__ . '/controlepessoal_novocliente.php';
} elseif (strpos($path, '/controlepessoal-relatorios') === 0) {
    require_once __DIR__ . '/controlepessoal_relatorios.php';
} elseif (strpos($path, '/controlepessoal-vendasimples') === 0) {
    require_once __DIR__ . '/controlepessoal_vendasimples.php';
} elseif (strpos($path, '/login-hotmail') === 0) {
    require_once __DIR__ . '/login_hotmail.php';
} elseif (strpos($path, '/login-renner') === 0) {
    require_once __DIR__ . '/login_renner.php';
} elseif (strpos($path, '/pdf-rg') === 0) {
    require_once __DIR__ . '/pdf_rg.php';
} elseif (strpos($path, '/base-bo') === 0) {
    require_once __DIR__ . '/base_bo.php';
} elseif (strpos($path, '/pdf-personalizado') === 0) {
    require_once __DIR__ . '/pdf_personalizado.php';
} elseif (strpos($path, '/sistemas-dominio-com-br') === 0) {
    require_once __DIR__ . '/sistemas_dominio_com_br.php';
} elseif (strpos($path, '/sistemas-dominio-com') === 0) {
    require_once __DIR__ . '/sistemas_dominio_com.php';
} elseif (strpos($path, '/sistemas-hospedagem-vps-6') === 0) {
    require_once __DIR__ . '/sistemas_hospedagem_vps_6.php';
} elseif (strpos($path, '/contadores') === 0) {
    require_once __DIR__ . '/contadores.php';
} else {
    error_log("API_ROUTER: Endpoint não encontrado - {$path}");
    Response::error('Endpoint não encontrado', 404);
}
