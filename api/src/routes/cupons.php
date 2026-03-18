<?php
// src/routes/cupons.php - Rotas para cupons

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Headers CORS melhorados
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
header('Access-Control-Max-Age: 86400');

// Tratar OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixos da URI
$uri = str_replace('/api', '', $uri);

error_log("CUPONS_ROUTES: {$method} {$uri}");
error_log("CUPONS_ROUTES: Headers recebidos: " . json_encode(getallheaders()));
error_log("CUPONS_ROUTES: Query string: " . ($_SERVER['QUERY_STRING'] ?? 'N/A'));

try {
    // Roteamento baseado no endpoint
    if (strpos($uri, '/src/endpoints/cupons.php') !== false || $uri === '/cupons' || strpos($uri, '/cupons') === 0) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint cupons.php - URI: {$uri}");
        require_once __DIR__ . '/../endpoints/cupons.php';
    } elseif (strpos($uri, '/src/endpoints/validate-cupom.php') !== false || strpos($uri, '/validate-cupom') !== false) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint validate-cupom.php");
        require_once __DIR__ . '/../endpoints/validate-cupom.php';
    } elseif (strpos($uri, '/src/endpoints/use-cupom.php') !== false || strpos($uri, '/use-cupom') !== false) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint use-cupom.php");
        require_once __DIR__ . '/../endpoints/use-cupom.php';
    } elseif (strpos($uri, '/src/endpoints/use-cupom-desconto.php') !== false || strpos($uri, '/use-cupom-desconto') !== false) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint use-cupom-desconto.php");
        require_once __DIR__ . '/../endpoints/use-cupom-desconto.php';
    } elseif (strpos($uri, '/src/endpoints/cupom-historico-admin.php') !== false || strpos($uri, '/cupom-historico-admin') !== false) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint cupom-historico-admin.php");
        require_once __DIR__ . '/../endpoints/cupom-historico-admin.php';
    } elseif (strpos($uri, '/src/endpoints/cupom-historico.php') !== false || strpos($uri, '/cupom-historico') !== false || strpos($uri, '/cupons-historico') !== false) {
        error_log("CUPONS_ROUTES: Direcionando para endpoint cupom-historico.php");
        require_once __DIR__ . '/../endpoints/cupom-historico.php';
    } else {
        error_log("CUPONS_ROUTES: Endpoint não encontrado - {$uri}");
        Response::error('Endpoint de cupom não encontrado', 404);
    }
} catch (Exception $e) {
    error_log("CUPONS_ROUTES ERROR: " . $e->getMessage());
    error_log("CUPONS_ROUTES TRACE: " . $e->getTraceAsString());
    Response::error('Erro interno do servidor de cupons: ' . $e->getMessage(), 500);
}
?>