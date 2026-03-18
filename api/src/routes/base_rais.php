<?php
// src/routes/base_rais.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/BaseRaisController.php';

$db = getDBConnection();
$controller = new BaseRaisController($db);

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Remover a base da URI
$path = str_replace('/base-rais', '', parse_url($uri, PHP_URL_PATH));
$path = trim($path, '/');

error_log("BASE RAIS ROUTE - Method: $method, Path: $path, Full URI: $uri");

// Rotas
if (empty($path)) {
    // /base-rais
    if ($method === 'GET') {
        $controller->getAll();
    } elseif ($method === 'POST') {
        $controller->create();
    } else {
        Response::methodNotAllowed();
    }
} elseif (preg_match('/^cpf-id\/(\d+)$/', $path, $matches)) {
    // /base-rais/cpf-id/{cpf_id}
    if ($method === 'GET') {
        $controller->getByCpfId($matches[1]);
    } else {
        Response::methodNotAllowed();
    }
} elseif (preg_match('/^(\d+)$/', $path, $matches)) {
    // /base-rais/{id}
    $id = $matches[1];
    
    if ($method === 'GET') {
        $controller->getById($id);
    } elseif ($method === 'PUT') {
        $controller->update($id);
    } elseif ($method === 'DELETE') {
        $controller->delete($id);
    } else {
        Response::methodNotAllowed();
    }
} else {
    Response::notFound('Rota não encontrada');
}
