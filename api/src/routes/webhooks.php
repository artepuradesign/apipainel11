
<?php
// src/routes/webhooks.php - Rotas para webhooks

require_once __DIR__ . '/../controllers/WebhookController.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$webhookController = new WebhookController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'POST':
        if (strpos($path, '/webhooks/payment') !== false) {
            $webhookController->handlePaymentWebhook();
        } elseif (strpos($path, '/webhooks/pix') !== false) {
            $webhookController->handlePixWebhook();
        } elseif (strpos($path, '/webhooks/bank') !== false) {
            $webhookController->handleBankWebhook();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
