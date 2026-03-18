
<?php
// src/utils/FileManager.php

class FileManager {
    private $uploadDir;
    private $allowedExtensions;
    private $maxFileSize;
    
    public function __construct($uploadDir = null) {
        $this->uploadDir = $uploadDir ?? __DIR__ . '/../../storage/uploads';
        $this->allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx'];
        $this->maxFileSize = 10 * 1024 * 1024; // 10MB
        $this->ensureUploadDirectory();
    }
    
    public function upload($file, $subfolder = '') {
        if (!isset($file['tmp_name']) || $file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro no upload do arquivo');
        }
        
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $this->allowedExtensions)) {
            throw new Exception('Tipo de arquivo não permitido');
        }
        
        if ($file['size'] > $this->maxFileSize) {
            throw new Exception('Arquivo muito grande');
        }
        
        $filename = $this->generateUniqueFilename($extension);
        $targetDir = $this->uploadDir . '/' . trim($subfolder, '/');
        $targetPath = $targetDir . '/' . $filename;
        
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }
        
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('Falha ao mover arquivo');
        }
        
        return [
            'filename' => $filename,
            'path' => $targetPath,
            'size' => $file['size'],
            'extension' => $extension,
            'original_name' => $file['name']
        ];
    }
    
    public function delete($filePath) {
        $fullPath = $this->uploadDir . '/' . ltrim($filePath, '/');
        
        if (file_exists($fullPath)) {
            return unlink($fullPath);
        }
        
        return true;
    }
    
    public function getFileInfo($filePath) {
        $fullPath = $this->uploadDir . '/' . ltrim($filePath, '/');
        
        if (!file_exists($fullPath)) {
            return null;
        }
        
        return [
            'name' => basename($fullPath),
            'size' => filesize($fullPath),
            'modified' => filemtime($fullPath),
            'extension' => strtolower(pathinfo($fullPath, PATHINFO_EXTENSION)),
            'mime_type' => mime_content_type($fullPath)
        ];
    }
    
    public function listFiles($subfolder = '', $extension = null) {
        $directory = $this->uploadDir . '/' . trim($subfolder, '/');
        
        if (!is_dir($directory)) {
            return [];
        }
        
        $files = [];
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $fileExtension = strtolower($file->getExtension());
                
                if ($extension === null || $fileExtension === $extension) {
                    $files[] = [
                        'name' => $file->getFilename(),
                        'path' => str_replace($this->uploadDir . '/', '', $file->getPathname()),
                        'size' => $file->getSize(),
                        'modified' => $file->getMTime(),
                        'extension' => $fileExtension
                    ];
                }
            }
        }
        
        return $files;
    }
    
    public function resizeImage($imagePath, $width, $height, $outputPath = null) {
        $fullPath = $this->uploadDir . '/' . ltrim($imagePath, '/');
        
        if (!file_exists($fullPath)) {
            throw new Exception('Arquivo não encontrado');
        }
        
        $imageInfo = getimagesize($fullPath);
        if (!$imageInfo) {
            throw new Exception('Arquivo não é uma imagem válida');
        }
        
        $originalWidth = $imageInfo[0];
        $originalHeight = $imageInfo[1];
        $mimeType = $imageInfo['mime'];
        
        // Criar imagem original
        switch ($mimeType) {
            case 'image/jpeg':
                $originalImage = imagecreatefromjpeg($fullPath);
                break;
            case 'image/png':
                $originalImage = imagecreatefrompng($fullPath);
                break;
            case 'image/gif':
                $originalImage = imagecreatefromgif($fullPath);
                break;
            default:
                throw new Exception('Tipo de imagem não suportado');
        }
        
        // Criar nova imagem
        $newImage = imagecreatetruecolor($width, $height);
        imagecopyresampled($newImage, $originalImage, 0, 0, 0, 0, 
                          $width, $height, $originalWidth, $originalHeight);
        
        // Salvar nova imagem
        $outputPath = $outputPath ?? $this->generateUniqueFilename('jpg');
        $outputFullPath = $this->uploadDir . '/' . ltrim($outputPath, '/');
        
        imagejpeg($newImage, $outputFullPath, 90);
        
        // Limpar memória
        imagedestroy($originalImage);
        imagedestroy($newImage);
        
        return $outputPath;
    }
    
    private function generateUniqueFilename($extension) {
        return uniqid() . '_' . time() . '.' . $extension;
    }
    
    private function ensureUploadDirectory() {
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0755, true);
        }
    }
    
    public function cleanupOldFiles($days = 30, $subfolder = '') {
        $directory = $this->uploadDir . '/' . trim($subfolder, '/');
        $cutoff = time() - ($days * 24 * 60 * 60);
        
        if (!is_dir($directory)) {
            return 0;
        }
        
        $deleted = 0;
        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($directory)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getMTime() < $cutoff) {
                unlink($file->getPathname());
                $deleted++;
            }
        }
        
        return $deleted;
    }
}
