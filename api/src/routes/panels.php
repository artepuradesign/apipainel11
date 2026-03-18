
<?php
// src/routes/panels.php

require_once __DIR__ . '/../controllers/PanelController.php';
require_once __DIR__ . '/../utils/Response.php';

// Verificar se a conexão com o banco existe
if (!isset($db)) {
    Response::error('Conexão com banco de dados não encontrada', 500);
    exit;
}

// Instanciar o controlador
$panelController = new PanelController($db);

// Obter método HTTP e rota
$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remover query string
$uri = parse_url($uri, PHP_URL_PATH);

// Remover prefixo da API
$uri = str_replace('/api', '', $uri);

// Roteamento
switch ($method) {
    case 'GET':
        if (preg_match('/^\/panels\/(\d+)$/', $uri, $matches)) {
            // GET /panels/{id}
            $panelController->getById((int)$matches[1]);
        } elseif ($uri === '/panels/active') {
            // GET /panels/active
            $panelController->getActive();
        } elseif ($uri === '/panels') {
            // GET /panels
            $panelController->getAll();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if ($uri === '/panels') {
            // POST /panels
            $panelController->create();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/^\/panels\/(\d+)$/', $uri, $matches)) {
            // PUT /panels/{id}
            $panelController->update((int)$matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/^\/panels\/(\d+)$/', $uri, $matches)) {
            // DELETE /panels/{id}
            $panelController->delete((int)$matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
        break;
}
?>
