
<?php
// src/utils/Response.php

class Response {
    public static function success($data = null, $message = 'Sucesso', $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        error_log("RESPONSE SUCCESS: " . json_encode($response));
        
        // Garantir que não há output anterior
        if (ob_get_level()) {
            ob_clean();
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public static function error($message = 'Erro', $code = 400, $data = null) {
        http_response_code($code);
        header('Content-Type: application/json; charset=utf-8');
        
        $response = [
            'success' => false,
            'error' => $message,
            'message' => $message, // Compatibilidade
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        error_log("RESPONSE ERROR: " . json_encode($response));
        
        // Garantir que não há output anterior
        if (ob_get_level()) {
            ob_clean();
        }
        
        echo json_encode($response, JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    public static function serverError($message = 'Erro interno do servidor', $data = null) {
        // Resposta padronizada para erros 500
        self::error($message, 500, $data);
    }
    
    public static function unauthorized($message = 'Não autorizado', $data = null) {
        self::error($message, 401, $data);
    }
    
    public static function notFound($message = 'Não encontrado', $data = null) {
        self::error($message, 404, $data);
    }
    
    public static function methodNotAllowed($message = 'Método não permitido', $data = null) {
        self::error($message, 405, $data);
    }
}
