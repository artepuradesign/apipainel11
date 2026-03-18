<?php
// src/routes/editaveis_rg.php - Rotas para Editáveis RG (módulo 85)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/EditaveisRgController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new EditaveisRgController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/editaveis-rg/minhas-compras') !== false) {
            $controller->minhasCompras();
        } elseif (strpos($path, '/editaveis-rg/arquivos') !== false || $path === '/editaveis-rg') {
            $controller->listArquivos();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/editaveis-rg/comprar') !== false) {
            $controller->comprar();
        } elseif (strpos($path, '/editaveis-rg/download') !== false) {
            $controller->download();
        } elseif (strpos($path, '/editaveis-rg/criar') !== false) {
            $controller->criar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (strpos($path, '/editaveis-rg/atualizar') !== false) {
            $controller->atualizar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (strpos($path, '/editaveis-rg/excluir') !== false) {
            $controller->excluir();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
