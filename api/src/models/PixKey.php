
<?php
// src/models/PixKey.php

require_once 'BaseModel.php';

class PixKey extends BaseModel {
    protected $table = 'chaves_pix';
    
    public $id;
    public $user_id;
    public $tipo;
    public $chave;
    public $banco;
    public $agencia;
    public $conta;
    public $titular;
    public $cpf_titular;
    public $status;
    public $verificada;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserPixKeys($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function getActivePixKey($userId) {
        $query = "SELECT * FROM {$this->table} 
                 WHERE user_id = ? AND status = 'ativa' AND verificada = 1
                 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
    
    public function validatePixKey($chave, $tipo) {
        switch ($tipo) {
            case 'cpf':
                return preg_match('/^\d{11}$/', $chave);
            case 'cnpj':
                return preg_match('/^\d{14}$/', $chave);
            case 'email':
                return filter_var($chave, FILTER_VALIDATE_EMAIL);
            case 'telefone':
                return preg_match('/^\+55\d{10,11}$/', $chave);
            case 'aleatoria':
                return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $chave);
            default:
                return false;
        }
    }
}
