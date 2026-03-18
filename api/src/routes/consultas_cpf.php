<?php
// src/routes/consultas_cpf.php - Rotas para administração de consultas_cpf

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/ConsultasCpfController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Obter conexão do pool
$db = getDBConnection();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$consultasCpfController = new ConsultasCpfController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/consultas-cpf/all') !== false) {
            $consultasCpfController->getAll();
        } elseif (strpos($path, '/consultas-cpf/stats') !== false) {
            $consultasCpfController->getStats();
        } elseif (strpos($path, '/consultas-cpf/by-user') !== false) {
            $consultasCpfController->getByUserId();
        } elseif (strpos($path, '/consultas-cpf/') !== false) {
            $consultasCpfController->getById();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/consultas-cpf/external-api') !== false) {
            $consultasCpfController->callExternalApi();
        } elseif (strpos($path, '/consultas-cpf/create') !== false || strpos($path, '/consultas-cpf') !== false) {
            $consultasCpfController->create();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (strpos($path, '/consultas-cpf/') !== false) {
            $consultasCpfController->update();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (strpos($path, '/consultas-cpf/') !== false) {
            $consultasCpfController->delete();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}