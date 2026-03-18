
<?php
// src/services/ValidationService.php

class ValidationService {
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
        $rulesArray = is_string($rules) ? explode('|', $rules) : $rules;
        
        foreach ($rulesArray as $rule) {
            if (is_array($rule)) {
                $ruleName = $rule[0];
                $ruleParams = array_slice($rule, 1);
            } else {
                $parts = explode(':', $rule);
                $ruleName = $parts[0];
                $ruleParams = isset($parts[1]) ? explode(',', $parts[1]) : [];
            }
            
            $this->applyRule($field, $value, $ruleName, $ruleParams);
        }
    }
    
    private function applyRule($field, $value, $rule, $params = []) {
        switch ($rule) {
            case 'required':
                if (empty($value) && $value !== '0') {
                    $this->addError($field, "O campo {$field} é obrigatório");
                }
                break;
                
            case 'email':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                    $this->addError($field, "O campo {$field} deve ser um e-mail válido");
                }
                break;
                
            case 'min':
                $min = $params[0] ?? 0;
                if (!empty($value) && strlen($value) < $min) {
                    $this->addError($field, "O campo {$field} deve ter pelo menos {$min} caracteres");
                }
                break;
                
            case 'max':
                $max = $params[0] ?? 255;
                if (!empty($value) && strlen($value) > $max) {
                    $this->addError($field, "O campo {$field} deve ter no máximo {$max} caracteres");
                }
                break;
                
            case 'numeric':
                if (!empty($value) && !is_numeric($value)) {
                    $this->addError($field, "O campo {$field} deve ser numérico");
                }
                break;
                
            case 'integer':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_INT)) {
                    $this->addError($field, "O campo {$field} deve ser um número inteiro");
                }
                break;
                
            case 'positive':
                if (!empty($value) && (float)$value <= 0) {
                    $this->addError($field, "O campo {$field} deve ser um número positivo");
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
                
            case 'url':
                if (!empty($value) && !filter_var($value, FILTER_VALIDATE_URL)) {
                    $this->addError($field, "O campo {$field} deve ser uma URL válida");
                }
                break;
                
            case 'in':
                if (!empty($value) && !in_array($value, $params)) {
                    $allowedValues = implode(', ', $params);
                    $this->addError($field, "O campo {$field} deve ser um dos valores: {$allowedValues}");
                }
                break;
                
            case 'regex':
                $pattern = $params[0] ?? '';
                if (!empty($value) && !preg_match($pattern, $value)) {
                    $this->addError($field, "O campo {$field} tem formato inválido");
                }
                break;
                
            case 'date':
                if (!empty($value) && !strtotime($value)) {
                    $this->addError($field, "O campo {$field} deve ser uma data válida");
                }
                break;
                
            case 'unique':
                $table = $params[0] ?? '';
                $column = $params[1] ?? $field;
                if (!empty($value) && $this->checkUnique($table, $column, $value)) {
                    $this->addError($field, "O valor do campo {$field} já está em uso");
                }
                break;
        }
    }
    
    private function validateCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        if (strlen($cpf) != 11 || preg_match('/(\d)\1{10}/', $cpf)) {
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
        
        if (strlen($cnpj) != 14 || preg_match('/(\d)\1{13}/', $cnpj)) {
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
        
        if ($cnpj[12] != $digit1) return false;
        
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
        return preg_match('/^(\d{10,11})$/', $phone);
    }
    
    private function checkUnique($table, $column, $value) {
        // Implementar verificação de unicidade no banco
        // Por enquanto retorna false (válido)
        return false;
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
    
    public function hasErrors() {
        return !empty($this->errors);
    }
    
    public function sanitizeInput($input) {
        if (is_array($input)) {
            return array_map([$this, 'sanitizeInput'], $input);
        }
        
        // Remover tags HTML
        $input = strip_tags($input);
        
        // Escapar caracteres especiais
        $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
        
        // Remover caracteres de controle
        $input = preg_replace('/[\x00-\x1F\x7F]/', '', $input);
        
        return trim($input);
    }
    
    public function validatePasswordStrength($password) {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'A senha deve ter pelo menos 8 caracteres';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos uma letra minúscula';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos uma letra maiúscula';
        }
        
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos um número';
        }
        
        if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
            $errors[] = 'A senha deve conter pelo menos um caractere especial';
        }
        
        return empty($errors) ? true : $errors;
    }
}
