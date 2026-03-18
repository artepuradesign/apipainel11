<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../src/models/BaseSenhaCpf.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$pathParts = explode('/', trim($pathInfo, '/'));

// Verificar autenticação apenas para métodos que modificam dados
if (in_array($method, ['POST', 'PUT', 'DELETE'])) {
    $authResult = authenticateRequest();
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => $authResult['error']]);
        exit;
    }
    $userId = $authResult['user_id'];
}

try {
    $baseSenhaCpf = new BaseSenhaCpf($db);

    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Dados inválidos');
            }

            $id = $baseSenhaCpf->create($input);
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $id],
                'message' => 'Senha de CPF cadastrada com sucesso'
            ]);
            break;

        case 'GET':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf-id') {
                // GET /cpf-id/{cpfId}
                $cpfId = intval($pathParts[1]);
                $senhas = $baseSenhaCpf->getByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'data' => $senhas
                ]);
            } elseif (count($pathParts) >= 2 && $pathParts[0] === 'cpf') {
                // GET /cpf/{cpf}
                $cpf = $pathParts[1];
                $senhas = $baseSenhaCpf->getByCpf($cpf);
                
                echo json_encode([
                    'success' => true,
                    'data' => $senhas
                ]);
            } else {
                throw new Exception('Endpoint não encontrado');
            }
            break;

        case 'PUT':
            if (count($pathParts) >= 1) {
                // PUT /{id}
                $id = intval($pathParts[0]);
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (!$input) {
                    throw new Exception('Dados inválidos');
                }

                $result = $baseSenhaCpf->update($id, $input);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senha de CPF atualizada com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao atualizar senha de CPF');
                }
            } else {
                throw new Exception('ID da senha não informado');
            }
            break;

        case 'DELETE':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf-id') {
                // DELETE /cpf-id/{cpfId}
                $cpfId = intval($pathParts[1]);
                $result = $baseSenhaCpf->deleteByCpfId($cpfId);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senhas de CPF excluídas com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir senhas de CPF');
                }
            } elseif (count($pathParts) >= 1) {
                // DELETE /{id}
                $id = intval($pathParts[0]);
                $result = $baseSenhaCpf->delete($id);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senha de CPF excluída com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir senha de CPF');
                }
            } else {
                throw new Exception('ID da senha não informado');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }

} catch (Exception $e) {
    error_log("ERRO BASE_SENHA_CPF: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
