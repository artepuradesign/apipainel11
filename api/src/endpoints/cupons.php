<?php
// api/src/endpoints/cupons.php

error_log("CUPONS_ENDPOINT: Iniciando processamento do endpoint");

// Headers CORS mais permissivos
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("CUPONS_ENDPOINT: Requisição OPTIONS recebida");
    http_response_code(200);
    exit(0);
}

error_log("CUPONS_ENDPOINT: Método da requisição: " . $_SERVER['REQUEST_METHOD']);
error_log("CUPONS_ENDPOINT: URI da requisição: " . ($_SERVER['REQUEST_URI'] ?? 'N/A'));
error_log("CUPONS_ENDPOINT: Query parameters: " . ($_SERVER['QUERY_STRING'] ?? 'N/A'));

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';

// Listar cupons (GET)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    error_log("CUPONS_ENDPOINT: Processando requisição GET");
    try {
        error_log("CUPONS_ENDPOINT: Tentando conectar ao banco de dados");
        $db = getDBConnection();
        error_log("CUPONS_ENDPOINT: Conexão com banco estabelecida com sucesso");
        
        // Para administradores - listar todos os cupons
        if (isset($_GET['admin']) && $_GET['admin'] === 'true') {
            error_log("CUPONS_ENDPOINT: Carregando todos os cupons (modo admin)");
            $query = "SELECT * FROM cupons ORDER BY created_at DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $cupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("CUPONS_ENDPOINT: " . count($cupons) . " cupons encontrados (admin)");
            Response::success($cupons, 'Cupons carregados com sucesso');
        }
        // Para usuários - listar apenas cupons ativos e válidos
        else {
            error_log("CUPONS_ENDPOINT: Carregando cupons disponíveis (modo usuário)");
            $query = "SELECT id, codigo, descricao, tipo, valor, uso_limite, uso_atual, valido_ate 
                     FROM cupons 
                     WHERE status = 'ativo' 
                     AND (valido_ate IS NULL OR valido_ate > NOW())
                     AND (uso_limite IS NULL OR uso_atual < uso_limite)
                     ORDER BY valor DESC";
            $stmt = $db->prepare($query);
            $stmt->execute();
            $cupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("CUPONS_ENDPOINT: " . count($cupons) . " cupons disponíveis encontrados");
            Response::success($cupons, 'Cupons disponíveis carregados');
        }
        
    } catch (Exception $e) {
        error_log("CUPONS_ENDPOINT GET ERROR: " . $e->getMessage());
        error_log("CUPONS_ENDPOINT GET TRACE: " . $e->getTraceAsString());
        Response::error('Erro ao carregar cupons: ' . $e->getMessage(), 500);
    }
}

