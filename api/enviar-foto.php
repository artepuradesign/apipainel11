<?php
// enviar-foto.php - Interface de upload de fotos para iframe
header('Content-Type: text/html; charset=utf-8');

$cpf = isset($_GET['cpf']) ? preg_replace('/\D/', '', $_GET['cpf']) : '';
$type = isset($_GET['type']) ? $_GET['type'] : 'foto';
$isSecondPhoto = $type === 'foto2';

// Processar upload se foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['photo'])) {
    require_once __DIR__ . '/src/controllers/PhotoUploadController.php';
    
    try {
        // Definir cabeçalhos para JSON response
        header('Content-Type: application/json; charset=utf-8');
        
        $controller = new PhotoUploadController();
        
        // Capturar output do controller
        ob_start();
        $controller->upload();
        $output = ob_get_clean();
        
        // Tentar decodificar a resposta
        $response = json_decode($output, true);
        
        if ($response && isset($response['success']) && $response['success']) {
            // Sucesso - enviar postMessage e redirecionar
            $filename = $response['data']['filename'] ?? '';
            $cpfData = $response['data']['cpf'] ?? $cpf;
            
            echo json_encode([
                'success' => true,
                'message' => 'Foto enviada com sucesso',
                'filename' => $filename,
                'cpf' => $cpfData,
                'redirect' => true
            ]);
        } else {
            // Erro
            $errorMsg = $response['message'] ?? 'Erro desconhecido no upload';
            echo json_encode([
                'success' => false,
                'message' => $errorMsg
            ]);
        }
        exit;
        
    } catch (Exception $e) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'message' => 'Erro interno: ' . $e->getMessage()
        ]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload de <?php echo $isSecondPhoto ? 'Segunda ' : ''; ?>Foto</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .upload-container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
        }
        
        .upload-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        
        .upload-header h2 {
            color: #333;
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }
        
        .upload-header p {
            color: #666;
            font-size: 0.9rem;
        }
        
        .file-input-container {
            position: relative;
            margin-bottom: 1rem;
        }
        
        .file-input {
            display: none;
        }
        
        .file-input-label {
            display: block;
            padding: 3rem 1rem;
            border: 2px dashed #ddd;
            border-radius: 8px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #fafafa;
        }
        
        .file-input-label:hover {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .file-input-label.dragover {
            border-color: #667eea;
            background: #f0f4ff;
        }
        
        .upload-icon {
            font-size: 2rem;
            color: #999;
            margin-bottom: 0.5rem;
        }
        
        .upload-text {
            color: #666;
            font-size: 0.9rem;
        }
        
        .preview-container {
            margin: 1rem 0;
            text-align: center;
        }
        
        .preview-image {
            max-width: 100%;
            max-height: 200px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .upload-button {
            width: 100%;
            padding: 0.75rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }
        
        .upload-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
        }
        
        .upload-button:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        
        .message {
            padding: 0.75rem;
            border-radius: 6px;
            margin: 1rem 0;
            text-align: center;
            font-size: 0.9rem;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .cpf-info {
            background: #e3f2fd;
            padding: 0.5rem;
            border-radius: 6px;
            text-align: center;
            font-size: 0.85rem;
            color: #1565c0;
            margin-bottom: 1rem;
        }

        .loading {
            display: none;
            text-align: center;
            color: #666;
            margin: 1rem 0;
        }

        .loading.show {
            display: block;
        }
    </style>
</head>
<body>
    <div class="upload-container">
        <div class="upload-header">
            <h2>📸 <?php echo $isSecondPhoto ? 'Segunda Foto' : 'Foto Principal'; ?></h2>
            <p>Selecione uma imagem para upload</p>
        </div>
        
        <?php if ($cpf): ?>
            <div class="cpf-info">
                📄 CPF: <?php echo preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf); ?>
            </div>
        <?php endif; ?>
        
        <form id="uploadForm" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="cpf" value="<?php echo htmlspecialchars($cpf); ?>">
            <input type="hidden" name="type" value="<?php echo htmlspecialchars($type); ?>">
            
            <div class="file-input-container">
                <input type="file" id="photo" name="photo" class="file-input" accept="image/*" required>
                <label for="photo" class="file-input-label">
                    <div class="upload-icon">📁</div>
                    <div class="upload-text">
                        Clique aqui ou arraste uma imagem<br>
                        <small>Formatos: JPG, PNG, GIF (máx. 5MB)</small>
                    </div>
                </label>
            </div>
            
            <div class="preview-container" id="previewContainer" style="display: none;">
                <img id="previewImage" class="preview-image" alt="Preview">
            </div>
            
            <div class="loading" id="loading">
                ⏳ Enviando foto...
            </div>
            
            <button type="submit" class="upload-button" id="uploadButton" disabled>
                🚀 Enviar <?php echo $isSecondPhoto ? 'Segunda ' : ''; ?>Foto
            </button>
        </form>
        
        <div id="messageContainer"></div>
    </div>

    <script>
        const fileInput = document.getElementById('photo');
        const fileLabel = document.querySelector('.file-input-label');
        const previewContainer = document.getElementById('previewContainer');
        const previewImage = document.getElementById('previewImage');
        const uploadButton = document.getElementById('uploadButton');
        const uploadForm = document.getElementById('uploadForm');
        const messageContainer = document.getElementById('messageContainer');
        const loading = document.getElementById('loading');

        // File input change
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop
        fileLabel.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileLabel.classList.add('dragover');
        });
        
        fileLabel.addEventListener('dragleave', () => {
            fileLabel.classList.remove('dragover');
        });
        
        fileLabel.addEventListener('drop', (e) => {
            e.preventDefault();
            fileLabel.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                handleFileSelect();
            }
        });
        
        function handleFileSelect() {
            const file = fileInput.files[0];
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showMessage('Por favor, selecione apenas arquivos de imagem.', 'error');
                    return;
                }
                
                // Validate file size (5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('Arquivo muito grande. Máximo permitido: 5MB.', 'error');
                    return;
                }
                
                // Show preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewContainer.style.display = 'block';
                    uploadButton.disabled = false;
                };
                reader.readAsDataURL(file);
                
                clearMessage();
            }
        }
        
        // Form submission
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!fileInput.files[0]) {
                showMessage('Por favor, selecione uma foto.', 'error');
                return;
            }
            
            uploadButton.disabled = true;
            loading.classList.add('show');
            clearMessage();
            
            try {
                const formData = new FormData(uploadForm);
                
                const response = await fetch('', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showMessage('✅ Foto enviada com sucesso!', 'success');
                    
                    // Send message to parent window
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({
                            event: 'photo-upload-success',
                            filename: result.filename,
                            cpf: result.cpf || '<?php echo $cpf; ?>',
                            type: '<?php echo $type; ?>'
                        }, '*');
                    }
                    
                    // Reset form after success
                    setTimeout(() => {
                        uploadForm.reset();
                        previewContainer.style.display = 'none';
                        uploadButton.disabled = true;
                        clearMessage();
                    }, 2000);
                    
                } else {
                    showMessage('❌ ' + (result.message || 'Erro ao enviar foto.'), 'error');
                    
                    // Send error message to parent window
                    if (window.parent && window.parent !== window) {
                        window.parent.postMessage({
                            event: 'photo-upload-error',
                            message: result.message || 'Erro ao enviar foto.'
                        }, '*');
                    }
                }
                
            } catch (error) {
                console.error('Upload error:', error);
                showMessage('❌ Erro de conexão. Tente novamente.', 'error');
                
                // Send error message to parent window
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        event: 'photo-upload-error',
                        message: 'Erro de conexão. Tente novamente.'
                    }, '*');
                }
            } finally {
                uploadButton.disabled = false;
                loading.classList.remove('show');
            }
        });
        
        function showMessage(text, type) {
            messageContainer.innerHTML = `<div class="message ${type}">${text}</div>`;
        }
        
        function clearMessage() {
            messageContainer.innerHTML = '';
        }
        
        // Auto-focus if CPF is provided
        <?php if ($cpf): ?>
        document.addEventListener('DOMContentLoaded', () => {
            fileInput.focus();
        });
        <?php endif; ?>
    </script>
</body>
</html>