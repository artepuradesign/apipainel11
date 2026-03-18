<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../src/models/BaseTelefone.php';

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
    $baseTelefone = new BaseTelefone($db);

    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Dados inválidos');
            }

            $id = $baseTelefone->create($input);
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $id],
                'message' => 'Telefone cadastrado com sucesso'
            ]);
            break;

        case 'GET':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf') {
                // GET /cpf/{cpfId}
                $cpfId = intval($pathParts[1]);
                $telefones = $baseTelefone->getByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'data' => $telefones
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

                $result = $baseTelefone->update($id, $input);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Telefone atualizado com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao atualizar telefone');
                }
            } else {
                throw new Exception('ID do telefone não informado');
            }
            break;

        case 'DELETE':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf') {
                // DELETE /cpf/{cpfId}
                $cpfId = intval($pathParts[1]);
                $result = $baseTelefone->deleteByCpfId($cpfId);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Telefones excluídos com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir telefones');
                }
            } elseif (count($pathParts) >= 1) {
                // DELETE /{id}
                $id = intval($pathParts[0]);
                $result = $baseTelefone->delete($id);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Telefone excluído com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir telefone');
                }
            } else {
                throw new Exception('ID do telefone não informado');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }

} catch (Exception $e) {
    error_log("ERRO BASE_TELEFONE: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>