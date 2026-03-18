<?php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseReceitaService {
    private $db;
    
    public function __construct() {
        $this->db = getDBConnection();
    }
    
    public function getByCpf($cpf) {
        try {
            $cleanCpf = preg_replace('/[^0-9]/', '', $cpf);
            
            // JOIN com base_cpf para buscar usando CPF e retornar dados completos
            $query = "SELECT 
                        br.*,
                        bc.cpf,
                        bc.nome 
                      FROM base_receita br
                      INNER JOIN base_cpf bc ON br.cpf_id = bc.id
                      WHERE bc.cpf = ? 
                      LIMIT 1";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$cleanCpf]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($result) {
                return [
                    'success' => true,
                    'data' => $result
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'CPF não encontrado na Receita Federal'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro ao buscar dados da Receita Federal: ' . $e->getMessage()
            ];
        }
    }
    
    public function create($data) {
        try {
            // Converter data do formato DD/MM/AAAA para YYYY-MM-DD se necessário
            $dataInscricao = $this->formatDateForDb($data['data_inscricao'] ?? null);
            $dataEmissao = $this->formatDateTimeForDb($data['data_emissao'] ?? null);

            // Garantir valor padrão para campos potencialmente NOT NULL no banco
            if ($dataInscricao === null) {
                // Se o usuário não informou, usar a data atual para evitar erro de NOT NULL
                $dataInscricao = date('Y-m-d');
            }
            // Primeiro, buscar o cpf_id pela tabela base_cpf
            $cpfId = null;
            if (isset($data['cpf'])) {
                $cleanCpf = preg_replace('/[^0-9]/', '', $data['cpf']);
                $cpfQuery = "SELECT id FROM base_cpf WHERE cpf = ? LIMIT 1";
                $cpfStmt = $this->db->prepare($cpfQuery);
                $cpfStmt->execute([$cleanCpf]);
                $cpfResult = $cpfStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($cpfResult) {
                    $cpfId = $cpfResult['id'];
                } else {
                    return [
                        'success' => false,
                        'error' => 'CPF não encontrado na base de dados. Cadastre o CPF primeiro.'
                    ];
                }
            } elseif (isset($data['cpf_id'])) {
                $cpfId = $data['cpf_id'];
            } else {
                return [
                    'success' => false,
                    'error' => 'CPF ou cpf_id é obrigatório'
                ];
            }
            
            $query = "INSERT INTO base_receita 
                     (cpf_id, situacao_cadastral, data_inscricao, digito_verificador, data_emissao, codigo_controle, qr_link) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $cpfId,
                $data['situacao_cadastral'] ?? null,
                $dataInscricao,
                $data['digito_verificador'] ?? null,
                $dataEmissao,
                $data['codigo_controle'] ?? null,
                $data['qr_link'] ?? null
            ]);
            
            if ($result) {
                $id = $this->db->lastInsertId();
                
                // Se situacao_cadastral foi informada, atualizar também na tabela base_cpf
                if (!empty($data['situacao_cadastral'])) {
                    $updateCpfQuery = "UPDATE base_cpf SET situacao_cpf = ? WHERE id = ?";
                    $updateCpfStmt = $this->db->prepare($updateCpfQuery);
                    $updateCpfStmt->execute([$data['situacao_cadastral'], $cpfId]);
                }
                
                return [
                    'success' => true,
                    'data' => ['id' => $id],
                    'message' => 'Dados da Receita Federal cadastrados com sucesso'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Erro ao cadastrar dados da Receita Federal'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro ao cadastrar dados da Receita Federal: ' . $e->getMessage()
            ];
        }
    }
    
    public function update($id, $data) {
        try {
            // Converter data do formato DD/MM/AAAA para YYYY-MM-DD se necessário
            $dataInscricao = $this->formatDateForDb($data['data_inscricao'] ?? null);
            $dataEmissao = $this->formatDateTimeForDb($data['data_emissao'] ?? null);

            $query = "UPDATE base_receita SET 
                     situacao_cadastral = ?,
                     data_inscricao = COALESCE(?, data_inscricao),
                     digito_verificador = ?,
                     data_emissao = COALESCE(?, data_emissao),
                     codigo_controle = ?,
                     qr_link = ?,
                     updated_at = CURRENT_TIMESTAMP
                     WHERE id = ?";
            
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $data['situacao_cadastral'] ?? null,
                $dataInscricao,
                $data['digito_verificador'] ?? null,
                $dataEmissao,
                $data['codigo_controle'] ?? null,
                $data['qr_link'] ?? null,
                $id
            ]);
            
            if ($result) {
                // Se situacao_cadastral foi informada, buscar cpf_id e atualizar também na tabela base_cpf
                if (!empty($data['situacao_cadastral'])) {
                    $getCpfIdQuery = "SELECT cpf_id FROM base_receita WHERE id = ?";
                    $getCpfIdStmt = $this->db->prepare($getCpfIdQuery);
                    $getCpfIdStmt->execute([$id]);
                    $cpfIdResult = $getCpfIdStmt->fetch(PDO::FETCH_ASSOC);
                    
                    if ($cpfIdResult) {
                        $updateCpfQuery = "UPDATE base_cpf SET situacao_cpf = ? WHERE id = ?";
                        $updateCpfStmt = $this->db->prepare($updateCpfQuery);
                        $updateCpfStmt->execute([$data['situacao_cadastral'], $cpfIdResult['cpf_id']]);
                    }
                }
                
                return [
                    'success' => true,
                    'message' => 'Dados da Receita Federal atualizados com sucesso'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Erro ao atualizar dados da Receita Federal'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro ao atualizar dados da Receita Federal: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Converte data do formato DD/MM/AAAA para YYYY-MM-DD
     */
    private function formatDateForDb($dateString) {
        if (empty($dateString) || $dateString === null) {
            return null; // Campos opcionais podem ser null
        }

        // Se já está no formato YYYY-MM-DD, retorna como está
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateString)) {
            return $dateString;
        }

        // Se está no formato DD/MM/AAAA, converte
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateString, $matches)) {
            $day = $matches[1];
            $month = $matches[2];
            $year = $matches[3];
            return "$year-$month-$day";
        }

        // Se não conseguiu converter, retorna null
        return null;
    }

    /**
     * Converte data e hora do formato datetime-local para formato do banco
     */
    private function formatDateTimeForDb($dateTimeString) {
        if (empty($dateTimeString) || $dateTimeString === null) {
            return null; // Campos opcionais podem ser null
        }

        // Se já está no formato correto do MySQL, retorna como está
        if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $dateTimeString)) {
            return $dateTimeString;
        }

        // Se está no formato datetime-local (YYYY-MM-DDTHH:MM), converte
        if (preg_match('/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/', $dateTimeString, $matches)) {
            return $matches[1] . ' ' . $matches[2] . ':00';
        }

        // Se não conseguiu converter, retorna null
        return null;
    }
    
    public function delete($id) {
        try {
            $query = "DELETE FROM base_receita WHERE id = ?";
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([$id]);
            
            if ($result) {
                return [
                    'success' => true,
                    'message' => 'Dados da Receita Federal excluídos com sucesso'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'Erro ao excluir dados da Receita Federal'
                ];
            }
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro ao excluir dados da Receita Federal: ' . $e->getMessage()
            ];
        }
    }
    
    public function getAll($limit = 50, $offset = 0, $search = '') {
        try {
            $whereClause = '';
            $params = [];
            
            if (!empty($search)) {
                $whereClause = "WHERE bc.cpf LIKE ? OR br.situacao_cadastral LIKE ?";
                $params = ["%$search%", "%$search%"];
            }
            
            // Count total com JOIN
            $countQuery = "SELECT COUNT(*) as total 
                          FROM base_receita br
                          INNER JOIN base_cpf bc ON br.cpf_id = bc.id 
                          $whereClause";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute($params);
            $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get data com JOIN
            $query = "SELECT 
                        br.*,
                        bc.cpf,
                        bc.nome 
                      FROM base_receita br
                      INNER JOIN base_cpf bc ON br.cpf_id = bc.id
                      $whereClause 
                      ORDER BY br.created_at DESC 
                      LIMIT ? OFFSET ?";
            $params[] = (int)$limit;
            $params[] = (int)$offset;
            
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return [
                'success' => true,
                'data' => [
                    'data' => $data,
                    'total' => (int)$total,
                    'limit' => (int)$limit,
                    'offset' => (int)$offset
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Erro ao buscar dados da Receita Federal: ' . $e->getMessage()
            ];
        }
    }
}