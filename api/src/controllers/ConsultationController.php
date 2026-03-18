<?php
// src/controllers/ConsultationController.php

require_once __DIR__ . '/../models/Consultation.php';
require_once __DIR__ . '/../services/WalletService.php';
require_once __DIR__ . '/../utils/Response.php';

class ConsultationController {
    private $db;
    private $consultation;
    private $walletService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultation = new Consultation($db);
        $this->walletService = new WalletService($db);
    }
    
    public function performConsultation() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::badRequest('Dados de entrada inválidos');
                return;
            }
            
            $moduleType = $input['module_type'] ?? '';
            $document = $input['document'] ?? '';
            
            if (empty($moduleType) || empty($document)) {
                Response::badRequest('module_type e document são obrigatórios');
                return;
            }
            
            // Validar tipos de módulo suportados
            $supportedModules = ['cpf', 'cnpj', 'veiculo', 'telefone', 'score'];
            if (!in_array($moduleType, $supportedModules)) {
                Response::badRequest('Tipo de módulo não suportado');
                return;
            }
            
            // Obter ID do usuário autenticado
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }
            
            // Determinar preço do módulo
            $modulePrice = $this->getModulePrice($moduleType);
            
            // Verificar saldo suficiente (prioridade: saldo_plano primeiro)
            $balanceCheck = $this->checkUserBalance($userId, $modulePrice);
            if (!$balanceCheck['sufficient']) {
                Response::badRequest('Saldo insuficiente', [
                    'required' => $modulePrice,
                    'available' => $balanceCheck['total_balance'],
                    'plan_balance' => $balanceCheck['plan_balance'],
                    'main_balance' => $balanceCheck['main_balance']
                ]);
                return;
            }
            
            // Verificar consulta duplicada recente (opcional)
            if ($this->isDuplicateConsultation($userId, $moduleType, $document)) {
                // Retornar consulta anterior em vez de cobrar novamente
                $previousConsultation = $this->getPreviousConsultation($userId, $moduleType, $document);
                if ($previousConsultation) {
                    Response::success('Consulta já realizada anteriormente', $previousConsultation);
                    return;
                }
            }
            
            $this->db->beginTransaction();
            
            try {
                // Criar registro da consulta
                $consultationId = $this->consultation->create([
                    'user_id' => $userId,
                    'module_type' => $moduleType,
                    'document' => $document,
                    'cost' => $modulePrice,
                    'status' => 'processing',
                    'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                    'metadata' => json_encode(['timestamp' => date('Y-m-d H:i:s')])
                ]);
                
                if (!$consultationId) {
                    throw new Exception('Erro ao criar registro da consulta');
                }
                
                // Deduzir saldo (prioridade: saldo_plano primeiro, depois saldo principal)
                $deductionResult = $this->deductBalanceWithPriority($userId, $modulePrice, $consultationId);
                if (!$deductionResult['success']) {
                    throw new Exception($deductionResult['message']);
                }
                
                // Processar consulta específica
                $consultationResult = $this->processModuleConsultation($moduleType, $document);
                
                // Atualizar consulta com resultado
                $this->consultation->update($consultationId, [
                    'result_data' => json_encode($consultationResult),
                    'status' => 'completed'
                ]);
                
                $this->db->commit();
                
                // Retornar resultado completo
                $finalConsultation = $this->consultation->getById($consultationId);
                $finalConsultation['result_data'] = json_decode($finalConsultation['result_data'], true);
                
                Response::success('Consulta realizada com sucesso', $finalConsultation);
                
            } catch (Exception $e) {
                $this->db->rollback();
                
                // Marcar consulta como falhada se foi criada
                if ($consultationId) {
                    $this->consultation->update($consultationId, [
                        'status' => 'failed',
                        'metadata' => json_encode(['error' => $e->getMessage()])
                    ]);
                }
                
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("CONSULTATION_ERROR: " . $e->getMessage());
            Response::serverError('Erro ao processar consulta: ' . $e->getMessage());
        }
    }
    
    public function getHistory() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }
            
            $limit = (int)($_GET['limit'] ?? 20);
            $offset = (int)($_GET['offset'] ?? 0);
            
            $consultations = $this->consultation->getUserConsultations($userId, $limit, $offset);
            
            // Decodificar result_data para cada consulta
            foreach ($consultations as &$consultation) {
                if ($consultation['result_data']) {
                    $consultation['result_data'] = json_decode($consultation['result_data'], true);
                }
                if ($consultation['metadata']) {
                    $consultation['metadata'] = json_decode($consultation['metadata'], true);
                }
            }
            
            Response::success('Histórico carregado com sucesso', $consultations);
            
        } catch (Exception $e) {
            error_log("CONSULTATION_HISTORY_ERROR: " . $e->getMessage());
            Response::serverError('Erro ao carregar histórico');
        }
    }
    
    public function getStats() {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }
            
            $stats = $this->consultation->getUserStats($userId);
            Response::success('Estatísticas carregadas com sucesso', $stats);
            
        } catch (Exception $e) {
            error_log("CONSULTATION_STATS_ERROR: " . $e->getMessage());
            Response::serverError('Erro ao carregar estatísticas');
        }
    }
    
    public function checkBalance($moduleType) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }
            
            $modulePrice = $this->getModulePrice($moduleType);
            $balanceCheck = $this->checkUserBalance($userId, $modulePrice);
            
            Response::success('Verificação de saldo concluída', [
                'sufficient' => $balanceCheck['sufficient'],
                'required_amount' => $modulePrice,
                'user_balance' => $balanceCheck['main_balance'],
                'plan_balance' => $balanceCheck['plan_balance']
            ]);
            
        } catch (Exception $e) {
            error_log("BALANCE_CHECK_ERROR: " . $e->getMessage());
            Response::serverError('Erro ao verificar saldo');
        }
    }
    
    public function getConsultationDetails($consultationId) {
        try {
            $userId = $_SESSION['user_id'] ?? null;
            if (!$userId) {
                Response::unauthorized('Usuário não autenticado');
                return;
            }
            
            $consultation = $this->consultation->getByIdAndUser($consultationId, $userId);
            
            if (!$consultation) {
                Response::notFound('Consulta não encontrada');
                return;
            }
            
            // Decodificar JSONs
            if ($consultation['result_data']) {
                $consultation['result_data'] = json_decode($consultation['result_data'], true);
            }
            if ($consultation['metadata']) {
                $consultation['metadata'] = json_decode($consultation['metadata'], true);
            }
            
            Response::success('Detalhes da consulta', $consultation);
            
        } catch (Exception $e) {
            error_log("CONSULTATION_DETAILS_ERROR: " . $e->getMessage());
            Response::serverError('Erro ao carregar detalhes da consulta');
        }
    }
    
    private function getModulePrice($moduleType) {
        $prices = [
            'cpf' => 2.00,
            'cnpj' => 3.00,
            'veiculo' => 2.50,
            'telefone' => 1.50,
            'score' => 5.00
        ];
        
        return $prices[$moduleType] ?? 2.00;
    }
    
    private function checkUserBalance($userId, $requiredAmount) {
        $balanceData = $this->walletService->getUserBalance($userId);
        
        $planBalance = $balanceData['saldo_plano'] ?? 0;
        $mainBalance = $balanceData['saldo'] ?? 0;
        $totalBalance = $planBalance + $mainBalance;
        
        return [
            'sufficient' => $totalBalance >= $requiredAmount,
            'plan_balance' => $planBalance,
            'main_balance' => $mainBalance,
            'total_balance' => $totalBalance
        ];
    }
    
    private function deductBalanceWithPriority($userId, $amount, $consultationId) {
        // Prioridade: saldo_plano primeiro, depois saldo principal
        $balanceData = $this->walletService->getUserBalance($userId);
        $planBalance = $balanceData['saldo_plano'] ?? 0;
        $mainBalance = $balanceData['saldo'] ?? 0;
        
        if ($planBalance >= $amount) {
            // Deduzir apenas do saldo do plano
            return $this->walletService->createTransaction(
                $userId,
                'consulta',
                $amount,
                "Consulta #{$consultationId}",
                'consultation',
                $consultationId,
                'plan'
            );
        } elseif ($planBalance + $mainBalance >= $amount) {
            // Deduzir do plano primeiro, depois do principal
            $remainingAmount = $amount;
            
            if ($planBalance > 0) {
                $planDeduction = $this->walletService->createTransaction(
                    $userId,
                    'consulta',
                    $planBalance,
                    "Consulta #{$consultationId} (Parte 1)",
                    'consultation',
                    $consultationId,
                    'plan'
                );
                
                if (!$planDeduction['success']) {
                    return $planDeduction;
                }
                
                $remainingAmount -= $planBalance;
            }
            
            if ($remainingAmount > 0) {
                return $this->walletService->createTransaction(
                    $userId,
                    'consulta',
                    $remainingAmount,
                    "Consulta #{$consultationId}" . ($planBalance > 0 ? ' (Parte 2)' : ''),
                    'consultation',
                    $consultationId,
                    'main'
                );
            }
            
            return ['success' => true];
        } else {
            return [
                'success' => false,
                'message' => 'Saldo insuficiente'
            ];
        }
    }
    
    private function isDuplicateConsultation($userId, $moduleType, $document) {
        // Verificar se existe consulta idêntica nas últimas 24 horas
        return $this->consultation->hasDuplicateInPeriod($userId, $moduleType, $document, '24 HOUR');
    }
    
    private function getPreviousConsultation($userId, $moduleType, $document) {
        return $this->consultation->getPreviousConsultation($userId, $moduleType, $document);
    }
    
    private function processModuleConsultation($moduleType, $document) {
        // Simular processamento das consultas
        // Em produção, aqui seria feita a integração com APIs externas
        
        switch ($moduleType) {
            case 'cpf':
                return $this->processCPFConsultation($document);
            case 'cnpj':
                return $this->processCNPJConsultation($document);
            case 'veiculo':
                return $this->processVehicleConsultation($document);
            case 'telefone':
                return $this->processPhoneConsultation($document);
            case 'score':
                return $this->processScoreConsultation($document);
            default:
                throw new Exception('Tipo de módulo não implementado');
        }
    }
    
    private function processCPFConsultation($cpf) {
        // Simular consulta de CPF
        return [
            'cpf' => $cpf,
            'nome' => 'João da Silva Santos',
            'data_nascimento' => '15/05/1985',
            'situacao_cpf' => 'REGULAR',
            'situacao_receita' => 'ATIVO',
            'nome_mae' => 'Maria da Silva',
            'nome_pai' => 'José dos Santos',
            'endereco' => 'Rua das Flores, 123, Apto 45',
            'bairro' => 'Centro',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01234-567',
            'email' => 'joao.silva@email.com',
            'telefone' => '(11) 98765-4321',
            'genero' => 'Masculino',
            'idade' => 40,
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    private function processCNPJConsultation($cnpj) {
        return [
            'cnpj' => $cnpj,
            'razao_social' => 'Empresa Exemplo LTDA',
            'situacao' => 'ATIVA',
            'data_abertura' => '01/01/2020',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    private function processVehicleConsultation($placa) {
        return [
            'placa' => $placa,
            'modelo' => 'Veículo Exemplo',
            'ano' => '2020',
            'situacao' => 'REGULAR',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    private function processPhoneConsultation($telefone) {
        return [
            'telefone' => $telefone,
            'operadora' => 'Operadora Exemplo',
            'tipo' => 'CELULAR',
            'situacao' => 'ATIVO',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    private function processScoreConsultation($cpf) {
        return [
            'cpf' => $cpf,
            'score' => rand(300, 950),
            'classificacao' => 'BOA',
            'ultima_atualizacao' => date('Y-m-d H:i:s'),
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
}