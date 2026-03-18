
<?php
// src/services/PasswordGenerationService.php

class PasswordGenerationService {
    
    public function generatePasswordHash($password) {
        // Usar MD5 com salt para compatibilidade com sistema de login
        return md5($password . 'salt123');
    }
    
    public function generateRequiredPasswords() {
        return [
            'senha4' => '0000',
            'senha6' => '000000', 
            'senha8' => '00000000'
        ];
    }
    
    private function generateNumericPassword($length) {
        $password = '';
        for ($i = 0; $i < $length; $i++) {
            $password .= '0';
        }
        return $password;
    }
}
