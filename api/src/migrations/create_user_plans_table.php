
<?php
// src/migrations/create_user_plans_table.php

function createUserPlansTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS user_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        subscription_id INT,
        status ENUM('ativo', 'inativo', 'suspenso', 'expirado') DEFAULT 'ativo',
        consultations_used INT DEFAULT 0,
        consultations_limit INT DEFAULT 0,
        start_date DATETIME NOT NULL,
        end_date DATETIME,
        auto_renew BOOLEAN DEFAULT FALSE,
        payment_status ENUM('pago', 'pendente', 'vencido') DEFAULT 'pendente',
        discount_applied DECIMAL(10,2) DEFAULT 0.00,
        total_paid DECIMAL(10,2) DEFAULT 0.00,
        features_enabled JSON,
        restrictions JSON,
        metadata JSON,
        activated_at DATETIME,
        deactivated_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_plan_id (plan_id),
        INDEX idx_subscription_id (subscription_id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date),
        INDEX idx_payment_status (payment_status),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT,
        FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropUserPlansTable($db) {
    $sql = "DROP TABLE IF EXISTS user_plans";
    return $db->exec($sql);
}
