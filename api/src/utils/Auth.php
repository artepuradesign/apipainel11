<?php
// src/utils/Auth.php

require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../../config/conexao.php';

class Auth {
    
    public static function validateToken() {
        try {
            $db = getDBConnection();
            
            $user = authenticate($db);
            
            if ($user) {
                return [
                    'valid' => true,
                    'user' => $user,
                    'message' => 'Token válido'
                ];
            } else {
                return [
                    'valid' => false,
                    'user' => null,
                    'message' => 'Token inválido ou expirado'
                ];
            }
            
        } catch (Exception $e) {
            error_log("AUTH ERROR: " . $e->getMessage());
            return [
                'valid' => false,
                'user' => null,
                'message' => 'Erro na validação do token'
            ];
        }
    }
}