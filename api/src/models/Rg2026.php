<?php
// src/models/Rg2026.php

require_once __DIR__ . '/BaseModel.php';

class Rg2026 extends BaseModel {
    protected $table = 'rg_2026_registros';

    public function __construct($db) {
        parent::__construct($db);
    }

    public function createRegistro($data) {
        // Obrigatórios
        $nome = trim($data['nome'] ?? '');
        $cpf = preg_replace('/\D/', '', (string)($data['cpf'] ?? ''));
        $dtNascimento = $data['dt_nascimento'] ?? null;
        $mae = trim($data['filiacao_mae'] ?? '');

        if ($nome === '' || $cpf === '' || !$dtNascimento || $mae === '') {
            throw new Exception('Campos obrigatórios: Nome, CPF, Nascimento, Mãe');
        }

        $payload = [
            'module_id' => (int)($data['module_id'] ?? 57),
            'user_id' => isset($data['user_id']) ? (int)$data['user_id'] : null,

            'nome' => $nome,
            'nome_social' => $data['nome_social'] ?? null,
            'cpf' => $cpf,
            'sexo' => $data['sexo'] ?? null,
            'dt_nascimento' => $dtNascimento,
            'nacionalidade' => $data['nacionalidade'] ?? null,
            'naturalidade' => $data['naturalidade'] ?? null,
            'validade' => $data['validade'] ?? null,

            'numero_folha' => $data['numero_folha'] ?? null,
            'numero_qrcode' => $data['numero_qrcode'] ?? null,

            'filiacao_mae' => $mae,
            'filiacao_pai' => $data['filiacao_pai'] ?? null,

            'orgao_expedidor' => $data['orgao_expedidor'] ?? null,
            'local_emissao' => $data['local_emissao'] ?? null,
            'dt_emissao' => $data['dt_emissao'] ?? null,

            'diretor' => $data['diretor'] ?? null,

            // Imagens opcionais em base64 (somente para persistência, se o frontend enviar)
            'foto_base64' => $data['foto_base64'] ?? null,
            'assinatura_base64' => $data['assinatura_base64'] ?? null,

            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ];

        // Normalizar strings vazias para NULL (exceto obrigatórios já tratados)
        foreach ($payload as $k => $v) {
            if ($v === '') $payload[$k] = null;
        }

        return parent::create($payload);
    }

    public function listRegistros($userId = null, $limit = 20, $offset = 0, $search = null) {
        $where = [];
        $params = [];

        if ($userId !== null) {
            $where[] = 'user_id = ?';
            $params[] = $userId;
        }

        if ($search) {
            $where[] = '(nome LIKE ? OR cpf LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . preg_replace('/\D/', '', $search) . '%';
        }

        $whereSql = '';
        if (!empty($where)) {
            $whereSql = 'WHERE ' . implode(' AND ', $where);
        }

        $query = "SELECT
                    id,
                    module_id,
                    user_id,

                    nome,
                    nome_social,
                    cpf,
                    sexo,
                    dt_nascimento,
                    nacionalidade,
                    naturalidade,
                    validade,

                    numero_folha,
                    numero_qrcode,

                    filiacao_mae,
                    filiacao_pai,

                    orgao_expedidor,
                    local_emissao,
                    dt_emissao,

                    diretor,

                    foto_base64,
                    assinatura_base64,

                    created_at,
                    updated_at
                  FROM {$this->table}
                  {$whereSql}
                  ORDER BY id DESC
                  LIMIT ? OFFSET ?";

        $params[] = (int)$limit;
        $params[] = (int)$offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countRegistros($userId = null, $search = null) {
        $where = [];
        $params = [];

        if ($userId !== null) {
            $where[] = 'user_id = ?';
            $params[] = $userId;
        }

        if ($search) {
            $where[] = '(nome LIKE ? OR cpf LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . preg_replace('/\D/', '', $search) . '%';
        }

        $whereSql = '';
        if (!empty($where)) {
            $whereSql = 'WHERE ' . implode(' AND ', $where);
        }

        $query = "SELECT COUNT(*) as count FROM {$this->table} {$whereSql}";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    public function deleteRegistro($id, $userId = null) {
        if ($userId !== null) {
            $query = "DELETE FROM {$this->table} WHERE id = ? AND user_id = ?";
            $stmt = $this->db->prepare($query);
            return $stmt->execute([$id, $userId]);
        }

        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$id]);
    }
}
