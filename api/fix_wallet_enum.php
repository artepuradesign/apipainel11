<?php
// Script para adicionar 'digital' ao ENUM wallet_type

require_once __DIR__ . '/config/conexao.php';

try {
    $db = getDBConnection();
    
    echo "Iniciando correção do ENUM wallet_type...\n";
    
    // Adicionar 'digital' ao ENUM da tabela user_wallets
    $alterQuery1 = "ALTER TABLE user_wallets MODIFY COLUMN wallet_type ENUM('main', 'bonus', 'plan', 'referral', 'digital') DEFAULT 'main'";
    $db->exec($alterQuery1);
    echo "✅ ENUM user_wallets.wallet_type atualizado\n";
    
    // Adicionar 'digital' ao ENUM da tabela wallet_transactions
    $alterQuery2 = "ALTER TABLE wallet_transactions MODIFY COLUMN wallet_type ENUM('main', 'bonus', 'plan', 'referral', 'digital') DEFAULT 'main'";
    $db->exec($alterQuery2);
    echo "✅ ENUM wallet_transactions.wallet_type atualizado\n";
    
    echo "✅ Correção concluída! Agora 'digital' é um valor válido para wallet_type.\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
?>