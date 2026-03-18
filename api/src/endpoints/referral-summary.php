<?php
// src/endpoints/referral-summary.php - Endpoint para ver resumo completo do sistema de indicação

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../utils/Response.php';

try {
    $db = getDBConnection();
    
    // 1. Configurações do sistema
    $configQuery = "SELECT config_key, config_value FROM system_config WHERE config_key LIKE 'referral_%'";
    $stmt = $db->prepare($configQuery);
    $stmt->execute();
    $configs = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    
    // 2. Estatísticas gerais
    $stats = [];
    
    // Total de indicações ativas
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM indicacoes WHERE status = 'ativo'");
    $stmt->execute();
    $stats['total_indicacoes_ativas'] = (int)$stmt->fetch()['count'];
    
    // Total de usuários com código de indicação
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM users WHERE codigo_indicacao IS NOT NULL");
    $stmt->execute();
    $stats['usuarios_com_codigo'] = (int)$stmt->fetch()['count'];
    
    // Total de transações de indicação
    $stmt = $db->prepare("SELECT COUNT(*) as count, SUM(amount) as total FROM wallet_transactions WHERE type = 'indicacao'");
    $stmt->execute();
    $transactionData = $stmt->fetch();
    $stats['total_transacoes_indicacao'] = (int)$transactionData['count'];
    $stats['total_valor_bonus_pagos'] = (float)($transactionData['total'] ?? 0);
    
    // 3. Top indicadores
    $topIndicadoresQuery = "SELECT 
                               u.id, u.full_name, u.email, u.codigo_indicacao,
                               COUNT(i.id) as total_indicacoes,
                               SUM(i.bonus_indicador) as total_bonus_recebido
                           FROM users u
                           LEFT JOIN indicacoes i ON u.id = i.indicador_id AND i.status = 'ativo'
                           WHERE u.codigo_indicacao IS NOT NULL
                           GROUP BY u.id
                           HAVING total_indicacoes > 0
                           ORDER BY total_indicacoes DESC, total_bonus_recebido DESC
                           LIMIT 10";
    $stmt = $db->prepare($topIndicadoresQuery);
    $stmt->execute();
    $topIndicadores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 4. Últimas indicações
    $ultimasIndicacoesQuery = "SELECT 
                                  i.*,
                                  indicador.full_name as indicador_name,
                                  indicador.codigo_indicacao as codigo_usado_real,
                                  indicado.full_name as indicado_name,
                                  indicado.email as indicado_email
                               FROM indicacoes i
                               JOIN users indicador ON i.indicador_id = indicador.id
                               JOIN users indicado ON i.indicado_id = indicado.id
                               WHERE i.status = 'ativo'
                               ORDER BY i.created_at DESC
                               LIMIT 10";
    $stmt = $db->prepare($ultimasIndicacoesQuery);
    $stmt->execute();
    $ultimasIndicacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 5. Verificar integridade dos dados
    $integrityChecks = [];
    
    // Verificar indicações sem transações
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM indicacoes i 
                         WHERE i.status = 'ativo' 
                         AND NOT EXISTS (
                             SELECT 1 FROM wallet_transactions wt 
                             WHERE wt.reference_type = 'referral_registration' 
                             AND (wt.reference_id = i.indicado_id OR wt.user_id = i.indicador_id)
                         )");
    $stmt->execute();
    $integrityChecks['indicacoes_sem_transacoes'] = (int)$stmt->fetch()['count'];
    
    // Verificar transações órfãs
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM wallet_transactions wt 
                         WHERE wt.type = 'indicacao' 
                         AND wt.reference_type = 'referral_registration'
                         AND NOT EXISTS (
                             SELECT 1 FROM indicacoes i 
                             WHERE i.indicado_id = wt.reference_id OR i.indicador_id = wt.user_id
                         )");
    $stmt->execute();
    $integrityChecks['transacoes_orfas'] = (int)$stmt->fetch()['count'];
    
    Response::success([
        'sistema_status' => 'Operacional',
        'configuracoes' => $configs,
        'estatisticas_gerais' => $stats,
        'top_indicadores' => $topIndicadores,
        'ultimas_indicacoes' => $ultimasIndicacoes,
        'verificacao_integridade' => $integrityChecks,
        'timestamp' => date('Y-m-d H:i:s')
    ], 'Resumo Completo do Sistema de Indicação');
    
} catch (Exception $e) {
    error_log("REFERRAL_SUMMARY ERROR: " . $e->getMessage());
    Response::error('Erro ao gerar resumo: ' . $e->getMessage(), 500);
}
?>