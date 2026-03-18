<?php
// src/routes/rg_2026.php - Rotas para RG 2026 (banco externo)

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/Rg2026Controller.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Autenticação e dados usam o banco principal ($db), via config/conexao.php
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new Rg2026Controller($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/rg-2026') !== false) {
            $controller->list();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (strpos($path, '/rg-2026') !== false && !preg_match('/\/rg-2026\/(\d+)/', $path)) {
            // injeta user_id autenticado automaticamente
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true) ?: [];
            $input['user_id'] = AuthMiddleware::getCurrentUserId();
            $input['module_id'] = 57;
            // regrava body para o controller ler normalmente
            $GLOBALS['__RG2026_INPUT__'] = $input;

            // wrapper: o controller espera ler php://input, então chamamos create() passando o input via global
            // (mantém compatibilidade sem refatorar o Response)
            $controller->createFromArray($input);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('/\/rg-2026\/(\d+)$/', $path, $matches)) {
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
