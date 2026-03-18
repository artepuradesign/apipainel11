
<?php
// src/controllers/EventController.php

require_once '../models/Event.php';
require_once '../utils/Response.php';
require_once '../middleware/AuthMiddleware.php';

class EventController {
    private $db;
    private $event;
    
    public function __construct($db) {
        $this->db = $db;
        $this->event = new Event($db);
    }
    
    public function getActiveEvents() {
        try {
            $query = "SELECT * FROM eventos WHERE status = 'ativo' AND data_fim >= NOW() ORDER BY data_inicio ASC";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            $events = $stmt->fetchAll();
            
            $eventData = array_map(function($event) {
                $configuracoes = json_decode($event['configuracoes'], true) ?? [];
                
                return [
                    'id' => (int)$event['id'],
                    'title' => $event['titulo'],
                    'description' => $event['descricao'],
                    'type' => $event['tipo'],
                    'status' => $event['status'],
                    'startDate' => $event['data_inicio'],
                    'endDate' => $event['data_fim'],
                    'configuration' => $configuracoes,
                    'createdAt' => $event['created_at']
                ];
            }, $events);
            
            Response::success($eventData);
        } catch (Exception $e) {
            Response::error('Erro ao buscar eventos: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById($id) {
        try {
            $this->event->id = $id;
            if ($this->event->readOne()) {
                $configuracoes = json_decode($this->event->configuracoes, true) ?? [];
                
                $eventData = [
                    'id' => (int)$this->event->id,
                    'title' => $this->event->titulo,
                    'description' => $this->event->descricao,
                    'type' => $this->event->tipo,
                    'status' => $this->event->status,
                    'startDate' => $this->event->data_inicio,
                    'endDate' => $this->event->data_fim,
                    'configuration' => $configuracoes,
                    'createdAt' => $this->event->created_at
                ];
                
                Response::success($eventData);
            } else {
                Response::error('Evento não encontrado', 404);
            }
        } catch (Exception $e) {
            Response::error('Erro ao buscar evento: ' . $e->getMessage(), 500);
        }
    }
    
    public function participateInEvent($id) {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            // Verificar se o evento existe e está ativo
            $eventQuery = "SELECT * FROM eventos WHERE id = ? AND status = 'ativo' AND data_fim >= NOW()";
            $eventStmt = $this->db->prepare($eventQuery);
            $eventStmt->execute([$id]);
            $event = $eventStmt->fetch();
            
            if (!$event) {
                Response::error('Evento não encontrado ou inativo', 404);
            }
            
            // Verificar se já está participando
            $participationQuery = "SELECT * FROM evento_participacoes WHERE evento_id = ? AND user_id = ?";
            $participationStmt = $this->db->prepare($participationQuery);
            $participationStmt->execute([$id, $userId]);
            
            if ($participationStmt->fetch()) {
                Response::error('Você já está participando deste evento', 400);
            }
            
            // Registrar participação
            $insertQuery = "INSERT INTO evento_participacoes (evento_id, user_id) VALUES (?, ?)";
            $insertStmt = $this->db->prepare($insertQuery);
            
            if ($insertStmt->execute([$id, $userId])) {
                Response::success(null, 'Participação registrada com sucesso', 201);
            } else {
                Response::error('Erro ao registrar participação', 400);
            }
        } catch (Exception $e) {
            Response::error('Erro interno do servidor', 500);
        }
    }
    
    public function getMyEvents() {
        $userId = AuthMiddleware::getCurrentUserId();
        
        try {
            $query = "SELECT e.*, ep.created_at as participation_date 
                     FROM eventos e 
                     JOIN evento_participacoes ep ON e.id = ep.evento_id 
                     WHERE ep.user_id = ? 
                     ORDER BY ep.created_at DESC";
            $stmt = $this->db->prepare($query);
            $stmt->execute([$userId]);
            $events = $stmt->fetchAll();
            
            $eventData = array_map(function($event) {
                $configuracoes = json_decode($event['configuracoes'], true) ?? [];
                
                return [
                    'id' => (int)$event['id'],
                    'title' => $event['titulo'],
                    'description' => $event['descricao'],
                    'type' => $event['tipo'],
                    'status' => $event['status'],
                    'startDate' => $event['data_inicio'],
                    'endDate' => $event['data_fim'],
                    'configuration' => $configuracoes,
                    'participationDate' => $event['participation_date']
                ];
            }, $events);
            
            Response::success($eventData);
        } catch (Exception $e) {
            Response::error('Erro ao buscar eventos: ' . $e->getMessage(), 500);
        }
    }
}
