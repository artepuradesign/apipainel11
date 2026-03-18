
<?php
// src/routes/notifications.php

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../middleware/auth.php';

// Obter conexão do pool
$db = getDBConnection();

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    // Remover prefixo da API se existir
    $path = preg_replace('#^/api#', '', $path);
    
    error_log("NOTIFICATION_ROUTES: {$method} {$path}");
    
    // Headers CORS
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($method === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    // Criar instância do serviço
    $notificationService = new NotificationService($db);
    
    // Roteamento
    if ($method === 'GET' && $path === '/notifications') {
        getUserNotifications($db, $notificationService);
    } elseif ($method === 'GET' && $path === '/notifications/unread-count') {
        getUnreadCount($db, $notificationService);
    } elseif ($method === 'POST' && preg_match('#^/notifications/(\d+)/read$#', $path, $matches)) {
        markAsRead($db, $notificationService, (int)$matches[1]);
    } elseif ($method === 'POST' && $path === '/notifications/welcome') {
        createWelcomeNotification($db, $notificationService);
    } elseif ($method === 'POST' && strpos($path, '/notifications/recharge-alert') !== false) {
        createRechargeNotification($db, $notificationService);
    } elseif ($method === 'POST' && strpos($path, '/notifications/plan-purchase-alert') !== false) {
        createPlanPurchaseNotification($db, $notificationService);
    } elseif ($method === 'DELETE' && preg_match('#^/notifications/(\d+)$#', $path, $matches)) {
        deleteNotification($db, $notificationService, (int)$matches[1]);
    } else {
        Response::error('Endpoint de notificação não encontrado: ' . $path, 404);
    }
    
} catch (Exception $e) {
    error_log("NOTIFICATION_ROUTES ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}
// Não fechar a conexão - o pool gerencia automaticamente

/**
 * Busca notificações do usuário
 */
function getUserNotifications($db, $notificationService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        $limit = $_GET['limit'] ?? 10;
        $onlyUnread = isset($_GET['unread']) && $_GET['unread'] === 'true';
        
        $notifications = $notificationService->getUserNotifications($userId, $limit, $onlyUnread);
        $unreadCount = $notificationService->getUnreadCount($userId);
        
        Response::success([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
        
    } catch (Exception $e) {
        error_log("GET_USER_NOTIFICATIONS ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Busca contador de notificações não lidas
 */
function getUnreadCount($db, $notificationService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        $count = $notificationService->getUnreadCount($userId);
        
        Response::success(['unread_count' => $count]);
        
    } catch (Exception $e) {
        error_log("GET_UNREAD_COUNT ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Marca notificação como lida
 */
function markAsRead($db, $notificationService, $notificationId) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        $result = $notificationService->markAsRead($notificationId, $userId);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['message'], 400);
        }
        
    } catch (Exception $e) {
        error_log("MARK_AS_READ ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Cria notificação de boas-vindas para novo usuário
 */
function createWelcomeNotification($db, $notificationService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (!$input || !isset($input['user_id'])) {
            Response::error('ID do usuário é obrigatório', 400);
            return;
        }
        
        $userId = $input['user_id'];
        
        // Buscar dados do usuário
        $userQuery = "SELECT full_name FROM users WHERE id = ?";
        $userStmt = $db->prepare($userQuery);
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            Response::error('Usuário não encontrado', 404);
            return;
        }
        
        // Criar notificação de boas-vindas
        $result = $notificationService->createNotification(
            $userId,
            'system',
            'Bem-vindo à nossa plataforma!',
            "Olá {$user['full_name']}! Seja muito bem-vindo(a) à nossa plataforma. Explore todos os recursos disponíveis e aproveite ao máximo nossa solução completa de consultas e painéis.",
            '/dashboard',
            'Ir para o Dashboard',
            'high'
        );
        
        if ($result['success']) {
            Response::success(['notification_id' => $result['notification_id']], 'Notificação de boas-vindas criada');
        } else {
            Response::error($result['message'], 400);
        }
        
    } catch (Exception $e) {
        error_log("CREATE_WELCOME_NOTIFICATION ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Cria notificação de recarga para usuários suporte
 */
function createRechargeNotification($db, $notificationService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            Response::error('Dados inválidos', 400);
            return;
        }
        
        // Validar campos obrigatórios
        $requiredFields = ['user_id', 'user_name', 'amount', 'method'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        $userId = $input['user_id'];
        $userName = $input['user_name'];
        $amount = $input['amount'];
        $method = $input['method'];
        $transactionId = $input['transaction_id'] ?? null;
        
        // Buscar todos os usuários suporte e admin
        $supportQuery = "SELECT id FROM users WHERE (user_role = 'suporte' OR user_role = 'admin') AND status = 'ativo'";
        $supportStmt = $db->prepare($supportQuery);
        $supportStmt->execute();
        $supportUsers = $supportStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($supportUsers)) {
            error_log('RECHARGE_NOTIFICATION: Nenhum suporte/admin encontrado');
        }
        
        // Formatar valor em reais
        $formattedAmount = 'R$ ' . number_format($amount, 2, ',', '.');
        
        // Criar títulos e mensagens
        $title = 'Nova Recarga Realizada';
        $message = "Usuário {$userName} realizou uma recarga de {$formattedAmount} via {$method}.";
        if ($transactionId) {
            $message .= " ID da transação: {$transactionId}";
        }
        
        $notificationsCreated = 0;
        
        // URL de ação
        $actionUrl = $transactionId ? "/notifications/transaction-details/{$transactionId}" : null;
        
        // 1) Criar notificação para o usuário que fez a recarga
        $userTitle = 'Recarga Realizada com Sucesso';
        $userMessage = "Sua recarga de {$formattedAmount} via {$method} foi processada com sucesso.";
        if ($transactionId) {
            $userMessage .= " ID da transação: {$transactionId}";
        }
        $userNotificationResult = $notificationService->createNotification(
            $userId,
            'user_recharge_success',
            $userTitle,
            $userMessage,
            $actionUrl,
            'Ver Detalhes',
            'medium'
        );
        if ($userNotificationResult['success'] ?? false) {
            $notificationsCreated++;
        }
        
        // 2) Criar notificação para suportes/admins
        foreach ($supportUsers as $supportUser) {
            $result = $notificationService->createNotification(
                $supportUser['id'],
                'admin_recharge_alert',
                $title,
                $message,
                $actionUrl,
                'Ver Detalhes',
                'high'
            );
            if ($result['success']) {
                $notificationsCreated++;
            }
        }
        
        if ($notificationsCreated > 0) {
            error_log("RECHARGE_NOTIFICATION: Criadas {$notificationsCreated} notificações para recarga de {$userName}");
            
            Response::success([
                'notifications_created' => $notificationsCreated,
                'support_users_count' => count($supportUsers),
                'user_notification_created' => $userNotificationResult['success'] ?? false,
                'message' => "Notificações criadas para {$notificationsCreated} usuários (inclui o usuário da recarga)"
            ], 'Notificações de recarga criadas com sucesso');
        } else {
            Response::error('Erro ao criar notificações de recarga', 500);
        }
        
    } catch (Exception $e) {
        error_log("CREATE_RECHARGE_NOTIFICATION ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Deleta uma notificação
 */
function deleteNotification($db, $notificationService, $notificationId) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        // Verificar autenticação
        $authUser = authenticate($db);
        if (!$authUser) {
            Response::error('Token de autorização inválido', 401);
            return;
        }
        
        $userId = $authUser['id'];
        $result = $notificationService->deleteNotification($notificationId, $userId);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['message'], $result['code'] ?? 400);
        }
        
    } catch (Exception $e) {
        error_log("DELETE_NOTIFICATION ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}

/**
 * Cria notificação de compra de planos para usuários suporte
 */
function createPlanPurchaseNotification($db, $notificationService) {
    try {
        header('Content-Type: application/json; charset=utf-8');
        
        $rawInput = file_get_contents('php://input');
        $input = json_decode($rawInput, true);
        
        if (!$input) {
            Response::error('Dados inválidos', 400);
            return;
        }
        
        // Validar campos obrigatórios
        $requiredFields = ['user_id', 'user_name', 'plan_name', 'amount', 'method'];
        foreach ($requiredFields as $field) {
            if (!isset($input[$field])) {
                Response::error("Campo {$field} é obrigatório", 400);
                return;
            }
        }
        
        $userId = $input['user_id'];
        $userName = $input['user_name'];
        $planName = $input['plan_name'];
        $amount = $input['amount'];
        $method = $input['method'];
        $transactionId = $input['transaction_id'] ?? null;
        
        error_log("PLAN_PURCHASE_NOTIFICATION: Criando notificações para compra de plano - User: {$userName}, Plan: {$planName}, Amount: {$amount}");
        
        // Buscar todos os usuários suporte e admin
        $supportQuery = "SELECT id FROM users WHERE (user_role = 'suporte' OR user_role = 'admin') AND status = 'ativo'";
        $supportStmt = $db->prepare($supportQuery);
        $supportStmt->execute();
        $supportUsers = $supportStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($supportUsers)) {
            error_log('PLAN_PURCHASE_NOTIFICATION: Nenhum suporte/admin encontrado');
        }
        
        // Formatar valor em reais
        $formattedAmount = 'R$ ' . number_format($amount, 2, ',', '.');
        
        // Criar títulos e mensagens
        $title = 'Nova Compra de Plano';
        $message = "Usuário {$userName} adquiriu o plano {$planName} de {$formattedAmount} via {$method}.";
        if ($transactionId) {
            $message .= " ID da transação: {$transactionId}";
        }
        
        $notificationsCreated = 0;
        
        // URL de ação
        $actionUrl = "/dashboard/admin?tab=transactions";
        
        // 1) Criar notificação para o usuário que comprou o plano
        $userTitle = 'Plano Adquirido com Sucesso';
        $userMessage = "Seu plano {$planName} de {$formattedAmount} foi ativado com sucesso via {$method}.";
        if ($transactionId) {
            $userMessage .= " ID da transação: {$transactionId}";
        }
        $userNotificationResult = $notificationService->createNotification(
            $userId,
            'user_plan_purchase_success',
            $userTitle,
            $userMessage,
            '/dashboard/plans',
            'Ver Planos',
            'medium'
        );
        if ($userNotificationResult['success'] ?? false) {
            $notificationsCreated++;
            error_log("PLAN_PURCHASE_NOTIFICATION: Notificação criada para o usuário comprador");
        }
        
        // 2) Criar notificação para suportes/admins
        foreach ($supportUsers as $supportUser) {
            $result = $notificationService->createNotification(
                $supportUser['id'],
                'admin_plan_purchase_alert',
                $title,
                $message,
                $actionUrl,
                'Ver Detalhes',
                'high'
            );
            if ($result['success']) {
                $notificationsCreated++;
            }
        }
        
        if ($notificationsCreated > 0) {
            error_log("PLAN_PURCHASE_NOTIFICATION: Criadas {$notificationsCreated} notificações para compra do plano {$planName} por {$userName}");
            
            Response::success([
                'notifications_created' => $notificationsCreated,
                'support_users_count' => count($supportUsers),
                'user_notification_created' => $userNotificationResult['success'] ?? false,
                'message' => "Notificações criadas para {$notificationsCreated} usuários (inclui o usuário da compra)"
            ], 'Notificações de compra de plano criadas com sucesso');
        } else {
            Response::error('Erro ao criar notificações de compra de plano', 500);
        }
        
    } catch (Exception $e) {
        error_log("CREATE_PLAN_PURCHASE_NOTIFICATION ERROR: " . $e->getMessage());
        Response::error('Erro interno do servidor: ' . $e->getMessage(), 500);
    }
}
