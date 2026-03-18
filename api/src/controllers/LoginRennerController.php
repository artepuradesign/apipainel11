<?php
// src/controllers/LoginRennerController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../models/LoginRenner.php';

class LoginRennerController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new LoginRenner($db);
    }

    public function listLogins() {
        try {
            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
            $search = $_GET['search'] ?? null;

            $userId = AuthMiddleware::getCurrentUserId();
            $rows = $this->model->listLogins($limit, $offset, $search, $userId);
            $total = $this->model->countLogins($search, $userId);

            $filteredRows = [];
            foreach ($rows as &$row) {
                $compraGlobal = $this->model->getCompraByLogin($row['id']);
                if ($compraGlobal) {
                    if ($userId && (int)$compraGlobal['user_id'] === (int)$userId) {
                        $row['comprado'] = true;
                        $row['compra_id'] = $compraGlobal['id'];
                        $filteredRows[] = $row;
                    }
                    continue;
                } else {
                    $row['comprado'] = false;
                    $row['compra_id'] = null;
                    $row['senha'] = '••••••••';
                    $filteredRows[] = $row;
                }
            }
            unset($row);
            $rows = $filteredRows;

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ]
            ], 'Logins Renner carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar logins: ' . $e->getMessage(), 500);
        }
    }

    public function comprar() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['login_id'])) {
                Response::error('login_id é obrigatório', 400);
                return;
            }

            $loginId = (int)$input['login_id'];
            $walletType = $input['wallet_type'] ?? 'main';

            $login = $this->model->getLogin($loginId);
            if (!$login) {
                Response::error('Login não encontrado ou inativo', 404);
                return;
            }

            $compraExistente = $this->model->getCompraByLogin($loginId);
            if ($compraExistente) {
                Response::error('Este login já foi vendido e não está mais disponível.', 400);
                return;
            }

            // Buscar preço do módulo 164
            $moduleQuery = "SELECT price FROM modules WHERE id = 164 LIMIT 1";
            $moduleStmt = $this->db->prepare($moduleQuery);
            $moduleStmt->execute();
            $moduleData = $moduleStmt->fetch(PDO::FETCH_ASSOC);
            $precoOriginal = (float)($moduleData['price'] ?? 2.00);

            // Aplicar desconto do plano
            $userPlanQuery = "SELECT tipoplano FROM users WHERE id = ?";
            $userPlanStmt = $this->db->prepare($userPlanQuery);
            $userPlanStmt->execute([$userId]);
            $userPlanData = $userPlanStmt->fetch(PDO::FETCH_ASSOC);
            $planName = $userPlanData['tipoplano'] ?? 'Pré-Pago';

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
            $descontoValor = ($precoOriginal * $discountPercent) / 100;
            $preco = round(max($precoOriginal - $descontoValor, 0.01), 2);

            error_log("LOGIN_RENNER: Plano: {$planName}, Desconto: {$discountPercent}%, Original: R$ {$precoOriginal}, Final: R$ {$preco}");

            $saldoField = $walletType === 'plan' ? 'saldo_plano' : 'saldo';
            $userQuery = "SELECT saldo, saldo_plano FROM users WHERE id = ?";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->execute([$userId]);
            $userData = $userStmt->fetch(PDO::FETCH_ASSOC);

            if (!$userData) {
                Response::error('Usuário não encontrado', 404);
                return;
            }

            $saldoAtual = (float)($userData[$saldoField] ?? 0);

            if ($saldoAtual < $preco) {
                Response::error('Saldo insuficiente. Necessário: R$ ' . number_format($preco, 2, ',', '.'), 400);
                return;
            }

            $this->db->beginTransaction();

            $novoSaldo = $saldoAtual - $preco;
            $updateSaldo = "UPDATE users SET {$saldoField} = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
            $updateStmt = $this->db->prepare($updateSaldo);
            $updateStmt->execute([$novoSaldo, $userId]);

            $transDesc = "Compra Login Renner: {$login['cpf']}";
            $transQuery = "INSERT INTO wallet_transactions 
                          (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                          VALUES (?, ?, 'consulta', ?, ?, ?, ?, 'saldo', 'completed')";
            $transStmt = $this->db->prepare($transQuery);
            $transStmt->execute([$userId, $walletType, -$preco, $saldoAtual, $novoSaldo, $transDesc]);
            $transactionId = $this->db->lastInsertId();

            $saldoUsado = $walletType === 'plan' ? 'plano' : 'carteira';
            $metadata = json_encode([
                'source' => 'login-renner',
                'login_id' => $loginId,
                'provedor' => 'renner',
                'discount' => $discountPercent,
                'discount_amount' => $descontoValor,
                'original_price' => $precoOriginal,
                'final_price' => $preco,
                'plan_name' => $planName,
                'module_id' => 164,
                'timestamp' => date('c'),
                'saldo_usado' => $saldoUsado,
            ]);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $consultationQuery = "INSERT INTO consultations (user_id, module_type, document, cost, result_data, status, ip_address, user_agent, metadata, created_at, updated_at) 
                                 VALUES (?, 'login_renner', ?, ?, NULL, 'completed', ?, ?, ?, NOW(), NOW())";
            $consultationStmt = $this->db->prepare($consultationQuery);
            $consultationStmt->execute([$userId, $login['cpf'], $preco, $ipAddress, $userAgent, $metadata]);

            $compraId = $this->model->registrarCompra($userId, $loginId, $preco, $descontoValor, 'saldo');

            $this->model->marcarComoVendido($loginId);

            $ccDesc = "Compra Login Renner: {$login['cpf']}";
            $ccMeta = json_encode([
                'source' => 'login-renner',
                'login_id' => $loginId,
                'compra_id' => $compraId,
                'user_id' => $userId,
                'wallet_type' => $walletType,
            ]);
            $ccQuery = "INSERT INTO central_cash (user_id, transaction_type, description, amount, balance_before, balance_after, payment_method, reference_table, reference_id, metadata, created_at) 
                        VALUES (?, 'consulta', ?, ?, ?, ?, 'saldo', 'wallet_transactions', ?, ?, NOW())";
            $ccStmt = $this->db->prepare($ccQuery);
            $ccStmt->execute([$userId, $ccDesc, $preco, $saldoAtual, $novoSaldo, $transactionId, $ccMeta]);

            $this->db->commit();

            error_log("LOGIN_RENNER: Compra realizada - User: {$userId}, Login: {$loginId}, Preço: {$preco}, Transaction: {$transactionId}");

            Response::success([
                'compra_id' => $compraId,
                'transaction_id' => $transactionId,
                'cpf' => $login['cpf'],
                'senha' => $login['senha'],
                'preco_pago' => $preco,
                'novo_saldo' => $novoSaldo,
                'wallet_type' => $walletType,
            ], 'Login adquirido com sucesso');

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("LOGIN_RENNER ERRO: " . $e->getMessage());
            Response::error('Erro ao processar compra: ' . $e->getMessage(), 500);
        }
    }

    public function minhasCompras() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

            $rows = $this->model->listComprasUsuario($userId, $limit, $offset);
            $total = $this->model->countComprasUsuario($userId);

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ]
            ], 'Minhas compras carregadas');

        } catch (Exception $e) {
            Response::error('Erro ao listar compras: ' . $e->getMessage(), 500);
        }
    }

    private function isAdminOrSupport() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) return false;

        $query = "SELECT user_role FROM users WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user && in_array($user['user_role'], ['admin', 'suporte']);
    }

    public function listProvedores() {
        try {
            $query = "SELECT id, nome, slug FROM login_provedores WHERE ativo = 1 ORDER BY nome";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            Response::success($rows, 'Provedores carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar provedores: ' . $e->getMessage(), 500);
        }
    }

    public function criar() {
        try {
            if (!$this->isAdminOrSupport()) {
                Response::error('Acesso negado', 403);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['cpf']) || !isset($input['senha'])) {
                Response::error('cpf e senha são obrigatórios', 400);
                return;
            }

            $query = "INSERT INTO login_renner (module_id, cpf, senha, provedor, email, saldo, pontos, status, observacao, ativo) 
                      VALUES (164, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $input['cpf'],
                $input['senha'],
                $input['provedor'] ?? 'renner',
                $input['email'] ?? null,
                $input['saldo'] ?? 0,
                $input['pontos'] ?? 0,
                $input['status'] ?? 'virgem',
                $input['observacao'] ?? null,
            ]);

            $id = $this->db->lastInsertId();

            Response::success(['id' => (int)$id], 'Login criado com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao criar login: ' . $e->getMessage(), 500);
        }
    }

    public function atualizar() {
        try {
            if (!$this->isAdminOrSupport()) {
                Response::error('Acesso negado', 403);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['id'])) {
                Response::error('id é obrigatório', 400);
                return;
            }

            $id = (int)$input['id'];
            $sets = [];
            $params = [];
            $allowedFields = ['cpf', 'senha', 'provedor', 'email', 'saldo', 'pontos', 'status', 'observacao', 'ativo'];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $input)) {
                    $sets[] = "{$field} = ?";
                    $params[] = $input[$field];
                }
            }

            if (empty($sets)) {
                Response::error('Nenhum campo para atualizar', 400);
                return;
            }

            $params[] = $id;
            $query = "UPDATE login_renner SET " . implode(', ', $sets) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            Response::success(['id' => $id], 'Login atualizado com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao atualizar login: ' . $e->getMessage(), 500);
        }
    }

    public function excluir() {
        try {
            if (!$this->isAdminOrSupport()) {
                Response::error('Acesso negado', 403);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['id'])) {
                Response::error('id é obrigatório', 400);
                return;
            }

            $id = (int)$input['id'];

            $query = "UPDATE login_renner SET ativo = 0, updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);

            Response::success(['id' => $id], 'Login excluído com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao excluir login: ' . $e->getMessage(), 500);
        }
    }
}
