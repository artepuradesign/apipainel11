<?php
// src/services/ConsultasCpfService.php

require_once __DIR__ . '/../models/ConsultasCpf.php';
require_once __DIR__ . '/../models/BaseCpf.php';
require_once __DIR__ . '/../services/WalletService.php';
require_once __DIR__ . '/../services/CentralCashService.php';

class ConsultasCpfService {
    private $db;
    private $consultasCpfModel;
    private $baseCpfModel;
    private $walletService;
    private $centralCashService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultasCpfModel = new ConsultasCpf($db);
        $this->baseCpfModel = new BaseCpf($db);
        $this->walletService = new WalletService($db);
        $this->centralCashService = new CentralCashService($db);
    }
    
    public function getAllConsultas($page = 1, $limit = 50, $search = '') {
        $offset = ($page - 1) * $limit;
        $consultas = $this->consultasCpfModel->getAll($limit, $offset, $search);
        $total = $this->consultasCpfModel->getCount($search);
        
        // Decode JSON fields for frontend
        foreach ($consultas as &$consulta) {
            $this->decodeJsonFields($consulta);
            $this->mapFieldsToConsultationsFormat($consulta);
        }
        
        return [
            'data' => $consultas,
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'total_pages' => ceil($total / $limit)
        ];
    }
    
    public function getConsultaById($id) {
        $consulta = $this->consultasCpfModel->getById($id);
        
        if ($consulta) {
            $this->decodeJsonFields($consulta);
            $this->mapFieldsToConsultationsFormat($consulta);
        }
        
        return $consulta;
    }
    
    public function getConsultasByUserId($userId, $page = 1, $limit = 50) {
        $offset = ($page - 1) * $limit;
        $consultas = $this->consultasCpfModel->getByUserId($userId, $limit, $offset);
        
        // Decode JSON fields for frontend
        foreach ($consultas as &$consulta) {
            $this->decodeJsonFields($consulta);
            $this->mapFieldsToConsultationsFormat($consulta);
            
            // Garantir que o campo saldo_usado seja preservado corretamente
            if (isset($consulta['saldo_usado'])) {
                error_log("SERVICE: getConsultasByUserId - ID {$consulta['id']}: saldo_usado = '{$consulta['saldo_usado']}'");
            }
        }
        
        return [
            'data' => $consultas,
            'total' => count($consultas),
            'page' => $page,
            'limit' => $limit,
            'total_pages' => 1
        ];
    }
    
    public function createConsulta($data) {
        // Validate required fields
        if (empty($data['user_id'])) {
            throw new Exception('ID do usuário é obrigatório');
        }
        
        if (empty($data['document'])) {
            throw new Exception('Documento é obrigatório');
        }
        
        try {
            $this->db->beginTransaction();
            
// Se result_data já foi fornecido pelo frontend, usar ele
$cpfResult = isset($data['result_data']) ? $data['result_data'] : null;

// Limpar CPF para busca (remover pontos e traços)
$cleanCpf = preg_replace('/\D/', '', $data['document']);

// Array de formatos testados (para logs/metadata)
$cpfFormats = [];

// Se não foi fornecido, buscar na base
if (!$cpfResult) {
    
    error_log("CPF_SEARCH: Buscando CPF limpo: {$cleanCpf} (original: {$data['document']})");
    
    // Buscar CPF na base de dados com diferentes formatos
    $cpfFormats = [
        $cleanCpf, // CPF limpo (só números)
        substr($cleanCpf, 0, 3) . '.' . substr($cleanCpf, 3, 3) . '.' . substr($cleanCpf, 6, 3) . '-' . substr($cleanCpf, 9, 2), // Formatado
        $data['document'] // Original como veio
    ];
    
    foreach ($cpfFormats as $cpfFormat) {
        error_log("CPF_SEARCH: Testando formato: {$cpfFormat}");
        $cpfResult = $this->baseCpfModel->getByCpf($cpfFormat);
        if ($cpfResult) {
            error_log("CPF_SEARCH: CPF encontrado com formato: {$cpfFormat}");
            break;
        }
    }
}
            
            // Determinar status da consulta
            $consultationStatus = isset($data['status']) ? $data['status'] : ($cpfResult ? 'completed' : 'naoencontrado');
            $resultData = $cpfResult;
            
            error_log("CPF_SEARCH: Status da consulta: {$consultationStatus}");
            error_log("CPF_SEARCH: Dados encontrados: " . ($cpfResult ? 'SIM' : 'NÃO'));
            
            // Buscar saldos atuais do usuário
            $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$data['user_id']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                throw new Exception('Usuário não encontrado');
            }
            
            $saldoPlano = (float)($user['saldo_plano'] ?? 0.00);
            $saldoCarteira = (float)($user['saldo'] ?? 0.00);
            
        // GARANTIR que está usando o valor COM DESCONTO para cobrança
        $finalCost = (float)($data['cost'] ?? 0); // Este JÁ É o valor com desconto
        $originalPrice = (float)(($data['metadata'] ?? [])['original_price'] ?? $finalCost);
        
        error_log("CONSULTA_CPF_SERVICE: VALORES DE CONTROLE:");
        error_log("CONSULTA_CPF_SERVICE: - data['cost'] (valor com desconto): " . ($data['cost'] ?? 'NULL'));
        error_log("CONSULTA_CPF_SERVICE: - finalCost (valor com desconto): {$finalCost}");
        error_log("CONSULTA_CPF_SERVICE: - originalPrice (valor original): {$originalPrice}");
        error_log("CONSULTA_CPF_SERVICE: - metadata: " . json_encode($data['metadata'] ?? []));
        
        // Verificar se tem saldo suficiente considerando o valor COM DESCONTO
        if (($saldoPlano + $saldoCarteira) < $finalCost) {
            throw new Exception('Saldo insuficiente para realizar a consulta');
        }
        
        // Lógica de débito com prioridade: plano primeiro, depois carteira
        $remainingAmount = $finalCost; // USAR VALOR COM DESCONTO
        $debitFromPlan = 0;
        $debitFromWallet = 0;
        $saldoUsado = 'carteira';
        
        // Primeiro, tentar debitar do saldo do plano
        if ($saldoPlano > 0 && $remainingAmount > 0) {
            $debitFromPlan = min($saldoPlano, $remainingAmount);
            $remainingAmount -= $debitFromPlan;
            $saldoUsado = 'plano';
        }
        
        // Se ainda há valor para debitar, usar saldo da carteira
        if ($remainingAmount > 0) {
            $debitFromWallet = $remainingAmount;
            $saldoUsado = ($debitFromPlan > 0) ? 'misto' : 'carteira';
        }
            
            // Atualizar saldos na tabela users
            $newPlanBalance = $saldoPlano - $debitFromPlan;
            $newWalletBalance = $saldoCarteira - $debitFromWallet;
            
            $updateQuery = "UPDATE users SET 
                            saldo_plano = ?, 
                            saldo = ?,
                            saldo_atualizado = 1,
                            updated_at = NOW() 
                            WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$newPlanBalance, $newWalletBalance, $data['user_id']]);
            
