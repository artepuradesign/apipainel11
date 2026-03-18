<?php
// api/src/endpoints/cupom-historico-admin.php

// Headers CORS mais permissivos
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $db = getDBConnection();
        
        // Buscar histórico completo de todos os usuários com email
        $query = "SELECT 
                    cu.id as uso_id,
                    cu.cupom_id,
                    cu.user_id,
                    cu.valor_desconto,
                    cu.created_at,
                    c.codigo,
                    c.descricao,
                    c.tipo,
                    c.valor as valor_original,
                    u.email as user_email,
                    u.full_name as user_name,
                    u.username as user_login,
                    u.cpf as user_cpf,
                    u.telefone as user_telefone,
                    u.saldo as user_saldo,
                    u.saldo_plano as user_saldo_plano,
                    u.tipoplano as user_plano,
                    u.status as user_status,
                    u.codigo_indicacao as user_codigo_indicacao,
                    u.created_at as user_created_at
                  FROM cupom_uso cu
                  INNER JOIN cupons c ON cu.cupom_id = c.id
                  LEFT JOIN users u ON cu.user_id = u.id
                  ORDER BY cu.created_at DESC
                  LIMIT 100";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        $historicoCupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear os dados para o admin
        $historicoFormatado = array_map(function($cupom) {
            return [
                'id' => $cupom['uso_id'],
                'cupom_id' => (int)$cupom['cupom_id'],
                'user_id' => (int)$cupom['user_id'],
                'user_email' => $cupom['user_email'],
                'user_name' => $cupom['user_name'],
                'user_login' => $cupom['user_login'],
                'user_cpf' => $cupom['user_cpf'],
                'user_telefone' => $cupom['user_telefone'],
                'user_saldo' => $cupom['user_saldo'] !== null ? (float)$cupom['user_saldo'] : null,
                'user_saldo_plano' => $cupom['user_saldo_plano'] !== null ? (float)$cupom['user_saldo_plano'] : null,
                'user_plano' => $cupom['user_plano'],
                'user_status' => $cupom['user_status'],
                'user_codigo_indicacao' => $cupom['user_codigo_indicacao'],
                'user_created_at' => $cupom['user_created_at'],
                'codigo' => $cupom['codigo'],
                'descricao' => $cupom['descricao'],
                'tipo' => $cupom['tipo'],
                'valor_original' => (float)$cupom['valor_original'],
                'valor_desconto' => (float)$cupom['valor_desconto'],
                'used_at' => $cupom['created_at'],
                'created_at' => $cupom['created_at']
            ];
        }, $historicoCupons);
        
        error_log("CUPOM_HISTORICO_ADMIN: Histórico carregado - " . count($historicoFormatado) . " usos");
        
        Response::success($historicoFormatado, 'Histórico completo de cupons carregado com sucesso');
        
    } catch (Exception $e) {
        error_log("CUPOM_HISTORICO_ADMIN ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar histórico completo de cupons', 500);
    }
} else {
    Response::error('Método não permitido', 405);
}
?>