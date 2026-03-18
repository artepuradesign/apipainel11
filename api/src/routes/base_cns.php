<?php
// src/routes/base_cns.php - Rotas para base_cns

require_once __DIR__ . '/../utils/Response.php';

/**
 * Em alguns ambientes o deploy pode colocar a pasta `src/` em outro nível
 * (ex.: /public_html/src/... vs /public_html/api/src/...).
 * Para evitar Warning/Fatal em HTML (quebrando JSON no frontend),
 * tentamos resolver os includes em múltiplos caminhos.
 */
// Importante: este helper pode existir em outras rotas/controllers.
// Evita Fatal error "Cannot redeclare" quando múltiplos arquivos declaram o mesmo nome.
if (!function_exists('require_once_candidates')) {
    function require_once_candidates(array $candidates, string $label): void {
        foreach ($candidates as $path) {
            if (!$path) continue;
            $real = realpath($path);
            if ($real && file_exists($real)) {
                require_once $real;
                return;
            }
        }

        Response::error(
            "Arquivo obrigatório não encontrado ($label). Verifique o deploy da pasta src/ no servidor.",
            500
        );
        exit;
    }
}

$routesDir = realpath(__DIR__);
$srcDir = $routesDir ? realpath($routesDir . '/..') : null; // .../src
$rootDir = $srcDir ? realpath($srcDir . '/..') : null;     // .../

require_once_candidates([
    __DIR__ . '/../controllers/BaseCnsController.php',
    $srcDir ? ($srcDir . '/controllers/BaseCnsController.php') : null,
    $rootDir ? ($rootDir . '/api/src/controllers/BaseCnsController.php') : null,
    $rootDir ? ($rootDir . '/src/controllers/BaseCnsController.php') : null,
], 'BaseCnsController.php');

require_once_candidates([
    __DIR__ . '/../middleware/AuthMiddleware.php',
    $srcDir ? ($srcDir . '/middleware/AuthMiddleware.php') : null,
    $rootDir ? ($rootDir . '/api/src/middleware/AuthMiddleware.php') : null,
    $rootDir ? ($rootDir . '/src/middleware/AuthMiddleware.php') : null,
], 'AuthMiddleware.php');

require_once_candidates([
    __DIR__ . '/../middleware/CorsMiddleware.php',
    $srcDir ? ($srcDir . '/middleware/CorsMiddleware.php') : null,
    $rootDir ? ($rootDir . '/api/src/middleware/CorsMiddleware.php') : null,
    $rootDir ? ($rootDir . '/src/middleware/CorsMiddleware.php') : null,
], 'CorsMiddleware.php');

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new BaseCnsController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$path = (string)($path ?? '/');
$path = rtrim($path, '/');
if ($path === '') {
    $path = '/';
}

switch ($method) {
    case 'GET':
        if (preg_match('#/base-cns/cpf/(\d+)$#', $path, $matches)) {
            // GET /base-cns/cpf/{cpf_id}
            $_GET['cpf_id'] = $matches[1];
            $controller->getByCpfId();
        } elseif (preg_match('#/base-cns/(\d+)$#', $path, $matches)) {
            // GET /base-cns/{id}
            $_GET['id'] = $matches[1];
            $controller->getById();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        // POST /base-cns (ou /base-cns/create)
        if (preg_match('#/base-cns(?:/create)?$#', $path)) {
            $controller->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
        if (preg_match('#/base-cns/(\d+)$#', $path, $matches)) {
            // PUT /base-cns/{id}
            $_GET['id'] = $matches[1];
            $controller->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('#/base-cns/(\d+)$#', $path, $matches)) {
            // DELETE /base-cns/{id}
            $_GET['id'] = $matches[1];
            $controller->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
