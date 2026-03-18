<?php
// public/fotos.php - Servir imagens da pasta fotos publicamente sem proteção

// Obter o caminho da URL
$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Extrair o nome do arquivo após '/fotos/'
if (strpos($path, '/fotos/') === 0) {
    $filename = basename(substr($path, 7)); // Remove '/fotos/'
} else {
    http_response_code(404);
    exit('Arquivo não encontrado');
}

// Caminho físico da imagem
$filePath = __DIR__ . '/../fotos/' . $filename;

// Verificar se o arquivo existe
if (!file_exists($filePath)) {
    http_response_code(404);
    exit('Imagem não encontrada');
}

// Determinar o tipo MIME
$extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
switch ($extension) {
    case 'jpg':
    case 'jpeg':
        $contentType = 'image/jpeg';
        break;
    case 'png':
        $contentType = 'image/png';
        break;
    case 'gif':
        $contentType = 'image/gif';
        break;
    default:
        $contentType = 'application/octet-stream';
}

// Enviar headers
header('Content-Type: ' . $contentType);
header('Content-Length: ' . filesize($filePath));
header('Cache-Control: public, max-age=31536000');

// Enviar a imagem
readfile($filePath);
exit;
