
<?php
// config/conexao.php - Configurações centralizadas com Pool de Conexões

// API Configuration
// Importa a configuração da API do arquivo api.php
$apiConfigPath = __DIR__ . '/api.php';
if (file_exists($apiConfigPath)) {
    require_once $apiConfigPath;
} else {
    // Fallback caso o arquivo api.php não exista ainda
    define('API_URL', 'https://api.apipainel.com.br');
}

define('API_KEY', 'bG92YWJsZS5kZXY=');
define('API_KEY_EXPIRATION', 3600);

// Database Configuration
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'database');
define('DB_USER', 'usuarioapipainel');
define('DB_PASS', 'Acerola@2026');
define('DB_PORT', '3306');
define('DB_CHARSET', 'utf8mb4');

// App Configuration
define('APP_ENV', 'development');
define('APP_DEBUG', true);
define('APP_URL', API_URL); // Usa a mesma URL definida em api.php

// JWT Configuration
define('JWT_SECRET', 'artepura-jwt-secret-key-2025');
define('JWT_EXPIRATION', 3600);

// Session Configuration
define('SESSION_TIMEOUT', 86400); // 24 horas
define('SESSION_COOKIE_NAME', 'artepura_session');

// Upload Configuration
define('MAX_FILE_SIZE', 5242880); // 5MB
define('UPLOAD_PATH', '/uploads/');

// Pagination Configuration
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

/**
 * Connection Pool Singleton - Gerenciador de Conexões com Banco de Dados
 * Implementa pool de conexões para reutilizar conexões e reduzir o overhead
 */
class ConnectionPool {
    private static $instance = null;
    private $connection = null;
    private $connectionCount = 0;
    
    private function __construct() {
        // Construtor privado para Singleton
    }
    
    /**
     * Obtém instância única do ConnectionPool
     */
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
            // Registrar fechamento automático ao final do script
            register_shutdown_function([self::$instance, 'closeConnection']);
        }
        return self::$instance;
    }
    
    /**
     * Obtém conexão reutilizável com o banco de dados
     * Retorna sempre a mesma conexão (singleton)
     */
    public function getConnection() {
        if ($this->connection === null) {
            $this->createConnection();
        }
        
        // Verificar se a conexão ainda está ativa
        try {
            $this->connection->query('SELECT 1');
        } catch (PDOException $e) {
            error_log("CONNECTION_POOL: Conexão perdida, reconectando...");
            $this->createConnection();
        }
        
        return $this->connection;
    }
    
    /**
     * Cria nova conexão com o banco de dados
     */
    private function createConnection() {
        try {
            // Definir timezone do PHP para Brasília
            date_default_timezone_set('America/Sao_Paulo');
            
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
            
            // ATENÇÃO: Conexões persistentes HABILITADAS para reduzir overhead
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true, // HABILITAR conexões persistentes
                PDO::ATTR_TIMEOUT => 15, // Reduzir timeout para 15 segundos
                PDO::MYSQL_ATTR_USE_BUFFERED_QUERY => true,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . DB_CHARSET
            ];

            $this->connection = new PDO($dsn, DB_USER, DB_PASS, $options);
            
            // Definir timezone do MySQL para Brasília
            $this->connection->exec("SET time_zone = '-03:00'");
            $this->connection->exec("SET sql_mode = 'TRADITIONAL'");
            $this->connection->exec("SET SESSION wait_timeout = 300"); // 5 minutos
            
            $this->connectionCount++;
            error_log("CONNECTION_POOL: Conexão #" . $this->connectionCount . " estabelecida (PERSISTENT MODE)");
            
        } catch(PDOException $e) {
            error_log("CONNECTION_POOL ERROR: " . $e->getMessage());
            throw new Exception("Erro na conexão com o banco de dados: " . $e->getMessage());
        }
    }
    
    /**
     * Fecha a conexão com o banco de dados
     */
    public function closeConnection() {
        if ($this->connection !== null) {
            $this->connection = null;
            error_log("CONNECTION_POOL: Conexão fechada automaticamente");
        }
    }
    
    /**
     * Invalidar todas as sessões do usuário no logout
     * Isso não fecha a conexão do pool, apenas limpa os dados da sessão
     */
    public function invalidateUserSessions($userId) {
        try {
            if ($this->connection === null) {
                $this->createConnection();
            }
            
            $query = "UPDATE user_sessions SET status = 'revoked', updated_at = NOW() WHERE user_id = ? AND status = 'active'";
            $stmt = $this->connection->prepare($query);
            $stmt->execute([$userId]);
            $affected = $stmt->rowCount();
            
            error_log("CONNECTION_POOL: {$affected} sessões invalidadas para user_id: {$userId}");
            return $affected;
            
        } catch (Exception $e) {
            error_log("CONNECTION_POOL: Erro ao invalidar sessões: " . $e->getMessage());
            return 0;
        }
    }
    
    /**
     * Prevenir clonagem do Singleton
     */
    private function __clone() {}
    
    /**
     * Prevenir deserialização do Singleton
     */
    public function __wakeup() {
        throw new Exception("Cannot unserialize singleton");
    }
}

/**
 * Função helper para obter conexão do pool
 * Mantém compatibilidade com código existente
 */
function getDBConnection() {
    return ConnectionPool::getInstance()->getConnection();
}

error_log("CONEXAO: Configurações carregadas com sucesso - Pool de Conexões ativado");

// ==================== TELEGRAM CONFIGURATION ====================
// Telegram API Configuration (obtido em https://my.telegram.org/apps)
define('TELEGRAM_API_ID', '25531373');
define('TELEGRAM_API_HASH', 'b4351e2d05023dbc2b0929e17f721525');
define('TELEGRAM_TARGET_GROUP', '-1002478842533'); // Nome ou ID do grupo

// Railway Integration Configuration
define('RAILWAY_CPF_WEBHOOK_URL', 'https://cpf-telegram-production.up.railway.app/cpf');
define('RAILWAY_TIMEOUT', 60); // Timeout em segundos para aguardar resposta

error_log("RAILWAY_CONFIG: Configurações Railway carregadas");
?>
