
<?php
// src/controllers/BankAccountController.php

require_once '../models/BankAccount.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class BankAccountController {
    private $db;
    private $bankAccount;
    
    public function __construct($db) {
        $this->db = $db;
        $this->bankAccount = new BankAccount($db);
    }
    
    public function getMyAccounts() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $accounts = $stmt->fetchAll();
            
            $accountData = array_map(function($account) {
                return [
                    'id' => (int)$account['id'],
                    'bank' => $account['bank'],
                    'agency' => $account['agency'],
                    'account' => $account['account'],
                    'accountType' => $account['account_type'],
                    'holderName' => $account['holder_name'],
                    'holderDocument' => $account['holder_document'],
                    'status' => $account['status'],
                    'isDefault' => (bool)$account['is_default'],
                    'createdAt' => $account['created_at']
                ];
            }, $accounts);
            
            Response::success($accountData);
        } catch (Exception $e) {
            Response::error('Erro ao buscar contas: ' . $e->getMessage(), 500);
        }
    }
    
    public function addAccount() {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required = ['bank', 'agency', 'account', 'account_type', 'holder_name', 'holder_document'];
        foreach ($required as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
            }
        }
        
        try {
            $this->bankAccount->user_id = $userId;
            $this->bankAccount->bank = $data['bank'];
            $this->bankAccount->agency = $data['agency'];
            $this->bankAccount->account = $data['account'];
            $this->bankAccount->account_type = $data['account_type'];
            $this->bankAccount->holder_name = $data['holder_name'];
            $this->bankAccount->holder_document = $data['holder_document'];
            $this->bankAccount->status = 'pendente';
            $this->bankAccount->is_default = $data['is_default'] ?? false;
            
            // Se for conta padrão, remover padrão das outras
            if ($this->bankAccount->is_default) {
                $updateQuery = "UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$userId]);
            }
            
            if ($this->bankAccount->create()) {
                Response::success(['id' => $this->bankAccount->id], 'Conta bancária adicionada com sucesso', 201);
            } else {
                Response::error('Erro ao adicionar conta', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function updateAccount($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->bankAccount->id = $id;
            $this->bankAccount->user_id = $userId;
            
            if ($this->bankAccount->readOne()) {
                if (isset($data['bank'])) $this->bankAccount->bank = $data['bank'];
                if (isset($data['agency'])) $this->bankAccount->agency = $data['agency'];
                if (isset($data['account'])) $this->bankAccount->account = $data['account'];
                if (isset($data['account_type'])) $this->bankAccount->account_type = $data['account_type'];
                if (isset($data['holder_name'])) $this->bankAccount->holder_name = $data['holder_name'];
                if (isset($data['holder_document'])) $this->bankAccount->holder_document = $data['holder_document'];
                if (isset($data['is_default'])) $this->bankAccount->is_default = $data['is_default'];
                
                // Se for conta padrão, remover padrão das outras
                if (isset($data['is_default']) && $data['is_default']) {
                    $updateQuery = "UPDATE bank_accounts SET is_default = 0 WHERE user_id = ? AND id != ?";
                    $updateStmt = $this->db->prepare($updateQuery);
                    $updateStmt->execute([$userId, $id]);
                }
                
                if ($this->bankAccount->update()) {
                    Response::success(null, 'Conta atualizada com sucesso');
                } else {
                    Response::error('Erro ao atualizar conta', 400);
                }
            } else {
                Response::error('Conta não encontrada', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function deleteAccount($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "DELETE FROM bank_accounts WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute([$id, $userId])) {
                Response::success(null, 'Conta deletada com sucesso');
            } else {
                Response::error('Erro ao deletar conta', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
}
