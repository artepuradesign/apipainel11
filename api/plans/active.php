<?php
// plans/active.php - Endpoint otimizado para planos ativos

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../src/models/PlanModel.php';

try {
    // Cache por 5 minutos para reduzir hits no banco
    $cacheKey = 'active_plans_cache';
    $cacheFile = '/tmp/' . $cacheKey . '.json';
    $cacheExpiry = 300; // 5 minutos
    
    // Verificar se existe cache válido
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheExpiry) {
        $cachedData = file_get_contents($cacheFile);
        echo $cachedData;
        exit();
    }
    
    // Usar singleton para reutilizar conexão
    $database = Database::getInstance();
    $db = $database->getConnection();
    $planModel = new PlanModel($db);
    
    $plans = $planModel->getActive();
    
    // Formatar dados para o frontend
    $formattedPlans = array_map(function($plan) {
        // Parse JSON fields safely
        $features = [];
        if (!empty($plan['features'])) {
            $features = is_array($plan['features']) ? $plan['features'] : json_decode($plan['features'], true) ?: [];
        }
        
        $themeColors = [];
        if (!empty($plan['theme_colors'])) {
            $themeColors = is_array($plan['theme_colors']) ? $plan['theme_colors'] : json_decode($plan['theme_colors'], true) ?: [];
        }
        
        return [
            'id' => (int)$plan['id'],
            'name' => $plan['name'],
            'slug' => $plan['slug'],
            'description' => $plan['description'],
            'price' => (float)$plan['price'],
            'priceFormatted' => 'R$ ' . number_format($plan['price'], 2, ',', '.'),
            'duration_days' => (int)$plan['duration_days'],
            'consultation_limit' => (int)$plan['consultation_limit'],
            'max_consultations' => (int)$plan['consultation_limit'],
            'max_api_calls' => (int)$plan['consultation_limit'],
            'features' => $features,
            'modules_included' => $features, // Usar features como modules_included
            'category' => $plan['category'],
            'is_active' => (bool)$plan['is_active'],
            'is_popular' => (bool)$plan['is_popular'],
            'sort_order' => (int)$plan['sort_order'],
            'theme_colors' => $themeColors,
            'card_theme' => $plan['card_theme'],
            'card_suit' => $plan['card_suit'],
            'cardSuit' => $plan['card_suit'],
            'card_type' => $plan['card_type'],
            'cardType' => $plan['card_type'],
            'cardTheme' => $plan['card_theme'],
            'discount_percentage' => (int)$plan['discount_percentage'],
            'discountPercentage' => (int)$plan['discount_percentage'],
            'created_at' => $plan['created_at'],
            'updated_at' => $plan['updated_at']
        ];
    }, $plans);
    
    $response = [
        'success' => true,
        'data' => $formattedPlans,
        'message' => 'Planos ativos carregados com sucesso',
        'timestamp' => date('Y-m-d H:i:s'),
        'cached' => false
    ];
    
    $jsonResponse = json_encode($response);
    
    // Salvar no cache
    file_put_contents($cacheFile, $jsonResponse);
    
    echo $jsonResponse;
    
} catch (Exception $e) {
    error_log("API ERROR (plans/active): " . $e->getMessage());
    
    $response = [
        'success' => false,
        'error' => 'Erro interno do servidor: ' . $e->getMessage(),
        'message' => 'Erro interno do servidor: ' . $e->getMessage(),
        'data' => null,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    http_response_code(500);
    echo json_encode($response);
}
?>