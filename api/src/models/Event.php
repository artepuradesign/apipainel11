
<?php
// src/models/Event.php

require_once 'BaseModel.php';

class Event extends BaseModel {
    protected $table = 'eventos';
    
    public $id;
    public $titulo;
    public $descricao;
    public $tipo;
    public $data_inicio;
    public $data_fim;
    public $ativo;
    public $configuracoes;
    public $participantes;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getActiveEvents() {
        $query = "SELECT * FROM {$this->table} 
                 WHERE ativo = 1 
                 AND (data_fim IS NULL OR data_fim >= NOW())
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function getUserEvents($userId) {
        $query = "SELECT e.* FROM {$this->table} e
                 JOIN event_participants ep ON e.id = ep.event_id
                 WHERE ep.user_id = ? AND e.ativo = 1
                 ORDER BY e.created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function addParticipant($eventId, $userId) {
        $query = "INSERT INTO event_participants (event_id, user_id, joined_at) 
                 VALUES (?, ?, NOW())
                 ON DUPLICATE KEY UPDATE joined_at = NOW()";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$eventId, $userId]);
    }
    
    public function getParticipantsCount($eventId) {
        $query = "SELECT COUNT(*) as total FROM event_participants WHERE event_id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$eventId]);
        return $stmt->fetch()['total'];
    }
}
