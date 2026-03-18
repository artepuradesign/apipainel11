
<?php
// src/controllers/BalanceController.php

require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class BalanceController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT saldo FROM usuarios WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $result = $stmt->fetch();
            
            if ($result) {
                Response::success([
                    'balance' => (float)$result['saldo'],
                    'formatted' => 'R$ ' . number_format($result['saldo'], 2, ',', '.')
                ]);
            } else {
                Response::error('Usuário não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro ao buscar saldo: ' . $e->getMessage(), 500);
        }
    }
    
    public function addBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['amount']) || $data['amount'] <= 0) {
            Response::error('Valor deve ser maior que zero', 400);
        }
        
        try {
            $this->db->beginTransaction();
            
            // Atualizar saldo do usuário
            $query = "UPDATE usuarios SET saldo = saldo + ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['amount'], $userId]);
            
            // Registrar transação
            $transQuery = "INSERT INTO transacoes (user_id, tipo, valor, descricao, status) 
                          VALUES (?, 'credito', ?, ?, 'concluida')";
            $transStmt = $this->db->prepare($transQuery);
            $transStmt->execute([
                $userId, 
                $data['amount'], 
                $data['description'] ?? 'Adição de saldo'
            ]);
            
            $this->db->commit();
            
            Response::success(null, 'Saldo adicionado com sucesso');
        } catch (Exception $e) {
            $this->db->rollback();
            Response::error('Erro ao adicionar saldo: ' . $e->getMessage(), 500);
        }
    }
    
    public function deductBalance() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['amount']) || $data['amount'] <= 0) {
            Response::error('Valor deve ser maior que zero', 400);
        }
        
        try {
            $this->db->beginTransaction();
            
            // Verificar saldo atual
            $balanceQuery = "SELECT saldo FROM usuarios WHERE id = ?";
            $balanceStmt = $this->db->prepare($balanceQuery);
            $balanceStmt->execute([$userId]);
            $currentBalance = (float)$balanceStmt->fetch()['saldo'];
            
            if ($currentBalance < $data['amount']) {
                Response::error('Saldo insuficiente', 400);
            }
            
            // Deduzir saldo
            $query = "UPDATE usuarios SET saldo = saldo - ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['amount'], $userId]);
            
            // Registrar transação
            $transQuery = "INSERT INTO transacoes (user_id, tipo, valor, descricao, status) 
                          VALUES (?, 'debito', ?, ?, 'concluida')";
            $transStmt = $this->db->prepare($transQuery);
            $transStmt->execute([
                $userId, 
                $data['amount'], 
                $data['description'] ?? 'Dedução de saldo'
            ]);
            
            $this->db->commit();
            
            Response::success(null, 'Saldo deduzido com sucesso');
        } catch (Exception $e) {
            $this->db->rollback();
            Response::error('Erro ao deduzir saldo: ' . $e->getMessage(), 500);
        }
    }
}
