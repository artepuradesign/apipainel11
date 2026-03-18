<?php
// src/controllers/PhotoUploadBase64Controller.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/BaseCpf.php';
require_once __DIR__ . '/../models/BaseFoto.php';

class PhotoUploadBase64Controller {
    private $uploadDir;
    private $db;
    private $baseCpfModel;
    private $baseFotoModel;
    
    public function __construct($db = null) {
        $this->uploadDir = __DIR__ . '/../../fotos/';
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
        
        // Conectar ao banco se não foi passado
        if ($db === null) {
            require_once __DIR__ . '/../../config/conexao.php';
            $this->db = getDBConnection();
        } else {
            $this->db = $db;
        }
        
        $this->baseCpfModel = new BaseCpf($this->db);
        $this->baseFotoModel = new BaseFoto($this->db);
    }
    
    public function uploadBase64() {
        try {
            // Receber dados (JSON ou form-data)
            $rawInput = file_get_contents('php://input');
            error_log("=== UPLOAD_BASE64_START ===");
            error_log("UPLOAD_BASE64_METHOD: " . $_SERVER['REQUEST_METHOD']);
            error_log("UPLOAD_BASE64_CONTENT_TYPE: " . ($_SERVER['CONTENT_TYPE'] ?? 'não definido'));
            error_log("UPLOAD_BASE64_INPUT_SIZE: " . strlen($rawInput) . " bytes");
            error_log("UPLOAD_BASE64_RAW_INPUT_PREVIEW: " . substr($rawInput, 0, 200));
            
            $input = json_decode($rawInput, true);
            $jsonError = json_last_error();
            
            if ($jsonError !== JSON_ERROR_NONE) {
                error_log("UPLOAD_BASE64_JSON_ERROR: " . json_last_error_msg());
            }
            
            // Se não for JSON, tentar $_POST (form-data)
            if ($input === null) {
                $input = $_POST;
                error_log("UPLOAD_BASE64_MODE: form-data");
                error_log("UPLOAD_BASE64_POST_DATA: " . json_encode($_POST));
            } else {
                error_log("UPLOAD_BASE64_MODE: JSON");
            }
            
            // Log dos campos recebidos (sem image_data para não poluir logs)
            $inputLog = $input;
            if (isset($inputLog['image_data'])) {
                $inputLog['image_data'] = '[BASE64_DATA_' . strlen($inputLog['image_data']) . '_BYTES]';
            }
            error_log("UPLOAD_BASE64_FIELDS: " . json_encode($inputLog));
            
            // ====== VALIDAÇÕES INICIAIS ======
            error_log("UPLOAD_BASE64_VALIDATION: Iniciando validações");
            
            if (!isset($input['cpf_id']) && !isset($input['cpf'])) {
                error_log("UPLOAD_BASE64_ERROR: cpf_id ou cpf não fornecido");
                Response::error('cpf_id ou cpf é obrigatório', 400);
                return;
            }
            
            if (!isset($input['image_data']) || empty($input['image_data'])) {
                error_log("UPLOAD_BASE64_ERROR: image_data vazio ou ausente");
                Response::error('image_data é obrigatório e não pode estar vazio', 400);
                return;
            }
            
            // Validar tamanho do base64 (antes de decodificar)
            $base64Length = strlen($input['image_data']);
            error_log("UPLOAD_BASE64_SIZE_CHECK: Base64 length = $base64Length bytes");
            
            if ($base64Length < 100) {
                error_log("UPLOAD_BASE64_ERROR: Base64 muito pequeno ($base64Length bytes)");
                Response::error('Dados da imagem inválidos - muito pequeno', 400);
                return;
            }
            
            if ($base64Length > 10 * 1024 * 1024) {
                error_log("UPLOAD_BASE64_ERROR: Base64 muito grande ($base64Length bytes)");
                Response::error('Imagem muito grande. Máximo: 7MB', 400);
                return;
            }
            
            error_log("UPLOAD_BASE64_VALIDATION: Campos obrigatórios OK");
            
            // ====== RECEBER CPF E CPF_ID DO N8N ======
            $cpfId = $input['cpf_id'] ?? null;
            $cpf = isset($input['cpf']) ? preg_replace('/\D/', '', $input['cpf']) : null;
            
            error_log("UPLOAD_BASE64: cpf_id recebido = $cpfId");
            error_log("UPLOAD_BASE64: cpf recebido = $cpf");
            
            // Garantir que temos CPF e cpf_id
            if (empty($cpf) || empty($cpfId)) {
                error_log("UPLOAD_BASE64_ERROR: cpf ou cpf_id vazios");
                Response::error('cpf e cpf_id são obrigatórios', 400);
                return;
            }
            
            // Validar formato do CPF (11 dígitos)
            if (strlen($cpf) !== 11 || !ctype_digit($cpf)) {
                error_log("UPLOAD_BASE64_ERROR: CPF inválido: $cpf");
                Response::error('CPF deve ter exatamente 11 dígitos numéricos', 400);
                return;
            }
            
            // ====== PROCESSAR IMAGEM ======
            $imageData = $input['image_data'];
            
            // Remover prefixo data:image/...;base64, se existir
            error_log("UPLOAD_BASE64_DECODE: Processando base64");
            $imageType = 'unknown';
            
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $imageType = strtolower($matches[1]);
                error_log("UPLOAD_BASE64_TYPE: Tipo detectado = $imageType");
                
                // Validar tipos suportados
                $allowedTypes = ['jpeg', 'jpg', 'png', 'gif', 'webp'];
                if (!in_array($imageType, $allowedTypes)) {
                    error_log("UPLOAD_BASE64_ERROR: Tipo não suportado: $imageType");
                    Response::error("Tipo de imagem não suportado: $imageType. Use: " . implode(', ', $allowedTypes), 400);
                    return;
                }
            } else {
                error_log("UPLOAD_BASE64_DECODE: Sem prefixo data URI, assumindo base64 puro");
            }
            
            // Decodificar base64
            $decodedImage = base64_decode($imageData, true);
            if ($decodedImage === false) {
                error_log("UPLOAD_BASE64_ERROR: Falha ao decodificar base64");
                Response::error('Erro ao decodificar base64 - dados inválidos', 400);
                return;
            }
            
            $decodedSize = strlen($decodedImage);
            error_log("UPLOAD_BASE64_DECODED: Tamanho após decodificar = $decodedSize bytes (" . round($decodedSize / 1024, 2) . " KB)");
            
            // Validar tamanho decodificado (5MB)
            if ($decodedSize > 5 * 1024 * 1024) {
                error_log("UPLOAD_BASE64_ERROR: Imagem decodificada muito grande: $decodedSize bytes");
                Response::error('Imagem muito grande após decodificar. Máximo: 5MB', 400);
                return;
            }
            
            // Validar que é uma imagem válida
            $imageInfo = @getimagesizefromstring($decodedImage);
            if ($imageInfo === false) {
                error_log("UPLOAD_BASE64_ERROR: Dados não são uma imagem válida");
                Response::error('Dados fornecidos não são uma imagem válida', 400);
                return;
            }
            
            error_log("UPLOAD_BASE64_IMAGE_INFO: Dimensões = {$imageInfo[0]}x{$imageInfo[1]}, Tipo MIME = {$imageInfo['mime']}");
            
            // ====== CRIAR NOME DO ARQUIVO (agora temos $cpf válido) ======
            $photoType = '';
            $photoTypeName = 'foto'; // nome para o banco
            
            if (isset($input['type'])) {
                if ($input['type'] === 'foto2') {
                    $photoType = '_2';
                    $photoTypeName = 'foto2';
                } elseif ($input['type'] === 'foto3') {
                    $photoType = '_3';
                    $photoTypeName = 'foto3';
                } elseif ($input['type'] === 'foto4') {
                    $photoType = '_4';
                    $photoTypeName = 'foto4';
                }
            }
            
            $fileName = $cpf . $photoType . '.jpg';
            error_log("UPLOAD_BASE64: Nome do arquivo criado: $fileName");
            
            // Criar imagem a partir do base64
            error_log("UPLOAD_BASE64_PROCESS: Criando objeto de imagem");
            $image = imagecreatefromstring($decodedImage);
            if (!$image) {
                error_log("UPLOAD_BASE64_ERROR: imagecreatefromstring() falhou");
                Response::error('Erro ao processar imagem. Formato inválido.', 500);
                return;
            }
            
            // Redimensionar se necessário
            $width = imagesx($image);
            $height = imagesy($image);
            
            error_log("UPLOAD_BASE64_DIMENSIONS: Original = {$width}x{$height}px");
            
            if ($width > 800) {
                $newWidth = 800;
                $newHeight = (int)(($height * $newWidth) / $width);
                error_log("UPLOAD_BASE64_RESIZE: Redimensionando para {$newWidth}x{$newHeight}px");
                
                $resized = imagecreatetruecolor($newWidth, $newHeight);
                if (!$resized) {
                    error_log("UPLOAD_BASE64_ERROR: Falha ao criar imagem redimensionada");
                    imagedestroy($image);
                    Response::error('Erro ao redimensionar imagem', 500);
                    return;
                }
                
                if (!imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height)) {
                    error_log("UPLOAD_BASE64_ERROR: Falha em imagecopyresampled()");
                    imagedestroy($image);
                    imagedestroy($resized);
                    Response::error('Erro ao processar redimensionamento', 500);
                    return;
                }
                
                imagedestroy($image);
                $image = $resized;
                error_log("UPLOAD_BASE64_RESIZE: Sucesso");
            }
            
