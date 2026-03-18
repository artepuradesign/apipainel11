<?php
// src/services/HistoricoService.php

require_once __DIR__ . '/../models/ConsultasCpf.php';

class HistoricoService {
    private $db;
    private $consultasCpfModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultasCpfModel = new ConsultasCpf($db);
    }
    
    /**
     * Buscar histórico completo de um usuário (consultas CPF + outros tipos)
     */
    public function getHistoricoCompleto($userId, $page = 1, $limit = 50, $filters = []) {
        try {
            error_log("HISTORICO_SERVICE: Buscando histórico completo para usuário: $userId");
            
            $offset = ($page - 1) * $limit;
            
            // Buscar consultas CPF
            $consultasCpf = $this->consultasCpfModel->getByUserId($userId, $limit, $offset);
            
            // Formatar dados das consultas CPF para o histórico
            $historico = [];
            foreach ($consultasCpf as $consulta) {
                $valorOriginal = $consulta['valor_cobrado'] + $consulta['desconto_aplicado'];
                
                $historico[] = [
                    'id' => 'CPF-' . $consulta['id'],
                    'type' => 'Consulta CPF',
                    'method' => $consulta['saldo_usado'] === 'plano' ? 'Saldo do Plano' : 'Saldo da Carteira',
                    'amount' => -abs($consulta['valor_cobrado']), // Negativo (débito)
                    'status' => 'success',
                    'date' => date('Y-m-d', strtotime($consulta['created_at'])),
                    'datetime' => $consulta['created_at'],
                    'description' => 'Consulta CPF ' . $this->formatCpf($consulta['cpf_consultado']),
                    'balance_type' => $consulta['saldo_usado'] === 'plano' ? 'plan' : 'wallet',
                    'cpf_consultado' => $consulta['cpf_consultado'],
                    'desconto_aplicado' => $consulta['desconto_aplicado'],
                    'valor_original' => $valorOriginal,
                    'valor_final' => $consulta['valor_cobrado'],
                    'resultado' => $consulta['resultado'] ? json_decode($consulta['resultado'], true) : null
                ];
            }
            
            // Ordenar por data/hora (mais recentes primeiro)
            usort($historico, function($a, $b) {
                return strtotime($b['datetime']) - strtotime($a['datetime']);
            });
            
            // Aplicar filtros se necessário
            if (!empty($filters)) {
                $historico = $this->aplicarFiltros($historico, $filters);
            }
            
            // Contar total de registros
            $totalCount = $this->contarTotalRegistros($userId, $filters);
            
            return [
                'data' => $historico,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $totalCount,
                    'total_pages' => ceil($totalCount / $limit)
                ],
                'summary' => $this->gerarResumo($historico)
            ];
            
        } catch (Exception $e) {
            error_log("HISTORICO_SERVICE: Erro ao buscar histórico: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Buscar estatísticas do usuário
     */
    public function getEstatisticasUsuario($userId) {
        try {
            $query = "SELECT 
                        COUNT(*) as total_consultas,
                        SUM(valor_cobrado) as total_gasto,
                        SUM(desconto_aplicado) as total_economia,
                        COUNT(CASE WHEN saldo_usado = 'plano' THEN 1 END) as consultas_plano,
                        COUNT(CASE WHEN saldo_usado = 'carteira' THEN 1 END) as consultas_carteira,
                        COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as consultas_hoje,
                        COUNT(CASE WHEN MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE()) THEN 1 END) as consultas_mes_atual
                      FROM consultas_cpf 
                      WHERE user_id = ?";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $stmt->closeCursor();
            
            return $result;
            
        } catch (Exception $e) {
            error_log("HISTORICO_SERVICE: Erro ao buscar estatísticas: " . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Formatar CPF para exibição
     */
    private function formatCpf($cpf) {
        return preg_replace('/(\d{3})(\d{3})(\d{3})(\d{2})/', '$1.$2.$3-$4', $cpf);
    }
    
    /**
     * Aplicar filtros ao histórico
     */
    private function aplicarFiltros($historico, $filters) {
        $resultado = $historico;
        
        // Filtro por tipo de saldo
        if (!empty($filters['balance_type'])) {
            $resultado = array_filter($resultado, function($item) use ($filters) {
                return $item['balance_type'] === $filters['balance_type'];
            });
        }
        
        // Filtro por período
        if (!empty($filters['date_from']) || !empty($filters['date_to'])) {
            $resultado = array_filter($resultado, function($item) use ($filters) {
                $itemDate = $item['date'];
                
                if (!empty($filters['date_from']) && $itemDate < $filters['date_from']) {
                    return false;
                }
                
                if (!empty($filters['date_to']) && $itemDate > $filters['date_to']) {
                    return false;
                }
                
                return true;
            });
        }
        
        return array_values($resultado); // Reindexar array
    }
    
    /**
     * Contar total de registros
     */
    private function contarTotalRegistros($userId, $filters = []) {
        // Por enquanto, conta apenas consultas CPF
        // Posteriormente pode incluir outros tipos de transações
        $whereClause = 'WHERE user_id = ?';
        $params = [$userId];
        
        // Adicionar filtros de data se necessário
        if (!empty($filters['date_from'])) {
            $whereClause .= ' AND DATE(created_at) >= ?';
            $params[] = $filters['date_from'];
        }
        
        if (!empty($filters['date_to'])) {
            $whereClause .= ' AND DATE(created_at) <= ?';
            $params[] = $filters['date_to'];
        }
        
        $query = "SELECT COUNT(*) as total FROM consultas_cpf $whereClause";
        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $stmt->closeCursor();
        
        return $result['total'];
    }
    
    /**
     * Gerar resumo do histórico
     */
    private function gerarResumo($historico) {
        $total_gasto = 0;
        $total_economia = 0;
        $consultas_plano = 0;
        $consultas_carteira = 0;
        
        foreach ($historico as $item) {
            if ($item['type'] === 'Consulta CPF') {
                $total_gasto += abs($item['amount']);
                $total_economia += $item['desconto_aplicado'];
                
                if ($item['balance_type'] === 'plan') {
                    $consultas_plano++;
                } else {
                    $consultas_carteira++;
                }
            }
        }
        
        return [
            'total_consultas' => count($historico),
            'total_gasto' => $total_gasto,
            'total_economia' => $total_economia,
            'consultas_plano' => $consultas_plano,
            'consultas_carteira' => $consultas_carteira
        ];
    }
}