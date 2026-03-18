
<?php
// src/routes/public.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/HomeController.php';
require_once __DIR__ . '/../controllers/PlansController.php';
require_once __DIR__ . '/../controllers/PanelController.php';
require_once __DIR__ . '/../controllers/ModuleController.php';
require_once __DIR__ . '/../controllers/TestimonialController.php';
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

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("PUBLIC_ROUTES: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("PUBLIC_ROUTE: Método {$method}, Path: {$path}");

// Controllers
$homeController = new HomeController($db);
$plansController = new PlansController($db);
$panelController = new PanelController($db);
$moduleController = new ModuleController($db);
$testimonialController = new TestimonialController($db);

// Roteamento
switch ($method) {
    case 'GET':
        if ($path === '/home' || $path === '/') {
            $homeController->index();
        } elseif ($path === '/plans' || $path === '/plans/active') {
            $plansController->getAll();
        } elseif ($path === '/panels' || $path === '/panels/active') {
            $panelController->getAll();
        } elseif ($path === '/modules' || $path === '/modules/active') {
            $moduleController->getAll();
        } elseif ($path === '/testimonials') {
            $testimonialController->getAll();
        } else {
            Response::error('Endpoint GET não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
