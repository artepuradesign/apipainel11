
<?php
// src/middleware/ValidationMiddleware.php

class ValidationMiddleware {
    private $rules;
    private $errors;
    
    public function __construct() {
        $this->errors = [];
    }
    
    public function validate($data, $rules) {
        $this->rules = $rules;
        $this->errors = [];
        
        foreach ($rules as $field => $rule) {
            $this->validateField($field, $data[$field] ?? null, $rule);
        }
        
        if (!empty($this->errors)) {
            $this->sendValidationError();
            return false;
        }
        
        return true;
    }
    
    private function validateField($field, $value, $rule) {
        $rules = explode('|', $rule);
        
        foreach ($rules as $singleRule) {
            if (strpos($singleRule, ':') !== false) {
                list($ruleName, $ruleValue) = explode(':', $singleRule, 2);
            } else {
                $ruleName = $singleRule;
                $ruleValue = null;
            }
            
            switch ($ruleName) {
                case 'required':
                    if (empty($value)) {
                        $this->addError($field, "Campo {$field} é obrigatório");
                    }
                    break;
                    
                case 'email':
                    if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                        $this->addError($field, "Campo {$field} deve ser um email válido");
                    }
                    break;
                    
                case 'min':
                    if (!empty($value) && strlen($value) < $ruleValue) {
                        $this->addError($field, "Campo {$field} deve ter pelo menos {$ruleValue} caracteres");
                    }
                    break;
                    
                case 'max':
                    if (!empty($value) && strlen($value) > $ruleValue) {
                        $this->addError($field, "Campo {$field} deve ter no máximo {$ruleValue} caracteres");
                    }
                    break;
                    
                case 'numeric':
                    if (!empty($value) && !is_numeric($value)) {
                        $this->addError($field, "Campo {$field} deve ser numérico");
                    }
                    break;
                    
                case 'cpf':
                    if (!empty($value) && !$this->validateCPF($value)) {
                        $this->addError($field, "CPF inválido");
                    }
                    break;
                    
                case 'cnpj':
                    if (!empty($value) && !$this->validateCNPJ($value)) {
                        $this->addError($field, "CNPJ inválido");
                    }
                    break;
                    
                case 'phone':
                    if (!empty($value) && !$this->validatePhone($value)) {
                        $this->addError($field, "Telefone inválido");
                    }
                    break;
                    
                case 'in':
                    $allowedValues = explode(',', $ruleValue);
                    if (!empty($value) && !in_array($value, $allowedValues)) {
                        $this->addError($field, "Campo {$field} deve ser um dos valores: " . implode(', ', $allowedValues));
                    }
                    break;
            }
        }
    }
    
    private function addError($field, $message) {
        $this->errors[$field] = $message;
    }
    
    private function sendValidationError() {
        http_response_code(422);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Dados inválidos',
            'errors' => $this->errors
        ]);
        exit;
    }
    
    private function validateCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        if (strlen($cpf) != 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }
        
        for ($t = 9; $t < 11; $t++) {
            $d = 0;
            for ($c = 0; $c < $t; $c++) {
                $d += $cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ($cpf[$c] != $d) {
                return false;
            }
        }
        
        return true;
    }
    
    private function validateCNPJ($cnpj) {
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        
        if (strlen($cnpj) != 14 || preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }
        
        $weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        $weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        
        $sum = 0;
        for ($i = 0; $i < 12; $i++) {
            $sum += $cnpj[$i] * $weights1[$i];
        }
        
        $remainder = $sum % 11;
        $digit1 = $remainder < 2 ? 0 : 11 - $remainder;
        
        if ($cnpj[12] != $digit1) {
            return false;
        }
        
        $sum = 0;
        for ($i = 0; $i < 13; $i++) {
            $sum += $cnpj[$i] * $weights2[$i];
        }
        
        $remainder = $sum % 11;
        $digit2 = $remainder < 2 ? 0 : 11 - $remainder;
        
        return $cnpj[13] == $digit2;
    }
    
    private function validatePhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        return strlen($phone) >= 10 && strlen($phone) <= 11;
    }
}
