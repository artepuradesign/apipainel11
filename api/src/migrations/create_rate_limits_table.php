
<?php
// src/migrations/create_rate_limits_table.php

function createRateLimitsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        identifier VARCHAR(255) NOT NULL,
        type ENUM('ip', 'user', 'api_key') NOT NULL,
        endpoint VARCHAR(255),
        requests_count INT DEFAULT 0,
        window_start DATETIME NOT NULL,
        window_duration INT DEFAULT 3600,
        limit_per_window INT DEFAULT 1000,
        blocked_until DATETIME,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_identifier (identifier),
        INDEX idx_type (type),
        INDEX idx_endpoint (endpoint),
        INDEX idx_window_start (window_start),
        INDEX idx_blocked_until (blocked_until),
        
        UNIQUE KEY unique_rate_limit (identifier, type, endpoint, window_start)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropRateLimitsTable($db) {
    $sql = "DROP TABLE IF EXISTS rate_limits";
    return $db->exec($sql);
}
