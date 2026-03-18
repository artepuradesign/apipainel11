<?php
/**
 * Endpoint: GET /api/n8n/check-cpf-database.php?cpf=12345678900
 * Response: {success: bool, exists: bool, data?: object, error?: string}
 * 
 * Verifica se um CPF já existe na base de dados local
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('X-Content-Type-Options: nosniff');

// Forçar saída 100% JSON
error_reporting(E_ALL);
ini_set('display_errors', '0');
ob_start();
set_error_handler(function ($severity, $message, $file, $line) {
    error_log("PHP_ERROR [$severity] $message in $file:$line");
    return true;
});

function json_response(array $payload, int $status = 200): void {
    http_response_code($status);
    // Limpar todos os buffers
    while (ob_get_level() > 0) {
        $buf = ob_get_clean();
        if ($buf) {
            error_log('UNEXPECTED_OUTPUT: ' . substr($buf, 0, 400));
        }
    }
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['success' => false, 'error' => 'Método não permitido'], 405);
}

require_once __DIR__ . '/../config/conexao.php';

try {
    // Ler CPF da query string
    $cpf = $_GET['cpf'] ?? null;
    
    if (!$cpf) {
        json_response(['success' => false, 'exists' => false, 'error' => 'CPF não informado'], 400);
    }
    
    // Limpar CPF (remover caracteres não numéricos)
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    
    if (strlen($cpf) !== 11) {
        json_response(['success' => false, 'exists' => false, 'error' => 'CPF inválido'], 400);
    }
    
    error_log("CHECK_CPF_DB: Verificando CPF: {$cpf}");
    
    // Obter conexão do pool
    $conn = getDBConnection();
    
    // Verificar se CPF existe na tabela base_cpf
    $query = "SELECT * FROM base_cpf WHERE cpf = :cpf LIMIT 1";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':cpf', $cpf, PDO::PARAM_STR);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($result) {
        error_log("CHECK_CPF_DB: CPF encontrado no banco de dados");
        
        // CPF existe - retornar dados
        json_response([
            'success' => true,
            'exists' => true,
            'data' => $result,
            'message' => 'CPF encontrado na base de dados'
        ], 200);
    } else {
        error_log("CHECK_CPF_DB: CPF não encontrado no banco de dados");
        
        // CPF não existe
        json_response([
            'success' => true,
            'exists' => false,
            'message' => 'CPF não encontrado na base de dados'
        ], 200);
    }
    
} catch (PDOException $e) {
    error_log("CHECK_CPF_DB ERROR: " . $e->getMessage());
    json_response([
        'success' => false,
        'exists' => false,
        'error' => 'Erro ao consultar banco de dados: ' . $e->getMessage()
    ], 500);
} catch (Exception $e) {
    error_log("CHECK_CPF_DB ERROR: " . $e->getMessage());
    json_response([
        'success' => false,
        'exists' => false,
        'error' => $e->getMessage()
    ], 500);
}
