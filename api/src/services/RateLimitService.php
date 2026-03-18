
<?php
// src/services/RateLimitService.php

require_once __DIR__ . '/../models/RateLimit.php';

class RateLimitService {
    private $db;
    private $rateLimit;
    
    public function __construct($db) {
        $this->db = $db;
        $this->rateLimit = new RateLimit($db);
    }
    
    public function checkRateLimit($identifier, $maxRequests = 60, $windowMinutes = 1) {
        try {
            $windowStart = date('Y-m-d H:i:s', time() - ($windowMinutes * 60));
            
            // Limpar registros antigos
            $this->cleanOldEntries($identifier, $windowStart);
            
            // Contar requests na janela atual
            $currentRequests = $this->getCurrentRequests($identifier, $windowStart);
            
            if ($currentRequests >= $maxRequests) {
                return [
                    'allowed' => false,
                    'remaining' => 0,
                    'reset_time' => time() + ($windowMinutes * 60)
                ];
            }
            
            // Registrar nova request
            $this->recordRequest($identifier);
            
            return [
                'allowed' => true,
                'remaining' => $maxRequests - $currentRequests - 1,
                'reset_time' => time() + ($windowMinutes * 60)
            ];
        } catch (Exception $e) {
            error_log("RateLimitService error: " . $e->getMessage());
            return ['allowed' => true, 'remaining' => $maxRequests - 1];
        }
    }
    
    private function cleanOldEntries($identifier, $windowStart) {
        $query = "DELETE FROM rate_limits WHERE identifier = ? AND created_at < ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier, $windowStart]);
    }
    
    private function getCurrentRequests($identifier, $windowStart) {
        $query = "SELECT COUNT(*) as count FROM rate_limits 
                 WHERE identifier = ? AND created_at >= ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier, $windowStart]);
        return $stmt->fetch()['count'] ?? 0;
    }
    
    private function recordRequest($identifier) {
        $this->rateLimit->identifier = $identifier;
        $this->rateLimit->requests_count = 1;
        $this->rateLimit->create();
    }
    
    public function getRateLimitStats($identifier) {
        $stats = [];
        
        // Requests na última hora
        $lastHour = date('Y-m-d H:i:s', time() - 3600);
        $query = "SELECT COUNT(*) as count FROM rate_limits 
                 WHERE identifier = ? AND created_at >= ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier, $lastHour]);
        $stats['last_hour'] = $stmt->fetch()['count'] ?? 0;
        
        // Requests hoje
        $today = date('Y-m-d 00:00:00');
        $stmt->execute([$identifier, $today]);
        $stats['today'] = $stmt->fetch()['count'] ?? 0;
        
        return $stats;
    }
    
    public function blockIdentifier($identifier, $durationMinutes = 60) {
        try {
            $query = "INSERT INTO blocked_identifiers (identifier, blocked_until)
                     VALUES (?, DATE_ADD(NOW(), INTERVAL ? MINUTE))
                     ON DUPLICATE KEY UPDATE blocked_until = DATE_ADD(NOW(), INTERVAL ? MINUTE)";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$identifier, $durationMinutes, $durationMinutes]);
        } catch (Exception $e) {
            error_log("RateLimitService block error: " . $e->getMessage());
            return false;
        }
    }
    
    public function isBlocked($identifier) {
        $query = "SELECT blocked_until FROM blocked_identifiers 
                 WHERE identifier = ? AND blocked_until > NOW()";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$identifier]);
        return $stmt->rowCount() > 0;
    }
}
