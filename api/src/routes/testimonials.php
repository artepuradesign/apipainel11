<?php
// src/routes/testimonials.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../controllers/TestimonialController.php';

try {
    $controller = new TestimonialController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remover o prefixo da URL para obter apenas a rota
    $route = str_replace('/testimonials', '', $path);
    
    switch ($method) {
        case 'GET':
            if ($route === '/active') {
                // GET /testimonials/active - Buscar depoimentos ativos
                $controller->getActive();
            } elseif ($route && $route !== '/') {
                // GET /testimonials/{id} - Buscar depoimento por ID
                $id = trim($route, '/');
                $controller->getById($id);
            } else {
                // GET /testimonials - Buscar todos os depoimentos
                $controller->getAll();
            }
            break;
            
        case 'POST':
            // POST /testimonials - Criar novo depoimento
            $controller->create();
            break;
            
        case 'PUT':
            if ($route && $route !== '/') {
                // PUT /testimonials/{id} - Atualizar depoimento
                $id = trim($route, '/');
                $controller->update($id);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID do depoimento é obrigatório']);
            }
            break;
            
        case 'DELETE':
            if ($route && $route !== '/') {
                // DELETE /testimonials/{id} - Deletar depoimento
                $id = trim($route, '/');
                $controller->delete($id);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID do depoimento é obrigatório']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
            break;
    }
    
} catch (Exception $e) {
    error_log('Erro na rota de depoimentos: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor'
    ]);
}
?>