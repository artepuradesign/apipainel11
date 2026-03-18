<?php
// src/migrations/create_base_rais_table.php

/**
 * Migração para criar a tabela base_rais
 * Armazena histórico de empregos do sistema RAIS (Relação Anual de Informações Sociais)
 */

function createBaseRaisTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS base_rais (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cpf_id INT NOT NULL,
        cpf VARCHAR(11) DEFAULT NULL,
        nome VARCHAR(255) DEFAULT NULL,
        cnpj VARCHAR(14) DEFAULT NULL,
        razao_social VARCHAR(255) DEFAULT NULL,
        situacao VARCHAR(50) DEFAULT NULL,
        data_entrega DATE DEFAULT NULL,
        data_admissao DATE DEFAULT NULL,
        data_desligamento VARCHAR(50) DEFAULT NULL,
        data_cadastro DATE DEFAULT NULL,
        faixa_renda VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_rais_cpf_id (cpf_id),
        INDEX idx_rais_cpf (cpf),
        INDEX idx_rais_cnpj (cnpj),
        INDEX idx_rais_data_admissao (data_admissao),
        INDEX idx_rais_created_at (created_at),
        
        FOREIGN KEY (cpf_id) REFERENCES base_cpf(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    try {
        $db->exec($sql);
        error_log("✓ Tabela base_rais criada/verificada com sucesso");
        return true;
    } catch (PDOException $e) {
        error_log("✗ Erro ao criar tabela base_rais: " . $e->getMessage());
        return false;
    }
}

function dropBaseRaisTable($db) {
    $sql = "DROP TABLE IF EXISTS base_rais";
    
    try {
        $db->exec($sql);
        error_log("✓ Tabela base_rais removida com sucesso");
        return true;
    } catch (PDOException $e) {
        error_log("✗ Erro ao remover tabela base_rais: " . $e->getMessage());
        return false;
    }
}

/**
 * Estrutura dos dados da tabela base_rais
 * 
 * Campos:
 * - id: Identificador único do registro
 * - cpf_id: Referência para a tabela base_cpf (obrigatório)
 * - cpf: Número do CPF do trabalhador
 * - nome: Nome completo do trabalhador
 * - cnpj: CNPJ da empresa empregadora
 * - razao_social: Razão social da empresa empregadora
 * - situacao: Situação da declaração RAIS (ex: ENTREGUE)
 * - data_entrega: Data de entrega da declaração RAIS
 * - data_admissao: Data de admissão do trabalhador
 * - data_desligamento: Data ou texto do desligamento (pode ser "SEM RESULTADO")
 * - data_cadastro: Data de cadastro no sistema RAIS
 * - faixa_renda: Faixa de renda do trabalhador
 * - created_at: Data de criação do registro
 * - updated_at: Data da última atualização
 * 
 * Exemplo de uso:
 * {
 *   "cpf_id": 2858,
 *   "cpf": "31130755568",
 *   "nome": "JURANDIR LISBOA DOS SANTOS",
 *   "cnpj": "32859738000103",
 *   "razao_social": "UNICURSO ENSINO LTDA",
 *   "situacao": "ENTREGUE",
 *   "data_entrega": "2022-04-29",
 *   "data_admissao": "1999-08-01",
 *   "data_desligamento": "SEM RESULTADO",
 *   "data_cadastro": "2022-08-29",
 *   "faixa_renda": "SEM RESULTADO"
 * }
 */
?>