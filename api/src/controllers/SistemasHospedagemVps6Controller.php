<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/SistemasHospedagemVps6.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SistemasHospedagemVps6Controller {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new SistemasHospedagemVps6($db);
    }

    public function listarMeus() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;

            $rows = $this->model->listByUser((int)$userId, $limit, $offset);
            $total = $this->model->countByUser((int)$userId);

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ],
            ], 'Registros carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registros: ' . $e->getMessage(), 500);
        }
    }

    public function listarAdmin() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            if (!$this->isAdminOrSupport((int)$userId)) {
                Response::error('Acesso negado', 403);
                return;
            }

            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 50;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
            $status = trim((string)($_GET['status'] ?? '')) ?: null;
            $search = trim((string)($_GET['search'] ?? '')) ?: null;

            $rows = $this->model->listForAdmin($status, $search, $limit, $offset);
            $total = $this->model->countForAdmin($status, $search);

            Response::success([
                'data' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ],
            ], 'Registros carregados com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registros admin: ' . $e->getMessage(), 500);
        }
    }

    public function registrar() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input) {
                Response::error('Dados inválidos', 400);
                return;
            }

            $result = $this->model->registerOrder($input, (int)$userId);
            Response::success($result, 'VPS registrada com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function cancelarAdmin(int $id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            if (!$this->isAdminOrSupport((int)$userId)) {
                Response::error('Acesso negado', 403);
                return;
            }

            if ($id <= 0) {
                Response::error('ID inválido', 400);
                return;
            }

            $this->model->cancelById($id);
            Response::success(['id' => $id, 'status' => 'cancelado'], 'Pedido cancelado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao cancelar pedido: ' . $e->getMessage(), 500);
        }
    }

    public function deletarAdmin(int $id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            if (!$this->isAdminOrSupport((int)$userId)) {
                Response::error('Acesso negado', 403);
                return;
            }

            if ($id <= 0) {
                Response::error('ID inválido', 400);
                return;
            }

            $this->model->deleteById($id);
            Response::success(['id' => $id], 'Pedido excluído permanentemente com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao excluir pedido: ' . $e->getMessage(), 500);
        }
    }

    public function atualizarStatusAdmin(int $id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            if (!$this->isAdminOrSupport((int)$userId)) {
                Response::error('Acesso negado', 403);
                return;
            }

            if ($id <= 0) {
                Response::error('ID inválido', 400);
                return;
            }

            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input || !isset($input['status'])) {
                Response::error('Status é obrigatório', 400);
                return;
            }

            $status = trim((string)$input['status']);
            $ipVps = isset($input['ip_vps']) ? trim((string)$input['ip_vps']) : null;

            $row = $this->model->updateAdminWorkflow($id, $status, $ipVps);
            Response::success($row, 'Status do pedido atualizado com sucesso');
        } catch (Exception $e) {
            Response::error($e->getMessage(), 400);
        }
    }

    public function obter(int $id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }

            if ($id <= 0) {
                Response::error('ID inválido', 400);
                return;
            }

            $row = $this->model->findByIdForUser($id, (int)$userId);
            if (!$row) {
                Response::notFound('Registro não encontrado');
                return;
            }

            Response::success($row, 'Registro carregado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar registro: ' . $e->getMessage(), 500);
        }
    }

    private function isAdminOrSupport(int $userId): bool {
        $stmt = $this->db->prepare("SELECT user_role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $role = $row['user_role'] ?? '';

        return in_array($role, ['admin', 'suporte'], true);
    }
}
