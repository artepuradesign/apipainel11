
<?php
// config/database.php - DEPRECATED: Use ConnectionPool de conexao.php

require_once __DIR__ . '/conexao.php';

/**
 * Classe Database (DEPRECATED)
 * Mantida apenas para compatibilidade com código legado
 * RECOMENDAÇÃO: Use getDBConnection() diretamente
 */
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    
    public function __construct() {
        // Usar constantes do conexao.php
        $this->host = DB_HOST;
        $this->db_name = DB_NAME;
        $this->username = DB_USER;
        $this->password = DB_PASS;
        
        error_log("DATABASE CLASS: DEPRECATED - Use getDBConnection() para pool de conexões");
    }
    
    /**
     * DEPRECATED: Retorna conexão do pool em vez de criar nova
     */
    public function getConnection() {
        // Usar ConnectionPool em vez de criar nova conexão
        return ConnectionPool::getInstance()->getConnection();
    }
    
    /**
     * DEPRECATED: Não fecha mais a conexão (gerenciada pelo pool)
     */
    public function closeConnection() {
        // Não fazer nada - o pool gerencia o fechamento
        error_log("DATABASE CLASS: closeConnection() ignorado (gerenciado pelo pool)");
    }
}

/**
 * Função helper - DEPRECATED
 * Retorna conexão do pool
 */
function getConnection() {
    return getDBConnection();
}
?>
