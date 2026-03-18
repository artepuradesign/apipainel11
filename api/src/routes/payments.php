
<?php
// src/routes/payments.php - Rotas para pagamentos

require_once __DIR__ . '/../controllers/PaymentController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$paymentController = new PaymentController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/payments/methods') !== false) {
            $paymentController->getPaymentMethods();
        } elseif (strpos($path, '/payments/history') !== false) {
            $paymentController->getPaymentHistory();
        } elseif (preg_match('/\/payments\/status\/(.+)/', $path, $matches)) {
            $paymentController->getPaymentStatus($matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/payments/pix') !== false) {
            $paymentController->createPixPayment();
        } elseif (strpos($path, '/payments/credit-card') !== false) {
            $paymentController->createCreditCardPayment();
        } elseif (strpos($path, '/payments/boleto') !== false) {
            $paymentController->createBoletoPayment();
        } elseif (strpos($path, '/payments/webhook') !== false) {
            $paymentController->processWebhook();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
