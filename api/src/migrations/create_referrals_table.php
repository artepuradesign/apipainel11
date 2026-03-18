
<?php
// src/migrations/create_referrals_table.php

function createReferralsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS referrals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        referrer_id INT NOT NULL,
        referred_id INT NOT NULL,
        referral_code VARCHAR(20),
        bonus_referrer DECIMAL(10,2) DEFAULT 5.00,
        bonus_referred DECIMAL(10,2) DEFAULT 5.00,
        status ENUM('ativo', 'inativo', 'processado') DEFAULT 'ativo',
        bonus_paid BOOLEAN DEFAULT FALSE,
        conversion_date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_referrer (referrer_id),
        INDEX idx_referred (referred_id),
        INDEX idx_referral_code (referral_code),
        INDEX idx_status (status),
        
        FOREIGN KEY (referrer_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (referred_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_referral (referrer_id, referred_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropReferralsTable($db) {
    $sql = "DROP TABLE IF EXISTS referrals";
    return $db->exec($sql);
}
