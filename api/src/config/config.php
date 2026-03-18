
<?php
// src/config/config.php

require_once __DIR__ . '/../../config/conexao.php';

class Config {
    private static $config = null;
    
    public static function load() {
        if (self::$config === null) {
            self::$config = [
                // Database Configuration - USANDO CONEXAO.PHP
                'database' => [
                    'host' => defined('DB_HOST') ? DB_HOST : ($_ENV['DB_HOST'] ?? 'localhost'),
                    'name' => defined('DB_NAME') ? DB_NAME : ($_ENV['DB_NAME'] ?? 'apipainel_db'),
                    'user' => defined('DB_USER') ? DB_USER : ($_ENV['DB_USER'] ?? 'root'),
                    'pass' => defined('DB_PASS') ? DB_PASS : ($_ENV['DB_PASS'] ?? ''),
                    'charset' => defined('DB_CHARSET') ? DB_CHARSET : 'utf8mb4',
                    'options' => [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_EMULATE_PREPARES => false
                    ]
                ],
                
                // Application Configuration
                'app' => [
                    'name' => 'API Painel',
                    'version' => '1.0.0',
                    'env' => $_ENV['APP_ENV'] ?? 'development',
                    'debug' => $_ENV['APP_DEBUG'] ?? true,
                    'url' => $_ENV['APP_URL'] ?? 'http://localhost',
                    'timezone' => 'America/Sao_Paulo'
                ],
                
                // JWT Configuration
                'jwt' => [
                    'secret' => $_ENV['JWT_SECRET'] ?? 'your-secret-key-here',
                    'expiration' => $_ENV['JWT_EXPIRATION'] ?? 3600,
                    'algorithm' => 'HS256'
                ],
                
                // Email Configuration
                'email' => [
                    'smtp_host' => $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com',
                    'smtp_port' => $_ENV['SMTP_PORT'] ?? 587,
                    'smtp_username' => $_ENV['SMTP_USERNAME'] ?? '',
                    'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? '',
                    'smtp_encryption' => $_ENV['SMTP_ENCRYPTION'] ?? 'tls',
                    'from_email' => $_ENV['FROM_EMAIL'] ?? 'noreply@apipainel.com',
                    'from_name' => $_ENV['FROM_NAME'] ?? 'API Painel'
                ],
                
                // PIX Configuration
                'pix' => [
                    'key' => $_ENV['PIX_KEY'] ?? '',
                    'bank_code' => $_ENV['PIX_BANK_CODE'] ?? '001',
                    'account' => $_ENV['PIX_ACCOUNT'] ?? ''
                ],
                
                // API Configuration
                'api' => [
                    'rate_limit' => $_ENV['API_RATE_LIMIT'] ?? 100,
                    'timeout' => $_ENV['API_TIMEOUT'] ?? 30,
                    'version' => 'v1'
                ],
                
                // Security Configuration
                'security' => [
                    'password_min_length' => 8,
                    'session_lifetime' => 86400,
                    'max_login_attempts' => 5,
                    'lockout_duration' => 900
                ],
                
                // Cache Configuration
                'cache' => [
                    'driver' => 'file',
                    'ttl' => 3600,
                    'path' => '../storage/cache/'
                ],
                
                // Storage Configuration
                'storage' => [
                    'logs' => '../storage/logs/',
                    'uploads' => '../storage/uploads/',
                    'backups' => '../storage/backups/',
                    'temp' => '../storage/temp/'
                ]
            ];
        }
        
        return self::$config;
    }
    
    public static function get($key, $default = null) {
        $config = self::load();
        $keys = explode('.', $key);
        $value = $config;
        
        foreach ($keys as $k) {
            if (!isset($value[$k])) {
                return $default;
            }
            $value = $value[$k];
        }
        
        return $value;
    }
}
