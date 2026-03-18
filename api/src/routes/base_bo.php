<?php
// src/routes/base_bo.php

require_once __DIR__ . '/../controllers/BaseBoController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$boController = new BaseBoController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar path
if (strpos($path, '/api/') === 0) {
    $path = substr($path, 4);
}

switch ($method) {
    case 'GET':
        // /base-bo/cpf/{cpf_id}
        if (preg_match('/\/base-bo\/cpf\/(\d+)/', $path, $matches)) {
            $boController->getByCpfId($matches[1]);
            exit;
        }
        // /base-bo/{id}
        if (preg_match('/\/base-bo\/(\d+)$/', $path, $matches)) {
            $boController->show($matches[1]);
            exit;
        }
        // /base-bo
        if (strpos($path, '/base-bo') !== false) {
            $boController->index();
            exit;
        }
        
        Response::error("Endpoint não encontrado: {$path}", 404);
        break;
        
    case 'POST':
        if (strpos($path, '/base-bo') !== false && !preg_match('/\/base-bo\/\d+/', $path)) {
            $boController->store();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-bo\/(\d+)$/', $path, $matches)) {
            $boController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-bo\/(\d+)$/', $path, $matches)) {
            $boController->delete($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
