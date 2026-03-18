<?php
// src/controllers/RechargeController.php

require_once __DIR__ . '/../services/RechargeService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';

class RechargeController {
    private $rechargeService;
    private $authMiddleware;
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
        $this->rechargeService = new RechargeService($db);
        $this->authMiddleware = new AuthMiddleware($db);
    }
    
    public function processRecharge() {
        try {
            // Validar autenticação
            if (!$this->authMiddleware->handle()) {
                return;
            }
            
            $currentUserId = AuthMiddleware::getCurrentUserId();
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input) {
                Response::error('JSON inválido', 400);
                return;
            }
            
            error_log("RECHARGE_CONTROLLER: Input recebido: " . json_encode($input));
            
            // Validar campos obrigatórios
            $required = ['amount', 'payment_method'];
            foreach ($required as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    Response::error("Campo obrigatório ausente: {$field}", 400);
                    return;
                }
            }
            
            // Usar o user_id do token (mais seguro) ou do input
            $userId = $currentUserId;
            if (isset($input['user_id']) && $input['user_id'] != $userId) {
                // Verificar se é admin tentando fazer recarga para outro usuário
                $userQuery = "SELECT user_role FROM users WHERE id = ?";
                $userStmt = $this->db->prepare($userQuery);
                $userStmt->execute([$currentUserId]);
                $currentUser = $userStmt->fetch(PDO::FETCH_ASSOC);
                
                if (!$currentUser || !in_array($currentUser['user_role'], ['admin', 'suporte'])) {
                    Response::error('Não autorizado a fazer recarga para outro usuário', 403);
                    return;
                }
                
                $userId = (int)$input['user_id'];
            }
            
            $amount = (float)$input['amount'];
            $paymentMethod = $input['payment_method'];
            $description = $input['description'] ?? null;
            
            $externalId = $input['external_id'] ?? null;
            
            error_log("RECHARGE_CONTROLLER: Processando recarga - User: {$userId}, Amount: {$amount}, Method: {$paymentMethod}");
            
            // Processar recarga usando o serviço
            $result = $this->rechargeService->processRecharge(
                $userId,
                $amount,
                $paymentMethod,
                $description,
                $externalId
            );
            
            if ($result['success']) {
                Response::success($result['data'], $result['message']);
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log("RECHARGE_CONTROLLER ERROR: " . $e->getMessage());
            Response::error('Erro interno: ' . $e->getMessage(), 500);
        }
    }
    
    public function getPixKeys() {
        try {
            $pixKeys = $this->rechargeService->getPixKeys();
            Response::success($pixKeys, 'Chaves PIX obtidas com sucesso');
        } catch (Exception $e) {
            error_log("GET_PIX_KEYS ERROR: " . $e->getMessage());
            Response::error('Erro ao obter chaves PIX', 500);
        }
    }
    
    public function validatePixPayment() {
        try {
            if (!$this->authMiddleware->handle()) {
                return;
            }
            
            $rawInput = file_get_contents('php://input');
            $input = json_decode($rawInput, true);
            
            if (!$input || !isset($input['pix_key']) || !isset($input['amount'])) {
                Response::error('Dados incompletos para validação PIX', 400);
                return;
            }
            
            $result = $this->rechargeService->validatePixPayment(
                $input['pix_key'],
                $input['amount'],
                $input['transaction_id'] ?? null
            );
            
            if ($result['success']) {
                Response::success($result, 'Pagamento PIX validado');
            } else {
                Response::error($result['message'], 400);
            }
            
        } catch (Exception $e) {
            error_log("VALIDATE_PIX_PAYMENT ERROR: " . $e->getMessage());
            Response::error('Erro ao validar pagamento PIX', 500);
        }
    }
    
    public function getRechargeHistory() {
        try {
            if (!$this->authMiddleware->handle()) {
                return;
            }
            
            $currentUserId = AuthMiddleware::getCurrentUserId();
            
            // Buscar histórico de recargas
            $query = "SELECT cc.*, u.full_name 
                     FROM central_cash cc 
                     LEFT JOIN users u ON cc.user_id = u.id 
                     WHERE cc.user_id = ? AND cc.transaction_type = 'recarga' 
                     ORDER BY cc.created_at DESC 
                     LIMIT 50";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$currentUserId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($history, 'Histórico de recargas obtido com sucesso');
            
        } catch (Exception $e) {
            error_log("GET_RECHARGE_HISTORY ERROR: " . $e->getMessage());
            Response::error('Erro ao obter histórico de recargas', 500);
        }
    }
}