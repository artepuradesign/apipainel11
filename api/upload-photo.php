<?php
// api/upload-photo.php - Fixed to work with PhotoUploadController

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/src/utils/Response.php';
require_once __DIR__ . '/src/controllers/PhotoUploadController.php';
require_once __DIR__ . '/config/conexao.php';

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
        http_response_code(405);
        Response::error('Method not allowed');
    }
} catch (Exception $e) {
    error_log('UPLOAD_PHOTO_ERROR: ' . $e->getMessage());
    http_response_code(500);
    Response::error('Internal server error: ' . $e->getMessage());
}
// Pool de conexão gerencia o fechamento automaticamente