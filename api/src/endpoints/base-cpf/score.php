<?php
// api/src/endpoints/base-cpf/score.php - Endpoints para gerenciamento de score

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../../utils/auth.php';

// Obter conexão do pool
$pdo = getDBConnection();

// Verificar autenticação
$auth = verifyAuthentication();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode($auth);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    switch ($method) {
        case 'GET':
            if (strpos($path, '/history') !== false) {
                handleGetScoreHistory();
            } else {
                handleGetScore();
            }
            break;
            
        case 'PUT':
            handleUpdateScore();
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("Score API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor'
    ]);
}

function handleGetScore() {
    global $pdo;
    
    if (!isset($_GET['cpf'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF é obrigatório']);
        return;
    }
    
    $cpf = preg_replace('/\D/', '', $_GET['cpf']);
    
    if (strlen($cpf) !== 11) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF inválido']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT score, updated_at FROM base_cpf WHERE cpf = ?");
        $stmt->execute([$cpf]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$result) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'CPF não encontrado']);
            return;
        }
        
        $score = is_numeric($result['score']) ? (int)$result['score'] : 0;
        
        echo json_encode([
            'success' => true,
            'data' => [
                'score' => $score,
                'updated_at' => $result['updated_at'] ?: date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in getScore: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao buscar score']);
    }
}

function handleUpdateScore() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['cpf']) || !isset($input['score'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF e score são obrigatórios']);
        return;
    }
    
    $cpf = preg_replace('/\D/', '', $input['cpf']);
    $score = (int)$input['score'];
    
    if (strlen($cpf) !== 11) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF inválido']);
        return;
    }
    
    if ($score < 0 || $score > 1000) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Score deve estar entre 0 e 1000']);
        return;
    }
    
    try {
        // Verificar se o CPF existe
        $stmt = $pdo->prepare("SELECT id FROM base_cpf WHERE cpf = ?");
        $stmt->execute([$cpf]);
        
        if (!$stmt->fetch()) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'CPF não encontrado']);
            return;
        }
        
        // Atualizar o score
        $stmt = $pdo->prepare("UPDATE base_cpf SET score = ?, updated_at = NOW() WHERE cpf = ?");
        $stmt->execute([$score, $cpf]);
        
        // Registrar no histórico (se houver tabela de histórico)
        try {
            $stmt = $pdo->prepare("
                INSERT INTO score_history (cpf, score, reason, created_at) 
                VALUES (?, ?, 'Atualização manual', NOW())
            ");
            $stmt->execute([$cpf, $score]);
        } catch (PDOException $e) {
            // Tabela de histórico pode não existir ainda
            error_log("Score history insert failed (table may not exist): " . $e->getMessage());
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'message' => 'Score atualizado com sucesso',
                'score' => $score,
                'updated_at' => date('Y-m-d H:i:s')
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in updateScore: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Erro ao atualizar score']);
    }
}

function handleGetScoreHistory() {
    global $pdo;
    
    if (!isset($_GET['cpf'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF é obrigatório']);
        return;
    }
    
    $cpf = preg_replace('/\D/', '', $_GET['cpf']);
    
    if (strlen($cpf) !== 11) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'CPF inválido']);
        return;
    }
    
    try {
        // Tentar buscar na tabela de histórico se existir
        $stmt = $pdo->prepare("
            SELECT score, created_at as date, reason 
            FROM score_history 
            WHERE cpf = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        ");
        $stmt->execute([$cpf]);
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Se não há histórico específico, criar um baseado na atualização atual
        if (empty($history)) {
            $stmt = $pdo->prepare("SELECT score, updated_at FROM base_cpf WHERE cpf = ?");
            $stmt->execute([$cpf]);
            $current = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($current && is_numeric($current['score'])) {
                $history = [[
                    'score' => (int)$current['score'],
                    'date' => $current['updated_at'] ?: date('Y-m-d H:i:s'),
                    'reason' => 'Score atual'
                ]];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'history' => $history
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log("Database error in getScoreHistory: " . $e->getMessage());
        // Se tabela não existir, retornar histórico vazio
        echo json_encode([
            'success' => true,
            'data' => [
                'history' => []
            ]
        ]);
    }
}