// Criar ou atualizar registro na tabela consultations
$metadataPayload = [
    'discount' => ($data['metadata'] ?? [])['discount'] ?? 0,
    'original_price' => $originalPrice, // Preço original sem desconto
    'final_price' => $finalCost, // Preço final com desconto aplicado
    'saldo_usado' => $saldoUsado,
    'debit_from_plan' => $debitFromPlan,
    'debit_from_wallet' => $debitFromWallet,
    'source' => ($data['metadata'] ?? [])['source'] ?? 'consultar-cpf-puxa-tudo',
    'searched_formats' => $cpfFormats
];

if (!empty($data['pre_consultation_id'])) {
    // Atualizar pré-registro existente
    $updateConsultQuery = "UPDATE consultations SET document = ?, cost = ?, result_data = ?, status = ?, ip_address = ?, user_agent = ?, metadata = ?, updated_at = NOW() WHERE id = ?";
    $updateConsultStmt = $this->db->prepare($updateConsultQuery);
    $updateConsultStmt->execute([
        $data['document'],
        $finalCost, // USAR VALOR COM DESCONTO
        $resultData ? json_encode($resultData) : null,
        $consultationStatus,
        $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
        $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null,
        json_encode($metadataPayload),
        (int)$data['pre_consultation_id']
    ]);
    $consultationId = (int)$data['pre_consultation_id'];
    error_log("CONSULTATIONS: Pré-registro atualizado ID: " . $consultationId);
} else {
    // Criar novo registro
    $consultationQuery = "INSERT INTO consultations (
        user_id, module_type, document, cost, result_data, status, 
        ip_address, user_agent, metadata, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
    error_log("CONSULTATIONS: SQL Query: " . $consultationQuery);
    error_log("CONSULTATIONS: Status para inserção: " . $consultationStatus);
    
    $consultationStmt = $this->db->prepare($consultationQuery);
    
    $consultationParams = [
        $data['user_id'],
        $data['module_type'] ?? 'cpf',
        $data['document'],
        $finalCost, // USAR VALOR COM DESCONTO
        $resultData ? json_encode($resultData) : null,
        $consultationStatus,
        $data['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null,
        $data['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null,
        json_encode($metadataPayload)
    ];
    
    error_log("CONSULTATIONS: Parâmetros: " . json_encode($consultationParams));
    
    $consultationStmt->execute($consultationParams);
    
    $consultationId = $this->db->lastInsertId();
    error_log("CONSULTATIONS: Registro criado com ID: " . $consultationId);
}

        // REGISTRAR CONSULTA NA TABELA consultas_cpf
        error_log("CONSULTAS_CPF: Criando registro na tabela consultas_cpf");

        try {
            $insertCpfQuery = "INSERT INTO consultas_cpf (user_id, cpf_consultado, resultado, valor_cobrado, desconto_aplicado, saldo_usado) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->db->prepare($insertCpfQuery);
            
            $discountApplied = $originalPrice - $finalCost; // Desconto aplicado em reais

            // Registrar como 'plano' se QUALQUER parte veio do saldo do plano (compatível com ENUM antigo)
            $saldoUsadoDb = ($debitFromPlan > 0) ? 'plano' : 'carteira';
            
            $stmt->execute([
                $data['user_id'],
                $cleanCpf,
                $resultData ? json_encode($resultData) : null,
                $finalCost, // Valor final (com desconto)
                $discountApplied, // Desconto aplicado
                $saldoUsadoDb
            ]);
            
            $cpfId = $this->db->lastInsertId();
            error_log("CONSULTAS_CPF: Registro criado com sucesso! ID: " . $cpfId);
            
        } catch (Exception $e) {
            error_log("CONSULTAS_CPF: ERRO ao criar registro: " . $e->getMessage());
            throw new Exception("Erro ao registrar consulta CPF: " . $e->getMessage());
        }

        // INTEGRAÇÃO COMPLETA COM SISTEMA DE TRANSAÇÕES
        $transactionRefId = $consultationId ?? $cpfId;

        // Buscar saldo atual do caixa central para calcular novo saldo
        $currentCentralBalance = $this->centralCashService->getCurrentBalance();
        $newCentralBalance = $currentCentralBalance + $finalCost; // Entrada no caixa central

        // Registrar no caixa central - entrada da consulta
        $centralCashResult = $this->centralCashService->addTransaction(
            'consulta', // tipo de transação
            $finalCost, // valor
            $currentCentralBalance, // saldo anterior
            $newCentralBalance, // saldo posterior
            $data['user_id'], // usuário que fez a consulta
            1, // created_by (sistema)
            "Consulta CPF - {$data['document']} (Saldo usado: {$saldoUsado})",
            null, // payment_method
            'consultas_cpf', // reference_table
            $cpfId, // reference_id
            null // external_id
        );

        error_log("CENTRAL_CASH: Consulta registrada - " . json_encode($centralCashResult));

        // Registrar transação usando WalletService se usou saldo do plano
        if ($debitFromPlan > 0) {
            $walletResult = $this->walletService->createTransaction(
                $data['user_id'],
                'consulta',
                $debitFromPlan,
                "Consulta CPF - {$data['document']} (Saldo do Plano)",
                'consulta_cpf',
                $transactionRefId,
                'plan'
            );
            error_log("WALLET_SERVICE (PLAN): " . json_encode($walletResult));
        }

        // Registrar transação usando WalletService se usou saldo da carteira
        if ($debitFromWallet > 0) {
            $walletResult = $this->walletService->createTransaction(
                $data['user_id'],
                'consulta',
                $debitFromWallet,
                "Consulta CPF - {$data['document']} (Carteira Digital)",
                'consulta_cpf',
                $transactionRefId,
                'main'
            );
            error_log("WALLET_SERVICE (MAIN): " . json_encode($walletResult));
        }

        // Registrar auditoria
        $auditQuery = "INSERT INTO user_audit (user_id, action, category, description, new_values, ip_address, user_agent) VALUES (?, 'consultation_made', 'consultation', ?, ?, ?, ?)";
        $stmt = $this->db->prepare($auditQuery);
        $stmt->execute([
            $data['user_id'],
            "Consulta CPF realizada - {$data['document']}",
            json_encode([
                'cpf' => $data['document'],
                'valor_original' => $originalPrice,
                'desconto' => $originalPrice - $finalCost,
                'valor_final' => $finalCost,
                'saldo_usado' => $saldoUsado,
                'saldo_anterior_plano' => $saldoPlano,
                'saldo_anterior_carteira' => $saldoCarteira,
                'saldo_atual_plano' => $newPlanBalance,
                'saldo_atual_carteira' => $newWalletBalance
            ]),
            $_SERVER['REMOTE_ADDR'] ?? '',
            $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
            
            $this->db->commit();
            
            // Retornar resposta estruturada
            if ($cpfResult) {
                // CPF encontrado - retornar dados
                return [
                    'success' => true,
                    'data' => $cpfResult,
                    'consultation_id' => $consultationId,
                    'status' => 'completed',
                    'message' => 'CPF encontrado na base de dados'
                ];
            } else {
                // CPF não encontrado - retornar informações
                return [
                    'success' => false,
                    'data' => null,
                    'consultation_id' => $consultationId,
                    'status' => 'naoencontrado',
                    'cost' => $finalCost, // USAR VALOR COM DESCONTO
                    'balance_used' => $saldoUsado,
                    'message' => 'CPF não encontrado na base de dados',
                    'error' => 'CPF não encontrado'
                ];
            }
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    private function createAuditLog($userId, $action, $data) {
        try {
            $auditQuery = "INSERT INTO user_audit (
                user_id, action, category, description, new_values, 
                ip_address, user_agent, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $auditStmt = $this->db->prepare($auditQuery);
            $auditStmt->execute([
                $userId,
                $action,
                'consultation',
                "Consulta CPF realizada - {$data['document']}",
                json_encode($data),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
            error_log("USER_AUDIT: Log criado para user {$userId}, ação {$action}");
        } catch (Exception $e) {
            error_log("ERRO USER_AUDIT: " . $e->getMessage());
        }
    }
    
    public function updateConsulta($id, $data) {
        $existing = $this->consultasCpfModel->getById($id);
        if (!$existing) {
            throw new Exception('Consulta não encontrada');
        }
        
        return $this->consultasCpfModel->update($id, $data);
    }
    
    public function deleteConsulta($id) {
        $existing = $this->consultasCpfModel->getById($id);
        if (!$existing) {
            throw new Exception('Consulta não encontrada');
        }
        
        return $this->consultasCpfModel->delete($id);
    }
    
    public function getStats() {
        return $this->consultasCpfModel->getStats();
    }
    
    // Função para calcular custo com desconto baseado no plano do usuário
    private function calculateDiscountedCost($userId, $originalCost) {
        try {
            // Buscar plano do usuário
            $stmt = $this->db->prepare("SELECT tipoplano FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            $planName = $user['tipoplano'] ?? 'Pré-Pago';
            
            // Map de descontos por plano
            $discountMap = [
                'Pré-Pago' => 0,
                'Rainha de Ouros' => 5,
                'Rainha de Paus' => 10,
                'Rainha de Copas' => 15,
                'Rainha de Espadas' => 20,
                'Rei de Ouros' => 20,
                'Rei de Paus' => 30,
                'Rei de Copas' => 40,
                'Rei de Espadas' => 50
            ];
            
            $discountPercent = $discountMap[$planName] ?? 0;
            $discountAmount = ($originalCost * $discountPercent) / 100;
            $finalCost = $originalCost - $discountAmount;
            
            // Garantir valor mínimo
            $finalCost = max($finalCost, 0.01);
            
            error_log("DISCOUNT_CALC: Plano: {$planName}, Desconto: {$discountPercent}%, Original: {$originalCost}, Final: {$finalCost}");
            
            return round($finalCost, 2);
        } catch (Exception $e) {
            error_log("DISCOUNT_ERROR: " . $e->getMessage());
            return $originalCost; // Retornar valor original em caso de erro
        }
    }
    
    private function decodeJsonFields(&$consulta) {
        $jsonFields = ['resultado'];
        
        foreach ($jsonFields as $field) {
            if (isset($consulta[$field]) && !empty($consulta[$field])) {
                $decoded = json_decode($consulta[$field], true);
                $consulta[$field] = $decoded !== null ? $decoded : $consulta[$field];
            }
        }
    }
    
    private function mapFieldsToConsultationsFormat(&$consulta) {
        // Mapear campos da tabela consultas_cpf para formato esperado pelo frontend
        $consulta['id'] = $consulta['id'] ?? null;
        $consulta['user_id'] = $consulta['user_id'] ?? null;
        $consulta['module_type'] = 'cpf';
        $consulta['document'] = $consulta['cpf_consultado'] ?? '';
        $consulta['cost'] = $consulta['valor_cobrado'] ?? 0;
        $consulta['result_data'] = $consulta['resultado'] ?? null;
        $consulta['status'] = $consulta['resultado'] ? 'completed' : ($consulta['status'] ?? 'naoencontrado');
        $consulta['created_at'] = $consulta['created_at'] ?? null;
        $consulta['updated_at'] = $consulta['updated_at'] ?? null;
        $consulta['metadata'] = [
            'discount' => $consulta['desconto_aplicado'] ?? 0,
            'saldo_usado' => $consulta['saldo_usado'] ?? 'carteira'
        ];
        
        // PRESERVAR o campo saldo_usado original da tabela (não sobrescrever!)
        // O campo saldo_usado deve vir direto da query do modelo
        if (isset($consulta['saldo_usado'])) {
            error_log("MAPPING: Preservando saldo_usado original: '{$consulta['saldo_usado']}'");
        } else {
            error_log("MAPPING: saldo_usado não encontrado, usando padrão 'carteira'");
            $consulta['saldo_usado'] = 'carteira';
        }
    }
}