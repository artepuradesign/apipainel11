<?php
// api/src/endpoints/use-cupom-desconto.php
// Endpoint para usar cupom apenas como desconto (não adiciona saldo)

// Headers CORS
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
        
        if (!isset($input['user_id']) || !$input['user_id']) {
            Response::error('ID do usuário é obrigatório', 400);
            exit;
        }
        
        $codigo = trim(strtoupper($input['codigo']));
        $userId = $input['user_id'];
        $valorRecarga = $input['valor_recarga'] ?? 0;
        
        $db->beginTransaction();
        
        try {
            // Buscar cupom
            $query = "SELECT * FROM cupons WHERE UPPER(codigo) = ? AND status = 'ativo' FOR UPDATE";
            $stmt = $db->prepare($query);
            $stmt->execute([$codigo]);
            $cupom = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$cupom) {
                throw new Exception('Cupom não encontrado ou inativo');
            }
            
            // Verificar se ainda é válido (data)
            if ($cupom['valido_ate'] && strtotime($cupom['valido_ate']) < time()) {
                throw new Exception('Cupom expirado');
            }
            
            // Verificar limite de uso
            if ($cupom['uso_limite'] && $cupom['uso_atual'] >= $cupom['uso_limite']) {
                throw new Exception('Cupom esgotado');
            }
            
            // Verificar se usuário já usou este cupom
            $usoQuery = "SELECT id FROM cupom_uso WHERE cupom_id = ? AND user_id = ?";
            $usoStmt = $db->prepare($usoQuery);
            $usoStmt->execute([$cupom['id'], $userId]);
            
            if ($usoStmt->fetch()) {
                throw new Exception('Você já utilizou este cupom');
            }
            
            // Calcular valor do desconto
            $valorDesconto = 0;
            if ($cupom['tipo'] === 'fixo') {
                $valorDesconto = (float)$cupom['valor'];
            } else if ($cupom['tipo'] === 'percentual' && $valorRecarga > 0) {
                $valorDesconto = ($valorRecarga * (float)$cupom['valor']) / 100;
            }
            
            if ($valorDesconto <= 0) {
                throw new Exception('Valor de desconto inválido');
            }
            
            // Registrar uso do cupom APENAS como desconto (não adiciona saldo)
            $usoInsertQuery = "INSERT INTO cupom_uso (cupom_id, user_id, valor_desconto, tipo_uso) VALUES (?, ?, ?, 'desconto')";
            $usoInsertStmt = $db->prepare($usoInsertQuery);
            $usoInsertStmt->execute([$cupom['id'], $userId, $valorDesconto]);
            
            // Atualizar contador de uso do cupom
            $updateQuery = "UPDATE cupons SET uso_atual = uso_atual + 1, updated_at = NOW() WHERE id = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$cupom['id']]);
            
            $db->commit();
            
            error_log("CUPOM USADO COMO DESCONTO: User {$userId}, Cupom {$codigo}, Valor: {$valorDesconto}");
            
            Response::success([
                'cupom_id' => (int)$cupom['id'],
                'codigo' => $cupom['codigo'],
                'valor_desconto' => $valorDesconto,
                'tipo' => $cupom['tipo'],
                'aplicado_como' => 'desconto'
            ], 'Cupom aplicado como desconto com sucesso!');
            
        } catch (Exception $e) {
            $db->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("USE_CUPOM_DESCONTO ERROR: " . $e->getMessage());
        Response::error($e->getMessage(), 400);
    }
} else {
    Response::error('Método não permitido', 405);
}
?>