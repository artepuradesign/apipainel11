<?php
// public/upload-photo.php - Upload de fotos para pasta FOTOS

// CORS básico
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/controllers/PhotoUploadController.php';
require_once __DIR__ . '/../config/conexao.php';

$db = null;

try {
    // Tentar conectar ao banco de dados usando pool
    try {
        $db = getDBConnection();
        error_log("UPLOAD_PHOTO: Conexão com banco estabelecida (pool)");
    } catch (Exception $dbError) {
        error_log("UPLOAD_PHOTO_DB_WARNING: Erro ao conectar banco: " . $dbError->getMessage());
        // Continuar sem banco - upload físico ainda funcionará
    }
    
    $controller = new PhotoUploadController($db);
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $controller->upload();
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $controller->delete();
    } else {
        Response::methodNotAllowed('Método não permitido');
    }
} catch (Exception $e) {
    error_log('UPLOAD_PHOTO_FATAL: ' . $e->getMessage());
    Response::error('Erro interno no upload', 500);
}
// Pool de conexão gerencia o fechamento automaticamente
