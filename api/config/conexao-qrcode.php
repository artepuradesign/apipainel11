<?php
// ==================== CONFIGURAÇÃO BANCO DE DADOS QRCODES ====================
$host = "127.0.0.1";
$username = "qrapipainel";
$password = "Acerola@2026";
$database = "qrapipainel";

// Criar conexão
$conn = new mysqli($host, $username, $password, $database);

// Verificar conexão
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "error" => "Database connection failed"
    ]);
    exit;
}
?>
