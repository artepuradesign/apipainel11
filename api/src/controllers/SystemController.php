<?php
// src/controllers/SystemController.php

require_once __DIR__ . '/../utils/Response.php';

class SystemController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getReferralConfig() {
        try {
            error_log("SYSTEM: Buscando configurações de indicação");
            
            require_once __DIR__ . '/../services/ReferralConfigService.php';
            $configService = new ReferralConfigService($this->db);
            $dbConfig = $configService->getReferralConfig();
            
            // Formatar resposta para o frontend
            $config = [
                'referral_system_enabled' => true,
                'referral_bonus_enabled' => true,
                'referral_commission_enabled' => false,
                'referral_bonus_amount' => $dbConfig['referral_bonus_amount'],
                'referral_commission_percentage' => $dbConfig['referral_commission_percentage'] ?? 0.0
            ];
            
            error_log("SYSTEM: Configurações carregadas - " . json_encode($config));
            Response::success($config, 'Configurações de indicação carregadas com sucesso');
            
        } catch (Exception $e) {
            error_log("SYSTEM CONFIG ERROR: " . $e->getMessage());
            Response::error('Erro ao carregar configurações: ' . $e->getMessage(), 500);
        }
    }
}