<?php
// src/middleware/auth.php

function authenticate($db) {
    $headers = getallheaders();
    $authHeader = null;
    
    // Verificar diferentes formatos de header de autorização
    foreach ($headers as $name => $value) {
        if (strtolower($name) === 'authorization') {
            $authHeader = $value;
            break;
        }
    }
    
    if (!$authHeader) {
        error_log("AUTH_MIDDLEWARE: Header de autorização não encontrado");
        return false;
    }
    
    // Extrair token do header "Bearer token"
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
    } else {
        $token = $authHeader;
    }
    
    if (!$token) {
        error_log("AUTH_MIDDLEWARE: Token não encontrado no header");
        return false;
    }
    
    try {
        // Verificar token na tabela user_sessions  
        $query = "SELECT s.*, u.* FROM user_sessions s 
                 JOIN users u ON s.user_id = u.id 
                 WHERE s.session_token = ? AND s.status = 'ativa' AND s.expires_at > NOW()";
        $stmt = $db->prepare($query);
        $stmt->execute([$token]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            error_log("AUTH_MIDDLEWARE: Usuário autenticado - ID: " . $result['id']);
            return $result;
        } else {
            error_log("AUTH_MIDDLEWARE: Token inválido ou expirado");
            return false;
        }
        
    } catch (Exception $e) {
        error_log("AUTH_MIDDLEWARE ERROR: " . $e->getMessage());
        return false;
    }
}