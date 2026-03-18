<?php
// src/models/BaseCns.php

class BaseCns {
    private $db;
    private $table = 'base_cns';

    public function __construct($db) {
        $this->db = $db;
    }

    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY created_at DESC, id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    private function normalizeDate($value) {
        if ($value === null || $value === '') {
            return null;
        }

        // Aceitar dd/mm/yyyy e converter para yyyy-mm-dd
        if (is_string($value) && strpos($value, '/') !== false) {
            $parts = explode('/', $value);
            if (count($parts) === 3) {
                return $parts[2] . '-' . $parts[1] . '-' . $parts[0];
            }
        }

        return $value;
    }

    public function create($data) {
        $cpfId = isset($data['cpf_id']) ? intval($data['cpf_id']) : 0;
        $numeroCns = isset($data['numero_cns']) ? preg_replace('/\D/', '', (string)$data['numero_cns']) : '';
        $tipoCartao = isset($data['tipo_cartao']) ? strtoupper(trim((string)$data['tipo_cartao'])) : '';
        $dataAtribuicao = $this->normalizeDate($data['data_atribuicao'] ?? null);

        if ($cpfId <= 0) {
            throw new Exception('cpf_id é obrigatório');
        }
        if ($numeroCns === '') {
            throw new Exception('numero_cns é obrigatório');
        }
        if (!in_array($tipoCartao, ['D', 'P'], true)) {
            throw new Exception("tipo_cartao inválido (use 'D' ou 'P')");
        }

        $query = "INSERT INTO {$this->table} (cpf_id, numero_cns, data_atribuicao, tipo_cartao) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId, $numeroCns, $dataAtribuicao, $tipoCartao]);

        return $this->db->lastInsertId();
    }

    public function update($id, $data) {
        $id = intval($id);
        if ($id <= 0) {
            throw new Exception('ID inválido');
        }

        $fields = [];
        $values = [];

        if (isset($data['cpf_id'])) {
            $fields[] = 'cpf_id = ?';
            $values[] = intval($data['cpf_id']);
        }
        if (isset($data['numero_cns'])) {
            $fields[] = 'numero_cns = ?';
            $values[] = preg_replace('/\D/', '', (string)$data['numero_cns']);
        }
        if (isset($data['data_atribuicao'])) {
            $fields[] = 'data_atribuicao = ?';
            $values[] = $this->normalizeDate($data['data_atribuicao']);
        }
        if (isset($data['tipo_cartao'])) {
            $tipo = strtoupper(trim((string)$data['tipo_cartao']));
            if (!in_array($tipo, ['D', 'P'], true)) {
                throw new Exception("tipo_cartao inválido (use 'D' ou 'P')");
            }
            $fields[] = 'tipo_cartao = ?';
            $values[] = $tipo;
        }

        if (empty($fields)) {
            throw new Exception('Nenhum campo válido fornecido');
        }

        $values[] = $id;
        $query = "UPDATE {$this->table} SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute($values);
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([intval($id)]);
    }
}
