<?php
// api/src/endpoints/cupom-historico.php

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
        
        // Verificar se user_id foi fornecido
        $userId = $_GET['user_id'] ?? null;
        
        if (!$userId) {
            Response::error('ID do usuário é obrigatório', 400);
            exit;
        }
        
        // Buscar histórico de cupons usados pelo usuário
        $query = "SELECT 
                    cu.id as uso_id,
                    cu.cupom_id,
                    cu.user_id,
                    cu.valor_desconto,
                    cu.created_at,
                    c.codigo,
                    c.descricao,
                    c.tipo,
                    c.valor as valor_original
                  FROM cupom_uso cu
                  INNER JOIN cupons c ON cu.cupom_id = c.id
                  WHERE cu.user_id = ?
                  ORDER BY cu.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$userId]);
        $historicoCupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Formatear os dados para o frontend
        $historicoFormatado = array_map(function($cupom) {
            return [
                'id' => $cupom['uso_id'],
                'cupom_id' => (int)$cupom['cupom_id'],
                'codigo' => $cupom['codigo'],
                'descricao' => $cupom['descricao'],
                'tipo' => $cupom['tipo'],
                'valor_original' => (float)$cupom['valor_original'],
                'valor_desconto' => (float)$cupom['valor_desconto'],
                'used_at' => $cupom['created_at'],
                'created_at' => $cupom['created_at'], // Para compatibilidade com outros históricos
                'type' => 'cupom_bonus',
                'amount' => (float)$cupom['valor_desconto'],
                'description' => "Cupom {$cupom['codigo']} aplicado" . ($cupom['descricao'] ? " - {$cupom['descricao']}" : ''),
                'balance_type' => 'wallet',
                'status' => 'completed'
            ];
        }, $historicoCupons);
        
        error_log("CUPOM_HISTORICO: Histórico carregado para usuário {$userId} - " . count($historicoFormatado) . " cupons");
        
        Response::success($historicoFormatado, 'Histórico de cupons carregado com sucesso');
        
    } catch (Exception $e) {
        error_log("CUPOM_HISTORICO ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar histórico de cupons', 500);
    }
} else {
    Response::error('Método não permitido', 405);
}
?>