
<?php
// src/models/Notification.php

require_once 'BaseModel.php';

class Notification extends BaseModel {
    protected $table = 'notifications';
    
    public function getByUser($userId, $limit = 50) {
        return $this->getAll(['user_id' => $userId], 'created_at DESC', $limit);
    }
    
    public function getUnreadByUser($userId) {
        return $this->getAll(['user_id' => $userId, 'is_read' => 0], 'created_at DESC');
    }
    
    public function getGlobalNotifications() {
        return $this->getAll(['is_global' => 1, 'is_read' => 0], 'created_at DESC');
    }
    
    public function markAsRead($id, $userId) {
        $query = "UPDATE {$this->table} SET is_read = 1, read_at = NOW() WHERE id = ? AND user_id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id, $userId]);
    }
    
    public function markAllAsRead($userId) {
        $query = "UPDATE {$this->table} SET is_read = 1, read_at = NOW() WHERE user_id = ? AND is_read = 0";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$userId]);
    }
    
    public function getUnreadCount($userId) {
        $query = "SELECT COUNT(*) FROM {$this->table} WHERE user_id = ? AND is_read = 0";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchColumn();
    }
}
