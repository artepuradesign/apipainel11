<?php
// routes/support.php - Rotas para sistema de suporte

require_once __DIR__ . '/../src/controllers/SupportController.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../src/utils/Response.php';
require_once __DIR__ . '/../src/config/database.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Conectar ao banco usando conexao.php
try {
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("SUPPORT: Erro de conexão: " . $e->getMessage());
    Response::error('Erro de conexão com banco de dados: ' . $e->getMessage(), 500);
    exit;
}

// Instanciar o controller
$supportController = new SupportController($db);

$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Extrair o path da rota
$path = parse_url($requestUri, PHP_URL_PATH);
$pathSegments = explode('/', trim($path, '/'));

// Aplicar middleware de autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

switch ($method) {
    case 'GET':
        if (isset($pathSegments[3]) && is_numeric($pathSegments[3])) {
            // GET /api/routes/support.php/12 - Buscar ticket específico
            $supportController->getTicket($pathSegments[3]);
        } else {
            // GET /api/routes/support.php - Listar tickets do usuário
            $supportController->getTickets();
        }
        break;
        
    case 'POST':
        // POST /api/routes/support.php - Criar novo ticket
        $supportController->createTicket();
        break;
        
    case 'PUT':
    case 'PATCH':
        if (isset($pathSegments[3]) && is_numeric($pathSegments[3])) {
            // PUT /api/routes/support.php/12 - Atualizar ticket
            $supportController->updateTicket($pathSegments[3]);
        } else {
            Response::error('ID do ticket é obrigatório para atualização', 400);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
        break;
}
?>