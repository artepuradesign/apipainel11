
<?php
// src/services/PixService.php

require_once __DIR__ . '/../models/PixKey.php';
require_once __DIR__ . '/../models/Transaction.php';

class PixService {
    private $db;
    private $pixKey;
    private $transaction;
    
    public function __construct($db) {
        $this->db = $db;
        $this->pixKey = new PixKey($db);
        $this->transaction = new Transaction($db);
    }
    
    public function createPixKey($userId, $keyType, $keyValue) {
        try {
            // Validar tipo de chave
            if (!in_array($keyType, ['cpf', 'cnpj', 'email', 'telefone', 'aleatoria'])) {
                return [
                    'success' => false,
                    'message' => 'Tipo de chave PIX inválido'
                ];
            }
            
            // Verificar se a chave já existe
            if ($this->pixKeyExists($keyValue)) {
                return [
                    'success' => false,
                    'message' => 'Chave PIX já cadastrada'
                ];
            }
            
            $this->pixKey->user_id = $userId;
            $this->pixKey->key_type = $keyType;
            $this->pixKey->key_value = $keyValue;
            $this->pixKey->status = 'ativa';
            
            if ($this->pixKey->create()) {
                return [
                    'success' => true,
                    'pix_key_id' => $this->pixKey->id
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao criar chave PIX'
            ];
        } catch (Exception $e) {
            error_log("PixService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    public function generateQRCode($amount, $description, $pixKey = null) {
        try {
            // Gerar payload PIX
            $payload = $this->generatePixPayload($amount, $description, $pixKey);
            
            // Gerar código único para rastreamento
            $transactionId = uniqid('pix_');
            
            return [
                'success' => true,
                'qr_code' => $payload,
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'expires_in' => 300 // 5 minutos
            ];
        } catch (Exception $e) {
            error_log("PixService QR error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao gerar QR Code PIX'
            ];
        }
    }
    
    public function processPixPayment($transactionId, $amount, $userId) {
        try {
            $this->db->beginTransaction();
            
            // Criar transação
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = 'credito';
            $this->transaction->valor = $amount;
            $this->transaction->descricao = 'Recarga via PIX';
            $this->transaction->status = 'concluida';
            $this->transaction->reference = $transactionId;
            
            if (!$this->transaction->create()) {
                throw new Exception('Erro ao criar transação');
            }
            
            // Atualizar saldo do usuário
            $query = "UPDATE usuarios SET saldo = saldo + ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            if (!$stmt->execute([$amount, $userId])) {
                throw new Exception('Erro ao atualizar saldo');
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'new_balance' => $this->getUserBalance($userId)
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("PixService payment error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function createPixWithdrawal($userId, $amount, $pixKey) {
        try {
            $this->db->beginTransaction();
            
            // Verificar saldo
            $currentBalance = $this->getUserBalance($userId);
            if ($currentBalance < $amount) {
                return [
                    'success' => false,
                    'message' => 'Saldo insuficiente'
                ];
            }
            
            // Criar transação de saque
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = 'debito';
            $this->transaction->valor = $amount;
            $this->transaction->descricao = 'Saque via PIX';
            $this->transaction->status = 'pendente';
            $this->transaction->reference = 'pix_withdrawal_' . uniqid();
            
            if (!$this->transaction->create()) {
                throw new Exception('Erro ao criar transação de saque');
            }
            
            // Debitar saldo
            $query = "UPDATE usuarios SET saldo = saldo - ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            if (!$stmt->execute([$amount, $userId])) {
                throw new Exception('Erro ao debitar saldo');
            }
            
            $this->db->commit();
            
            return [
                'success' => true,
                'withdrawal_id' => $this->transaction->id,
                'status' => 'processando'
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("PixService withdrawal error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function pixKeyExists($keyValue) {
        $query = "SELECT id FROM pix_keys WHERE key_value = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$keyValue]);
        return $stmt->rowCount() > 0;
    }
    
    private function generatePixPayload($amount, $description, $pixKey) {
        // Simplificado - em produção usar biblioteca PIX adequada
        $payload = [
            'amount' => $amount,
            'description' => $description,
            'pix_key' => $pixKey ?? 'default@pix.com',
            'timestamp' => time()
        ];
        
        return base64_encode(json_encode($payload));
    }
    
    private function getUserBalance($userId) {
        $query = "SELECT saldo FROM usuarios WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $result = $stmt->fetch();
        return $result['saldo'] ?? 0;
    }
    
    public function getUserPixKeys($userId) {
        $query = "SELECT * FROM pix_keys WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function deletePixKey($keyId, $userId) {
        try {
            $query = "DELETE FROM pix_keys WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$keyId, $userId]) && $stmt->rowCount() > 0) {
                return [
                    'success' => true,
                    'message' => 'Chave PIX removida'
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Chave PIX não encontrada'
            ];
        } catch (Exception $e) {
            error_log("PixService delete error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao remover chave PIX'
            ];
        }
    }
}
