<?php
// src/routes/base_empresa_socio.php

require_once __DIR__ . '/../controllers/BaseEmpresaSocioController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$empresaSocioController = new BaseEmpresaSocioController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar path - remover /api se existir
if (strpos($path, '/api/') === 0) {
    $path = substr($path, 4);
}

// Debug logging
error_log("BASE_EMPRESA_SOCIO: method={$method}, original_path={$_SERVER['REQUEST_URI']}, normalized_path={$path}");

switch ($method) {
    case 'GET':
        // Prioridade 1: /base-empresa-socio/cpf/{cpf_id}
        if (preg_match('/\/base-empresa-socio\/cpf\/(\d+)/', $path, $matches)) {
            error_log("BASE_EMPRESA_SOCIO: Matched cpf route, cpfId={$matches[1]}");
            $empresaSocioController->getByCpfId($matches[1]);
            exit;
        }
        // Prioridade 2: /base-empresa-socio/{id}
        if (preg_match('/\/base-empresa-socio\/(\d+)$/', $path, $matches)) {
            error_log("BASE_EMPRESA_SOCIO: Matched id route, id={$matches[1]}");
            $empresaSocioController->show($matches[1]);
            exit;
        }
        // Prioridade 3: /base-empresa-socio (listar todos)
        if (strpos($path, '/base-empresa-socio') !== false) {
            error_log("BASE_EMPRESA_SOCIO: Matched index route");
            $empresaSocioController->index();
            exit;
        }
        
        error_log("BASE_EMPRESA_SOCIO: NO MATCH - path={$path}");
        Response::error("Endpoint não encontrado: {$path}", 404);
        break;
        
    case 'POST':
        if (strpos($path, '/base-empresa-socio') !== false && !preg_match('/\/base-empresa-socio\/\d+/', $path)) {
            // POST /base-empresa-socio
            $empresaSocioController->store();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-empresa-socio\/(\d+)$/', $path, $matches)) {
            $empresaSocioController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-empresa-socio\/(\d+)$/', $path, $matches)) {
            $empresaSocioController->delete($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
