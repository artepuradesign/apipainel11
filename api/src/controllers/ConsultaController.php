
<?php
// src/controllers/ConsultaController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/Consulta.php';
require_once __DIR__ . '/../services/ConsultaService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ConsultaController {
    private $db;
    private $consultaService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultaService = new ConsultaService($db);
    }
    
    public function consultaCPF() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['cpf']) || empty($input['cpf'])) {
            Response::error('CPF é obrigatório', 400);
            return;
        }
        
        // Validar formato do CPF antes de processar
        if (!$this->isValidCPF($input['cpf'])) {
            Response::error('CPF inválido', 422);
            return;
        }
        
        try {
            // Verificar saldo com prioridade (plano primeiro, depois carteira) e aplicar desconto
            $balanceCheck = $this->verificarSaldoComDesconto($userId, 'cpf');
            
            if (!$balanceCheck['sufficient']) {
                Response::error($balanceCheck['message'], 402);
                return;
            }
            
            // Realizar consulta
            $resultado = $this->consultaService->performConsultation(
                $userId, 
                'cpf', 
                $input['cpf'], 
                $balanceCheck['final_cost']
            );
            
            Response::success([
                'id' => $resultado['consultation_id'] ?? null,
                'user_id' => $userId,
                'module_type' => 'cpf',
                'document' => $input['cpf'],
                'cost' => $balanceCheck['final_cost'],
                'result_data' => $resultado,
                'status' => $resultado['status'] ?? 'completed',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ], 'Consulta CPF realizada com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro na consulta CPF: ' . $e->getMessage());
        }
    }
    
    public function consultaCNPJ() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['cnpj']) || empty($input['cnpj'])) {
            Response::error('CNPJ é obrigatório', 400);
            return;
        }
        
        try {
            if (!$this->verificarSaldoUsuario($userId, 'cnpj')) {
                Response::error('Saldo insuficiente para esta consulta', 402);
                return;
            }
            
            $resultado = $this->consultaService->consultarCNPJ($input['cnpj']);
            
            $this->registrarConsulta($userId, 'cnpj', $input['cnpj'], $resultado);
            $this->debitarSaldo($userId, 'cnpj');
            
            Response::success($resultado, 'Consulta CNPJ realizada com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro na consulta CNPJ: ' . $e->getMessage());
        }
    }
    
    public function consultaVeiculo() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['placa']) || empty($input['placa'])) {
            Response::error('Placa é obrigatória', 400);
            return;
        }
        
        try {
            if (!$this->verificarSaldoUsuario($userId, 'veiculo')) {
                Response::error('Saldo insuficiente para esta consulta', 402);
                return;
            }
            
            $resultado = $this->consultaService->consultarVeiculo($input['placa']);
            
            $this->registrarConsulta($userId, 'veiculo', $input['placa'], $resultado);
            $this->debitarSaldo($userId, 'veiculo');
            
            Response::success($resultado, 'Consulta Veículo realizada com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro na consulta Veículo: ' . $e->getMessage());
        }
    }
    
    public function consultaTelefone() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['telefone']) || empty($input['telefone'])) {
            Response::error('Telefone é obrigatório', 400);
            return;
        }
        
        try {
            if (!$this->verificarSaldoUsuario($userId, 'telefone')) {
                Response::error('Saldo insuficiente para esta consulta', 402);
                return;
            }
            
            $resultado = $this->consultaService->consultarTelefone($input['telefone']);
            
            $this->registrarConsulta($userId, 'telefone', $input['telefone'], $resultado);
            $this->debitarSaldo($userId, 'telefone');
            
            Response::success($resultado, 'Consulta Telefone realizada com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro na consulta Telefone: ' . $e->getMessage());
        }
    }
    
    public function consultaScore() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['cpf']) || empty($input['cpf'])) {
            Response::error('CPF é obrigatório', 400);
            return;
        }
        
        try {
            if (!$this->verificarSaldoUsuario($userId, 'score')) {
                Response::error('Saldo insuficiente para esta consulta', 402);
                return;
            }
            
            $resultado = $this->consultaService->consultarScore($input['cpf']);
            
            $this->registrarConsulta($userId, 'score', $input['cpf'], $resultado);
            $this->debitarSaldo($userId, 'score');
            
            Response::success($resultado, 'Consulta Score realizada com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro na consulta Score: ' . $e->getMessage());
        }
    }
    
    public function getHistory() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 20;
            $tipo = $_GET['tipo'] ?? null;
            
            $offset = ($page - 1) * $limit;
            
            $whereClause = "WHERE user_id = ?";
            $params = [$userId];
            
            if ($tipo) {
                $whereClause .= " AND tipo = ?";
                $params[] = $tipo;
            }
            
            $query = "SELECT * FROM consultations 
                      $whereClause 
                      ORDER BY created_at DESC 
                      LIMIT ? OFFSET ?";
            
            $params[] = $limit;
            $params[] = $offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Contar total
            $countQuery = "SELECT COUNT(*) as total FROM consultations $whereClause";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute(array_slice($params, 0, -2));
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            Response::success([
                'data' => $history,
                'pagination' => [
                    'current_page' => (int)$page,
                    'per_page' => (int)$limit,
                    'total' => (int)$total,
                    'total_pages' => ceil($total / $limit)
                ]
            ], 'Histórico obtido com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter histórico: ' . $e->getMessage());
        }
    }
    
    public function getStats() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        try {
            $query = "SELECT 
                        tipo,
                        COUNT(*) as total,
                        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as hoje,
                        COUNT(CASE WHEN WEEK(created_at) = WEEK(NOW()) THEN 1 END) as esta_semana,
                        COUNT(CASE WHEN MONTH(created_at) = MONTH(NOW()) THEN 1 END) as este_mes
                      FROM consultations 
                      WHERE user_id = ? 
                      GROUP BY tipo";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success($stats, 'Estatísticas obtidas com sucesso');
            
        } catch (Exception $e) {
            Response::serverError('Erro ao obter estatísticas: ' . $e->getMessage());
        }
    }
    
    private function verificarSaldoComDesconto($userId, $tipoConsulta) {
        // Buscar informações do usuário e assinatura ativa
        $query = "SELECT u.saldo, u.saldo_plano, 
                         p.name as plan_name, p.discount_percentage, us.status as subscription_status
                  FROM users u
                  LEFT JOIN user_subscriptions us ON u.id = us.user_id 
                      AND us.status = 'active' 
                      AND us.end_date > CURDATE()
                  LEFT JOIN plans p ON us.plan_id = p.id
                  WHERE u.id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return [
                'sufficient' => false,
                'message' => 'Usuário não encontrado'
            ];
        }
        
        // Definir custos base por tipo de consulta
        $custos = [
            'cpf' => 2.00,
            'cnpj' => 3.00,
            'veiculo' => 4.00,
            'telefone' => 1.50,
            'score' => 5.00
        ];
        
        $custoBase = $custos[$tipoConsulta] ?? 2.00;
        
        // Aplicar desconto se há assinatura ativa
        $discountPercentage = 0;
        if ($user['subscription_status'] === 'active' && $user['discount_percentage']) {
            $discountPercentage = (float)$user['discount_percentage'];
        }
        
        $custoFinal = $custoBase - ($custoBase * $discountPercentage / 100);
        $custoFinal = max($custoFinal, 0.01); // Mínimo de R$ 0,01
        
        // Verificar saldo com prioridade (plano primeiro, depois carteira)
        $saldoPlano = (float)($user['saldo_plano'] ?? 0.00);
        $saldoCarteira = (float)($user['saldo'] ?? 0.00);
        $saldoTotal = $saldoPlano + $saldoCarteira;
        
        error_log("BALANCE_CHECK: User {$userId}, Tipo {$tipoConsulta}, Custo base: R$ {$custoBase}, Desconto: {$discountPercentage}%, Custo final: R$ {$custoFinal}, Saldo plano: R$ {$saldoPlano}, Saldo carteira: R$ {$saldoCarteira}");
        
        if ($saldoTotal < $custoFinal) {
            return [
                'sufficient' => false,
                'message' => "Saldo insuficiente. Necessário: R$ " . number_format($custoFinal, 2, ',', '.') . 
                           ", Disponível: R$ " . number_format($saldoTotal, 2, ',', '.'),
                'required_amount' => $custoFinal,
                'user_balance' => $saldoCarteira,
                'plan_balance' => $saldoPlano
            ];
        }
        
        return [
            'sufficient' => true,
            'final_cost' => $custoFinal,
            'discount_percentage' => $discountPercentage,
            'plan_name' => $user['plan_name'],
            'plan_balance' => $saldoPlano,
            'user_balance' => $saldoCarteira
        ];
    }
    
    private function registrarConsulta($userId, $tipo, $documento, $resultado) {
        $query = "INSERT INTO consultations (user_id, tipo, documento, resultado, status, created_at) 
                  VALUES (?, ?, ?, ?, 'concluida', NOW())";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $tipo, $documento, json_encode($resultado)]);
    }
    
    private function debitarSaldo($userId, $tipoConsulta) {
        $custos = [
            'cpf' => 1.0,
            'cnpj' => 2.0,
            'veiculo' => 3.0,
            'telefone' => 1.5,
            'score' => 5.0
        ];
        
        $custo = $custos[$tipoConsulta] ?? 1.0;
        
        $query = "UPDATE users SET saldo = saldo - ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$custo, $userId]);
        
        // Registrar transação
        $queryTrans = "INSERT INTO transactions (user_id, tipo, valor, descricao, status, created_at) 
                       VALUES (?, 'debito', ?, ?, 'concluida', NOW())";
        $stmtTrans = $this->db->prepare($queryTrans);
        $stmtTrans->execute([$userId, $custo, "Consulta $tipoConsulta"]);
    }
    
    /**
     * Cadastrar novo CPF na base de dados externa
     */
    public function cadastrarCPF() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos obrigatórios
        if (!isset($input['cpf']) || empty($input['cpf'])) {
            Response::error('CPF é obrigatório', 400);
            return;
        }
        
        if (!isset($input['nome']) || empty($input['nome'])) {
            Response::error('Nome é obrigatório', 400);
            return;
        }
        
        try {
            // Verificar se CPF já existe
            $checkQuery = "SELECT id FROM base_cpf WHERE cpf = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$input['cpf']]);
            
            if ($checkStmt->fetch()) {
                Response::error('CPF já cadastrado na base de dados', 409);
                return;
            }
            
            // Preparar dados para inserção
            $insertQuery = "INSERT INTO base_cpf (
                cpf, nome, data_nascimento, sexo, mae, pai, estado_civil, rg, orgao_emissor, 
                uf_emissao, titulo_eleitor, zona, secao, nsu, pis, poder_aquisitivo, renda, 
                faixa_poder_aquisitivo, csb8, csb8_faixa, csba, csba_faixa, renda_presumida, 
                percentual_participacao_societaria, escolaridade, aposentado, tipo_emprego, 
                cbo, situacao_cpf, situacao_receita, status_receita_federal, data_obito, 
                cns, foto_rosto_rg, foto_rosto_cnh, foto_doc_rg, foto_doc_cnh, parentes, 
                telefones, emails, enderecos, vacinas_covid, empresas_socio, cnpj_mei, 
                dividas_ativas, auxilio_emergencial, rais_historico, inss_dados, 
                operadora_vivo, operadora_claro, operadora_tim, historico_veiculos, 
                senhas_vazadas_email, senhas_vazadas_cpf, cloud_cpf, cloud_email, 
                nivel_consulta, fonte_dados, qualidade_dados, created_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, NOW()
            )";
            
            $insertStmt = $this->db->prepare($insertQuery);
            
            // Preparar valores para inserção
            $values = [
                $input['cpf'],
                $input['nome'],
                $input['data_nascimento'] ?? null,
                $input['sexo'] ?? null,
                $input['mae'] ?? null,
                $input['pai'] ?? null,
                $input['estado_civil'] ?? null,
                $input['rg'] ?? null,
                $input['orgao_emissor'] ?? null,
                $input['uf_emissao'] ?? null,
                $input['titulo_eleitor'] ?? null,
                $input['zona'] ?? null,
                $input['secao'] ?? null,
                $input['nsu'] ?? null,
                $input['pis'] ?? null,
                $input['poder_aquisitivo'] ?? null,
                $input['renda'] ?? null,
                $input['faixa_poder_aquisitivo'] ?? null,
                $input['csb8'] ?? null,
                $input['csb8_faixa'] ?? null,
                $input['csba'] ?? null,
                $input['csba_faixa'] ?? null,
                $input['renda_presumida'] ?? null,
                $input['percentual_participacao_societaria'] ?? null,
                $input['escolaridade'] ?? null,
                $input['aposentado'] ?? null,
                $input['tipo_emprego'] ?? null,
                $input['cbo'] ?? null,
                $input['situacao_cpf'] ?? null,
                $input['situacao_receita'] ?? null,
                $input['status_receita_federal'] ?? null,
                $input['data_obito'] ?? null,
                $input['cns'] ?? null,
                $input['foto_rosto_rg'] ?? null,
                $input['foto_rosto_cnh'] ?? null,
                $input['foto_doc_rg'] ?? null,
                $input['foto_doc_cnh'] ?? null,
                // Campos JSON
                isset($input['parentes']) ? json_encode($input['parentes']) : null,
                isset($input['telefones']) ? json_encode($input['telefones']) : null,
                isset($input['emails']) ? json_encode($input['emails']) : null,
                isset($input['enderecos']) ? json_encode($input['enderecos']) : null,
                isset($input['vacinas_covid']) ? json_encode($input['vacinas_covid']) : null,
                isset($input['empresas_socio']) ? json_encode($input['empresas_socio']) : null,
                isset($input['cnpj_mei']) ? json_encode($input['cnpj_mei']) : null,
                isset($input['dividas_ativas']) ? json_encode($input['dividas_ativas']) : null,
                isset($input['auxilio_emergencial']) ? json_encode($input['auxilio_emergencial']) : null,
                isset($input['rais_historico']) ? json_encode($input['rais_historico']) : null,
                isset($input['inss_dados']) ? json_encode($input['inss_dados']) : null,
                isset($input['operadora_vivo']) ? json_encode($input['operadora_vivo']) : null,
                isset($input['operadora_claro']) ? json_encode($input['operadora_claro']) : null,
                isset($input['operadora_tim']) ? json_encode($input['operadora_tim']) : null,
                isset($input['historico_veiculos']) ? json_encode($input['historico_veiculos']) : null,
                isset($input['senhas_vazadas_email']) ? json_encode($input['senhas_vazadas_email']) : null,
                isset($input['senhas_vazadas_cpf']) ? json_encode($input['senhas_vazadas_cpf']) : null,
                isset($input['cloud_cpf']) ? json_encode($input['cloud_cpf']) : null,
                isset($input['cloud_email']) ? json_encode($input['cloud_email']) : null,
                $input['nivel_consulta'] ?? 'basico',
                $input['fonte_dados'] ?? 'cadastro_manual',
                $input['qualidade_dados'] ?? 50
            ];
            
            $insertStmt->execute($values);
            $cpfId = $this->db->lastInsertId();
            
            // Log da operação
            error_log("CPF_CADASTRAR: User $userId cadastrou CPF {$input['cpf']} (ID: $cpfId)");
            
            Response::success([
                'id' => $cpfId,
                'cpf' => $input['cpf'],
                'nome' => $input['nome'],
                'message' => 'CPF cadastrado com sucesso na base de dados externa'
            ]);
            
        } catch (Exception $e) {
            error_log("ERRO_CADASTRAR_CPF: " . $e->getMessage());
            Response::error('Erro interno ao cadastrar CPF: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Método genérico para realizar consultas - POST para /consultas
     */
    public function performConsultation() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) {
            Response::error('Usuário não autenticado', 401);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Dados inválidos', 400);
            return;
        }
        
        try {
            // Identificar tipo de consulta - aceitar tanto 'cpf' quanto 'document' para compatibilidade
            $cpfDocument = $input['cpf'] ?? $input['document'] ?? null;
            $cnpjDocument = $input['cnpj'] ?? $input['document'] ?? null; 
            $placaDocument = $input['placa'] ?? $input['document'] ?? null;
            
            if ($cpfDocument && isset($input['module_type']) && $input['module_type'] === 'cpf') {
                // Verificar saldo com desconto
                $balanceCheck = $this->verificarSaldoComDesconto($userId, 'cpf');
                
                if (!$balanceCheck['sufficient']) {
                    Response::error($balanceCheck['message'], 402);
                    return;
                }
                
                // Realizar consulta CPF
                $resultado = $this->consultaService->performConsultation(
                    $userId, 
                    'cpf', 
                    $cpfDocument, 
                    $balanceCheck['final_cost']
                );
                
                Response::success([
                    'id' => $resultado['consultation_id'] ?? null,
                    'user_id' => $userId,
                    'module_type' => 'cpf',
                    'document' => $cpfDocument,
                    'cost' => $balanceCheck['final_cost'],
                    'result_data' => $resultado,
                    'status' => 'completed',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'Consulta CPF realizada com sucesso');
                
            } elseif ($cnpjDocument && isset($input['module_type']) && $input['module_type'] === 'cnpj') {
                // Verificar saldo com desconto
                $balanceCheck = $this->verificarSaldoComDesconto($userId, 'cnpj');
                
                if (!$balanceCheck['sufficient']) {
                    Response::error($balanceCheck['message'], 402);
                    return;
                }
                
                // Realizar consulta CNPJ
                $resultado = $this->consultaService->performConsultation(
                    $userId, 
                    'cnpj', 
                    $cnpjDocument, 
                    $balanceCheck['final_cost']
                );
                
                Response::success([
                    'id' => $resultado['consultation_id'] ?? null,
                    'user_id' => $userId,
                    'module_type' => 'cnpj',
                    'document' => $cnpjDocument,
                    'cost' => $balanceCheck['final_cost'],
                    'result_data' => $resultado,
                    'status' => 'completed',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'Consulta CNPJ realizada com sucesso');
                
            } elseif ($placaDocument && isset($input['module_type']) && $input['module_type'] === 'veiculo') {
                // Verificar saldo com desconto
                $balanceCheck = $this->verificarSaldoComDesconto($userId, 'veiculo');
                
                if (!$balanceCheck['sufficient']) {
                    Response::error($balanceCheck['message'], 402);
                    return;
                }
                
                // Realizar consulta Veículo
                $resultado = $this->consultaService->performConsultation(
                    $userId, 
                    'veiculo', 
                    $placaDocument, 
                    $balanceCheck['final_cost']
                );
                
                Response::success([
                    'id' => $resultado['consultation_id'] ?? null,
                    'user_id' => $userId,
                    'module_type' => 'veiculo',
                    'document' => $placaDocument,
                    'cost' => $balanceCheck['final_cost'],
                    'result_data' => $resultado,
                    'status' => 'completed',
                    'created_at' => date('Y-m-d H:i:s'),
                    'updated_at' => date('Y-m-d H:i:s')
                ], 'Consulta Veículo realizada com sucesso');
                
            } else {
                Response::error('Tipo de consulta não suportado ou dados insuficientes', 400);
                return;
            }
            
        } catch (Exception $e) {
            error_log('CONSULTATION_ERROR: ' . $e->getMessage());
            Response::serverError('Erro na consulta: ' . $e->getMessage());
        }
    }
    
    /**
     * Validar formato de CPF
     */
    private function isValidCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        if (strlen($cpf) != 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }
        
        // Calcular primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        // Calcular segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        return (intval($cpf[9]) == $digit1 && intval($cpf[10]) == $digit2);
    }
}
