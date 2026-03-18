
<?php
// src/migrations/create_testimonials_table.php

function createTestimonialsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        rating INT DEFAULT 5,
        avatar VARCHAR(255),
        position VARCHAR(100),
        company VARCHAR(100),
        status ENUM('ativo', 'inativo', 'pendente') DEFAULT 'pendente',
        featured BOOLEAN DEFAULT FALSE,
        display_order INT DEFAULT 0,
        user_id INT,
        approved_by INT,
        approved_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_status (status),
        INDEX idx_featured (featured),
        INDEX idx_display_order (display_order),
        INDEX idx_rating (rating),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE SET NULL,
        FOREIGN KEY (approved_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropTestimonialsTable($db) {
    $sql = "DROP TABLE IF EXISTS testimonials";
    return $db->exec($sql);
}
