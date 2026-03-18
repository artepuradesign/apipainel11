<?php
// src/services/BaseConsultaService.php

require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../services/WalletService.php';

/**
 * Serviço base para consultas - gerencia tabelas base e registros de consulta
 */
class BaseConsultaService {
    protected $db;
    protected $user;
    protected $walletService;
    
    // Tabelas de base de dados
    protected $tableBases = [
        'cpf' => 'base_cpf',
        'cnpj' => 'base_cnpj',
        'veiculo' => 'base_veiculos'
    ];
    
    // Tabelas de registro de consultas
    protected $tableRegistros = [
        'cpf' => 'consultas_cpf',
        'cnpj' => 'consultas_cnpj',
        'veiculo' => 'consultas_veiculos'
    ];
    
    // Custos por tipo de consulta
    protected $costs = [
        'cpf' => 2.00,
        'cnpj' => 3.00,
        'veiculo' => 4.00
    ];
    
    public function __construct($db) {
        $this->db = $db;
        $this->user = new User($db);
        $this->walletService = new WalletService($db);
    }
    
    /**
     * Realiza consulta com verificação de saldo e registro
     */
    public function performConsultation($userId, $type, $document) {
        try {
            $this->db->beginTransaction();
            
            // Verificar se usuário existe
            $this->user->id = $userId;
            if (!$this->user->readOne()) {
                throw new Exception('Usuário não encontrado');
            }
            
            // Verificar custo da consulta (valor base)
            $baseCost = $this->costs[$type] ?? 0.00;
            
            // Aplicar desconto do plano do usuário, quando houver
            $planName = $this->getUserPlanName($userId);
            $finalCost = $this->calculateCostWithPlanDiscount($baseCost, $planName);
            
            // Verificar saldo suficiente considerando o valor final (com desconto)
            if (!$this->checkSufficientBalance($userId, $finalCost)) {
                throw new Exception('Saldo insuficiente para realizar a consulta');
            }
            
            // Buscar dados na tabela base
            $result = $this->searchInBaseTable($type, $document);
            
            if (!$result) {
                // Se não encontrou na base, buscar na API externa
                $result = $this->fetchFromExternalAPI($type, $document);
                
                // Salvar na tabela base para próximas consultas
                if ($result) {
                    $this->saveToBaseTable($type, $result);
                }
            }
            
            // Debitar saldo usando lógica prioritária (plano primeiro, depois carteira)
            $saldoUsado = $this->debitUserBalanceWithPriority($userId, $finalCost);
            
            // Registrar a consulta na tabela de registros com valor final (com desconto)
            $consultaId = $this->createConsultationRecord($userId, $type, $document, $result, $finalCost, $saldoUsado);
            
            $this->db->commit();
            
            return [
                'success' => true,
                'data' => $result,
                'consultation_id' => $consultaId,
                'cost' => $finalCost,
                'balance_used' => $saldoUsado
            ];
            
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("CONSULTATION_ERROR: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Busca dados na tabela base correspondente
     */
    protected function searchInBaseTable($type, $document) {
        $tableName = $this->tableBases[$type] ?? null;
        if (!$tableName) {
            throw new Exception('Tipo de consulta não suportado');
        }
        
        $documentField = $this->getDocumentField($type);
        
        $query = "SELECT * FROM {$tableName} WHERE {$documentField} = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$document]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            error_log("FOUND_IN_BASE: Found {$type} data for {$document} in base table");
        }
        
        return $result;
    }
    
    /**
     * Busca dados na API externa (implementar por tipo específico)
     */
    protected function fetchFromExternalAPI($type, $document) {
        error_log("EXTERNAL_API: Fetching {$type} data for {$document} from external API");
        
        // Por enquanto retorna dados simulados
        // Implementar integração real com APIs externas
        switch ($type) {
            case 'cpf':
                return $this->simulateCPFData($document);
            case 'cnpj':
                return $this->simulateCNPJData($document);
            case 'veiculo':
                return $this->simulateVehicleData($document);
            default:
                return null;
        }
    }
    
    /**
     * Salva dados na tabela base correspondente
     */
    protected function saveToBaseTable($type, $data) {
        $tableName = $this->tableBases[$type] ?? null;
        if (!$tableName || !$data) {
            return false;
        }
        
        try {
            switch ($type) {
                case 'cpf':
                    $this->saveCPFToBase($data);
                    break;
                case 'cnpj':
                    $this->saveCNPJToBase($data);
                    break;
                case 'veiculo':
                    $this->saveVehicleToBase($data);
                    break;
            }
            
            error_log("SAVED_TO_BASE: Saved {$type} data to base table");
            return true;
            
        } catch (Exception $e) {
            error_log("SAVE_BASE_ERROR: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Verifica se há saldo suficiente para a consulta
     */
    protected function checkSufficientBalance($userId, $cost) {
        $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return false;
        }
        
        $totalBalance = (float)$user['saldo'] + (float)$user['saldo_plano'];
        return $totalBalance >= $cost;
    }
    
    /**
     * Debita saldo com prioridade (plano primeiro, depois carteira)
     */
    protected function debitUserBalanceWithPriority($userId, $amount) {
        $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('Usuário não encontrado para débito');
        }
        
        $saldoPlano = (float)$user['saldo_plano'];
        $saldoCarteira = (float)$user['saldo'];
        
        $remainingAmount = $amount;
        $debitFromPlan = 0;
        $debitFromWallet = 0;
        
        // Primeiro, tentar debitar do saldo do plano
        if ($saldoPlano > 0 && $remainingAmount > 0) {
            $debitFromPlan = min($saldoPlano, $remainingAmount);
            $remainingAmount -= $debitFromPlan;
        }
        
        // Se ainda há valor para debitar, usar saldo da carteira
        if ($remainingAmount > 0) {
            if ($saldoCarteira >= $remainingAmount) {
                $debitFromWallet = $remainingAmount;
            } else {
                throw new Exception('Saldo total insuficiente');
            }
        }
        
        // Atualizar saldos
        $newPlanBalance = $saldoPlano - $debitFromPlan;
        $newWalletBalance = $saldoCarteira - $debitFromWallet;
        
        $updateQuery = "UPDATE users SET 
                        saldo_plano = ?, 
                        saldo = ?,
                        saldo_atualizado = 1,
                        updated_at = NOW() 
                        WHERE id = ?";
        $updateStmt = $this->db->prepare($updateQuery);
        $updateStmt->execute([$newPlanBalance, $newWalletBalance, $userId]);
        
        // Registrar transações no wallet (tipo correto: 'consulta')
        if ($debitFromPlan > 0) {
            // Debitar do saldo do plano
            $this->walletService->createTransaction($userId, 'consulta', $debitFromPlan, 'Consulta', 'consultation', null, 'plan');
        }
        
        if ($debitFromWallet > 0) {
            // Debitar do saldo principal (carteira digital)
            $this->walletService->createTransaction($userId, 'consulta', $debitFromWallet, 'Consulta', 'consultation', null, 'main');
        }
        
        return $debitFromPlan > 0 ? 'plano' : 'carteira';
    }
    
    /**
     * Cria registro da consulta na tabela correspondente
     */
    protected function createConsultationRecord($userId, $type, $document, $result, $cost, $saldoUsado) {
        $tableName = $this->tableRegistros[$type] ?? null;
        if (!$tableName) {
            throw new Exception('Tabela de registro não encontrada');
        }
        
        $documentField = $this->getDocumentFieldForRecord($type);
        
        $query = "INSERT INTO {$tableName} (
            user_id, {$documentField}, resultado, valor_cobrado, saldo_usado, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $userId,
            $document,
            json_encode($result),
            $cost,
            $saldoUsado
        ]);
        
        return $this->db->lastInsertId();
    }
    
    /**
     * Retorna o campo do documento para cada tipo
     */
    protected function getDocumentField($type) {
        return [
            'cpf' => 'cpf',
            'cnpj' => 'cnpj',
            'veiculo' => 'placa'
        ][$type] ?? 'documento';
    }
    
    /**
     * Retorna o campo do documento para tabelas de registro
     */
    protected function getDocumentFieldForRecord($type) {
        return [
            'cpf' => 'cpf_consultado',
            'cnpj' => 'cnpj_consultado', 
            'veiculo' => 'placa_consultada'
        ][$type] ?? 'documento_consultado';
    }
    
    // Métodos de simulação de dados (implementar integração real)
    protected function simulateCPFData($cpf) {
        return [
            'cpf' => $cpf,
            'nome' => 'João da Silva Santos',
            'data_nascimento' => '1985-05-15',
            'sexo' => 'Masculino',
            'mae' => 'Maria da Silva',
            'pai' => 'José dos Santos',
            'endereco' => 'Rua das Flores, 123, Apto 45',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'situacao' => 'REGULAR',
            'score' => 750
        ];
    }
    
    protected function simulateCNPJData($cnpj) {
        return [
            'cnpj' => $cnpj,
            'razao_social' => 'Empresa Exemplo LTDA',
            'nome_fantasia' => 'Exemplo',
            'situacao' => 'Ativa',
            'endereco' => 'Av. Paulista, 1000',
            'cidade' => 'São Paulo',
            'estado' => 'SP'
        ];
    }
    
    protected function simulateVehicleData($placa) {
        return [
            'placa' => $placa,
            'marca' => 'Toyota',
            'modelo' => 'Corolla',
            'ano_fabricacao' => 2020,
            'ano_modelo' => 2021,
            'cor' => 'Branco',
            'situacao' => 'Regular'
        ];
    }
    
    // Métodos para salvar na base (implementar conforme estrutura)
    protected function saveCPFToBase($data) {
        $query = "INSERT IGNORE INTO base_cpf (
            cpf, nome, data_nascimento, sexo, mae, pai, endereco, cidade, estado, situacao, score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['cpf'],
            $data['nome'] ?? null,
            $data['data_nascimento'] ?? null,
            $data['sexo'] ?? null,
            $data['mae'] ?? null,
            $data['pai'] ?? null,
            $data['endereco'] ?? null,
            $data['cidade'] ?? null,
            $data['estado'] ?? null,
            $data['situacao'] ?? null,
            $data['score'] ?? null
        ]);
    }
    
    protected function saveCNPJToBase($data) {
        $query = "INSERT IGNORE INTO base_cnpj (
            cnpj, razao_social, nome_fantasia, situacao, endereco, cidade, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['cnpj'],
            $data['razao_social'] ?? null,
            $data['nome_fantasia'] ?? null,
            $data['situacao'] ?? null,
            $data['endereco'] ?? null,
            $data['cidade'] ?? null,
            $data['estado'] ?? null
        ]);
    }
    
    protected function saveVehicleToBase($data) {
        $query = "INSERT IGNORE INTO base_veiculos (
            placa, marca, modelo, ano_fabricacao, ano_modelo, cor, situacao
        ) VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['placa'],
            $data['marca'] ?? null,
            $data['modelo'] ?? null,
            $data['ano_fabricacao'] ?? null,
            $data['ano_modelo'] ?? null,
            $data['cor'] ?? null,
            $data['situacao'] ?? null
        ]);
    }
    
    /**
     * Obtém histórico de consultas do usuário
     */
    public function getUserConsultationHistory($userId, $type = null, $limit = 20, $offset = 0) {
        $tables = $type ? [$type => $this->tableRegistros[$type]] : $this->tableRegistros;
        $results = [];
        
        foreach ($tables as $consultationType => $tableName) {
            if (!$tableName) continue;
            
            $documentField = $this->getDocumentFieldForRecord($consultationType);
            
            $query = "SELECT 
                        id,
                        '{$consultationType}' as tipo,
                        {$documentField} as documento,
                        valor_cobrado,
                        saldo_usado,
                        created_at
                      FROM {$tableName} 
                      WHERE user_id = ? 
                      ORDER BY created_at DESC";
            
            if ($type) {
                $query .= " LIMIT {$limit} OFFSET {$offset}";
            }
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $results[] = $row;
            }
        }
        
        // Ordenar por data se consultando todos os tipos
        if (!$type) {
            usort($results, function($a, $b) {
                return strtotime($b['created_at']) - strtotime($a['created_at']);
            });
            
            $results = array_slice($results, $offset, $limit);
        }
        
        return $results;
    }

    // === Plan discount helpers ===
    protected function getUserPlanName($userId) {
        $stmt = $this->db->prepare("SELECT tipoplano FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['tipoplano'] ?? 'Pré-Pago';
    }

    protected function getDiscountPercentForPlan($planName) {
        $map = [
            'Pré-Pago' => 0,
            'Rainha de Ouros' => 5,
            'Rainha de Paus' => 10,
            'Rainha de Copas' => 15,
            'Rainha de Espadas' => 20,
            'Rei de Ouros' => 20,
            'Rei de Paus' => 30,
            'Rei de Copas' => 40,
            'Rei de Espadas' => 50,
        ];
        return $map[$planName] ?? 0;
    }

    protected function calculateCostWithPlanDiscount($baseCost, $planName) {
        $discount = $this->getDiscountPercentForPlan($planName);
        $discountAmount = ($baseCost * $discount) / 100.0;
        $final = $baseCost - $discountAmount;
        $final = $final < 0.01 ? 0.01 : $final;
        return round($final, 2);
    }
}