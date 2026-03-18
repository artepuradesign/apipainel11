<?php
// src/endpoints/base-credilink.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../services/BaseCreditinkService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

try {
    // Conectar ao banco usando conexao.php
    $db = getDBConnection();
    
    if (!$db) {
        throw new Exception('Erro na conexão com o banco de dados');
    }
    
    // Verificar autenticação
    $authMiddleware = new AuthMiddleware($db);
    $user = $authMiddleware->handle();
    
    if (!$user) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Token de autenticação inválido ou ausente'
        ]);
        exit();
    }
    
    $creditinkService = new BaseCreditinkService($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $requestUri = $_SERVER['REQUEST_URI'];
    
    // Parse da URL para extrair parâmetros
    $pathParts = explode('/', trim(parse_url($requestUri, PHP_URL_PATH), '/'));
    $endpoint = end($pathParts);
    
    switch ($method) {
        case 'GET':
            if (preg_match('/\/base-credilink\/(\d+)$/', $requestUri, $matches)) {
                // GET /base-credilink/{id} - Buscar por ID
                $id = (int)$matches[1];
                $result = $creditinkService->getCreditinkById($id);
                
                if ($result) {
                    echo json_encode([
                        'success' => true,
                        'data' => $result
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Registro Credilink não encontrado'
                    ]);
                }
            } elseif (preg_match('/\/base-credilink\/cpf\/(\d+)$/', $requestUri, $matches)) {
                // GET /base-credilink/cpf/{cpf_id} - Buscar por CPF ID
                $cpfId = (int)$matches[1];
                $result = $creditinkService->getCreditinksByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
            } else {
                // GET /base-credilink - Listar todos com paginação
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
                $search = isset($_GET['search']) ? trim($_GET['search']) : '';
                
                $result = $creditinkService->getAllCredilinks($page, $limit, $search);
                
                echo json_encode([
                    'success' => true,
                    'data' => $result['data'],
                    'total' => $result['total'],
                    'page' => $result['page'],
                    'limit' => $result['limit'],
                    'total_pages' => $result['total_pages']
                ]);
            }
            break;
            
        case 'POST':
            // POST /base-credilink - Criar novo
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (empty($input)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Dados não fornecidos'
                ]);
                exit();
            }
            
            $id = $creditinkService->createCredilink($input);
            $newRecord = $creditinkService->getCreditinkById($id);
            
            http_response_code(201);
            echo json_encode([
                'success' => true,
                'data' => $newRecord,
                'message' => 'Dados Credilink criados com sucesso'
            ]);
            break;
            
        case 'PUT':
            if (preg_match('/\/base-credilink\/(\d+)$/', $requestUri, $matches)) {
                // PUT /base-credilink/{id} - Atualizar por ID
                $id = (int)$matches[1];
                $input = json_decode(file_get_contents('php://input'), true);
                
                if (empty($input)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Dados não fornecidos'
                    ]);
                    exit();
                }
                
                $success = $creditinkService->updateCredilink($id, $input);
                
                if ($success) {
                    $updatedRecord = $creditinkService->getCreditinkById($id);
                    echo json_encode([
                        'success' => true,
                        'data' => $updatedRecord,
                        'message' => 'Dados Credilink atualizados com sucesso'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Nenhuma alteração foi feita'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        case 'DELETE':
            if (preg_match('/\/base-credilink\/(\d+)$/', $requestUri, $matches)) {
                // DELETE /base-credilink/{id} - Deletar por ID
                $id = (int)$matches[1];
                $success = $creditinkService->deleteCredilink($id);
                
                if ($success) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Dados Credilink deletados com sucesso'
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Falha ao deletar dados Credilink'
                    ]);
                }
            } elseif (preg_match('/\/base-credilink\/cpf\/(\d+)$/', $requestUri, $matches)) {
                // DELETE /base-credilink/cpf/{cpf_id} - Deletar todos por CPF ID
                $cpfId = (int)$matches[1];
                $deletedCount = $creditinkService->deleteCreditinksByCpfId($cpfId);
                
                echo json_encode([
                    'success' => true,
                    'message' => "Deletados {$deletedCount} registros Credilink",
                    'deleted_count' => $deletedCount
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Método não permitido'
            ]);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}