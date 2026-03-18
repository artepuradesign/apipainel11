
<?php
// src/services/BankService.php

require_once __DIR__ . '/../models/BankAccount.php';

class BankService {
    private $db;
    private $bankAccount;
    
    public function __construct($db) {
        $this->db = $db;
        $this->bankAccount = new BankAccount($db);
    }
    
    public function addBankAccount($userId, $data) {
        try {
            $this->bankAccount->user_id = $userId;
            $this->bankAccount->bank_name = $data['bank_name'];
            $this->bankAccount->bank_code = $data['bank_code'];
            $this->bankAccount->agency = $data['agency'];
            $this->bankAccount->account_number = $data['account_number'];
            $this->bankAccount->account_type = $data['account_type'];
            $this->bankAccount->holder_name = $data['holder_name'];
            $this->bankAccount->holder_document = $data['holder_document'];
            $this->bankAccount->status = 'ativa';
            
            if ($this->bankAccount->create()) {
                return [
                    'success' => true,
                    'account_id' => $this->bankAccount->id
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Erro ao adicionar conta bancária'
            ];
        } catch (Exception $e) {
            error_log("BankService error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro interno do servidor'
            ];
        }
    }
    
    public function getUserBankAccounts($userId) {
        $query = "SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function validateBankAccount($bankCode, $agency, $account) {
        // Implementar validação específica por banco
        $validBanks = [
            '001' => 'Banco do Brasil',
            '104' => 'Caixa Econômica Federal',
            '237' => 'Bradesco',
            '341' => 'Itaú',
            '033' => 'Santander'
        ];
        
        if (!isset($validBanks[$bankCode])) {
            return [
                'success' => false,
                'message' => 'Código do banco inválido'
            ];
        }
        
        return [
            'success' => true,
            'bank_name' => $validBanks[$bankCode]
        ];
    }
    
    public function processTransfer($fromUserId, $toBankAccount, $amount) {
        try {
            $this->db->beginTransaction();
            
            // Verificar saldo
            $query = "SELECT saldo FROM usuarios WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$fromUserId]);
            $balance = $stmt->fetch()['saldo'] ?? 0;
            
            if ($balance < $amount) {
                throw new Exception('Saldo insuficiente');
            }
            
            // Debitar do usuário
            $query = "UPDATE usuarios SET saldo = saldo - ? WHERE id = ?";
            $stmt = $this->db->prepare($query);
            if (!$stmt->execute([$amount, $fromUserId])) {
                throw new Exception('Erro ao debitar saldo');
            }
            
            // Registrar transferência
            $query = "INSERT INTO bank_transfers (user_id, bank_account_id, amount, status, created_at)
                     VALUES (?, ?, ?, 'processando', NOW())";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$fromUserId, $toBankAccount, $amount]);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'transfer_id' => $this->db->lastInsertId()
            ];
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("BankService transfer error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}
