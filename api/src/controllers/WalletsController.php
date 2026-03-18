
<?php
// src/controllers/WalletsController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/UserWallet.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class WalletsController {
    private $db;
    private $walletModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->walletModel = new UserWallet($db);
    }
    
    public function getByUser($userId) {
        try {
            $wallets = $this->walletModel->getByUser($userId);
            
            $formattedWallets = array_map(function($wallet) {
                return [
                    'id' => (int)$wallet['id'],
                    'user_id' => (int)$wallet['user_id'],
                    'wallet_type' => $wallet['wallet_type'],
                    'current_balance' => (float)$wallet['current_balance'],
                    'available_balance' => (float)$wallet['available_balance'],
                    'frozen_balance' => (float)$wallet['frozen_balance'],
                    'total_deposited' => (float)$wallet['total_deposited'],
                    'total_withdrawn' => (float)$wallet['total_withdrawn'],
                    'total_spent' => (float)$wallet['total_spent'],
                    'currency' => $wallet['currency'],
                    'status' => $wallet['status'],
                    'last_transaction_at' => $wallet['last_transaction_at'],
                    'created_at' => $wallet['created_at'],
                    'updated_at' => $wallet['updated_at']
                ];
            }, $wallets);
            
            Response::success($formattedWallets);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar carteiras: ' . $e->getMessage(), 500);
        }
    }
    
    public function getTotalBalance($userId) {
        try {
            $totalBalance = $this->walletModel->getTotalBalance($userId);
            
            Response::success([
                'user_id' => (int)$userId,
                'total_balance' => (float)$totalBalance
            ]);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar saldo total: ' . $e->getMessage(), 500);
        }
    }
    
    public function createTransaction() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Validação
            $required = ['user_id', 'wallet_type', 'amount', 'type'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    Response::error("Campo '{$field}' é obrigatório", 400);
                    return;
                }
            }
            
            $this->db->beginTransaction();
            
            // Atualizar saldo da carteira
            $result = $this->walletModel->updateBalance(
                $data['user_id'],
                $data['wallet_type'],
                $data['amount'],
                $data['type']
            );
            
            if ($result) {
                // Registrar transação
                $transactionData = [
                    'user_id' => $data['user_id'],
                    'wallet_type' => $data['wallet_type'],
                    'type' => $data['type'],
                    'amount' => $data['amount'],
                    'balance_before' => $data['balance_before'] ?? 0,
                    'balance_after' => $data['balance_after'] ?? 0,
                    'description' => $data['description'] ?? '',
                    'reference_id' => $data['reference_id'] ?? null,
                    'reference_type' => $data['reference_type'] ?? null,
                    'payment_method' => $data['payment_method'] ?? null,
                    'external_transaction_id' => $data['external_transaction_id'] ?? null,
                    'status' => $data['status'] ?? 'completed',
                    'metadata' => json_encode($data['metadata'] ?? [])
                ];
                
                $query = "INSERT INTO wallet_transactions (
                    user_id, wallet_type, type, amount, balance_before, balance_after,
                    description, reference_id, reference_type, payment_method,
                    external_transaction_id, status, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $this->db->prepare($query);
                $stmt->execute([
                    $transactionData['user_id'],
                    $transactionData['wallet_type'],
                    $transactionData['type'],
                    $transactionData['amount'],
                    $transactionData['balance_before'],
                    $transactionData['balance_after'],
                    $transactionData['description'],
                    $transactionData['reference_id'],
                    $transactionData['reference_type'],
                    $transactionData['payment_method'],
                    $transactionData['external_transaction_id'],
                    $transactionData['status'],
                    $transactionData['metadata']
                ]);
                
                $transactionId = $this->db->lastInsertId();
                
                $this->db->commit();
                
                Response::success([
                    'transaction_id' => $transactionId,
                    'wallet_updated' => true
                ], 'Transação processada com sucesso', 201);
            } else {
                $this->db->rollback();
                Response::error('Erro ao processar transação', 500);
            }
            
        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollback();
            }
            Response::error('Erro ao processar transação: ' . $e->getMessage(), 500);
        }
    }
    
    public function getAll() {
        try {
            $wallets = $this->walletModel->getAll([], 'user_id ASC, wallet_type ASC');
            
            $formattedWallets = array_map(function($wallet) {
                return [
                    'id' => (int)$wallet['id'],
                    'user_id' => (int)$wallet['user_id'],
                    'wallet_type' => $wallet['wallet_type'],
                    'current_balance' => (float)$wallet['current_balance'],
                    'available_balance' => (float)$wallet['available_balance'],
                    'status' => $wallet['status'],
                    'created_at' => $wallet['created_at']
                ];
            }, $wallets);
            
            Response::success($formattedWallets);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar carteiras: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $wallet = $this->walletModel->getById($id);
            
            if (!$wallet) {
                Response::error('Carteira não encontrada', 404);
                return;
            }
            
            $formattedWallet = [
                'id' => (int)$wallet['id'],
                'user_id' => (int)$wallet['user_id'],
                'wallet_type' => $wallet['wallet_type'],
                'current_balance' => (float)$wallet['current_balance'],
                'available_balance' => (float)$wallet['available_balance'],
                'frozen_balance' => (float)$wallet['frozen_balance'],
                'total_deposited' => (float)$wallet['total_deposited'],
                'total_withdrawn' => (float)$wallet['total_withdrawn'],
                'total_spent' => (float)$wallet['total_spent'],
                'currency' => $wallet['currency'],
                'status' => $wallet['status'],
                'last_transaction_at' => $wallet['last_transaction_at'],
                'created_at' => $wallet['created_at'],
                'updated_at' => $wallet['updated_at']
            ];
            
            Response::success($formattedWallet);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar carteira: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            // Validação
            $required = ['user_id', 'wallet_type'];
            foreach ($required as $field) {
                if (!isset($data[$field])) {
                    Response::error("Campo '{$field}' é obrigatório", 400);
                    return;
                }
            }
            
            $walletData = [
                'user_id' => $data['user_id'],
                'wallet_type' => $data['wallet_type'],
                'current_balance' => $data['current_balance'] ?? 0.00,
                'available_balance' => $data['available_balance'] ?? 0.00,
                'frozen_balance' => $data['frozen_balance'] ?? 0.00,
                'currency' => $data['currency'] ?? 'BRL',
                'status' => $data['status'] ?? 'active'
            ];
            
            $walletId = $this->walletModel->create($walletData);
            
            if ($walletId) {
                Response::success(['id' => $walletId], 'Carteira criada com sucesso', 201);
            } else {
                Response::error('Erro ao criar carteira', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao criar carteira: ' . $e->getMessage(), 500);
        }
    }
    
    public function update($id) {
        try {
            $data = json_decode(file_get_contents("php://input"), true);
            
            $wallet = $this->walletModel->getById($id);
            if (!$wallet) {
                Response::error('Carteira não encontrada', 404);
                return;
            }
            
            $updateData = [];
            $allowedFields = ['current_balance', 'available_balance', 'frozen_balance', 'status'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
            
            if (empty($updateData)) {
                Response::error('Nenhum dado válido para atualização', 400);
                return;
            }
            
            $result = $this->walletModel->update($id, $updateData);
            
            if ($result) {
                Response::success(null, 'Carteira atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar carteira', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar carteira: ' . $e->getMessage(), 500);
        }
    }
}
