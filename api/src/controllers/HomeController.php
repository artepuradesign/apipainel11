
<?php
// src/controllers/HomeController.php

require_once '../models/Plan.php';
require_once '../models/Module.php';
require_once '../models/Testimonial.php';
require_once '../utils/Response.php';

class HomeController {
    private $db;
    private $plan;
    private $module;
    private $testimonial;
    
    public function __construct($db) {
        $this->db = $db;
        $this->plan = new Plan($db);
        $this->module = new Module($db);
        $this->testimonial = new Testimonial($db);
    }
    
    public function getHomeData() {
        try {
            // Buscar planos ativos ordenados por ordem
            $plansQuery = "SELECT * FROM planos WHERE status = 'ativo' ORDER BY ordem ASC";
            $plansStmt = $this->db->prepare($plansQuery);
            $plansStmt->execute();
            $plans = $plansStmt->fetchAll();
            
            // Buscar últimos 10 módulos ativos
            $modulesQuery = "SELECT * FROM modulos WHERE status = 'ativo' ORDER BY created_at DESC LIMIT 10";
            $modulesStmt = $this->db->prepare($modulesQuery);
            $modulesStmt->execute();
            $modules = $modulesStmt->fetchAll();
            
            // Buscar depoimentos ativos
            $testimonialsQuery = "SELECT * FROM depoimentos WHERE status = 'ativo' ORDER BY created_at DESC LIMIT 6";
            $testimonialsStmt = $this->db->prepare($testimonialsQuery);
            $testimonialsStmt->execute();
            $testimonials = $testimonialsStmt->fetchAll();
            
            // Buscar estatísticas do sistema
            $statsQuery = "SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE status = 'ativo') as total_users,
                (SELECT COUNT(*) FROM consultas WHERE status = 'concluida') as total_consultations,
                (SELECT COUNT(*) FROM modulos WHERE status = 'ativo') as total_modules,
                (SELECT COUNT(*) FROM paineis WHERE status = 'ativo') as total_panels";
            $statsStmt = $this->db->prepare($statsQuery);
            $statsStmt->execute();
            $stats = $statsStmt->fetch();
            
            $data = [
                'plans' => $this->formatPlans($plans),
                'modules' => $this->formatModules($modules),
                'testimonials' => $this->formatTestimonials($testimonials),
                'stats' => [
                    'totalUsers' => (int)$stats['total_users'],
                    'totalConsultations' => (int)$stats['total_consultations'],
                    'totalModules' => (int)$stats['total_modules'],
                    'totalPanels' => (int)$stats['total_panels']
                ]
            ];
            
            Response::success($data);
        } catch (Exception $e) {
            Response::error('Erro ao buscar dados da página inicial: ' . $e->getMessage(), 500);
        }
    }
    
    private function formatPlans($plans) {
        return array_map(function($plan) {
            $configuracoes = json_decode($plan['configuracoes'], true) ?? [];
            $recursos = json_decode($plan['recursos'], true) ?? [];
            
            return [
                'id' => (int)$plan['id'],
                'name' => $plan['nome'],
                'description' => $plan['descricao'],
                'price' => (float)$plan['preco'],
                'priceFormatted' => 'R$ ' . number_format($plan['preco'], 2, ',', '.'),
                'features' => $recursos,
                'consultationLimit' => (int)$plan['limite_consultas'],
                'status' => $plan['status'],
                'theme' => [
                    'colors' => $configuracoes['colors'] ?? [
                        'primary' => '#3B82F6',
                        'secondary' => '#1E40AF',
                        'accent' => '#60A5FA'
                    ],
                    'cardTheme' => $configuracoes['cardTheme'] ?? 'default',
                    'gradient' => $configuracoes['gradient'] ?? 'blue'
                ],
                'highlight' => (bool)$plan['destaque'],
                'order' => (int)$plan['ordem'],
                'cardSuit' => $plan['naipe'] ?? 'spades',
                'cardType' => $plan['tipo_carta'] ?? 'king',
                'discountPercentage' => (int)$plan['desconto_percentual']
            ];
        }, $plans);
    }
    
    private function formatModules($modules) {
        return array_map(function($module) {
            return [
                'id' => (int)$module['id'],
                'title' => $module['titulo'],
                'description' => $module['descricao'],
                'icon' => $module['icon'],
                'price' => $module['preco'],
                'category' => $module['categoria'],
                'status' => $module['status'],
                'path' => $module['caminho'],
                'order' => (int)$module['ordem'],
                'createdAt' => $module['created_at']
            ];
        }, $modules);
    }
    
    private function formatTestimonials($testimonials) {
        return array_map(function($testimonial) {
            return [
                'id' => (int)$testimonial['id'],
                'name' => $testimonial['nome'],
                'message' => $testimonial['mensagem'],
                'rating' => (int)$testimonial['nota'],
                'avatar' => $testimonial['avatar'],
                'position' => $testimonial['cargo'],
                'company' => $testimonial['empresa'],
                'createdAt' => $testimonial['created_at']
            ];
        }, $testimonials);
    }
    
    public function getPlans() {
        try {
            $query = "SELECT * FROM planos WHERE status = 'ativo' ORDER BY ordem ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $plans = $stmt->fetchAll();
            
            Response::success($this->formatPlans($plans));
        } catch (Exception $e) {
            Response::error('Erro ao buscar planos: ' . $e->getMessage(), 500);
        }
    }
}
