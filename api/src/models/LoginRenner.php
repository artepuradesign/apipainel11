<?php
// src/models/LoginRenner.php

require_once __DIR__ . '/BaseModel.php';

class LoginRenner extends BaseModel {
    protected $table = 'login_renner';
    protected $tableCompras = 'login_renner_compras';

    public function __construct($db) {
        parent::__construct($db);
    }

    public function listLogins($limit = 50, $offset = 0, $search = null, $userId = null) {
        $where = ['(a.ativo = 1 OR a.id IN (SELECT login_id FROM ' . $this->tableCompras . ' WHERE user_id = ?))'];
        $params = [$userId ?? 0];

        if ($search) {
            $where[] = '(a.cpf LIKE ? OR a.observacao LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $whereSql = 'WHERE ' . implode(' AND ', $where);

        $query = "SELECT a.* FROM {$this->table} a {$whereSql} ORDER BY a.id DESC LIMIT ? OFFSET ?";
        $params[] = (int)$limit;
        $params[] = (int)$offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countLogins($search = null, $userId = null) {
        $where = ['(ativo = 1 OR id IN (SELECT login_id FROM ' . $this->tableCompras . ' WHERE user_id = ?))'];
        $params = [$userId ?? 0];

        if ($search) {
            $where[] = '(cpf LIKE ? OR observacao LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        $whereSql = 'WHERE ' . implode(' AND ', $where);
        $query = "SELECT COUNT(*) as count FROM {$this->table} {$whereSql}";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    public function getLogin($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ? AND ativo = 1 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getCompra($userId, $loginId) {
        $query = "SELECT * FROM {$this->tableCompras} WHERE user_id = ? AND login_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $loginId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function registrarCompra($userId, $loginId, $precoPago, $descontoAplicado = 0, $metodoPagamento = 'saldo') {
        $query = "INSERT INTO {$this->tableCompras} (module_id, user_id, login_id, preco_pago, desconto_aplicado, metodo_pagamento) 
                  VALUES (164, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $loginId, $precoPago, $descontoAplicado, $metodoPagamento]);
        return $this->db->lastInsertId();
    }

    public function listComprasUsuario($userId, $limit = 50, $offset = 0) {
        $query = "SELECT c.*, a.cpf, a.senha, a.provedor, a.observacao
                  FROM {$this->tableCompras} c
                  INNER JOIN {$this->table} a ON a.id = c.login_id
                  WHERE c.user_id = ?
                  ORDER BY c.created_at DESC
                  LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, (int)$limit, (int)$offset]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countComprasUsuario($userId) {
        $query = "SELECT COUNT(*) as count FROM {$this->tableCompras} WHERE user_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    public function getCompraByLogin($loginId) {
        $query = "SELECT * FROM {$this->tableCompras} WHERE login_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$loginId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function marcarComoVendido($loginId) {
        $query = "UPDATE {$this->table} SET ativo = 0 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$loginId]);
    }
}
