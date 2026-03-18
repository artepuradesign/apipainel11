<?php
require_once __DIR__ . '/../controllers/SistemasDominioComBrController.php';
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

$controller = new SistemasDominioComBrController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api(?:\.php)?#', '', $path);

switch ($method) {
    case 'GET':
        if (preg_match('#/sistemas-dominio-com-br/check/?$#', $path)) {
            $controller->verificarDisponibilidade();
        } elseif (preg_match('#/sistemas-dominio-com-br/admin/?$#', $path)) {
            $controller->listarAdmin();
        } elseif (preg_match('#/sistemas-dominio-com-br/(\d+)/?$#', $path, $matches)) {
            $controller->obter((int)$matches[1]);
        } elseif (preg_match('#/sistemas-dominio-com-br/minhas/?$#', $path) || preg_match('#/sistemas-dominio-com-br/?$#', $path)) {
            $controller->listarMeus();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (preg_match('#/sistemas-dominio-com-br/register/?$#', $path)) {
            $controller->registrar();
        } elseif (preg_match('#/sistemas-dominio-com-br/(\d+)/cancel/?$#', $path, $matches)) {
            $controller->cancelarAdmin((int)$matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('#/sistemas-dominio-com-br/(\d+)/?$#', $path, $matches)) {
            $controller->deletarAdmin((int)$matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
