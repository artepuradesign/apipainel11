
<?php
// src/utils/DatabaseIntegrityChecker.php

class DatabaseIntegrityChecker {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    /**
     * Verifica integridade do sistema de indicações
     */
    public function checkReferralSystemIntegrity() {
        $issues = [];
        
        try {
            // 1. Verificar usuários sem carteira
            $usersWithoutWallet = "SELECT COUNT(*) as count FROM users u
                                   WHERE u.status = 'ativo'
                                   AND NOT EXISTS (SELECT 1 FROM user_wallets uw WHERE uw.user_id = u.id AND uw.wallet_type = 'plan')";
            
            $stmt = $this->db->prepare($usersWithoutWallet);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $issues[] = "❌ {$count} usuários ativos sem carteira";
            } else {
                $issues[] = "✅ Todos os usuários ativos têm carteiras";
            }
            
            // 2. Verificar consistência de saldos
            $balanceInconsistency = "SELECT COUNT(*) as count FROM users u
                                     INNER JOIN user_wallets uw ON u.id = uw.user_id AND uw.wallet_type = 'plan'
                                     WHERE ABS(u.saldo_plano - uw.current_balance) > 0.01";
            
            $stmt = $this->db->prepare($balanceInconsistency);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $issues[] = "❌ {$count} usuários com inconsistência de saldo entre users e user_wallets";
            } else {
                $issues[] = "✅ Saldos consistentes entre tabelas";
            }
            
            // 3. Verificar indicações não registradas
            $unregisteredReferrals = "SELECT COUNT(*) as count FROM users u
                                      WHERE u.indicador_id IS NOT NULL 
                                      AND u.indicador_id != 0
                                      AND NOT EXISTS (
                                          SELECT 1 FROM indicacoes i 
                                          WHERE i.indicador_id = u.indicador_id 
                                          AND i.indicado_id = u.id
                                      )";
            
            $stmt = $this->db->prepare($unregisteredReferrals);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $issues[] = "❌ {$count} indicações não registradas na tabela indicacoes";
            } else {
                $issues[] = "✅ Todas as indicações estão registradas";
            }
            
            // 4. Verificar transações sem referência
            $orphanTransactions = "SELECT COUNT(*) as count FROM wallet_transactions wt
                                   WHERE wt.type = 'indicacao'
                                   AND wt.reference_type = 'referral_bonus'
                                   AND NOT EXISTS (
                                       SELECT 1 FROM indicacoes i 
                                       WHERE i.id = wt.reference_id
                                   )";
            
            $stmt = $this->db->prepare($orphanTransactions);
            $stmt->execute();
            $count = $stmt->fetchColumn();
            
            if ($count > 0) {
                $issues[] = "❌ {$count} transações de indicação sem referência válida";
            } else {
                $issues[] = "✅ Todas as transações de indicação têm referências válidas";
            }
            
            // 5. Verificar configuração do sistema
            $configCheck = "SELECT config_value FROM system_config WHERE config_key = 'referral_bonus_amount'";
            $stmt = $this->db->prepare($configCheck);
            $stmt->execute();
            $bonusAmount = $stmt->fetchColumn();
            
            if ($bonusAmount) {
                $issues[] = "✅ Configuração de bônus: R$ {$bonusAmount}";
            } else {
                $issues[] = "❌ Configuração de bônus não encontrada";
            }
            
            return $issues;
            
        } catch (Exception $e) {
            return ["❌ Erro ao verificar integridade: " . $e->getMessage()];
        }
    }
    
    /**
     * Corrige problemas encontrados
     */
    public function fixIntegrityIssues() {
        $fixes = [];
        
        try {
            $this->db->beginTransaction();
            
            // 1. Criar carteiras faltantes
            $createWalletsQuery = "INSERT IGNORE INTO user_wallets (user_id, wallet_type, current_balance, available_balance, status, created_at, updated_at)
                                  SELECT u.id, 'plan', COALESCE(u.saldo_plano, 0.00), COALESCE(u.saldo_plano, 0.00), 'active', NOW(), NOW()
                                  FROM users u
                                  WHERE u.status = 'ativo'
                                  AND NOT EXISTS (SELECT 1 FROM user_wallets uw WHERE uw.user_id = u.id AND uw.wallet_type = 'plan')";
            
            $result = $this->db->exec($createWalletsQuery);
            if ($result > 0) {
                $fixes[] = "✅ {$result} carteiras criadas";
            }
            
            // 2. Sincronizar saldos
            $syncBalancesQuery = "UPDATE user_wallets uw
                                  INNER JOIN users u ON uw.user_id = u.id
                                  SET uw.current_balance = u.saldo_plano,
                                      uw.available_balance = u.saldo_plano,
                                      uw.updated_at = NOW()
                                  WHERE uw.wallet_type = 'plan'
                                  AND ABS(uw.current_balance - u.saldo_plano) > 0.01";
            
            $result = $this->db->exec($syncBalancesQuery);
            if ($result > 0) {
                $fixes[] = "✅ {$result} saldos sincronizados";
            }
            
            // 3. Criar configuração de bônus se não existir
            $configInsert = "INSERT IGNORE INTO system_config (config_key, config_value, config_type, category, description, is_public, created_at) 
                            VALUES ('referral_bonus_amount', '5.00', 'number', 'referral', 'Valor do bônus de indicação em reais', 0, NOW())";
            
            $result = $this->db->exec($configInsert);
            if ($result > 0) {
                $fixes[] = "✅ Configuração de bônus criada";
            }
            
            $this->db->commit();
            
            return $fixes;
            
        } catch (Exception $e) {
            $this->db->rollback();
            return ["❌ Erro ao corrigir problemas: " . $e->getMessage()];
        }
    }
}
