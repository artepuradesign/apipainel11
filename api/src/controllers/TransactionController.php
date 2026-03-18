
<?php
// src/controllers/TransactionController.php

require_once '../models/Transaction.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class TransactionController {
    private $db;
    private $transaction;
    
    public function __construct($db) {
        $this->db = $db;
        $this->transaction = new Transaction($db);
    }
    
    public function getHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT * FROM transacoes WHERE user_id = ? 
                     ORDER BY created_at DESC LIMIT ? OFFSET ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            $transactions = $stmt->fetchAll();
            
            $countQuery = "SELECT COUNT(*) as total FROM transacoes WHERE user_id = ?";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute([$userId]);
            $total = (int)$countStmt->fetch()['total'];
            
            $history = array_map(function($transaction) {
                return [
                    'id' => (int)$transaction['id'],
                    'type' => $transaction['tipo'],
                    'amount' => (float)$transaction['valor'],
                    'description' => $transaction['descricao'],
                    'status' => $transaction['status'],
                    'createdAt' => $transaction['created_at']
                ];
            }, $transactions);
            
            Response::paginated($history, $total, $page, $limit);
        } catch (Exception $e) {
            Response::error('Erro ao buscar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT * FROM transacoes WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id, $userId]);
            $transaction = $stmt->fetch();
            
            if ($transaction) {
                $transactionData = [
                    'id' => (int)$transaction['id'],
                    'type' => $transaction['tipo'],
                    'amount' => (float)$transaction['valor'],
                    'description' => $transaction['descricao'],
                    'status' => $transaction['status'],
                    'createdAt' => $transaction['created_at']
                ];
                
                Response::success($transactionData);
            } else {
                Response::error('Transação não encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro ao buscar transação: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['tipo', 'valor'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
            }
        }
        
        try {
            $this->transaction->user_id = $userId;
            $this->transaction->tipo = $data['tipo'];
            $this->transaction->valor = $data['valor'];
            $this->transaction->descricao = $data['descricao'] ?? '';
            $this->transaction->status = $data['status'] ?? 'pendente';
            
            if ($this->transaction->create()) {
                Response::success(['id' => $this->transaction->id], 'Transação criada com sucesso', 201);
            } else {
                Response::error('Erro ao criar transação', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
}
