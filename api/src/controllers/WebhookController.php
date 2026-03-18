
<?php
// src/controllers/WebhookController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/PaymentService.php';
require_once __DIR__ . '/../services/WebhookService.php';

class WebhookController {
    private $db;
    private $paymentService;
    private $webhookService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->paymentService = new PaymentService($db);
        $this->webhookService = new WebhookService($db);
    }
    
    public function handlePaymentWebhook() {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            // Log do webhook
            $this->logWebhook('payment', $input);
            
            if (!$data) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            // Validar assinatura se necessário
            if (!$this->validateWebhookSignature($input, $_SERVER['HTTP_SIGNATURE'] ?? '')) {
                Response::error('Assinatura inválida', 401);
                return;
            }
            
            $result = $this->paymentService->processWebhookPayment($data);
            
            if ($result['success']) {
                Response::success(null, 'Webhook processado com sucesso');
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log('Payment Webhook Error: ' . $e->getMessage());
            Response::serverError('Erro ao processar webhook');
        }
    }
    
    public function handlePixWebhook() {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            $this->logWebhook('pix', $input);
            
            if (!$data || !isset($data['txid'])) {
                Response::error('Dados PIX inválidos', 400);
                return;
            }
            
            $result = $this->paymentService->processPixWebhook($data);
            
            if ($result['success']) {
                Response::success(null, 'Webhook PIX processado');
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log('PIX Webhook Error: ' . $e->getMessage());
            Response::serverError('Erro ao processar webhook PIX');
        }
    }
    
    public function handleBankWebhook() {
        try {
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            
            $this->logWebhook('bank', $input);
            
            if (!$data) {
                Response::error('Dados bancários inválidos', 400);
                return;
            }
            
            $result = $this->webhookService->processBankWebhook($data);
            
            if ($result['success']) {
                Response::success(null, 'Webhook bancário processado');
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log('Bank Webhook Error: ' . $e->getMessage());
            Response::serverError('Erro ao processar webhook bancário');
        }
    }
    
    private function logWebhook($type, $payload) {
        try {
            $query = "INSERT INTO webhooks (type, payload, ip_address, user_agent, created_at) 
                      VALUES (?, ?, ?, ?, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $type,
                $payload,
                $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
            ]);
        } catch (Exception $e) {
            error_log('Webhook Log Error: ' . $e->getMessage());
        }
    }
    
    private function validateWebhookSignature($payload, $signature) {
        // Implementar validação de assinatura conforme gateway de pagamento
        $secret = ''; // Adicionar constante no conexao.php se necessário
        
        if (empty($secret)) {
            return true; // Se não tem secret configurado, aceita
        }
        
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        return hash_equals($expectedSignature, $signature);
    }
}
