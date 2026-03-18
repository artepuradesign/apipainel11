
<?php
// src/utils/Backup.php

class Backup {
    private $db;
    private $backupDir;
    private $logger;
    
    public function __construct($db, $logger = null) {
        $this->db = $db;
        $this->backupDir = __DIR__ . '/../../storage/backups';
        $this->logger = $logger;
        $this->ensureBackupDirectory();
    }
    
    public function createDatabaseBackup($filename = null) {
        try {
            $filename = $filename ?? 'backup_' . date('Y-m-d_H-i-s') . '.sql';
            $backupPath = $this->backupDir . '/' . $filename;
            
            $tables = $this->getDatabaseTables();
            $sql = $this->generateSQLDump($tables);
            
            if (file_put_contents($backupPath, $sql) === false) {
                throw new Exception('Erro ao salvar arquivo de backup');
            }
            
            if ($this->logger) {
                $this->logger->info('Backup criado com sucesso', ['filename' => $filename]);
            }
            
            return [
                'success' => true,
                'filename' => $filename,
                'path' => $backupPath,
                'size' => filesize($backupPath)
            ];
        } catch (Exception $e) {
            if ($this->logger) {
                $this->logger->error('Erro ao criar backup', ['error' => $e->getMessage()]);
            }
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function restoreDatabase($filename) {
        try {
            $backupPath = $this->backupDir . '/' . $filename;
            
            if (!file_exists($backupPath)) {
                throw new Exception('Arquivo de backup não encontrado');
            }
            
            $sql = file_get_contents($backupPath);
            
            if ($sql === false) {
                throw new Exception('Erro ao ler arquivo de backup');
            }
            
            // Executar SQL em transação
            $this->db->beginTransaction();
            
            $statements = explode(';', $sql);
            foreach ($statements as $statement) {
                $statement = trim($statement);
                if (!empty($statement)) {
                    $this->db->exec($statement);
                }
            }
            
            $this->db->commit();
            
            if ($this->logger) {
                $this->logger->info('Backup restaurado com sucesso', ['filename' => $filename]);
            }
            
            return [
                'success' => true,
                'message' => 'Backup restaurado com sucesso'
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            
            if ($this->logger) {
                $this->logger->error('Erro ao restaurar backup', ['error' => $e->getMessage()]);
            }
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function listBackups() {
        $backups = [];
        $files = glob($this->backupDir . '/*.sql');
        
        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'size' => filesize($file),
                'created' => filemtime($file),
                'formatted_size' => $this->formatBytes(filesize($file)),
                'formatted_date' => date('d/m/Y H:i:s', filemtime($file))
            ];
        }
        
        // Ordenar por data de criação (mais recente primeiro)
        usort($backups, function($a, $b) {
            return $b['created'] - $a['created'];
        });
        
        return $backups;
    }
    
    public function deleteBackup($filename) {
        $backupPath = $this->backupDir . '/' . $filename;
        
        if (!file_exists($backupPath)) {
            return [
                'success' => false,
                'message' => 'Arquivo não encontrado'
            ];
        }
        
        if (unlink($backupPath)) {
            if ($this->logger) {
                $this->logger->info('Backup deletado', ['filename' => $filename]);
            }
            
            return [
                'success' => true,
                'message' => 'Backup deletado com sucesso'
            ];
        }
        
        return [
            'success' => false,
            'message' => 'Erro ao deletar backup'
        ];
    }
    
    public function cleanOldBackups($days = 30) {
        $cutoff = time() - ($days * 24 * 60 * 60);
        $files = glob($this->backupDir . '/*.sql');
        $deleted = 0;
        
        foreach ($files as $file) {
            if (filemtime($file) < $cutoff) {
                unlink($file);
                $deleted++;
            }
        }
        
        return $deleted;
    }
    
    private function getDatabaseTables() {
        $stmt = $this->db->query("SHOW TABLES");
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }
    
    private function generateSQLDump($tables) {
        $sql = "-- Backup gerado em " . date('Y-m-d H:i:s') . "\n";
        $sql .= "-- Sistema de Backup PHP\n\n";
        $sql .= "SET FOREIGN_KEY_CHECKS = 0;\n\n";
        
        foreach ($tables as $table) {
            $sql .= $this->dumpTable($table);
        }
        
        $sql .= "SET FOREIGN_KEY_CHECKS = 1;\n";
        
        return $sql;
    }
    
    private function dumpTable($table) {
        $sql = "-- Estrutura da tabela {$table}\n";
        $sql .= "DROP TABLE IF EXISTS `{$table}`;\n";
        
        // Obter estrutura da tabela
        $stmt = $this->db->query("SHOW CREATE TABLE `{$table}`");
        $row = $stmt->fetch();
        $sql .= $row['Create Table'] . ";\n\n";
        
        // Obter dados da tabela
        $stmt = $this->db->query("SELECT * FROM `{$table}`");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (!empty($rows)) {
            $sql .= "-- Dados da tabela {$table}\n";
            
            $columns = array_keys($rows[0]);
            $columnsList = '`' . implode('`, `', $columns) . '`';
            
            foreach ($rows as $row) {
                $values = array_map(function($value) {
                    return $value === null ? 'NULL' : $this->db->quote($value);
                }, array_values($row));
                
                $sql .= "INSERT INTO `{$table}` ({$columnsList}) VALUES (" . implode(', ', $values) . ");\n";
            }
            
            $sql .= "\n";
        }
        
        return $sql;
    }
    
    private function formatBytes($bytes, $precision = 2) {
        $units = ['B', 'KB', 'MB', 'GB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, $precision) . ' ' . $units[$i];
    }
    
    private function ensureBackupDirectory() {
        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }
}
