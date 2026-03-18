
<?php
// src/services/UserDataService.php

class UserDataService {
    
    public function prepareUserData($user) {
        // Remover campos sensíveis
        $userData = $user;
        unset($userData['password_hash']);
        unset($userData['password_reset_token']);
        unset($userData['email_verification_token']);
        
        // Garantir que campos essenciais existam
        $userData['login'] = $userData['username'] ?? $userData['email'];
        $userData['saldo'] = floatval($userData['saldo'] ?? 0);
        $userData['saldo_plano'] = floatval($userData['saldo_plano'] ?? 0);
        
        // Converter booleanos
        $userData['aceite_termos'] = (bool)($userData['aceite_termos'] ?? false);
        $userData['email_verificado'] = (bool)($userData['email_verificado'] ?? false);
        $userData['telefone_verificado'] = (bool)($userData['telefone_verificado'] ?? false);
        $userData['saldo_atualizado'] = (bool)($userData['saldo_atualizado'] ?? false);
        
        return $userData;
    }
}
