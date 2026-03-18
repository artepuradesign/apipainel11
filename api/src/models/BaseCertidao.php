<?php
// src/models/BaseCertidao.php

class BaseCertidao {
    private $db;
    private $table = 'base_certidao';

    public function __construct($db) {
        $this->db = $db;
    }

    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ?: null;
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (
            cpf_id,
            tipo_certidao,
            numero_certidao,
            acervo,
            servico_registro_civil,
            ano,
            tipo_livro,
            livro,
            folha,
            termo,
            digito_verificador,
            data_emissao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $data['cpf_id'],
            $data['tipo_certidao'] ?? null,
            $data['numero_certidao'] ?? null,
            $data['acervo'] ?? null,
            $data['servico_registro_civil'] ?? null,
            $data['ano'] ?? null,
            $data['tipo_livro'] ?? null,
            $data['livro'] ?? null,
            $data['folha'] ?? null,
            $data['termo'] ?? null,
            $data['digito_verificador'] ?? null,
            $data['data_emissao'] ?? null,
        ]);

        return $this->db->lastInsertId();
    }
}
