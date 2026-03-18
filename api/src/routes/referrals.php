
<?php
// src/routes/referrals.php

require_once __DIR__ . '/../controllers/ReferralController.php';
require_once __DIR__ . '/../utils/Response.php';

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Instanciar controller
$referralController = new ReferralController($db);

// Rotas do sistema de indicação
switch ($method) {
    case 'POST':
        switch ($endpoint) {
            case '/referral-system/process-registration-bonus':
                $referralController->processRegistrationBonus();
                break;
                
            case '/referral-system/validate-code':
                $referralController->validateReferralCode();
                break;
                
            case '/referral-system/process-recharge-commission':
                $referralController->processRechargeCommission();
                break;
                
            case '/referral-system/update-balance':
                AuthMiddleware::authenticate();
                $referralController->updateUserBalance();
                break;
                
            case '/referral-system/verify-data':
                $testController = new ReferralTestController($db);
                $testController->verifyRegistrationData();
                break;
                
            default:
                Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    case 'GET':
        switch ($endpoint) {
            case '/referral-system/user-data':
                AuthMiddleware::authenticate();
                $referralController->getUserReferralData();
                break;
                
            case '/referral-system/transactions':
                AuthMiddleware::authenticate();
                $referralController->getWalletTransactions();
                break;
                
            case '/referral-system/balance':
                AuthMiddleware::authenticate();
                $referralController->getWalletBalance();
                break;
                
            case '/referral-system/config':
                $referralController->getReferralConfig();
                break;
                
            default:
                Response::error('Endpoint não encontrado', 404);
        }
        break;
        
    default:
        Response::error('Método não suportado', 405);
}
