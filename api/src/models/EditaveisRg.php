<?php
// src/models/EditaveisRg.php

require_once __DIR__ . '/BaseModel.php';

class EditaveisRg extends BaseModel {
    protected $table = 'editaveis_rg_arquivos';
    protected $tableCompras = 'editaveis_rg_compras';

    public function __construct($db) {
        parent::__construct($db);
    }

    /**
     * Listar arquivos disponíveis (ativos)
     */
    public function listArquivos($limit = 50, $offset = 0, $search = null, $categoria = null, $tipo = null, $versao = null) {
        $where = ['a.ativo = 1'];
        $params = [];

        if ($search) {
            $where[] = '(a.titulo LIKE ? OR a.descricao LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        if ($categoria) {
            $where[] = 'a.categoria = ?';
            $params[] = $categoria;
        }

        if ($tipo) {
            $where[] = 'a.tipo = ?';
            $params[] = $tipo;
        }

        if ($versao) {
            $where[] = 'a.versao = ?';
            $params[] = $versao;
        }

        $whereSql = 'WHERE ' . implode(' AND ', $where);

        $query = "SELECT a.* FROM {$this->table} a {$whereSql} ORDER BY a.id DESC LIMIT ? OFFSET ?";
        $params[] = (int)$limit;
        $params[] = (int)$offset;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function countArquivos($search = null, $categoria = null, $tipo = null, $versao = null) {
        $where = ['ativo = 1'];
        $params = [];

        if ($search) {
            $where[] = '(titulo LIKE ? OR descricao LIKE ?)';
            $params[] = '%' . $search . '%';
            $params[] = '%' . $search . '%';
        }

        if ($categoria) {
            $where[] = 'categoria = ?';
            $params[] = $categoria;
        }

        if ($tipo) {
            $where[] = 'tipo = ?';
            $params[] = $tipo;
        }

        if ($versao) {
            $where[] = 'versao = ?';
            $params[] = $versao;
        }

        $whereSql = 'WHERE ' . implode(' AND ', $where);
        $query = "SELECT COUNT(*) as count FROM {$this->table} {$whereSql}";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return (int)($row['count'] ?? 0);
    }

    /**
     * Buscar arquivo por ID
     */
    public function getArquivo($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ? AND ativo = 1 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Verificar se o usuário já comprou o arquivo
     */
    public function getCompra($userId, $arquivoId) {
        $query = "SELECT * FROM {$this->tableCompras} WHERE user_id = ? AND arquivo_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $arquivoId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Registrar compra
     */
    public function registrarCompra($userId, $arquivoId, $precoPago, $descontoAplicado = 0, $metodoPagamento = 'saldo') {
        $query = "INSERT INTO {$this->tableCompras} (module_id, user_id, arquivo_id, preco_pago, desconto_aplicado, metodo_pagamento) 
                  VALUES (85, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $arquivoId, $precoPago, $descontoAplicado, $metodoPagamento]);
        $compraId = $this->db->lastInsertId();

        // Incrementar downloads_total do arquivo
        $updateQuery = "UPDATE {$this->table} SET downloads_total = downloads_total + 1 WHERE id = ?";
        $updateStmt = $this->db->prepare($updateQuery);
        $updateStmt->execute([$arquivoId]);

        return $compraId;
    }

    /**
     * Registrar download (incrementar contador na compra)
     */
    public function registrarDownload($userId, $arquivoId) {
        $query = "UPDATE {$this->tableCompras} SET downloads_count = downloads_count + 1, ultimo_download_at = NOW() WHERE user_id = ? AND arquivo_id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$userId, $arquivoId]);
    }

    /**
     * Listar compras do usuário
     */
    public function listComprasUsuario($userId, $limit = 50, $offset = 0) {
        $query = "SELECT c.*, a.titulo, a.descricao, a.formato, a.tamanho_arquivo, a.arquivo_url, a.preview_url, a.categoria, a.tipo, a.versao
                  FROM {$this->tableCompras} c
                  INNER JOIN {$this->table} a ON a.id = c.arquivo_id
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
}
