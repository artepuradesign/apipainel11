
<?php
// src/models/SupportTicket.php

require_once 'BaseModel.php';

class SupportTicket extends BaseModel {
    protected $table = 'support_tickets';
    
    public function getByUser($userId, $limit = 50) {
        return $this->getAll(['user_id' => $userId], 'created_at DESC', $limit);
    }
    
    public function getByStatus($status) {
        return $this->getAll(['status' => $status], 'created_at DESC');
    }
    
    public function getByPriority($priority) {
        return $this->getAll(['priority' => $priority], 'created_at DESC');
    }
    
    public function generateTicketNumber() {
        $prefix = 'TK';
        $timestamp = time();
        $random = rand(100, 999);
        return $prefix . $timestamp . $random;
    }
    
    public function assignTicket($ticketId, $assignedTo) {
        return $this->update($ticketId, ['assigned_to' => $assignedTo]);
    }
    
    public function closeTicket($ticketId, $resolution) {
        return $this->update($ticketId, [
            'status' => 'resolved',
            'resolution' => $resolution,
            'resolved_at' => date('Y-m-d H:i:s')
        ]);
    }
}
