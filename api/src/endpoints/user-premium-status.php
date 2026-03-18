<?php
// src/endpoints/user-premium-status.php

// Usar caminho absoluto para evitar problemas de path relativo
$baseDir = dirname(dirname(__DIR__)); // Sobe até a raiz da api

// Carregar apenas o que não foi carregado ainda pelo public/index.php
if (!function_exists('authenticate')) {
    require_once $baseDir . '/src/middleware/auth.php';
}
if (!defined('DB_HOST')) {
    require_once $baseDir . '/config/database.php';
}
if (!class_exists('Response')) {
    require_once $baseDir . '/src/utils/Response.php';
}
if (!function_exists('setCORSHeaders')) {
    // cors.php pode não existir em todos os ambientes, então verificamos
    $corsFile = $baseDir . '/config/cors.php';
    if (file_exists($corsFile)) {
        require_once $corsFile;
    }
}

try {
    if (function_exists('setCORSHeaders')) {
        setCORSHeaders();
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    $db = getDBConnection();
    
    $authUser = authenticate($db);
    if (!$authUser) {
        Response::error('Token inválido ou expirado', 401);
        exit();
    }
    
    $userId = $authUser['id'];
    $method = $_SERVER['REQUEST_METHOD'];
    
    // GET - Retornar status premium do usuário
    if ($method === 'GET') {
        $stmt = $db->prepare("SELECT premium_enabled FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success([
            'premium_enabled' => (bool)($result['premium_enabled'] ?? false)
        ], 'Status premium recuperado com sucesso');
        
    // POST - Atualizar status premium do usuário
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['premium_enabled'])) {
            Response::error('Campo premium_enabled é obrigatório', 400);
            exit();
        }
        
        $premiumEnabled = (bool)$input['premium_enabled'];
        
        $stmt = $db->prepare("UPDATE users SET premium_enabled = ? WHERE id = ?");
        $stmt->execute([$premiumEnabled ? 1 : 0, $userId]);
        
        Response::success([
            'premium_enabled' => $premiumEnabled
        ], $premiumEnabled ? 'Painéis Premium desbloqueados!' : 'Painéis Premium bloqueados');
        
    } else {
        Response::error('Método não permitido', 405);
    }
    
} catch (Exception $e) {
    error_log("USER_PREMIUM_STATUS ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
