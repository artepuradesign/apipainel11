<?php

require_once __DIR__ . '/../src/controllers/BaseSenhaEmailController.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../config/database.php';

// Headers padrão JSON e CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With, X-API-Key');

// Pré-flight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $db = getConnection();
    
    // Aplicar middleware de autenticação
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        exit;
    }
    
    $controller = new BaseSenhaEmailController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Remover prefixo da API se presente
    $basePaths = ['/api/base-senha-email', '/base-senha-email'];
    foreach ($basePaths as $bp) {
        if (strpos($path, $bp) === 0) {
            $path = substr($path, strlen($bp));
            break;
        }
    }
    
    // Normalizar caminho vazio
    if ($path === false || $path === null || $path === '') {
        $path = '/';
    }

    switch ($method) {
        case 'GET':
            if (preg_match('/^\/cpf-id\/(\d+)\/?$/', $path, $matches)) {
                // GET /base-senha-email/cpf-id/{cpf_id}
                $_GET['cpf_id'] = $matches[1];
                $controller->getByCpfId();
            } elseif (preg_match('/^\/email\/([^\/]+)\/?$/', $path, $matches)) {
                // GET /base-senha-email/email/{email}
                $_GET['email'] = urldecode($matches[1]);
                $controller->getByEmail();
            } elseif (isset($_GET['cpf_id'])) {
                // GET /base-senha-email?cpf_id={cpf_id}
                $controller->getByCpfId();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint não encontrado']);
            }
            break;
            
        case 'POST':
            if ($path === '' || $path === '/') {
                $controller->create();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Endpoint não encontrado']);
            }
            break;
            
        case 'PUT':
            if (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
                $_GET['id'] = $matches[1];
                $controller->update();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ID é obrigatório para atualização']);
            }
            break;
            
        case 'DELETE':
            if (preg_match('/^\/cpf-id\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-senha-email/cpf-id/{cpf_id}
                $_GET['cpf_id'] = $matches[1];
                $controller->deleteByCpfId();
            } elseif (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-senha-email/{id}
                $_GET['id'] = $matches[1];
                $controller->delete();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ID ou CPF ID é obrigatório para exclusão']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("ROUTE_BASE_SENHA_EMAIL: Erro fatal - " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
