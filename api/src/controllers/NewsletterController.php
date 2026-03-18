<?php
// src/controllers/NewsletterController.php

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../utils/Response.php';

class NewsletterController extends BaseController {
    
    public function subscribe() {
        try {
            error_log("NEWSLETTER: Iniciando processo de inscrição");
            
            // Validar dados de entrada
            $validation = $this->validateJsonInput();
            if (!$validation['valid']) {
                error_log("NEWSLETTER ERROR: Dados JSON inválidos - " . $validation['raw']);
                Response::error('Dados inválidos fornecidos', 400);
                return;
            }
            
            $data = $validation['data'];
            error_log("NEWSLETTER: Dados recebidos - " . json_encode($data));
            
            // Validar campos obrigatórios
            if (empty($data['email'])) {
                error_log("NEWSLETTER ERROR: Email não fornecido");
                Response::error('Email é obrigatório', 400);
                return;
            }
            
            $email = strtolower(trim($data['email']));
            $name = isset($data['name']) ? trim($data['name']) : null;
            $source = isset($data['source']) ? trim($data['source']) : 'footer_newsletter';
            $ip_address = isset($data['ip_address']) ? trim($data['ip_address']) : $_SERVER['REMOTE_ADDR'] ?? 'unknown';
            $user_agent = isset($data['user_agent']) ? trim($data['user_agent']) : $_SERVER['HTTP_USER_AGENT'] ?? 'unknown';
            
            // Validar formato do email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                error_log("NEWSLETTER ERROR: Email inválido - " . $email);
                Response::error('Formato de email inválido', 400);
                return;
            }
            
            error_log("NEWSLETTER: Email validado - " . $email);
            
            // Verificar se já existe uma inscrição
            $checkQuery = "SELECT id, status, created_at FROM newsletter_emails WHERE email = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$email]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existing) {
                if ($existing['status'] === 'active') {
                    error_log("NEWSLETTER INFO: Email já inscrito e ativo - " . $email);
                    Response::success([
                        'subscription_id' => $existing['id'],
                        'status' => 'active',
                        'message' => 'Email já está inscrito na newsletter'
                    ], 'Email já está inscrito na newsletter');
                    return;
                } else {
                    // Reativar inscrição existente
                    error_log("NEWSLETTER: Reativando inscrição existente - " . $email);
                    $updateQuery = "UPDATE newsletter_emails 
                                   SET status = 'active', updated_at = NOW(), name = ?, source = ?, ip_address = ?, user_agent = ?
                                   WHERE email = ?";
                    $updateStmt = $this->db->prepare($updateQuery);
                    $result = $updateStmt->execute([$name, $source, $ip_address, $user_agent, $email]);
                    
                    if ($result) {
                        error_log("NEWSLETTER SUCCESS: Inscrição reativada - " . $email);
                        Response::success([
                            'subscription_id' => $existing['id'],
                            'status' => 'reactivated',
                            'email' => $email,
                            'name' => $name
                        ], 'Inscrição reativada com sucesso');
                        return;
                    } else {
                        error_log("NEWSLETTER ERROR: Falha ao reativar inscrição - " . $email);
                        Response::error('Erro ao reativar inscrição', 500);
                        return;
                    }
                }
            }
            
            // Criar nova inscrição
            error_log("NEWSLETTER: Criando nova inscrição - " . $email);
            $insertQuery = "INSERT INTO newsletter_emails (email, name, source, status, ip_address, user_agent, created_at, updated_at) 
                           VALUES (?, ?, ?, 'active', ?, ?, NOW(), NOW())";
            $insertStmt = $this->db->prepare($insertQuery);
            $result = $insertStmt->execute([$email, $name, $source, $ip_address, $user_agent]);
            
