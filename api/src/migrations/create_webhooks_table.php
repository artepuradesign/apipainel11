
<?php
// src/migrations/create_webhooks_table.php

function createWebhooksTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS webhooks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        events JSON NOT NULL,
        secret VARCHAR(255),
        headers JSON,
        status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
        last_triggered_at DATETIME,
        success_count INT DEFAULT 0,
        failure_count INT DEFAULT 0,
        retry_count INT DEFAULT 0,
        max_retries INT DEFAULT 3,
        timeout INT DEFAULT 30,
        verification_token VARCHAR(255),
        verified_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_last_triggered_at (last_triggered_at),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropWebhooksTable($db) {
    $sql = "DROP TABLE IF EXISTS webhooks";
    return $db->exec($sql);
}
