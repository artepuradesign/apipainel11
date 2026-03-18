<?php
// src/models/RevendasModel.php

require_once __DIR__ . '/BaseModel.php';

class RevendasModel extends BaseModel {
    protected $table = 'revendas';
    
    /**
     * Buscar por código de revenda
     */
    public function findByCode($code) {
        $query = "SELECT * FROM {$this->table} WHERE codigo_revenda = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$code]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Buscar por ID do indicado
     */
    public function findByIndicadoId($indicadoId) {
        $query = "SELECT * FROM {$this->table} WHERE indicado_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$indicadoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Buscar todas as revendas de um revendedor
     */
    public function findByRevendedorId($revendedorId) {
        $query = "
            SELECT 
                r.*,
                u.nome as indicado_nome,
                u.email as indicado_email,
                u.created_at as indicado_cadastro
            FROM {$this->table} r
            LEFT JOIN users u ON r.indicado_id = u.id
            WHERE r.revendedor_id = ?
            ORDER BY r.created_at DESC
        ";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$revendedorId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Atualizar status e dados de comissão
     */
    public function updateCommission($id, $planId, $planValue, $commissionAmount) {
        $query = "
            UPDATE {$this->table} 
            SET 
                status = 'ativo',
                plano_contratado_id = ?,
                valor_plano = ?,
                comissao_paga = ?,
                total_comissao = total_comissao + ?,
                data_ativacao_plano = NOW(),
                data_pagamento_comissao = NOW(),
                updated_at = NOW()
            WHERE id = ?
        ";
        
        $stmt = $this->db->prepare($query);
        return $stmt->execute([
            $planId,
            $planValue,
            $commissionAmount,
            $commissionAmount,
            $id
        ]);
    }
    
    /**
     * Estatísticas do revendedor
     */
    public function getRevendasStats($revendedorId) {
        $query = "
            SELECT 
                COUNT(*) as total_indicados,
                SUM(CASE WHEN status = 'ativo' THEN 1 ELSE 0 END) as indicados_ativos,
                SUM(total_comissao) as total_comissao,
                SUM(CASE 
                    WHEN YEAR(data_pagamento_comissao) = YEAR(NOW()) 
                    AND MONTH(data_pagamento_comissao) = MONTH(NOW()) 
                    THEN comissao_paga 
                    ELSE 0 
                END) as comissao_mes_atual
            FROM {$this->table}
            WHERE revendedor_id = ?
        ";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$revendedorId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
