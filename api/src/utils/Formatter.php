
<?php
// src/utils/Formatter.php

class Formatter {
    public static function money($value, $currency = 'R$', $decimals = 2) {
        return $currency . ' ' . number_format($value, $decimals, ',', '.');
    }
    
    public static function percentage($value, $decimals = 2) {
        return number_format($value, $decimals, ',', '.') . '%';
    }
    
    public static function number($value, $decimals = 0) {
        return number_format($value, $decimals, ',', '.');
    }
    
    public static function fileSize($bytes) {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
    
    public static function maskString($string, $start = 2, $end = 2, $mask = '*') {
        $length = strlen($string);
        
        if ($length <= $start + $end) {
            return str_repeat($mask, $length);
        }
        
        return substr($string, 0, $start) . 
               str_repeat($mask, $length - $start - $end) . 
               substr($string, -$end);
    }
    
    public static function maskEmail($email) {
        $parts = explode('@', $email);
        if (count($parts) !== 2) return $email;
        
        $masked = self::maskString($parts[0], 2, 1);
        return $masked . '@' . $parts[1];
    }
    
    public static function maskCpf($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.***.$3-**', $cpf);
    }
    
    public static function maskPhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($phone) == 11) {
            return preg_replace('/(\d{2})(\d{5})(\d{4})/', '($1) $2-****', $phone);
        }
        return $phone;
    }
    
    public static function capitalizeWords($string) {
        return mb_convert_case($string, MB_CASE_TITLE, 'UTF-8');
    }
    
    public static function removeAccents($string) {
        $accents = [
            'À' => 'A', 'Á' => 'A', 'Â' => 'A', 'Ã' => 'A', 'Ä' => 'A', 'Å' => 'A',
            'à' => 'a', 'á' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'å' => 'a',
            'Ç' => 'C', 'ç' => 'c',
            'È' => 'E', 'É' => 'E', 'Ê' => 'E', 'Ë' => 'E',
            'è' => 'e', 'é' => 'e', 'ê' => 'e', 'ë' => 'e',
            'Ì' => 'I', 'Í' => 'I', 'Î' => 'I', 'Ï' => 'I',
            'ì' => 'i', 'í' => 'i', 'î' => 'i', 'ï' => 'i',
            'Ñ' => 'N', 'ñ' => 'n',
            'Ò' => 'O', 'Ó' => 'O', 'Ô' => 'O', 'Õ' => 'O', 'Ö' => 'O',
            'ò' => 'o', 'ó' => 'o', 'ô' => 'o', 'õ' => 'o', 'ö' => 'o',
            'Ù' => 'U', 'Ú' => 'U', 'Û' => 'U', 'Ü' => 'U',
            'ù' => 'u', 'ú' => 'u', 'û' => 'u', 'ü' => 'u',
            'Ý' => 'Y', 'ý' => 'y', 'ÿ' => 'y'
        ];
        
        return strtr($string, $accents);
    }
    
    public static function cleanNumeric($value) {
        return preg_replace('/[^0-9]/', '', $value);
    }
    
    public static function onlyAlphanumeric($value) {
        return preg_replace('/[^a-zA-Z0-9]/', '', $value);
    }
    
    public static function formatJson($data, $prettyPrint = true) {
        $flags = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
        if ($prettyPrint) {
            $flags |= JSON_PRETTY_PRINT;
        }
        return json_encode($data, $flags);
    }
}
