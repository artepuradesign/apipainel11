<?php
// src/controllers/UserSessionController.php

require_once '../utils/Response.php';

class UserSessionController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getUserSessions() {
        try {
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            
            $query = "SELECT 
                        id,
                        user_id,
                        device_type,
                        browser,
                        ip_address,
                        page_accessed,
                        access_time,
                        session_duration,
                        user_agent,
                        created_at,
                        updated_at
                      FROM user_sessions";
            
            $params = [];
            
            if ($userId) {
                $query .= " WHERE user_id = ?";
                $params[] = $userId;
            }
            
            $query .= " ORDER BY access_time DESC LIMIT ?";
            $params[] = $limit;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Formatar as sessões
            $formattedSessions = array_map(function($session) {
                return [
                    'id' => (int)$session['id'],
                    'user_id' => (int)$session['user_id'],
                    'device_type' => $session['device_type'] ?: 'Desktop Computer',
                    'browser' => $session['browser'] ?: 'Navegador',
                    'ip_address' => $session['ip_address'] ?: 'N/A',
                    'page_accessed' => $session['page_accessed'] ?: '/dashboard',
                    'access_time' => $session['access_time'],
                    'session_duration' => (int)$session['session_duration'],
                    'user_agent' => $session['user_agent'],
                    'created_at' => $session['created_at'],
                    'updated_at' => $session['updated_at']
                ];
            }, $sessions);
            
            Response::success($formattedSessions, 'Sessões de usuário carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao buscar sessões de usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function createUserSession() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::badRequest('Dados inválidos');
                return;
            }
            
            $requiredFields = ['user_id', 'device_type', 'browser', 'ip_address', 'page_accessed'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field])) {
                    Response::badRequest("Campo obrigatório: $field");
                    return;
                }
            }
            
            $query = "INSERT INTO user_sessions (
                        user_id, 
                        device_type, 
                        browser, 
                        ip_address, 
                        page_accessed, 
                        access_time, 
                        user_agent,
                        created_at,
                        updated_at
                      ) VALUES (?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $input['user_id'],
                $input['device_type'],
                $input['browser'],
                $input['ip_address'],
                $input['page_accessed'],
                $input['user_agent'] ?? ''
            ]);
            
            if ($result) {
                $sessionId = $this->db->lastInsertId();
                
                // Buscar a sessão criada
                $query = "SELECT * FROM user_sessions WHERE id = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$sessionId]);
                $session = $stmt->fetch(PDO::FETCH_ASSOC);
                
                Response::success([
                    'id' => (int)$session['id'],
                    'user_id' => (int)$session['user_id'],
                    'device_type' => $session['device_type'],
                    'browser' => $session['browser'],
                    'ip_address' => $session['ip_address'],
                    'page_accessed' => $session['page_accessed'],
                    'access_time' => $session['access_time'],
                    'session_duration' => (int)$session['session_duration'],
                    'user_agent' => $session['user_agent'],
                    'created_at' => $session['created_at'],
                    'updated_at' => $session['updated_at']
                ], 'Sessão de usuário criada com sucesso');
            } else {
                Response::error('Erro ao criar sessão de usuário', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao criar sessão de usuário: ' . $e->getMessage(), 500);
        }
    }
}