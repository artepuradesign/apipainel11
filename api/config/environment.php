
<?php
// config/environment.php

class Environment {
    private static $loaded = false;
    private static $vars = [];
    
    public static function load($filePath) {
        if (self::$loaded) {
            return;
        }
        
        if (!file_exists($filePath)) {
            error_log("Environment file not found: " . $filePath);
            return;
        }
        
        $lines = file($filePath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue; // Skip comments
            }
            
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove quotes if present
            if (preg_match('/^"(.*)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match("/^'(.*)'$/", $value, $matches)) {
                $value = $matches[1];
            }
            
            self::$vars[$name] = $value;
            $_ENV[$name] = $value;
            putenv("$name=$value");
        }
        
        self::$loaded = true;
    }
    
    public static function get($key, $default = null) {
        return isset(self::$vars[$key]) ? self::$vars[$key] : $default;
    }
}
?>
