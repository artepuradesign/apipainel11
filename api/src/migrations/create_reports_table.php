
<?php
// src/migrations/create_reports_table.php

function createReportsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('financial', 'usage', 'user_activity', 'system_performance', 'custom') NOT NULL,
        description TEXT,
        parameters JSON,
        filters JSON,
        data JSON,
        file_path VARCHAR(500),
        format ENUM('json', 'csv', 'pdf', 'excel') DEFAULT 'json',
        status ENUM('generating', 'completed', 'failed', 'cancelled') DEFAULT 'generating',
        generated_by INT,
        scheduled_at DATETIME,
        completed_at DATETIME,
        expires_at DATETIME,
        download_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_type (type),
        INDEX idx_status (status),
        INDEX idx_generated_by (generated_by),
        INDEX idx_created_at (created_at),
        INDEX idx_scheduled_at (scheduled_at),
        INDEX idx_expires_at (expires_at),
        
        FOREIGN KEY (generated_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropReportsTable($db) {
    $sql = "DROP TABLE IF EXISTS reports";
    return $db->exec($sql);
}
