
<?php
// src/models/Referral.php

require_once 'BaseModel.php';

class Referral extends BaseModel {
    protected $table = 'indicacoes';
    
    public $id;
    public $referrer_id;
    public $referred_id;
    public $codigo;
    public $status;
    public $comissao;
    public $data_conversao;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserReferrals($userId) {
        error_log("REFERRAL_MODEL: Buscando indicações para usuário ID: {$userId}");
        
        // Query principal para buscar indicações da tabela indicacoes
        $query = "SELECT 
                    i.id,
                    i.indicador_id as referrer_id,
                    i.indicado_id as referred_id,
                    i.codigo_usado as codigo,
                    i.status,
                    i.bonus_indicador as comissao,
                    i.bonus_indicado,
                    i.bonus_paid,
                    i.bonus_paid_at as data_conversao,
                    CASE WHEN i.bonus_paid = 1 THEN 1 ELSE 0 END as first_login_bonus_processed,
                    i.created_at,
                    i.updated_at,
                    u.full_name,
                    u.email,
                    u.created_at as indicado_cadastro
                 FROM {$this->table} i
                 LEFT JOIN users u ON i.indicado_id = u.id
                 WHERE i.indicador_id = ?
                 ORDER BY i.created_at DESC";
        
        try {
            error_log("REFERRAL_MODEL: Executando query principal com tabela users");
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("REFERRAL_MODEL: Encontrados " . count($results) . " resultados com users");
            
            // Se não encontrou com 'users', tentar com 'usuarios'
            if (empty($results)) {
                error_log("REFERRAL_MODEL: Tentando com tabela usuarios");
                $queryAlt = "SELECT 
                            i.id,
                            i.indicador_id as referrer_id,
                            i.indicado_id as referred_id,
                            i.codigo_usado as codigo,
                            i.status,
                            i.bonus_indicador as comissao,
                            i.bonus_indicado,
                            i.bonus_paid,
                            i.bonus_paid_at as data_conversao,
                            CASE WHEN i.bonus_paid = 1 THEN 1 ELSE 0 END as first_login_bonus_processed,
                            i.created_at,
                            i.updated_at,
                            u.full_name,
                            u.email,
                            u.created_at as indicado_cadastro
                         FROM {$this->table} i
                         LEFT JOIN usuarios u ON i.indicado_id = u.id
                         WHERE i.indicador_id = ?
                         ORDER BY i.created_at DESC";
                
                $stmtAlt = $this->db->prepare($queryAlt);
                $stmtAlt->execute([$userId]);
                $results = $stmtAlt->fetchAll(PDO::FETCH_ASSOC);
                
                error_log("REFERRAL_MODEL: Encontrados " . count($results) . " resultados com usuarios");
            }
            
            // Se ainda não encontrou, buscar apenas da tabela indicacoes
            if (empty($results)) {
                error_log("REFERRAL_MODEL: Buscando apenas da tabela indicacoes");
                $querySimple = "SELECT 
                                i.id,
                                i.indicador_id as referrer_id,
                                i.indicado_id as referred_id,
                                i.codigo_usado as codigo,
                                i.status,
                                i.bonus_indicador as comissao,
                                i.bonus_indicado,
                                i.bonus_paid,
                                i.bonus_paid_at as data_conversao,
                                CASE WHEN i.bonus_paid = 1 THEN 1 ELSE 0 END as first_login_bonus_processed,
                                i.created_at,
                                i.updated_at,
                                CONCAT('Usuário ', i.indicado_id) as full_name,
                                '' as email,
                                i.created_at as indicado_cadastro
                             FROM {$this->table} i
                             WHERE i.indicador_id = ?
                             ORDER BY i.created_at DESC";
                
                $stmtSimple = $this->db->prepare($querySimple);
                $stmtSimple->execute([$userId]);
                $results = $stmtSimple->fetchAll(PDO::FETCH_ASSOC);
                
                error_log("REFERRAL_MODEL: Encontrados " . count($results) . " resultados apenas indicacoes");
            }
            
            error_log("REFERRAL_MODEL: Retornando " . count($results) . " indicações");
            return $results;
            
        } catch (PDOException $e) {
            error_log("REFERRAL_MODEL ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function getTotalCommissions($userId) {
        $query = "SELECT SUM(bonus_indicador) as total FROM {$this->table} 
                 WHERE indicador_id = ? AND status = 'ativo' AND bonus_paid = 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result['total'] ?? 0;
    }
    
    public function validateReferralCode($codigo) {
        // Tentar primeiro com tabela users
        $query = "SELECT id FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$codigo]);
        $result = $stmt->fetch();
        
        // Se não encontrou, tentar com usuarios
        if (!$result) {
            $query = "SELECT id FROM usuarios WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$codigo]);
            $result = $stmt->fetch();
        }
        
        return $result;
    }
}
