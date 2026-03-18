
<?php
// src/services/PaymentService.php

require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/Transaction.php';

class PaymentService {
    private $db;
    private $payment;
    private $transaction;
    
    public function __construct($db) {
        $this->db = $db;
        $this->payment = new Payment($db);
        $this->transaction = new Transaction($db);
    }
    
    public function processPayment($userId, $amount, $method, $reference = null) {
        try {
            $this->db->beginTransaction();
            
            // Criar registro de pagamento
            $this->payment->user_id = $userId;
            $this->payment->amount = $amount;
            $this->payment->method = $method;
            $this->payment->status = 'pendente';
            $this->payment->reference = $reference;
            
            if (!$this->payment->create()) {
                throw new Exception('Erro ao criar registro de pagamento');
            }
            
            // Processar baseado no método
            $result = $this->processPaymentMethod($method, $amount, $reference);
            
            // Atualizar status do pagamento
            $this->payment->status = $result['status'];
            $this->payment->gateway_response = json_encode($result['response']);
            $this->payment->update();
            
            // Se aprovado, criar transação de crédito
            if ($result['status'] === 'aprovado') {
                $this->createCreditTransaction($userId, $amount, $this->payment->id);
            }
            
            $this->db->commit();
            return $result;
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    private function processPaymentMethod($method, $amount, $reference) {
        switch ($method) {
            case 'pix':
                return $this->processPixPayment($amount, $reference);
            case 'boleto':
                return $this->processBoletoPayment($amount, $reference);
            case 'cartao':
                return $this->processCreditCardPayment($amount, $reference);
            default:
                throw new Exception('Método de pagamento não suportado');
        }
    }
    
    private function processPixPayment($amount, $reference) {
        // Implementar integração com gateway PIX
        return [
            'status' => 'pendente',
            'response' => ['qr_code' => 'mock_qr_code', 'expires_at' => date('Y-m-d H:i:s', strtotime('+30 minutes'))]
        ];
    }
    
    private function processBoletoPayment($amount, $reference) {
        // Implementar integração com gateway de boleto
        return [
            'status' => 'pendente',
            'response' => ['barcode' => 'mock_barcode', 'expires_at' => date('Y-m-d H:i:s', strtotime('+3 days'))]
        ];
    }
    
    private function processCreditCardPayment($amount, $reference) {
        // Implementar integração com gateway de cartão
        return [
            'status' => 'aprovado',
            'response' => ['transaction_id' => 'mock_transaction_id']
        ];
    }
    
    private function createCreditTransaction($userId, $amount, $paymentId) {
        $this->transaction->user_id = $userId;
        $this->transaction->tipo = 'credito';
        $this->transaction->valor = $amount;
        $this->transaction->descricao = 'Recarga de saldo';
        $this->transaction->status = 'concluida';
        $this->transaction->reference = 'payment_' . $paymentId;
        
        return $this->transaction->create();
    }
    
    public function confirmPayment($paymentId, $gatewayData) {
        $this->payment->id = $paymentId;
        if (!$this->payment->readOne()) {
            throw new Exception('Pagamento não encontrado');
        }
        
        $this->payment->status = 'aprovado';
        $this->payment->gateway_response = json_encode($gatewayData);
        
        if ($this->payment->update()) {
            // Criar transação de crédito
            $this->createCreditTransaction(
                $this->payment->user_id, 
                $this->payment->amount, 
                $paymentId
            );
            return true;
        }
        
        return false;
    }
}
