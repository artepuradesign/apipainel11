<?php
// src/routes/base_cpf.php - Rotas para administração de base_cpf

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/BaseCpfController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

try {
    // Obter conexão do pool
    $db = getDBConnection();
    
    $authMiddleware = new AuthMiddleware($db);
    if (!$authMiddleware->handle()) {
        exit;
    }

    $baseCpfController = new BaseCpfController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

    switch ($method) {
        case 'GET':
            if (strpos($path, '/base-cpf/all') !== false) {
                $baseCpfController->getAll();
            } elseif (strpos($path, '/base-cpf/by-cpf') !== false) {
                $baseCpfController->getByCpf();
            } elseif (preg_match('/\/base-cpf\/(\d+)$/', $path, $matches)) {
                // GET /base-cpf/{id}
                $_GET['id'] = $matches[1];
                $baseCpfController->getById();
            } else {
                Response::notFound('Endpoint não encontrado');
            }
            break;
            
        case 'POST':
            if (strpos($path, '/base-cpf/create') !== false || (strpos($path, '/base-cpf') !== false && !strpos($path, '/base-cpf/'))) {
                $baseCpfController->create();
            } else {
                Response::notFound('Endpoint não encontrado');
            }
            break;
            
        case 'PUT':
            if (preg_match('/\/base-cpf\/(\d+)$/', $path, $matches)) {
                // PUT /base-cpf/{id}
                $_GET['id'] = $matches[1];
                $baseCpfController->update();
            } else {
                Response::notFound('Endpoint não encontrado');
            }
            break;
            
        case 'DELETE':
            if (preg_match('/\/base-cpf\/(\d+)$/', $path, $matches)) {
                // DELETE /base-cpf/{id}
                $_GET['id'] = $matches[1];
                $baseCpfController->delete();
            } else {
                Response::notFound('Endpoint não encontrado');
            }
            break;
            
        default:
            Response::methodNotAllowed('Método não permitido');
            break;
    }
} catch (Exception $e) {
    error_log("BASE_CPF ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
}
// Não fechar a conexão - o pool gerencia automaticamente