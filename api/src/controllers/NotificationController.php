
<?php
// src/controllers/NotificationController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class NotificationController {
    private $db;
    private $notificationModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->notificationModel = new Notification($db);
    }
    
    public function getNotifications() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $notifications = $this->notificationModel->getByUser($userId);
            
            $formattedNotifications = array_map(function($notification) {
                return [
                    'id' => (int)$notification['id'],
                    'type' => $notification['type'],
                    'title' => $notification['title'],
                    'message' => $notification['message'],
                    'action_url' => $notification['action_url'],
                    'action_text' => $notification['action_text'],
                    'is_read' => (bool)$notification['is_read'],
                    'priority' => $notification['priority'],
                    'created_at' => $notification['created_at'],
                    'read_at' => $notification['read_at']
                ];
            }, $notifications);
            
            Response::success($formattedNotifications);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar notificações: ' . $e->getMessage(), 500);
        }
    }
    
    public function getUnreadCount() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $count = $this->notificationModel->getUnreadCount($userId);
            
            Response::success(['unread_count' => (int)$count]);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar contagem de notificações: ' . $e->getMessage(), 500);
        }
    }
    
    public function markAsRead() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            
            if (!isset($data['notification_id'])) {
                Response::error('ID da notificação é obrigatório', 400);
                return;
            }
            
            $result = $this->notificationModel->markAsRead($data['notification_id'], $userId);
            
            if ($result) {
                Response::success(null, 'Notificação marcada como lida');
            } else {
                Response::error('Erro ao marcar notificação como lida', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao marcar notificação: ' . $e->getMessage(), 500);
        }
    }
    
    public function markAllAsRead() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $result = $this->notificationModel->markAllAsRead($userId);
            
            if ($result) {
                Response::success(null, 'Todas as notificações marcadas como lidas');
            } else {
                Response::error('Erro ao marcar todas as notificações', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao marcar notificações: ' . $e->getMessage(), 500);
        }
    }
    
    public function deleteNotification($id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            // Verificar se a notificação pertence ao usuário
            $notification = $this->notificationModel->getById($id);
            if (!$notification || $notification['user_id'] != $userId) {
                Response::error('Notificação não encontrada', 404);
                return;
            }
            
            $result = $this->notificationModel->delete($id);
            
            if ($result) {
                Response::success(null, 'Notificação excluída');
            } else {
                Response::error('Erro ao excluir notificação', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao excluir notificação: ' . $e->getMessage(), 500);
        }
    }
}
