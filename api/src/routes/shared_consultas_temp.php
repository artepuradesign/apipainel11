<?php
// src/routes/shared_consultas_temp.php - Rotas para compartilhamento temporário de consulta

require_once __DIR__ . '/../controllers/SharedConsultaTempController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$controller = new SharedConsultaTempController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = rtrim((string)$path, '/');

if ($method === 'GET' && preg_match('#/shared-consultas-temp/public/([A-Za-z0-9_-]+)$#', $path, $matches)) {
    $controller->getPublicByKey($matches[1]);
    exit;
}

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

switch ($method) {
    case 'POST':
        if (preg_match('#/shared-consultas-temp(/create)?$#', $path)) {
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
