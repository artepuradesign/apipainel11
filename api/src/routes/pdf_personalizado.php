<?php
require_once __DIR__ . '/../controllers/PdfPersonalizadoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($db)) {
    Response::error('Erro de configuração do banco de dados', 500);
    exit;
}

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new PdfPersonalizadoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', $path);

switch ($method) {
    case 'GET':
        if (preg_match('/\/pdf-personalizado\/stats$/', $path)) {
            $controller->stats();
        } elseif (preg_match('/\/pdf-personalizado\/(\d+)$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->obter();
        } else {
            $controller->listar();
        }
        break;

    case 'POST':
        if (strpos($path, '/pdf-personalizado/delete-pdf') !== false) {
            $controller->deletarPdf();
        } elseif (strpos($path, '/pdf-personalizado/solicitar-correcao') !== false) {
            $controller->solicitarCorrecao();
        } elseif (strpos($path, '/pdf-personalizado/status') !== false) {
            $controller->atualizarStatus();
        } else {
            $controller->criar();
        }
        break;

    case 'DELETE':
        if (preg_match('/\/pdf-personalizado\/(\d+)$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->deletar();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;

    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
