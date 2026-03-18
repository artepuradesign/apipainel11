
<?php
// src/migrations/create_subscriptions_table.php

function createSubscriptionsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        status ENUM('ativa', 'cancelada', 'suspensa', 'expirada') DEFAULT 'ativa',
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        next_billing_date DATETIME,
        billing_cycle ENUM('mensal', 'trimestral', 'semestral', 'anual') DEFAULT 'mensal',
        amount DECIMAL(10,2) NOT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'BRL',
        payment_method ENUM('pix', 'boleto', 'cartao', 'credito_conta') DEFAULT 'pix',
        auto_renewal BOOLEAN DEFAULT TRUE,
        cancellation_reason TEXT,
        cancelled_at DATETIME,
        cancelled_by INT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_plan_id (plan_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date),
        INDEX idx_next_billing_date (next_billing_date),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
        FOREIGN KEY (cancelled_by) REFERENCES usuarios(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropSubscriptionsTable($db) {
    $sql = "DROP TABLE IF EXISTS subscriptions";
    return $db->exec($sql);
}
