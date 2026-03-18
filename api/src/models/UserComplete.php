
<?php
// src/models/UserComplete.php - Modelo completo para a tabela users

class UserComplete {
    private $conn;
    private $table_name = "users";
    
    // Propriedades da tabela users
    public $id;
    public $username;
    public $email;
    public $password_hash;
    public $full_name;
    public $cpf;
    public $cnpj;
    public $data_nascimento;
    public $telefone;
    public $cep;
    public $endereco;
    public $numero;
    public $bairro;
    public $cidade;
    public $estado;
    public $senhaalfa;
    public $senha4;
    public $senha6;
    public $senha8;
    public $user_role;
    public $status;
    public $tipo_pessoa;
    public $saldo;
    public $saldo_plano;
    public $saldo_atualizado;
    public $tipoplano;
    public $data_inicio;
    public $data_fim;
    public $indicador_id;
    public $codigo_indicacao;
    public $aceite_termos;
    public $email_verificado;
    public $telefone_verificado;
    public $ultimo_login;
    public $tentativas_login;
    public $bloqueado_ate;
    public $password_reset_token;
    public $password_reset_expires;
    public $email_verification_token;
    public $created_at;
    public $updated_at;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Buscar usuário completo por ID
    public function findById($id) {
        $query = "
            SELECT 
                u.*,
                up.avatar_url,
                up.bio,
                up.company,
                up.website,
                up.social_links,
                up.preferences,
                up.timezone,
                up.language,
                up.theme,
                up.two_factor_enabled,
                uw.current_balance,
                uw.available_balance,
                uw.total_deposited,
                uw.total_spent
            FROM " . $this->table_name . " u
            LEFT JOIN user_profiles up ON u.id = up.user_id
            LEFT JOIN user_wallets uw ON u.id = uw.user_id AND uw.wallet_type = 'main'
            WHERE u.id = ?
        ";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Buscar usuário por login ou email
    public function findByLogin($login) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = ? OR email = ? LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $login);
        $stmt->bindParam(2, $login);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    // Atualizar informações básicas (sem CPF e email)
    public function updateBasicInfo($id, $data) {
        $allowedFields = [
            'full_name', 'cnpj', 'data_nascimento', 'telefone', 'cep',
            'endereco', 'numero', 'bairro', 'cidade', 'estado',
            'tipo_pessoa', 'telefone_verificado'
        ];
        
        $updateFields = [];
        $params = [];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updateFields)) {
            return false;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $id;
        
        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute($params);
    }
    
    // Atualizar senhas
    public function updatePasswords($id, $passwords) {
        $updateFields = [];
        $params = [];
        
        if (isset($passwords['senhaalfa'])) {
            $updateFields[] = "senhaalfa = ?, password_hash = ?";
            $params[] = $passwords['senhaalfa'];
            $params[] = password_hash($passwords['senhaalfa'], PASSWORD_DEFAULT);
        }
        
        if (isset($passwords['senha4'])) {
            $updateFields[] = "senha4 = ?";
            $params[] = $passwords['senha4'];
        }
        
        if (isset($passwords['senha6'])) {
            $updateFields[] = "senha6 = ?";
            $params[] = $passwords['senha6'];
        }
        
        if (isset($passwords['senha8'])) {
            $updateFields[] = "senha8 = ?";
            $params[] = $passwords['senha8'];
        }
        
        if (empty($updateFields)) {
            return false;
        }
        
        $updateFields[] = "updated_at = NOW()";
        $params[] = $id;
        
        $query = "UPDATE " . $this->table_name . " SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute($params);
    }
    
    // Atualizar saldo
    public function updateBalance($id, $novoSaldo) {
        $query = "UPDATE " . $this->table_name . " SET saldo = ?, saldo_atualizado = 1, updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$novoSaldo, $id]);
    }
    
    // Verificar se email existe (excluindo um ID específico)
    public function emailExists($email, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = ?";
        $params = [$email];
        
        if ($excludeId) {
            $query .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        return $stmt->rowCount() > 0;
    }
    
    // Verificar se CPF existe (excluindo um ID específico)
    public function cpfExists($cpf, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE cpf = ?";
        $params = [$cpf];
        
        if ($excludeId) {
            $query .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        return $stmt->rowCount() > 0;
    }
    
    // Verificar se CNPJ existe (excluindo um ID específico)
    public function cnpjExists($cnpj, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE cnpj = ?";
        $params = [$cnpj];
        
        if ($excludeId) {
            $query .= " AND id != ?";
            $params[] = $excludeId;
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        
        return $stmt->rowCount() > 0;
    }
    
    // Criar usuário completo
    public function create($userData) {
        $query = "
            INSERT INTO " . $this->table_name . " (
                username, email, password_hash, full_name, cpf, cnpj,
                data_nascimento, telefone, cep, endereco, numero, bairro,
                cidade, estado, senhaalfa, senha4, senha6, senha8,
                user_role, status, tipo_pessoa, saldo, saldo_plano,
                tipoplano, indicador_id, codigo_indicacao, aceite_termos,
                data_inicio, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
            )
        ";
        
        $stmt = $this->conn->prepare($query);
        
        $result = $stmt->execute([
            $userData['username'],
            $userData['email'],
            $userData['password_hash'],
            $userData['full_name'],
            $userData['cpf'] ?? null,
            $userData['cnpj'] ?? null,
            $userData['data_nascimento'] ?? null,
            $userData['telefone'] ?? null,
            $userData['cep'] ?? null,
            $userData['endereco'] ?? null,
            $userData['numero'] ?? null,
            $userData['bairro'] ?? null,
            $userData['cidade'] ?? null,
            $userData['estado'] ?? null,
            $userData['senhaalfa'] ?? null,
            $userData['senha4'] ?? '0000',
            $userData['senha6'] ?? '000000',
            $userData['senha8'] ?? '00000000',
            $userData['user_role'] ?? 'assinante',
            $userData['status'] ?? 'ativo',
            $userData['tipo_pessoa'] ?? 'fisica',
            $userData['saldo'] ?? 0.00,
            $userData['saldo_plano'] ?? 0.00,
            $userData['tipoplano'] ?? 'Pré-Pago',
            $userData['indicador_id'] ?? null,
            $userData['codigo_indicacao'] ?? null,
            $userData['aceite_termos'] ?? 0,
            $userData['data_inicio'] ?? null
        ]);
        
        if ($result) {
            return $this->conn->lastInsertId();
        }
        
        return false;
    }
    
    // Atualizar último login
    public function updateLastLogin($id) {
        $query = "UPDATE " . $this->table_name . " SET ultimo_login = NOW(), updated_at = NOW() WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        
        return $stmt->execute([$id]);
    }
}
