
<?php
// src/services/ReferralOperationsService.php

require_once __DIR__ . '/ReferralConfigService.php';
require_once __DIR__ . '/NotificationService.php';
require_once __DIR__ . '/WalletService.php';

class ReferralOperationsService {
    private $db;
    private $referralConfigService;
    private $notificationService;
    private $walletService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->referralConfigService = new ReferralConfigService($db);
        $this->notificationService = new NotificationService($db);
        $this->walletService = new WalletService($db);
    }
    
    public function validateReferralCode($code) {
        try {
            $query = "SELECT id, full_name FROM users WHERE codigo_indicacao = ? AND status = 'ativo'";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$code]);
            $referrer = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($referrer) {
                return [
                    'success' => true,
                    'data' => [
                        'isValid' => true,
                        'referrer_id' => $referrer['id'],
                        'referrer_name' => $referrer['full_name'],
                        'referralCode' => $code
                    ]
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Código de indicação não encontrado'
                ];
            }
        } catch (Exception $e) {
            error_log("Validate referral code error: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Erro ao validar código'
            ];
        }
    }
    
    public function createReferralRecord($indicadorId, $indicadoId, $codigoUsado) {
        try {
            error_log("REFERRAL_RECORD: Criando registro - Indicador: {$indicadorId}, Indicado: {$indicadoId}, Código: {$codigoUsado}");
            
            // Verificar se já existe uma indicação
            $existingQuery = "SELECT id FROM indicacoes WHERE referrer_id = ? AND referred_id = ? LIMIT 1";
            $existingStmt = $this->db->prepare($existingQuery);
            $existingStmt->execute([$indicadorId, $indicadoId]);
            
            if ($existingStmt->fetch()) {
                error_log("REFERRAL_RECORD: Indicação já existe - Indicador: {$indicadorId}, Indicado: {$indicadoId}");
                return ['success' => false, 'message' => 'Indicação já existe'];
            }
            
            // Buscar valor do bônus da configuração
            $bonusAmount = $this->getBonusAmountFromConfig();
            
            // Criar novo registro de indicação (conforme estrutura da tabela indicacoes)
            $query = "INSERT INTO indicacoes (
                referrer_id, referred_id, codigo, status, comissao, created_at
            ) VALUES (?, ?, ?, 'pendente', ?, NOW())";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$indicadorId, $indicadoId, $codigoUsado, $bonusAmount]);
            
            if ($result) {
                $referralId = $this->db->lastInsertId();
                error_log("REFERRAL_RECORD: Registro criado com sucesso - ID: {$referralId}");
                
                return [
                    'success' => true,
                    'referral_id' => $referralId,
                    'bonus_amount' => $bonusAmount
                ];
            }
            
            return ['success' => false, 'message' => 'Erro ao criar registro'];
            
        } catch (Exception $e) {
            error_log("REFERRAL_RECORD ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
    
    
    private function getUserData($userId) {
        $query = "SELECT id, full_name, email FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    private function sendReferralNotifications($indicadorId, $indicadoId, $bonusAmount, $indicadorData, $indicadoData) {
        // Notificação para o indicador (quem indicou)
        $this->notificationService->createNotification(
            $indicadorId,
            'success',
            'Indicação realizada com sucesso!',
            "Parabéns! {$indicadoData['full_name']} se cadastrou usando seu código de indicação. Você recebeu R$ " . number_format($bonusAmount, 2, ',', '.') . " como bônus!",
            '/dashboard/wallet',
            'Ver Carteira',
            'high'
        );
        
        // Notificação para o indicado (quem se cadastrou)
        $this->notificationService->createNotification(
            $indicadoId,
            'success',
            'Bônus de boas-vindas creditado!',
            "Bem-vindo(a)! Você recebeu R$ " . number_format($bonusAmount, 2, ',', '.') . " como bônus de boas-vindas por ter sido indicado(a) por {$indicadorData['full_name']}!",
            '/dashboard/wallet',
            'Ver Carteira',
            'high'
        );
        
        error_log("NOTIFICAÇÕES DE INDICAÇÃO ENVIADAS: Indicador ID {$indicadorId} e Indicado ID {$indicadoId}");
    }
    
    public function processReferralBonus($indicadorId, $indicadoId, $codigoUsado) {
        try {
            error_log("REFERRAL_BONUS: === SISTEMA SIMPLES DE INDICAÇÃO ===");
            error_log("REFERRAL_BONUS: Processando - Indicador: {$indicadorId}, Indicado: {$indicadoId}, Código: {$codigoUsado}");
            
            // Buscar valor do bônus da system_config
            $bonusAmount = $this->getBonusAmountFromConfig();
            error_log("REFERRAL_BONUS: Valor do bônus: R$ {$bonusAmount}");
            
            // Verificar se indicação já existe
            if ($this->referralExists($indicadorId, $indicadoId)) {
                error_log("REFERRAL_BONUS: Indicação já processada");
                return ['success' => true, 'message' => 'Indicação já processada anteriormente'];
            }
            
            // Buscar dados dos usuários
            $indicadorData = $this->getUserData($indicadorId);
            $indicadoData = $this->getUserData($indicadoId);
            
            if (!$indicadorData || !$indicadoData) {
                error_log("REFERRAL_BONUS ERROR: Dados de usuário não encontrados");
                throw new Exception('Dados de usuário não encontrados');
            }
            
            // Criar registro simples de indicação
            $this->createSimpleReferralRecord($indicadorId, $indicadoId, $codigoUsado, $bonusAmount);
            
            // Aplicar bônus para ambos os usuários
            $this->updateUserBalance($indicadorId, $bonusAmount, 'saldo_plano', "Bônus indicação: {$indicadoData['full_name']}");
            $this->updateUserBalance($indicadoId, $bonusAmount, 'saldo_plano', "Bônus boas-vindas: indicado por {$indicadorData['full_name']}");
            
            // Criar transações na carteira para histórico
            $this->createReferralTransactions($indicadorId, $indicadoId, $bonusAmount, $indicadorData, $indicadoData);
            
            // Enviar notificações
            $this->sendReferralNotifications($indicadorId, $indicadoId, $bonusAmount, $indicadorData, $indicadoData);
            
            error_log("REFERRAL_BONUS SUCCESS: ✅ Bônus R$ {$bonusAmount} aplicado para ambos os usuários");
            
            return [
                'success' => true,
                'bonus_amount' => $bonusAmount,
                'message' => 'Sistema de indicação processado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log("REFERRAL_BONUS ERROR: " . $e->getMessage());
            throw $e; // Re-throw para ser tratado pelo nível superior
        }
    }
    
    private function referralExists($indicadorId, $indicadoId) {
        try {
            $query = "SELECT id FROM indicacoes WHERE referrer_id = ? AND referred_id = ? LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$indicadorId, $indicadoId]);
            return $stmt->fetch() !== false;
        } catch (Exception $e) {
            error_log("REFERRAL_EXISTS ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    private function createSimpleReferralRecord($indicadorId, $indicadoId, $codigoUsado, $bonusAmount) {
        try {
            $query = "INSERT INTO indicacoes (referrer_id, referred_id, codigo, status, comissao, data_conversao, created_at) 
                     VALUES (?, ?, ?, 'confirmada', ?, NOW(), NOW())";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$indicadorId, $indicadoId, $codigoUsado, $bonusAmount]);
            
            $referralId = $this->db->lastInsertId();
            error_log("REFERRAL_RECORD: ✅ Registro simples criado - ID: {$referralId}");
            
            return $referralId;
        } catch (Exception $e) {
            error_log("REFERRAL_RECORD ERROR: " . $e->getMessage());
            throw new Exception("Erro ao criar registro de indicação: " . $e->getMessage());
        }
    }
    
    private function getBonusAmountFromConfig() {
        try {
            // Usar o novo serviço que lê diretamente do bonus.php
            $bonusConfigService = BonusConfigService::getInstance();
            $bonusAmount = $bonusConfigService->getBonusAmount();
            error_log("REFERRAL_CONFIG: Bônus obtido do bonus.php: R$ {$bonusAmount}");
            return $bonusAmount;
        } catch (Exception $e) {
            error_log("REFERRAL_CONFIG ERROR: " . $e->getMessage() . " - Usando valor padrão");
            return 5.00;
        }
    }
    
    private function updateReferralStatus($referralId, $status, $bonusAmount = null) {
        try {
            $query = "UPDATE indicacoes SET status = ?, data_conversao = NOW()";
            $params = [$status];
            
            if ($bonusAmount !== null) {
                $query .= ", comissao = ?";
                $params[] = $bonusAmount;
            }
            
            $query .= " WHERE id = ?";
            $params[] = $referralId;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            error_log("REFERRAL_STATUS: Indicação ID {$referralId} atualizada para status: {$status}");
            
        } catch (Exception $e) {
            error_log("REFERRAL_STATUS ERROR: " . $e->getMessage());
        }
    }

    private function updateUserBalance($userId, $amount, $balanceType = 'saldo_plano', $description = '') {
        $query = "UPDATE users SET {$balanceType} = {$balanceType} + ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$amount, $userId]);
        
        error_log("ATUALIZAÇÃO DE SALDO: User ID {$userId} - {$balanceType} +{$amount} - {$description}");
    }
    
    private function createReferralTransactions($indicadorId, $indicadoId, $bonusAmount, $indicadorData, $indicadoData) {
        try {
            require_once __DIR__ . '/WalletService.php';
            $walletService = new WalletService($this->db);
            
            // Criar transação para o indicador
            $indicadorResult = $walletService->createTransaction(
                $indicadorId,
                'indicacao',
                $bonusAmount,
                "Bônus de indicação - {$indicadoData['full_name']}",
                'referral',
                $indicadoId
            );
            
            // Criar transação para o indicado
            $indicadoResult = $walletService->createTransaction(
                $indicadoId,
                'bonus',
                $bonusAmount,
                "Bônus de boas-vindas - Indicado por {$indicadorData['full_name']}",
                'referral',
                $indicadorId
            );
            
            if ($indicadorResult['success']) {
                error_log("REFERRAL_TRANSACTION: Transação criada para indicador {$indicadorId} - ID: {$indicadorResult['transaction_id']}");
            }
            
            if ($indicadoResult['success']) {
                error_log("REFERRAL_TRANSACTION: Transação criada para indicado {$indicadoId} - ID: {$indicadoResult['transaction_id']}");
            }
            
            return ['success' => true];
            
        } catch (Exception $e) {
            error_log("CREATE_REFERRAL_TRANSACTIONS ERROR: " . $e->getMessage());
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }
}
