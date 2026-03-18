<?php

require_once __DIR__ . '/../src/controllers/BaseHistoricoVeiculoController.php';
require_once __DIR__ . '/../src/middleware/AuthMiddleware.php';
require_once __DIR__ . '/../src/middleware/CorsMiddleware.php';
require_once __DIR__ . '/../config/conexao.php';

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
    // Logs detalhados do início
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] ===== INÍCIO DA REQUISIÇÃO =====");
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] REQUEST_URI: " . $_SERVER['REQUEST_URI']);
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD']);
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Query params: " . json_encode($_GET));
    
    // Usar ConnectionPool para reutilizar conexões
    $db = getDBConnection();
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] ConnectionPool obtido com sucesso");
    
    // Aplicar middleware de autenticação
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Falha na autenticação");
        exit;
    }
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Autenticação OK");
    
    $controller = new BaseHistoricoVeiculoController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Path original: " . $path);

    // Remover prefixo da API se presente
    $basePaths = ['/api/base-historico-veiculo', '/base-historico-veiculo'];
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

    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Path após limpeza: {$path}");
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Method: {$method}, Path final: {$path}");
    error_log("🚗 [BASE_HISTORICO_VEICULO_ENDPOINT] Query params finais: " . json_encode($_GET));
    
    switch ($method) {
        case 'GET':
            if (preg_match('/^\/cpf\/(\d+)\/?$/', $path, $matches)) {
                // GET /base-historico-veiculo/cpf/{cpf_id}
                error_log("🚗 [ENDPOINT] Rota: /cpf/{cpf_id}");
                $_GET['cpf_id'] = $matches[1];
                $controller->getByCpfId();
            } elseif (isset($_GET['cpf_id'])) {
                // GET /base-historico-veiculo?cpf_id={cpf_id}
                error_log("🚗 [ENDPOINT] Rota: query string cpf_id");
                $controller->getByCpfId();
            } elseif ($path === '' || $path === '/') {
                // GET /base-historico-veiculo (with query params)
                error_log("🚗 [ENDPOINT] Rota: raiz com query params");
                if (isset($_GET['cpf_id'])) {
                    $controller->getByCpfId();
                } else {
                    http_response_code(400);
                    echo json_encode(['error' => 'cpf_id é obrigatório']);
                }
            } else {
                error_log("🚗 [ENDPOINT] Rota não encontrada");
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
            if (preg_match('/^\/cpf\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-historico-veiculo/cpf/{cpf_id}
                $_GET['cpf_id'] = $matches[1];
                $controller->deleteByCpfId();
            } elseif (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-historico-veiculo/{id}
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
    error_log("ROUTE_BASE_HISTORICO_VEICULO: Erro fatal - " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}
