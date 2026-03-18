
<?php
// src/utils/Encryption.php

class Encryption {
    private $key;
    private $cipher;
    
    public function __construct($key = null) {
        $this->key = $key ?? $_ENV['ENCRYPTION_KEY'] ?? 'default_key_change_in_production';
        $this->cipher = 'AES-256-CBC';
    }
    
    public function encrypt($data) {
        $ivlen = openssl_cipher_iv_length($this->cipher);
        $iv = openssl_random_pseudo_bytes($ivlen);
        $encrypted = openssl_encrypt($data, $this->cipher, $this->key, 0, $iv);
        
        return base64_encode($iv . $encrypted);
    }
    
    public function decrypt($data) {
        $data = base64_decode($data);
        $ivlen = openssl_cipher_iv_length($this->cipher);
        $iv = substr($data, 0, $ivlen);
        $encrypted = substr($data, $ivlen);
        
        return openssl_decrypt($encrypted, $this->cipher, $this->key, 0, $iv);
    }
    
    public function hash($data) {
        return hash('sha256', $data . $this->key);
    }
    
    public function verifyHash($data, $hash) {
        return hash_equals($hash, $this->hash($data));
    }
    
    public function generateKey($length = 32) {
        return bin2hex(random_bytes($length));
    }
    
    public function encryptArray($array) {
        return $this->encrypt(json_encode($array));
    }
    
    public function decryptArray($encrypted) {
        $decrypted = $this->decrypt($encrypted);
        return $decrypted ? json_decode($decrypted, true) : null;
    }
    
    public function encryptFile($inputFile, $outputFile) {
        $data = file_get_contents($inputFile);
        $encrypted = $this->encrypt($data);
        return file_put_contents($outputFile, $encrypted) !== false;
    }
    
    public function decryptFile($inputFile, $outputFile) {
        $encrypted = file_get_contents($inputFile);
        $decrypted = $this->decrypt($encrypted);
        
        if ($decrypted === false) {
            return false;
        }
        
        return file_put_contents($outputFile, $decrypted) !== false;
    }
}