            if ($result) {
                $subscriptionId = $this->db->lastInsertId();
                error_log("NEWSLETTER SUCCESS: Nova inscrição criada - ID: " . $subscriptionId . " Email: " . $email);
                
                Response::success([
                    'subscription_id' => $subscriptionId,
                    'status' => 'subscribed',
                    'email' => $email,
                    'name' => $name,
                    'source' => $source
                ], 'Inscrição realizada com sucesso');
            } else {
                error_log("NEWSLETTER ERROR: Falha ao criar inscrição - " . $email);
                Response::error('Erro ao realizar inscrição', 500);
            }
            
        } catch (Exception $e) {
            error_log("NEWSLETTER FATAL ERROR: " . $e->getMessage());
            error_log("NEWSLETTER TRACE: " . $e->getTraceAsString());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function unsubscribe() {
        try {
            error_log("NEWSLETTER: Iniciando processo de cancelamento");
            
            $validation = $this->validateJsonInput();
            if (!$validation['valid']) {
                error_log("NEWSLETTER ERROR: Dados JSON inválidos");
                Response::error('Dados inválidos fornecidos', 400);
                return;
            }
            
            $data = $validation['data'];
            
            if (empty($data['email'])) {
                Response::error('Email é obrigatório', 400);
                return;
            }
            
            $email = strtolower(trim($data['email']));
            
            // Verificar se a inscrição existe
            $checkQuery = "SELECT id FROM newsletter_emails WHERE email = ? AND status = 'active'";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$email]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$existing) {
                Response::error('Email não encontrado ou já cancelado', 404);
                return;
            }
            
            // Cancelar inscrição
            $updateQuery = "UPDATE newsletter_emails SET status = 'unsubscribed', updated_at = NOW() WHERE email = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $result = $updateStmt->execute([$email]);
            
            if ($result) {
                error_log("NEWSLETTER SUCCESS: Inscrição cancelada - " . $email);
                Response::success(['email' => $email], 'Inscrição cancelada com sucesso');
            } else {
                Response::error('Erro ao cancelar inscrição', 500);
            }
            
        } catch (Exception $e) {
            error_log("NEWSLETTER UNSUBSCRIBE ERROR: " . $e->getMessage());
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function checkSubscription($email) {
        try {
            error_log("NEWSLETTER: Verificando inscrição - " . $email);
            
            $email = strtolower(trim($email));
            
            $query = "SELECT status, created_at FROM newsletter_emails WHERE email = ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$email]);
            $subscription = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($subscription) {
                Response::success([
                    'subscribed' => $subscription['status'] === 'active',
                    'status' => $subscription['status'],
                    'created_at' => $subscription['created_at']
                ]);
            } else {
                Response::success([
                    'subscribed' => false,
                    'status' => 'not_found'
                ]);
            }
            
        } catch (Exception $e) {
            error_log("NEWSLETTER CHECK ERROR: " . $e->getMessage());
            Response::error('Erro ao verificar inscrição', 500);
        }
    }
    
    public function listSubscriptions() {
        try {
            error_log("NEWSLETTER: Listando inscrições");
            
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
            $offset = ($page - 1) * $limit;
            
            // Contar total de inscrições
            $countQuery = "SELECT COUNT(*) as total FROM newsletter_emails";
            $countStmt = $this->db->prepare($countQuery);
            $countStmt->execute();
            $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Buscar inscrições com paginação
            $query = "SELECT id, email, name, source, status, ip_address, user_agent, created_at, updated_at 
                     FROM newsletter_emails 
                     ORDER BY created_at DESC 
                     LIMIT ? OFFSET ?";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$limit, $offset]);
            $subscriptions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            Response::success([
                'subscriptions' => $subscriptions,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalCount,
                    'pages' => ceil($totalCount / $limit)
                ]
            ], 'Lista de inscrições carregada');
            
        } catch (Exception $e) {
            error_log("NEWSLETTER LIST ERROR: " . $e->getMessage());
            Response::error('Erro ao listar inscrições', 500);
        }
    }
    
    public function getStats() {
        try {
            error_log("NEWSLETTER: Obtendo estatísticas");
            
            $query = "SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
                        SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed
                      FROM newsletter_emails";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            Response::success($stats, 'Estatísticas carregadas');
            
        } catch (Exception $e) {
            error_log("NEWSLETTER STATS ERROR: " . $e->getMessage());
            Response::error('Erro ao obter estatísticas', 500);
        }
    }
}
?>