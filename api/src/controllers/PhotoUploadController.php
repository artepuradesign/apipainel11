<?php
// src/controllers/PhotoUploadController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/BaseFotoService.php';

class PhotoUploadController {
    private $uploadDir;
    private $db;
    private $baseFotoService;
    
    public function __construct($db = null) {
        $this->uploadDir = __DIR__ . '/../../fotos/'; // Usar pasta 'fotos' (minúsculo)
        $this->db = $db;
        
        // Inicializar serviço de fotos se houver conexão com banco
        if ($db) {
            $this->baseFotoService = new BaseFotoService($db);
        }
        
        // Criar diretório se não existir
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function upload() {
        try {
            error_log("PHOTO_UPLOAD_START: Iniciando upload de foto");
            error_log("PHOTO_UPLOAD_METHOD: " . $_SERVER['REQUEST_METHOD']);
            error_log("PHOTO_UPLOAD_FILES_COUNT: " . count($_FILES));
            
            // Verificar se o arquivo foi enviado
            if (!isset($_FILES['photo'])) {
                error_log("PHOTO_UPLOAD_ERROR: Campo 'photo' não encontrado em \$_FILES");
                Response::error('Nenhum arquivo foi enviado', 400);
                return;
            }
            
            if ($_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
                $errorCode = $_FILES['photo']['error'];
                error_log("PHOTO_UPLOAD_ERROR: Upload error code = $errorCode");
                $errorMessages = [
                    UPLOAD_ERR_INI_SIZE => 'Arquivo excede upload_max_filesize do php.ini',
                    UPLOAD_ERR_FORM_SIZE => 'Arquivo excede MAX_FILE_SIZE do formulário',
                    UPLOAD_ERR_PARTIAL => 'Arquivo foi enviado apenas parcialmente',
                    UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado',
                    UPLOAD_ERR_NO_TMP_DIR => 'Pasta temporária ausente',
                    UPLOAD_ERR_CANT_WRITE => 'Falha ao escrever arquivo no disco',
                    UPLOAD_ERR_EXTENSION => 'Upload bloqueado por extensão PHP'
                ];
                $errorMsg = $errorMessages[$errorCode] ?? "Erro desconhecido no upload (code: $errorCode)";
                Response::error($errorMsg, 400);
                return;
            }
            
            // Verificar se o CPF foi fornecido
            if (!isset($_POST['cpf']) || empty($_POST['cpf'])) {
                error_log("PHOTO_UPLOAD_ERROR: CPF não fornecido");
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $cpf = preg_replace('/\D/', '', $_POST['cpf']); // Remove formatação
            $file = $_FILES['photo'];
            
            error_log("PHOTO_UPLOAD_CPF: " . $cpf);
            error_log("PHOTO_UPLOAD_FILE_NAME: " . $file['name']);
            error_log("PHOTO_UPLOAD_FILE_SIZE: " . $file['size'] . " bytes (" . round($file['size'] / 1024, 2) . " KB)");
            error_log("PHOTO_UPLOAD_FILE_TYPE: " . $file['type']);
            error_log("PHOTO_UPLOAD_TMP_NAME: " . $file['tmp_name']);
            
            // Validar tipo de arquivo
            error_log("PHOTO_UPLOAD_VALIDATION: Validando tipo de arquivo");
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!in_array($file['type'], $allowedTypes)) {
                error_log("PHOTO_UPLOAD_ERROR: Tipo não permitido: " . $file['type']);
                Response::error('Tipo de arquivo não permitido. Use apenas JPEG, PNG, GIF ou WebP', 400);
                return;
            }
            
            // Validar tamanho do arquivo (máximo 5MB)
            $maxSize = 5 * 1024 * 1024; // 5MB
            if ($file['size'] > $maxSize) {
                error_log("PHOTO_UPLOAD_ERROR: Arquivo muito grande: " . $file['size'] . " bytes");
                Response::error('Arquivo muito grande. Máximo permitido: 5MB (' . round($maxSize / 1024 / 1024, 2) . ' MB)', 400);
                return;
            }
            
            // Validar se o arquivo existe e é legível
            if (!file_exists($file['tmp_name']) || !is_readable($file['tmp_name'])) {
                error_log("PHOTO_UPLOAD_ERROR: Arquivo temporário não encontrado ou não legível");
                Response::error('Erro ao acessar arquivo temporário', 500);
                return;
            }
            
            error_log("PHOTO_UPLOAD_VALIDATION: OK");
            
            // Definir nome do arquivo com nomenclatura padronizada
            $photoType = '';
            if (isset($_POST['type'])) {
                if ($_POST['type'] === 'foto2') $photoType = '_2';
                if ($_POST['type'] === 'foto3') $photoType = '_3';
                if ($_POST['type'] === 'foto4') $photoType = '_4';
            }
            $fileName = $cpf . $photoType . '.jpg';
            
            error_log("PHOTO_UPLOAD_FILENAME: " . $fileName);
            
            // Converter imagem para JPEG se necessário
            error_log("PHOTO_UPLOAD_PROCESS: Processando imagem");
            $image = null;
            
            switch ($file['type']) {
                case 'image/jpeg':
                case 'image/jpg':
                    error_log("PHOTO_UPLOAD_PROCESS: Processando JPEG");
                    $image = @imagecreatefromjpeg($file['tmp_name']);
                    break;
                case 'image/png':
                    error_log("PHOTO_UPLOAD_PROCESS: Processando PNG");
                    $image = @imagecreatefrompng($file['tmp_name']);
                    // Criar nova imagem com fundo branco para transparência
                    if ($image) {
                        $width = imagesx($image);
                        $height = imagesy($image);
                        $newImage = imagecreatetruecolor($width, $height);
                        $white = imagecolorallocate($newImage, 255, 255, 255);
                        imagefill($newImage, 0, 0, $white);
                        imagecopy($newImage, $image, 0, 0, 0, 0, $width, $height);
                        imagedestroy($image);
                        $image = $newImage;
                        error_log("PHOTO_UPLOAD_PROCESS: PNG convertido para fundo branco");
                    }
                    break;
                case 'image/gif':
                    error_log("PHOTO_UPLOAD_PROCESS: Processando GIF");
                    $image = @imagecreatefromgif($file['tmp_name']);
                    break;
                case 'image/webp':
                    error_log("PHOTO_UPLOAD_PROCESS: Processando WebP");
                    $image = @imagecreatefromwebp($file['tmp_name']);
                    break;
            }
            
            if (!$image) {
                error_log("PHOTO_UPLOAD_ERROR: Falha ao criar imagem a partir do arquivo");
                Response::error('Erro ao processar a imagem - arquivo pode estar corrompido', 500);
                return;
            }
            
            error_log("PHOTO_UPLOAD_PROCESS: Imagem processada com sucesso");
            
            // Redimensionar imagem se muito grande (máximo 800px de largura)
            $originalWidth = imagesx($image);
            $originalHeight = imagesy($image);
            
            if ($originalWidth > 800) {
                $newWidth = 800;
                $newHeight = ($originalHeight * $newWidth) / $originalWidth;
                
                $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
                imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $originalWidth, $originalHeight);
                imagedestroy($image);
                $image = $resizedImage;
            }
            
            // Salvar arquivo localmente no diretório FOTOS
            $finalPath = $this->uploadDir . $fileName;
            error_log("PHOTO_UPLOAD_SAVE: Salvando em $finalPath");
            
            // Verificar se o diretório é gravável
            if (!is_writable($this->uploadDir)) {
                error_log("PHOTO_UPLOAD_ERROR: Diretório não gravável: " . $this->uploadDir);
                imagedestroy($image);
                Response::error('Erro: diretório de upload sem permissão de escrita', 500);
                return;
            }
            
            if (!imagejpeg($image, $finalPath, 85)) {
                error_log("PHOTO_UPLOAD_ERROR: imagejpeg() falhou para $finalPath");
                imagedestroy($image);
                Response::error('Erro ao salvar a imagem no servidor', 500);
                return;
            }
            imagedestroy($image);
            
            $savedFileSize = filesize($finalPath);
            error_log("PHOTO_UPLOAD_SUCCESS: Foto salva - $finalPath (" . round($savedFileSize / 1024, 2) . " KB)");
            
            // Salvar registro no banco de dados se houver serviço disponível
            $fotoId = null;
            if ($this->baseFotoService) {
                error_log("PHOTO_UPLOAD_DB: Iniciando salvamento no banco");
                try {
                    // Buscar cpf_id pelo CPF
                    require_once __DIR__ . '/../models/BaseCpf.php';
                    $baseCpfModel = new BaseCpf($this->db);
                    $cpfData = $baseCpfModel->getByCpf($cpf);
                    
                    if ($cpfData) {
                        error_log("PHOTO_UPLOAD_DB: CPF encontrado - ID: " . $cpfData['id']);
                        
                        // Criar registro na tabela base_foto
                        $fotoId = $this->baseFotoService->createFoto([
                            'cpf_id' => $cpfData['id'],
                            'nome' => $cpfData['nome'] ?? '',
                            'photo' => $fileName
                        ]);
                        
                        error_log("PHOTO_UPLOAD_DB_SUCCESS: Registro criado no banco com ID: " . $fotoId);
                    } else {
                        error_log("PHOTO_UPLOAD_DB_WARNING: CPF não encontrado no banco: " . $cpf);
                    }
                } catch (Exception $dbError) {
                    error_log("PHOTO_UPLOAD_DB_ERROR: " . $dbError->getMessage());
                    error_log("PHOTO_UPLOAD_DB_TRACE: " . $dbError->getTraceAsString());
                    // Continuar mesmo com erro no banco - foto já foi salva fisicamente
                }
            } else {
                error_log("PHOTO_UPLOAD_DB: Serviço de banco não disponível");
            }
            
            // Resposta de sucesso
            $responseData = [
                'message' => 'Foto enviada com sucesso',
                'filename' => $fileName,
                'path' => '/fotos/' . $fileName,
                'cpf' => $cpf,
                'photo_url' => "https://api.apipainel.com.br/fotos/$fileName",
                'file_size_kb' => round($savedFileSize / 1024, 2),
                'db_id' => $fotoId
            ];
            
            error_log("PHOTO_UPLOAD_COMPLETE: " . json_encode($responseData));
            Response::success($responseData, 'Foto enviada com sucesso');
            
        } catch (Exception $e) {
            error_log("PHOTO_UPLOAD_EXCEPTION: " . $e->getMessage());
            error_log("PHOTO_UPLOAD_EXCEPTION_FILE: " . $e->getFile() . " linha " . $e->getLine());
            error_log("PHOTO_UPLOAD_EXCEPTION_TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno no upload: ' . $e->getMessage(), 500);
        }
    }
    
    public function delete() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['cpf']) || empty($input['cpf'])) {
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            $cpf = preg_replace('/\D/', '', $input['cpf']);
            $photoType = '';
            if (isset($input['type'])) {
                if ($input['type'] === 'foto2') $photoType = '_2';
                if ($input['type'] === 'foto3') $photoType = '_3';
                if ($input['type'] === 'foto4') $photoType = '_4';
            }
            $fileName = $cpf . $photoType . '.jpg';
            $filePath = $this->uploadDir . $fileName;
            
            if (file_exists($filePath)) {
                if (unlink($filePath)) {
                    Response::success([
                        'message' => 'Foto removida com sucesso',
                        'cpf' => $cpf
                    ], 'Foto removida com sucesso');
                } else {
                    Response::error('Erro ao remover a foto', 500);
                }
            } else {
                Response::error('Foto não encontrada', 404);
            }
            
        } catch (Exception $e) {
            error_log("PHOTO_DELETE_ERROR: " . $e->getMessage());
            Response::error('Erro interno ao remover foto: ' . $e->getMessage(), 500);
        }
    }
}