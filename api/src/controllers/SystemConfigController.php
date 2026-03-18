
<?php
// src/controllers/SystemConfigController.php

require_once __DIR__ . '/../services/ConfigService.php';
require_once __DIR__ . '/../utils/Response.php';

class SystemConfigController {
    private $db;
    private $configService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->configService = new ConfigService($db);
    }
    
    public function getReferralConfig() {
        try {
            $config = $this->configService->getReferralConfig();
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $config
            ]);
        } catch (Exception $e) {
            error_log("SystemConfig error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar configurações'
            ]);
        }
    }
    
    public function updateReferralConfig() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['config_key']) || !isset($input['config_value'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Dados inválidos'
                ]);
                return;
            }
            
            $allowedKeys = [
                'referral_system_enabled',
                'referral_bonus_enabled',
                'referral_commission_enabled',
                'referral_bonus_amount', 
                'referral_commission_percentage'
            ];
            
            if (!in_array($input['config_key'], $allowedKeys)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => 'Chave de configuração não permitida'
                ]);
                return;
            }
            
            // Determinar tipo de dados
            $dataType = 'string';
            if (in_array($input['config_key'], ['referral_system_enabled', 'referral_bonus_enabled', 'referral_commission_enabled'])) {
                $dataType = 'boolean';
            } elseif (in_array($input['config_key'], ['referral_bonus_amount', 'referral_commission_percentage'])) {
                $dataType = 'decimal';
            }
            
            $success = $this->configService->set($input['config_key'], $input['config_value'], null, $dataType);
            
            if ($success) {
                $this->configService->clearCache($input['config_key']);
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Configuração atualizada com sucesso'
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'message' => 'Erro ao atualizar configuração'
                ]);
            }
        } catch (Exception $e) {
            error_log("SystemConfig update error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar configuração'
            ]);
        }
    }
}
