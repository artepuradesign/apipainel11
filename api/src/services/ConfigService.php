<?php
// src/services/ConfigService.php

class ConfigService {
    private $db;
    private $cache = [];
    private $cacheExpiry = 300; // 5 minutes
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Get a configuration value by key
     */
    public function get($key, $default = null) {
        try {
            // Check cache first
            if (isset($this->cache[$key]) && time() < $this->cache[$key]['expires']) {
                return $this->cache[$key]['value'];
            }
            
            $query = "SELECT config_value, data_type FROM system_config WHERE config_key = ? AND status = 'active'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$key]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                $value = $this->castValue($result['config_value'], $result['data_type']);
                
                // Cache the result
                $this->cache[$key] = [
                    'value' => $value,
                    'expires' => time() + $this->cacheExpiry
                ];
                
                return $value;
            }
            
            return $default;
            
        } catch (Exception $e) {
            error_log("ConfigService::get error for key {$key}: " . $e->getMessage());
            return $default;
        }
    }
    
    /**
     * Set a configuration value
     */
    public function set($key, $value, $description = null, $dataType = 'string') {
        try {
            // Clear cache for this key
            unset($this->cache[$key]);
            
            $stringValue = $this->valueToString($value, $dataType);
            
            // Check if key exists
            $checkQuery = "SELECT id FROM system_config WHERE config_key = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$key]);
            
            if ($checkStmt->fetch()) {
                // Update existing
                $updateQuery = "UPDATE system_config SET config_value = ?, data_type = ?, updated_at = NOW()";
                $params = [$stringValue, $dataType];
                
                if ($description !== null) {
                    $updateQuery .= ", config_description = ?";
                    $params[] = $description;
                }
                
                $updateQuery .= " WHERE config_key = ?";
                $params[] = $key;
                
                $updateStmt = $this->db->prepare($updateQuery);
                return $updateStmt->execute($params);
            } else {
                // Insert new
                $insertQuery = "INSERT INTO system_config (config_key, config_value, config_description, data_type, status, created_at) VALUES (?, ?, ?, ?, 'active', NOW())";
                $insertStmt = $this->db->prepare($insertQuery);
                return $insertStmt->execute([$key, $stringValue, $description, $dataType]);
            }
            
        } catch (Exception $e) {
            error_log("ConfigService::set error for key {$key}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get multiple configuration values
     */
    public function getMultiple($keys, $defaults = []) {
        $result = [];
        foreach ($keys as $key) {
            $default = isset($defaults[$key]) ? $defaults[$key] : null;
            $result[$key] = $this->get($key, $default);
        }
        return $result;
    }
    
    /**
     * Get all configurations by prefix
     */
    public function getByPrefix($prefix) {
        try {
            $query = "SELECT config_key, config_value, data_type FROM system_config WHERE config_key LIKE ? AND status = 'active'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$prefix . '%']);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $configs = [];
            foreach ($results as $row) {
                $configs[$row['config_key']] = $this->castValue($row['config_value'], $row['data_type']);
            }
            
            return $configs;
            
        } catch (Exception $e) {
            error_log("ConfigService::getByPrefix error for prefix {$prefix}: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Referral system specific methods
     */
    public function getReferralConfig() {
        return $this->getMultiple([
            'referral_system_enabled',
            'referral_bonus_enabled', 
            'referral_commission_enabled',
            'referral_bonus_amount',
            'referral_commission_percentage'
        ], [
            'referral_system_enabled' => true,
            'referral_bonus_enabled' => true,
            'referral_commission_enabled' => true,
            'referral_bonus_amount' => 5.00,
            'referral_commission_percentage' => 5.0
        ]);
    }
    
    public function isReferralSystemEnabled() {
        return $this->get('referral_system_enabled', true);
    }
    
    public function isReferralBonusEnabled() {
        return $this->get('referral_bonus_enabled', true) && $this->isReferralSystemEnabled();
    }
    
    public function isReferralCommissionEnabled() {
        return $this->get('referral_commission_enabled', true) && $this->isReferralSystemEnabled();
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
    private function castValue($value, $dataType) {
        switch ($dataType) {
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $value;
            case 'decimal':
                return (float) $value;
            case 'json':
                return json_decode($value, true);
            default:
                return $value;
        }
    }
    
    /**
     * Convert value to string for storage
     */
    private function valueToString($value, $dataType) {
        switch ($dataType) {
            case 'boolean':
                return $value ? 'true' : 'false';
            case 'json':
                return json_encode($value);
            default:
                return (string) $value;
        }
    }
    
    /**
     * Get all configurations for admin interface
     */
    public function getAllConfigs() {
        try {
            $query = "SELECT * FROM system_config ORDER BY config_key";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("ConfigService::getAllConfigs error: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Delete a configuration
     */
    public function delete($key) {
        try {
            unset($this->cache[$key]);
            $query = "DELETE FROM system_config WHERE config_key = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$key]);
        } catch (Exception $e) {
            error_log("ConfigService::delete error for key {$key}: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Toggle a boolean configuration
     */
    public function toggle($key) {
        $currentValue = $this->get($key, false);
        return $this->set($key, !$currentValue, null, 'boolean');
    }
}