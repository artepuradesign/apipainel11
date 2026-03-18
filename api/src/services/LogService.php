
<?php
// src/services/LogService.php

require_once __DIR__ . '/../models/SystemLog.php';

class LogService {
    private $db;
    private $systemLog;
    private $logFile;
    
    public function __construct($db) {
        $this->db = $db;
        $this->systemLog = new SystemLog($db);
        $this->logFile = __DIR__ . '/../../storage/logs/system.log';
        $this->ensureLogDirectory();
    }
    
    public function log($level, $message, $context = []) {
        try {
            // Log no banco de dados
            $this->systemLog->level = $level;
            $this->systemLog->message = $message;
            $this->systemLog->context = json_encode($context);
            $this->systemLog->user_id = $context['user_id'] ?? null;
            $this->systemLog->ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
            $this->systemLog->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $this->systemLog->create();
            
            // Log em arquivo
            $this->logToFile($level, $message, $context);
            
            return true;
        } catch (Exception $e) {
            error_log("LogService error: " . $e->getMessage());
            return false;
        }
    }
    
    public function info($message, $context = []) {
        return $this->log('info', $message, $context);
    }
    
    public function warning($message, $context = []) {
        return $this->log('warning', $message, $context);
    }
    
    public function error($message, $context = []) {
        return $this->log('error', $message, $context);
    }
    
    public function debug($message, $context = []) {
        return $this->log('debug', $message, $context);
    }
    
    public function critical($message, $context = []) {
        return $this->log('critical', $message, $context);
    }
    
    private function logToFile($level, $message, $context) {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = !empty($context) ? ' | Context: ' . json_encode($context) : '';
        $logEntry = "[{$timestamp}] {$level}: {$message}{$contextStr}" . PHP_EOL;
        
        file_put_contents($this->logFile, $logEntry, FILE_APPEND | LOCK_EX);
    }
    
    public function getLogs($level = null, $limit = 100, $offset = 0) {
        $query = "SELECT * FROM system_logs";
        $params = [];
        
        if ($level) {
            $query .= " WHERE level = ?";
            $params[] = $level;
        }
        
        $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
    
    public function getLogsByUser($userId, $limit = 50) {
        $query = "SELECT * FROM system_logs WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit]);
        return $stmt->fetchAll();
    }
    
    public function getLogStats() {
        $stats = [];
        
        // Logs por nível nas últimas 24h
        $yesterday = date('Y-m-d H:i:s', time() - 86400);
        $query = "SELECT level, COUNT(*) as count FROM system_logs 
                 WHERE created_at >= ? GROUP BY level";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$yesterday]);
        $stats['by_level'] = $stmt->fetchAll();
        
        // Total de logs
        $query = "SELECT COUNT(*) as total FROM system_logs";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $stats['total'] = $stmt->fetch()['total'];
        
        return $stats;
    }
    
    public function cleanOldLogs($daysOld = 30) {
        try {
            $query = "DELETE FROM system_logs 
                     WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$daysOld]);
            
            return [
                'success' => true,
                'deleted' => $stmt->rowCount()
            ];
        } catch (Exception $e) {
            error_log("LogService clean error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao limpar logs antigos'
            ];
        }
    }
    
    private function ensureLogDirectory() {
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    public function rotateLogFile() {
        if (file_exists($this->logFile) && filesize($this->logFile) > 10485760) { // 10MB
            $rotatedFile = $this->logFile . '.' . date('Y-m-d-H-i-s');
            rename($this->logFile, $rotatedFile);
            touch($this->logFile);
            chmod($this->logFile, 0644);
        }
    }
}
