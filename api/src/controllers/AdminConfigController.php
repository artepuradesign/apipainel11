<?php
// src/controllers/AdminConfigController.php

require_once __DIR__ . '/../services/ConfigService.php';
require_once __DIR__ . '/../utils/Response.php';

class AdminConfigController {
    private $db;
    private $configService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->configService = new ConfigService($db);
    }
    
    /**
     * Get all system configurations
     */
    public function getAllConfigs() {
        try {
            $configs = $this->configService->getAllConfigs();
            
            // Group configurations by category
            $grouped = [];
            foreach ($configs as $config) {
                $category = $this->getConfigCategory($config['config_key']);
                if (!isset($grouped[$category])) {
                    $grouped[$category] = [];
                }
                
                $grouped[$category][] = [
                    'key' => $config['config_key'],
                    'value' => $this->configService->get($config['config_key']),
                    'raw_value' => $config['config_value'],
                    'description' => $config['config_description'],
                    'data_type' => $config['data_type'],
                    'status' => $config['status'],
                    'created_at' => $config['created_at'],
                    'updated_at' => $config['updated_at']
                ];
            }
            
            Response::success($grouped);
            
        } catch (Exception $e) {
            error_log("AdminConfig::getAllConfigs error: " . $e->getMessage());
            Response::error('Erro ao buscar configurações', 500);
        }
    }
    
    /**
     * Update a configuration value
     */
    public function updateConfig() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['key']) || !isset($input['value'])) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $key = $input['key'];
            $value = $input['value'];
            $description = isset($input['description']) ? $input['description'] : null;
            $dataType = isset($input['data_type']) ? $input['data_type'] : 'string';
            
            // Validate configuration key
            if (!$this->isValidConfigKey($key)) {
                Response::error('Chave de configuração não permitida', 400);
                return;
            }
            
            // Validate value based on data type
            if (!$this->validateValue($value, $dataType)) {
                Response::error('Valor inválido para o tipo de dado especificado', 400);
                return;
            }
            
            $success = $this->configService->set($key, $value, $description, $dataType);
            
            if ($success) {
                // Clear cache for affected configurations
                $this->configService->clearCache($key);
                
                // If it's a referral system config, clear related cache
                if (strpos($key, 'referral_') === 0) {
                    $this->configService->clearCache();
                }
                
                Response::success([
                    'message' => 'Configuração atualizada com sucesso',
                    'key' => $key,
                    'value' => $this->configService->get($key)
                ]);
            } else {
                Response::error('Erro ao atualizar configuração', 500);
            }
            
        } catch (Exception $e) {
            error_log("AdminConfig::updateConfig error: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    /**
     * Toggle a boolean configuration
     */
    public function toggleConfig() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['key'])) {
                Response::error('Chave de configuração não informada', 400);
                return;
            }
            
            $key = $input['key'];
            
            if (!$this->isValidConfigKey($key)) {
                Response::error('Chave de configuração não permitida', 400);
                return;
            }
            
            $success = $this->configService->toggle($key);
            
            if ($success) {
                $this->configService->clearCache($key);
                
                Response::success([
                    'message' => 'Configuração alternada com sucesso',
                    'key' => $key,
                    'value' => $this->configService->get($key)
                ]);
            } else {
                Response::error('Erro ao alternar configuração', 500);
            }
            
        } catch (Exception $e) {
            error_log("AdminConfig::toggleConfig error: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    /**
     * Get referral system configurations
     */
    public function getReferralConfigs() {
        try {
            $configs = $this->configService->getReferralConfig();
            Response::success($configs);
        } catch (Exception $e) {
            error_log("AdminConfig::getReferralConfigs error: " . $e->getMessage());
            Response::error('Erro ao buscar configurações de indicação', 500);
        }
    }
    
    /**
     * Bulk update referral configurations
     */
    public function updateReferralConfigs() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !is_array($input)) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $allowedKeys = [
                'referral_system_enabled',
                'referral_bonus_enabled', 
                'referral_commission_enabled',
                'referral_bonus_amount',
                'referral_commission_percentage'
            ];
            
            $this->db->beginTransaction();
            
            try {
                foreach ($input as $key => $value) {
                    if (!in_array($key, $allowedKeys)) {
                        continue;
                    }
                    
                    $dataType = $this->getDataTypeForKey($key);
                    
                    if (!$this->validateValue($value, $dataType)) {
                        throw new Exception("Valor inválido para {$key}");
                    }
                    
                    $this->configService->set($key, $value, null, $dataType);
                }
                
                $this->db->commit();
                $this->configService->clearCache();
                
                Response::success([
                    'message' => 'Configurações de indicação atualizadas com sucesso',
                    'configs' => $this->configService->getReferralConfig()
                ]);
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("AdminConfig::updateReferralConfigs error: " . $e->getMessage());
            Response::error('Erro ao atualizar configurações: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Delete a configuration
     */
    public function deleteConfig() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input || !isset($input['key'])) {
                Response::error('Chave de configuração não informada', 400);
                return;
            }
            
            $key = $input['key'];
            
            // Protect critical configurations
            $protectedKeys = [
                'referral_system_enabled',
                'referral_bonus_enabled',
                'referral_commission_enabled',
                'referral_bonus_amount',
                'referral_commission_percentage'
            ];
            
            if (in_array($key, $protectedKeys)) {
                Response::error('Esta configuração não pode ser removida', 400);
                return;
            }
            
            $success = $this->configService->delete($key);
            
            if ($success) {
                Response::success(['message' => 'Configuração removida com sucesso']);
            } else {
                Response::error('Erro ao remover configuração', 500);
            }
            
        } catch (Exception $e) {
            error_log("AdminConfig::deleteConfig error: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    /**
     * Get configuration category for grouping
     */
    private function getConfigCategory($key) {
        if (strpos($key, 'referral_') === 0) {
            return 'referral';
        } elseif (strpos($key, 'notification_') === 0) {
            return 'notifications';
        } elseif (strpos($key, 'payment_') === 0) {
            return 'payments';
        } elseif (in_array($key, ['maintenance_mode', 'registration_enabled'])) {
            return 'system';
        }
        
        return 'general';
    }
    
    /**
     * Validate if configuration key is allowed
     */
    private function isValidConfigKey($key) {
        $allowedKeys = [
            'referral_system_enabled',
            'referral_bonus_enabled',
            'referral_commission_enabled',
            'referral_bonus_amount',
            'referral_commission_percentage',
            'maintenance_mode',
            'registration_enabled'
        ];
        
        return in_array($key, $allowedKeys);
    }
    
    /**
     * Get data type for a specific key
     */
    private function getDataTypeForKey($key) {
        $dataTypes = [
            'referral_system_enabled' => 'boolean',
            'referral_bonus_enabled' => 'boolean',
            'referral_commission_enabled' => 'boolean',
            'referral_bonus_amount' => 'decimal',
            'referral_commission_percentage' => 'decimal',
            'maintenance_mode' => 'boolean',
            'registration_enabled' => 'boolean'
        ];
        
        return isset($dataTypes[$key]) ? $dataTypes[$key] : 'string';
    }
    
    /**
     * Validate value based on data type
     */
    private function validateValue($value, $dataType) {
        switch ($dataType) {
            case 'boolean':
                return is_bool($value) || in_array($value, ['true', 'false', '1', '0', 1, 0]);
            case 'integer':
                return is_numeric($value) && is_int($value + 0);
            case 'decimal':
                return is_numeric($value);
            case 'json':
                if (is_array($value) || is_object($value)) return true;
                json_decode($value);
                return json_last_error() === JSON_ERROR_NONE;
            default:
                return true;
        }
    }
}