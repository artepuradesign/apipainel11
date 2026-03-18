
<?php
// src/config/cors.php

// CORS Configuration - DEVE SER EXECUTADO ANTES DE QUALQUER OUTPUT
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// Incluir também X-API-KEY/x-api-key (o frontend envia esse header em algumas rotas)
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key, X-Api-Key, x-api-key");
header("Access-Control-Max-Age: 86400");

// Handle preflight requests IMEDIATAMENTE
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Content-Type: application/json; charset=UTF-8");
