
<?php
// index.php - Roteador principal da API

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Responder OPTIONS para CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Includes necessários
require_once __DIR__ . '/config/conexao.php';
require_once __DIR__ . '/src/utils/Response.php';

// Conectar ao banco
try {
    $db = getDBConnection();
} catch (Exception $e) {
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit();
}

// Capturar método e endpoint
$method = $_SERVER['REQUEST_METHOD'];
$endpoint = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar endpoint (robusto para diferentes configurações do servidor)
// - garante 1 barra no início
// - remove prefixos comuns (/api, /public e /index.php)
// - remove barra final (exceto para "/")
$endpoint = '/' . ltrim($endpoint ?? '/', '/');

// Remove /public (quando o DocumentRoot aponta para uma pasta acima e o URI inclui /public)
// Ex.: /public/base-certidao/cpf/5172
$endpoint = preg_replace('#^/public(?=/|$)#', '', $endpoint);

// Remove /api (com ou sem barra no final)
$endpoint = preg_replace('#^/api(?=/|$)#', '', $endpoint);

// Alguns setups podem expor /api/public/... (defensivo)
$endpoint = preg_replace('#^/api/public(?=/|$)#', '', $endpoint);

// Remove /index.php (em servidores que roteam via front controller)
$endpoint = preg_replace('#^/index\.php(?=/|$)#', '', $endpoint);

// Normaliza novamente após removers
$endpoint = '/' . ltrim($endpoint ?? '/', '/');
if ($endpoint !== '/') {
    $endpoint = rtrim($endpoint, '/');
}

// Log da requisição
error_log("🔍 API REQUEST: {$method} {$endpoint}");
error_log("🔍 REQUEST_URI: " . $_SERVER['REQUEST_URI']);
error_log("🔍 ENDPOINT DEBUG: endpoint='{$endpoint}', starts_with_consultations=" . (strpos($endpoint, '/consultations') === 0 ? 'YES' : 'NO'));
error_log("🚗 VERIFICANDO base-historico-veiculo: strpos='" . strpos($endpoint, '/base-historico-veiculo') . "' (false=" . (strpos($endpoint, '/base-historico-veiculo') === false ? 'YES' : 'NO') . ")");

