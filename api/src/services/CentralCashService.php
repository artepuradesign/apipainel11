<?php
// src/services/CentralCashService.php

class CentralCashService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function addTransaction($transactionType, $amount, $balanceBefore, $balanceAfter, $userId, $createdBy, $description, $paymentMethod = null, $referenceTable = null, $referenceId = null, $externalId = null) {
        try {
            // Inserir transação no caixa central com todos os campos da especificação
            $insertQuery = "INSERT INTO central_cash (
                transaction_type, amount, balance_before, balance_after, 
                user_id, created_by, description, payment_method, 
                reference_table, reference_id, external_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $insertStmt = $this->db->prepare($insertQuery);
            $insertStmt->execute([
                $transactionType,
                $amount,
                $balanceBefore,
                $balanceAfter,
                $userId,
                $createdBy,
                $description,
                $paymentMethod,
                $referenceTable,
                $referenceId,
                $externalId
            ]);
            
            $transactionId = $this->db->lastInsertId();
            
            error_log("CENTRAL_CASH SUCCESS: Transaction ID {$transactionId}, Type {$transactionType}, Amount R$ {$amount}");
            
            return [
                'success' => true,
                'data' => [
                    'id' => $transactionId,
                    'balance_before' => $balanceBefore,
                    'balance_after' => $balanceAfter
                ]
            ];
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    // Método específico para recargas com cupom
    public function addRechargeWithCupom($valorPago, $valorCompleto, $cupomCodigo, $descontoValor, $userId, $paymentMethod) {
        try {
            // Buscar saldo atual do caixa central
            $currentBalanceQuery = "SELECT COALESCE(SUM(
                CASE 
                    WHEN transaction_type IN ('entrada', 'recarga', 'comissao', 'plano') THEN amount
                    WHEN transaction_type IN ('saida', 'consulta', 'saque', 'estorno') THEN -amount
                    ELSE 0
                END
            ), 0.00) as balance FROM central_cash";
            
            $balanceStmt = $this->db->prepare($currentBalanceQuery);
            $balanceStmt->execute();
            $currentBalance = (float)$balanceStmt->fetchColumn();
            
            // Calcular novo saldo
            $newBalance = $currentBalance + $valorPago; // Apenas o valor pago entra no caixa
            
            // Inserir transação no caixa central
            $insertQuery = "INSERT INTO central_cash (
                transaction_type, amount, balance_before, balance_after, 
                description, user_id, payment_method, reference_table, reference_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'cupom_recharges', NULL, NOW())";
            
            $description = "Recarga com cupom {$cupomCodigo} - Valor original: R$ {$valorCompleto}, Desconto: R$ {$descontoValor}, Cobrado: R$ {$valorPago}";
            
            $insertStmt = $this->db->prepare($insertQuery);
            $insertStmt->execute([
                'recarga',
                $valorPago,
                $currentBalance,
                $newBalance,
                $description,
                $userId,
                $paymentMethod
            ]);
            
            $transactionId = $this->db->lastInsertId();
            
            error_log("CENTRAL_CASH CUPOM SUCCESS: Transaction ID {$transactionId}, Paid: R$ {$valorPago}, Original: R$ {$valorCompleto}");
            
            return [
                'success' => true,
                'data' => [
                    'id' => $transactionId,
                    'balance_before' => $currentBalance,
                    'balance_after' => $newBalance,
                    'amount_paid' => $valorPago,
                    'amount_original' => $valorCompleto,
                    'discount' => $descontoValor
                ]
            ];
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH CUPOM ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    // Método legado para compatibilidade
    public function addTransactionLegacy($type, $amount, $description, $userId = null, $metadata = null) {
        try {
            // Buscar saldo atual do caixa central
            $currentBalanceQuery = "SELECT COALESCE(SUM(
                CASE 
                    WHEN transaction_type IN ('entrada', 'recarga', 'comissao', 'plano') THEN amount
                    WHEN transaction_type IN ('saida', 'consulta', 'saque', 'estorno') THEN -amount
                    ELSE 0
                END
            ), 0.00) as balance FROM central_cash";
            
            $balanceStmt = $this->db->prepare($currentBalanceQuery);
            $balanceStmt->execute();
            $currentBalance = (float)$balanceStmt->fetchColumn();
            
            // Calcular novo saldo
            $newBalance = $currentBalance;
            if (in_array($type, ['entrada', 'recarga', 'comissao', 'plano', 'deposit'])) {
                $newBalance += $amount;
                $mappedType = $type === 'deposit' ? 'recarga' : $type;
            } elseif (in_array($type, ['saida', 'consulta', 'saque', 'estorno', 'withdrawal'])) {
                $newBalance -= $amount;
                $mappedType = $type === 'withdrawal' ? 'saque' : $type;
            } else {
                $mappedType = $type;
            }
            
            // Inserir transação no caixa central
            $insertQuery = "INSERT INTO central_cash (
                transaction_type, amount, balance_before, balance_after, 
                description, user_id, metadata, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $insertStmt = $this->db->prepare($insertQuery);
            $insertStmt->execute([
                $mappedType,
                $amount,
                $currentBalance,
                $newBalance,
                $description,
                $userId,
                $metadata
            ]);
            
            $transactionId = $this->db->lastInsertId();
            
            error_log("CENTRAL_CASH SUCCESS: Transaction ID {$transactionId}, Type {$mappedType}, Amount R$ {$amount}");
            
            return [
                'success' => true,
                'data' => [
                    'id' => $transactionId,
                    'balance_before' => $currentBalance,
                    'balance_after' => $newBalance
                ]
            ];
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH ERROR: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    public function getCurrentBalance() {
        try {
            $query = "SELECT COALESCE(SUM(
                CASE 
                    WHEN transaction_type IN ('entrada', 'recarga', 'comissao', 'plano') THEN amount
                    WHEN transaction_type IN ('saida', 'consulta', 'saque', 'estorno') THEN -amount
                    ELSE 0
                END
            ), 0.00) as balance FROM central_cash";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            return (float)$stmt->fetchColumn();
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH GET_BALANCE ERROR: " . $e->getMessage());
            return 0.00;
        }
    }
    
    public function getTransactions($limit = 50, $offset = 0) {
        try {
            $query = "SELECT * FROM central_cash 
                     ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$limit, $offset]);
            
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
            
        } catch (Exception $e) {
            error_log("CENTRAL_CASH GET_TRANSACTIONS ERROR: " . $e->getMessage());
            return [];
        }
    }
}