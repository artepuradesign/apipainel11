<?php
// src/routes/user-audit.php - Rotas para auditoria de usuário

require_once __DIR__ . '/../controllers/UserAuditController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

// Handle CORS
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$userAuditController = new UserAuditController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

error_log("USER_AUDIT_ROUTES: {$method} {$path}");

switch ($method) {
    case 'GET':
        if (strpos($path, '/user-audit/logs') !== false || strpos($path, '/access-logs') !== false) {
            // GET /user-audit/logs ou /access-logs - Obter logs de acesso do usuário
            $userAuditController->getUserAccessLogs();
            
        } elseif (strpos($path, '/user-audit/stats') !== false) {
            // GET /user-audit/stats - Obter estatísticas de auditoria
            $userAuditController->getUserAuditStats();
            
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/user-audit/logs') !== false || strpos($path, '/access-logs') !== false) {
            // POST /user-audit/logs ou /access-logs - Criar novo log de auditoria
            $userAuditController->createAuditLog();
            
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}