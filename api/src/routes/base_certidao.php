<?php
// src/routes/base_certidao.php - Rotas para base_certidao

require_once __DIR__ . '/../controllers/BaseCertidaoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new BaseCertidaoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Importante: em produção o servidor pode adicionar prefixos (ex: /public, /api, /index.php)
// no REQUEST_URI dependendo do DocumentRoot e regras de rewrite.
// Para ficar consistente com base_endereco.php (que funciona), a gente NÃO depende de
// normalização estrita e apenas procura o padrão no fim do caminho.
$path = (string)($path ?? '/');
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

switch ($method) {
    case 'GET':
        // Aceita o endpoint mesmo que venha com prefixos antes (ex: /public/base-certidao/...)
        if (preg_match('#/base-certidao/cpf/(\d+)$#', $path, $matches)) {
            // GET /base-certidao/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $controller->getByCpfId();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (preg_match('#/base-certidao$#', $path)) {
            // POST /base-certidao
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
