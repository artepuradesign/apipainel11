<?php
// src/services/UserReferralService.php

class UserReferralService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Busca indicados baseado no campo indicador_id da tabela users
     */
    public function getUserReferralsFromUsers($userId) {
        try {
            error_log("USER_REFERRAL: Buscando indicados do usuário {$userId} na tabela users");
            
            // Buscar usuários que foram indicados por este usuário
            $query = "SELECT 
                        u.id as indicado_id,
                        u.full_name as indicado_nome,
                        u.email as indicado_email,
                        u.codigo_usado_indicacao as codigo_usado,
                        u.created_at as indicado_cadastro,
                        u.ultimo_login,
                        u.status as user_status,
                        CASE 
                            WHEN u.ultimo_login IS NOT NULL THEN 1 
                            ELSE 0 
                        END as first_login_bonus_processed,
                        u.ultimo_login as first_login_at
                      FROM users u
                      WHERE u.indicador_id = ?
                      ORDER BY u.created_at DESC";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $indicados = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("USER_REFERRAL: Encontrados " . count($indicados) . " indicados");
            
            // Formatear dados para o formato esperado
            $referrals = [];
            foreach ($indicados as $indicado) {
                $referrals[] = [
                    'id' => null, // Não há ID da tabela indicacoes
                    'referrer_id' => $userId,
                    'referred_id' => $indicado['indicado_id'],
                    'codigo' => $indicado['codigo_usado'] ?: 'SEM_CODIGO',
                    'status' => $this->determinarStatus($indicado),
                    'comissao' => $indicado['first_login_bonus_processed'] ? 5.00 : 0.00,
                    'bonus_indicador' => 5.00,
                    'bonus_indicado' => 5.00,
                    'first_login_bonus_processed' => $indicado['first_login_bonus_processed'],
                    'data_conversao' => $indicado['first_login_at'],
                    'created_at' => $indicado['indicado_cadastro'],
                    'updated_at' => $indicado['indicado_cadastro'],
                    'full_name' => $indicado['indicado_nome'],
                    'email' => $indicado['indicado_email'],
                    'indicado_cadastro' => $indicado['indicado_cadastro']
                ];
            }
            
            return $referrals;
            
        } catch (Exception $e) {
            error_log("USER_REFERRAL ERROR: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Migra dados da tabela users para a tabela indicacoes
     */
    public function migrateUsersToIndicacoes() {
        try {
            error_log("USER_REFERRAL: Iniciando migração de users para indicacoes");
            
            // Buscar todos os usuários que têm indicador_id
            $query = "SELECT 
                        u.id as indicado_id,
                        u.indicador_id,
                        u.codigo_usado_indicacao,
                        u.created_at,
                        u.ultimo_login,
                        u.status
                      FROM users u
                      WHERE u.indicador_id IS NOT NULL 
                      AND u.indicador_id != 0";
            
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $usersWithReferrers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $migratedCount = 0;
            
            foreach ($usersWithReferrers as $user) {
                // Verificar se já existe na tabela indicacoes
                $checkQuery = "SELECT id FROM indicacoes 
                              WHERE indicador_id = ? AND indicado_id = ?";
                $checkStmt = $this->db->prepare($checkQuery);
                $checkStmt->execute([$user['indicador_id'], $user['indicado_id']]);
                
                if (!$checkStmt->fetch()) {
                    // Não existe, então inserir
                    $insertQuery = "INSERT INTO indicacoes (
                        indicador_id, 
                        indicado_id, 
                        codigo_usado, 
                        status, 
                        bonus_indicador, 
                        bonus_indicado,
                        first_login_bonus_processed,
                        first_login_at,
                        created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
                    $status = $user['status'] === 'ativo' ? 'ativo' : 'inativo';
                    $firstLoginProcessed = $user['ultimo_login'] ? 1 : 0;
                    $firstLoginAt = $user['ultimo_login'];
                    
                    $insertStmt = $this->db->prepare($insertQuery);
                    $insertStmt->execute([
                        $user['indicador_id'],
                        $user['indicado_id'],
                        $user['codigo_usado_indicacao'],
                        $status,
                        5.00, // bonus_indicador padrão
                        5.00, // bonus_indicado padrão
                        $firstLoginProcessed,
                        $firstLoginAt,
                        $user['created_at']
                    ]);
                    
                    $migratedCount++;
                    error_log("USER_REFERRAL: Migrado indicado {$user['indicado_id']} -> indicador {$user['indicador_id']}");
                }
            }
            
            error_log("USER_REFERRAL: Migração concluída - {$migratedCount} registros migrados");
            return $migratedCount;
            
        } catch (Exception $e) {
            error_log("USER_REFERRAL MIGRATION ERROR: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Busca estatísticas de indicação
     */
    public function getReferralStats($userId) {
        try {
            // Buscar indicados diretamente da tabela users
            $indicados = $this->getUserReferralsFromUsers($userId);
            
            $stats = [
                'total_indicados' => count($indicados),
                'indicados_ativos' => 0,
                'total_bonus' => 0,
                'bonus_este_mes' => 0
            ];
            
            $currentMonth = date('Y-m');
            
            foreach ($indicados as $indicado) {
                if ($indicado['first_login_bonus_processed']) {
                    $stats['indicados_ativos']++;
                    $stats['total_bonus'] += $indicado['comissao'];
                    
                    // Verificar se foi este mês
                    if (strpos($indicado['created_at'], $currentMonth) === 0) {
                        $stats['bonus_este_mes'] += $indicado['comissao'];
                    }
                }
            }
            
            return $stats;
            
        } catch (Exception $e) {
            error_log("USER_REFERRAL STATS ERROR: " . $e->getMessage());
            return [
                'total_indicados' => 0,
                'indicados_ativos' => 0,
                'total_bonus' => 0,
                'bonus_este_mes' => 0
            ];
        }
    }
    
    private function determinarStatus($indicado) {
        if ($indicado['user_status'] === 'ativo' && $indicado['first_login_bonus_processed']) {
            return 'confirmada';
        } elseif ($indicado['user_status'] === 'ativo') {
            return 'ativo';
        } else {
            return 'pendente';
        }
    }
}