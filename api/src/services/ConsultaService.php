<?php
// src/services/ConsultaService.php

require_once __DIR__ . '/../services/BaseConsultaService.php';
require_once __DIR__ . '/../services/CentralCashService.php';

/**
 * Serviço principal de consultas - utiliza a nova estrutura com tabelas base e registros
 */
class ConsultaService extends BaseConsultaService {
    
    /**
     * Realiza consulta de CPF
     */
    public function consultarCPF($userId, $cpf) {
        error_log("CONSULTA_CPF: User {$userId} consulting CPF {$cpf}");
        return $this->performConsultation($userId, 'cpf', $cpf);
    }
    
    /**
     * Realiza consulta de CNPJ
     */
    public function consultarCNPJ($userId, $cnpj) {
        error_log("CONSULTA_CNPJ: User {$userId} consulting CNPJ {$cnpj}");
        return $this->performConsultation($userId, 'cnpj', $cnpj);
    }
    
    /**
     * Realiza consulta de Veículo
     */
    public function consultarVeiculo($userId, $placa) {
        error_log("CONSULTA_VEICULO: User {$userId} consulting Vehicle {$placa}");
        return $this->performConsultation($userId, 'veiculo', $placa);
    }
    
    public function performConsultation($userId, $type, $document, $cost = null, $metadata = null) {
        try {
            error_log("CONSULTA_SERVICE: Iniciando performConsultation - User: {$userId}, Type: {$type}, Document: {$document}");
            $this->db->beginTransaction();
            
            // Usar custo fornecido pela requisição (já com desconto aplicado) ou padrão
            if ($cost === null) {
                $costs = [
                    'cpf' => 2.00,
                    'cnpj' => 3.00,
                    'veiculo' => 4.00,
                    'telefone' => 1.50,
                    'score' => 5.00
                ];
                $cost = $costs[$type] ?? 2.00;
            }
            
            error_log("CONSULTA_SERVICE: Custo definido: {$cost}");
            
            // Verificar se usuário existe
            $this->user->id = $userId;
            if (!$this->user->readOne()) {
                error_log("CONSULTA_SERVICE: Usuário {$userId} não encontrado");
                throw new Exception('Usuário não encontrado');
            }
            
            error_log("CONSULTA_SERVICE: Usuário {$userId} encontrado e validado");
            
            // Criar registro da consulta na tabela consultations
            error_log("CONSULTA_SERVICE: Criando registro na tabela consultations");
            
            // Preparar metadata com source padrão
            $metadataPayload = $metadata ?? [];
            if (empty($metadataPayload['source'])) {
                $metadataPayload['source'] = 'consultar-cpf-puxa-tudo';
            }
            
            $consultaQuery = "INSERT INTO consultations (user_id, module_type, document, cost, status, metadata, ip_address, user_agent, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, 'processing', ?, ?, ?, NOW(), NOW())";
            $consultaStmt = $this->db->prepare($consultaQuery);
            $success = $consultaStmt->execute([
                $userId, 
                $type, 
                $document, 
                $cost, 
                json_encode($metadataPayload),
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
            if (!$success) {
                error_log("CONSULTA_SERVICE: ERRO ao criar registro na tabela consultations");
                throw new Exception('Erro ao criar registro de consulta');
            }
            
            $consultationId = $this->db->lastInsertId();
            error_log("CONSULTA_SERVICE: Registro consultations criado com ID: {$consultationId}");
            
            // Processar consulta específica
            error_log("CONSULTA_SERVICE: Processando consulta do tipo {$type}");
            $result = $this->processConsultation($type, $document);
            error_log("CONSULTA_SERVICE: Resultado da consulta: " . ($result ? "ENCONTRADO" : "NÃO ENCONTRADO"));
            
            // Debitar saldo usando lógica prioritária (plano primeiro, depois carteira)
            $saldoUsado = null;
            if ($cost > 0) {
                error_log("CONSULTA_SERVICE: Debitando saldo do usuário - Valor: {$cost}");
                $saldoUsado = $this->debitUserBalanceWithPriority($userId, $cost);
                error_log("CONSULTA_SERVICE: Saldo debitado de: {$saldoUsado}");
            }
            
            // Atualizar consulta com resultado e status apropriado
            $status = $result ? 'completed' : 'naoencontrado';
            $resultJson = $result ? json_encode($result) : null;

            $updateQuery = "UPDATE consultations SET 
                           result_data = ?, 
                           status = ?,
                           updated_at = NOW()
                           WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$resultJson, $status, $consultationId]);

            
            
            // REGISTRO DIRETO E FORÇADO na tabela consultas_cpf SEMPRE que for CPF
            if ($type === 'cpf') {
                error_log("CONSULTA_SERVICE: INICIANDO registro DIRETO na consultas_cpf");
                $cpfLimpo = preg_replace('/\D/', '', $document);
                error_log("CONSULTA_SERVICE: CPF limpo: {$cpfLimpo}, UserID: {$userId}, Cost: {$cost}");
                
                // Usar valores dos metadados ou padrão
                $originalPrice = 2.00; // Valor padrão
                $discountApplied = 0;
                
                if ($metadata && isset($metadata['original_price'])) {
                    $originalPrice = (float)$metadata['original_price'];
                    $discountApplied = max(0, $originalPrice - $cost);
                    error_log("CONSULTA_SERVICE: Usando metadata - Original: {$originalPrice}, Final: {$cost}, Desconto aplicado: {$discountApplied}");
                } else {
                    $discountApplied = max(0, $originalPrice - $cost);
                    error_log("CONSULTA_SERVICE: Usando padrão - Original: {$originalPrice}, Final: {$cost}, Desconto aplicado: {$discountApplied}");
                }
                
                $insertCpfQuery = "INSERT INTO consultas_cpf (user_id, cpf_consultado, resultado, valor_cobrado, desconto_aplicado, saldo_usado, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())";
                error_log("CONSULTA_SERVICE: Query: {$insertCpfQuery}");
                
                try {
                    $stmtCpf = $this->db->prepare($insertCpfQuery);
                    $params = [$userId, $cpfLimpo, ($result ? json_encode($result) : null), $cost, $discountApplied, $saldoUsado];
                    error_log("CONSULTA_SERVICE: Parâmetros: " . json_encode($params));
                    
                    $executeResult = $stmtCpf->execute($params);
                    error_log("CONSULTA_SERVICE: Execute result: " . ($executeResult ? 'TRUE' : 'FALSE'));
                    
                    if ($executeResult) {
                        $insertId = $this->db->lastInsertId();
                        error_log("CONSULTA_SERVICE: ✅ SUCESSO! Registro criado com ID: {$insertId}");
                    } else {
                        $errorInfo = $stmtCpf->errorInfo();
                        error_log("CONSULTA_SERVICE: ❌ ERRO SQL: " . json_encode($errorInfo));
                    }
                } catch (Exception $e) {
                    error_log("CONSULTA_SERVICE: ❌ EXCEÇÃO: " . $e->getMessage());
                }
            }
            
            // Registrar movimentação no caixa central (saída por consulta)
            try {
                $centralCash = new CentralCashService($this->db);
                $desc = "Consulta {$type} - {$document}";
                $centralCash->addTransactionLegacy('consulta', $cost, $desc, $userId, json_encode(['consultation_id' => $consultationId, 'saldo_usado' => $saldoUsado]));
            } catch (Exception $e) {
                error_log("CENTRAL_CASH REGISTER ERROR: " . $e->getMessage());
            }
            
            // Registrar auditoria do usuário
            try {
                $auditQuery = "INSERT INTO user_audit (user_id, action, category, description, new_values, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())";
                $auditStmt = $this->db->prepare($auditQuery);
                $auditStmt->execute([
                    $userId,
                    'consulta_realizada',
                    'consulta',
                    "Consulta {$type} realizada",
                    json_encode(['document' => $document, 'amount' => $cost, 'saldo_usado' => $saldoUsado, 'consultation_id' => $consultationId]),
                    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
                ]);
            } catch (Exception $e) {
                error_log("USER_AUDIT REGISTER ERROR: " . $e->getMessage());
            }
            
            $this->db->commit();
            
            return ($result && is_array($result))
                ? array_merge($result, ['consultation_id' => $consultationId])
                : ['consultation_id' => $consultationId, 'status' => $status];
            
        } catch (Exception $e) {
            $this->db->rollback();
            throw $e;
        }
    }
    
