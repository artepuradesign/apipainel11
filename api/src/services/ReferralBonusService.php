<?php
// src/services/ReferralBonusService.php

require_once __DIR__ . '/ReferralConfigService.php';
require_once __DIR__ . '/ReferralTransactionService.php';

class ReferralBonusService {
    private $db;
    private $referralConfigService;
    private $referralTransactionService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->referralConfigService = new ReferralConfigService($db);
        $this->referralTransactionService = new ReferralTransactionService($db);
    }
    
    // MÉTODO OBSOLETO - Agora o bônus é creditado imediatamente no registro
    public function processFirstLoginBonus($userId) {
        error_log("FIRST_LOGIN_BONUS: MÉTODO OBSOLETO - Bônus já é processado no registro");
        
        // Verificar se usuário tem indicação e se bônus já foi processado
        $referralData = $this->getActiveReferralForUser($userId);
        if (!$referralData) {
            return ['success' => false, 'message' => 'Nenhuma indicação encontrada'];
        }
        
        if ($referralData['first_login_bonus_processed']) {
            return ['success' => false, 'message' => 'Bônus já foi processado no registro'];
        }
        
        // Se chegou aqui, é porque o usuário tem indicação mas o bônus não foi processado
        // Vamos processar agora usando o novo serviço
        error_log("FIRST_LOGIN_BONUS: Processando bônus em atraso para usuário {$userId}");
        
        return $this->referralTransactionService->processRegistrationBonus(
            $referralData['indicador_id'],
            $userId,
            $referralData['codigo_usado']
        );
    }
    
    private function getActiveReferralForUser($userId) {
        try {
            $query = "SELECT * FROM indicacoes WHERE indicado_id = ? AND status = 'ativo' LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error getting active referral: " . $e->getMessage());
            return null;
        }
    }
    
    // Método para obter estatísticas de indicação
    public function getUserReferralStats($userId) {
        return $this->referralTransactionService->getReferralStats($userId);
    }
    
    // Método para validar código de indicação
    public function validateReferralCode($codigo) {
        return $this->referralTransactionService->validateReferralCode($codigo);
    }
    
    // Método para obter configurações de indicação
    public function getReferralConfig() {
        return $this->referralConfigService->getReferralConfig();
    }
}