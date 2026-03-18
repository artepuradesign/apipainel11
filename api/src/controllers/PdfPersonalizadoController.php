<?php
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/PdfPersonalizado.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class PdfPersonalizadoController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new PdfPersonalizado($db);
    }

    public function criar() {
        try {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input) {
                Response::error('Dados inválidos', 400);
                return;
            }
            $id = $this->model->criarPedido($input);
            Response::success(['id' => (int)$id], 'Pedido de edição criado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao criar pedido: ' . $e->getMessage(), 400);
        }
    }

    public function listar() {
        try {
            $userId = isset($_GET['user_id']) ? (int)$_GET['user_id'] : null;
            $status = isset($_GET['status']) ? $_GET['status'] : null;
            $limit = isset($_GET['limit']) ? max(1, min(100, (int)$_GET['limit'])) : 20;
            $offset = isset($_GET['offset']) ? max(0, (int)$_GET['offset']) : 0;
            $search = $_GET['search'] ?? null;

            $rows = $this->model->listarPedidos($userId, $status, $limit, $offset, $search);
            $total = $this->model->contarPedidos($userId, $status, $search);

            Response::success([
                'data' => $rows,
                'pagination' => ['total' => $total, 'limit' => $limit, 'offset' => $offset]
            ], 'Pedidos carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar pedidos: ' . $e->getMessage(), 500);
        }
    }

    public function obter() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) { Response::error('ID é obrigatório', 400); return; }

            $pedido = $this->model->obterPedido((int)$id);
            if (!$pedido) { Response::notFound('Pedido não encontrado'); return; }

            Response::success($pedido, 'Pedido carregado');
        } catch (Exception $e) {
            Response::error('Erro ao obter pedido: ' . $e->getMessage(), 500);
        }
    }

    public function atualizarStatus() {
        try {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input || !isset($input['id']) || !isset($input['status'])) {
                Response::error('ID e status são obrigatórios', 400);
                return;
            }

            $extraData = [];
            if (isset($input['pdf_entrega_base64'])) {
                $extraData['pdf_entrega_base64'] = $input['pdf_entrega_base64'];
            }
            if (isset($input['pdf_entrega_nome'])) {
                $extraData['pdf_entrega_nome'] = $input['pdf_entrega_nome'];
            }
            if (isset($input['remove_pdf'])) {
                $extraData['remove_pdf'] = (bool)$input['remove_pdf'];
            }

            $success = $this->model->atualizarStatus((int)$input['id'], $input['status'], $extraData);
            if ($success) {
                Response::success(['id' => (int)$input['id'], 'status' => $input['status']], 'Status atualizado');
            } else {
                Response::error('Erro ao atualizar status', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao atualizar status: ' . $e->getMessage(), 400);
        }
    }

    public function deletarPdf() {
        try {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input || !isset($input['id'])) {
                Response::error('ID é obrigatório', 400);
                return;
            }

            $success = $this->model->deletarPdf((int)$input['id']);
            if ($success) {
                Response::success(['id' => (int)$input['id']], 'PDF deletado');
            } else {
                Response::error('Erro ao deletar PDF', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar PDF: ' . $e->getMessage(), 400);
        }
    }

    public function solicitarCorrecao() {
        try {
            $raw = file_get_contents('php://input');
            $input = json_decode($raw, true);
            if (!$input || !isset($input['id'])) {
                Response::error('ID é obrigatório', 400);
                return;
            }

            $textoCorrecao = trim($input['texto_correcao'] ?? '');
            $novaDescricao = trim($input['nova_descricao'] ?? '');

            if (empty($textoCorrecao)) {
                Response::error('Texto de correção é obrigatório', 400);
                return;
            }

            $success = $this->model->solicitarCorrecao((int)$input['id'], $textoCorrecao, $novaDescricao);
            if ($success) {
                Response::success(['id' => (int)$input['id'], 'status' => 'pagamento_confirmado'], 'Correção solicitada com sucesso');
            } else {
                Response::error('Erro ao solicitar correção', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao solicitar correção: ' . $e->getMessage(), 400);
        }
    }

    public function deletar() {
        try {
            $id = $_GET['id'] ?? null;
            if (!$id) { Response::error('ID é obrigatório', 400); return; }

            $actorUserId = AuthMiddleware::getCurrentUserId();
            $actorRole = $this->getUserRoleById($actorUserId);

            $success = $this->model->deletarPedido((int)$id, $actorRole, $actorUserId ? (int)$actorUserId : null);
            if ($success) {
                Response::success(['id' => (int)$id], 'Pedido deletado');
            } else {
                Response::error('Erro ao deletar pedido', 500);
            }
        } catch (Exception $e) {
            Response::error('Erro ao deletar pedido: ' . $e->getMessage(), 400);
        }
    }

    public function stats() {
        try {
            $stats = $this->model->getStats();
            Response::success($stats, 'Estatísticas carregadas');
        } catch (Exception $e) {
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }

    private function getUserRoleById($userId) {
        if (!$userId) return null;

        $stmt = $this->db->prepare("SELECT user_role FROM users WHERE id = ? LIMIT 1");
        $stmt->execute([(int)$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return $row['user_role'] ?? null;
    }
}
