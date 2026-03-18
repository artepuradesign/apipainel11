<?php
// src/controllers/PaymentController.php

require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../services/PaymentService.php';

class PaymentController {
    private $db;
    private $payment;
    private $paymentService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->payment = new Payment($db);
        $this->paymentService = new PaymentService($db);
    }
    
    public function createPixPayment() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['amount'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            $result = $this->paymentService->processPayment(
                $userId, 
                $data['amount'], 
                'pix', 
                $data['reference'] ?? null
            );
            
            // Registrar no caixa central
            $this->registerToCentralCash($userId, $data['amount'], 'pix');
            
            Response::success($result, 'Pagamento PIX criado com sucesso', 201);
        } catch (Exception $e) {
            Response::error('Erro ao criar pagamento PIX: ' . $e->getMessage(), 500);
        }
    }
    
    public function createCreditCardPayment() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['amount'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            $result = $this->paymentService->processPayment(
                $userId, 
                $data['amount'], 
                'cartao', 
                $data['reference'] ?? null
            );
            
            // Registrar no caixa central - CORREÇÃO 1: agora também registra cartão
            $this->registerToCentralCash($userId, $data['amount'], 'cartao');
            
            Response::success($result, 'Pagamento por cartão processado com sucesso', 201);
        } catch (Exception $e) {
            Response::error('Erro ao processar pagamento: ' . $e->getMessage(), 500);
        }
    }
    
    public function createBoletoPayment() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['amount'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        try {
            $result = $this->paymentService->processPayment(
                $userId, 
                $data['amount'], 
                'boleto', 
                $data['reference'] ?? null
            );
            
            // Registrar no caixa central
            $this->registerToCentralCash($userId, $data['amount'], 'boleto');
            
            Response::success($result, 'Boleto criado com sucesso', 201);
        } catch (Exception $e) {
            Response::error('Erro ao criar boleto: ' . $e->getMessage(), 500);
        }
    }
    
    // Registrar transação no caixa central via HTTP
    private function registerToCentralCash($userId, $amount, $paymentMethod) {
        try {
            $data = [
                'type' => 'recarga',
                'user_id' => $userId,
                'amount' => floatval($amount),
                'description' => "Recarga via {$paymentMethod}",
                'metadata' => [
                    'payment_method' => $paymentMethod,
                    'transaction_id' => uniqid('TXN_'),
                    'original_amount' => floatval($amount)
                ]
            ];
            
            // Headers com autorização
            $headers = [
                'Content-Type: application/json',
                'Authorization: Bearer ' . ($_SESSION['session_token'] ?? '')
            ];
            
            $context = stream_context_create([
                'http' => [
                    'method' => 'POST',
                    'header' => implode("\r\n", $headers),
                    'content' => json_encode($data)
                ]
            ]);
            
            $response = file_get_contents('http://localhost/api/central-cash/transaction', false, $context);
            
            if ($response === false) {
                error_log("Erro ao registrar no caixa central para recarga de {$amount}");
            } else {
                error_log("Recarga de {$amount} registrada no caixa central via {$paymentMethod}");
            }
            
        } catch (Exception $e) {
            error_log("Erro ao registrar no caixa central: " . $e->getMessage());
        }
    }
    
    public function getPaymentHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $payments = $stmt->fetchAll();
            
            $history = array_map(function($payment) {
                return [
                    'id' => (int)$payment['id'],
                    'reference' => $payment['reference'],
                    'amount' => (float)$payment['amount'],
                    'method' => $payment['method'],
                    'status' => $payment['status'],
                    'createdAt' => $payment['created_at']
                ];
            }, $payments);
            
            Response::success($history);
        } catch (Exception $e) {
            Response::error('Erro ao buscar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    public function getPaymentMethods() {
        $methods = [
            [
                'id' => 'pix',
                'name' => 'PIX',
                'enabled' => true,
                'fees' => 0
            ],
            [
                'id' => 'cartao',
                'name' => 'Cartão de Crédito',
                'enabled' => true,
                'fees' => 3.5
            ],
            [
                'id' => 'boleto',
                'name' => 'Boleto Bancário',
                'enabled' => true,
                'fees' => 2.0
            ]
        ];
        
        Response::success($methods, 'Métodos de pagamento disponíveis');
    }
    
    public function getPaymentStatus($reference) {
        try {
            $query = "SELECT * FROM payments WHERE reference = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$reference]);
            $payment = $stmt->fetch();
            
            if ($payment) {
                $status = [
                    'reference' => $payment['reference'],
                    'status' => $payment['status'],
                    'amount' => (float)$payment['amount'],
                    'method' => $payment['method'],
                    'createdAt' => $payment['created_at']
                ];
                
                Response::success($status);
            } else {
                Response::error('Pagamento não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro ao buscar status: ' . $e->getMessage(), 500);
        }
    }
    
    public function processWebhook() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            // Processar webhook do gateway de pagamento
            if (isset($data['reference']) && isset($data['status'])) {
                $query = "UPDATE payments SET status = ? WHERE reference = ?";
                $stmt = $this->db->prepare($query);
                $result = $stmt->execute([$data['status'], $data['reference']]);
                
                if ($result) {
                    Response::success(null, 'Webhook processado com sucesso');
                } else {
                    Response::error('Erro ao processar webhook', 400);
                }
            } else {
                Response::error('Dados do webhook inválidos', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro ao processar webhook: ' . $e->getMessage(), 500);
        }
    }
}