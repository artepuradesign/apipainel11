<?php
// src/controllers/ReferralTestController.php

require_once __DIR__ . '/../controllers/ReferralController.php';
require_once __DIR__ . '/../utils/Response.php';

class ReferralTestController {
    private $db;
    private $referralController;
    
    public function __construct($db) {
        $this->db = $db;
        $this->referralController = new ReferralController($db);
    }
    
    /**
     * Verifica dados de indicação no cadastro
     */
    public function verifyRegistrationData() {
        try {
            header('Content-Type: application/json; charset=utf-8');
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['user_id'])) {
                Response::error('user_id é obrigatório', 400);
                return;
            }
            
            $userId = (int)$input['user_id'];
            
            // Buscar dados do usuário
            $userQuery = "SELECT 
                            id, full_name, email, indicador_id, codigo_usado_indicacao,
                            saldo_plano, created_at
                          FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::error('Usuário não encontrado', 404);
                return;
            }
            
            // Buscar dados da indicação se existir
            $indicacaoData = null;
            if ($user['indicador_id']) {
                $indicacaoQuery = "SELECT * FROM indicacoes 
                                  WHERE indicado_id = ? AND indicador_id = ?";
                $indicacaoStmt = $this->db->prepare($indicacaoQuery);
                $indicacaoStmt->execute([$userId, $user['indicador_id']]);
                $indicacaoData = $indicacaoStmt->fetch(PDO::FETCH_ASSOC);
            }
            
            // Buscar transações relacionadas
            $transactionsQuery = "SELECT * FROM wallet_transactions 
                                 WHERE user_id = ? AND reference_type = 'indicacao'
                                 ORDER BY created_at DESC";
            $transactionsStmt = $this->db->prepare($transactionsQuery);
            $transactionsStmt->execute([$userId]);
            $transactions = $transactionsStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Buscar carteira do usuário
            $walletQuery = "SELECT * FROM user_wallets WHERE user_id = ? AND wallet_type = 'plan'";
            $walletStmt = $this->db->prepare($walletQuery);
            $walletStmt->execute([$userId]);
            $wallet = $walletStmt->fetch(PDO::FETCH_ASSOC);
            
            // Buscar auditoria
            $auditQuery = "SELECT * FROM user_audit 
                          WHERE user_id = ? AND category = 'referral'
                          ORDER BY created_at DESC LIMIT 5";
            $auditStmt = $this->db->prepare($auditQuery);
            $auditStmt->execute([$userId]);
            $audit = $auditStmt->fetchAll(PDO::FETCH_ASSOC);
            
            $response = [
                'user_data' => $user,
                'indicacao_data' => $indicacaoData,
                'wallet_data' => $wallet,
                'transactions' => $transactions,
                'audit_records' => $audit,
                'has_referral' => !empty($user['indicador_id']),
                'bonus_processed' => !empty($indicacaoData) && $indicacaoData['bonus_paid'] == 1
            ];
            
            Response::success($response, 'Dados de verificação coletados');
            
        } catch (Exception $e) {
            error_log("VERIFY_REGISTRATION_DATA ERROR: " . $e->getMessage());
            Response::error('Erro ao verificar dados de indicação', 500);
        }
    }
}