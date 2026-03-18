
<?php
// src/controllers/HistoryController.php

require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class HistoryController {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getTransactions() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT 
                        id,
                        user_id,
                        valor as amount,
                        tipo as type,
                        descricao as description,
                        created_at,
                        'wallet' as balance_type
                      FROM transacoes 
                      WHERE user_id = ? 
                      ORDER BY created_at DESC 
                      LIMIT ? OFFSET ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId, $limit, $offset]);
            $transactions = $stmt->fetchAll();
            
            // Transformar os dados para o formato esperado pelo frontend
            $formattedTransactions = array_map(function($transaction) {
                return [
                    'id' => $transaction['id'],
                    'user_id' => $transaction['user_id'],
                    'amount' => floatval($transaction['amount']),
                    'type' => $this->mapTransactionType($transaction['type']),
                    'description' => $transaction['description'],
                    'created_at' => $transaction['created_at'],
                    'balance_type' => $transaction['balance_type']
                ];
            }, $transactions);
            
            Response::success($formattedTransactions);
        } catch (Exception $e) {
            Response::error('Erro ao buscar transações: ' . $e->getMessage(), 500);
        }
    }
    
    public function getReferralEarnings() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT 
                        id,
                        referrer_id,
                        referred_user_id,
                        commission_amount as amount,
                        created_at,
                        status
                      FROM indicacoes 
                      WHERE referrer_id = ? 
                      ORDER BY created_at DESC 
                      LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $referrals = $stmt->fetchAll();
            
            Response::success($referrals);
        } catch (Exception $e) {
            Response::error('Erro ao buscar indicações: ' . $e->getMessage(), 500);
        }
    }
    
    public function getConsultations() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT 
                        id,
                        user_id,
                        tipo,
                        documento,
                        resultado,
                        created_at as data,
                        5.0 as custo
                      FROM consultations 
                      WHERE user_id = ? 
                      ORDER BY created_at DESC 
                      LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $consultations = $stmt->fetchAll();
            
            Response::success($consultations);
        } catch (Exception $e) {
            Response::error('Erro ao buscar consultas: ' . $e->getMessage(), 500);
        }
    }
    
    public function getAllHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Buscar transações
            $transactionsQuery = "SELECT 
                                    id,
                                    user_id,
                                    valor as amount,
                                    tipo as type,
                                    descricao as description,
                                    created_at,
                                    'transaction' as source_type
                                  FROM transacoes 
                                  WHERE user_id = ?";
            
            // Buscar indicações
            $referralsQuery = "SELECT 
                                id,
                                referrer_id as user_id,
                                commission_amount as amount,
                                'referral_bonus' as type,
                                'Bônus de Indicação' as description,
                                created_at,
                                'referral' as source_type
                              FROM indicacoes 
                              WHERE referrer_id = ?";
            
            // Buscar consultas
            $consultationsQuery = "SELECT 
                                    id,
                                    user_id,
                                    -5.0 as amount,
                                    'debit' as type,
                                    CONCAT('Consulta ', tipo, ' - ', documento) as description,
                                    created_at,
                                    'consultation' as source_type
                                  FROM consultations 
                                  WHERE user_id = ?";
            
            $stmt1 = $this->db->prepare($transactionsQuery);
            $stmt1->execute([$userId]);
            $transactions = $stmt1->fetchAll(PDO::FETCH_ASSOC);
            $stmt1->closeCursor(); // Fechar cursor antes da próxima query
            
            $stmt2 = $this->db->prepare($referralsQuery);
            $stmt2->execute([$userId]);
            $referrals = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            $stmt2->closeCursor(); // Fechar cursor antes da próxima query
            
            $stmt3 = $this->db->prepare($consultationsQuery);
            $stmt3->execute([$userId]);
            $consultations = $stmt3->fetchAll(PDO::FETCH_ASSOC);
            $stmt3->closeCursor(); // Fechar cursor
            
            // Combinar todos os dados
            $allHistory = array_merge($transactions, $referrals, $consultations);
            
            // Ordenar por data
            usort($allHistory, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });
            
            Response::success(array_slice($allHistory, 0, 100));
        } catch (Exception $e) {
            Response::error('Erro ao buscar histórico completo: ' . $e->getMessage(), 500);
        }
    }
    
    public function clearTransactions() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "DELETE FROM transacoes WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            Response::success(['message' => 'Histórico de transações limpo com sucesso']);
        } catch (Exception $e) {
            Response::error('Erro ao limpar transações: ' . $e->getMessage(), 500);
        }
    }
    
    public function clearReferrals() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "DELETE FROM indicacoes WHERE referrer_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            Response::success(['message' => 'Histórico de indicações limpo com sucesso']);
        } catch (Exception $e) {
            Response::error('Erro ao limpar indicações: ' . $e->getMessage(), 500);
        }
    }
    
    public function clearConsultations() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "DELETE FROM consultations WHERE user_id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            Response::success(['message' => 'Histórico de consultas limpo com sucesso']);
        } catch (Exception $e) {
            Response::error('Erro ao limpar consultas: ' . $e->getMessage(), 500);
        }
    }
    
    public function clearAllHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $this->db->beginTransaction();
            
            $queries = [
                "DELETE FROM transacoes WHERE user_id = ?",
                "DELETE FROM indicacoes WHERE referrer_id = ?",
                "DELETE FROM consultations WHERE user_id = ?"
            ];
            
            foreach ($queries as $query) {
                $stmt = $this->db->prepare($query);
                $stmt->execute([$userId]);
            }
            
            $this->db->commit();
            
            Response::success(['message' => 'Todo o histórico foi limpo com sucesso']);
        } catch (Exception $e) {
            $this->db->rollback();
            Response::error('Erro ao limpar histórico: ' . $e->getMessage(), 500);
        }
    }
    
    private function mapTransactionType($tipo) {
        $typeMap = [
            'credito' => 'credit',
            'debito' => 'debit',
            'recarga' => 'recharge',
            'bonus' => 'bonus',
            'indicacao' => 'referral_bonus',
            'plano' => 'plan_credit'
        ];
        
        return $typeMap[$tipo] ?? $tipo;
    }
}