// Criar cupom (POST)
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = null;
    try {
        error_log("CUPONS_POST: Iniciando criação de cupom");
        
        // Ler input
        $rawInput = file_get_contents('php://input');
        error_log("CUPONS_POST: Raw input recebido: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("CUPONS_POST ERROR: Erro ao decodificar JSON: " . json_last_error_msg());
            Response::error('JSON inválido: ' . json_last_error_msg(), 400);
            exit;
        }
        
        error_log("CUPONS_POST: Input decodificado: " . json_encode($input));
        
        // Conectar ao banco
        error_log("CUPONS_POST: Conectando ao banco de dados...");
        $db = getDBConnection();
        error_log("CUPONS_POST: Conexão estabelecida com sucesso");
        
        // Validações
        if (!isset($input['codigo']) || empty($input['codigo'])) {
            error_log("CUPONS_POST: Código do cupom ausente");
            Response::error('Código do cupom é obrigatório', 400);
            exit;
        }
        
        if (!isset($input['tipo']) || !in_array($input['tipo'], ['fixo', 'percentual'])) {
            error_log("CUPONS_POST: Tipo do cupom inválido: " . ($input['tipo'] ?? 'NULL'));
            Response::error('Tipo do cupom inválido', 400);
            exit;
        }
        
        if (!isset($input['valor']) || $input['valor'] <= 0) {
            error_log("CUPONS_POST: Valor do cupom inválido: " . ($input['valor'] ?? 'NULL'));
            Response::error('Valor do cupom deve ser maior que zero', 400);
            exit;
        }
        
        // Verificar se código já existe
        error_log("CUPONS_POST: Verificando se código já existe: " . $input['codigo']);
        $checkQuery = "SELECT id FROM cupons WHERE codigo = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$input['codigo']]);
        
        if ($checkStmt->fetch()) {
            error_log("CUPONS_POST: Código já existe: " . $input['codigo']);
            Response::error('Código do cupom já existe', 400);
            exit;
        }
        
        // Converter formato de data se necessário
        $validoAte = null;
        if (isset($input['valido_ate']) && !empty($input['valido_ate'])) {
            // Converter de "2025-11-03T20:52" para "2025-11-03 20:52:00"
            $validoAte = str_replace('T', ' ', $input['valido_ate']) . ':00';
            error_log("CUPONS_POST: Data de validade convertida: " . $validoAte);
        }
        
        // Preparar valores
        $codigo = $input['codigo'];
        $descricao = $input['descricao'] ?? null;
        $tipo = $input['tipo'];
        $valor = $input['valor'];
        $destinoSaldo = $input['destino_saldo'] ?? 'plano';
        $status = $input['status'] ?? 'ativo';
        $usoLimite = $input['uso_limite'] ?? null;
        
        error_log("CUPONS_POST: Preparando inserção no banco:");
        error_log("  - codigo: $codigo");
        error_log("  - descricao: " . ($descricao ?? 'NULL'));
        error_log("  - tipo: $tipo");
        error_log("  - valor: $valor");
        error_log("  - destino_saldo: $destinoSaldo");
        error_log("  - status: $status");
        error_log("  - uso_limite: " . ($usoLimite ?? 'NULL'));
        error_log("  - valido_ate: " . ($validoAte ?? 'NULL'));
        
        // Verificar se a tabela existe e quais colunas tem
        try {
            $checkTableQuery = "DESCRIBE cupons";
            $checkTableStmt = $db->prepare($checkTableQuery);
            $checkTableStmt->execute();
            $columns = $checkTableStmt->fetchAll(PDO::FETCH_COLUMN);
            error_log("CUPONS_POST: Colunas da tabela cupons: " . json_encode($columns));
        } catch (Exception $tableError) {
            error_log("CUPONS_POST: Erro ao verificar estrutura da tabela: " . $tableError->getMessage());
        }
        
        // Inserir cupom
        $query = "INSERT INTO cupons (codigo, descricao, tipo, valor, destino_saldo, status, uso_limite, uso_atual, valido_ate) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)";
        
        error_log("CUPONS_POST: Query preparada: " . $query);
        
        $stmt = $db->prepare($query);
        
        if (!$stmt) {
            $errorInfo = $db->errorInfo();
            error_log("CUPONS_POST: Erro ao preparar query: " . json_encode($errorInfo));
            Response::error('Erro ao preparar query: ' . $errorInfo[2], 500);
            exit;
        }
        
        error_log("CUPONS_POST: Executando query...");
        $executeResult = $stmt->execute([
            $codigo,
            $descricao,
            $tipo,
            $valor,
            $destinoSaldo,
            $status,
            $usoLimite,
            $validoAte
        ]);
        
        if (!$executeResult) {
            $errorInfo = $stmt->errorInfo();
            error_log("CUPONS_POST: Erro ao executar query: " . json_encode($errorInfo));
            Response::error('Erro ao executar query: ' . $errorInfo[2], 500);
            exit;
        }
        
        $cupomId = $db->lastInsertId();
        
        error_log("CUPOM CRIADO COM SUCESSO: ID {$cupomId}, Código: {$codigo}");
        
        Response::success([
            'id' => (int)$cupomId,
            'codigo' => $codigo
        ], 'Cupom criado com sucesso');
        
    } catch (PDOException $e) {
        error_log("CUPONS_POST PDO ERROR: " . $e->getMessage());
        error_log("CUPONS_POST PDO CODE: " . $e->getCode());
        error_log("CUPONS_POST PDO TRACE: " . $e->getTraceAsString());
        if ($input) {
            error_log("CUPONS_POST INPUT: " . json_encode($input));
        }
        Response::error('Erro de banco de dados ao criar cupom: ' . $e->getMessage(), 500);
    } catch (Exception $e) {
        error_log("CUPONS_POST GENERAL ERROR: " . $e->getMessage());
        error_log("CUPONS_POST TRACE: " . $e->getTraceAsString());
        if ($input) {
            error_log("CUPONS_POST INPUT: " . json_encode($input));
        }
        Response::error('Erro ao criar cupom: ' . $e->getMessage(), 500);
    }
}

