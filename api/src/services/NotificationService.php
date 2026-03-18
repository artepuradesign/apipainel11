
<?php
// src/services/NotificationService.php

class NotificationService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createNotification($userId, $type, $title, $message, $actionUrl = null, $actionText = null, $priority = 'medium') {
        try {
            $query = "INSERT INTO notifications (
                user_id, type, title, message, action_url, action_text, 
                priority, is_read, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $userId, $type, $title, $message, 
                $actionUrl, $actionText, $priority
            ]);
            
            if ($result) {
                $notificationId = $this->db->lastInsertId();
                error_log("NOTIFICATION: Criada para usuário {$userId} - ID: {$notificationId}");
                
                return [
                    'success' => true,
                    'notification_id' => $notificationId
                ];
            }
            
            return ['success' => false, 'message' => 'Erro ao criar notificação'];
            
        } catch (Exception $e) {
            error_log("NOTIFICATION ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    public function sendNotification($userId, $type, $title, $message, $actionUrl = null) {
        // Compatibilidade com método antigo
        return $this->createNotification($userId, $type, $title, $message, $actionUrl);
    }
    public function getNotificationsByUser($userId, $limit = 50, $offset = 0) {
        try {
            $query = "SELECT * FROM notifications 
                     WHERE user_id = ? 
                     ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting notifications: " . $e->getMessage());
            return [];
        }
    }

    public function getUserNotifications($userId, $limit = 10, $onlyUnread = false) {
        try {
            $whereClause = "user_id = ?";
            $params = [$userId];
            
            if ($onlyUnread) {
                $whereClause .= " AND is_read = 0";
            }
            
            $query = "SELECT * FROM notifications 
                     WHERE {$whereClause} 
                     ORDER BY created_at DESC 
                     LIMIT ?";
            
            $params[] = $limit;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Debug log
            error_log("GET_NOTIFICATIONS_DEBUG: Query: " . $query);
            error_log("GET_NOTIFICATIONS_DEBUG: Params: " . json_encode($params));
            error_log("GET_NOTIFICATIONS_DEBUG: Results count: " . count($results));
            
            return $results;
            
        } catch (Exception $e) {
            error_log("GET_NOTIFICATIONS ERROR: " . $e->getMessage());
            return [];
        }
    }
    
    public function markAsRead($notificationId, $userId) {
        try {
            $query = "UPDATE notifications SET is_read = 1, read_at = NOW() 
                     WHERE id = ? AND user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$notificationId, $userId]);
            
            return [
                'success' => true,
                'message' => 'Notificação marcada como lida'
            ];
            
        } catch (Exception $e) {
            error_log("MARK_NOTIFICATION_READ ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function getNotificationById($notificationId, $userId) {
        try {
            $query = "SELECT * FROM notifications 
                     WHERE id = ? AND user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$notificationId, $userId]);
            
            return $stmt->fetch(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("GET_NOTIFICATION_BY_ID ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    public function getUnreadCount($userId) {
        try {
            $query = "SELECT COUNT(*) as count FROM notifications 
                     WHERE user_id = ? AND is_read = 0";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)($result['count'] ?? 0);
            
        } catch (Exception $e) {
            error_log("UNREAD_COUNT ERROR: " . $e->getMessage());
            return 0;
        }
    }
    
    public function deleteNotification($notificationId, $userId) {
        try {
            // Verificar se a notificação existe e pertence ao usuário
            $query = "SELECT id FROM notifications WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$notificationId, $userId]);
            
            if (!$stmt->fetch()) {
                return [
                    'success' => false,
                    'message' => 'Notificação não encontrada ou não autorizada',
                    'code' => 404
                ];
            }
            
            // Deletar a notificação
            $deleteQuery = "DELETE FROM notifications WHERE id = ? AND user_id = ?";
            $deleteStmt = $this->db->prepare($deleteQuery);
            $result = $deleteStmt->execute([$notificationId, $userId]);
            
            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Notificação excluída com sucesso'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Erro ao excluir notificação'
                ];
            }
            
        } catch (Exception $e) {
            error_log("DELETE_NOTIFICATION ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
