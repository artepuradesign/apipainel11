
<?php
// src/utils/Validation.php

class Validation {
    
    public static function isValidId($id) {
        return is_numeric($id) && (int)$id > 0;
    }
    
    public static function isValidEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }
    
    public static function isValidSlug($slug) {
        return preg_match('/^[a-z0-9-]+$/', $slug);
    }
    
    public static function isValidPrice($price) {
        return is_numeric($price) && (float)$price >= 0;
    }
    
    public static function isValidUrl($url) {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }
    
    public static function sanitizeString($string) {
        return htmlspecialchars(strip_tags(trim($string)), ENT_QUOTES, 'UTF-8');
    }
    
    public static function validateRequired($data, $fields) {
        $errors = [];
        
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $errors[] = "Campo '$field' é obrigatório";
            }
        }
        
        return $errors;
    }
}
