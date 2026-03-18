
<?php
// src/routes/support.php - Rotas para suporte

require_once __DIR__ . '/../controllers/SupportController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$supportController = new SupportController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/support/tickets') !== false) {
            $supportController->getTickets();
        } elseif (preg_match('/\/support\/tickets\/(\d+)/', $path, $matches)) {
            $supportController->getTicket($matches[1]);
        } elseif (preg_match('/\/support\/tickets\/(\d+)\/messages/', $path, $matches)) {
            $supportController->getTicketMessages($matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/support/tickets') !== false && !preg_match('/\/\d+/', $path)) {
            $supportController->createTicket();
        } elseif (preg_match('/\/support\/tickets\/(\d+)\/messages/', $path, $matches)) {
            $supportController->addMessage($matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/support\/tickets\/(\d+)/', $path, $matches)) {
            $supportController->updateTicket($matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
