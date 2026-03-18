
<?php
// src/migrations/seed_initial_data.php

function seedInitialData($db) {
    try {
        error_log("SEED: Iniciando inserção de dados iniciais");
        
        // Criar tabelas de cupons se não existirem
        require_once __DIR__ . '/create_cupons_table.php';
        createCuponsTable($db);
        
        // Newsletter table já existe no banco
        
        // Verificar se já existem painéis
        $checkQuery = "SELECT COUNT(*) as total FROM panels";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->execute();
        $result = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result['total'] > 0) {
            error_log("SEED: Já existem " . $result['total'] . " painéis no banco");
            return true;
        }
        
        error_log("SEED: Nenhum painel encontrado, inserindo dados iniciais");
        
        // Inserir painéis iniciais
        $panels = [
            [
                'name' => 'Consultas Básicas',
                'slug' => 'consultas-basicas',
                'description' => 'Painel para consultas básicas de CPF, CNPJ e outros documentos',
                'icon' => 'Search',
                'color' => '#3B82F6',
                'background_color' => '#EFF6FF',
                'category' => 'consultas',
                'template' => 'modern',
                'is_active' => 1,
                'is_premium' => 0,
                'sort_order' => 1
            ],
            [
                'name' => 'Consultas Avançadas',
                'slug' => 'consultas-avancadas',
                'description' => 'Painel para consultas avançadas e relatórios detalhados',
                'icon' => 'FileSearch',
                'color' => '#10B981',
                'background_color' => '#ECFDF5',
                'category' => 'consultas',
                'template' => 'modern',
                'is_active' => 1,
                'is_premium' => 1,
                'sort_order' => 2
            ],
            [
                'name' => 'Veículos',
                'slug' => 'veiculos',
                'description' => 'Consultas relacionadas a veículos e placas',
                'icon' => 'Car',
                'color' => '#F59E0B',
                'background_color' => '#FFFBEB',
                'category' => 'veiculos',
                'template' => 'modern',
                'is_active' => 1,
                'is_premium' => 0,
                'sort_order' => 3
            ]
        ];
        
        $insertQuery = "INSERT INTO panels (name, slug, description, icon, color, background_color, category, template, is_active, is_premium, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $insertStmt = $db->prepare($insertQuery);
        
        foreach ($panels as $panel) {
            $result = $insertStmt->execute([
                $panel['name'],
                $panel['slug'],
                $panel['description'],
                $panel['icon'],
                $panel['color'],
                $panel['background_color'],
                $panel['category'],
                $panel['template'],
                $panel['is_active'],
                $panel['is_premium'],
                $panel['sort_order']
            ]);
            
            if ($result) {
                $id = $db->lastInsertId();
                error_log("SEED: Painel '{$panel['name']}' criado com ID: $id");
            }
        }
        
        error_log("SEED: Dados iniciais inseridos com sucesso");
        return true;
        
    } catch (Exception $e) {
        error_log("SEED ERROR: " . $e->getMessage());
        return false;
    }
}

// Executar se chamado diretamente
if (basename(__FILE__) == basename($_SERVER['SCRIPT_NAME'])) {
    require_once __DIR__ . '/../../config/conexao.php';
    
    // Usar pool de conexão
    $db = getDBConnection();
    
    if ($db) {
        seedInitialData($db);
        echo "Dados iniciais inseridos!\n";
    } else {
        echo "Erro na conexão com o banco!\n";
    }
}
?>
