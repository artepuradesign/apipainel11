<?php

require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// ==================== VALIDAÇÃO DOS CAMPOS OBRIGATÓRIOS ====================
$required_fields = ['full_name', 'birth_date', 'document_number', 'parent1', 'parent2'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        http_response_code(400);
        echo json_encode(["error" => "Campo obrigatório ausente: $field"]);
        exit;
    }
}

// ==================== SANITIZAÇÃO DOS DADOS ====================
$full_name       = strtoupper(trim($_POST['full_name']));
$birth_date      = $_POST['birth_date'];
$document_number = trim($_POST['document_number']);
$parent1         = strtoupper(trim($_POST['parent1']));
$parent2         = strtoupper(trim($_POST['parent2']));
$id_user         = isset($_POST['id_user']) ? trim((string)$_POST['id_user']) : null;

// Respeitar validade enviada pelo frontend (1m/3m/6m). Fallback mantém comportamento antigo.
$expiry_date_input = isset($_POST['expiry_date']) ? trim((string)$_POST['expiry_date']) : '';
$is_valid_expiry = preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiry_date_input) && strtotime($expiry_date_input) !== false;
$expiry_date = $is_valid_expiry ? $expiry_date_input : date('Y-m-d', strtotime('+1 year'));
$validation      = 'pending';

// Remove tudo que não for número do CPF/documento (para usar como nome do arquivo)
$document_clean = preg_replace('/[^0-9]/', '', $document_number);
if (empty($document_clean)) {
    $document_clean = 'semcpf_' . uniqid(); // fallback (nunca deve acontecer)
}

// ==================== UPLOAD DA FOTO - NOME = CPF ====================
$photo_path = null;

if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(["error" => "É obrigatório enviar uma foto válida."]);
    exit;
}

$photo = $_FILES['photo'];
$allowed_ext  = ['jpg', 'jpeg', 'png', 'gif', 'jfif'];
$allowed_mime = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/jfif', 'image/pjpeg'];

$file_ext = strtolower(pathinfo($photo['name'], PATHINFO_EXTENSION));

if (!in_array($photo['type'], $allowed_mime) || !in_array($file_ext, $allowed_ext)) {
    http_response_code(400);
    echo json_encode(["error" => "Formato inválido. Use apenas JPG, PNG ou GIF."]);
    exit;
}

if ($photo['size'] > 10 * 1024 * 1024) { // máx 10MB
    http_response_code(400);
    echo json_encode(["error" => "Foto muito grande (máximo 10MB)."]);
    exit;
}

// NOME FINAL: CPF + extensão original (ex: 12345678900.jpg)
$new_filename        = $document_clean . '.' . $file_ext;
$upload_dir_physical = __DIR__ . '/Uploads';                    // pasta física
$photo_path_db       = 'Uploads/' . $new_filename;              // caminho salvo no banco

// Cria a pasta Uploads se não existir
if (!is_dir($upload_dir_physical)) {
    mkdir($upload_dir_physical, 0755, true);
}

$destination = $upload_dir_physical . '/' . $new_filename;

// Se já existir foto com esse CPF (recadastro), remove a antiga
if (file_exists($destination)) {
    unlink($destination);
}

if (!move_uploaded_file($photo['tmp_name'], $destination)) {
    error_log("Erro ao salvar foto como CPF: $destination");
    http_response_code(500);
    echo json_encode(["error" => "Erro interno ao salvar a foto."]);
    exit;
}

$photo_path = $photo_path_db; // Ex: Uploads/12345678900.jpg

// ==================== TOKEN (mesmo sistema que você já usava) ====================
$token = isset($_POST['token']) ? trim($_POST['token']) : '';

if (!empty($token)) {
    if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
        http_response_code(400);
        echo json_encode(["error" => "Token inválido. Deve ter 64 caracteres hexadecimais."]);
        exit;
    }
    $check = $conn->prepare("SELECT id FROM registrations WHERE token = ?");
    $check->bind_param("s", $token);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        @unlink($destination);
        http_response_code(400);
        echo json_encode(["error" => "Este token já está em uso."]);
        exit;
    }
    $check->close();
} else {
    do {
        $token = bin2hex(random_bytes(32));
        $check = $conn->prepare("SELECT id FROM registrations WHERE token = ?");
        $check->bind_param("s", $token);
        $check->execute();
        $exists = $check->get_result()->num_rows > 0;
        $check->close();
    } while ($exists);
}

// ==================== GERAÇÃO DO QR CODE ====================
$view_url     = "https://qr.apipainel.com.br/qrvalidation/?token=" . urlencode($token) . "&ref=" . urlencode($token) . "&cod=" . urlencode($token);
$qr_code_url  = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" . urlencode($view_url);
$qr_code_path = "qrcodes/" . $token . ".png";

if (!is_dir('qrcodes')) {
    mkdir('qrcodes', 0755, true);
}

$qr_content = file_get_contents($qr_code_url);
if ($qr_content === false || !file_put_contents($qr_code_path, $qr_content)) {
    @unlink($destination);
    error_log("Falha ao gerar QR Code para token $token");
    http_response_code(500);
    echo json_encode(["error" => "Erro ao gerar QR Code."]);
    exit;
}

// ==================== INSERÇÃO NO BANCO ====================
$stmt = $conn->prepare("INSERT INTO registrations 
    (full_name, birth_date, document_number, parent1, parent2, photo_path, validation, token, expiry_date, qr_code_path, id_user) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

$stmt->bind_param("sssssssssss", $full_name, $birth_date, $document_number, $parent1, $parent2, $photo_path, $validation, $token, $expiry_date, $qr_code_path, $id_user);

if (!$stmt->execute()) {
    error_log("Erro SQL: " . $stmt->error);
    @unlink($destination);
    @unlink($qr_code_path);
    http_response_code(500);
    echo json_encode(["error" => "Erro ao salvar no banco de dados."]);
    exit;
}

$stmt->close();
$conn->close();

// ==================== RESPOSTA JSON ====================
echo json_encode([
    "success" => true,
    "message" => "Cadastro realizado com sucesso!",
    "data" => [
        "id" => $conn->insert_id,
        "token" => $token,
        "full_name" => $full_name,
        "document_number" => $document_number,
        "birth_date" => $birth_date,
        "parent1" => $parent1,
        "parent2" => $parent2,
        "photo_path" => $photo_path,
        "qr_code_path" => $qr_code_path,
        "expiry_date" => $expiry_date,
        "validation" => $validation,
        "id_user" => $id_user,
        "view_url" => $view_url
    ]
]);
exit;
?>
