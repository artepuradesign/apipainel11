<?php
// src/routes/base_boletim_ocorrencia.php

require_once __DIR__ . '/../controllers/BaseBoletimOcorrenciaController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$boletimController = new BaseBoletimOcorrenciaController($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Normalizar path
if (strpos($path, '/api/') === 0) {
    $path = substr($path, 4);
}

switch ($method) {
    case 'GET':
        // /base-boletim-ocorrencia/cpf/{cpf_id}
        if (preg_match('/\/base-boletim-ocorrencia\/cpf\/(\d+)/', $path, $matches)) {
            $boletimController->getByCpfId($matches[1]);
            exit;
        }
        // /base-boletim-ocorrencia/{id}
        if (preg_match('/\/base-boletim-ocorrencia\/(\d+)$/', $path, $matches)) {
            $boletimController->show($matches[1]);
            exit;
        }
        // /base-boletim-ocorrencia
        if (strpos($path, '/base-boletim-ocorrencia') !== false) {
            $boletimController->index();
            exit;
        }
        
        Response::error("Endpoint não encontrado: {$path}", 404);
        break;
        
    case 'POST':
        if (strpos($path, '/base-boletim-ocorrencia') !== false && !preg_match('/\/base-boletim-ocorrencia\/\d+/', $path)) {
            $boletimController->store();
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-boletim-ocorrencia\/(\d+)$/', $path, $matches)) {
            $boletimController->update($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-boletim-ocorrencia\/(\d+)$/', $path, $matches)) {
            $boletimController->delete($matches[1]);
        } else {
            Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método HTTP não permitido', 405);
        break;
}
