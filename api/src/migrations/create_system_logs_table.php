
<?php
// src/migrations/create_system_logs_table.php

function createSystemLogsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        module VARCHAR(100),
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        request_method VARCHAR(10),
        request_url VARCHAR(500),
        request_data JSON,
        response_code INT,
        response_time INT,
        severity ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_module (module),
        INDEX idx_severity (severity),
        INDEX idx_created_at (created_at),
        INDEX idx_ip_address (ip_address),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropSystemLogsTable($db) {
    $sql = "DROP TABLE IF EXISTS system_logs";
    return $db->exec($sql);
}
