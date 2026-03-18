
<?php
// src/migrations/create_user_config_table.php

function createUserConfigTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS user_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        theme ENUM('light', 'dark', 'auto') DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'pt-BR',
        timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        notifications_enabled BOOLEAN DEFAULT TRUE,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        push_notifications BOOLEAN DEFAULT TRUE,
        marketing_emails BOOLEAN DEFAULT FALSE,
        security_alerts BOOLEAN DEFAULT TRUE,
        dashboard_layout JSON,
        preferences JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_theme (theme),
        INDEX idx_language (language),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropUserConfigTable($db) {
    $sql = "DROP TABLE IF EXISTS user_config";
    return $db->exec($sql);
}
