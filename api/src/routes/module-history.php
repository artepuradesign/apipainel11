
<?php
// src/routes/module-history.php
// Rotas para histórico e estatísticas por módulo

require_once __DIR__ . '/../controllers/ModuleHistoryController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Tratar CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Responder OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$moduleHistoryController = new ModuleHistoryController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("MODULE_HISTORY_ROUTE: Método {$method}, Path: {$path}");

switch ($method) {
    case 'GET':
        if (strpos($path, '/module-history/stats') !== false) {
            error_log("MODULE_HISTORY_ROUTE: Matched stats endpoint");
            $moduleHistoryController->getStats();
        } elseif (strpos($path, '/module-history') !== false) {
            error_log("MODULE_HISTORY_ROUTE: Matched history endpoint");
            $moduleHistoryController->getHistory();
        } else {
            Response::error('Endpoint não encontrado: ' . $path, 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
