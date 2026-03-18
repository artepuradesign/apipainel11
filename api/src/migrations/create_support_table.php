
<?php
// src/migrations/create_support_table.php

function createSupportTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ticket_number VARCHAR(20) NOT NULL UNIQUE,
        subject VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category ENUM('tecnico', 'financeiro', 'consultas', 'geral') DEFAULT 'geral',
        priority ENUM('baixa', 'media', 'alta', 'urgente') DEFAULT 'media',
        status ENUM('aberto', 'em_andamento', 'resolvido', 'fechado') DEFAULT 'aberto',
        assigned_to INT,
        resolution TEXT,
        satisfaction_rating TINYINT CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
        satisfaction_comment TEXT,
        attachments JSON,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        
        INDEX idx_user_id (user_id),
        INDEX idx_ticket_number (ticket_number),
        INDEX idx_status (status),
        INDEX idx_category (category),
        INDEX idx_priority (priority),
        INDEX idx_assigned_to (assigned_to),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropSupportTable($db) {
    $sql = "DROP TABLE IF EXISTS support_tickets";
    return $db->exec($sql);
}
