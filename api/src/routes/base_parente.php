<?php
// src/routes/base_parente.php

require_once __DIR__ . '/../controllers/BaseParenteController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$parenteController = new BaseParenteController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar path - remover /api se existir
if (strpos($path, '/api/') === 0) {
    $path = substr($path, 4);
}

// Debug logging
error_log("BASE_PARENTE: method={$method}, original_path={$_SERVER['REQUEST_URI']}, normalized_path={$path}");

switch ($method) {
    case 'GET':
        // Prioridade 1: /base-parente/cpf/{cpf_id}
        if (preg_match('/\/base-parente\/cpf\/(\d+)/', $path, $matches)) {
            error_log("BASE_PARENTE: Matched cpf route, cpfId={$matches[1]}");
            $parenteController->getByCpfId($matches[1]);
            exit;
        }
        // Prioridade 2: /base-parente/{id}
        if (preg_match('/\/base-parente\/(\d+)$/', $path, $matches)) {
            error_log("BASE_PARENTE: Matched id route, id={$matches[1]}");
            $parenteController->show($matches[1]);
            exit;
        }
        // Prioridade 3: /base-parente (listar todos)
        if (strpos($path, '/base-parente') !== false) {
            error_log("BASE_PARENTE: Matched index route");
            $parenteController->index();
            exit;
        }
        
        error_log("BASE_PARENTE: NO MATCH - path={$path}");
        Response::error("Endpoint não encontrado: {$path}", 404);
        break;
        
    case 'POST':
        if (strpos($path, '/base-parente') !== false && !preg_match('/\/base-parente\/\d+/', $path)) {
            // POST /base-parente
            $parenteController->store();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-parente\/(\d+)$/', $path, $matches)) {
            $parenteController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-parente\/(\d+)$/', $path, $matches)) {
            $parenteController->delete($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
