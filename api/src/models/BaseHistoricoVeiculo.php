<?php
// src/models/BaseHistoricoVeiculo.php

class BaseHistoricoVeiculo {
    private $db;
    private $table = 'base_historico_veiculo';
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function create($data) {
        $fields = [
            'cpf_id', 'placa', 'chassi', 'motor', 'marca', 'uf_placa',
            'ano_fabricacao', 'combustivel', 'potencia', 'capacidade', 'nacionalidade',
            'caixa_cambio', 'eixo_traseiro_dif', 'terceiro_eixo', 'capacidade_max_tracao',
            'peso_bruto_total', 'cilindradas', 'ano_modelo', 'tipo_carroceria',
            'cor_veiculo', 'quantidade_passageiro', 'eixos', 'doc_faturado',
            'nome_faturado', 'uf_faturado', 'doc_proprietario', 'nome_proprietario',
            'situacao_veiculo', 'restricao_1', 'restricao_2', 'restricao_3', 'restricao_4',
            'endereco', 'numero_casa', 'complemento', 'bairro', 'cep', 'cidade', 'estado'
        ];
        
        $setFields = [];
        $values = [];
        
        // Sempre incluir cpf_id se estiver presente
        if (isset($data['cpf_id'])) {
            $setFields[] = 'cpf_id';
            $values[] = $data['cpf_id'];
        }
        
        // Para os demais campos, aceitar até mesmo valores vazios
        foreach ($fields as $field) {
            if ($field !== 'cpf_id' && isset($data[$field])) {
                $setFields[] = $field;
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('CPF ID é obrigatório');
        }
        
        $placeholders = str_repeat('?,', count($setFields) - 1) . '?';
        $query = "INSERT INTO {$this->table} (" . implode(',', $setFields) . ") VALUES ($placeholders)";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($values);
        
        return $this->db->lastInsertId();
    }
    
    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM {$this->table} WHERE cpf_id = ? ORDER BY created_at DESC";
        
        error_log("🚗 [BASE_HISTORICO_VEICULO_MODEL] Executando query...");
        error_log("🚗 [BASE_HISTORICO_VEICULO_MODEL] Query: {$query}");
        error_log("🚗 [BASE_HISTORICO_VEICULO_MODEL] CPF ID: {$cpfId}");
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$cpfId]);
        
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        error_log("🚗 [BASE_HISTORICO_VEICULO_MODEL] Registros encontrados: " . count($result));
        
        if (count($result) > 0) {
            error_log("🚗 [BASE_HISTORICO_VEICULO_MODEL] Primeiro registro: " . json_encode($result[0]));
        }
        
        return $result;
    }
    
    public function update($id, $data) {
        $fields = [
            'placa', 'chassi', 'motor', 'marca', 'uf_placa',
            'ano_fabricacao', 'combustivel', 'potencia', 'capacidade', 'nacionalidade',
            'caixa_cambio', 'eixo_traseiro_dif', 'terceiro_eixo', 'capacidade_max_tracao',
            'peso_bruto_total', 'cilindradas', 'ano_modelo', 'tipo_carroceria',
            'cor_veiculo', 'quantidade_passageiro', 'eixos', 'doc_faturado',
            'nome_faturado', 'uf_faturado', 'doc_proprietario', 'nome_proprietario',
            'situacao_veiculo', 'restricao_1', 'restricao_2', 'restricao_3', 'restricao_4',
            'endereco', 'numero_casa', 'complemento', 'bairro', 'cep', 'cidade', 'estado'
        ];
        
        $setFields = [];
        $values = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $setFields[] = "$field = ?";
                $values[] = $data[$field];
            }
        }
        
        if (empty($setFields)) {
            throw new Exception('Nenhum campo válido fornecido');
        }
        
        $values[] = $id;
        $query = "UPDATE {$this->table} SET " . implode(',', $setFields) . " WHERE id = ?";
        
        $stmt = $this->db->prepare($query);
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$id]);
    }
    
    public function deleteByCpfId($cpfId) {
        $query = "DELETE FROM {$this->table} WHERE cpf_id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$cpfId]);
    }
}
