
<?php
// src/routes/dashboard_admin.php

require_once __DIR__ . '/../controllers/DashboardAdminController.php';
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

// Garantir que $db está disponível
if (!isset($db)) {
    Response::error('Erro de configuração do banco de dados', 500);
    exit;
}

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit; // Middleware já enviou a resposta de erro
}

// Verificar se é usuário de suporte/admin
$userId = AuthMiddleware::getCurrentUserId();
$userQuery = "SELECT user_role FROM users WHERE id = ?";
$userStmt = $db->prepare($userQuery);
$userStmt->execute([$userId]);
$user = $userStmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !in_array($user['user_role'], ['suporte', 'admin'])) {
    Response::error('Acesso negado - permissão insuficiente', 403);
    exit;
}

$dashboardController = new DashboardAdminController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se existir
$path = preg_replace('#^/api#', '', $path);

error_log("DASHBOARD_ADMIN_ROUTE: Método {$method}, Path: {$path}");

// Roteamento
switch ($method) {
    case 'GET':
        if (strpos($path, '/dashboard-admin/stats') !== false) {
            $dashboardController->getStats();
        } elseif (strpos($path, '/dashboard-admin/online-users') !== false) {
            $dashboardController->getOnlineUsers();
        } elseif (strpos($path, '/dashboard-admin/users') !== false) {
            $dashboardController->getUsers();
        } elseif (strpos($path, '/dashboard-admin/activities') !== false) {
            $dashboardController->getActivities();
        } elseif (strpos($path, '/dashboard-admin/transactions') !== false) {
            $dashboardController->getTransactions();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if (strpos($path, '/dashboard-admin/users') !== false) {
            $dashboardController->createUser();
        } elseif (preg_match('/\/dashboard-admin\/users\/(\d+)\/reset-password$/', $path, $matches)) {
            $dashboardController->resetUserPassword($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/dashboard-admin\/users\/(\d+)$/', $path, $matches)) {
            $dashboardController->updateUser($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PATCH':
        if (preg_match('/\/dashboard-admin\/users\/(\d+)\/status$/', $path, $matches)) {
            $dashboardController->toggleUserStatus($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/dashboard-admin\/users\/(\d+)$/', $path, $matches)) {
            $dashboardController->deleteUser($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
