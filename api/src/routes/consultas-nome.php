<?php
// src/routes/consultas-nome.php - Rotas para consultas por nome completo

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/WalletService.php';
require_once __DIR__ . '/../services/CentralCashService.php';
require_once __DIR__ . '/../models/Consultations.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

// Obter conexão do pool
$db = getDBConnection();

$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    exit;
}

$userId = AuthMiddleware::getCurrentUserId();
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

error_log("CONSULTAS_NOME_ROUTE: Method: {$method}, Path: {$path}, User: {$userId}");

switch ($method) {
    case 'POST':
        if (strpos($path, '/consultas-nome/create') !== false || strpos($path, '/consultas-nome') !== false) {
            createConsultaNome($db, $userId);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'GET':
        if (strpos($path, '/consultas-nome/history') !== false) {
            getConsultasNomeHistory($db, $userId);
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}

function createConsultaNome($db, $userId) {
    try {
        error_log("CONSULTAS_NOME: Iniciando criação de consulta por nome");
        
        $rawInput = file_get_contents('php://input');
        error_log("CONSULTAS_NOME: Raw input: " . $rawInput);
        
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            error_log("CONSULTAS_NOME: Dados inválidos");
            Response::error('Dados inválidos', 400);
            return;
        }
        
        // Validar campos obrigatórios
        $document = $input['document'] ?? '';
        $cost = (float)($input['cost'] ?? 0);
        $resultData = $input['result_data'] ?? null;
        $metadata = $input['metadata'] ?? [];
        
        if (empty($document)) {
            Response::error('Nome/documento é obrigatório', 400);
            return;
        }
        
        if ($cost <= 0) {
            Response::error('Custo deve ser maior que zero', 400);
            return;
        }
        
        error_log("CONSULTAS_NOME: Document: {$document}, Cost: {$cost}");
        
        // Iniciar transação
        $db->beginTransaction();
        
        try {
            // Buscar saldos atuais do usuário
            $query = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$user) {
                throw new Exception('Usuário não encontrado');
            }
            
            $saldoPlano = (float)($user['saldo_plano'] ?? 0.00);
            $saldoCarteira = (float)($user['saldo'] ?? 0.00);
            $totalBalance = $saldoPlano + $saldoCarteira;
            
            error_log("CONSULTAS_NOME: Saldos - Plano: {$saldoPlano}, Carteira: {$saldoCarteira}, Total: {$totalBalance}");
            
            // Verificar saldo suficiente
            if ($totalBalance < $cost) {
                throw new Exception("Saldo insuficiente. Necessário: R$ {$cost}, Disponível: R$ {$totalBalance}");
            }
            
            // Lógica de débito com prioridade: plano primeiro, depois carteira
            $remainingAmount = $cost;
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
            
            error_log("CONSULTAS_NOME: Débitos - Plano: {$debitFromPlan}, Carteira: {$debitFromWallet}, Tipo: {$saldoUsado}");
            
            // Atualizar saldos na tabela users
            $newPlanBalance = $saldoPlano - $debitFromPlan;
            $newWalletBalance = $saldoCarteira - $debitFromWallet;
            
            $updateQuery = "UPDATE users SET 
                            saldo_plano = ?, 
                            saldo = ?,
                            saldo_atualizado = 1,
                            updated_at = NOW() 
                            WHERE id = ?";
            $updateStmt = $db->prepare($updateQuery);
            $updateStmt->execute([$newPlanBalance, $newWalletBalance, $userId]);
            
            error_log("CONSULTAS_NOME: Saldos atualizados - Novo Plano: {$newPlanBalance}, Nova Carteira: {$newWalletBalance}");
            
            // Criar registro na tabela consultations
            $metadataPayload = array_merge($metadata, [
                'saldo_usado' => $saldoUsado,
                'debit_from_plan' => $debitFromPlan,
                'debit_from_wallet' => $debitFromWallet,
                'saldo_anterior_plano' => $saldoPlano,
                'saldo_anterior_carteira' => $saldoCarteira,
                'saldo_atual_plano' => $newPlanBalance,
                'saldo_atual_carteira' => $newWalletBalance
            ]);
            
            $consultationsModel = new Consultations($db);
            $consultationId = $consultationsModel->create([
                'user_id' => $userId,
                'module_type' => $input['module_type'] ?? 'nome',
                'document' => $document,
                'cost' => $cost,
                'result_data' => $resultData,
                'status' => 'completed',
                'saldo_usado' => $saldoUsado,
                'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
                'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null,
                'metadata' => $metadataPayload
            ]);
            
            error_log("CONSULTAS_NOME: Consulta registrada com ID: {$consultationId}");
            
            // Registrar no caixa central
            try {
                $centralCashService = new CentralCashService($db);
                $currentCentralBalance = $centralCashService->getCurrentBalance();
                $newCentralBalance = $currentCentralBalance + $cost;
                
                $centralCashService->addTransaction(
                    'consulta',
                    $cost,
                    $currentCentralBalance,
                    $newCentralBalance,
                    $userId,
                    1,
                    "Consulta Nome - {$document} (Saldo usado: {$saldoUsado})",
                    null,
                    'consultations',
                    $consultationId,
                    null
                );
                
                error_log("CONSULTAS_NOME: Registrado no caixa central");
            } catch (Exception $e) {
                error_log("CONSULTAS_NOME: Erro ao registrar no caixa central: " . $e->getMessage());
            }
            
            // Registrar transações na tabela wallet_transactions SEM atualizar saldo novamente
            // (o saldo já foi atualizado nas linhas acima)
            try {
                if ($debitFromPlan > 0) {
                    $walletTxQuery = "INSERT INTO wallet_transactions (
                        user_id, wallet_type, type, amount, balance_before, balance_after, 
                        description, reference_type, reference_id, status, created_at
                    ) VALUES (?, 'plan', 'consulta', ?, ?, ?, ?, 'consultation', ?, 'completed', NOW())";
                    $walletTxStmt = $db->prepare($walletTxQuery);
                    $walletTxStmt->execute([
                        $userId,
                        $debitFromPlan,
                        $saldoPlano,
                        $newPlanBalance,
                        "Consulta Nome - {$document} (Saldo do Plano)",
                        $consultationId
                    ]);
                }
                
                if ($debitFromWallet > 0) {
                    $walletTxQuery = "INSERT INTO wallet_transactions (
                        user_id, wallet_type, type, amount, balance_before, balance_after, 
                        description, reference_type, reference_id, status, created_at
                    ) VALUES (?, 'main', 'consulta', ?, ?, ?, ?, 'consultation', ?, 'completed', NOW())";
                    $walletTxStmt = $db->prepare($walletTxQuery);
                    $walletTxStmt->execute([
                        $userId,
                        $debitFromWallet,
                        $saldoCarteira,
                        $newWalletBalance,
                        "Consulta Nome - {$document} (Carteira Digital)",
                        $consultationId
                    ]);
                }
                
                error_log("CONSULTAS_NOME: Transações de wallet registradas (sem atualizar saldo novamente)");
            } catch (Exception $e) {
                error_log("CONSULTAS_NOME: Erro ao registrar transação de wallet: " . $e->getMessage());
            }
            
            // Registrar auditoria
            try {
                $auditQuery = "INSERT INTO user_audit (user_id, action, category, description, new_values, ip_address, user_agent) VALUES (?, 'consultation_made', 'consultation', ?, ?, ?, ?)";
                $stmt = $db->prepare($auditQuery);
                $stmt->execute([
                    $userId,
                    "Consulta Nome realizada - {$document}",
                    json_encode([
                        'document' => $document,
                        'valor_final' => $cost,
                        'saldo_usado' => $saldoUsado,
                        'saldo_anterior_plano' => $saldoPlano,
                        'saldo_anterior_carteira' => $saldoCarteira,
                        'saldo_atual_plano' => $newPlanBalance,
                        'saldo_atual_carteira' => $newWalletBalance
                    ]),
                    $_SERVER['REMOTE_ADDR'] ?? '',
                    $_SERVER['HTTP_USER_AGENT'] ?? ''
                ]);
            } catch (Exception $e) {
                error_log("CONSULTAS_NOME: Erro ao registrar auditoria: " . $e->getMessage());
            }
            
            $db->commit();
            
            Response::success([
                'consultation_id' => $consultationId,
                'cost' => $cost,
                'saldo_usado' => $saldoUsado,
                'new_balance' => [
                    'saldo_plano' => $newPlanBalance,
                    'saldo' => $newWalletBalance,
                    'total' => $newPlanBalance + $newWalletBalance
                ]
            ], 'Consulta registrada e saldo debitado com sucesso');
            
        } catch (Exception $e) {
            $db->rollback();
            throw $e;
        }
        
    } catch (Exception $e) {
        error_log("CONSULTAS_NOME ERROR: " . $e->getMessage());
        Response::error($e->getMessage(), 400);
    }
}

function getConsultasNomeHistory($db, $userId) {
    try {
        $limit = (int)($_GET['limit'] ?? 20);
        $offset = (int)($_GET['offset'] ?? 0);
        
        $query = "SELECT * FROM consultations 
                  WHERE user_id = ? 
                  AND module_type = 'nome'
                  ORDER BY created_at DESC 
                  LIMIT ? OFFSET ?";
        
        $stmt = $db->prepare($query);
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
        
        Response::success($consultations, 'Histórico carregado com sucesso');
        
    } catch (Exception $e) {
        error_log("CONSULTAS_NOME_HISTORY ERROR: " . $e->getMessage());
        Response::error('Erro ao carregar histórico: ' . $e->getMessage(), 500);
    }
}
