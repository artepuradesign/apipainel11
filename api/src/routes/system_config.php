<?php
// src/routes/system_config.php

require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^/api#', '', (string)$path);

try {
    if ($method === 'GET' && strpos($path, '/system-config/get') === 0) {
        require __DIR__ . '/../endpoints/system-config/get.php';
        exit;
    }

    if ($method === 'POST' && strpos($path, '/system-config/update') === 0) {
        require __DIR__ . '/../endpoints/system-config/update.php';
        exit;
    }

    Response::error('Endpoint não encontrado', 404);
} catch (Exception $e) {
    error_log('SYSTEM_CONFIG_ROUTE ERROR: ' . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
