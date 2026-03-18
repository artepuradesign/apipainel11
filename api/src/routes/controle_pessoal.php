<?php
// src/routes/controle_pessoal.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../controllers/ControlePessoalController.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$controller = new ControlePessoalController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api(?:\.php)?#', '', $path);
$path = rtrim($path, '/');

$moduleBaseMap = [
    'agenda' => '/controlepessoal-agenda',
    'financeiro' => '/controlepessoal-financeiro',
    'novocliente' => '/controlepessoal-novocliente',
    'relatorios' => '/controlepessoal-relatorios',
    'vendasimples' => '/controlepessoal-vendasimples',
];

$forcedModule = $forcedModule ?? null;
$basePath = '/controle-pessoal';

if ($forcedModule !== null) {
    if (!isset($moduleBaseMap[$forcedModule])) {
        Response::error('Módulo forçado inválido na rota', 500);
    }
    $basePath = $moduleBaseMap[$forcedModule];
    $_GET['modulo'] = $forcedModule;
}

$escapedBasePath = preg_quote($basePath, '#');

switch ($method) {
    case 'GET':
        if (preg_match('#^' . $escapedBasePath . '/stats$#', $path)) {
            if ($forcedModule) {
                $_GET['modulo'] = $forcedModule;
            }
            $controller->stats();
        } elseif (preg_match('#^' . $escapedBasePath . '/(\d+)$#', $path, $matches)) {
            $controller->obter((int)$matches[1]);
        } elseif (preg_match('#^' . $escapedBasePath . '$#', $path)) {
            if ($forcedModule) {
                $_GET['modulo'] = $forcedModule;
            }
            $controller->listar();
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'POST':
        if (preg_match('#^' . $escapedBasePath . '$#', $path)) {
            if ($forcedModule) {
                $controller->criarComModulo($forcedModule);
            } else {
                $controller->criar();
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'PUT':
    case 'PATCH':
        if (preg_match('#^' . $escapedBasePath . '/(\d+)$#', $path, $matches)) {
            if ($forcedModule) {
                $controller->atualizarComModulo((int)$matches[1], $forcedModule);
            } else {
                $controller->atualizar((int)$matches[1]);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    case 'DELETE':
        if (preg_match('#^' . $escapedBasePath . '/(\d+)$#', $path, $matches)) {
            $controller->deletar((int)$matches[1]);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;

    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
