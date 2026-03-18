<?php
// src/routes/upload.php
// Serve arquivos das pastas arquivosupload/ (anexos dos usuários) e upload/ (PDFs de entrega)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/FileUpload.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path   = preg_replace('#^/api#', '', $path);

if ($method === 'GET') {

    // GET /upload/serve?file=xxx  → serve anexo do usuário (arquivosupload/)
    if (strpos($path, '/upload/serve') !== false) {
        $filename = $_GET['file'] ?? null;
        if (!$filename) {
            Response::error('Parâmetro "file" é obrigatório', 400);
            exit;
        }
        $filename = basename($filename);
        FileUpload::serveFile($filename);
        exit;
    }

    // GET /upload/delivery?file=xxx  → serve PDF de entrega do admin (upload/)
    if (strpos($path, '/upload/delivery') !== false) {
        $filename = $_GET['file'] ?? null;
        if (!$filename) {
            Response::error('Parâmetro "file" é obrigatório', 400);
            exit;
        }
        $filename = basename($filename);
        FileUpload::serveDeliveryFile($filename);
        exit;
    }
}

Response::error('Endpoint não encontrado', 404);
