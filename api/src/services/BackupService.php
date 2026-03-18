
<?php
// src/services/BackupService.php

class BackupService {
    private $db;
    private $backupDir;
    
    public function __construct($db) {
        $this->db = $db;
        $this->backupDir = __DIR__ . '/../../storage/backups';
        $this->ensureBackupDirectory();
    }
    
    public function createDatabaseBackup($tables = []) {
        try {
            $filename = 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $backupPath = $this->backupDir . '/' . $filename;
            
            $sql = "-- Database Backup\n";
            $sql .= "-- Created: " . date('Y-m-d H:i:s') . "\n\n";
            
            if (empty($tables)) {
                $tables = $this->getAllTables();
            }
            
            foreach ($tables as $table) {
                $sql .= $this->backupTable($table);
            }
            
            if (file_put_contents($backupPath, $sql)) {
                return [
                    'success' => true,
                    'filename' => $filename,
                    'path' => $backupPath,
                    'size' => filesize($backupPath)
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao criar arquivo de backup'
            ];
        } catch (Exception $e) {
            error_log("BackupService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    private function getAllTables() {
        $stmt = $this->db->query("SHOW TABLES");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    private function backupTable($table) {
        $sql = "\n-- Table: {$table}\n";
        
        // Estrutura da tabela
        $stmt = $this->db->query("SHOW CREATE TABLE `{$table}`");
        $row = $stmt->fetch();
        $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
        $sql .= $row['Create Table'] . ";\n\n";
        
        // Dados da tabela
        $stmt = $this->db->query("SELECT * FROM `{$table}`");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $sql .= "INSERT INTO `{$table}` VALUES (";
            $values = [];
            foreach ($row as $value) {
                $values[] = $value === null ? 'NULL' : "'" . addslashes($value) . "'";
            }
            $sql .= implode(', ', $values) . ");\n";
        }
        
        return $sql . "\n";
    }
    
    public function restoreDatabase($backupFile) {
        try {
            $backupPath = $this->backupDir . '/' . $backupFile;
            
            if (!file_exists($backupPath)) {
                return [
                    'success' => false,
                    'message' => 'Arquivo de backup não encontrado'
                ];
            }
            
            $sql = file_get_contents($backupPath);
            $statements = explode(';', $sql);
            
            $this->db->beginTransaction();
            
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (!empty($statement) && !preg_match('/^--/', $statement)) {
                    $this->db->exec($statement);
                }
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'message' => 'Backup restaurado com sucesso'
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("BackupService restore error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao restaurar backup: ' . $e->getMessage()
            ];
        }
    }
    
    public function getBackupList() {
        $backups = [];
        $files = glob($this->backupDir . '/backup_*.sql');
        
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }
        
        usort($backups, function($a, $b) {
            return strcmp($b['created'], $a['created']);
        });
        
        return $backups;
    }
    
    public function deleteBackup($filename) {
        $backupPath = $this->backupDir . '/' . $filename;
        
        if (file_exists($backupPath) && preg_match('/^backup_.*\.sql$/', $filename)) {
            return unlink($backupPath);
        }
        
        return false;
    }
    
    public function createFileBackup($sourceDir) {
        try {
            $filename = 'files_backup_' . date('Y-m-d_H-i-s') . '.zip';
            $backupPath = $this->backupDir . '/' . $filename;
            
            $zip = new ZipArchive();
            if ($zip->open($backupPath, ZipArchive::CREATE) !== TRUE) {
                return [
                    'success' => false,
                    'message' => 'Erro ao criar arquivo ZIP'
                ];
            }
            
            $this->addDirectoryToZip($zip, $sourceDir, '');
            $zip->close();
            
            return [
                'success' => true,
                'filename' => $filename,
                'size' => filesize($backupPath)
            ];
        } catch (Exception $e) {
            error_log("BackupService file backup error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao criar backup de arquivos'
            ];
        }
    }
    
    private function addDirectoryToZip($zip, $sourceDir, $zipPath) {
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($sourceDir),
            RecursiveIteratorIterator::LEAVES_ONLY
        );
        
        foreach ($files as $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = $zipPath . substr($filePath, strlen($sourceDir) + 1);
                $zip->addFile($filePath, $relativePath);
            }
        }
    }
    
    private function ensureBackupDirectory() {
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }
    
    public function scheduleAutomaticBackup($interval = 'daily') {
        // Implementar agendamento de backup automático
        $schedules = [
            'daily' => 86400,    // 24 horas
            'weekly' => 604800,  // 7 dias
            'monthly' => 2592000 // 30 dias
        ];
        
        $lastBackup = $this->getLastBackupTime();
        $intervalSeconds = $schedules[$interval] ?? 86400;
        
        if (time() - $lastBackup > $intervalSeconds) {
            return $this->createDatabaseBackup();
        }
        
        return [
            'success' => true,
            'message' => 'Backup não necessário ainda'
        ];
    }
    
    private function getLastBackupTime() {
        $backups = $this->getBackupList();
        if (!empty($backups)) {
            return strtotime($backups[0]['created']);
        }
        return 0;
    }
}
