<?php
// src/services/AdminActivityService.php

class AdminActivityService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function logActivity($action, $description, $userId = null, $amount = null, $metadata = null) {
        try {
            // Inserir na tabela audit_logs
            $auditQuery = "INSERT INTO audit_logs (
                entity_type, entity_id, user_id, action, description, 
                new_values, ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            $newValues = [];
            if ($amount !== null) {
                $newValues['amount'] = $amount;
            }
            if ($metadata !== null) {
                $newValues['metadata'] = json_decode($metadata, true);
            }
            
            $auditStmt = $this->db->prepare($auditQuery);
            $auditStmt->execute([
                'user_activity',
                $userId,
                $userId,
                $action,
                $description,
                json_encode($newValues),
                $ipAddress,
                $userAgent
            ]);
            
            $auditId = $this->db->lastInsertId();
            
            error_log("ADMIN_ACTIVITY SUCCESS: Logged activity {$action} for user {$userId}");
            
            return [
                'success' => true,
                'data' => [
                    'audit_id' => $auditId
                ]
            ];
            
        } catch (Exception $e) {
            error_log("ADMIN_ACTIVITY ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function getActivities($userId = null, $limit = 50, $offset = 0) {
        try {
            $query = "SELECT * FROM audit_logs";
            $params = [];
            
            if ($userId !== null) {
                $query .= " WHERE user_id = ?";
                $params[] = $userId;
            }
            
            $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("ADMIN_ACTIVITY GET_ACTIVITIES ERROR: " . $e->getMessage());
            return [];
        }
    }
}