            // Salvar arquivo
            $finalPath = $this->uploadDir . $fileName;
            
            // Se arquivo já existir, apagar para evitar duplicação
            if (file_exists($finalPath)) {
                error_log("UPLOAD_BASE64_FILE: Arquivo já existe. Substituindo: $finalPath");
                unlink($finalPath);
            }
            
            error_log("UPLOAD_BASE64_SAVE: Salvando em $finalPath");
            
            if (!imagejpeg($image, $finalPath, 85)) {
                error_log("UPLOAD_BASE64_ERROR: imagejpeg() falhou para $finalPath");
                imagedestroy($image);
                Response::error('Erro ao salvar imagem no servidor', 500);
                return;
            }
            imagedestroy($image);
            
            $savedFileSize = filesize($finalPath);
            error_log("UPLOAD_BASE64_SUCCESS: Arquivo salvo - $finalPath (" . round($savedFileSize / 1024, 2) . " KB)");
            
            // ====== SALVAR / ATUALIZAR NO BANCO DE DADOS ======
            error_log("UPLOAD_BASE64_DB: Iniciando salvamento no banco");
            $baseFotoId = null;
            
            try {
                // Verificar se já existe foto desse tipo para este CPF
                $fotoExistente = $this->baseFotoModel->findByCpfAndNome($cpfId, $photoTypeName);
                
                if ($fotoExistente) {
                    error_log("UPLOAD_BASE64_DB: Foto existente encontrada (ID {$fotoExistente['id']}). Atualizando...");
                    
                    // Atualiza somente o caminho da foto
                    $this->baseFotoModel->update($fotoExistente['id'], [
                        'photo' => $fileName
                    ]);
                    
                    $baseFotoId = $fotoExistente['id'];
                } else {
                    error_log("UPLOAD_BASE64_DB: Nenhuma foto existente. Criando nova entrada...");
                    
                    $baseFotoId = $this->baseFotoModel->create([
                        'cpf_id' => $cpfId,
                        'cpf' => $cpf,
                        'nome' => $photoTypeName,
                        'photo' => $fileName
                    ]);
                }
                
                error_log("UPLOAD_BASE64_DB_SUCCESS: Foto registrada/atualizada com ID: $baseFotoId");
                
            } catch (Exception $dbError) {
                error_log("UPLOAD_BASE64_DB_ERROR: " . $dbError->getMessage());
                error_log("UPLOAD_BASE64_DB_TRACE: " . $dbError->getTraceAsString());
            }
            
            // Resposta de sucesso
            $responseData = [
                'message' => 'Foto enviada e cadastrada com sucesso',
                'filename' => $fileName,
                'path' => '/fotos/' . $fileName,
                'cpf' => $cpf,
                'cpf_id' => $cpfId,
                'photo_url' => "https://api.apipainel.com.br/fotos/$fileName",
                'db_id' => $baseFotoId,
                'file_size_kb' => round($savedFileSize / 1024, 2),
                'type' => $photoTypeName
            ];
            
            error_log("UPLOAD_BASE64_COMPLETE: " . json_encode($responseData));
            Response::success($responseData, 'Foto base64 enviada e cadastrada com sucesso');
            
        } catch (Exception $e) {
            error_log("UPLOAD_BASE64_EXCEPTION: " . $e->getMessage());
            error_log("UPLOAD_BASE64_EXCEPTION_FILE: " . $e->getFile() . " linha " . $e->getLine());
            error_log("UPLOAD_BASE64_EXCEPTION_TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno: ' . $e->getMessage(), 500);
        }
    }
}
