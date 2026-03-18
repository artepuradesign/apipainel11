<?php
// src/services/BonusConfigService.php

class BonusConfigService {
    private static $instance = null;
    private $bonusCache = null;
    private $lastFetch = 0;
    private $cacheDuration = 300; // 5 minutes
    
    private function __construct() {}
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Obtém o valor do bônus do arquivo bonus.php
     */
    public function getBonusAmount() {
        try {
            // Verificar cache
            if ($this->bonusCache !== null && (time() - $this->lastFetch < $this->cacheDuration)) {
                error_log("BONUS_CONFIG_SERVICE: Usando valor do cache: " . $this->bonusCache);
                return $this->bonusCache;
            }
            
            // Caminho para o arquivo bonus.php
            $bonusFilePath = __DIR__ . '/../../config/bonus.php';
            
            if (!file_exists($bonusFilePath)) {
                error_log("BONUS_CONFIG_SERVICE ERROR: Arquivo bonus.php não encontrado em: " . $bonusFilePath);
                return 5.00; // Fallback
            }
            
            // Fazer requisição interna para o arquivo
            $baseUrl = $this->getBaseUrl();
            $url = $baseUrl . '/config/bonus.php';
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 10);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($httpCode === 200 && $response) {
                $data = json_decode($response, true);
                if (isset($data['bonus'])) {
                    $bonusValue = (float)$data['bonus'];
                    
                    // Atualizar cache
                    $this->bonusCache = $bonusValue;
                    $this->lastFetch = time();
                    
                    error_log("BONUS_CONFIG_SERVICE: Valor obtido do bonus.php: " . $bonusValue);
                    return $bonusValue;
                }
            }
            
            error_log("BONUS_CONFIG_SERVICE ERROR: Resposta inválida do bonus.php");
            return 5.00; // Fallback
            
        } catch (Exception $e) {
            error_log("BONUS_CONFIG_SERVICE ERROR: " . $e->getMessage());
            return 5.00; // Fallback
        }
    }
    
    /**
     * Força atualização do cache
     */
    public function refreshCache() {
        $this->bonusCache = null;
        $this->lastFetch = 0;
        return $this->getBonusAmount();
    }
    
    /**
     * Obtém a URL base do sistema
     */
    private function getBaseUrl() {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $path = dirname($_SERVER['SCRIPT_NAME'] ?? '');
        
        // Remover /api do path se existir
        $path = str_replace('/api', '', $path);
        
        return $protocol . $host . $path . '/api';
    }
}