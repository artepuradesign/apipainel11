<?php
// src/routes/pdf_rg.php - Rotas para PDF RG (pedidos de confecção)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/PdfRgController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new PdfRgController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api(?:\.php)?#', '', $path);

switch ($method) {
    case 'GET':
        if (preg_match('/\/pdf-rg\/(\d+)$/', $path, $matches)) {
            // GET /pdf-rg/{id}
            $_GET['id'] = $matches[1];
            $controller->obter();
        } elseif (strpos($path, '/pdf-rg') !== false) {
            // GET /pdf-rg?user_id=&status=&limit=&offset=&search=
            $controller->listar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (preg_match('#/pdf-rg/delete-pdf/?$#', $path)) {
            // POST /pdf-rg/delete-pdf - deletar PDF de entrega
            $controller->deletarPdf();
        } elseif (preg_match('#/pdf-rg/status/?$#', $path)) {
            // POST /pdf-rg/status - atualizar status (admin)
            $controller->atualizarStatus();
        } elseif (preg_match('#/pdf-rg/?$#', $path)) {
            // POST /pdf-rg - criar pedido
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true) ?: [];
            $input['user_id'] = AuthMiddleware::getCurrentUserId();
            $controller->criarFromArray($input);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (strpos($path, '/pdf-rg/status') !== false) {
            // PUT /pdf-rg/status - atualizar status (admin)
            $controller->atualizarStatus();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('/\/pdf-rg\/(\d+)$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->deletar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
