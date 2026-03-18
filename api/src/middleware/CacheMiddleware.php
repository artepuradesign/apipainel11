
<?php
// src/middleware/CacheMiddleware.php

class CacheMiddleware {
    private $cacheDir;
    private $defaultTTL;
    
    public function __construct($cacheDir = null, $defaultTTL = 3600) {
        $this->cacheDir = $cacheDir ?? __DIR__ . '/../../storage/cache';
        $this->defaultTTL = $defaultTTL;
        $this->ensureCacheDirectory();
    }
    
    public function handle($cacheKey = null, $ttl = null) {
        if (!$cacheKey) {
            $cacheKey = $this->generateCacheKey();
        }
        
        $ttl = $ttl ?? $this->defaultTTL;
        
        // Verificar se é uma requisição GET (apenas GET são cacheáveis por padrão)
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            return false;
        }
        
        // Verificar se existe cache válido
        $cachedData = $this->getCache($cacheKey);
        if ($cachedData !== false) {
            $this->sendCachedResponse($cachedData);
            return true;
        }
        
        // Iniciar buffer de saída para capturar resposta
        ob_start();
        
        // Registrar callback para salvar cache ao final
        register_shutdown_function(function() use ($cacheKey, $ttl) {
            $this->saveCacheOnShutdown($cacheKey, $ttl);
        });
        
        return false;
    }
    
    public function getCache($key) {
        $cacheFile = $this->getCacheFilePath($key);
        
        if (!file_exists($cacheFile)) {
            return false;
        }
        
        $cacheData = json_decode(file_get_contents($cacheFile), true);
        
        if (!$cacheData || $cacheData['expires'] < time()) {
            unlink($cacheFile);
            return false;
        }
        
        return $cacheData;
    }
    
    public function setCache($key, $data, $ttl = null) {
        $ttl = $ttl ?? $this->defaultTTL;
        $cacheFile = $this->getCacheFilePath($key);
        
        $cacheData = [
            'data' => $data,
            'expires' => time() + $ttl,
            'created' => time(),
            'key' => $key
        ];
        
        file_put_contents($cacheFile, json_encode($cacheData), LOCK_EX);
        return true;
    }
    
    public function deleteCache($key) {
        $cacheFile = $this->getCacheFilePath($key);
        
        if (file_exists($cacheFile)) {
            return unlink($cacheFile);
        }
        
        return true;
    }
    
    public function clearCache($pattern = '*') {
        $files = glob($this->cacheDir . '/' . $pattern . '.cache');
        
        foreach ($files as $file) {
            unlink($file);
        }
        
        return true;
    }
    
    public function cleanExpiredCache() {
        $files = glob($this->cacheDir . '/*.cache');
        $cleaned = 0;
        
        foreach ($files as $file) {
            $cacheData = json_decode(file_get_contents($file), true);
            
            if (!$cacheData || $cacheData['expires'] < time()) {
                unlink($file);
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
    
    private function generateCacheKey() {
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $query = $_SERVER['QUERY_STRING'] ?? '';
        $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
        
        // Incluir parâmetros relevantes na chave
        $keyData = [
            'uri' => $uri,
            'query' => $query,
            'method' => $_SERVER['REQUEST_METHOD'],
            'user_agent_hash' => md5($userAgent)
        ];
        
        return md5(json_encode($keyData));
    }
    
    private function getCacheFilePath($key) {
        return $this->cacheDir . '/' . $key . '.cache';
    }
    
    private function sendCachedResponse($cacheData) {
        // Headers de cache
        header('X-Cache: HIT');
        header('X-Cache-Created: ' . date('Y-m-d H:i:s', $cacheData['created']));
        header('X-Cache-Expires: ' . date('Y-m-d H:i:s', $cacheData['expires']));
        header('Content-Type: application/json');
        
        // Enviar dados em cache
        echo json_encode($cacheData['data']);
        exit;
    }
    
    private function saveCacheOnShutdown($cacheKey, $ttl) {
        $output = ob_get_contents();
        
        if ($output && http_response_code() === 200) {
            // Tentar decodificar JSON para verificar se é válido
            $data = json_decode($output, true);
            
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->setCache($cacheKey, $data, $ttl);
            }
        }
    }
    
    private function ensureCacheDirectory() {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    public function getCacheStats() {
        $files = glob($this->cacheDir . '/*.cache');
        $totalSize = 0;
        $totalFiles = count($files);
        $expiredFiles = 0;
        
        foreach ($files as $file) {
            $totalSize += filesize($file);
            
            $cacheData = json_decode(file_get_contents($file), true);
            if ($cacheData && $cacheData['expires'] < time()) {
                $expiredFiles++;
            }
        }
        
        return [
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'total_size_formatted' => $this->formatBytes($totalSize),
            'expired_files' => $expiredFiles,
            'cache_directory' => $this->cacheDir
        ];
    }
    
    private function formatBytes($size) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor((strlen($size) - 1) / 3);
        return sprintf("%.2f %s", $size / pow(1024, $factor), $units[$factor]);
    }
    
    public function warmupCache($endpoints = []) {
        $warmed = 0;
        
        foreach ($endpoints as $endpoint) {
            try {
                $context = stream_context_create([
                    'http' => [
                        'method' => 'GET',
                        'timeout' => 30
                    ]
                ]);
                
                $response = file_get_contents($endpoint, false, $context);
                if ($response !== false) {
                    $warmed++;
                }
            } catch (Exception $e) {
                error_log("Cache warmup failed for {$endpoint}: " . $e->getMessage());
            }
        }
        
        return $warmed;
    }
}
