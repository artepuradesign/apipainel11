
<?php
// src/routes/modules.php

require_once __DIR__ . '/../controllers/ModuleController.php';
require_once __DIR__ . '/../utils/Response.php';

// Verificar se a conexão com o banco existe
if (!isset($db)) {
    Response::error('Conexão com banco de dados não encontrada', 500);
    exit;
}

// Instanciar o controlador
$moduleController = new ModuleController($db);

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
        if (preg_match('/^\/modules\/(\d+)$/', $uri, $matches)) {
            // GET /modules/{id}
            $moduleController->getById((int)$matches[1]);
        } elseif (preg_match('/^\/modules\/panel\/(\d+)$/', $uri, $matches)) {
            // GET /modules/panel/{panelId}
            $moduleController->getByPanel((int)$matches[1]);
        } elseif ($uri === '/modules/active') {
            // GET /modules/active
            $moduleController->getActive();
        } elseif ($uri === '/modules') {
            // GET /modules
            $moduleController->getAll();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'POST':
        if ($uri === '/modules') {
            // POST /modules
            $moduleController->create();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/^\/modules\/(\d+)\/toggle-status$/', $uri, $matches)) {
            // PUT /modules/{id}/toggle-status
            $moduleController->toggleStatus((int)$matches[1]);
        } elseif (preg_match('/^\/modules\/(\d+)$/', $uri, $matches)) {
            // PUT /modules/{id}
            $moduleController->update((int)$matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/^\/modules\/(\d+)$/', $uri, $matches)) {
            // DELETE /modules/{id}
            $moduleController->delete((int)$matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método não permitido', 405);
        break;
}
