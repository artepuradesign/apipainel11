
<?php
// src/routes/dashboard.php - Rotas para dashboard

require_once __DIR__ . '/../controllers/DashboardController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$dashboardController = new DashboardController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/dashboard/stats') !== false) {
            $dashboardController->getStats();
        } elseif (strpos($path, '/dashboard/summary') !== false) {
            $dashboardController->getSummary();
        } elseif (strpos($path, '/dashboard/activity') !== false) {
            $dashboardController->getActivity();
        } elseif (strpos($path, '/dashboard/notifications') !== false) {
            $dashboardController->getNotifications();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/dashboard/mark-notification-read') !== false) {
            $dashboardController->markNotificationRead();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