// Roteamento principal
try {
    // Suporte
    if (strpos($endpoint, '/routes/support') === 0) {
        include __DIR__ . '/routes/support.php';
        exit();
    }
    
    // Sistema de revenda
    if (strpos($endpoint, '/revendas') === 0) {
        include __DIR__ . '/src/routes/revendas.php';
        exit();
    }
    
    // Sistema de indicação
    if (strpos($endpoint, '/referral-system') === 0) {
        include __DIR__ . '/src/routes/referrals.php';
        exit();
    }
    
    // Depoimentos
    if (strpos($endpoint, '/testimonials') === 0) {
        include __DIR__ . '/src/routes/testimonials.php';
        exit();
    }

    // Planos
    if (strpos($endpoint, '/plans') === 0) {
        include __DIR__ . '/src/routes/plans.php';
        exit();
    }

    // Painéis
    if (strpos($endpoint, '/panels') === 0) {
        include __DIR__ . '/src/routes/panels.php';
        exit();
    }

    // Módulos
    if (strpos($endpoint, '/modules') === 0) {
        include __DIR__ . '/src/routes/modules.php';
        exit();
    }
    
    // Autenticação
    if (strpos($endpoint, '/auth') === 0) {
        include __DIR__ . '/src/routes/auth.php';
        exit();
    }
    
    // Sistema de configuração
    if (strpos($endpoint, '/system') === 0) {
        include __DIR__ . '/src/routes/system.php';
        exit();
    }
    
    // Carteira
    if (strpos($endpoint, '/wallet') === 0) {
        include __DIR__ . '/src/routes/wallet.php';
        exit();
    }
    
    // Sessões de usuário
    if (strpos($endpoint, '/user-sessions') === 0) {
        include __DIR__ . '/src/routes/user-sessions.php';
        exit();
    }
    
    // Monitor de sessões
    if (strpos($endpoint, '/session-monitor') === 0) {
        include __DIR__ . '/endpoints/session-monitor.php';
        exit();
    }
    
    // Dashboard Admin
    if (strpos($endpoint, '/dashboard-admin') === 0) {
        include __DIR__ . '/src/routes/dashboard_admin.php';
        exit();
    }
    
    // Notificações - precisa vir antes de outras rotas
    if (strpos($endpoint, '/notifications') === 0) {
        include __DIR__ . '/src/routes/notifications.php';
        exit();
    }
    
    // Premium status do usuário
    if (strpos($endpoint, '/user/premium-status') === 0) {
        include __DIR__ . '/routes/user-premium-status.php';
        exit();
    }

    // Compra de planos - verifica se começa com /plan/
    if (strpos($endpoint, '/plan/') === 0 || strpos($endpoint, '/user/active-plan') === 0 || strpos($endpoint, '/user/plan-usage') === 0) {
        include __DIR__ . '/src/routes/plan-purchase.php';
        exit();
    }
    
    // Configuração do sistema - GET e UPDATE
    if (strpos($endpoint, '/system-config') === 0) {
        if ($endpoint === '/system-config/get' && $method === 'GET') {
            include __DIR__ . '/src/endpoints/system-config/get.php';
            exit();
        }
        if ($endpoint === '/system-config/update' && ($method === 'POST' || $method === 'PUT')) {
            include __DIR__ . '/src/endpoints/system-config/update.php';
            exit();
        }
        // Fallback antigo
        if ($endpoint === '/system-config-get' || $endpoint === '/system-config-get.php') {
            if ($method === 'GET') {
                include __DIR__ . '/system-config-get.php';
                exit();
            }
        }
    }
    
    // Sistema de auditoria/logs de acesso
    if (strpos($endpoint, '/access-logs') === 0 || strpos($endpoint, '/user-audit') === 0) {
        include __DIR__ . '/src/routes/user-audit.php';
        exit();
    }
    
    // Lista de usuários - endpoint simplificado para cupons
    if ($endpoint === '/users-list' || $endpoint === '/users-list.php') {
        include __DIR__ . '/src/endpoints/users-list.php';
        exit();
    }
    
    // Cupons - endpoints de cupons
    if (strpos($endpoint, '/src/endpoints/') !== false && (strpos($endpoint, 'cupom') !== false || strpos($endpoint, '/cupons') !== false)) {
        include __DIR__ . '/src/routes/cupons.php';
        exit();
    }
    
    if (strpos($endpoint, '/cupons') !== false || strpos($endpoint, '/validate-cupom') !== false || strpos($endpoint, '/use-cupom') !== false || strpos($endpoint, '/cupom-historico') !== false) {
        include __DIR__ . '/src/routes/cupons.php';
        exit();
    }
    
    
    // Consultations - novo sistema de consultas integrado
    if (strpos($endpoint, '/consultations') !== false || $endpoint === '/consultations') {
        error_log("MAIN ROUTER: Redirecionando para consultations.php - endpoint: {$endpoint}");
        include __DIR__ . '/src/routes/consultations.php';
        exit();
    }

    // Consultas por Nome Completo (deve vir antes de /consultas, pois /consultas-nome também começa com /consultas)
    if (strpos($endpoint, '/consultas-nome') === 0) {
        error_log("MAIN ROUTER: Redirecionando para consultas-nome.php - endpoint: {$endpoint}");
        include __DIR__ . '/src/routes/consultas-nome.php';
        exit();
    }
    
    // Consultas - sistema de consultas CPF/CNPJ/etc
    if (strpos($endpoint, '/consultas') === 0) {
        include __DIR__ . '/src/routes/consultas.php';
        exit();
    }
    
    // Base CPF - CRUD completo para base_cpf
    if (strpos($endpoint, '/base-cpf') === 0) {
        include __DIR__ . '/src/routes/base_cpf.php';
        exit();
    }
    
    // Base CNPJ - CRUD completo para base_cnpj
    if (strpos($endpoint, '/base-cnpj') === 0) {
        include __DIR__ . '/src/routes/base_cnpj.php';
        exit();
    }
    
    // Base RG - CRUD completo para base_rg
    if (strpos($endpoint, '/base-rg') === 0) {
        include __DIR__ . '/src/routes/base_rg.php';
        exit();
    }

    // RG 2026 - CRUD para registros do módulo 57 (banco externo)
    if (strpos($endpoint, '/rg-2026') === 0) {
        include __DIR__ . '/src/routes/rg_2026.php';
        exit();
    }
    
    // Base CNH - CRUD completo para base_cnh
    if (strpos($endpoint, '/base-cnh') === 0) {
        include __DIR__ . '/src/routes/base_cnh.php';
        exit();
    }
    
    // Base Telefone - CRUD completo para base_telefone
    if (strpos($endpoint, '/base-telefone') === 0) {
        include __DIR__ . '/src/routes/base_telefone.php';
        exit();
    }
    
    // Base Email - CRUD completo para base_email
    if (strpos($endpoint, '/base-email') === 0) {
        include __DIR__ . '/src/routes/base_email.php';
        exit();
    }
    
    // Base Endereco - CRUD completo para base_endereco
    if (strpos($endpoint, '/base-endereco') === 0) {
        include __DIR__ . '/src/routes/base_endereco.php';
        exit();
    }

    // Base Certidão - consulta por cpf_id (base_certidao)
    if (strpos($endpoint, '/base-certidao') === 0) {
        $routeFile = __DIR__ . '/src/routes/base_certidao.php';
        error_log("📄 [INDEX.PHP] Rota base-certidao acionada. Arquivo={$routeFile}");
        error_log("📄 [INDEX.PHP] Arquivo existe? " . (file_exists($routeFile) ? 'SIM' : 'NÃO'));

        if (!file_exists($routeFile)) {
            Response::error('Arquivo de rota base_certidao.php não encontrado no servidor (deploy incompleto)', 500);
            exit();
        }

        include $routeFile;
        exit();
    }

    // Base CNS - CRUD e consulta por cpf_id (base_cns)
    if (strpos($endpoint, '/base-cns') === 0) {
        $routeFile = __DIR__ . '/src/routes/base_cns.php';
        error_log("📄 [INDEX.PHP] Rota base-cns acionada. Arquivo={$routeFile}");
        error_log("📄 [INDEX.PHP] Arquivo existe? " . (file_exists($routeFile) ? 'SIM' : 'NÃO'));

        if (!file_exists($routeFile)) {
            Response::error('Arquivo de rota base_cns.php não encontrado no servidor (deploy incompleto)', 500);
            exit();
        }

        include $routeFile;
        exit();
    }

    // Base Documento - CRUD e consulta por cpf_id (base_documento)
    if (strpos($endpoint, '/base-documento') === 0) {
        $routeFile = __DIR__ . '/routes/base-documento.php';
        error_log("📄 [INDEX.PHP] Rota base-documento acionada. Arquivo={$routeFile}");
        error_log("📄 [INDEX.PHP] Arquivo existe? " . (file_exists($routeFile) ? 'SIM' : 'NÃO'));

        if (!file_exists($routeFile)) {
            Response::error('Arquivo de rota base-documento.php não encontrado no servidor (deploy incompleto)', 500);
            exit();
        }

        include $routeFile;
        exit();
    }
    
    // Base Foto - CRUD completo para base_foto
    if (strpos($endpoint, '/base-foto') === 0) {
        include __DIR__ . '/src/routes/base_foto.php';
        exit();
    }
    
    // Base Senha CPF - CRUD completo para base_senha_cpf
    if (strpos($endpoint, '/base-senha-cpf') === 0) {
        include __DIR__ . '/routes/base-senha-cpf.php';
        exit();
    }
    
    // Base Senha Email - CRUD completo para base_senha_email
    if (strpos($endpoint, '/base-senha-email') === 0) {
        include __DIR__ . '/routes/base-senha-email.php';
        exit();
    }
    
    // Base Credilink - CRUD completo para base_credilink
    if (strpos($endpoint, '/base-credilink') === 0) {
        include __DIR__ . '/src/routes/base_credilink.php';
        exit();
    }
    
    // Base Vacina - CRUD completo para base_vacina
    if (strpos($endpoint, '/base-vacina') === 0) {
        include __DIR__ . '/src/routes/base_vacina.php';
        exit();
    }
    
    // Base Parente - CRUD completo para base_parente
    if (strpos($endpoint, '/base-parente') === 0) {
        include __DIR__ . '/src/routes/base_parente.php';
        exit();
    }
    
    // Base Empresa Socio - CRUD completo para base_empresa_socio
    if (strpos($endpoint, '/base-empresa-socio') === 0) {
        include __DIR__ . '/src/routes/base_empresa_socio.php';
        exit();
    }
    
    // Base Rais - CRUD completo para base_rais
    if (strpos($endpoint, '/base-rais') === 0) {
        include __DIR__ . '/src/routes/base_rais.php';
        exit();
    }
    
    // Base Vivo - CRUD completo para base_vivo
    if (strpos($endpoint, '/base-vivo') === 0) {
        include __DIR__ . '/src/routes/base_vivo.php';
        exit();
    }
    
    // Base Claro - CRUD completo para base_claro
    if (strpos($endpoint, '/base-claro') === 0) {
        include __DIR__ . '/src/routes/base_claro.php';
        exit();
    }
    
    // Base Tim - CRUD completo para base_tim
    if (strpos($endpoint, '/base-tim') === 0) {
        include __DIR__ . '/src/routes/base_tim.php';
        exit();
    }
    
    // Base Boletim Ocorrencia - CRUD completo para base_boletim_ocorrencia
    if (strpos($endpoint, '/base-boletim-ocorrencia') === 0) {
        include __DIR__ . '/src/routes/base_boletim_ocorrencia.php';
        exit();
    }
    
    // Base BO - CRUD completo para base_bo
    if (strpos($endpoint, '/base-bo') === 0) {
        include __DIR__ . '/src/routes/base_bo.php';
        exit();
    }
    
    // Base CNPJ MEI - CRUD completo para base_cnpj_mei
    if (strpos($endpoint, '/base-cnpj-mei') !== false) {
        include __DIR__ . '/routes/base-cnpj-mei.php';
        exit();
    }
    
    // Base Dívidas Ativas - CRUD completo para base_dividas_ativas
    if (strpos($endpoint, '/base-dividas-ativas') !== false) {
        include __DIR__ . '/routes/base-dividas-ativas.php';
        exit();
    }
    
    // Base Histórico Veículo - CRUD completo para base_historico_veiculo
    if (strpos($endpoint, '/base-historico-veiculo') === 0) {
        error_log("🚗 [INDEX.PHP] ✅ Roteando para base_historico_veiculo.php");
        include __DIR__ . '/src/routes/base_historico_veiculo.php';
        exit();
    }
    
    // Base Auxílio Emergencial - CRUD completo para base_auxilio_emergencial
    if (strpos($endpoint, '/base-auxilio-emergencial') !== false) {
        include __DIR__ . '/routes/base-auxilio-emergencial.php';
        exit();
    }
    
    // Base INSS - CRUD completo para base_inss
    if (strpos($endpoint, '/base-inss') !== false) {
        include __DIR__ . '/routes/base-inss.php';
        exit();
    }
    
    // Histórico CPF - endpoints combinados de histórico
    if (strpos($endpoint, '/consultas-cpf-history') === 0) {
        include __DIR__ . '/src/routes/consultas_cpf_history.php';
        exit();
    }
    
    // Histórico completo - endpoints de histórico do usuário
    if (strpos($endpoint, '/historico') === 0) {
        include __DIR__ . '/src/routes/historico.php';
        exit();
    }
    
    // Compartilhamento temporário de consultas (20 minutos)
    if (strpos($endpoint, '/shared-consultas-temp') === 0) {
        include __DIR__ . '/src/routes/shared_consultas_temp.php';
        exit();
    }

    // Consultas CPF - CRUD completo para consultas_cpf  
    if (strpos($endpoint, '/consultas-cpf') === 0) {
        include __DIR__ . '/src/routes/consultas_cpf.php';
        exit();
    }
    
    // Consultas CNPJ - CRUD completo para consultas_cnpj
    if (strpos($endpoint, '/consultas-cnpj') === 0) {
        include __DIR__ . '/src/routes/consultas_cnpj.php';
        exit();
    }
    
    // Usuários - Profile, balance, etc
    if (strpos($endpoint, '/users') === 0) {
        include __DIR__ . '/src/routes/users_complete.php';
        exit();
    }
    
    // Upload/serve de arquivos da pasta arquivosupload
    if (strpos($endpoint, '/upload/') === 0) {
        include __DIR__ . '/src/routes/upload.php';
        exit();
    }

    // Upload de BO (PDF Boletim de Ocorrência)
    if ($endpoint === '/upload-bo' || $endpoint === '/upload-bo.php') {
        include __DIR__ . '/upload-bo.php';
        exit();
    }
    
    // Upload de fotos
    if ($endpoint === '/enviar-foto.php' || $endpoint === '/enviar-foto') {
        include __DIR__ . '/enviar-foto.php';
        exit();
    }
    
    // Upload de fotos - FormData (usado pelo frontend)
    if ($endpoint === '/upload-photo' || $endpoint === '/upload-photo.php') {
        include __DIR__ . '/public/upload-photo.php';
        exit();
    }
    
    // Upload de fotos via base64 (usado pelo n8n)
    if ($endpoint === '/upload-photo-base64' || $endpoint === '/upload-photo-base64.php') {
        include __DIR__ . '/upload-photo-base64.php';
        exit();
    }

    // PIX Payments - rota direta para /pix-payments
    if (strpos($endpoint, '/pix-payments') === 0) {
        error_log("🔵 PIX_PAYMENTS ROUTER: endpoint={$endpoint}");
        error_log("🔵 PIX_PAYMENTS: METHOD={$method}");
        error_log("🔵 PIX_PAYMENTS: __DIR__=" . __DIR__);
        $pixFile = __DIR__ . '/pix-payments.php';
        error_log("🔵 PIX_PAYMENTS: Arquivo={$pixFile}");
        error_log("🔵 PIX_PAYMENTS: Arquivo existe? " . (file_exists($pixFile) ? 'SIM' : 'NÃO'));
        
        if (file_exists($pixFile)) {
            error_log("✅ PIX_PAYMENTS: Incluindo arquivo pix-payments.php");
            include $pixFile;
            exit();
        } else {
            error_log("❌ PIX_PAYMENTS: Arquivo pix-payments.php não encontrado!");
            Response::error('Arquivo de pagamentos PIX não encontrado no servidor', 500);
            exit();
        }
    }

    // Mercado Pago - rotas diretas
    if (strpos($endpoint, '/mercadopago/') === 0) {
        error_log("🔷 MERCADOPAGO ROUTER: endpoint={$endpoint}");
        
        // Remover query string para comparação
        $endpointClean = strtok($endpoint, '?');
        error_log("🔷 MERCADOPAGO: endpointClean={$endpointClean}");
        error_log("🔷 MERCADOPAGO: Verificando list-payments...");
        error_log("🔷 MERCADOPAGO: Comparação 1: " . ($endpointClean === '/mercadopago/list-payments' ? 'MATCH' : 'NO MATCH'));
        error_log("🔷 MERCADOPAGO: Comparação 2: " . ($endpointClean === '/mercadopago/list-payments.php' ? 'MATCH' : 'NO MATCH'));
        
        if ($endpointClean === '/mercadopago/list-payments' || $endpointClean === '/mercadopago/list-payments.php') {
            error_log("✅ MERCADOPAGO: MATCH! Redirecionando para list-payments.php");
            include __DIR__ . '/mercadopago/list-payments.php';
            exit();
        }
        
        if ($endpointClean === '/mercadopago/test-credentials' || $endpointClean === '/mercadopago/test-credentials.php') {
            error_log("🔷 MERCADOPAGO: Redirecionando para test-credentials.php");
            include __DIR__ . '/mercadopago/test-credentials.php';
            exit();
        }
        
        if ($endpointClean === '/mercadopago/document-types' || $endpointClean === '/mercadopago/document-types.php') {
            error_log("🔷 MERCADOPAGO: Redirecionando para document-types.php");
            include __DIR__ . '/mercadopago/document-types.php';
            exit();
        }
        
        if ($endpointClean === '/mercadopago/create-pix-payment' || $endpointClean === '/mercadopago/create-pix-payment.php') {
            error_log("🔷 MERCADOPAGO: Redirecionando para create-pix-payment.php");
            include __DIR__ . '/mercadopago/create-pix-payment.php';
            exit();
        }
        
        if ($endpointClean === '/mercadopago/check-payment-status' || $endpointClean === '/mercadopago/check-payment-status.php') {
            error_log("🔷 MERCADOPAGO: Redirecionando para check-payment-status.php");
            include __DIR__ . '/mercadopago/check-payment-status.php';
            exit();
        }
        
        if (strpos($endpointClean, '/mercadopago/webhook') === 0) {
            error_log("🔷 MERCADOPAGO: Redirecionando para webhook.php");
            include __DIR__ . '/src/routes/mercadopago-webhook.php';
            exit();
        }
        
        if (strpos($endpointClean, '/mercadopago/check-pending-payments') === 0) {
            error_log("🔷 MERCADOPAGO: Redirecionando para check-pending-payments.php");
            include __DIR__ . '/mercadopago/check-pending-payments.php';
            exit();
        }
        
        // Endpoint não encontrado
        error_log("❌ MERCADOPAGO: Endpoint não encontrado: {$endpointClean}");
        error_log("❌ MERCADOPAGO: Endpoints disponíveis: list-payments, test-credentials, document-types, create-pix-payment, check-payment-status, check-pending-payments, webhook");
        Response::error('Endpoint Mercado Pago não encontrado: ' . $endpointClean . '. Disponíveis: list-payments, test-credentials, document-types, create-pix-payment, check-payment-status, check-pending-payments, webhook', 404);
        exit();
    }
    
    // Update Expiry - Reativar validade de QR Code
    if ($endpoint === '/update-expiry' || $endpoint === '/update_expiry' || $endpoint === '/update_expiry.php') {
        if ($method === 'POST') {
            include __DIR__ . '/update_expiry.php';
            exit();
        }
    }
    
    // Login Hotmail - Módulo 162
    if (strpos($endpoint, '/login-hotmail') === 0) {
        include __DIR__ . '/src/routes/login_hotmail.php';
        exit();
    }

    // Login Gmail - Módulo 163
    if (strpos($endpoint, '/login-gmail') === 0) {
        include __DIR__ . '/src/routes/login_gmail.php';
        exit();
    }

    // Login Renner - Módulo 164
    if (strpos($endpoint, '/login-renner') === 0) {
        include __DIR__ . '/src/routes/login_renner.php';
        exit();
    }

    // PDF RG - Pedidos de confecção
    if (strpos($endpoint, '/pdf-rg') === 0) {
        include __DIR__ . '/src/routes/pdf_rg.php';
        exit();
    }

    // PDF Personalizado - Módulo 173
    if (strpos($endpoint, '/pdf-personalizado') === 0) {
        include __DIR__ . '/src/routes/pdf_personalizado.php';
        exit();
    }

    // Sistemas Domínio .COM - Módulo 176
    if (strpos($endpoint, '/sistemas-dominio-com') === 0) {
        include __DIR__ . '/src/routes/sistemas_dominio_com.php';
        exit();
    }

    // Sistemas Hospedagem VPS 6 meses - Módulo 177
    if (strpos($endpoint, '/sistemas-hospedagem-vps-6') === 0) {
        include __DIR__ . '/src/routes/sistemas_hospedagem_vps_6.php';
        exit();
    }

    // Editáveis RG - Módulo 85
    if (strpos($endpoint, '/editaveis-rg') === 0) {
        include __DIR__ . '/src/routes/editaveis_rg.php';
        exit();
    }

    // Controle Pessoal (geral)
    if (strpos($endpoint, '/controle-pessoal') === 0) {
        include __DIR__ . '/src/routes/controle_pessoal.php';
        exit();
    }

    // Controle Pessoal por módulo (rotas dedicadas para cada página)
    if (strpos($endpoint, '/controlepessoal-agenda') === 0) {
        include __DIR__ . '/src/routes/controlepessoal_agenda.php';
        exit();
    }

    if (strpos($endpoint, '/controlepessoal-financeiro') === 0) {
        include __DIR__ . '/src/routes/controlepessoal_financeiro.php';
        exit();
    }

    if (strpos($endpoint, '/controlepessoal-novocliente') === 0) {
        include __DIR__ . '/src/routes/controlepessoal_novocliente.php';
        exit();
    }

    if (strpos($endpoint, '/controlepessoal-relatorios') === 0) {
        include __DIR__ . '/src/routes/controlepessoal_relatorios.php';
        exit();
    }

    if (strpos($endpoint, '/controlepessoal-vendasimples') === 0) {
        include __DIR__ . '/src/routes/controlepessoal_vendasimples.php';
        exit();
    }

    // N8N - Integração Telegram
    if (strpos($endpoint, '/n8n') === 0) {
        error_log("N8N ROUTER: Redirecionando para n8n.php - endpoint: {$endpoint}");
        include __DIR__ . '/src/routes/n8n.php';
        exit();
    }

    // Module History - estatísticas de uso de módulos
    if (strpos($endpoint, '/module-history') === 0) {
        include __DIR__ . '/src/routes/module-history.php';
        exit();
    }

    // Newsletter
    if (strpos($endpoint, '/newsletter') === 0) {
        include __DIR__ . '/src/routes/newsletter.php';
        exit();
    }

    // Base Gestão Cadastral
    if (strpos($endpoint, '/base-gestao') === 0) {
        include __DIR__ . '/src/routes/base_gestao.php';
        exit();
    }

    // Base Receita Federal
    if (strpos($endpoint, '/base-receita') === 0) {
        include __DIR__ . '/routes/base-receita.php';
        exit();
    }

    // Base Operadora OI
    if (strpos($endpoint, '/base-operadora-oi') === 0) {
        include __DIR__ . '/routes/base-operadora-oi.php';
        exit();
    }

    // Base Operadora TIM
    if (strpos($endpoint, '/base-operadora-tim') === 0) {
        include __DIR__ . '/routes/base-operadora-tim.php';
        exit();
    }

    // Base Auxílio (genérico - deve vir depois de base-auxilio-emergencial)
    if (strpos($endpoint, '/base-auxilio') === 0) {
        include __DIR__ . '/src/routes/base_auxilio.php';
        exit();
    }

    // Contadores de visitas
    if (strpos($endpoint, '/contadores') === 0) {
        include __DIR__ . '/src/routes/contadores.php';
        exit();
    }

    // Proxy busca por nome
    if (strpos($endpoint, '/proxy-busca-nome') === 0) {
        include __DIR__ . '/src/routes/proxy-busca-nome.php';
        exit();
    }
    
    // Endpoint raiz - status da API
    if ($endpoint === '/' && $method === 'GET') {
        Response::success([
            'message' => 'API Externa funcionando',
            // Use isso para conferir rapidamente se o servidor está rodando o arquivo atualizado
            'router_version' => '2026-01-25-base-certidao-session-monitor',
            'version' => '1.0',
            'timestamp' => date('Y-m-d H:i:s'),
            'app_url' => 'http://api.artepuradesign.com.br',
            'app_env' => 'development',
            'endpoints' => [
                'auth' => '/auth',
                'wallet' => '/wallet',
                'modules' => '/modules',
                'panels' => '/panels',
                'plans' => '/plans',
                'plan-purchase' => '/plan/purchase',
                'user-active-plan' => '/user/active-plan',
                'user-plan-usage' => '/user/plan-usage',
                'users' => '/users',
                'users-profile' => '/users/profile',
                'dashboard-admin' => '/dashboard-admin',
                'testimonials' => '/testimonials',
                'testimonials-active' => '/testimonials/active',
                'notifications' => '/notifications',
                'session-monitor' => '/session-monitor',
                'user-sessions' => '/user-sessions',
                'access-logs' => '/access-logs',
                'user-audit' => '/user-audit',
                'cupons' => '/cupons',
                'validate-cupom' => '/validate-cupom', 
                'use-cupom' => '/use-cupom',
                'users-list' => '/users-list',
                'support' => '/routes/support.php',
                'consultas' => '/consultas',
                'base-cpf' => '/base-cpf',
                'base-rg' => '/base-rg',
                'rg-2026' => '/rg-2026',
                'base-cnh' => '/base-cnh',
                'base-telefone' => '/base-telefone',
                'base-email' => '/base-email',
                'base-endereco' => '/base-endereco',
                'base-certidao' => '/base-certidao',
                'base-cns' => '/base-cns',
                'base-documento' => '/base-documento',
                'base-credilink' => '/base-credilink',
                'base-vacina' => '/base-vacina',
                'base-senha-cpf' => '/base-senha-cpf',
                'base-senha-email' => '/base-senha-email',
                'consultas-cpf' => '/consultas-cpf',
                'historico' => '/historico/completo',
                'historico-stats' => '/historico/estatisticas',
                'enviar-foto' => '/enviar-foto.php',
                'mercadopago-test' => '/mercadopago/test-credentials',
                'mercadopago-document-types' => '/mercadopago/document-types',
                'mercadopago-create-pix' => '/mercadopago/create-pix-payment',
                'mercadopago-list-payments' => '/mercadopago/list-payments',
                'mercadopago-webhook' => '/mercadopago/webhook',
                'editaveis-rg' => '/editaveis-rg',
                'controle-pessoal' => '/controle-pessoal',
                'controlepessoal-agenda' => '/controlepessoal-agenda',
                'controlepessoal-financeiro' => '/controlepessoal-financeiro',
                'controlepessoal-novocliente' => '/controlepessoal-novocliente',
                'controlepessoal-relatorios' => '/controlepessoal-relatorios',
                'controlepessoal-vendasimples' => '/controlepessoal-vendasimples',
                'login-hotmail' => '/login-hotmail',
                'login-gmail' => '/login-gmail',
                'login-renner' => '/login-renner',
                'pdf-rg' => '/pdf-rg'
            ]
        ], 'API Externa operacional');
        exit();
    }
    
    // Endpoint não encontrado — redireciona para o site principal
    error_log("❌ ROUTER: Endpoint não encontrado: {$endpoint}");
    error_log("❌ ROUTER: METHOD: {$method}");
    error_log("❌ ROUTER: REQUEST_URI: " . $_SERVER['REQUEST_URI']);

    // Se a requisição for de um navegador (aceita HTML), redireciona para o site
    $acceptHeader = $_SERVER['HTTP_ACCEPT'] ?? '';
    if (strpos($acceptHeader, 'text/html') !== false) {
        header('Location: https://apipainel.com.br', true, 302);
        exit();
    }

    // Para requisições de API (JSON), retorna erro padrão
    Response::error('[root-index-2026-01-25] Endpoint não encontrado: ' . $endpoint, 404);
    
} catch (Exception $e) {
    error_log("API ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
