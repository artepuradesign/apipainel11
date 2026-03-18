<?php
// src/models/RevendaStatusModel.php

require_once __DIR__ . '/BaseModel.php';

class RevendaStatusModel extends BaseModel {
    protected $table = 'revenda_status';
    
    /**
     * Buscar status por ID do usuário
     */
    public function findByUserId($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Verificar se o usuário está ativo no programa
     */
    public function isActive($userId) {
        $status = $this->findByUserId($userId);
        return $status && $status['is_active'] == 1;
    }
}
