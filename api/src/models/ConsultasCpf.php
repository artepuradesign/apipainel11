<?php
// src/models/ConsultasCpf.php

class ConsultasCpf {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = 'WHERE c.cpf_consultado LIKE ? OR u.login LIKE ?';
            $params = ["%$search%", "%$search%"];
        }
        
        $query = "SELECT c.*, u.login as user_login, u.email as user_email 
                  FROM consultas_cpf c 
                  LEFT JOIN users u ON c.user_id = u.id 
                  $whereClause 
                  ORDER BY c.created_at DESC 
                  LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getById($id) {
        $query = "SELECT c.*, u.login as user_login, u.email as user_email 
                  FROM consultas_cpf c 
                  LEFT JOIN users u ON c.user_id = u.id 
                  WHERE c.id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function getByUserId($userId, $limit = 50, $offset = 0) {
        $query = "SELECT 
                    c.*,
                    (c.valor_cobrado + c.desconto_aplicado) as valor_original,
                    c.valor_cobrado as valor_final,
                    c.desconto_aplicado,
                    CASE 
                        WHEN c.saldo_usado = 'plano' THEN 'Saldo do Plano'
                        WHEN c.saldo_usado = 'misto' THEN 'Plano + Carteira'
                        ELSE 'Carteira Digital'
                    END as tipo_saldo_usado
                  FROM consultas_cpf c 
                  WHERE c.user_id = ? 
                  ORDER BY c.created_at DESC 
                  LIMIT ? OFFSET ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit, $offset]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function create($data) {
        error_log("CONSULTAS_CPF_MODEL: MÉTODO CREATE CHAMADO!");
        error_log("CONSULTAS_CPF_MODEL: Dados recebidos: " . json_encode($data));
        
        $query = "INSERT INTO consultas_cpf (
            user_id, cpf_consultado, resultado, valor_cobrado, desconto_aplicado, saldo_usado
        ) VALUES (?, ?, ?, ?, ?, ?)";
        
        error_log("CONSULTAS_CPF_MODEL: Query SQL: " . $query);
        
        try {
            $stmt = $this->db->prepare($query);
            error_log("CONSULTAS_CPF_MODEL: Statement preparado com sucesso");
        } catch (Exception $e) {
            error_log("CONSULTAS_CPF_MODEL: ERRO ao preparar statement: " . $e->getMessage());
            throw $e;
        }
        
        // Determinar qual saldo foi usado - PRIORIZAR campo direto sobre metadata
        $saldoUsado = 'carteira'; // Padrão fallback
        
        // 1º: Verificar se vem no campo direto (prioridade)
        if (isset($data['saldo_usado']) && !empty($data['saldo_usado'])) {
            $saldoUsado = $data['saldo_usado'];
            error_log("CONSULTAS_CPF_MODEL: Saldo usado (campo direto): {$saldoUsado}");
        }
        // 2º: Fallback para metadata se campo direto não existe
        else if (isset($data['metadata']['saldo_usado']) && !empty($data['metadata']['saldo_usado'])) {
            $saldoUsado = $data['metadata']['saldo_usado'];
            error_log("CONSULTAS_CPF_MODEL: Saldo usado (metadata): {$saldoUsado}");
        }
        
        // Garantir que o valor seja válido
        if (!in_array($saldoUsado, ['plano', 'carteira', 'misto'])) {
            $saldoUsado = 'carteira';
            error_log("CONSULTAS_CPF_MODEL: Saldo usado inválido, usando padrão: carteira");
        }
        
        error_log("CONSULTAS_CPF_MODEL: Saldo usado final: {$saldoUsado}");
        
        // Calcular desconto aplicado em reais (diferença entre preço original e final)
        $originalPrice = isset($data['metadata']) && isset($data['metadata']['original_price']) ? $data['metadata']['original_price'] : ($data['cost'] ?? 0);
        $finalPrice = $data['cost'] ?? 0;
        $discountApplied = max(0, $originalPrice - $finalPrice); // Desconto em reais
        
        // GARANTIR que o valor registrado é o valor com desconto (não o original)
        $finalCost = (float)($data['cost'] ?? 0); // Este já é o valor com desconto
        $originalPrice = 0;
        
        // Extrair preço original dos metadados se disponível
        if (isset($data['metadata']['original_price'])) {
            $originalPrice = (float)$data['metadata']['original_price'];
        } else {
            $originalPrice = $finalCost; // Se não tem original, usar o final
        }
        
        // Calcular desconto real aplicado
        $realDiscountApplied = max(0, $originalPrice - $finalCost);
        
        error_log("CONSULTAS_CPF_MODEL: Valores corretos - Original: {$originalPrice}, Final: {$finalCost}, Desconto: {$realDiscountApplied}");
        
        $values = [
            $data['user_id'],
            $data['document'] ?? $data['documento'] ?? '',
            isset($data['result_data']) ? json_encode($data['result_data']) : null,
            $finalCost, // VALOR FINAL COM DESCONTO (correto)
            $realDiscountApplied, // Desconto real aplicado em reais
            $saldoUsado
        ];
        
        error_log("CONSULTAS_CPF_MODEL: Inserindo dados: " . json_encode($values));
        error_log("CONSULTAS_CPF_MODEL: Query: " . $query);
        
        try {
            $result = $stmt->execute($values);
            error_log("CONSULTAS_CPF_MODEL: Resultado da execução: " . ($result ? 'TRUE' : 'FALSE'));
            
            if (!$result) {
                error_log("CONSULTAS_CPF_MODEL: ERRO - Execução falhou!");
                $errorInfo = $stmt->errorInfo();
                error_log("CONSULTAS_CPF_MODEL: Error info: " . json_encode($errorInfo));
                throw new Exception("Falha na execução da query: " . $errorInfo[2]);
            }
            
            $lastId = $this->db->lastInsertId();
            error_log("CONSULTAS_CPF_MODEL: Last insert ID: " . $lastId);
            
            if (!$lastId) {
                error_log("CONSULTAS_CPF_MODEL: ERRO - Last insert ID é 0 ou falso");
                throw new Exception("LastInsertId retornou valor inválido");
            }
            
            return $lastId;
            
        } catch (Exception $e) {
            error_log("CONSULTAS_CPF_MODEL: EXCEÇÃO durante execução: " . $e->getMessage());
            error_log("CONSULTAS_CPF_MODEL: Stack trace: " . $e->getTraceAsString());
            throw $e;
        }
    }
    
    public function update($id, $data) {
        $fields = [];
        $values = [];
        
        foreach ($data as $key => $value) {
            if ($key === 'id') continue;
            
            $fields[] = "$key = ?";
            
            // Handle JSON fields
            if (in_array($key, ['result_data', 'metadata'])) {
                $values[] = is_array($value) || is_object($value) ? json_encode($value) : $value;
            } else {
                $values[] = $value;
            }
        }
        
        $values[] = $id;
        
        $query = "UPDATE consultas_cpf SET " . implode(', ', $fields) . ", updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute($values);
    }
    
    public function delete($id) {
        $query = "DELETE FROM consultas_cpf WHERE id = ?";
        $stmt = $this->db->prepare($query);
        
        return $stmt->execute([$id]);
    }
    
    public function getCount($search = '') {
        $whereClause = '';
        $params = [];
        
        if (!empty($search)) {
            $whereClause = 'WHERE c.cpf_consultado LIKE ? OR u.login LIKE ?';
            $params = ["%$search%", "%$search%"];
        }
        
        $query = "SELECT COUNT(*) as total 
                  FROM consultas_cpf c 
                  LEFT JOIN users u ON c.user_id = u.id 
                  $whereClause";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    }
    
    public function getStats() {
        $query = "SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN resultado IS NOT NULL THEN 1 END) as completed,
                    COUNT(CASE WHEN resultado IS NULL THEN 1 END) as failed,
                    0 as processing,
                    COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as today,
                    COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as this_month
                  FROM consultas_cpf";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}