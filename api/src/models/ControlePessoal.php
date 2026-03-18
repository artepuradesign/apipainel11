<?php
// src/models/ControlePessoal.php

class ControlePessoal {
    private $db;
    private $table = 'controle_pessoal';
    private $allowedModules = ['agenda', 'financeiro', 'novocliente', 'relatorios', 'vendasimples'];
    private $allowedStatuses = ['pendente', 'concluido', 'cancelado'];

    public function __construct($db) {
        $this->db = $db;
    }

    public function getAllowedModules() {
        return $this->allowedModules;
    }

    public function getAllowedStatuses() {
        return $this->allowedStatuses;
    }

    public function listRecords($userId, $filters = [], $canViewAll = false) {
        $where = [];
        $params = [];

        if (!$canViewAll) {
            $where[] = 'user_id = ?';
            $params[] = (int)$userId;
        } elseif (!empty($filters['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = (int)$filters['user_id'];
        }

        if (!empty($filters['modulo']) && in_array($filters['modulo'], $this->allowedModules, true)) {
            $where[] = 'modulo = ?';
            $params[] = $filters['modulo'];
        }

        if (!empty($filters['status']) && in_array($filters['status'], $this->allowedStatuses, true)) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(titulo LIKE ? OR descricao LIKE ? OR cliente_nome LIKE ?)';
            $search = '%' . trim($filters['search']) . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $limit = isset($filters['limit']) ? max(1, min(100, (int)$filters['limit'])) : 20;
        $offset = isset($filters['offset']) ? max(0, (int)$filters['offset']) : 0;

        $sql = "SELECT id, user_id, modulo, titulo, descricao, cliente_nome, cliente_contato, valor, data_referencia, status, metadata, created_at, updated_at
                FROM {$this->table}
                {$whereSql}
                ORDER BY data_referencia DESC, id DESC
                LIMIT ? OFFSET ?";

        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row['metadata'] = !empty($row['metadata']) ? json_decode($row['metadata'], true) : null;
        }

        return $rows;
    }

    public function countRecords($userId, $filters = [], $canViewAll = false) {
        $where = [];
        $params = [];

        if (!$canViewAll) {
            $where[] = 'user_id = ?';
            $params[] = (int)$userId;
        } elseif (!empty($filters['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = (int)$filters['user_id'];
        }

        if (!empty($filters['modulo']) && in_array($filters['modulo'], $this->allowedModules, true)) {
            $where[] = 'modulo = ?';
            $params[] = $filters['modulo'];
        }

        if (!empty($filters['status']) && in_array($filters['status'], $this->allowedStatuses, true)) {
            $where[] = 'status = ?';
            $params[] = $filters['status'];
        }

        if (!empty($filters['search'])) {
            $where[] = '(titulo LIKE ? OR descricao LIKE ? OR cliente_nome LIKE ?)';
            $search = '%' . trim($filters['search']) . '%';
            $params[] = $search;
            $params[] = $search;
            $params[] = $search;
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
        $stmt = $this->db->prepare("SELECT COUNT(*) AS total FROM {$this->table} {$whereSql}");
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        return (int)($row['total'] ?? 0);
    }

    public function findById($id, $userId, $canViewAll = false) {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $params = [(int)$id];

        if (!$canViewAll) {
            $sql .= ' AND user_id = ?';
            $params[] = (int)$userId;
        }

        $sql .= ' LIMIT 1';

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            $row['metadata'] = !empty($row['metadata']) ? json_decode($row['metadata'], true) : null;
        }

        return $row ?: null;
    }

    public function createRecord($data) {
        $sql = "INSERT INTO {$this->table}
                (user_id, modulo, titulo, descricao, cliente_nome, cliente_contato, valor, data_referencia, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            (int)$data['user_id'],
            $data['modulo'],
            $data['titulo'],
            $data['descricao'] ?? null,
            $data['cliente_nome'] ?? null,
            $data['cliente_contato'] ?? null,
            isset($data['valor']) ? (float)$data['valor'] : 0,
            $data['data_referencia'],
            $data['status'] ?? 'pendente',
            isset($data['metadata']) ? json_encode($data['metadata'], JSON_UNESCAPED_UNICODE) : null,
        ]);

        return (int)$this->db->lastInsertId();
    }

    public function updateRecord($id, $data, $userId, $canViewAll = false) {
        $fields = [];
        $params = [];

        $updatable = ['modulo', 'titulo', 'descricao', 'cliente_nome', 'cliente_contato', 'valor', 'data_referencia', 'status', 'metadata'];
        foreach ($updatable as $field) {
            if (array_key_exists($field, $data)) {
                $fields[] = "{$field} = ?";
                if ($field === 'metadata') {
                    $params[] = $data[$field] !== null ? json_encode($data[$field], JSON_UNESCAPED_UNICODE) : null;
                } elseif ($field === 'valor') {
                    $params[] = (float)$data[$field];
                } else {
                    $params[] = $data[$field];
                }
            }
        }

        if (empty($fields)) {
            return false;
        }

        $sql = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $params[] = (int)$id;

        if (!$canViewAll) {
            $sql .= ' AND user_id = ?';
            $params[] = (int)$userId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    public function deleteRecord($id, $userId, $canViewAll = false) {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $params = [(int)$id];

        if (!$canViewAll) {
            $sql .= ' AND user_id = ?';
            $params[] = (int)$userId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount() > 0;
    }

    public function findAgendaConflicts($userId, $date, $startTime, $endTime, $excludeId = null) {
        $sql = "SELECT id, titulo, metadata
                FROM {$this->table}
                WHERE user_id = ?
                  AND modulo = 'agenda'
                  AND data_referencia = ?";

        $params = [(int)$userId, $date];

        if ($excludeId !== null) {
            $sql .= ' AND id <> ?';
            $params[] = (int)$excludeId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        $candidateStart = $this->timeToMinutes($startTime);
        $candidateEnd = $this->timeToMinutes($endTime);

        if ($candidateEnd <= $candidateStart) {
            return [['id' => null, 'titulo' => 'intervalo inválido']];
        }

        $conflicts = [];
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $metadata = !empty($row['metadata']) ? json_decode($row['metadata'], true) : [];
            $existingStart = $this->timeToMinutes($metadata['time'] ?? null);
            $existingEnd = $this->timeToMinutes($metadata['endTime'] ?? null);

            if ($existingEnd <= $existingStart) {
                continue;
            }

            if ($candidateStart < $existingEnd && $candidateEnd > $existingStart) {
                $conflicts[] = [
                    'id' => (int)$row['id'],
                    'titulo' => $row['titulo'] ?? 'Compromisso existente',
                ];
            }
        }

        return $conflicts;
    }

    private function timeToMinutes($time) {
        if (!is_string($time) || strpos($time, ':') === false) {
            return 0;
        }

        [$hour, $minute] = array_map('intval', explode(':', $time));
        return max(0, min(1440, ($hour * 60) + $minute));
    }

    public function getStats($userId, $modulo = null, $canViewAll = false) {
        $where = [];
        $params = [];

        if (!$canViewAll) {
            $where[] = 'user_id = ?';
            $params[] = (int)$userId;
        }

        if ($modulo && in_array($modulo, $this->allowedModules, true)) {
            $where[] = 'modulo = ?';
            $params[] = $modulo;
        }

        $whereSql = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';

        $sql = "SELECT
                    COUNT(*) AS total_registros,
                    SUM(CASE WHEN DATE(data_referencia) = CURDATE() THEN 1 ELSE 0 END) AS registros_hoje,
                    SUM(CASE WHEN DATE_FORMAT(data_referencia, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m') THEN IFNULL(valor, 0) ELSE 0 END) AS valor_mes,
                    SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) AS concluidos,
                    SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes
                FROM {$this->table}
                {$whereSql}";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];

        return [
            'total_registros' => (int)($row['total_registros'] ?? 0),
            'registros_hoje' => (int)($row['registros_hoje'] ?? 0),
            'valor_mes' => (float)($row['valor_mes'] ?? 0),
            'concluidos' => (int)($row['concluidos'] ?? 0),
            'pendentes' => (int)($row['pendentes'] ?? 0),
        ];
    }
}
