<?php

require_once __DIR__ . '/../src/controllers/BaseAuxilioEmergencialController.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../config/database.php';

// Aplicar CORS Middleware
$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Pré-flight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    // Quando esta rota é carregada via api/src/routes/api.php, o roteador principal já cria $db
    // (via config/conexao.php). Se abrirmos outra conexão aqui (config/database.php), podemos
    // acabar consultando OUTRO banco — e aí “tem dados no servidor, mas não aparece”.
    if (!isset($db) || !($db instanceof PDO)) {
        $db = getConnection();
    }
    
    // Aplicar autenticação
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        exit;
    }
    
    $controller = new BaseAuxilioEmergencialController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Remover prefixo da API se presente
    $basePaths = ['/api/base-auxilio-emergencial', '/base-auxilio-emergencial'];
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
            if (preg_match('/^\/cpf-id\/([^\/]+)\/?$/', $path, $matches)) {
                // GET /base-auxilio-emergencial/cpf-id/{cpf_id}
                $_GET['cpf_id'] = $matches[1];
                $controller->getByCpfId();
            } elseif (isset($_GET['cpf_id'])) {
                // GET /base-auxilio-emergencial?cpf_id={cpf_id}
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
            if (preg_match('/^\/cpf-id\/([^\/]+)\/?$/', $path, $matches)) {
                // DELETE /base-auxilio-emergencial/cpf-id/{cpf_id}
                $_GET['cpf_id'] = $matches[1];
                $controller->deleteByCpfId();
            } elseif (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-auxilio-emergencial/{id}
                $_GET['id'] = $matches[1];
                $controller->delete();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ID ou cpf_id é obrigatório para exclusão']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("ROUTE_BASE_AUXILIO_EMERGENCIAL: Erro fatal - " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}