// Atualizar cupom (PUT)
elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    try {
        error_log("CUPONS_PUT: Iniciando atualização de cupom");
        $db = getDBConnection();
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !$input['id']) {
            Response::error('ID do cupom é obrigatório', 400);
            exit;
        }
        
        error_log("CUPONS_PUT: Atualizando cupom ID: " . $input['id']);
        
        // Verificar se cupom existe
        $checkQuery = "SELECT id FROM cupons WHERE id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$input['id']]);
        
        if (!$checkStmt->fetch()) {
            error_log("CUPONS_PUT: Cupom não encontrado: " . $input['id']);
            Response::error('Cupom não encontrado', 404);
            exit;
        }
        
        // Verificar se código já existe em outro cupom
        if (isset($input['codigo']) && !empty($input['codigo'])) {
            error_log("CUPONS_PUT: Verificando duplicidade do código: " . $input['codigo']);
            $checkDuplicateQuery = "SELECT id FROM cupons WHERE codigo = ? AND id != ?";
            $checkDuplicateStmt = $db->prepare($checkDuplicateQuery);
            $checkDuplicateStmt->execute([$input['codigo'], $input['id']]);
            
            if ($checkDuplicateStmt->fetch()) {
                error_log("CUPONS_PUT: Código já existe em outro cupom: " . $input['codigo']);
                Response::error('Código do cupom já existe', 400);
                exit;
            }
        }
        
        // Converter formato de data se necessário
        $validoAte = null;
        if (isset($input['valido_ate']) && !empty($input['valido_ate'])) {
            // Converter de "2025-11-03T20:52" para "2025-11-03 20:52:00"
            $validoAte = str_replace('T', ' ', $input['valido_ate']) . ':00';
        }
        
        // Atualizar cupom
        $query = "UPDATE cupons SET 
                 codigo = ?, descricao = ?, tipo = ?, valor = ?, destino_saldo = ?,
                 status = ?, uso_limite = ?, valido_ate = ?, updated_at = NOW()
                 WHERE id = ?";
        
        $stmt = $db->prepare($query);
        $stmt->execute([
            $input['codigo'],
            $input['descricao'] ?? null,
            $input['tipo'],
            $input['valor'],
            $input['destino_saldo'] ?? 'plano',
            $input['status'] ?? 'ativo',
            $input['uso_limite'] ?? null,
            $validoAte,
            $input['id']
        ]);
        
        error_log("CUPOM ATUALIZADO: ID {$input['id']}");
        
        Response::success(['id' => $input['id']], 'Cupom atualizado com sucesso');
        
    } catch (Exception $e) {
        error_log("CUPONS PUT ERROR: " . $e->getMessage());
        error_log("CUPONS PUT TRACE: " . $e->getTraceAsString());
        Response::error('Erro ao atualizar cupom: ' . $e->getMessage(), 500);
    }
}

// Deletar cupom (DELETE)
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $db = getDBConnection();
        
        if (!isset($_GET['id']) || !$_GET['id']) {
            Response::error('ID do cupom é obrigatório', 400);
            exit;
        }
        
        $cupomId = $_GET['id'];
        
        // Verificar se cupom existe
        $checkQuery = "SELECT id FROM cupons WHERE id = ?";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute([$cupomId]);
        
        if (!$checkStmt->fetch()) {
            Response::error('Cupom não encontrado', 404);
            exit;
        }
        
        // Deletar cupom
        $query = "DELETE FROM cupons WHERE id = ?";
        $stmt = $db->prepare($query);
        $stmt->execute([$cupomId]);
        
        error_log("CUPOM DELETADO: ID {$cupomId}");
        
        Response::success(['id' => $cupomId], 'Cupom deletado com sucesso');
        
    } catch (Exception $e) {
        error_log("CUPONS DELETE ERROR: " . $e->getMessage());
        Response::error('Erro ao deletar cupom', 500);
    }
}

else {
    Response::error('Método não permitido', 405);
}
?>
