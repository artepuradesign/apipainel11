<?php
// src/controllers/EditaveisRgController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../models/EditaveisRg.php';

class EditaveisRgController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new EditaveisRg($db);
    }

    /**
     * GET /editaveis-rg/arquivos - Listar arquivos disponíveis
     */
    public function listArquivos() {
        try {
            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
            $search = $_GET['search'] ?? null;
            $categoria = $_GET['categoria'] ?? null;
            $tipo = $_GET['tipo'] ?? null;
            $versao = $_GET['versao'] ?? null;

            $rows = $this->model->listArquivos($limit, $offset, $search, $categoria, $tipo, $versao);
            $total = $this->model->countArquivos($search, $categoria, $tipo, $versao);

            // Verificar quais o usuário já comprou
            $userId = AuthMiddleware::getCurrentUserId();
            if ($userId) {
                foreach ($rows as &$row) {
                    $compra = $this->model->getCompra($userId, $row['id']);
                    $row['comprado'] = $compra ? true : false;
                    $row['compra_id'] = $compra ? $compra['id'] : null;
                    $row['downloads_count'] = $compra ? (int)$compra['downloads_count'] : 0;
                }
                unset($row);
            }

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ]
            ], 'Arquivos editáveis carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar arquivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /editaveis-rg/comprar - Comprar arquivo
     */
    public function comprar() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['arquivo_id'])) {
                Response::error('arquivo_id é obrigatório', 400);
                return;
            }

            $arquivoId = (int)$input['arquivo_id'];
            $walletType = $input['wallet_type'] ?? 'main';

            $arquivo = $this->model->getArquivo($arquivoId);
            if (!$arquivo) {
                Response::error('Arquivo não encontrado ou inativo', 404);
                return;
            }

            $compraExistente = $this->model->getCompra($userId, $arquivoId);
            if ($compraExistente) {
                Response::success([
                    'compra_id' => $compraExistente['id'],
                    'arquivo_url' => $arquivo['arquivo_url'],
                    'ja_comprado' => true,
                    'titulo' => $arquivo['titulo'],
                ], 'Arquivo já adquirido anteriormente');
                return;
            }

            $preco = (float)$arquivo['preco'];

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

            $transDesc = "Compra editável: {$arquivo['titulo']}";
            $transQuery = "INSERT INTO wallet_transactions 
                          (user_id, wallet_type, type, amount, balance_before, balance_after, description, payment_method, status) 
                          VALUES (?, ?, 'consulta', ?, ?, ?, ?, 'saldo', 'completed')";
            $transStmt = $this->db->prepare($transQuery);
            $transStmt->execute([$userId, $walletType, -$preco, $saldoAtual, $novoSaldo, $transDesc]);
            $transactionId = $this->db->lastInsertId();

            $saldoUsado = $walletType === 'plan' ? 'plano' : 'carteira';
            $metadata = json_encode([
                'source' => 'editaveis-rg',
                'arquivo_id' => $arquivoId,
                'tipo' => $arquivo['tipo'] ?? 'RG',
                'versao' => $arquivo['versao'] ?? null,
                'formato' => $arquivo['formato'] ?? '.CDR',
                'discount' => 0,
                'original_price' => $preco,
                'discounted_price' => $preco,
                'final_price' => $preco,
                'subscription_discount' => false,
                'plan_type' => 'Pré-Pago',
                'module_id' => 85,
                'timestamp' => date('c'),
                'saldo_usado' => $saldoUsado,
            ]);
            $ipAddress = $_SERVER['REMOTE_ADDR'] ?? null;
            $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? null;
            $consultationQuery = "INSERT INTO consultations (user_id, module_type, document, cost, result_data, status, ip_address, user_agent, metadata, created_at, updated_at) 
                                 VALUES (?, 'editavel_rg', ?, ?, NULL, 'completed', ?, ?, ?, NOW(), NOW())";
            $consultationStmt = $this->db->prepare($consultationQuery);
            $consultationStmt->execute([$userId, $arquivo['titulo'], $preco, $ipAddress, $userAgent, $metadata]);

            $compraId = $this->model->registrarCompra($userId, $arquivoId, $preco, 0, 'saldo');

            // 6) Registrar no central_cash para aparecer nas transações do admin
            $ccDesc = "Compra Editável RG: {$arquivo['titulo']}";
            $ccMeta = json_encode([
                'source' => 'editaveis-rg',
                'arquivo_id' => $arquivoId,
                'compra_id' => $compraId,
                'user_id' => $userId,
                'wallet_type' => $walletType,
            ]);
            $ccQuery = "INSERT INTO central_cash (user_id, transaction_type, description, amount, balance_before, balance_after, payment_method, reference_table, reference_id, metadata, created_at) 
                        VALUES (?, 'consulta', ?, ?, ?, ?, 'saldo', 'wallet_transactions', ?, ?, NOW())";
            $ccStmt = $this->db->prepare($ccQuery);
            $ccStmt->execute([$userId, $ccDesc, $preco, $saldoAtual, $novoSaldo, $transactionId, $ccMeta]);

            $this->db->commit();

            error_log("EDITAVEIS_RG: Compra realizada - User: {$userId}, Arquivo: {$arquivoId}, Preço: {$preco}, Transaction: {$transactionId}");

            Response::success([
                'compra_id' => $compraId,
                'transaction_id' => $transactionId,
                'arquivo_url' => $arquivo['arquivo_url'],
                'titulo' => $arquivo['titulo'],
                'preco_pago' => $preco,
                'novo_saldo' => $novoSaldo,
                'wallet_type' => $walletType,
            ], 'Arquivo adquirido com sucesso');

        } catch (Exception $e) {
            if ($this->db->inTransaction()) {
                $this->db->rollBack();
            }
            error_log("EDITAVEIS_RG ERRO: " . $e->getMessage());
            Response::error('Erro ao processar compra: ' . $e->getMessage(), 500);
        }
    }

    /**
     * POST /editaveis-rg/download - Registrar download e retornar URL
     */
    public function download() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['arquivo_id'])) {
                Response::error('arquivo_id é obrigatório', 400);
                return;
            }

            $arquivoId = (int)$input['arquivo_id'];

            $compra = $this->model->getCompra($userId, $arquivoId);
            if (!$compra) {
                Response::error('Você não adquiriu este arquivo', 403);
                return;
            }

            $arquivo = $this->model->getArquivo($arquivoId);
            if (!$arquivo) {
                Response::error('Arquivo não encontrado', 404);
                return;
            }

            $this->model->registrarDownload($userId, $arquivoId);

            Response::success([
                'arquivo_url' => $arquivo['arquivo_url'],
                'titulo' => $arquivo['titulo'],
                'formato' => $arquivo['formato'],
            ], 'Download autorizado');

        } catch (Exception $e) {
            Response::error('Erro ao processar download: ' . $e->getMessage(), 500);
        }
    }

    /**
     * GET /editaveis-rg/minhas-compras - Listar compras do usuário
     */
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

    /**
     * Verificar se o usuário atual é admin ou suporte
     */
    private function isAdminOrSupport() {
        $userId = AuthMiddleware::getCurrentUserId();
        if (!$userId) return false;

        $query = "SELECT user_role FROM users WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $user && in_array($user['user_role'], ['admin', 'suporte']);
    }

    /**
     * POST /editaveis-rg/criar - Criar novo arquivo (admin/suporte)
     */
    public function criar() {
        try {
            if (!$this->isAdminOrSupport()) {
                Response::error('Acesso negado', 403);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);

            if (!$input || !isset($input['titulo']) || !isset($input['arquivo_url'])) {
                Response::error('titulo e arquivo_url são obrigatórios', 400);
                return;
            }

            $query = "INSERT INTO editaveis_rg_arquivos (module_id, titulo, descricao, categoria, tipo, versao, formato, tamanho_arquivo, arquivo_url, preview_url, preco, ativo) 
                      VALUES (85, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)";
            $stmt = $this->db->prepare($query);
            $stmt->execute([
                $input['titulo'],
                $input['descricao'] ?? null,
                $input['categoria'] ?? null,
                $input['tipo'] ?? 'RG',
                $input['versao'] ?? null,
                $input['formato'] ?? '.CDR',
                $input['tamanho_arquivo'] ?? null,
                $input['arquivo_url'],
                $input['preview_url'] ?? null,
                (float)($input['preco'] ?? 0),
            ]);

            $id = $this->db->lastInsertId();

            Response::success(['id' => (int)$id], 'Arquivo criado com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao criar arquivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * PUT /editaveis-rg/atualizar - Atualizar arquivo (admin/suporte)
     */
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
            $allowedFields = ['titulo', 'descricao', 'categoria', 'tipo', 'versao', 'formato', 'tamanho_arquivo', 'arquivo_url', 'preview_url', 'preco', 'ativo'];

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
            $query = "UPDATE editaveis_rg_arquivos SET " . implode(', ', $sets) . ", updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);

            Response::success(['id' => $id], 'Arquivo atualizado com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao atualizar arquivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * DELETE /editaveis-rg/excluir - Excluir arquivo (admin/suporte)
     */
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

            // Soft delete - apenas desativar
            $query = "UPDATE editaveis_rg_arquivos SET ativo = 0, updated_at = NOW() WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$id]);

            Response::success(['id' => $id], 'Arquivo excluído com sucesso');

        } catch (Exception $e) {
            Response::error('Erro ao excluir arquivo: ' . $e->getMessage(), 500);
        }
    }
}
