<?php
// Detectar ambiente com base no host
$hostCheck = $_SERVER['HTTP_HOST'] ?? '';
$isLocal = (
    $hostCheck === 'localhost' ||
    $hostCheck === '127.0.0.1' ||
    preg_match('/^192\.168\.\d{1,3}\.\d{1,3}$/', $hostCheck) ||
    preg_match('/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/', $hostCheck)
);

// Configurações de conexão
if ($isLocal) {
    // Ambiente local
    $host = "localhost";
    $username = "root";
    $password = "";
    $database = "u617342185_qrvalidations";
} else {
    // Ambiente de produção
    $host = "127.0.0.1";
    $username = "qrapipainel";
    $password = "Acerola@2026";
    $database = "qrapipainel";
}

// Criar conexão
$conn = new mysqli($host, $username, $password, $database);

// Verificar conexão
if ($conn->connect_error) {
    // Caminho do log - sempre na mesma pasta
    $log_path = __DIR__ . "/error.log";

    error_log(date('[Y-m-d H:i:s] ') . "Connection failed: " . $conn->connect_error . "\n", 3, $log_path);

    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// Definir charset
$conn->set_charset("utf8mb4");
?>
