
<?php
// src/routes/admin.php

require_once __DIR__ . '/../controllers/AdminController.php';
require_once __DIR__ . '/../controllers/UserController.php';
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

// Verificar autenticação e permissão de admin
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->requireRole('admin')) {
    exit; // Middleware já enviou a resposta de erro
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("ADMIN_ROUTE: Método {$method}, Path: {$path}");

// Roteamento
switch ($method) {
    case 'GET':
        if (strpos($path, '/admin/dashboard') !== false) {
            $adminController = new AdminController($db);
            $adminController->getDashboard();
        } elseif (strpos($path, '/admin/stats') !== false) {
            $adminController = new AdminController($db);
            $adminController->getStats();
        } elseif (strpos($path, '/admin/users') !== false) {
            $adminController = new AdminController($db);
            $adminController->getUsers();
        } elseif (strpos($path, '/admin/reports') !== false) {
            $adminController = new AdminController($db);
            $adminController->getReports();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/admin/users/create') !== false) {
            $userController = new UserController($db);
            $userController->createUser();
        } elseif (strpos($path, '/admin/users/block') !== false) {
            $adminController = new AdminController($db);
            $adminController->blockUser();
        } elseif (strpos($path, '/admin/system/maintenance') !== false) {
            $adminController = new AdminController($db);
            $adminController->toggleMaintenance();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/admin\/users\/(\d+)$/', $path, $matches)) {
            $userController = new UserController($db);
            $userController->updateUser($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/admin\/users\/(\d+)$/', $path, $matches)) {
            $adminController = new AdminController($db);
            $adminController->deleteUser($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
