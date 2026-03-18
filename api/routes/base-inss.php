<?php

require_once __DIR__ . '/../src/controllers/BaseInssController.php';
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
    $controller = new BaseInssController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    // Remover prefixo da API se presente
    $basePaths = ['/api/base-inss', '/base-inss'];
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
                // GET /base-inss/cpf-id/{cpfId}
                $_GET['cpf_id'] = $matches[1];
                $controller->getByCpfId();
            } elseif (preg_match('/^\/cpf\/([^\/]+)\/?$/', $path, $matches)) {
                // GET /base-inss/cpf/{cpf}
                $_GET['cpf'] = $matches[1];
                $controller->getByCpf();
            } elseif (isset($_GET['cpf'])) {
                // GET /base-inss?cpf={cpf}
                $controller->getByCpf();
            } elseif (isset($_GET['cpf_id'])) {
                // GET /base-inss?cpf_id={cpfId}
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
                // DELETE /base-inss/cpf-id/{cpfId}
                $_GET['cpf_id'] = $matches[1];
                $controller->deleteByCpfId();
            } elseif (preg_match('/^\/cpf\/([^\/]+)\/?$/', $path, $matches)) {
                // DELETE /base-inss/cpf/{cpf}
                $_GET['cpf'] = $matches[1];
                $controller->deleteByCpf();
            } elseif (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
                // DELETE /base-inss/{id}
                $_GET['id'] = $matches[1];
                $controller->delete();
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'ID ou CPF é obrigatório para exclusão']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("ROUTE_BASE_INSS: Erro fatal - " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Erro interno do servidor: ' . $e->getMessage()]);
}