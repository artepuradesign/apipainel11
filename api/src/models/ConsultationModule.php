
<?php
// src/models/ConsultationModule.php

require_once 'BaseModel.php';

class ConsultationModule extends BaseModel {
    protected $table = 'consultation_modules';
    
    public $id;
    public $name;
    public $slug;
    public $description;
    public $price;
    public $category;
    public $status;
    public $api_endpoint;
    public $api_method;
    public $request_format;
    public $response_format;
    public $validation_rules;
    public $rate_limit;
    public $permissions;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getActiveModules() {
        $query = "SELECT * FROM {$this->table} WHERE status = 'ativo' ORDER BY name ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getModulesByCategory($category) {
        $query = "SELECT * FROM {$this->table} WHERE category = ? AND status = 'ativo' ORDER BY name ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$category]);
        return $stmt->fetchAll();
    }
    
    public function getModuleBySlug($slug) {
        $query = "SELECT * FROM {$this->table} WHERE slug = ? AND status = 'ativo' LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$slug]);
        $result = $stmt->fetch();
        
        if ($result) {
            foreach ($result as $key => $value) {
                if (property_exists($this, $key)) {
                    $this->$key = $value;
                }
            }
            return true;
        }
        return false;
    }
    
    public function validateRequest($data) {
        if (empty($this->validation_rules)) {
            return ['valid' => true];
        }
        
        $rules = json_decode($this->validation_rules, true);
        $errors = [];
        
        foreach ($rules as $field => $rule) {
            if (isset($rule['required']) && $rule['required'] && empty($data[$field])) {
                $errors[] = "Campo {$field} é obrigatório";
                continue;
            }
            
            if (!empty($data[$field])) {
                // Validar tipo
                if (isset($rule['type'])) {
                    switch ($rule['type']) {
                        case 'cpf':
                            if (!$this->validateCPF($data[$field])) {
                                $errors[] = "CPF inválido";
                            }
                            break;
                        case 'cnpj':
                            if (!$this->validateCNPJ($data[$field])) {
                                $errors[] = "CNPJ inválido";
                            }
                            break;
                        case 'email':
                            if (!filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
                                $errors[] = "Email inválido";
                            }
                            break;
                        case 'phone':
                            if (!$this->validatePhone($data[$field])) {
                                $errors[] = "Telefone inválido";
                            }
                            break;
                    }
                }
                
                // Validar tamanho
                if (isset($rule['length'])) {
                    $length = strlen($data[$field]);
                    if (isset($rule['length']['min']) && $length < $rule['length']['min']) {
                        $errors[] = "Campo {$field} deve ter pelo menos {$rule['length']['min']} caracteres";
                    }
                    if (isset($rule['length']['max']) && $length > $rule['length']['max']) {
                        $errors[] = "Campo {$field} deve ter no máximo {$rule['length']['max']} caracteres";
                    }
                }
            }
        }
        
        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }
    
    public function executeConsultation($data, $userId) {
        // Validar requisição
        $validation = $this->validateRequest($data);
        if (!$validation['valid']) {
            return [
                'success' => false,
                'errors' => $validation['errors']
            ];
        }
        
        // Verificar saldo do usuário
        $userQuery = "SELECT saldo FROM usuarios WHERE id = ?";
        $stmt = $this->db->prepare($userQuery);
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user || $user['saldo'] < $this->price) {
            return [
                'success' => false,
                'message' => 'Saldo insuficiente'
            ];
        }
        
        // Realizar consulta (simulação)
        $result = $this->performApiCall($data);
        
        if ($result['success']) {
            // Deduzir saldo
            $updateSaldoQuery = "UPDATE usuarios SET saldo = saldo - ? WHERE id = ?";
            $stmt = $this->db->prepare($updateSaldoQuery);
            $stmt->execute([$this->price, $userId]);
            
            // Registrar consulta
            $this->recordConsultation($userId, $data, $result['data']);
        }
        
        return $result;
    }
    
    private function performApiCall($data) {
        // Simulação de chamada à API externa
        // Em uma implementação real, aqui seria feita a requisição HTTP
        
        $responseData = [
            'timestamp' => date('Y-m-d H:i:s'),
            'request_data' => $data,
            'module' => $this->name,
            'result' => $this->generateMockResponse($data)
        ];
        
        return [
            'success' => true,
            'data' => $responseData
        ];
    }
    
    private function generateMockResponse($data) {
        // Gerar resposta simulada baseada no tipo de módulo
        switch ($this->slug) {
            case 'cpf-consulta':
                return [
                    'cpf' => $data['documento'] ?? '',
                    'nome' => 'NOME EXEMPLO',
                    'situacao' => 'REGULAR',
                    'data_nascimento' => '1980-01-01'
                ];
            case 'cnpj-consulta':
                return [
                    'cnpj' => $data['documento'] ?? '',
                    'razao_social' => 'EMPRESA EXEMPLO LTDA',
                    'situacao' => 'ATIVA',
                    'data_abertura' => '2010-01-01'
                ];
            default:
                return ['status' => 'processado'];
        }
    }
    
    private function recordConsultation($userId, $requestData, $responseData) {
        require_once __DIR__ . '/Consulta.php';
        $consulta = new Consulta($this->db);
        
        $consulta->user_id = $userId;
        $consulta->tipo = $this->slug;
        $consulta->documento = $requestData['documento'] ?? '';
        $consulta->status = 'concluida';
        $consulta->custo = $this->price;
        $consulta->resultado = json_encode($responseData);
        $consulta->ip_address = $_SERVER['REMOTE_ADDR'] ?? null;
        $consulta->user_agent = $_SERVER['HTTP_USER_AGENT'] ?? null;
        
        return $consulta->create();
    }
    
    private function validateCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        return strlen($cpf) === 11 && !preg_match('/^(\d)\1{10}$/', $cpf);
    }
    
    private function validateCNPJ($cnpj) {
        $cnpj = preg_replace('/[^0-9]/', '', $cnpj);
        return strlen($cnpj) === 14 && !preg_match('/^(\d)\1{13}$/', $cnpj);
    }
    
    private function validatePhone($phone) {
        $phone = preg_replace('/[^0-9]/', '', $phone);
        return strlen($phone) >= 10 && strlen($phone) <= 11;
    }
}
