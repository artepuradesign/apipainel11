<?php
require_once '../config/cors.php';
require_once '../config/database.php';
require_once '../middleware/auth.php';
require_once '../src/models/BaseEmail.php';

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
    $baseEmail = new BaseEmail($db);

    switch ($method) {
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception('Dados inválidos');
            }

            $id = $baseEmail->create($input);
            
            echo json_encode([
                'success' => true,
                'data' => ['id' => $id],
                'message' => 'Email cadastrado com sucesso'
            ]);
            break;

        case 'GET':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf') {
                // GET /cpf/{cpfId}
                $cpfId = intval($pathParts[1]);
                $emails = $baseEmail->getByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'data' => $emails
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

                $result = $baseEmail->update($id, $input);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Email atualizado com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao atualizar email');
                }
            } else {
                throw new Exception('ID do email não informado');
            }
            break;

        case 'DELETE':
            if (count($pathParts) >= 2 && $pathParts[0] === 'cpf') {
                // DELETE /cpf/{cpfId}
                $cpfId = intval($pathParts[1]);
                $result = $baseEmail->deleteByCpfId($cpfId);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Emails excluídos com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir emails');
                }
            } elseif (count($pathParts) >= 1) {
                // DELETE /{id}
                $id = intval($pathParts[0]);
                $result = $baseEmail->delete($id);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Email excluído com sucesso'
                    ]);
                } else {
                    throw new Exception('Erro ao excluir email');
                }
            } else {
                throw new Exception('ID do email não informado');
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }

} catch (Exception $e) {
    error_log("ERRO BASE_EMAIL: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>