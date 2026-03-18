
<?php
// src/models/BankAccount.php

require_once 'BaseModel.php';

class BankAccount extends BaseModel {
    protected $table = 'contas_bancarias';
    
    public $id;
    public $user_id;
    public $banco_codigo;
    public $banco_nome;
    public $agencia;
    public $conta;
    public $conta_digito;
    public $tipo_conta;
    public $titular;
    public $cpf_titular;
    public $status;
    public $verificada;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        parent::__construct($db);
    }
    
    public function getUserBankAccounts($userId) {
        $query = "SELECT * FROM {$this->table} WHERE user_id = ? 
                 ORDER BY created_at DESC";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function getActiveBankAccount($userId) {
        $query = "SELECT * FROM {$this->table} 
                 WHERE user_id = ? AND status = 'ativa' AND verificada = 1
                 LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        return $stmt->fetch();
    }
    
    public function validateBankData($agencia, $conta) {
        // Validação básica de agência e conta
        return preg_match('/^\d{4}$/', $agencia) && preg_match('/^\d{5,8}$/', $conta);
    }
    
    public function getBankByCode($codigo) {
        $bancos = [
            '001' => 'Banco do Brasil',
            '104' => 'Caixa Econômica Federal',
            '341' => 'Itaú',
            '237' => 'Bradesco',
            '033' => 'Santander',
            '260' => 'Nu Pagamentos'
        ];
        
        return $bancos[$codigo] ?? 'Banco não identificado';
    }
}
