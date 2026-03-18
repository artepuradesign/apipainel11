
<?php
// src/utils/Validator.php

class Validator {
    private $errors = [];
    
    public function validate($data, $rules) {
        $this->errors = [];
        
        foreach ($rules as $field => $fieldRules) {
            $value = $data[$field] ?? null;
            $this->validateField($field, $value, $fieldRules);
        }
        
        return empty($this->errors);
    }
    
    private function validateField($field, $value, $rules) {
        $rulesArray = explode('|', $rules);
        
        foreach ($rulesArray as $rule) {
            $this->applyRule($field, $value, $rule);
        }
    }
    
    private function applyRule($field, $value, $rule) {
        $ruleParts = explode(':', $rule);
        $ruleName = $ruleParts[0];
        $ruleParam = $ruleParts[1] ?? null;
        
        switch ($ruleName) {
            case 'required':
                if (empty($value)) {
                    $this->addError($field, "O campo {$field} é obrigatório");
                }
                break;
                
            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "O campo {$field} deve ser um e-mail válido");
                }
                break;
                
            case 'min':
                if (!empty($value) && strlen($value) < $ruleParam) {
                    $this->addError($field, "O campo {$field} deve ter pelo menos {$ruleParam} caracteres");
                }
                break;
                
            case 'max':
                if (!empty($value) && strlen($value) > $ruleParam) {
                    $this->addError($field, "O campo {$field} deve ter no máximo {$ruleParam} caracteres");
                }
                break;
                
            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "O campo {$field} deve ser numérico");
                }
                break;
                
            case 'cpf':
                if (!empty($value) && !$this->validateCPF($value)) {
                    $this->addError($field, "O campo {$field} deve ser um CPF válido");
                }
                break;
                
            case 'cnpj':
                if (!empty($value) && !$this->validateCNPJ($value)) {
                    $this->addError($field, "O campo {$field} deve ser um CNPJ válido");
                }
                break;
                
            case 'phone':
                if (!empty($value) && !$this->validatePhone($value)) {
                    $this->addError($field, "O campo {$field} deve ser um telefone válido");
                }
                break;
        }
    }
    
    private function validateCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        if (strlen($cpf) != 11) return false;
        
        // Verificar se todos os dígitos são iguais
        if (preg_match('/(\d)\1{10}/', $cpf)) return false;
        
        // Calcular primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += $cpf[$i] * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        if ($cpf[9] != $digit1) return false;
        
        // Calcular segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += $cpf[$i] * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        return $cpf[10] == $digit2;
    }
    
    private function validateCNPJ($cnpj) {
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        
        if (strlen($cnpj) != 14) return false;
        
        // Verificar se todos os dígitos são iguais
        if (preg_match('/(\d)\1{13}/', $cnpj)) return false;
        
        // Calcular primeiro dígito verificador
        $sum = 0;
        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for ($i = 0; $i < 12; $i++) {
            $sum += $cnpj[$i] * $weights1[$i];
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        if ($cnpj[12] != $digit1) return false;
        
        // Calcular segundo dígito verificador
        $sum = 0;
        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for ($i = 0; $i < 13; $i++) {
            $sum += $cnpj[$i] * $weights2[$i];
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        return $cnpj[13] == $digit2;
    }
    
    private function validatePhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        return preg_match('/^(\d{10,11})$/', $phone);
    }
    
    private function addError($field, $message) {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $message;
    }
    
    public function getErrors() {
        return $this->errors;
    }
    
    public function getFirstError() {
        if (empty($this->errors)) return null;
        
        $firstField = array_key_first($this->errors);
        return $this->errors[$firstField][0];
    }
}
