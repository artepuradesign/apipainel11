
<?php
// src/migrations/create_pix_keys_table.php

function createPixKeysTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS pix_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        key_value VARCHAR(100) NOT NULL,
        key_type ENUM('cpf', 'cnpj', 'email', 'telefone', 'aleatoria') NOT NULL,
        is_primary BOOLEAN DEFAULT FALSE,
        status ENUM('ativa', 'inativa', 'validando') DEFAULT 'validando',
        bank_code VARCHAR(10),
        bank_name VARCHAR(100),
        account_type ENUM('corrente', 'poupanca') DEFAULT 'corrente',
        validation_token VARCHAR(255),
        validated_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_key_value (key_value),
        INDEX idx_key_type (key_type),
        INDEX idx_status (status),
        INDEX idx_is_primary (is_primary),
        
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        UNIQUE KEY unique_pix_key (key_value)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropPixKeysTable($db) {
    $sql = "DROP TABLE IF EXISTS pix_keys";
    return $db->exec($sql);
}
