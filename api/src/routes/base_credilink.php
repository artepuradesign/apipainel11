<?php
// src/routes/base_credilink.php - Rotas para administração de base_credilink

require_once __DIR__ . '/../services/BaseCreditinkService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$baseCreditinkService = new BaseCreditinkService($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (preg_match('/\/base-credilink\/cpf\/(\d+)$/', $path, $matches)) {
            // GET /base-credilink/cpf/{cpf_id}
            $cpfId = $matches[1];
            try {
                $credilinks = $baseCreditinkService->getCreditinksByCpfId($cpfId);
                Response::success($credilinks, 'Dados Credilink carregados com sucesso');
            } catch (Exception $e) {
                Response::error('Erro ao carregar dados Credilink: ' . $e->getMessage());
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        if (strpos($path, '/base-credilink') !== false && !preg_match('/\/base-credilink\/\d+/', $path)) {
            // POST /base-credilink
            try {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true);
                
                if (!$input) {
                    Response::error('Dados inválidos', 400);
                    return;
                }
                
                $id = $baseCreditinkService->createCredilink($input);
                Response::success(['id' => $id, 'message' => 'Credilink criado com sucesso'], 'Credilink criado com sucesso');
            } catch (Exception $e) {
                Response::error('Erro ao criar Credilink: ' . $e->getMessage(), 400);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'PUT':
        if (preg_match('/\/base-credilink\/(\d+)$/', $path, $matches)) {
            // PUT /base-credilink/{id}
            $id = $matches[1];
            try {
                $rawInput = file_get_contents('php://input');
                $input = json_decode($rawInput, true);
                
                if (!$input) {
                    Response::error('Dados inválidos', 400);
                    return;
                }
                
                $success = $baseCreditinkService->updateCredilink($id, $input);
                if ($success) {
                    Response::success(['id' => $id, 'message' => 'Credilink atualizado com sucesso'], 'Credilink atualizado com sucesso');
                } else {
                    Response::error('Erro ao atualizar Credilink', 500);
                }
            } catch (Exception $e) {
                Response::error('Erro ao atualizar Credilink: ' . $e->getMessage(), 400);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'DELETE':
        if (preg_match('/\/base-credilink\/cpf\/(\d+)$/', $path, $matches)) {
            // DELETE /base-credilink/cpf/{cpf_id}
            $cpfId = $matches[1];
            try {
                $deletedCount = $baseCreditinkService->deleteCreditinksByCpfId($cpfId);
                Response::success(['message' => 'Dados Credilink deletados com sucesso', 'deleted_count' => $deletedCount], 'Dados Credilink deletados com sucesso');
            } catch (Exception $e) {
                Response::error('Erro ao deletar dados Credilink: ' . $e->getMessage(), 400);
            }
        } elseif (preg_match('/\/base-credilink\/(\d+)$/', $path, $matches)) {
            // DELETE /base-credilink/{id}
            $id = $matches[1];
            try {
                $success = $baseCreditinkService->deleteCredilink($id);
                if ($success) {
                    Response::success(['id' => $id, 'message' => 'Credilink deletado com sucesso'], 'Credilink deletado com sucesso');
                } else {
                    Response::error('Erro ao deletar Credilink', 500);
                }
            } catch (Exception $e) {
                Response::error('Erro ao deletar Credilink: ' . $e->getMessage(), 400);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}