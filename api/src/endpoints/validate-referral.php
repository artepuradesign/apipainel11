<?php
// api/src/endpoints/validate-referral.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = getDBConnection();
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['code']) || empty($input['code'])) {
            Response::error('Código de indicação é obrigatório', 400);
            exit;
        }
        
        $code = trim($input['code']);
        
        // Buscar usuário pelo código de indicação
        $query = "SELECT id, full_name, email, status FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
        $stmt = $db->prepare($query);
        $stmt->execute([$code]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            error_log("VALIDATE_REFERRAL: Código válido encontrado - User ID: {$user['id']}, Nome: {$user['full_name']}");
            
            Response::success([
                'referrer_id' => (int)$user['id'],
                'referrer_name' => $user['full_name'],
                'referrer_email' => $user['email'],
                'referralCode' => $code,
                'isValid' => true,
                'valid' => true, // Para compatibilidade
                'code' => $code  // Para compatibilidade
            ], 'Código de indicação válido');
        } else {
            error_log("VALIDATE_REFERRAL: Código inválido ou usuário inativo: {$code}");
            Response::error('Código de indicação não encontrado ou inválido', 404);
        }
        
    } catch (Exception $e) {
        error_log("VALIDATE_REFERRAL ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor', 500);
    }
} else {
    Response::error('Método não permitido', 405);
}