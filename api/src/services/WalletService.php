
<?php
// src/services/WalletService.php

class WalletService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function createTransaction($userId, $type, $amount, $description, $referenceType = null, $referenceId = null, $walletType = 'plan') {
        try {
            // Normalizar tipo de carteira: 'digital' e 'main' usam saldo principal
            $normalizedWalletType = ($walletType === 'plan') ? 'plan' : 'main';
            $balanceColumn = ($normalizedWalletType === 'main') ? 'saldo' : 'saldo_plano';
            // Buscar saldo atual
            $currentBalanceQuery = "SELECT {$balanceColumn} FROM users WHERE id = ?";
            $balanceStmt = $this->db->prepare($currentBalanceQuery);
            $balanceStmt->execute([$userId]);
            $currentBalance = (float)($balanceStmt->fetchColumn() ?: 0.00);
            
            // Calcular novo saldo
            $newBalance = $currentBalance;
            if (in_array($type, ['entrada', 'bonus', 'indicacao', 'recarga'])) {
                $newBalance += $amount;
            } elseif (in_array($type, ['saida', 'consulta', 'plano', 'saque'])) {
                $newBalance -= $amount;
                
                // Verificar se há saldo suficiente para débitos
                if ($newBalance < 0) {
                    throw new Exception('Saldo insuficiente para realizar a transação');
                }
            }
            
            // Log da transação para debug
            error_log("WALLET_SERVICE: Processando transação - User: {$userId}, Tipo: {$type}, Valor: R$ {$amount}, Saldo anterior: R$ {$currentBalance}, Novo saldo: R$ {$newBalance}");
            
            // Inserir transação na tabela wallet_transactions
            $transactionQuery = "INSERT INTO wallet_transactions (
                user_id, wallet_type, type, amount, balance_before, balance_after, 
                description, reference_type, reference_id, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', NOW())";
            
            $transactionStmt = $this->db->prepare($transactionQuery);
            $transactionStmt->execute([
                $userId,
                $normalizedWalletType,
                $type,
                $amount,
                $currentBalance,
                $newBalance,
                $description,
                $referenceType,
                $referenceId
            ]);
            
            // Atualizar saldo na tabela users
            $updateBalanceQuery = "UPDATE users SET 
                                  {$balanceColumn} = ?, 
                                  saldo_atualizado = 1,
                                  updated_at = NOW() 
                                  WHERE id = ?";
            $updateStmt = $this->db->prepare($updateBalanceQuery);
            $updateStmt->execute([$newBalance, $userId]);
            
            // Atualizar/Criar carteira na tabela user_wallets
            $this->updateUserWallet($userId, $normalizedWalletType, $newBalance);
            
            $transactionId = $this->db->lastInsertId();
            
            error_log("WALLET_TRANSACTION SUCCESS: ID {$transactionId}, User {$userId}, Tipo {$type}, Valor R$ {$amount}");
            
            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'balance_before' => $currentBalance,
                'balance_after' => $newBalance
            ];
            
        } catch (Exception $e) {
            error_log("WALLET_TRANSACTION ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    private function updateUserWallet($userId, $walletType, $newBalance) {
        try {
            // Verificar se carteira já existe
            $checkQuery = "SELECT id FROM user_wallets WHERE user_id = ? AND wallet_type = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId, $walletType]);
            
            if ($checkStmt->fetch()) {
                // Atualizar carteira existente
                $updateQuery = "UPDATE user_wallets SET 
                               current_balance = ?, 
                               available_balance = ?,
                               last_transaction_at = NOW(),
                               updated_at = NOW()
                               WHERE user_id = ? AND wallet_type = ?";
                $updateStmt = $this->db->prepare($updateQuery);
                $updateStmt->execute([$newBalance, $newBalance, $userId, $walletType]);
            } else {
                // Criar nova carteira
                $insertQuery = "INSERT INTO user_wallets (
                    user_id, wallet_type, current_balance, available_balance, 
                    status, last_transaction_at, created_at
                ) VALUES (?, ?, ?, ?, 'active', NOW(), NOW())";
                $insertStmt = $this->db->prepare($insertQuery);
                $insertStmt->execute([$userId, $walletType, $newBalance, $newBalance]);
            }
            
        } catch (Exception $e) {
            error_log("UPDATE_USER_WALLET ERROR: " . $e->getMessage());
        }
    }
    
    public function getUserBalance($userId) {
        $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return [
            'saldo' => (float)($result['saldo'] ?? 0.00),
            'saldo_plano' => (float)($result['saldo_plano'] ?? 0.00)
        ];
    }
    
    public function getUserTransactions($userId, $limit = 50, $offset = 0) {
        $query = "SELECT * FROM wallet_transactions 
                 WHERE user_id = ? 
                 ORDER BY created_at DESC 
                 LIMIT ? OFFSET ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
