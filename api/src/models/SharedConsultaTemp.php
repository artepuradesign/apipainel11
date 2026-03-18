<?php
// src/models/SharedConsultaTemp.php

class SharedConsultaTemp {
    private $db;
    private $table = 'shared_consultas_temp';

    public function __construct($db) {
        $this->db = $db;
    }

    public function ensureTable() {
        $query = "CREATE TABLE IF NOT EXISTS {$this->table} (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            share_key VARCHAR(64) NOT NULL UNIQUE,
            consultation_cpf VARCHAR(20) NULL,
            payload LONGTEXT NOT NULL,
            created_by INT NULL,
            expires_at DATETIME NOT NULL,
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_share_key (share_key),
            INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

        $stmt = $this->db->prepare($query);
        $stmt->execute();
    }

    public function deactivateExpired() {
        $query = "UPDATE {$this->table} SET is_active = 0 WHERE is_active = 1 AND expires_at <= NOW()";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
    }

    public function create($shareKey, $payloadJson, $expiresAt, $createdBy = null, $consultationCpf = null) {
        $query = "INSERT INTO {$this->table} (share_key, consultation_cpf, payload, created_by, expires_at)
                  VALUES (?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $shareKey,
            $consultationCpf,
            $payloadJson,
            $createdBy,
            $expiresAt
        ]);

        return $this->db->lastInsertId();
    }

    public function getActiveByKey($shareKey) {
        $query = "SELECT id, share_key, consultation_cpf, payload, expires_at, created_at
                  FROM {$this->table}
                  WHERE share_key = ?
                    AND is_active = 1
                    AND expires_at > NOW()
                  LIMIT 1";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$shareKey]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
