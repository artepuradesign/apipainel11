<?php
/**
 * Proxy para API externa de busca por nome
 * Resolve problema de CORS fazendo a requisição server-side
 */

// CORS headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => false, 'erro' => 'Método não permitido']);
    exit();
}

// Get input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$nome = $data['nome'] ?? null;
$linkManual = $data['link_manual'] ?? null;

if (empty($nome) && empty($linkManual)) {
    http_response_code(400);
    echo json_encode(['status' => false, 'erro' => 'Nome ou link_manual é obrigatório']);
    exit();
}

// Build request body
$postData = '';
if (!empty($linkManual)) {
    $postData = 'link_manual=' . urlencode($linkManual);
} else {
    $postData = 'nome=' . urlencode($nome);
}

// External API URL
$externalUrl = 'https://apipainel.atito.com.br/busca-nome.php';

// Make request using cURL
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $externalUrl,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $postData,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 60,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ],
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_FOLLOWLOCATION => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Handle errors
if ($curlError) {
    error_log("Proxy busca-nome cURL error: " . $curlError);
    http_response_code(502);
    echo json_encode(['status' => false, 'erro' => 'Erro ao conectar com API externa: ' . $curlError]);
    exit();
}

// Return response as-is
http_response_code($httpCode);
echo $response;
