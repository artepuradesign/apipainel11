<?php
require_once 'db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Parâmetros de paginação
$limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
$offset = isset($_GET['offset']) ? intval($_GET['offset']) : 0;
$id_user = isset($_GET['id_user']) ? trim($_GET['id_user']) : null;

// Limitar para evitar sobrecarga
if ($limit > 100) $limit = 100;
if ($limit < 1) $limit = 10;

try {
    // Query base
    $sql = "SELECT 
                id,
                token,
                full_name,
                birth_date,
                document_number,
                parent1,
                parent2,
                photo_path,
                validation,
                expiry_date,
                qr_code_path,
                id_user,
                created_at
            FROM registrations";
    
    $params = [];
    $types = "";
    
    // Filtrar por id_user se fornecido
    if ($id_user) {
        $sql .= " WHERE id_user = ?";
        $params[] = $id_user;
        $types .= "s";
    }
    
    $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= "ii";
    
    $stmt = $conn->prepare($sql);
    
    if (count($params) > 0) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $registrations = [];
    while ($row = $result->fetch_assoc()) {
        // Verificar se expirou
        $is_expired = strtotime($row['expiry_date']) < time();
        
        $registrations[] = [
            'id' => $row['id'],
            'token' => $row['token'],
            'full_name' => $row['full_name'],
            'birth_date' => $row['birth_date'],
            'document_number' => $row['document_number'],
            'parent1' => $row['parent1'],
            'parent2' => $row['parent2'],
            'photo_path' => $row['photo_path'],
            'validation' => $row['validation'],
            'expiry_date' => $row['expiry_date'],
            'is_expired' => $is_expired,
            'qr_code_path' => $row['qr_code_path'],
            'id_user' => $row['id_user'],
            'created_at' => $row['created_at']
        ];
    }
    
    $stmt->close();
    
    // Contar total de registros
    $countSql = "SELECT COUNT(*) as total FROM registrations";
    if ($id_user) {
        $countSql .= " WHERE id_user = ?";
        $countStmt = $conn->prepare($countSql);
        $countStmt->bind_param("s", $id_user);
    } else {
        $countStmt = $conn->prepare($countSql);
    }
    $countStmt->execute();
    $countResult = $countStmt->get_result();
    $totalRow = $countResult->fetch_assoc();
    $total = $totalRow['total'];
    $countStmt->close();
    
    echo json_encode([
        "success" => true,
        "data" => $registrations,
        "pagination" => [
            "total" => $total,
            "limit" => $limit,
            "offset" => $offset,
            "has_more" => ($offset + $limit) < $total
        ]
    ]);
    
} catch (Exception $e) {
    $log_path = __DIR__ . "/error.log";
    error_log(date('[Y-m-d H:i:s] ') . "List error: " . $e->getMessage() . "\n", 3, $log_path);
    
    http_response_code(500);
    echo json_encode(["error" => "Erro ao listar registros"]);
}

$conn->close();
?>
