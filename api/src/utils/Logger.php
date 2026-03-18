
<?php
// src/utils/Logger.php

class Logger {
    private $logDir;
    private $logLevel;
    private $maxFileSize;
    private $maxFiles;
    
    const EMERGENCY = 0;
    const ALERT = 1;
    const CRITICAL = 2;
    const ERROR = 3;
    const WARNING = 4;
    const NOTICE = 5;
    const INFO = 6;
    const DEBUG = 7;
    
    public function __construct($logDir = null, $logLevel = self::INFO) {
        $this->logDir = $logDir ?? __DIR__ . '/../../storage/logs';
        $this->logLevel = $logLevel;
        $this->maxFileSize = 10 * 1024 * 1024; // 10MB
        $this->maxFiles = 5;
        $this->ensureLogDirectory();
    }
    
    public function emergency($message, $context = []) {
        $this->log(self::EMERGENCY, $message, $context);
    }
    
    public function alert($message, $context = []) {
        $this->log(self::ALERT, $message, $context);
    }
    
    public function critical($message, $context = []) {
        $this->log(self::CRITICAL, $message, $context);
    }
    
    public function error($message, $context = []) {
        $this->log(self::ERROR, $message, $context);
    }
    
    public function warning($message, $context = []) {
        $this->log(self::WARNING, $message, $context);
    }
    
    public function notice($message, $context = []) {
        $this->log(self::NOTICE, $message, $context);
    }
    
    public function info($message, $context = []) {
        $this->log(self::INFO, $message, $context);
    }
    
    public function debug($message, $context = []) {
        $this->log(self::DEBUG, $message, $context);
    }
    
    private function log($level, $message, $context = []) {
        if ($level > $this->logLevel) {
            return;
        }
        
        $levelName = $this->getLevelName($level);
        $timestamp = date('Y-m-d H:i:s');
        $formattedMessage = $this->formatMessage($timestamp, $levelName, $message, $context);
        
        $this->writeToFile($formattedMessage);
    }
    
    private function formatMessage($timestamp, $level, $message, $context) {
        $contextString = !empty($context) ? ' ' . json_encode($context, JSON_UNESCAPED_UNICODE) : '';
        return "[{$timestamp}] {$level}: {$message}{$contextString}" . PHP_EOL;
    }
    
    private function writeToFile($message) {
        $filename = $this->logDir . '/' . date('Y-m-d') . '.log';
        
        // Verificar tamanho do arquivo e rotacionar se necessário
        if (file_exists($filename) && filesize($filename) > $this->maxFileSize) {
            $this->rotateLogFile($filename);
        }
        
        file_put_contents($filename, $message, FILE_APPEND | LOCK_EX);
    }
    
    private function rotateLogFile($filename) {
        $baseName = pathinfo($filename, PATHINFO_FILENAME);
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        
        // Mover arquivos existentes
        for ($i = $this->maxFiles - 1; $i >= 1; $i--) {
            $oldFile = $this->logDir . '/' . $baseName . '.' . $i . '.' . $extension;
            $newFile = $this->logDir . '/' . $baseName . '.' . ($i + 1) . '.' . $extension;
            
            if (file_exists($oldFile)) {
                if ($i + 1 > $this->maxFiles) {
                    unlink($oldFile);
                } else {
                    rename($oldFile, $newFile);
                }
            }
        }
        
        // Renomear arquivo atual
        $rotatedFile = $this->logDir . '/' . $baseName . '.1.' . $extension;
        rename($filename, $rotatedFile);
    }
    
    private function getLevelName($level) {
        $levels = [
            self::EMERGENCY => 'EMERGENCY',
            self::ALERT => 'ALERT',
            self::CRITICAL => 'CRITICAL',
            self::ERROR => 'ERROR',
            self::WARNING => 'WARNING',
            self::NOTICE => 'NOTICE',
            self::INFO => 'INFO',
            self::DEBUG => 'DEBUG'
        ];
        
        return $levels[$level] ?? 'UNKNOWN';
    }
    
    private function ensureLogDirectory() {
        if (!is_dir($this->logDir)) {
            mkdir($this->logDir, 0755, true);
        }
    }
    
    public function cleanOldLogs($days = 30) {
        $files = glob($this->logDir . '/*.log*');
        $cutoff = time() - ($days * 24 * 60 * 60);
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
            }
        }
    }
}
