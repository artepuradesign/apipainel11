
<?php
// src/routes/reports.php - Rotas para relatórios

require_once __DIR__ . '/../controllers/ReportController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$reportController = new ReportController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/reports/financial') !== false) {
            $reportController->getFinancialReport();
        } elseif (strpos($path, '/reports/consultations') !== false) {
            $reportController->getConsultationsReport();
        } elseif (strpos($path, '/reports/users') !== false) {
            $reportController->getUsersReport();
        } elseif (strpos($path, '/reports/referrals') !== false) {
            $reportController->getReferralsReport();
        } elseif (strpos($path, '/reports/export') !== false) {
            $reportController->exportReport();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/reports/custom') !== false) {
            $reportController->generateCustomReport();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
