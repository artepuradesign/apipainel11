<?php
// public/upload-photo-base64.php - Endpoint para upload de fotos via base64 (integração n8n)

// CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Log inicial
error_log("UPLOAD_BASE64_PUBLIC: Iniciando processamento - Método: " . $_SERVER['REQUEST_METHOD']);
error_log("UPLOAD_BASE64_PUBLIC: Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'não definido'));
error_log("UPLOAD_BASE64_PUBLIC: URI: " . $_SERVER['REQUEST_URI']);

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/controllers/PhotoUploadBase64Controller.php';
require_once __DIR__ . '/../config/conexao.php';

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        error_log("UPLOAD_BASE64_PUBLIC: Chamando PhotoUploadBase64Controller");
        
        // Conectar ao banco
        $db = getDBConnection();
        $controller = new PhotoUploadBase64Controller($db);
        $controller->uploadBase64();
    } else {
        error_log("UPLOAD_BASE64_PUBLIC: Método não permitido - " . $_SERVER['REQUEST_METHOD']);
        Response::error('Método não permitido', 405);
    }
} catch (Exception $e) {
    error_log('UPLOAD_BASE64_PUBLIC_ERROR: ' . $e->getMessage());
    error_log('UPLOAD_BASE64_PUBLIC_TRACE: ' . $e->getTraceAsString());
    Response::error('Erro interno: ' . $e->getMessage(), 500);
}
