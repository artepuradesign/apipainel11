
<?php
// src/controllers/ApiKeyController.php

require_once '../models/ApiKey.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class ApiKeyController {
    private $db;
    private $apiKey;
    
    public function __construct($db) {
        $this->db = $db;
        $this->apiKey = new ApiKey($db);
    }
    
    public function generateApiKey() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $key = 'api_' . bin2hex(random_bytes(20));
            
            $this->apiKey->user_id = $userId;
            $this->apiKey->key = $key;
            $this->apiKey->name = $data['name'] ?? 'API Key';
            $this->apiKey->permissions = json_encode($data['permissions'] ?? ['read']);
            $this->apiKey->status = 'ativo';
            
            if ($this->apiKey->create()) {
                Response::success([
                    'id' => $this->apiKey->id,
                    'key' => $key,
                    'name' => $this->apiKey->name
                ], 'API Key gerada com sucesso', 201);
            } else {
                Response::error('Erro ao gerar API Key', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function getMyApiKeys() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT id, name, LEFT(`key`, 10) as key_preview, permissions, status, created_at, last_used 
                     FROM api_keys WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $keys = $stmt->fetchAll();
            
            $keyData = array_map(function($key) {
                return [
                    'id' => (int)$key['id'],
                    'name' => $key['name'],
                    'keyPreview' => $key['key_preview'] . '...',
                    'permissions' => json_decode($key['permissions'], true),
                    'status' => $key['status'],
                    'createdAt' => $key['created_at'],
                    'lastUsed' => $key['last_used']
                ];
            }, $keys);
            
            Response::success($keyData);
        } catch (Exception $e) {
            Response::error('Erro ao buscar API Keys: ' . $e->getMessage(), 500);
        }
    }
    
    public function revokeApiKey($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "UPDATE api_keys SET status = 'revogada' WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$id, $userId])) {
                Response::success(null, 'API Key revogada com sucesso');
            } else {
                Response::error('Erro ao revogar API Key', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function validateApiKey() {
        $headers = getallheaders();
        $apiKey = $headers['X-API-Key'] ?? '';
        
        if (!$apiKey) {
            Response::error('API Key não fornecida', 401);
        }
        
        try {
            $query = "SELECT ak.*, u.id as user_id, u.status as user_status 
                     FROM api_keys ak 
                     JOIN usuarios u ON ak.user_id = u.id 
                     WHERE ak.key = ? AND ak.status = 'ativo' AND u.status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$apiKey]);
            $keyData = $stmt->fetch();
            
            if ($keyData) {
                // Atualizar último uso
                $updateQuery = "UPDATE api_keys SET last_used = NOW() WHERE id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$keyData['id']]);
                
                Response::success([
                    'valid' => true,
                    'userId' => (int)$keyData['user_id'],
                    'permissions' => json_decode($keyData['permissions'], true)
                ]);
            } else {
                Response::error('API Key inválida', 401);
            }
        } catch (Exception $e) {
            Response::error('Erro ao validar API Key: ' . $e->getMessage(), 500);
        }
    }
}
