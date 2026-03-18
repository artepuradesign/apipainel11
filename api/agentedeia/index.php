<?php

// index.php - Agente de IA - Consulta CPF via Telegram Bot

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Content-Type: application/json; charset=utf-8");

// Preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Recebe CPF por GET ou POST
$cpf = $_POST['cpf'] ?? $_GET['cpf'] ?? null;

if (!$cpf) {
    echo json_encode([
        "status" => false,
        "erro" => "CPF não enviado."
    ]);
    exit;
}

// Sanitiza CPF
$cpf = preg_replace('/\D/', '', $cpf);

// Caminho do script Node.js
$scriptPath = __DIR__ . "/cpf-check.js";

// Executar em BACKGROUND (nohup + &) para não bloquear o PHP
// O script Node roda assincronamente, conecta ao Telegram, pega o link e envia ao n8n
$logFile = sys_get_temp_dir() . "/cpf-check-{$cpf}.log";
$cmd = "nohup node " . escapeshellarg($scriptPath) . " " . escapeshellarg($cpf) . " > " . escapeshellarg($logFile) . " 2>&1 &";

exec($cmd);

echo json_encode([
    "status" => true,
    "cpf" => $cpf,
    "message" => "CPF enviado para processamento em background",
    "log_file" => $logFile
]);

?>
