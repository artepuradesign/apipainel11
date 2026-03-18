<?php
// config/api.php - Configuração da URL da API
// Este arquivo contém apenas a URL da API para facilitar manutenção

define('API_URL', 'https://api.apipainel.com.br');

// Retornar a URL se este arquivo for chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'api_url' => 'https://api.apipainel.com.br'
        ]
    ]);
    exit;
}
?>
