<?php
/**
 * Endpoint: POST /api/n8n/railway-send-cpf.php
 * Body: { cpf: "12345678900" }
 * Response: { success: bool, status?: string, message?: string, error?: string, data?: mixed }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

// Garantir saída apenas JSON e registrar ruídos inesperados
error_reporting(E_ALL);
ini_set('display_errors', '0');
ob_start();
set_error_handler(function ($severity, $message, $file, $line) {
    error_log("PHP_ERROR [$severity] $message in $file:$line");
    return true; // Evita emissão de HTML pelo PHP
});

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    // Limpa qualquer buffer anterior para evitar <!DOCTYPE html>
    while (ob_get_level() > 0) {
        $buf = ob_get_clean();
        if ($buf) {
            error_log('UNEXPECTED_OUTPUT: ' . substr($buf, 0, 400));
        }
    }
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Método não permitido'], 405);
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['cpf']) || empty($data['cpf'])) {
        json_response(['success' => false, 'error' => 'CPF não informado'], 400);
    }

    $cpf = preg_replace('/[^0-9]/', '', (string) $data['cpf']);
    if (strlen($cpf) !== 11) {
        json_response(['success' => false, 'error' => 'CPF inválido (deve conter 11 dígitos)'], 400);
    }

    $railwayUrl = 'https://cpf-telegram-production.up.railway.app/cpf';

    // Monta payload
    $payload = json_encode(['cpf' => $cpf], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($payload === false) {
        json_response(['success' => false, 'error' => 'Falha ao montar payload JSON'], 500);
    }

    // Enviar requisição server-to-server via cURL
    $ch = curl_init($railwayUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);

    $responseBody = curl_exec($ch);
    $curlErrNo = curl_errno($ch);
    $curlErr   = curl_error($ch);
    $httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    error_log("RAILWAY_PROXY: POST {$railwayUrl} HTTP {$httpCode} CURL_ERRNO {$curlErrNo}");

    if ($curlErrNo) {
        json_response([
            'success' => false,
            'error' => 'Falha na comunicação com o serviço externo: ' . $curlErr,
        ], 502);
    }

    if ($responseBody === false || $responseBody === null || trim($responseBody) === '') {
        json_response([
            'success' => false,
            'error' => 'Resposta vazia do serviço externo',
        ], 502);
    }

    // Tenta interpretar JSON retornado pelo Railway
    $parsed = json_decode($responseBody, true);
    if ($parsed === null && json_last_error() !== JSON_ERROR_NONE) {
        // Se vier HTML/Texto, tenta extrair JSON no fim (fallback leve)
        if (strpos($responseBody, '<html') !== false || strpos($responseBody, '<!DOCTYPE') !== false) {
            json_response([
                'success' => false,
                'error' => 'Serviço externo retornou HTML ao invés de JSON',
            ], 502);
        }
        json_response([
            'success' => false,
            'error' => 'JSON inválido retornado pelo serviço externo',
            'data' => substr($responseBody, 0, 300),
        ], 502);
    }

    // Normaliza a resposta mantendo campos úteis
    $status = $parsed['status'] ?? null;
    $error  = $parsed['error'] ?? null;

    if ($httpCode >= 200 && $httpCode < 300 && $status === 'enviado') {
        json_response([
            'success' => true,
            'status' => $status,
            'message' => 'CPF enviado com sucesso',
            'data' => $parsed,
        ], 200);
    }

    // Erro ou status inesperado
    json_response([
        'success' => false,
        'status' => $status,
        'error' => $error ?: 'Falha ao enviar CPF',
        'data' => $parsed,
    ], $httpCode >= 400 ? $httpCode : 502);

} catch (Throwable $e) {
    error_log('RAILWAY_PROXY ERROR: ' . $e->getMessage());
    json_response([
        'success' => false,
        'error' => 'Erro interno: ' . $e->getMessage(),
    ], 500);
}
