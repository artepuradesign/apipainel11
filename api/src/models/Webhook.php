
<?php
// src/models/Webhook.php

require_once 'BaseModel.php';

class Webhook extends BaseModel {
    protected $table = 'webhooks';
    
    public $id;
    public $event_type;
    public $payload;
    public $status;
    public $attempts;
    public $last_attempt;
    public $response;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function processWebhook($eventType, $payload) {
        $this->event_type = $eventType;
        $this->payload = json_encode($payload);
        $this->status = 'pending';
        $this->attempts = 0;
        
        if ($this->create()) {
            return $this->executeWebhook();
        }
        return false;
    }
    
    public function executeWebhook() {
        try {
            $this->attempts++;
            $this->last_attempt = date('Y-m-d H:i:s');
            
            $payload = json_decode($this->payload, true);
            $result = false;
            
            switch ($this->event_type) {
                case 'payment.approved':
                    $result = $this->handlePaymentApproved($payload);
                    break;
                case 'payment.rejected':
                    $result = $this->handlePaymentRejected($payload);
                    break;
                case 'user.created':
                    $result = $this->handleUserCreated($payload);
                    break;
                default:
                    $result = true; // Evento não reconhecido, marcar como processado
            }
            
            $this->status = $result ? 'processed' : 'failed';
            $this->response = json_encode(['success' => $result]);
            $this->update();
            
            return $result;
        } catch (Exception $e) {
            $this->status = 'failed';
            $this->response = json_encode(['error' => $e->getMessage()]);
            $this->update();
            return false;
        }
    }
    
    private function handlePaymentApproved($payload) {
        if (!isset($payload['payment_id']) || !isset($payload['user_id'])) {
            return false;
        }
        
        // Atualizar status do pagamento
        $query = "UPDATE payments SET status = 'aprovado' WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$payload['payment_id']]);
        
        // Adicionar saldo ao usuário
        if (isset($payload['amount'])) {
            $query = "UPDATE usuarios SET saldo = saldo + ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$payload['amount'], $payload['user_id']]);
        }
        
        return true;
    }
    
    private function handlePaymentRejected($payload) {
        if (!isset($payload['payment_id'])) {
            return false;
        }
        
        $query = "UPDATE payments SET status = 'rejeitado' WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$payload['payment_id']]);
    }
    
    private function handleUserCreated($payload) {
        // Implementar lógica para novo usuário
        // Enviar email de boas-vindas, etc.
        return true;
    }
    
    public function retryFailedWebhooks($maxAttempts = 3) {
        $query = "SELECT * FROM {$this->table} 
                 WHERE status = 'failed' AND attempts < ?
                 ORDER BY created_at ASC LIMIT 10";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$maxAttempts]);
        
        $webhooks = $stmt->fetchAll();
        foreach ($webhooks as $webhookData) {
            $webhook = new Webhook($this->db);
            foreach ($webhookData as $key => $value) {
                if (property_exists($webhook, $key)) {
                    $webhook->$key = $value;
                }
            }
            $webhook->executeWebhook();
        }
    }
}
