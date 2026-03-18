<?php
// src/controllers/ControlePessoalController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/ControlePessoal.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class ControlePessoalController {
    private $db;
    private $model;

    public function __construct($db) {
        $this->db = $db;
        $this->model = new ControlePessoal($db);
    }

    public function listar() {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);

            $filters = [
                'modulo' => $_GET['modulo'] ?? null,
                'status' => $_GET['status'] ?? null,
                'search' => $_GET['search'] ?? null,
                'limit' => isset($_GET['limit']) ? (int)$_GET['limit'] : 20,
                'offset' => isset($_GET['offset']) ? (int)$_GET['offset'] : 0,
            ];

            if ($canViewAll && isset($_GET['user_id'])) {
                $filters['user_id'] = (int)$_GET['user_id'];
            }

            $rows = $this->model->listRecords($currentUserId, $filters, $canViewAll);
            $total = $this->model->countRecords($currentUserId, $filters, $canViewAll);

            Response::success([
                'items' => $rows,
                'pagination' => [
                    'total' => $total,
                    'limit' => (int)$filters['limit'],
                    'offset' => (int)$filters['offset'],
                ],
            ], 'Registros de controle pessoal carregados');
        } catch (Exception $e) {
            Response::error('Erro ao listar registros: ' . $e->getMessage(), 500);
        }
    }

    public function obter($id) {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);

            $record = $this->model->findById((int)$id, $currentUserId, $canViewAll);
            if (!$record) {
                Response::notFound('Registro não encontrado');
            }

            Response::success($record, 'Registro carregado');
        } catch (Exception $e) {
            Response::error('Erro ao obter registro: ' . $e->getMessage(), 500);
        }
    }

    public function criar() {
        $this->criarComModulo(null);
    }

    public function criarComModulo($forcedModulo = null) {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !is_array($input)) {
                Response::error('Payload inválido', 400);
            }

            $allowedModules = $this->model->getAllowedModules();
            $allowedStatuses = $this->model->getAllowedStatuses();

            $modulo = $forcedModulo ? trim((string)$forcedModulo) : trim((string)($input['modulo'] ?? ''));
            $titulo = trim((string)($input['titulo'] ?? ''));
            $dataReferencia = trim((string)($input['data_referencia'] ?? ''));
            $status = trim((string)($input['status'] ?? 'pendente'));

            if ($titulo === '' || $dataReferencia === '' || $modulo === '') {
                Response::error('Campos obrigatórios: modulo, titulo, data_referencia', 422);
            }

            if (!in_array($modulo, $allowedModules, true)) {
                Response::error('Módulo inválido', 422);
            }

            if (!in_array($status, $allowedStatuses, true)) {
                Response::error('Status inválido', 422);
            }

            $targetUserId = $currentUserId;
            if ($canViewAll && !empty($input['user_id'])) {
                $targetUserId = (int)$input['user_id'];
            }

            $payload = [
                'user_id' => $targetUserId,
                'modulo' => $modulo,
                'titulo' => $titulo,
                'descricao' => isset($input['descricao']) ? trim((string)$input['descricao']) : null,
                'cliente_nome' => isset($input['cliente_nome']) ? trim((string)$input['cliente_nome']) : null,
                'cliente_contato' => isset($input['cliente_contato']) ? trim((string)$input['cliente_contato']) : null,
                'valor' => isset($input['valor']) ? (float)$input['valor'] : 0,
                'data_referencia' => $dataReferencia,
                'status' => $status,
                'metadata' => $input['metadata'] ?? null,
            ];

            if ($modulo === 'agenda') {
                $meta = is_array($payload['metadata']) ? $payload['metadata'] : [];
                $startTime = isset($meta['time']) ? (string)$meta['time'] : '';
                $endTime = isset($meta['endTime']) ? (string)$meta['endTime'] : '';

                if ($startTime !== '' && $endTime !== '') {
                    $conflicts = $this->model->findAgendaConflicts($targetUserId, $dataReferencia, $startTime, $endTime);
                    if (!empty($conflicts)) {
                        Response::error('Já existe compromisso neste intervalo de horário.', 422);
                    }
                }
            }

            $id = $this->model->createRecord($payload);
            $created = $this->model->findById($id, $currentUserId, true);

            Response::success($created, 'Registro criado com sucesso', 201);
        } catch (Exception $e) {
            Response::error('Erro ao criar registro: ' . $e->getMessage(), 500);
        }
    }

    public function atualizar($id) {
        $this->atualizarComModulo($id, null);
    }

    public function atualizarComModulo($id, $forcedModulo = null) {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);

            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !is_array($input)) {
                Response::error('Payload inválido', 400);
            }

            if ($forcedModulo) {
                $input['modulo'] = $forcedModulo;
            }

            $allowedModules = $this->model->getAllowedModules();
            $allowedStatuses = $this->model->getAllowedStatuses();

            if (isset($input['modulo']) && !in_array($input['modulo'], $allowedModules, true)) {
                Response::error('Módulo inválido', 422);
            }

            if (isset($input['status']) && !in_array($input['status'], $allowedStatuses, true)) {
                Response::error('Status inválido', 422);
            }

            if (isset($input['titulo']) && trim((string)$input['titulo']) === '') {
                Response::error('Título não pode ser vazio', 422);
            }

            if (isset($input['data_referencia']) && trim((string)$input['data_referencia']) === '') {
                Response::error('Data de referência não pode ser vazia', 422);
            }

            $exists = $this->model->findById((int)$id, $currentUserId, $canViewAll);
            if (!$exists) {
                Response::notFound('Registro não encontrado');
            }

            $targetModulo = isset($input['modulo']) ? (string)$input['modulo'] : (string)($exists['modulo'] ?? '');
            $targetDate = isset($input['data_referencia']) ? trim((string)$input['data_referencia']) : (string)($exists['data_referencia'] ?? '');
            $existingMetadata = is_array($exists['metadata']) ? $exists['metadata'] : [];
            $incomingMetadata = isset($input['metadata']) && is_array($input['metadata']) ? $input['metadata'] : [];
            $mergedMetadata = array_merge($existingMetadata, $incomingMetadata);

            if ($targetModulo === 'agenda') {
                $startTime = isset($mergedMetadata['time']) ? (string)$mergedMetadata['time'] : '';
                $endTime = isset($mergedMetadata['endTime']) ? (string)$mergedMetadata['endTime'] : '';

                if ($startTime !== '' && $endTime !== '') {
                    $targetUserId = (int)($exists['user_id'] ?? $currentUserId);
                    $conflicts = $this->model->findAgendaConflicts($targetUserId, $targetDate, $startTime, $endTime, (int)$id);
                    if (!empty($conflicts)) {
                        Response::error('Já existe compromisso neste intervalo de horário.', 422);
                    }
                }
            }

            $updated = $this->model->updateRecord((int)$id, $input, $currentUserId, $canViewAll);
            if (!$updated) {
                Response::error('Nenhuma alteração foi aplicada', 400);
            }

            $record = $this->model->findById((int)$id, $currentUserId, $canViewAll);
            Response::success($record, 'Registro atualizado com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao atualizar registro: ' . $e->getMessage(), 500);
        }
    }

    public function deletar($id) {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);

            $exists = $this->model->findById((int)$id, $currentUserId, $canViewAll);
            if (!$exists) {
                Response::notFound('Registro não encontrado');
            }

            $deleted = $this->model->deleteRecord((int)$id, $currentUserId, $canViewAll);
            if (!$deleted) {
                Response::error('Falha ao excluir registro', 500);
            }

            Response::success(['id' => (int)$id], 'Registro excluído com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao excluir registro: ' . $e->getMessage(), 500);
        }
    }

    public function stats() {
        try {
            $currentUserId = (int)AuthMiddleware::getCurrentUserId();
            $canViewAll = $this->canViewAll($currentUserId);
            $modulo = $_GET['modulo'] ?? null;

            $stats = $this->model->getStats($currentUserId, $modulo, $canViewAll);
            Response::success($stats, 'Estatísticas carregadas');
        } catch (Exception $e) {
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }

    private function canViewAll($userId) {
        $stmt = $this->db->prepare('SELECT user_role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([(int)$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $role = $row['user_role'] ?? 'assinante';

        return in_array($role, ['admin', 'suporte'], true);
    }
}