    private function processConsultation($type, $document) {
        switch ($type) {
            case 'cpf':
                return $this->processarCPF($document);
            case 'cnpj':
                return $this->processarCNPJ($document);
            case 'veiculo':
                return $this->processarVeiculo($document);
            default:
                throw new Exception('Tipo de consulta não suportado');
        }
    }
    
    private function processarCPF($cpf) {
        try {
            error_log("CONSULTA_SERVICE: Processando CPF: {$cpf}");
            
            // Limpar CPF para busca (remover pontos e traços)
            $cleanCpf = preg_replace('/\D/', '', $cpf);
            
            // Incluir modelo BaseCpf para busca na base de dados
            require_once __DIR__ . '/../models/BaseCpf.php';
            $baseCpfModel = new BaseCpf($this->db);
            
            // Buscar CPF na base de dados com diferentes formatos
            $cpfResult = null;
            $cpfFormats = [
                $cleanCpf, // CPF limpo (só números)
                substr($cleanCpf, 0, 3) . '.' . substr($cleanCpf, 3, 3) . '.' . substr($cleanCpf, 6, 3) . '-' . substr($cleanCpf, 9, 2), // Formatado
                $cpf // Original como veio
            ];
            
            foreach ($cpfFormats as $cpfFormat) {
                error_log("CONSULTA_SERVICE: Testando formato: {$cpfFormat}");
                $cpfResult = $baseCpfModel->getByCpf($cpfFormat);
                if ($cpfResult) {
                    error_log("CONSULTA_SERVICE: CPF encontrado com formato: {$cpfFormat}");
                    break;
                }
            }
            
            if ($cpfResult) {
                // Decodificar campos JSON se necessário
                $jsonFields = ['parentes', 'telefones', 'emails', 'enderecos', 'vacinas_covid', 
                              'empresas_socio', 'cnpj_mei', 'dividas_ativas', 'auxilio_emergencial',
                              'rais_historico', 'inss_dados', 'operadora_vivo', 'operadora_claro',
                              'operadora_tim', 'historico_veiculos', 'senhas_vazadas_email',
                              'senhas_vazadas_cpf', 'cloud_cpf', 'cloud_email'];
                
                foreach ($jsonFields as $field) {
                    if (isset($cpfResult[$field]) && !empty($cpfResult[$field])) {
                        $decoded = json_decode($cpfResult[$field], true);
                        $cpfResult[$field] = $decoded !== null ? $decoded : $cpfResult[$field];
                    }
                }
                
                error_log("CONSULTA_SERVICE: CPF encontrado na base de dados");
                return $cpfResult;
            } else {
                error_log("CONSULTA_SERVICE: CPF não encontrado na base de dados");
                return null;
            }
            
        } catch (Exception $e) {
            error_log("CONSULTA_SERVICE ERROR: " . $e->getMessage());
            return null;
        }
    }
    
