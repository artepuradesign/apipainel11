
<?php
// src/services/CacheService.php

class CacheService {
    private $cacheDir;
    private $defaultTTL;
    
    public function __construct($cacheDir = null, $defaultTTL = 3600) {
        $this->cacheDir = $cacheDir ?? __DIR__ . '/../../storage/cache';
        $this->defaultTTL = $defaultTTL;
        $this->ensureCacheDirectory();
    }
    
    public function get($key) {
        $cacheFile = $this->getCacheFilePath($key);
        
        if (!file_exists($cacheFile)) {
            return null;
        }
        
        $data = json_decode(file_get_contents($cacheFile), true);
        
        if (!$data || $data['expires'] < time()) {
            unlink($cacheFile);
            return null;
        }
        
        return $data['value'];
    }
    
    public function set($key, $value, $ttl = null) {
        $ttl = $ttl ?? $this->defaultTTL;
        $cacheFile = $this->getCacheFilePath($key);
        
        $data = [
            'value' => $value,
            'expires' => time() + $ttl,
            'created' => time()
        ];
        
        return file_put_contents($cacheFile, json_encode($data), LOCK_EX) !== false;
    }
    
    public function delete($key) {
        $cacheFile = $this->getCacheFilePath($key);
        
        if (file_exists($cacheFile)) {
            return unlink($cacheFile);
        }
        
        return true;
    }
    
    public function clear($pattern = '*') {
        $files = glob($this->cacheDir . '/' . $pattern . '.cache');
        
        foreach ($files as $file) {
            unlink($file);
        }
        
        return true;
    }
    
    public function remember($key, $callback, $ttl = null) {
        $value = $this->get($key);
        
        if ($value !== null) {
            return $value;
        }
        
        $value = $callback();
        $this->set($key, $value, $ttl);
        
        return $value;
    }
    
    public function increment($key, $value = 1, $ttl = null) {
        $current = $this->get($key) ?? 0;
        $new = $current + $value;
        $this->set($key, $new, $ttl);
        return $new;
    }
    
    public function decrement($key, $value = 1, $ttl = null) {
        return $this->increment($key, -$value, $ttl);
    }
    
    private function getCacheFilePath($key) {
        return $this->cacheDir . '/' . md5($key) . '.cache';
    }
    
    private function ensureCacheDirectory() {
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    public function getStats() {
        $files = glob($this->cacheDir . '/*.cache');
        $totalSize = 0;
        $totalFiles = count($files);
        $expiredFiles = 0;
        
        foreach ($files as $file) {
            $totalSize += filesize($file);
            
            $data = json_decode(file_get_contents($file), true);
            if ($data && $data['expires'] < time()) {
                $expiredFiles++;
            }
        }
        
        return [
            'total_files' => $totalFiles,
            'total_size' => $totalSize,
            'expired_files' => $expiredFiles
        ];
    }
    
    public function cleanExpired() {
        $files = glob($this->cacheDir . '/*.cache');
        $cleaned = 0;
        
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            
            if (!$data || $data['expires'] < time()) {
                unlink($file);
                $cleaned++;
            }
        }
        
        return $cleaned;
    }
}
