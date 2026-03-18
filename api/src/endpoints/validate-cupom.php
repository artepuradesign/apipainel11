<?php
// api/src/endpoints/validate-cupom.php

// Headers CORS mais permissivos
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $db = getDBConnection();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['codigo']) || empty($input['codigo'])) {
            Response::error('Código do cupom é obrigatório', 400);
            exit;
        }
        
        $codigo = trim(strtoupper($input['codigo']));
        $userId = $input['user_id'] ?? null;
        
        // Buscar cupom
        $query = "SELECT * FROM cupons WHERE UPPER(codigo) = ? AND status = 'ativo'";
        $stmt = $db->prepare($query);
        $stmt->execute([$codigo]);
        $cupom = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$cupom) {
            error_log("VALIDATE_CUPOM: Cupom não encontrado - Código: {$codigo}");
            Response::error('Cupom não encontrado ou inativo', 404);
            exit;
        }
        
        // Verificar se usuário tem permissão para usar este cupom
        if ($cupom['user_ids'] !== null && $userId) {
            $allowedUserIds = json_decode($cupom['user_ids'], true);
            if (is_array($allowedUserIds) && count($allowedUserIds) > 0) {
                if (!in_array((int)$userId, $allowedUserIds)) {
                    error_log("VALIDATE_CUPOM: Usuário não autorizado - User: {$userId}, Cupom: {$codigo}");
                    Response::error('Este cupom não está disponível para você', 403);
                    exit;
                }
            }
        }
        
        // Verificar se ainda é válido (data)
        if ($cupom['valido_ate'] && strtotime($cupom['valido_ate']) < time()) {
            error_log("VALIDATE_CUPOM: Cupom expirado - Código: {$codigo}");
            Response::error('Cupom expirado', 400);
            exit;
        }
        
        // Verificar limite de uso
        if ($cupom['uso_limite'] && $cupom['uso_atual'] >= $cupom['uso_limite']) {
            error_log("VALIDATE_CUPOM: Cupom esgotado - Código: {$codigo}");
            Response::error('Cupom esgotado', 400);
            exit;
        }
        
        // Verificar se usuário já usou este cupom (se user_id fornecido)
        if ($userId) {
            $usoQuery = "SELECT id FROM cupom_uso WHERE cupom_id = ? AND user_id = ?";
            $usoStmt = $db->prepare($usoQuery);
            $usoStmt->execute([$cupom['id'], $userId]);
            
            if ($usoStmt->fetch()) {
                error_log("VALIDATE_CUPOM: Usuário já usou este cupom - User: {$userId}, Cupom: {$codigo}");
                Response::error('Você já utilizou este cupom', 400);
                exit;
            }
        }
        
        error_log("VALIDATE_CUPOM: Cupom válido - Código: {$codigo}, Valor: {$cupom['valor']}, Tipo: {$cupom['tipo']}");
        
        Response::success([
            'id' => (int)$cupom['id'],
            'codigo' => $cupom['codigo'],
            'descricao' => $cupom['descricao'],
            'tipo' => $cupom['tipo'],
            'valor' => (float)$cupom['valor'],
            'isValid' => true,
            'valor_desconto' => (float)$cupom['valor'],
            'tipo_desconto' => $cupom['tipo']
        ], 'Cupom válido');
        
    } catch (Exception $e) {
        error_log("VALIDATE_CUPOM ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor', 500);
    }
} else {
    Response::error('Método não permitido', 405);
}
?>