    private function processarCNPJ($cnpj) {
        // Implementar consulta real de CNPJ
        return [
            'cnpj' => $cnpj,
            'razao_social' => 'Empresa Exemplo LTDA',
            'situacao' => 'Ativa',
            'data_abertura' => '2020-01-01',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    private function processarVeiculo($placa) {
        // Implementar consulta real de veículo
        return [
            'placa' => $placa,
            'modelo' => 'Veículo Exemplo',
            'ano' => '2020',
            'situacao' => 'Regular',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    /**
     * Debita saldo com prioridade (plano primeiro, depois carteira)
     */
    protected function debitUserBalanceWithPriority($userId, $amount) {
        // Buscar saldos atuais
        $stmt = $this->db->prepare("SELECT saldo, saldo_plano FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user) {
            throw new Exception('Usuário não encontrado para débito');
        }
        
        $saldoPlano = (float)$user['saldo_plano'];
        $saldoCarteira = (float)$user['saldo'];
        
        if (($saldoPlano + $saldoCarteira) < $amount) {
            throw new Exception('Saldo insuficiente para realizar a consulta');
        }
        
        $remaining = $amount;
        $debitFromPlan = 0.0;
        $debitFromWallet = 0.0;
        
        if ($saldoPlano > 0 && $remaining > 0) {
            $debitFromPlan = min($saldoPlano, $remaining);
            $remaining -= $debitFromPlan;
        }
        if ($remaining > 0) {
            $debitFromWallet = $remaining; // já garantido suficiente
        }
        
        // Usar WalletService para garantir registros corretos e atualização de user_wallets
        if ($debitFromPlan > 0) {
            $this->walletService->createTransaction($userId, 'consulta', $debitFromPlan, 'Consulta', 'consultation', null, 'plan');
        }
        if ($debitFromWallet > 0) {
            $this->walletService->createTransaction($userId, 'consulta', $debitFromWallet, 'Consulta', 'consultation', null, 'main');
        }
        
        return $debitFromPlan > 0 ? 'plano' : 'carteira';
    }
    
    /**
     * Criar transação na carteira
     */
    private function createWalletTransaction($userId, $walletType, $type, $amount, $description, $referenceType, $referenceId = null) {
        try {
            $transactionQuery = "INSERT INTO wallet_transactions (
                user_id, wallet_type, type, amount, description, reference_type, reference_id, 
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, 'completed', NOW())";
            
            $transactionStmt = $this->db->prepare($transactionQuery);
            $transactionStmt->execute([
                $userId, $walletType, $type, $amount, $description, $referenceType, $referenceId
            ]);
            
            error_log("WALLET_TRANSACTION: Criada para user {$userId}, tipo {$walletType}, valor {$amount}");
        } catch (Exception $e) {
            error_log("ERRO WALLET_TRANSACTION: " . $e->getMessage());
            throw $e; // Propagar erro para tratamento superior
        }
    }
    
    public function getUserConsultationHistory($userId, $type = null, $limit = 20, $offset = 0) {
        $query = "SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        
        $consultations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode JSON fields
        foreach ($consultations as &$consultation) {
            if (isset($consultation['result_data'])) {
                $consultation['result_data'] = json_decode($consultation['result_data'], true);
            }
            if (isset($consultation['metadata'])) {
                $consultation['metadata'] = json_decode($consultation['metadata'], true);
            }
        }
        
        return $consultations;
    }
    
    public function getConsultationStats($userId = null) {
        $query = "SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                    SUM(CASE WHEN status = 'naoencontrado' THEN 1 ELSE 0 END) as naoencontrado,
                    SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
                    SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today
                  FROM consultations";
        $params = [];
        
        if ($userId) {
            $query .= " WHERE user_id = ?";
            $params[] = $userId;
        }
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    /**
     * Cria registro na tabela consultas_cpf
     */
    protected function createConsultationRecord($userId, $type, $document, $result, $cost, $saldoUsado, $metadata = null) {
        if ($type !== 'cpf') {
            return null;
        }
        
        error_log("CONSULTA_SERVICE: Criando registro em consultas_cpf para user {$userId}, CPF {$document}");
        
        // Usar valores dos metadados ou padrão
        $originalPrice = 2.00; // Valor padrão
        $discountApplied = 0;
        
        if ($metadata && isset($metadata['original_price'])) {
            $originalPrice = (float)$metadata['original_price'];
            $discountApplied = max(0, $originalPrice - $cost);
            error_log("CONSULTA_SERVICE: Usando metadata - Original: {$originalPrice}, Final: {$cost}, Desconto aplicado: {$discountApplied}");
        } else {
            $discountApplied = max(0, $originalPrice - $cost);
            error_log("CONSULTA_SERVICE: Usando padrão - Original: {$originalPrice}, Final: {$cost}, Desconto aplicado: {$discountApplied}");
        }
        
        $query = "INSERT INTO consultas_cpf (
            user_id, cpf_consultado, resultado, valor_cobrado, desconto_aplicado, saldo_usado, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $userId,
            $document,
            $result ? json_encode($result) : null,
            $cost,
            $discountApplied, // desconto_aplicado calculado corretamente
            $saldoUsado
        ]);
        
        if ($success) {
            $consultaId = $this->db->lastInsertId();
            error_log("CONSULTA_SERVICE: Registro criado com sucesso em consultas_cpf, ID: {$consultaId}");
            return $consultaId;
        } else {
            error_log("CONSULTA_SERVICE: Falha ao criar registro em consultas_cpf");
            return null;
        }
    }
    
    /**
     * Valida CPF pelo algoritmo oficial
     */
    private function isValidCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        if (strlen($cpf) != 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;
        return (intval($cpf[9]) == $digit1 && intval($cpf[10]) == $digit2);
    }
}