
<?php
// src/migrations/create_plans_table.php

function createPlansTable($db) {
    $sql = "
    CREATE TABLE IF NOT EXISTS plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) DEFAULT NULL,
        duration_days INT DEFAULT 30,
        max_consultations INT DEFAULT -1,
        max_api_calls INT DEFAULT -1,
        features JSON,
        modules_included JSON,
        panels_included JSON,
        badge VARCHAR(50) DEFAULT NULL,
        is_popular TINYINT(1) DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        category VARCHAR(50) DEFAULT 'basic',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_slug (slug),
        INDEX idx_active (is_active),
        INDEX idx_category (category),
        INDEX idx_popular (is_popular),
        INDEX idx_sort_order (sort_order),
        INDEX idx_price (price)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    try {
        $result = $db->exec($sql);
        echo "Tabela 'plans' criada com sucesso!\n";
        
        // Inserir dados padrão
        insertDefaultPlans($db);
        
        return $result;
    } catch (Exception $e) {
        echo "Erro ao criar tabela 'plans': " . $e->getMessage() . "\n";
        return false;
    }
}

function insertDefaultPlans($db) {
    $defaultPlans = [
        [
            'name' => 'Rainha de Ouros',
            'slug' => 'rainha-de-ouros',
            'description' => 'Plano básico ideal para iniciantes',
            'price' => 29.90,
            'original_price' => 39.90,
            'duration_days' => 30,
            'max_consultations' => 1000,
            'max_api_calls' => 500,
            'features' => ['1.000 consultas/mês', 'Suporte básico', 'API REST'],
            'modules_included' => ['consulta-cpf', 'consulta-cnpj'],
            'panels_included' => [],
            'badge' => null,
            'is_popular' => 0,
            'is_active' => 1,
            'category' => 'basic',
            'sort_order' => 1
        ],
        [
            'name' => 'Rainha de Paus',
            'slug' => 'rainha-de-paus',
            'description' => 'Plano básico mais popular',
            'price' => 49.90,
            'original_price' => 69.90,
            'duration_days' => 30,
            'max_consultations' => 2500,
            'max_api_calls' => 1000,
            'features' => ['2.500 consultas/mês', 'Suporte prioritário', 'API REST', 'Relatórios'],
            'modules_included' => ['consulta-cpf', 'consulta-cnpj', 'relatorio-geral'],
            'panels_included' => [],
            'badge' => 'Mais popular',
            'is_popular' => 1,
            'is_active' => 1,
            'category' => 'basic',
            'sort_order' => 2
        ],
        [
            'name' => 'Rei de Copas',
            'slug' => 'rei-de-copas',
            'description' => 'Plano premium com recursos avançados',
            'price' => 99.90,
            'original_price' => 139.90,
            'duration_days' => 30,
            'max_consultations' => 10000,
            'max_api_calls' => 5000,
            'features' => ['10.000 consultas/mês', 'Suporte 24h', 'API REST', 'Consultas premium', 'Relatórios avançados'],
            'modules_included' => ['consulta-cpf', 'consulta-cnpj', 'consulta-avancada', 'relatorio-geral'],
            'panels_included' => [],
            'badge' => 'Editor',
            'is_popular' => 0,
            'is_active' => 1,
            'category' => 'premium',
            'sort_order' => 3
        ],
        [
            'name' => 'Rei de Espadas',
            'slug' => 'rei-de-espadas',
            'description' => 'Plano enterprise para grandes volumes',
            'price' => 199.90,
            'original_price' => 299.90,
            'duration_days' => 30,
            'max_consultations' => -1,
            'max_api_calls' => -1,
            'features' => ['Consultas ilimitadas', 'Suporte dedicado', 'API REST', 'Todos os módulos', 'Relatórios personalizados'],
            'modules_included' => ['consulta-cpf', 'consulta-cnpj', 'consulta-avancada', 'relatorio-geral'],
            'panels_included' => [],
            'badge' => 'Editor PRO',
            'is_popular' => 0,
            'is_active' => 1,
            'category' => 'king',
            'sort_order' => 4
        ]
    ];
    
    $sql = "INSERT INTO plans (name, slug, description, price, original_price, duration_days, max_consultations, max_api_calls, features, modules_included, panels_included, badge, is_popular, is_active, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    
    foreach ($defaultPlans as $plan) {
        $stmt->execute([
            $plan['name'],
            $plan['slug'],
            $plan['description'],
            $plan['price'],
            $plan['original_price'],
            $plan['duration_days'],
            $plan['max_consultations'],
            $plan['max_api_calls'],
            json_encode($plan['features']),
            json_encode($plan['modules_included']),
            json_encode($plan['panels_included']),
            $plan['badge'],
            $plan['is_popular'],
            $plan['is_active'],
            $plan['category'],
            $plan['sort_order']
        ]);
    }
    
    echo "Planos padrão inseridos com sucesso!\n";
}

// Executar migração se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    require_once __DIR__ . '/../config/database.php';
    
    echo "Executando migração da tabela plans...\n";
    
    if (createPlansTable($db)) {
        echo "Migração concluída com sucesso!\n";
    } else {
        echo "Falha na migração!\n";
    }
}
