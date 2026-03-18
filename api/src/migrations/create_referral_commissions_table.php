<?php
// src/migrations/create_referral_commissions_table.php

function createReferralCommissionsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS referral_commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrer_id INT NOT NULL,
        referred_user_id INT NOT NULL,
        commission_type ENUM('recarga', 'consulta', 'plano') DEFAULT 'recarga',
        amount DECIMAL(10,2) NOT NULL,
        commission_percentage DECIMAL(5,2) NOT NULL,
        reference_amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
        reference_table VARCHAR(50) DEFAULT NULL,
        reference_id INT DEFAULT NULL,
        paid_at DATETIME DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_referrer (referrer_id),
        INDEX idx_referred (referred_user_id),
        INDEX idx_status (status),
        INDEX idx_commission_type (commission_type),
        INDEX idx_created_at (created_at),
        
        FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropReferralCommissionsTable($db) {
    $sql = "DROP TABLE IF EXISTS referral_commissions";
    return $db->exec($sql);
}