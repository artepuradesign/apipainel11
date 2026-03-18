<?php
// upload-bo.php - Upload de PDF de Boletim de Ocorrência
// Recebe arquivo PDF via multipart/form-data e salva na pasta /bo/
// O arquivo é renomeado para {numero_bo}.pdf (ex: 775821.pdf)

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/src/utils/Response.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Response::error('Método não permitido', 405);
        exit;
    }

    // Verificar se arquivo foi enviado
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $errorCode = $_FILES['file']['error'] ?? 'NO_FILE';
        Response::error("Nenhum arquivo enviado ou erro no upload (código: {$errorCode})", 400);
        exit;
    }

    $file = $_FILES['file'];
    
    // Validar tipo do arquivo - apenas PDF
    $allowedMimes = ['application/pdf'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedMimes)) {
        Response::error("Tipo de arquivo não permitido: {$mimeType}. Apenas PDF é aceito.", 400);
        exit;
    }

    // Validar tamanho (máx 20MB)
    $maxSize = 20 * 1024 * 1024;
    if ($file['size'] > $maxSize) {
        Response::error('Arquivo muito grande. Máximo permitido: 20MB', 400);
        exit;
    }

    // Obter numero_ano do POST para gerar o nome do arquivo
    $numeroAno = $_POST['numero_ano'] ?? '';
    
    if (empty($numeroAno)) {
        Response::error('Campo numero_ano é obrigatório para nomear o arquivo', 400);
        exit;
    }

    // Gerar nome do arquivo: extrair apenas números do numero_ano
    // Ex: "267237/2021" -> "267237_2021"
    $boFileName = preg_replace('/[^0-9]/', '_', $numeroAno);
    $boFileName = trim($boFileName, '_');
    
    if (empty($boFileName)) {
        Response::error('Não foi possível gerar o nome do arquivo a partir do Nº/Ano', 400);
        exit;
    }

    // Criar diretório /bo/ se não existir
    $boDir = __DIR__ . '/bo';
    if (!is_dir($boDir)) {
        mkdir($boDir, 0755, true);
    }

    $destinationPath = $boDir . '/' . $boFileName . '.pdf';

    // Mover arquivo
    if (move_uploaded_file($file['tmp_name'], $destinationPath)) {
        error_log("✅ [UPLOAD_BO] Arquivo salvo: {$destinationPath}");
        
        Response::success([
            'bo_link' => $boFileName,
            'file_name' => $boFileName . '.pdf',
            'file_size' => $file['size'],
            'file_path' => '/bo/' . $boFileName . '.pdf'
        ], 'Arquivo enviado com sucesso');
    } else {
        error_log("❌ [UPLOAD_BO] Falha ao mover arquivo para: {$destinationPath}");
        Response::error('Falha ao salvar o arquivo no servidor', 500);
    }

} catch (Exception $e) {
    error_log("❌ [UPLOAD_BO] Erro: " . $e->getMessage());
    Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
}
?>
