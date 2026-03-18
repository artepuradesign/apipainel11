
<?php
// src/migrations/create_transactions_table.php

function createTransactionsTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS transacoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        tipo ENUM('credito', 'debito') NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        descricao TEXT,
        status ENUM('pendente', 'concluida', 'cancelada') DEFAULT 'pendente',
        reference VARCHAR(255),
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_user_id (user_id),
        INDEX idx_tipo (tipo),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_reference (reference),
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function dropTransactionsTable($db) {
    $sql = "DROP TABLE IF EXISTS transacoes";
    return $db->exec($sql);
}
?>
