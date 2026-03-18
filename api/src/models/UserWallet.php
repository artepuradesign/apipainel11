
<?php
// src/models/UserWallet.php

require_once 'BaseModel.php';

class UserWallet extends BaseModel {
    protected $table = 'user_wallets';
    
    public function getByUser($userId) {
        return $this->getAll(['user_id' => $userId], 'wallet_type ASC');
    }
    
    public function getByUserAndType($userId, $walletType) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? AND wallet_type = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $walletType]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function updateBalance($userId, $walletType, $amount, $transactionType = 'main') {
        $wallet = $this->getByUserAndType($userId, $walletType);
        
        if (!$wallet) {
            // Criar carteira se não existir
            $walletData = [
                'user_id' => $userId,
                'wallet_type' => $walletType,
                'current_balance' => $amount,
                'available_balance' => $amount,
                'total_deposited' => $amount > 0 ? $amount : 0,
                'total_withdrawn' => 0,
                'total_spent' => $amount < 0 ? abs($amount) : 0,
                'status' => 'active',
                'last_transaction_at' => date('Y-m-d H:i:s')
            ];
            return $this->create($walletData);
        }
        
        $newBalance = $wallet['current_balance'] + $amount;
        $updateData = [
            'current_balance' => $newBalance,
            'available_balance' => $newBalance,
            'last_transaction_at' => date('Y-m-d H:i:s')
        ];
        
        if ($amount > 0) {
            $updateData['total_deposited'] = ($wallet['total_deposited'] ?? 0) + $amount;
        } else {
            $updateData['total_spent'] = ($wallet['total_spent'] ?? 0) + abs($amount);
        }
        
        return $this->update($wallet['id'], $updateData);
    }
    
    public function getTotalBalance($userId) {
        $query = "SELECT SUM(available_balance) as total FROM {$this->table} 
                 WHERE user_id = ? AND status = 'active'";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['total'] ?? 0;
    }
}
