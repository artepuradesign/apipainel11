<?php
// Script para criar a tabela user_subscriptions se não existir

require_once 'config/conexao.php';

try {
    // Usar pool de conexão
    $db = getDBConnection();

    // Verificar se a tabela já existe
    $checkQuery = "SHOW TABLES LIKE 'user_subscriptions'";
    $checkStmt = $db->prepare($checkQuery);
    $checkStmt->execute();
    
    if ($checkStmt->rowCount() > 0) {
        echo "✅ Tabela user_subscriptions já existe.\n";
        exit(0);
    }

    // Criar a tabela user_subscriptions
    $createTableQuery = "
    CREATE TABLE `user_subscriptions` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `user_id` int(11) NOT NULL,
        `plan_id` int(11) NOT NULL,
        `status` enum('active','inactive','cancelled','expired','suspended') DEFAULT 'active',
        `start_date` date NOT NULL,
        `end_date` date NOT NULL,
        `auto_renew` tinyint(1) DEFAULT 1,
        `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
        `payment_method` varchar(50) DEFAULT NULL,
        `external_subscription_id` varchar(100) DEFAULT NULL,
        `cancelled_at` timestamp NULL DEFAULT NULL,
        `cancelled_reason` text DEFAULT NULL,
        `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
        `created_at` timestamp NULL DEFAULT current_timestamp(),
        `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (`id`),
        KEY `idx_user_subscriptions_user_id` (`user_id`),
        KEY `idx_user_subscriptions_plan_id` (`plan_id`),
        KEY `idx_user_subscriptions_status` (`status`),
        KEY `idx_user_subscriptions_dates` (`start_date`, `end_date`),
        KEY `idx_user_subscriptions_active` (`user_id`, `status`, `end_date`),
        CONSTRAINT `fk_user_subscriptions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
        CONSTRAINT `fk_user_subscriptions_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    $db->exec($createTableQuery);
    echo "✅ Tabela user_subscriptions criada com sucesso!\n";

    // Criar dados de exemplo para testes (opcional)
    echo "📝 Tabela user_subscriptions pronta para uso.\n";
    echo "   - Controla as assinaturas ativas dos usuários\n";
    echo "   - Integrada com as tabelas users e plans\n";
    echo "   - Suporta renovação automática e diferentes status\n";

} catch (Exception $e) {
    echo "❌ Erro ao criar tabela user_subscriptions: " . $e->getMessage() . "\n";
    exit(1);
}
?>