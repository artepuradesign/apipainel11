
<?php
// src/utils/UserValidation.php - Validações específicas para usuários

class UserValidation {
    
    public static function validateUserUpdateData($data) {
        $errors = [];
        
        // Validar nome completo
        if (isset($data['full_name'])) {
            if (empty(trim($data['full_name']))) {
                $errors[] = 'Nome completo não pode estar vazio';
            } elseif (strlen($data['full_name']) < 3) {
                $errors[] = 'Nome completo deve ter pelo menos 3 caracteres';
            }
        }
        
        // Validar CNPJ (se fornecido)
        if (isset($data['cnpj']) && !empty($data['cnpj'])) {
            if (!self::validateCNPJ($data['cnpj'])) {
                $errors[] = 'CNPJ inválido';
            }
        }
        
        // Validar data de nascimento
        if (isset($data['data_nascimento']) && !empty($data['data_nascimento'])) {
            if (!self::validateDate($data['data_nascimento'])) {
                $errors[] = 'Data de nascimento inválida';
            }
        }
        
        // Validar telefone
        if (isset($data['telefone']) && !empty($data['telefone'])) {
            if (!self::validatePhone($data['telefone'])) {
                $errors[] = 'Telefone inválido';
            }
        }
        
        // Validar CEP
        if (isset($data['cep']) && !empty($data['cep'])) {
            if (!self::validateCEP($data['cep'])) {
                $errors[] = 'CEP inválido';
            }
        }
        
        // Validar estado
        if (isset($data['estado']) && !empty($data['estado'])) {
            if (!self::validateState($data['estado'])) {
                $errors[] = 'Estado inválido';
            }
        }
        
        // Validar tipo de pessoa
        if (isset($data['tipo_pessoa'])) {
            if (!in_array($data['tipo_pessoa'], ['fisica', 'juridica'])) {
                $errors[] = 'Tipo de pessoa deve ser "fisica" ou "juridica"';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    public static function validatePasswordUpdate($passwords) {
        $errors = [];
        
        // Validar senha alfabética
        if (isset($passwords['senhaalfa']) && !empty($passwords['senhaalfa'])) {
            if (strlen($passwords['senhaalfa']) < 6) {
                $errors[] = 'Senha alfabética deve ter pelo menos 6 caracteres';
            }
        }
        
        // Validar senha numérica de 4 dígitos
        if (isset($passwords['senha4']) && !empty($passwords['senha4'])) {
            if (!preg_match('/^\d{4}$/', $passwords['senha4'])) {
                $errors[] = 'Senha de 4 dígitos deve conter apenas números';
            }
        }
        
        // Validar senha numérica de 6 dígitos
        if (isset($passwords['senha6']) && !empty($passwords['senha6'])) {
            if (!preg_match('/^\d{6}$/', $passwords['senha6'])) {
                $errors[] = 'Senha de 6 dígitos deve conter apenas números';
            }
        }
        
        // Validar senha numérica de 8 dígitos
        if (isset($passwords['senha8']) && !empty($passwords['senha8'])) {
            if (!preg_match('/^\d{8}$/', $passwords['senha8'])) {
                $errors[] = 'Senha de 8 dígitos deve conter apenas números';
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    private static function validateCNPJ($cnpj) {
        // Remover caracteres especiais
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        
        // Verificar se tem 14 dígitos
        if (strlen($cnpj) !== 14) {
            return false;
        }
        
        // Verificar se não são todos os dígitos iguais
        if (preg_match('/(\d)\1{13}/', $cnpj)) {
            return false;
        }
        
        // Validação dos dígitos verificadores
        // (Implementação simplificada - em produção usar algoritmo completo)
        return true;
    }
    
    private static function validateDate($date) {
        // Tentar formato brasileiro primeiro (DD/MM/YYYY)
        $d = DateTime::createFromFormat('d/m/Y', $date);
        if ($d && $d->format('d/m/Y') === $date) {
            return true;
        }
        
        // Tentar formato ISO (YYYY-MM-DD)
        $d = DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
    
    public static function convertBrazilianDateToISO($date) {
        if (empty($date)) {
            return null;
        }
        
        // Se já está no formato ISO (YYYY-MM-DD), retornar como está
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            return $date;
        }
        
        // Converter formato brasileiro (DD/MM/YYYY) para ISO (YYYY-MM-DD)
        if (preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $date)) {
            $d = DateTime::createFromFormat('d/m/Y', $date);
            if ($d && $d->format('d/m/Y') === $date) {
                return $d->format('Y-m-d');
            }
        }
        
        return null; // Data inválida
    }
    
    private static function validatePhone($phone) {
        // Remover caracteres especiais
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Verificar se tem entre 10 e 11 dígitos
        return strlen($phone) >= 10 && strlen($phone) <= 11;
    }
    
    private static function validateCEP($cep) {
        // Remover caracteres especiais
        $cep = preg_replace('/[^0-9]/', '', $cep);
        
        // Verificar se tem 8 dígitos
        return strlen($cep) === 8;
    }
    
    private static function validateState($state) {
        $validStates = [
            'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
            'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
            'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
        ];
        
        return in_array(strtoupper($state), $validStates);
    }
}
