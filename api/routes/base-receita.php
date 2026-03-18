<?php

require_once __DIR__ . '/../src/controllers/BaseReceitaController.php';

// Headers padrão JSON e CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With');

// Pré-flight (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$controller = new BaseReceitaController();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remover prefixo da API se presente (suporta múltiplos base paths)
$basePaths = ['/api/base-receita', '/base-receita'];
foreach ($basePaths as $bp) {
    if (strpos($path, $bp) === 0) {
        $path = substr($path, strlen($bp));
        break;
    }
}
// Normalizar caminho vazio
if ($path === false || $path === null) {
    $path = '/';
}
if ($path === '') {
    $path = '/';
}

switch ($method) {
    case 'GET':
        if ($path === '/by-cpf' || $path === '/by-cpf/') {
            $controller->getByCpf();
        } elseif ($path === '' || $path === '/') {
            $controller->getAll();
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
        if (preg_match('/^\/(\d+)\/?$/', $path, $matches)) {
            $_GET['id'] = $matches[1];
            $controller->delete();
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'ID é obrigatório para exclusão']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}