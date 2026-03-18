
<?php
// src/services/WebhookService.php

require_once __DIR__ . '/../models/Webhook.php';

class WebhookService {
    private $db;
    private $webhook;
    
    public function __construct($db) {
        $this->db = $db;
        $this->webhook = new Webhook($db);
    }
    
    public function createWebhook($url, $events, $secret = null) {
        try {
            $this->webhook->url = $url;
            $this->webhook->events = json_encode($events);
            $this->webhook->secret = $secret ?? bin2hex(random_bytes(32));
            $this->webhook->status = 'ativo';
            
            if ($this->webhook->create()) {
                return [
                    'success' => true,
                    'webhook_id' => $this->webhook->id,
                    'secret' => $this->webhook->secret
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao criar webhook'
            ];
        } catch (Exception $e) {
            error_log("WebhookService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    public function sendWebhook($event, $data) {
        $activeWebhooks = $this->getActiveWebhooks($event);
        
        foreach ($activeWebhooks as $webhook) {
            $this->dispatchWebhook($webhook, $event, $data);
        }
    }
    
    private function getActiveWebhooks($event) {
        $query = "SELECT * FROM webhooks WHERE status = 'ativo'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $webhooks = $stmt->fetchAll();
        
        $filtered = [];
        foreach ($webhooks as $webhook) {
            $events = json_decode($webhook['events'], true);
            if (in_array($event, $events) || in_array('*', $events)) {
                $filtered[] = $webhook;
            }
        }
        
        return $filtered;
    }
    
    private function dispatchWebhook($webhook, $event, $data) {
        $payload = [
            'event' => $event,
            'data' => $data,
            'timestamp' => time(),
            'webhook_id' => $webhook['id']
        ];
        
        $signature = hash_hmac('sha256', json_encode($payload), $webhook['secret']);
        
        $options = [
            'http' => [
                'header' => [
                    'Content-Type: application/json',
                    'X-Webhook-Signature: ' . $signature
                ],
                'method' => 'POST',
                'content' => json_encode($payload),
                'timeout' => 30
            ]
        ];
        
        $context = stream_context_create($options);
        $result = @file_get_contents($webhook['url'], false, $context);
        
        // Log resultado
        $this->logWebhookDelivery($webhook['id'], $event, $result !== false);
    }
    
    private function logWebhookDelivery($webhookId, $event, $success) {
        $query = "INSERT INTO webhook_logs (webhook_id, event, success, delivered_at)
                 VALUES (?, ?, ?, NOW())";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$webhookId, $event, $success ? 1 : 0]);
    }
    
    public function getWebhookLogs($webhookId, $limit = 50) {
        $query = "SELECT * FROM webhook_logs WHERE webhook_id = ? 
                 ORDER BY delivered_at DESC LIMIT ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$webhookId, $limit]);
        return $stmt->fetchAll();
    }
}
