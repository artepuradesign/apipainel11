<?php
// src/services/SystemConfigService.php

class SystemConfigService {
    private $db;
    private $cache = [];
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Get a specific configuration value by key
     */
    public function getConfigValue($key, $default = null) {
        try {
            // Check cache first
            if (isset($this->cache[$key])) {
                return $this->cache[$key];
            }
            
            $query = "SELECT config_value, config_type FROM system_config WHERE config_key = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$key]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $value = $this->castValue($result['config_value'], $result['config_type']);
                
                // Cache the result
                $this->cache[$key] = $value;
                
                return $value;
            }
            
            return $default;
            
        } catch (Exception $e) {
            error_log("SystemConfigService::getConfigValue error for key {$key}: " . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * Get referral bonus amount from bonus.php file
     */
    public function getReferralBonusAmount() {
        $bonusConfigService = BonusConfigService::getInstance();
        return $bonusConfigService->getBonusAmount();
    }
    
    /**
     * Get multiple config values
     */
    public function getMultipleConfigs($keys) {
        try {
            $placeholders = str_repeat('?,', count($keys) - 1) . '?';
            $query = "SELECT config_key, config_value, config_type FROM system_config WHERE config_key IN ($placeholders)";
            $stmt = $this->db->prepare($query);
            $stmt->execute($keys);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $configs = [];
            foreach ($results as $row) {
                $configs[$row['config_key']] = $this->castValue($row['config_value'], $row['config_type']);
            }
            
            return $configs;
            
        } catch (Exception $e) {
            error_log("SystemConfigService::getMultipleConfigs error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Get all system configurations
     */
    public function getAllConfigs($category = null) {
        try {
            $query = "SELECT config_key, config_value, config_type, category, description, is_public FROM system_config";
            $params = [];
            
            if ($category) {
                $query .= " WHERE category = ?";
                $params[] = $category;
            }
            
            $query .= " ORDER BY category, config_key";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $configs = [];
            foreach ($results as $row) {
                $configs[] = [
                    'config_key' => $row['config_key'],
                    'config_value' => $this->castValue($row['config_value'], $row['config_type']),
                    'config_type' => $row['config_type'],
                    'category' => $row['category'],
                    'description' => $row['description'],
                    'is_public' => (bool)$row['is_public']
                ];
            }
            
            return $configs;
            
        } catch (Exception $e) {
            error_log("SystemConfigService::getAllConfigs error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Update a configuration value (com upsert)
     */
    public function updateConfig($key, $value, $type = null) {
        try {
            unset($this->cache[$key]);

            if ($type === null) {
                $query = "SELECT config_type FROM system_config WHERE config_key = ?";
                $stmt = $this->db->prepare($query);
                $stmt->execute([$key]);
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                $type = $result ? $result['config_type'] : 'string';
            }

            $stringValue = $this->valueToString($value, $type);

            $updateQuery = "UPDATE system_config SET config_value = ?, config_type = ?, updated_at = NOW() WHERE config_key = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$stringValue, $type, $key]);

            if ($updateStmt->rowCount() > 0) {
                return true;
            }

            $insertQuery = "INSERT INTO system_config (config_key, config_value, config_type, category, description, is_public) VALUES (?, ?, ?, ?, ?, 0)
                            ON DUPLICATE KEY UPDATE config_value = VALUES(config_value), config_type = VALUES(config_type), updated_at = NOW()";
            $insertStmt = $this->db->prepare($insertQuery);

            return $insertStmt->execute([
                $key,
                $stringValue,
                $type,
                $this->inferCategoryFromKey($key),
                'Configuração criada automaticamente via painel administrativo'
            ]);

        } catch (Exception $e) {
            error_log("SystemConfigService::updateConfig error for key {$key}: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Clear cache
     */
    public function clearCache($key = null) {
        if ($key) {
            unset($this->cache[$key]);
        } else {
            $this->cache = [];
        }
    }

    /**
     * Cast string value to appropriate type
     */
    private function castValue($value, $type) {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
            case 'decimal':
            case 'float':
                return (float) $value;
            case 'integer':
                return (int) $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }

    /**
     * Infer category for new config keys
     */
    private function inferCategoryFromKey($key) {
        if (strpos($key, 'contact_') === 0) {
            return 'contacts';
        }

        if (strpos($key, 'referral_') === 0) {
            return 'referral';
        }

        if (in_array($key, ['max_login_attempts', 'session_timeout'])) {
            return 'security';
        }

        if (in_array($key, ['default_user_balance'])) {
            return 'financial';
        }

        if (in_array($key, ['maintenance_mode', 'registration_enabled'])) {
            return 'system';
        }

        return 'general';
    }

    /**
     * Convert value to string for storage
     */
    private function valueToString($value, $type) {
        switch ($type) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN) ? 'true' : 'false';
            case 'json':
                return json_encode($value);
            default:
                return (string) $value;
        }
    }
}