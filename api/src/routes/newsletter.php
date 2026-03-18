<?php
// src/routes/newsletter.php

require_once __DIR__ . '/../controllers/NewsletterController.php';

try {
    error_log("NEWSLETTER ROUTES: Processando requisição newsletter");
    
    $controller = new NewsletterController($db);
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Remover /newsletter do URI para processar sub-rotas
    $subRoute = str_replace('/newsletter', '', $uri);
    
    error_log("NEWSLETTER ROUTES: Method = " . $method);
    error_log("NEWSLETTER ROUTES: Sub-route = " . $subRoute);
    
    switch ($method) {
        case 'POST':
            if ($subRoute === '/subscribe') {
                error_log("NEWSLETTER ROUTES: Direcionando para subscribe");
                $controller->subscribe();
            } elseif ($subRoute === '/unsubscribe') {
                error_log("NEWSLETTER ROUTES: Direcionando para unsubscribe");
                $controller->unsubscribe();
            } else {
                error_log("NEWSLETTER ROUTES: Endpoint POST não encontrado - " . $subRoute);
                Response::error('Endpoint não encontrado: ' . $subRoute, 404);
            }
            break;
            
        case 'GET':
            if ($subRoute === '/list') {
                error_log("NEWSLETTER ROUTES: Direcionando para listSubscriptions");
                $controller->listSubscriptions();
            } elseif ($subRoute === '/stats') {
                error_log("NEWSLETTER ROUTES: Direcionando para getStats");
                $controller->getStats();
            } elseif (preg_match('/^\/check\/(.+)$/', $subRoute, $matches)) {
                $email = urldecode($matches[1]);
                error_log("NEWSLETTER ROUTES: Direcionando para checkSubscription - " . $email);
                $controller->checkSubscription($email);
            } else {
                error_log("NEWSLETTER ROUTES: Endpoint GET não encontrado - " . $subRoute);
                Response::error('Endpoint não encontrado: ' . $subRoute, 404);
            }
            break;
            
        default:
            error_log("NEWSLETTER ROUTES: Método não permitido - " . $method);
            Response::error('Método não permitido', 405);
            break;
    }
    
} catch (Exception $e) {
    error_log("NEWSLETTER ROUTES ERROR: " . $e->getMessage());
    error_log("NEWSLETTER ROUTES TRACE: " . $e->getTraceAsString());
    Response::error('Erro interno no roteamento de newsletter', 500);
}
?>