<?php
// src/routes/n8n.php - Rotas para integração Railway/n8n

require_once __DIR__ . '/../utils/Response.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixo /api se existir
$path = preg_replace('#^/api#', '', $path);
// Remove prefixo /n8n
$path = preg_replace('#^/n8n#', '', $path);
// Normalizar path
$path = '/' . trim($path, '/');
if ($path === '/') $path = '';

error_log("N8N_ROUTES: REQUEST_URI=" . $_SERVER['REQUEST_URI']);
error_log("N8N_ROUTES: Método {$method}, Path: {$path}");

// Roteamento dos arquivos PHP do n8n
$cleanPath = rtrim($path, '/');
$cleanPath = str_replace('.php', '', $cleanPath);

// Definir Content-Type
header('Content-Type: application/json; charset=utf-8');

error_log("N8N_ROUTES: Path limpo: {$cleanPath}");

// Rota para enviar CPF ao Railway
if ($cleanPath === '/railway-send-cpf' || $cleanPath === '') {
    error_log("N8N_ROUTES: Redirecionando para railway-send-cpf.php");
    require_once __DIR__ . '/../../n8n/railway-send-cpf.php';
    exit;
}

// Rota para verificar CPF no banco de dados
if ($cleanPath === '/check-cpf-database') {
    error_log("N8N_ROUTES: Redirecionando para check-cpf-database.php");
    require_once __DIR__ . '/../../n8n/check-cpf-database.php';
    exit;
}

// Endpoint não encontrado
error_log("N8N_ROUTES: Endpoint não encontrado: {$path}");
Response::error('Endpoint n8n não encontrado: ' . $path, 404);
