<?php
// src/migrations/create_system_config_table.php

function createSystemConfigTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS system_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE,
        config_value TEXT NOT NULL,
        config_description TEXT DEFAULT NULL,
        data_type ENUM('string', 'integer', 'decimal', 'boolean', 'json') DEFAULT 'string',
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_config_key (config_key),
        INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    return $db->exec($sql);
}

function seedSystemConfigData($db) {
    $configs = [
        [
            'config_key' => 'referral_system_enabled',
            'config_value' => 'true',
            'config_description' => 'Ativar/desativar sistema de indicações completo',
            'data_type' => 'boolean'
        ],
        [
            'config_key' => 'referral_bonus_enabled',
            'config_value' => 'true',
            'config_description' => 'Ativar/desativar bônus de indicação',
            'data_type' => 'boolean'
        ],
        [
            'config_key' => 'referral_commission_enabled',
            'config_value' => 'true',
            'config_description' => 'Ativar/desativar comissões de indicação',
            'data_type' => 'boolean'
        ],
        [
            'config_key' => 'referral_bonus_amount',
            'config_value' => '5.00',
            'config_description' => 'Valor do bônus de indicação para indicador e indicado',
            'data_type' => 'decimal'
        ],
        [
            'config_key' => 'referral_commission_percentage',
            'config_value' => '5.0',
            'config_description' => 'Percentual de comissão sobre recargas de indicados',
            'data_type' => 'decimal'
        ],
        [
            'config_key' => 'maintenance_mode',
            'config_value' => 'false',
            'config_description' => 'Ativar/desativar modo de manutenção',
            'data_type' => 'boolean'
        ],
        [
            'config_key' => 'registration_enabled',
            'config_value' => 'true',
            'config_description' => 'Permitir novos registros de usuários',
            'data_type' => 'boolean'
        ]
    ];
    
    foreach ($configs as $config) {
        $checkQuery = "SELECT id FROM system_config WHERE config_key = ?";
        $stmt = $db->prepare($checkQuery);
        $stmt->execute([$config['config_key']]);
        
        if (!$stmt->fetch()) {
            $insertQuery = "INSERT INTO system_config (config_key, config_value, config_description, data_type) VALUES (?, ?, ?, ?)";
            $insertStmt = $db->prepare($insertQuery);
            $insertStmt->execute([
                $config['config_key'],
                $config['config_value'],
                $config['config_description'],
                $config['data_type']
            ]);
        }
    }
    
    return true;
}

function dropSystemConfigTable($db) {
    $sql = "DROP TABLE IF EXISTS system_config";
    return $db->exec($sql);
}