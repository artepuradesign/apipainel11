
<?php
// src/routes/tabelas.php - Endpoint para listar informações das tabelas do banco

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, X-API-Key');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Carregar configurações centralizadas PRIMEIRO
require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../../config/database.php';

// Validar API Key
$headers = getallheaders();
$apiKey = null;

// Verificar Authorization header (Bearer token)
if (isset($headers['Authorization'])) {
    $auth = $headers['Authorization'];
    if (strpos($auth, 'Bearer ') === 0) {
        $apiKey = substr($auth, 7);
    }
}

// Verificar X-API-Key header
if (!$apiKey && isset($headers['X-API-Key'])) {
    $apiKey = $headers['X-API-Key'];
}

// Verificar query parameter
if (!$apiKey && isset($_GET['api_key'])) {
    $apiKey = $_GET['api_key'];
}

if (!$apiKey) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'API Key é obrigatória',
        'error_code' => 'MISSING_API_KEY'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar se é a API Key global
$globalApiKey = API_KEY;
if ($apiKey !== $globalApiKey) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'API Key inválida',
        'error_code' => 'INVALID_API_KEY'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $database = null;
    $pdo = null;
    
    try {
        $pdo = getDBConnection();
        
        // Obter informações das tabelas
        $tablesInfo = [];
        
        // Listar todas as tabelas
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        foreach ($tables as $table) {
            try {
                // Obter estrutura da tabela
                $structureStmt = $pdo->query("DESCRIBE `$table`");
                $structure = $structureStmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Contar registros
                $countStmt = $pdo->query("SELECT COUNT(*) as total FROM `$table`");
                $count = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
                
                // Obter informações adicionais da tabela
                $tableInfoStmt = $pdo->query("SHOW TABLE STATUS LIKE '$table'");
                $tableInfo = $tableInfoStmt->fetch(PDO::FETCH_ASSOC);
                
                $tablesInfo[] = [
                    'name' => $table,
                    'structure' => $structure,
                    'total_records' => (int)$count,
                    'engine' => $tableInfo['Engine'] ?? 'Unknown',
                    'collation' => $tableInfo['Collation'] ?? 'Unknown',
                    'created' => $tableInfo['Create_time'] ?? null,
                    'updated' => $tableInfo['Update_time'] ?? null,
                    'data_length' => (int)($tableInfo['Data_length'] ?? 0),
                    'index_length' => (int)($tableInfo['Index_length'] ?? 0)
                ];
                
            } catch (Exception $e) {
                // Se houver erro com uma tabela específica, continuar com as outras
                error_log("Erro ao processar tabela $table: " . $e->getMessage());
                
                $tablesInfo[] = [
                    'name' => $table,
                    'structure' => [],
                    'total_records' => 0,
                    'error' => 'Erro ao acessar dados da tabela'
                ];
            }
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'database_name' => DB_NAME,
                'total_tables' => count($tables),
                'tables' => $tablesInfo,
                'server_info' => [
                    'host' => DB_HOST,
                    'charset' => 'utf8mb4'
                ]
            ],
            'message' => 'Informações das tabelas obtidas com sucesso'
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("Erro ao obter informações das tabelas: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao obter informações das tabelas: ' . $e->getMessage(),
            'error_code' => 'DATABASE_ERROR'
        ], JSON_UNESCAPED_UNICODE);
    }
    // Não fechar a conexão - o pool gerencia automaticamente
    
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método não permitido. Use GET para listar tabelas.'
    ], JSON_UNESCAPED_UNICODE);
}
