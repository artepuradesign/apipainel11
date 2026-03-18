
<?php
// src/controllers/SupportController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../models/SupportTicket.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class SupportController {
    private $db;
    private $ticketModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->ticketModel = new SupportTicket($db);
    }
    
    public function getTickets() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $tickets = $this->ticketModel->getByUser($userId);
            
            // Formatar os tickets para o frontend
            $formattedTickets = [];
            if ($tickets) {
                foreach ($tickets as $ticket) {
                    $formattedTickets[] = [
                        'id' => (int)$ticket['id'],
                        'ticket_number' => $ticket['ticket_number'],
                        'subject' => $ticket['subject'],
                        'description' => $ticket['description'],
                        'category' => $ticket['category'],
                        'priority' => $ticket['priority'],
                        'status' => $ticket['status'],
                        'resolution' => $ticket['resolution'],
                        'satisfaction_rating' => $ticket['satisfaction_rating'],
                        'satisfaction_comment' => $ticket['satisfaction_comment'],
                        'created_at' => $ticket['created_at'],
                        'updated_at' => $ticket['updated_at'],
                        'resolved_at' => $ticket['resolved_at']
                    ];
                }
            }
            
            Response::success($formattedTickets, 'Tickets carregados com sucesso');
            
        } catch (Exception $e) {
            error_log("SUPPORT_CONTROLLER ERROR: " . $e->getMessage());
            Response::error('Erro ao buscar tickets: ' . $e->getMessage(), 500);
        }
    }
    
    public function getTicket($id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $ticket = $this->ticketModel->getById($id);
            
            if (!$ticket || $ticket['user_id'] != $userId) {
                Response::error('Ticket não encontrado', 404);
                return;
            }
            
            $formattedTicket = [
                'id' => (int)$ticket['id'],
                'ticket_number' => $ticket['ticket_number'],
                'subject' => $ticket['subject'],
                'description' => $ticket['description'],
                'category' => $ticket['category'],
                'priority' => $ticket['priority'],
                'status' => $ticket['status'],
                'resolution' => $ticket['resolution'],
                'satisfaction_rating' => $ticket['satisfaction_rating'],
                'satisfaction_comment' => $ticket['satisfaction_comment'],
                'created_at' => $ticket['created_at'],
                'updated_at' => $ticket['updated_at'],
                'resolved_at' => $ticket['resolved_at']
            ];
            
            Response::success($formattedTicket);
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar ticket: ' . $e->getMessage(), 500);
        }
    }
    
    public function createTicket() {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            
            $required = ['subject', 'description'];
            foreach ($required as $field) {
                if (!isset($data[$field]) || empty($data[$field])) {
                    Response::error("Campo '{$field}' é obrigatório", 400);
                    return;
                }
            }
            
            // Mapear categorias e prioridades para o formato da tabela
            $category = isset($data['category']) ? $data['category'] : 'geral';
            if ($category === 'other') $category = 'geral';
            
            $priority = isset($data['priority']) ? $data['priority'] : 'media';
            if ($priority === 'normal') $priority = 'media';
            
            // Gerar número único do ticket
            $ticketNumber = $this->ticketModel->generateTicketNumber();
            
            // Criar o ticket
            $ticketData = [
                'user_id' => $userId,
                'ticket_number' => $ticketNumber,
                'subject' => $data['subject'],
                'description' => $data['description'],
                'category' => $category,
                'priority' => $priority,
                'status' => 'aberto'
            ];
            
            $ticketId = $this->ticketModel->create($ticketData);
            
            if ($ticketId) {
                Response::success(['id' => $ticketId, 'ticket_number' => $ticketNumber], 'Ticket criado com sucesso', 201);
            } else {
                Response::error('Erro ao criar ticket no banco de dados', 500);
            }
            
        } catch (Exception $e) {
            error_log("SUPPORT_CONTROLLER CREATE ERROR: " . $e->getMessage());
            Response::error('Erro ao criar ticket: ' . $e->getMessage(), 500);
        }
    }
    
    public function updateTicket($id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $data = json_decode(file_get_contents("php://input"), true);
            
            $ticket = $this->ticketModel->getById($id);
            if (!$ticket || $ticket['user_id'] != $userId) {
                Response::error('Ticket não encontrado', 404);
                return;
            }
            
            $updateData = [];
            $allowedFields = ['satisfaction_rating', 'satisfaction_comment'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updateData[$field] = $data[$field];
                }
            }
            
            if (empty($updateData)) {
                Response::error('Nenhum dado válido para atualização', 400);
                return;
            }
            
            $result = $this->ticketModel->update($id, $updateData);
            
            if ($result) {
                Response::success(null, 'Ticket atualizado com sucesso');
            } else {
                Response::error('Erro ao atualizar ticket', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar ticket: ' . $e->getMessage(), 500);
        }
    }
    
    public function getTicketMessages($id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $ticket = $this->ticketModel->getById($id);
            
            if (!$ticket || $ticket['user_id'] != $userId) {
                Response::error('Ticket não encontrado', 404);
                return;
            }
            
            // Por enquanto retornamos array vazio, pois ainda não implementamos o sistema de mensagens
            Response::success([], 'Mensagens do ticket obtidas com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao buscar mensagens: ' . $e->getMessage(), 500);
        }
    }
    
    public function addMessage($id) {
        try {
            $userId = AuthMiddleware::getCurrentUserId();
            if (!$userId) {
                Response::error('Usuário não autenticado', 401);
                return;
            }
            
            $ticket = $this->ticketModel->getById($id);
            
            if (!$ticket || $ticket['user_id'] != $userId) {
                Response::error('Ticket não encontrado', 404);
                return;
            }
            
            // Por enquanto só retornamos sucesso, pois ainda não implementamos o sistema de mensagens
            Response::success(null, 'Mensagem adicionada com sucesso');
            
        } catch (Exception $e) {
            Response::error('Erro ao adicionar mensagem: ' . $e->getMessage(), 500);
        }
    }
}