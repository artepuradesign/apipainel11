<?php
// src/controllers/RevendasController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/RevendasModel.php';
require_once __DIR__ . '/../models/RevendaStatusModel.php';

class RevendasController {
    private $db;
    private $revendasModel;
    private $revendaStatusModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->revendasModel = new RevendasModel($db);
        $this->revendaStatusModel = new RevendaStatusModel($db);
    }
    
    /**
     * Obter status da revenda de um usuário
     */
    public function getRevendaStatus($userId) {
        try {
            error_log("REVENDAS_CONTROLLER getRevendaStatus: Buscando status para user: {$userId}");
            error_log("REVENDAS_CONTROLLER getRevendaStatus: SESSION=" . json_encode($_SESSION ?? []));
            
            $status = $this->revendaStatusModel->findByUserId($userId);
            
            if (!$status) {
                Response::success([
                    'id' => null,
                    'user_id' => (int)$userId,
                    'is_active' => false,
                    'commission_percentage' => 10.00,
                    'created_at' => null,
                    'updated_at' => null
                ]);
                return;
            }
            
            Response::success($status);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao buscar status: " . $e->getMessage());
            // Fallback seguro: retornar status inativo para não quebrar a página
            Response::success([
                'id' => null,
                'user_id' => (int)$userId,
                'is_active' => false,
                'commission_percentage' => 10.00,
                'created_at' => null,
                'updated_at' => null
            ]);
        }
    }
    
    /**
     * Ativar/desativar revenda
     */
    public function toggleRevendaStatus() {
        try {
            error_log("REVENDAS_CONTROLLER toggleRevendaStatus: SESSION=" . json_encode($_SESSION ?? []));
            
            $data = json_decode(file_get_contents('php://input'), true);
            error_log("REVENDAS_CONTROLLER toggleRevendaStatus: DATA=" . json_encode($data));
            
            $userId = $data['user_id'] ?? null;
            $isActive = $data['is_active'] ?? false;
            
            if (!$userId) {
                error_log("REVENDAS_CONTROLLER toggleRevendaStatus ERROR: user_id não fornecido!");
                Response::error('ID do usuário é obrigatório', 400);
                return;
            }
            
            error_log("REVENDAS_CONTROLLER: Toggle revenda - User: {$userId}, Active: " . ($isActive ? 'true' : 'false'));
            
            // Verificar se já existe registro
            $existing = $this->revendaStatusModel->findByUserId($userId);
            
            if ($existing) {
                // Atualizar registro existente
                $success = $this->revendaStatusModel->update($existing['id'], [
                    'is_active' => $isActive ? 1 : 0,
                    'updated_at' => date('Y-m-d H:i:s')
                ]);
                
                if (!$success) {
                    Response::error('Erro ao atualizar status de revenda', 500);
                    return;
                }
                
                $status = $this->revendaStatusModel->findById($existing['id']);
            } else {
                // Criar novo registro
                $statusId = $this->revendaStatusModel->create([
                    'user_id' => $userId,
                    'is_active' => $isActive ? 1 : 0,
                    'commission_percentage' => 10.00
                ]);
                
                if (!$statusId) {
                    Response::error('Erro ao criar status de revenda', 500);
                    return;
                }
                
                $status = $this->revendaStatusModel->findById($statusId);
            }
            
            error_log("REVENDAS_CONTROLLER: Status atualizado com sucesso");
            
            Response::success($status);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao toggle revenda: " . $e->getMessage());
            Response::error('Erro ao atualizar status de revenda', 500);
        }
    }
    
    /**
     * Validar código de revenda (público)
     */
    public function validateReferralCode($code) {
        try {
            error_log("REVENDAS_CONTROLLER: Validando código: {$code}");
            
            // Buscar usuário pelo código de indicação
            $query = "SELECT id, nome, codigo_indicacao FROM users WHERE codigo_indicacao = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                Response::success([
                    'valid' => false,
                    'message' => 'Código de revenda inválido'
                ]);
                return;
            }
            
            Response::success([
                'valid' => true,
                'message' => 'Código válido',
                'referrer_name' => $user['nome'] ?? 'Revendedor'
            ]);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao validar código: " . $e->getMessage());
            Response::error('Erro ao validar código de revenda', 500);
        }
    }
    
    /**
     * Processar bônus de cadastro (mantém sistema original)
     */
    public function processRegistrationBonus() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $data['user_id'] ?? null;
            $referralCode = $data['referral_code'] ?? null;
            
            if (!$userId || !$referralCode) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            error_log("REVENDAS_CONTROLLER: Processando bônus de cadastro - User: {$userId}, Code: {$referralCode}");
            
            // Buscar usuário pelo código
            $query = "SELECT id FROM users WHERE codigo_indicacao = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$referralCode]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$referrer) {
                Response::error('Código de revenda inválido', 404);
                return;
            }
            
            $referrerId = $referrer['id'];
            
            // Verificar se já existe indicação
            $existingRevenda = $this->revendasModel->findByIndicadoId($userId);
            
            if ($existingRevenda) {
                Response::success([
                    'bonus_processed' => false,
                    'message' => 'Usuário já possui indicação registrada',
                    'referred_bonus' => 0,
                    'referrer_bonus' => 0,
                    'referral_code' => $referralCode
                ]);
                return;
            }
            
            // Criar registro de revenda
            $revendaId = $this->revendasModel->create([
                'revendedor_id' => $referrerId,
                'indicado_id' => $userId,
                'codigo_revenda' => $referralCode,
                'status' => 'pendente'
            ]);
            
            if (!$revendaId) {
                Response::error('Erro ao criar registro de revenda', 500);
                return;
            }
            
            error_log("REVENDAS_CONTROLLER: Revenda criada - ID: {$revendaId}. Sistema de bônus de cadastro continua funcionando normalmente via API principal.");
            
            Response::success([
                'bonus_processed' => true,
                'message' => 'Indicação registrada! Bônus de cadastro será processado automaticamente.',
                'referred_bonus' => 0, // Processado pela API principal
                'referrer_bonus' => 0, // Processado pela API principal
                'referral_code' => $referralCode,
                'revenda_id' => $revendaId
            ]);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao processar bônus: " . $e->getMessage());
            Response::error('Erro ao processar bônus de cadastro', 500);
        }
    }
    
    /**
     * Processar comissão de 10% na ativação do plano (ADICIONAL ao bônus)
     */
    public function processPlanActivationCommission() {
        try {
            $data = json_decode(file_get_contents('php://input'), true);
            $userId = $data['user_id'] ?? null;
            $planId = $data['plan_id'] ?? null;
            $planValue = $data['plan_value'] ?? null;
            
            if (!$userId || !$planId || !$planValue) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            error_log("REVENDAS_CONTROLLER: Processando comissão - User: {$userId}, Plano: {$planId}, Valor: R$ {$planValue}");
            
            // Buscar revenda do usuário
            $revenda = $this->revendasModel->findByIndicadoId($userId);
            
            if (!$revenda) {
                Response::success([
                    'commission_processed' => false,
                    'message' => 'Usuário não possui indicação',
                    'commission_amount' => 0
                ]);
                return;
            }
            
            // Verificar se o revendedor tem o programa ativo
            $revendaStatus = $this->revendaStatusModel->findByUserId($revenda['revendedor_id']);
            
            if (!$revendaStatus || !$revendaStatus['is_active']) {
                error_log("REVENDAS_CONTROLLER: Revendedor não tem programa ativo - sem comissão");
                Response::success([
                    'commission_processed' => false,
                    'message' => 'Revendedor não participa do programa de comissões',
                    'commission_amount' => 0
                ]);
                return;
            }
            
            // Verificar se já processou comissão
            if ($revenda['status'] === 'ativo' && $revenda['plano_contratado_id'] == $planId) {
                Response::success([
                    'commission_processed' => false,
                    'message' => 'Comissão já processada',
                    'commission_amount' => 0
                ]);
                return;
            }
            
            // Calcular comissão de 10%
            $commissionAmount = $planValue * 0.10;
            
            error_log("REVENDAS_CONTROLLER: Comissão calculada: R$ {$commissionAmount}");
            
            // Atualizar saldo do revendedor (SALDO DO PLANO)
            $queryUpdateBalance = "UPDATE users SET saldo_plano = saldo_plano + ? WHERE id = ?";
            $stmtBalance = $this->db->prepare($queryUpdateBalance);
            $balanceUpdated = $stmtBalance->execute([$commissionAmount, $revenda['revendedor_id']]);
            
            if (!$balanceUpdated) {
                Response::error('Erro ao atualizar saldo do revendedor', 500);
                return;
            }
            
            // Atualizar registro de revenda
            $this->revendasModel->update($revenda['id'], [
                'status' => 'ativo',
                'plano_contratado_id' => $planId,
                'valor_plano' => $planValue,
                'comissao_paga' => $commissionAmount,
                'total_comissao' => $revenda['total_comissao'] + $commissionAmount,
                'data_ativacao_plano' => date('Y-m-d H:i:s'),
                'data_pagamento_comissao' => date('Y-m-d H:i:s')
            ]);
            
            error_log("REVENDAS_CONTROLLER: Comissão processada com sucesso - R$ {$commissionAmount} (ADICIONAL ao bônus de cadastro)");
            
            Response::success([
                'commission_processed' => true,
                'message' => 'Comissão de 10% creditada (adicional ao bônus de cadastro)',
                'commission_amount' => $commissionAmount,
                'commission_percentage' => 10.00,
                'plan_value' => $planValue,
                'referrer_id' => $revenda['revendedor_id']
            ]);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao processar comissão: " . $e->getMessage());
            Response::error('Erro ao processar comissão', 500);
        }
    }
    
    /**
     * Dashboard com estatísticas do revendedor
     */
    public function getDashboard() {
        try {
            // Debug completo
            error_log("REVENDAS_CONTROLLER getDashboard: SESSION=" . json_encode($_SESSION ?? []));
            error_log("REVENDAS_CONTROLLER getDashboard: session_status=" . session_status());
            error_log("REVENDAS_CONTROLLER getDashboard: session_id=" . (session_id() ?: 'NONE'));
            error_log("REVENDAS_CONTROLLER getDashboard: HEADERS=" . json_encode(getallheaders()));
            
            // Priorizar user_id do AuthMiddleware (via token JWT)
            require_once __DIR__ . '/../middleware/AuthMiddleware.php';
            $userId = AuthMiddleware::getCurrentUserId();
            
            // Fallback para sessão PHP
            if (!$userId) {
                $userId = $_SESSION['user_id'] ?? null;
            }
            
            // Fallback para Authorization header manual
            if (!$userId) {
                $headers = getallheaders();
                $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
                if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
                    $token = substr($authHeader, 7);
                    error_log("REVENDAS_CONTROLLER getDashboard: Token encontrado: " . substr($token, 0, 20) . "...");
                    
                    // Buscar user_id do token na tabela sessions
                    try {
                        $query = "SELECT user_id FROM sessions WHERE session_token = ? AND expires_at > NOW() LIMIT 1";
                        $stmt = $this->db->prepare($query);
                        $stmt->execute([$token]);
                        $session = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($session) {
                            $userId = $session['user_id'];
                            error_log("REVENDAS_CONTROLLER getDashboard: user_id encontrado via token: {$userId}");
                        }
                    } catch (Exception $e) {
                        error_log("REVENDAS_CONTROLLER getDashboard: Erro ao buscar sessão: " . $e->getMessage());
                    }
                }
            }
            
            error_log("REVENDAS_CONTROLLER getDashboard: user_id obtido=" . ($userId ?: 'NULL'));
            
            if (!$userId) {
                error_log("REVENDAS_CONTROLLER getDashboard ERROR: user_id não encontrado!");
                Response::error('Usuário não autenticado. Faça login novamente.', 401);
                return;
            }
            
            error_log("REVENDAS_CONTROLLER: Buscando dashboard - User: {$userId}");
            
            // Buscar todas as revendas do usuário com tolerância a falhas
            try {
                $revendas = $this->revendasModel->findByRevendedorId($userId);
            } catch (Exception $e) {
                error_log("REVENDAS_CONTROLLER getDashboard: erro ao buscar revendas: " . $e->getMessage());
                $revendas = [];
            }
            
            // Calcular estatísticas
            $totalIndicados = count($revendas);
            $indicadosAtivos = 0;
            $totalComissao = 0;
            $comissaoEsteMes = 0;
            
            $mesAtual = date('Y-m');
            
            foreach ($revendas as $revenda) {
                if (($revenda['status'] ?? '') === 'ativo') {
                    $indicadosAtivos++;
                }
                
                $totalComissao += floatval($revenda['total_comissao'] ?? 0);
                
                if (!empty($revenda['data_pagamento_comissao']) && 
                    strpos($revenda['data_pagamento_comissao'], $mesAtual) === 0) {
                    $comissaoEsteMes += floatval($revenda['comissao_paga'] ?? 0);
                }
            }
            
            // Buscar saldo do usuário (usar colunas existentes e aliases para compatibilidade)
            try {
                $queryWallet = "SELECT saldo_plano, saldo AS saldo_carteira, saldo AS saldo_wallet FROM users WHERE id = ? LIMIT 1";
                $stmtWallet = $this->db->prepare($queryWallet);
                $stmtWallet->execute([$userId]);
                $wallet = $stmtWallet->fetch(PDO::FETCH_ASSOC) ?: [];
            } catch (Exception $e) {
                error_log("REVENDAS_CONTROLLER getDashboard: erro ao buscar wallet: " . $e->getMessage());
                $wallet = [];
            }
            
            Response::success([
                'stats' => [
                    'total_indicados' => $totalIndicados,
                    'indicados_ativos' => $indicadosAtivos,
                    'total_bonus' => $totalComissao,
                    'bonus_este_mes' => $comissaoEsteMes
                ],
                'referrals' => $revendas,
                'wallet' => [
                    'wallet_balance' => floatval($wallet['saldo_wallet'] ?? $wallet['saldo_carteira'] ?? 0),
                    'plan_balance' => floatval($wallet['saldo_plano'] ?? 0)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao buscar dashboard: " . $e->getMessage());
            Response::error('Erro ao buscar dados do dashboard', 500);
        }
    }
    
    /**
     * Obter configurações do sistema
     */
    public function getConfig() {
        try {
            Response::success([
                'referral_bonus_amount' => 0, // Processado pela API principal
                'commission_percentage' => 10.00 // 10% adicional na ativação
            ]);
        } catch (Exception $e) {
            error_log("REVENDAS_CONTROLLER: Erro ao buscar config: " . $e->getMessage());
            Response::error('Erro ao buscar configurações', 500);
        }
    }
}
