
<?php
// src/services/ReferralLookupService.php

class ReferralLookupService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function findIndicadorIdByCode($codigoIndicacao) {
        try {
            if (empty($codigoIndicacao)) {
                return null;
            }
            
            $query = "SELECT id FROM users WHERE codigo_indicacao = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$codigoIndicacao]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                error_log("REFERRAL_LOOKUP: Código {$codigoIndicacao} encontrado, indicador ID: {$result['id']}");
                return $result['id'];
            }
            
            error_log("REFERRAL_LOOKUP: Código {$codigoIndicacao} não encontrado");
            return null;
            
        } catch (Exception $e) {
            error_log("REFERRAL_LOOKUP ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    public function createReferralRecord($indicadoId, $indicadorId, $codigoUsado = null) {
        try {
            $query = "INSERT INTO indicacoes (indicador_id, indicado_id, codigo_usado, created_at) VALUES (?, ?, ?, NOW())";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$indicadorId, $indicadoId, $codigoUsado]);
            
            if ($result) {
                error_log("REFERRAL_RECORD: Registro de indicação criado - Indicador: {$indicadorId}, Indicado: {$indicadoId}");
            }
            
            return $result;
            
        } catch (Exception $e) {
            error_log("REFERRAL_RECORD ERROR: " . $e->getMessage());
            return false;
        }
    }
}
