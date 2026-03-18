<?php
// src/endpoints/notifications.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/NotificationService.php';
require_once __DIR__ . '/../utils/Response.php';

try {
    // Configurar CORS
    setCORSHeaders();
    
    // Verificar método
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
    
    // Conectar ao banco
    $db = getDBConnection();
    $notificationService = new NotificationService($db);
    
    // Verificar autenticação
    $authUser = authenticate($db);
    if (!$authUser) {
        Response::error('Token inválido ou expirado', 401);
        exit();
    }
    
    $userId = $authUser['id'];
    $method = $_SERVER['REQUEST_METHOD'];
    $path = $_SERVER['REQUEST_URI'];
    
    // GET /notifications - Buscar notificações do usuário
    if ($method === 'GET') {
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $onlyUnread = isset($_GET['unread']) && $_GET['unread'] === 'true';
        
        $notifications = $notificationService->getUserNotifications($userId, $limit, $onlyUnread);
        $unreadCount = $notificationService->getUnreadCount($userId);
        
        // Debug logs
        error_log("NOTIFICATIONS_DEBUG: UserID: " . $userId);
        error_log("NOTIFICATIONS_DEBUG: Found notifications: " . count($notifications));
        error_log("NOTIFICATIONS_DEBUG: Unread count: " . $unreadCount);
        
        // Debug individual notifications
        foreach($notifications as $notif) {
            error_log("NOTIFICATIONS_DEBUG: ID: " . $notif['id'] . ", Type: " . $notif['type'] . ", Read: " . ($notif['is_read'] ? 'true' : 'false'));
        }
        
        // Formatar notifications corretamente
        $formattedNotifications = array_map(function($notification) {
            return [
                'id' => (int)$notification['id'],
                'type' => $notification['type'],
                'title' => $notification['title'],
                'message' => $notification['message'],
                'action_url' => $notification['action_url'],
                'action_text' => $notification['action_text'],
                'is_read' => (bool)($notification['is_read'] ?? false),
                'priority' => $notification['priority'] ?? 'medium',
                'created_at' => $notification['created_at'],
                'read_at' => $notification['read_at']
            ];
        }, $notifications);
        
        Response::success([
            'notifications' => $formattedNotifications,
            'unread_count' => $unreadCount
        ], 'Notificações recuperadas com sucesso');
        
    // GET /notifications/{id} - Buscar notificação específica
    } elseif ($method === 'GET' && preg_match('/\/notifications\/(\d+)$/', $path, $matches)) {
        $notificationId = (int)$matches[1];
        
        $notification = $notificationService->getNotificationById($notificationId, $userId);
        
        if ($notification) {
            Response::success($notification, 'Notificação recuperada com sucesso');
        } else {
            Response::error('Notificação não encontrada', 404);
        }
        
    // POST /notifications/{id}/read - Marcar como lida
    } elseif ($method === 'POST' && preg_match('/\/notifications\/(\d+)\/read/', $path, $matches)) {
        $notificationId = (int)$matches[1];
        
        $result = $notificationService->markAsRead($notificationId, $userId);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['message'], 400);
        }
        
    // DELETE /notifications/{id} - Deletar notificação  
    } elseif ($method === 'DELETE' && preg_match('/\/notifications\/(\d+)$/', $path, $matches)) {
        $notificationId = (int)$matches[1];
        
        $result = $notificationService->deleteNotification($notificationId, $userId);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['message'], $result['code'] ?? 400);
        }
        
    } else {
        Response::error('Endpoint não encontrado', 404);
    }
    
} catch (Exception $e) {
    error_log("NOTIFICATIONS_ENDPOINT ERROR: " . $e->getMessage());
    Response::error('Erro interno do servidor', 500);
}