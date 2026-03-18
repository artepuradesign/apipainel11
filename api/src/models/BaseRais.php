<?php
// src/models/BaseRais.php

class BaseRais {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll() {
        $query = "SELECT * FROM base_rais ORDER BY id DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getByCpfId($cpfId) {
        $query = "SELECT * FROM base_rais WHERE cpf_id = :cpf_id ORDER BY data_admissao DESC";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':cpf_id', $cpfId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT * FROM base_rais WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        $query = "INSERT INTO base_rais 
                  (cpf_id, cpf, nome, cnpj, razao_social, situacao, data_entrega, 
                   data_admissao, data_desligamento, data_cadastro, faixa_renda) 
                  VALUES 
                  (:cpf_id, :cpf, :nome, :cnpj, :razao_social, :situacao, :data_entrega, 
                   :data_admissao, :data_desligamento, :data_cadastro, :faixa_renda)";
        
        $stmt = $this->db->prepare($query);
        
        $stmt->bindParam(':cpf_id', $data['cpf_id']);
        $stmt->bindParam(':cpf', $data['cpf']);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':cnpj', $data['cnpj']);
        $stmt->bindParam(':razao_social', $data['razao_social']);
        $stmt->bindParam(':situacao', $data['situacao']);
        $stmt->bindParam(':data_entrega', $data['data_entrega']);
        $stmt->bindParam(':data_admissao', $data['data_admissao']);
        $stmt->bindParam(':data_desligamento', $data['data_desligamento']);
        $stmt->bindParam(':data_cadastro', $data['data_cadastro']);
        $stmt->bindParam(':faixa_renda', $data['faixa_renda']);
        
        if ($stmt->execute()) {
            return $this->db->lastInsertId();
        }
        
        return false;
    }
    
    public function update($id, $data) {
        $query = "UPDATE base_rais SET 
                  cpf = :cpf,
                  nome = :nome,
                  cnpj = :cnpj,
                  razao_social = :razao_social,
                  situacao = :situacao,
                  data_entrega = :data_entrega,
                  data_admissao = :data_admissao,
                  data_desligamento = :data_desligamento,
                  data_cadastro = :data_cadastro,
                  faixa_renda = :faixa_renda
                  WHERE id = :id";
        
        $stmt = $this->db->prepare($query);
        
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':cpf', $data['cpf']);
        $stmt->bindParam(':nome', $data['nome']);
        $stmt->bindParam(':cnpj', $data['cnpj']);
        $stmt->bindParam(':razao_social', $data['razao_social']);
        $stmt->bindParam(':situacao', $data['situacao']);
        $stmt->bindParam(':data_entrega', $data['data_entrega']);
        $stmt->bindParam(':data_admissao', $data['data_admissao']);
        $stmt->bindParam(':data_desligamento', $data['data_desligamento']);
        $stmt->bindParam(':data_cadastro', $data['data_cadastro']);
        $stmt->bindParam(':faixa_renda', $data['faixa_renda']);
        
        return $stmt->execute();
    }
    
    public function delete($id) {
        $query = "DELETE FROM base_rais WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
}
