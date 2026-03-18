
<?php
// src/middleware/LogMiddleware.php

class LogMiddleware {
    private $db;
    private $logFile;
    
    public function __construct($db = null) {
        $this->db = $db;
        $this->logFile = __DIR__ . '/../../storage/logs/api.log';
        $this->ensureLogDirectory();
    }
    
    public function logRequest() {
        $requestData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN',
            'uri' => $_SERVER['REQUEST_URI'] ?? '/',
            'ip' => $this->getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
            'request_id' => uniqid()
        ];
        
        // Log em arquivo
        $this->writeToFile($requestData);
        
        // Log em banco se disponível
        if ($this->db) {
            $this->writeToDatabase($requestData);
        }
        
        return $requestData['request_id'];
    }
    
    public function logResponse($requestId, $statusCode, $responseTime = null) {
        $responseData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'request_id' => $requestId,
            'status_code' => $statusCode,
            'response_time' => $responseTime,
            'memory_usage' => memory_get_peak_usage(true)
        ];
        
        $this->writeToFile($responseData);
        
        if ($this->db) {
            $this->updateDatabaseLog($requestId, $responseData);
        }
    }
    
    public function logError($message, $context = []) {
        $errorData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'ERROR',
            'message' => $message,
            'context' => json_encode($context),
            'trace' => debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS)
        ];
        
        $this->writeToFile($errorData);
        
        if ($this->db) {
            $this->writeErrorToDatabase($errorData);
        }
    }
    
    public function logInfo($message, $context = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'INFO',
            'message' => $message,
            'context' => json_encode($context)
        ];
        
        $this->writeToFile($logData);
    }
    
    public function logWarning($message, $context = []) {
        $logData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => 'WARNING',
            'message' => $message,
            'context' => json_encode($context)
        ];
        
        $this->writeToFile($logData);
    }
    
    private function writeToFile($data) {
        $logLine = '[' . $data['timestamp'] . '] ';
        
        if (isset($data['level'])) {
            $logLine .= $data['level'] . ': ';
        }
        
        if (isset($data['method']) && isset($data['uri'])) {
            $logLine .= $data['method'] . ' ' . $data['uri'] . ' ';
        }
        
        if (isset($data['message'])) {
            $logLine .= $data['message'] . ' ';
        }
        
        if (isset($data['status_code'])) {
            $logLine .= 'Status: ' . $data['status_code'] . ' ';
        }
        
        if (isset($data['response_time'])) {
            $logLine .= 'Time: ' . $data['response_time'] . 'ms ';
        }
        
        $logLine .= PHP_EOL;
        
        file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }
    
    private function writeToDatabase($data) {
        try {
            $query = "INSERT INTO api_logs (request_id, method, uri, ip_address, user_agent, created_at) 
                     VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $data['request_id'],
                $data['method'],
                $data['uri'],
                $data['ip'],
                $data['user_agent'],
                $data['timestamp']
            ]);
        } catch (Exception $e) {
            error_log("Failed to write log to database: " . $e->getMessage());
        }
    }
    
    private function updateDatabaseLog($requestId, $data) {
        try {
            $query = "UPDATE api_logs SET status_code = ?, response_time = ?, memory_usage = ? 
                     WHERE request_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $data['status_code'],
                $data['response_time'],
                $data['memory_usage'],
                $requestId
            ]);
        } catch (Exception $e) {
            error_log("Failed to update log in database: " . $e->getMessage());
        }
    }
    
    private function writeErrorToDatabase($data) {
        try {
            $query = "INSERT INTO error_logs (level, message, context, trace, created_at) 
                     VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $data['level'],
                $data['message'],
                $data['context'],
                json_encode($data['trace']),
                $data['timestamp']
            ]);
        } catch (Exception $e) {
            error_log("Failed to write error to database: " . $e->getMessage());
        }
    }
    
    private function getClientIP() {
        $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }
    
    private function ensureLogDirectory() {
        $logDir = dirname($this->logFile);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }
    
    public function cleanOldLogs($daysToKeep = 30) {
        // Limpar logs de arquivo
        $files = glob(dirname($this->logFile) . '/*.log');
        foreach ($files as $file) {
            if (filemtime($file) < strtotime("-{$daysToKeep} days")) {
                unlink($file);
            }
        }
        
        // Limpar logs do banco
        if ($this->db) {
            try {
                $query = "DELETE FROM api_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$daysToKeep]);
                
                $query = "DELETE FROM error_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$daysToKeep]);
            } catch (Exception $e) {
                error_log("Failed to clean old logs from database: " . $e->getMessage());
            }
        }
    }
}
