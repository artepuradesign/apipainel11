<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../src/models/BaseSenhaEmail.php';

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
    $baseSenhaEmail = new BaseSenhaEmail($db);

    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Dados inválidos');
            }

            $id = $baseSenhaEmail->create($input);
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $id],
                'message' => 'Senha de email cadastrada com sucesso'
            ]);
            break;

        case 'GET':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf-id') {
                // GET /cpf-id/{cpfId}
                $cpfId = intval($pathParts[1]);
                $senhas = $baseSenhaEmail->getByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'data' => $senhas
                ]);
            } elseif (count($pathParts) >= 2 && $pathParts[0] === 'email') {
                // GET /email/{email}
                $email = urldecode($pathParts[1]);
                $senhas = $baseSenhaEmail->getByEmail($email);
                
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

                $result = $baseSenhaEmail->update($id, $input);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senha de email atualizada com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao atualizar senha de email');
                }
            } else {
                throw new Exception('ID da senha não informado');
            }
            break;

        case 'DELETE':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf-id') {
                // DELETE /cpf-id/{cpfId}
                $cpfId = intval($pathParts[1]);
                $result = $baseSenhaEmail->deleteByCpfId($cpfId);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senhas de email excluídas com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir senhas de email');
                }
            } elseif (count($pathParts) >= 1) {
                // DELETE /{id}
                $id = intval($pathParts[0]);
                $result = $baseSenhaEmail->delete($id);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Senha de email excluída com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir senha de email');
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
    error_log("ERRO BASE_SENHA_EMAIL: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
