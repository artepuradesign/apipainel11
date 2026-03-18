<?php
// src/routes/auth.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../endpoints/auth.php';

try {
    // Obter conexão do pool
    $db = getDBConnection();
    
    // Inicializar sessão se não estiver ativa
    if (session_status() == PHP_SESSION_NONE) {
        session_start();
    }
    
    // Extrair método e caminho
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remover prefixo da API se existir
    $path = preg_replace('#^/api#', '', $path);
    
    // Criar controlador de autenticação
    $authController = new AuthController($db);
    
    // Roteamento das requisições de autenticação
    if ($method === 'POST' && $path === '/auth/login') {
        $authController->login();
    } elseif ($method === 'POST' && $path === '/auth/register') {
        $authController->register();
    } elseif ($method === 'POST' && $path === '/auth/logout') {
        $authController->logout();
    } elseif ($method === 'GET' && $path === '/auth/me') {
        $authController->getCurrentUser();
    } elseif ($method === 'POST' && $path === '/auth/validate-referral') {
        $authController->validateReferralCode();
    } elseif ($method === 'POST' && $path === '/auth/validate-token') {
        $authController->validateToken();
    } elseif ($method === 'POST' && $path === '/auth/update-profile') {
        $authController->updateProfile();
    } elseif ($method === 'POST' && $path === '/auth/change-password') {
        $authController->changePassword();
    } elseif ($method === 'POST' && $path === '/auth/forgot-password') {
        $authController->forgotPassword();
    } elseif ($method === 'POST' && $path === '/auth/reset-password') {
        $authController->resetPassword();
    } elseif ($method === 'GET' && $path === '/auth/referrals') {
        handleAuthReferrals($db, $method, $path);
    } elseif ($method === 'POST' && $path === '/auth/process-referral-bonus') {
        include __DIR__ . '/referral.php';
        return;
    } elseif ($method === 'POST' && $path === '/auth/process-first-login-bonus') {
        include __DIR__ . '/referral.php';
        return;
    } elseif (($method === 'GET' || $method === 'POST') && $path === '/auth/referral-debug') {
        include __DIR__ . '/../endpoints/referral-debug.php';
        return;
    } else {
        error_log("AUTH_ROUTES: Endpoint não encontrado - {$method} {$path}");
        Response::error('Endpoint não encontrado', 404);
    }
    
} catch (Exception $e) {
    error_log("AUTH_ROUTES ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}