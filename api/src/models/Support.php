
<?php
// src/models/Support.php

require_once 'BaseModel.php';

class Support extends BaseModel {
    protected $table = 'tickets_suporte';
    
    public $id;
    public $user_id;
    public $assunto;
    public $categoria;
    public $prioridade;
    public $status;
    public $mensagem;
    public $resposta;
    public $respondido_por;
    public $respondido_em;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserTickets($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function getOpenTickets() {
        $query = "SELECT t.*, u.full_name, u.email 
                 FROM {$this->table} t
                 JOIN usuarios u ON t.user_id = u.id
                 WHERE t.status IN ('aberto', 'em_andamento')
                 ORDER BY t.prioridade DESC, t.created_at ASC";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll();
    }
    
    public function assignTicket($ticketId, $supportUserId) {
        $query = "UPDATE {$this->table} SET respondido_por = ?, status = 'em_andamento' 
                 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        return $stmt->execute([$supportUserId, $ticketId]);
    }
}
