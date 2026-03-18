<?php
// src/controllers/ConsultasController.php

require_once __DIR__ . '/../services/ConsultaService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ConsultasController {
    private $db;
    private $consultaService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultaService = new ConsultaService($db);
    }
    
    /**
     * Consultar CPF
     */
    public function consultarCPF() {
        try {
            // Verificar autenticação
            $userId = AuthMiddleware::verifyToken();
            
            // Validar entrada
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['cpf']) || empty($input['cpf'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'CPF é obrigatório'
                ]);
                return;
            }
            
            $cpf = $this->sanitizeCPF($input['cpf']);
            
            if (!$this->isValidCPF($cpf)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'CPF inválido'
                ]);
                return;
            }
            
            // Realizar consulta
            $result = $this->consultaService->consultarCPF($userId, $cpf);
            
            http_response_code(200);
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("CONSULTA_CPF_ERROR: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Consultar CNPJ
     */
    public function consultarCNPJ() {
        try {
            // Verificar autenticação
            $userId = AuthMiddleware::verifyToken();
            
            // Validar entrada
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['cnpj']) || empty($input['cnpj'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'CNPJ é obrigatório'
                ]);
                return;
            }
            
            $cnpj = $this->sanitizeCNPJ($input['cnpj']);
            
            if (!$this->isValidCNPJ($cnpj)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'CNPJ inválido'
                ]);
                return;
            }
            
            // Realizar consulta
            $result = $this->consultaService->consultarCNPJ($userId, $cnpj);
            
            http_response_code(200);
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("CONSULTA_CNPJ_ERROR: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Consultar Veículo
     */
    public function consultarVeiculo() {
        try {
            // Verificar autenticação
            $userId = AuthMiddleware::verifyToken();
            
            // Validar entrada
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['placa']) || empty($input['placa'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Placa é obrigatória'
                ]);
                return;
            }
            
            $placa = $this->sanitizePlaca($input['placa']);
            
            if (!$this->isValidPlaca($placa)) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Placa inválida'
                ]);
                return;
            }
            
            // Realizar consulta
            $result = $this->consultaService->consultarVeiculo($userId, $placa);
            
            http_response_code(200);
            echo json_encode($result);
            
        } catch (Exception $e) {
            error_log("CONSULTA_VEICULO_ERROR: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Obter histórico de consultas
     */
    public function getHistory() {
        try {
            // Verificar autenticação
            $userId = AuthMiddleware::verifyToken();
            
            // Parâmetros opcionais
            $type = $_GET['type'] ?? null;
            $limit = intval($_GET['limit'] ?? 20);
            $offset = intval($_GET['offset'] ?? 0);
            
            // Buscar histórico
            $history = $this->consultaService->getUserConsultationHistory($userId, $type, $limit, $offset);
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $history
            ]);
            
        } catch (Exception $e) {
            error_log("GET_HISTORY_ERROR: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    /**
     * Verificar saldo para consulta
     */
    public function checkBalance() {
        try {
            // Verificar autenticação
            $userId = AuthMiddleware::verifyToken();
            
            $type = $_GET['type'] ?? 'cpf';
            
            // Buscar saldo do usuário
            $query = "SELECT saldo, saldo_plano FROM usuarios WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                throw new Exception('Usuário não encontrado');
            }
            
            $costs = [
                'cpf' => 2.00,
                'cnpj' => 3.00,
                'veiculo' => 4.00
            ];
            
            $requiredAmount = $costs[$type] ?? 2.00;
            $userBalance = (float)$user['saldo'];
            $planBalance = (float)$user['saldo_plano'];
            $totalBalance = $userBalance + $planBalance;
            
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => [
                    'sufficient' => $totalBalance >= $requiredAmount,
                    'required_amount' => $requiredAmount,
                    'user_balance' => $userBalance,
                    'plan_balance' => $planBalance,
                    'total_balance' => $totalBalance
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("CHECK_BALANCE_ERROR: " . $e->getMessage());
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
    }
    
    // Métodos de validação e sanitização
    private function sanitizeCPF($cpf) {
        return preg_replace('/[^0-9]/', '', $cpf);
    }
    
    private function sanitizeCNPJ($cnpj) {
        return preg_replace('/[^0-9]/', '', $cnpj);
    }
    
    private function sanitizePlaca($placa) {
        return strtoupper(preg_replace('/[^A-Z0-9]/', '', $placa));
    }
    
    private function isValidCPF($cpf) {
        return strlen($cpf) === 11 && !preg_match('/^(\d)\1{10}$/', $cpf);
    }
    
    private function isValidCNPJ($cnpj) {
        return strlen($cnpj) === 14 && !preg_match('/^(\d)\1{13}$/', $cnpj);
    }
    
    private function isValidPlaca($placa) {
        // Formato antigo (ABC1234) ou Mercosul (ABC1D23)
        return preg_match('/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/', $placa);
    }
}