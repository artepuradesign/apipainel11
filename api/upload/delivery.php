<?php
/**
 * delivery.php — Serve PDFs de entrega protegidos via PHP
 *
 * ⚠️  NÃO coloque este arquivo dentro de /upload/
 *
 * Coloque em:
 *   /home/apipainel-api/htdocs/api.apipainel.com.br/delivery.php
 *
 * Acesso:
 *   GET https://api.apipainel.com.br/delivery.php?file=nome_do_arquivo.pdf
 */

// ── CORS ──────────────────────────────────────────────────────────────────────
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// ── Parâmetro obrigatório ─────────────────────────────────────────────────────
$filename = $_GET['file'] ?? null;

if (empty($filename)) {
    http_response_code(400);
    echo json_encode(['error' => 'Parâmetro "file" é obrigatório']);
    exit;
}

// ── Segurança: bloqueia path traversal ───────────────────────────────────────
$filename = basename($filename);

if (preg_match('/\.\./', $filename) || preg_match('/[\/\\\\]/', $filename)) {
    http_response_code(400);
    echo json_encode(['error' => 'Nome de arquivo inválido']);
    exit;
}

// ── Caminho absoluto para a pasta upload/ ─────────────────────────────────────
// Este arquivo fica na raiz da API, sobe um nível em relação ao público
$uploadDir = __DIR__ . '/upload/';
$filePath  = $uploadDir . $filename;

if (!file_exists($filePath) || !is_file($filePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'Arquivo não encontrado']);
    exit;
}

// ── MIME type ─────────────────────────────────────────────────────────────────
$ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
$mimeTypes = [
    'pdf'  => 'application/pdf',
    'jpg'  => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png'  => 'image/png',
    'gif'  => 'image/gif',
];
$mime = $mimeTypes[$ext] ?? 'application/octet-stream';

// ── Servir ────────────────────────────────────────────────────────────────────
header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: public, max-age=86400');
header('X-Content-Type-Options: nosniff');

readfile($filePath);
exit;
