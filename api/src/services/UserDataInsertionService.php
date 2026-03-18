
<?php
// src/services/UserDataInsertionService.php

class UserDataInsertionService {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function insertCompleteUserData($userId, $data, $indicadorId = null, $codigoIndicacao = null) {
        try {
            error_log("USER_DATA_INSERTION: Iniciando inserção de dados completos para usuário ID: " . $userId);
            
            // Verificar se usuário já existe na tabela users
            $checkQuery = "SELECT id FROM users WHERE id = ?";
            $checkStmt = $this->db->prepare($checkQuery);
            $checkStmt->execute([$userId]);
            
            if ($checkStmt->rowCount() === 0) {
                error_log("USER_DATA_INSERTION ERROR: Usuário ID {$userId} não encontrado na tabela users");
                throw new Exception("Usuário não encontrado para inserção de dados completos");
            }
            
            // Atualizar dados completos do usuário (todos os campos possíveis)
            $updateQuery = "UPDATE users SET 
                email_verificado = ?,
                telefone_verificado = ?,
                aceite_termos = ?,
                saldo = ?,
                saldo_plano = ?,
                saldo_atualizado = ?,
                tipoplano = ?,
                data_inicio = ?,
                data_fim = ?,
                indicador_id = ?,
                status = ?,
                tipo_pessoa = ?,
                tentativas_login = ?,
                bloqueado_ate = NULL,
                password_reset_token = NULL,
                password_reset_expires = NULL,
                email_verification_token = NULL,
                updated_at = NOW()
            WHERE id = ?";
            
            $updateStmt = $this->db->prepare($updateQuery);
            $result = $updateStmt->execute([
                0, // email_verificado - inicialmente não verificado
                0, // telefone_verificado - inicialmente não verificado
                isset($data['aceite_termos']) ? ($data['aceite_termos'] ? 1 : 0) : 1, // aceite_termos
                0.00, // saldo inicial
                0.00, // saldo_plano inicial
                0, // saldo_atualizado
                'Pré-Pago', // tipoplano padrão para novos usuários
                date('Y-m-d'), // data_inicio
                null, // data_fim (NULL para plano pré-pago)
                $indicadorId, // indicador_id se fornecido
                'ativo', // status padrão para novos usuários
                isset($data['tipo_pessoa']) ? $data['tipo_pessoa'] : 'fisica', // tipo_pessoa
                0, // tentativas_login inicial
                $userId // WHERE id = ?
            ]);
            
            if (!$result) {
                throw new Exception("Falha ao atualizar dados completos do usuário");
            }
            
            error_log("USER_DATA_INSERTION SUCCESS: Dados completos inseridos para usuário ID: " . $userId);
            error_log("USER_DATA_INSERTION: - Status: ativo");
            error_log("USER_DATA_INSERTION: - Tipo pessoa: " . (isset($data['tipo_pessoa']) ? $data['tipo_pessoa'] : 'fisica'));
            error_log("USER_DATA_INSERTION: - Saldo inicial: 0.00");
            error_log("USER_DATA_INSERTION: - Plano inicial: Pré-Pago");
            error_log("USER_DATA_INSERTION: - Data início: " . date('Y-m-d'));
            error_log("USER_DATA_INSERTION: - Indicador ID: " . ($indicadorId ?: 'nenhum'));
            error_log("USER_DATA_INSERTION: - Email verificado: não");
            error_log("USER_DATA_INSERTION: - Telefone verificado: não");
            error_log("USER_DATA_INSERTION: - Aceite termos: " . (isset($data['aceite_termos']) ? ($data['aceite_termos'] ? 'sim' : 'não') : 'sim'));
            
        } catch (Exception $e) {
            error_log("USER_DATA_INSERTION ERROR: " . $e->getMessage());
            throw $e;
        }
    }
}
