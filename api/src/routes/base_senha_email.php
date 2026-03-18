<?php
// src/routes/base_senha_email.php - Rotas para administração de base_senha_email

require_once __DIR__ . '/../controllers/BaseSenhaEmailController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Reutilizar conexão global ($db) fornecida pelo roteador principal quando possível
if (!isset($db)) {
    Response::error('Conexão com banco não inicializada', 500);
    exit;
}

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new BaseSenhaEmailController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

// Remover prefixo do recurso
$basePaths = ['/base-senha-email'];
foreach ($basePaths as $bp) {
    if (strpos($path, $bp) === 0) {
        $path = substr($path, strlen($bp));
        break;
    }
}

if ($path === false || $path === null || $path === '') {
    $path = '/';
}

switch ($method) {
    case 'GET':
        if (preg_match('/^\/cpf-id\/(\d+)\/?$/', $path, $matches)) {
            $_GET['cpf_id'] = $matches[1];
            $controller->getByCpfId();
        } elseif (preg_match('/^\/email\/(.+)\/?$/', $path, $matches)) {
            $_GET['email'] = urldecode($matches[1]);
            $controller->getByEmail();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if ($path === '/' || $path === '') {
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->update();
        } else {
            Response::notFound('ID é obrigatório para atualização');
        }
        break;

    case 'DELETE':
        if (preg_match('/^\/cpf-id\/(\d+)\/?$/', $path, $matches)) {
            $_GET['cpf_id'] = $matches[1];
            $controller->deleteByCpfId();
        } elseif (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->delete();
        } else {
            Response::notFound('ID ou CPF ID é obrigatório para exclusão');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
