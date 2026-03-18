
<?php
// src/controllers/RegisterController.php

class RegisterController {
    private $authService;
    private $debug;
    
    public function __construct($authService, $debug = true) {
        $this->authService = $authService;
        $this->debug = $debug;
    }
    
    public function handle() {
        error_log("REGISTER_CONTROLLER: Processando registro");
        
        $rawInput = file_get_contents('php://input');
        error_log("REGISTER_CONTROLLER RAW INPUT: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            error_log("REGISTER_CONTROLLER ERROR: JSON inválido no registro");
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => 'JSON inválido',
                'raw_input' => substr($rawInput, 0, 200),
                'json_error' => json_last_error_msg()
            ]);
            return;
        }
        
        error_log("REGISTER_CONTROLLER: Input decodificado: " . json_encode(array_merge($input, ['password' => '[HIDDEN]'])));
        
        // Validar campos obrigatórios - apenas email, password e full_name
        $validation = $this->validateInput($input);
        if (!$validation['valid']) {
            error_log("REGISTER_CONTROLLER ERROR: Validação falhou: " . $validation['message']);
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'message' => $validation['message'],
                'missing_fields' => $validation['missing_fields'] ?? [],
                'received_fields' => array_keys($input)
            ]);
            return;
        }
        
        try {
            error_log("REGISTER_CONTROLLER: Chamando authService->register");
            $result = $this->authService->register($input);
            
            error_log("REGISTER_CONTROLLER: Resultado do authService: " . json_encode(array_merge($result, ['data' => $result['data'] ? '[PRESENTE]' : null])));
            
            if ($result['success']) {
                error_log("REGISTER_CONTROLLER SUCCESS: Usuário registrado com sucesso");
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'data' => $result['data'],
                    'message' => 'Usuário registrado com sucesso'
                ]);
            } else {
                error_log("REGISTER_CONTROLLER ERROR: " . $result['message']);
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'message' => $result['message'],
                    'debug_info' => $this->debug ? $result : null
                ]);
            }
            
        } catch (Exception $e) {
            error_log("REGISTER_CONTROLLER EXCEPTION: " . $e->getMessage());
            error_log("REGISTER_CONTROLLER STACK TRACE: " . $e->getTraceAsString());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro interno do servidor: ' . $e->getMessage(),
                'debug_trace' => $this->debug ? $e->getTraceAsString() : 'Debug desabilitado'
            ]);
        }
    }
    
    private function validateInput($input) {
        // Apenas 3 campos obrigatórios: email, password, full_name
        $required = ['email', 'password', 'full_name'];
        $missing = [];
        
        error_log("REGISTER_CONTROLLER: Validando campos obrigatórios");
        
        foreach ($required as $field) {
            if (!isset($input[$field])) {
                $missing[] = $field . ' (não existe)';
                error_log("REGISTER_CONTROLLER ERROR: Campo {$field} não existe no input");
            } elseif (is_string($input[$field]) && trim($input[$field]) === '') {
                $missing[] = $field . ' (vazio)';
                error_log("REGISTER_CONTROLLER ERROR: Campo {$field} está vazio");
            } else {
                error_log("REGISTER_CONTROLLER: Campo {$field} válido: " . (is_string($input[$field]) ? substr($input[$field], 0, 20) : gettype($input[$field])));
            }
        }
        
        // Validar email
        if (isset($input['email']) && !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
            $missing[] = 'email (formato inválido)';
            error_log("REGISTER_CONTROLLER ERROR: Email com formato inválido");
        }
        
        // Aceite de termos - se não fornecido, assumir true
        if (!isset($input['aceite_termos'])) {
            $input['aceite_termos'] = true;
            error_log("REGISTER_CONTROLLER: aceite_termos não fornecido, definindo como true");
        } else {
            error_log("REGISTER_CONTROLLER: aceite_termos recebido: " . json_encode($input['aceite_termos']));
        }
        
        if (!empty($missing)) {
            error_log("REGISTER_CONTROLLER ERROR: Campos obrigatórios ausentes: " . implode(', ', $missing));
            return [
                'valid' => false,
                'message' => "Campos obrigatórios ausentes ou inválidos: " . implode(', ', $missing),
                'missing_fields' => $missing
            ];
        }
        
        error_log("REGISTER_CONTROLLER: Validação passou com sucesso");
        return ['valid' => true];
    }
}
