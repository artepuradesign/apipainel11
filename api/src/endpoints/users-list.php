<?php
// api/src/endpoints/users-list.php - Endpoint para listar usuários

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = getDBConnection();
        
        // Buscar todos os usuários com informações básicas
        $query = "SELECT id, username, nome, email, user_role, status 
                 FROM users 
                 WHERE status = 'ativo'
                 ORDER BY nome ASC, username ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("USERS_LIST: " . count($users) . " usuários encontrados");
        
        Response::success($users, 'Usuários carregados com sucesso');
        
    } catch (Exception $e) {
        error_log("USERS_LIST ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar usuários: ' . $e->getMessage(), 500);
    }
} else {
    Response::error('Método não permitido', 405);
}
?>
