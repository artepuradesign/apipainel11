
<?php
// src/controllers/PixController.php

require_once '../models/PixTransaction.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class PixController {
    private $db;
    private $pixTransaction;
    
    public function __construct($db) {
        $this->db = $db;
        $this->pixTransaction = new PixTransaction($db);
    }
    
    public function generatePixPayment() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['amount']) || $data['amount'] <= 0) {
            Response::error('Valor deve ser maior que zero', 400);
        }
        
        try {
            $this->pixTransaction->user_id = $userId;
            $this->pixTransaction->amount = $data['amount'];
            $this->pixTransaction->description = 'RECARGA PIX';
            $this->pixTransaction->status = 'pendente';
            $this->pixTransaction->pix_key = $_ENV['PIX_KEY'] ?? 'pix@apipainel.com';
            $this->pixTransaction->qr_code = $this->generateQRCode($data['amount']);
            $this->pixTransaction->transaction_id = uniqid('PIX_');
            
            if ($this->pixTransaction->create()) {
                $pixData = [
                    'transactionId' => $this->pixTransaction->transaction_id,
                    'amount' => (float)$this->pixTransaction->amount,
                    'pixKey' => $this->pixTransaction->pix_key,
                    'qrCode' => $this->pixTransaction->qr_code,
                    'status' => $this->pixTransaction->status
                ];
                
                Response::success($pixData, 'PIX gerado com sucesso', 201);
            } else {
                Response::error('Erro ao gerar PIX', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function getPixTransactions() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT * FROM pix_transactions WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $transactions = $stmt->fetchAll();
            
            $transactionData = array_map(function($transaction) {
                return [
                    'id' => (int)$transaction['id'],
                    'transactionId' => $transaction['transaction_id'],
                    'amount' => (float)$transaction['amount'],
                    'description' => $transaction['description'],
                    'status' => $transaction['status'],
                    'pixKey' => $transaction['pix_key'],
                    'createdAt' => $transaction['created_at']
                ];
            }, $transactions);
            
            Response::success($transactionData);
        } catch (Exception $e) {
            Response::error('Erro ao buscar transações PIX: ' . $e->getMessage(), 500);
        }
    }
    
    public function confirmPixPayment() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['transaction_id'])) {
            Response::error('ID da transação é obrigatório', 400);
        }
        
        try {
            $this->db->beginTransaction();
            
            // Buscar transação PIX
            $query = "SELECT * FROM pix_transactions WHERE transaction_id = ? AND status = 'pendente'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['transaction_id']]);
            $transaction = $stmt->fetch();
            
            if (!$transaction) {
                Response::error('Transação não encontrada', 404);
            }
            
            // Atualizar status da transação
            $updateQuery = "UPDATE pix_transactions SET status = 'confirmado' WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$transaction['id']]);
            
            // Adicionar saldo ao usuário
            $balanceQuery = "UPDATE usuarios SET saldo = saldo + ? WHERE id = ?";
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute([$transaction['amount'], $transaction['user_id']]);
            
            // Registrar transação de crédito
            $transQuery = "INSERT INTO transacoes (user_id, tipo, valor, descricao, status) 
                          VALUES (?, 'credito', ?, ?, 'concluida')";
            $transStmt = $this->db->prepare($transQuery);
            $transStmt->execute([
                $transaction['user_id'],
                $transaction['amount'],
                'RECARGA PIX - ' . $transaction['transaction_id']
            ]);
            
            $this->db->commit();
            
            Response::success(null, 'Pagamento PIX confirmado com sucesso');
        } catch (Exception $e) {
            $this->db->rollback();
            Response::error('Erro ao confirmar pagamento: ' . $e->getMessage(), 500);
        }
    }
    
    private function generateQRCode($amount) {
        // Implementação simplificada do QR Code PIX
        $pixKey = $_ENV['PIX_KEY'] ?? 'pix@apipainel.com';
        $merchant = $_ENV['PIX_MERCHANT'] ?? 'API Painel';
        
        $qrData = [
            'key' => $pixKey,
            'merchant' => $merchant,
            'amount' => $amount,
            'identifier' => uniqid()
        ];
        
        return base64_encode(json_encode($qrData));
    }
}
