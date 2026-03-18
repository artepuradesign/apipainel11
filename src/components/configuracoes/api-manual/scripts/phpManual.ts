
export const generatePHPManual = () => {
  return `# Manual Completo de Implementação PHP/MySQL - Sistema APD
# Versão: 3.0 - Atualizado para 2024
# Desenvolvido por: Arte Pura Design (APD)
# Website: https://artepuradesign.com.br

## ESTRUTURA DE ARQUIVOS RECOMENDADA

projeto_apd/
├── config/
│   ├── database.php
│   ├── config.php
│   ├── cors.php
│   └── jwt.php
├── includes/
│   ├── auth.php
│   ├── functions.php
│   ├── validation.php
│   └── rate_limiter.php
├── api/
│   ├── v2/
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── register.php
│   │   │   ├── refresh.php
│   │   │   └── logout.php
│   │   ├── user/
│   │   │   ├── profile.php
│   │   │   ├── balance.php
│   │   │   ├── history.php
│   │   │   └── notifications.php
│   │   ├── consultation/
│   │   │   ├── cpf.php
│   │   │   ├── cnpj.php
│   │   │   ├── vehicle.php
│   │   │   └── batch.php
│   │   ├── billing/
│   │   │   ├── payments.php
│   │   │   ├── plans.php
│   │   │   └── invoices.php
│   │   └── admin/
│   │       ├── users.php
│   │       ├── stats.php
│   │       └── settings.php
├── classes/
│   ├── Database.php
│   ├── User.php
│   ├── Consultation.php
│   ├── Payment.php
│   ├── JWT.php
│   └── RateLimiter.php
├── middleware/
│   ├── auth.php
│   ├── admin.php
│   └── rate_limit.php
├── utils/
│   ├── response.php
│   ├── logger.php
│   └── helpers.php
└── index.php

## 1. CONFIGURAÇÃO DO BANCO DE DADOS (config/database.php)

<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;
    private $options;

    public function __construct() {
        // Configurações podem vir de variáveis de ambiente
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->db_name = $_ENV['DB_NAME'] ?? 'sistema_consultas_apd';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
        
        $this->options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
    }

    public function getConnection() {
        $this->conn = null;
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4";
            $this->conn = new PDO($dsn, $this->username, $this->password, $this->options);
        } catch(PDOException $exception) {
            error_log("Database connection error: " . $exception->getMessage());
            throw new Exception("Erro na conexão com o banco de dados", 500);
        }
        return $this->conn;
    }

    public function beginTransaction() {
        return $this->conn->beginTransaction();
    }

    public function commit() {
        return $this->conn->commit();
    }

    public function rollback() {
        return $this->conn->rollback();
    }

    public function lastInsertId() {
        return $this->conn->lastInsertId();
    }
}
?>

## 2. CONFIGURAÇÕES GERAIS (config/config.php)

<?php
// Configurações de ambiente
define('ENV', $_ENV['ENVIRONMENT'] ?? 'development');
define('DEBUG', ENV === 'development');

// Configurações da API
define('API_VERSION', 'v2');
define('API_BASE_URL', $_ENV['API_BASE_URL'] ?? 'https://api.artepuradesign.com.br/');

// Configurações JWT
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'sua_chave_secreta_muito_forte_aqui_2024');
define('JWT_EXPIRATION', (int)($_ENV['JWT_EXPIRATION'] ?? 3600)); // 1 hora
define('JWT_REFRESH_EXPIRATION', (int)($_ENV['JWT_REFRESH_EXPIRATION'] ?? 2592000)); // 30 dias

// Configurações de segurança
define('BCRYPT_COST', (int)($_ENV['BCRYPT_COST'] ?? 12));
define('MAX_LOGIN_ATTEMPTS', (int)($_ENV['MAX_LOGIN_ATTEMPTS'] ?? 5));
define('LOGIN_LOCKOUT_TIME', (int)($_ENV['LOGIN_LOCKOUT_TIME'] ?? 900)); // 15 minutos

// Configurações de rate limiting
define('RATE_LIMIT_REQUESTS', (int)($_ENV['RATE_LIMIT_REQUESTS'] ?? 120));
define('RATE_LIMIT_WINDOW', (int)($_ENV['RATE_LIMIT_WINDOW'] ?? 60)); // 1 minuto

// Configurações de upload
define('MAX_UPLOAD_SIZE', (int)($_ENV['MAX_UPLOAD_SIZE'] ?? 5242880)); // 5MB
define('ALLOWED_FILE_TYPES', ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']);

// Configurações de email
define('SMTP_HOST', $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com');
define('SMTP_PORT', (int)($_ENV['SMTP_PORT'] ?? 587));
define('SMTP_USER', $_ENV['SMTP_USER'] ?? '');
define('SMTP_PASS', $_ENV['SMTP_PASS'] ?? '');

// Configurações de pagamento
define('STRIPE_PUBLIC_KEY', $_ENV['STRIPE_PUBLIC_KEY'] ?? '');
define('STRIPE_SECRET_KEY', $_ENV['STRIPE_SECRET_KEY'] ?? '');
define('PIX_WEBHOOK_SECRET', $_ENV['PIX_WEBHOOK_SECRET'] ?? '');

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Error reporting baseado no ambiente
if (DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
}
?>

## 3. CLASSE DE RESPOSTA PADRONIZADA (utils/response.php)

<?php
class ApiResponse {
    public static function success($data = null, $message = '', $statusCode = 200) {
        http_response_code($statusCode);
        
        $response = [
            'success' => true,
            'timestamp' => date('Y-m-d H:i:s'),
            'status_code' => $statusCode
        ];
        
        if (!empty($message)) {
            $response['message'] = $message;
        }
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    public static function error($message, $statusCode = 400, $errors = null, $errorCode = null) {
        http_response_code($statusCode);
        
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'status_code' => $statusCode
        ];
        
        if ($errorCode) {
            $response['error_code'] = $errorCode;
        }
        
        if ($errors) {
            $response['errors'] = $errors;
        }
        
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit();
    }
    
    public static function unauthorized($message = 'Token inválido ou expirado') {
        self::error($message, 401, null, 'UNAUTHORIZED');
    }
    
    public static function forbidden($message = 'Acesso negado') {
        self::error($message, 403, null, 'FORBIDDEN');
    }
    
    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404, null, 'NOT_FOUND');
    }
    
    public static function validation($errors, $message = 'Dados inválidos') {
        self::error($message, 422, $errors, 'VALIDATION_ERROR');
    }
    
    public static function serverError($message = 'Erro interno do servidor') {
        self::error($message, 500, null, 'INTERNAL_ERROR');
    }
}
?>

## 4. CLASSE JWT ATUALIZADA (classes/JWT.php)

<?php
require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

class JWTHandler {
    private $secret;
    private $algorithm = 'HS256';
    
    public function __construct() {
        $this->secret = JWT_SECRET;
    }
    
    public function generateToken($userId, $userRole = 'assinante', $type = 'access') {
        $issuedAt = time();
        $expirationTime = $issuedAt + ($type === 'refresh' ? JWT_REFRESH_EXPIRATION : JWT_EXPIRATION);
        
        $payload = [
            'iss' => API_BASE_URL,
            'aud' => API_BASE_URL,
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'user_id' => $userId,
            'role' => $userRole,
            'type' => $type,
            'jti' => uniqid('jwt_', true)
        ];
        
        return JWT::encode($payload, $this->secret, $this->algorithm);
    }
    
    public function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, $this->algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            throw new Exception('Token inválido: ' . $e->getMessage());
        }
    }
    
    public function refreshToken($refreshToken) {
        try {
            $decoded = $this->validateToken($refreshToken);
            
            if ($decoded['type'] !== 'refresh') {
                throw new Exception('Token de refresh inválido');
            }
            
            // Gerar novos tokens
            $accessToken = $this->generateToken($decoded['user_id'], $decoded['role'], 'access');
            $newRefreshToken = $this->generateToken($decoded['user_id'], $decoded['role'], 'refresh');
            
            return [
                'access_token' => $accessToken,
                'refresh_token' => $newRefreshToken,
                'expires_in' => JWT_EXPIRATION
            ];
        } catch (Exception $e) {
            throw new Exception('Erro ao renovar token: ' . $e->getMessage());
        }
    }
    
    public function getUserFromToken($token) {
        $decoded = $this->validateToken($token);
        return [
            'user_id' => $decoded['user_id'],
            'role' => $decoded['role']
        ];
    }
}
?>

## 5. MIDDLEWARE DE AUTENTICAÇÃO (middleware/auth.php)

<?php
require_once __DIR__ . '/../classes/JWT.php';
require_once __DIR__ . '/../utils/response.php';

class AuthMiddleware {
    private $jwt;
    private $db;
    
    public function __construct($database) {
        $this->jwt = new JWTHandler();
        $this->db = $database;
    }
    
    public function authenticate($requiredRole = null) {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (empty($authHeader) || !preg_match('/Bearer\\s+(\\S+)/', $authHeader, $matches)) {
            ApiResponse::unauthorized('Token de autorização necessário');
        }
        
        $token = $matches[1];
        
        try {
            $userData = $this->jwt->getUserFromToken($token);
            
            // Verificar se o usuário ainda existe e está ativo
            $stmt = $this->db->prepare("
                SELECT id, login, email, full_name, user_role, status, saldo, tipoplano 
                FROM users 
                WHERE id = :user_id AND status = 'ativo'
            ");
            $stmt->execute(['user_id' => $userData['user_id']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                ApiResponse::unauthorized('Usuário não encontrado ou inativo');
            }
            
            // Verificar role se necessário
            if ($requiredRole && $user['user_role'] !== $requiredRole && $user['user_role'] !== 'admin') {
                ApiResponse::forbidden('Permissões insuficientes');
            }
            
            // Salvar dados do usuário na sessão global
            $GLOBALS['current_user'] = $user;
            
            return $user;
        } catch (Exception $e) {
            ApiResponse::unauthorized($e->getMessage());
        }
    }
    
    public function getCurrentUser() {
        return $GLOBALS['current_user'] ?? null;
    }
}
?>

## 6. RATE LIMITER (classes/RateLimiter.php)

<?php
class RateLimiter {
    private $db;
    private $redis; // Opcional: usar Redis para melhor performance
    
    public function __construct($database, $redis = null) {
        $this->db = $database;
        $this->redis = $redis;
    }
    
    public function checkRateLimit($identifier, $maxRequests = RATE_LIMIT_REQUESTS, $window = RATE_LIMIT_WINDOW) {
        $key = "rate_limit:" . $identifier;
        $now = time();
        $windowStart = $now - $window;
        
        if ($this->redis) {
            return $this->checkRateLimitRedis($key, $maxRequests, $window, $now);
        } else {
            return $this->checkRateLimitDatabase($identifier, $maxRequests, $windowStart, $now);
        }
    }
    
    private function checkRateLimitDatabase($identifier, $maxRequests, $windowStart, $now) {
        try {
            // Limpar registros antigos
            $stmt = $this->db->prepare("
                DELETE FROM rate_limits 
                WHERE identifier = :identifier AND created_at < :window_start
            ");
            $stmt->execute([
                'identifier' => $identifier,
                'window_start' => date('Y-m-d H:i:s', $windowStart)
            ]);
            
            // Contar requisições na janela atual
            $stmt = $this->db->prepare("
                SELECT COUNT(*) as request_count 
                FROM rate_limits 
                WHERE identifier = :identifier
            ");
            $stmt->execute(['identifier' => $identifier]);
            $result = $stmt->fetch();
            
            $currentRequests = $result['request_count'] ?? 0;
            
            if ($currentRequests >= $maxRequests) {
                return false;
            }
            
            // Registrar nova requisição
            $stmt = $this->db->prepare("
                INSERT INTO rate_limits (identifier, created_at) 
                VALUES (:identifier, :created_at)
            ");
            $stmt->execute([
                'identifier' => $identifier,
                'created_at' => date('Y-m-d H:i:s', $now)
            ]);
            
            return true;
        } catch (Exception $e) {
            error_log("Rate limiter error: " . $e->getMessage());
            return true; // Em caso de erro, permitir a requisição
        }
    }
    
    private function checkRateLimitRedis($key, $maxRequests, $window, $now) {
        $current = $this->redis->get($key);
        
        if ($current === false) {
            $this->redis->setex($key, $window, 1);
            return true;
        }
        
        if ($current >= $maxRequests) {
            return false;
        }
        
        $this->redis->incr($key);
        return true;
    }
}

// Criar tabela para rate limiting se usar banco de dados
/*
CREATE TABLE IF NOT EXISTS rate_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    identifier VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_identifier_created (identifier, created_at)
);
*/
?>

## 7. ENDPOINT DE LOGIN ATUALIZADO (api/v2/auth/login.php)

<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../classes/JWT.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../classes/RateLimiter.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ApiResponse::error('Método não permitido', 405);
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $jwt = new JWTHandler();
    $rateLimiter = new RateLimiter($db);
    
    // Rate limiting por IP
    $clientIp = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    if (!$rateLimiter->checkRateLimit("login_" . $clientIp, 10, 300)) { // 10 tentativas por 5 minutos
        ApiResponse::error('Muitas tentativas de login. Tente novamente em alguns minutos.', 429);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['login']) || !isset($input['password'])) {
        ApiResponse::validation(['login' => 'Login é obrigatório', 'password' => 'Senha é obrigatória']);
    }
    
    $login = trim($input['login']);
    $password = $input['password'];
    
    // Verificar tentativas de login
    $stmt = $db->prepare("
        SELECT COUNT(*) as attempts 
        FROM access_logs 
        WHERE ip_address = :ip 
        AND action = 'login_failed' 
        AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    ");
    $stmt->execute(['ip' => $clientIp]);
    $attempts = $stmt->fetch()['attempts'];
    
    if ($attempts >= MAX_LOGIN_ATTEMPTS) {
        ApiResponse::error('Conta temporariamente bloqueada devido a muitas tentativas incorretas', 423);
    }
    
    // Buscar usuário
    $stmt = $db->prepare("
        SELECT id, login, email, password_hash, full_name, user_role, status, saldo, tipoplano,
               two_factor_enabled, two_factor_secret
        FROM users 
        WHERE (login = :login OR email = :login)
    ");
    $stmt->execute(['login' => $login]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($password, $user['password_hash'])) {
        // Log da tentativa falhada
        $stmt = $db->prepare("
            INSERT INTO access_logs (user_id, ip_address, action, success, details) 
            VALUES (:user_id, :ip, 'login_failed', FALSE, :details)
        ");
        $stmt->execute([
            'user_id' => $user['id'] ?? null,
            'ip' => $clientIp,
            'details' => json_encode(['login_attempted' => $login])
        ]);
        
        ApiResponse::error('Credenciais inválidas', 401);
    }
    
    if ($user['status'] !== 'ativo') {
        ApiResponse::error('Conta inativa. Entre em contato com o suporte.', 403);
    }
    
    // Verificar 2FA se habilitado
    if ($user['two_factor_enabled'] && isset($input['two_factor_code'])) {
        // Implementar verificação 2FA aqui
        // require_once 'path/to/google-authenticator.php';
        // $ga = new PHPGangsta_GoogleAuthenticator();
        // $checkResult = $ga->verifyCode($user['two_factor_secret'], $input['two_factor_code'], 2);
        
        // if (!$checkResult) {
        //     ApiResponse::error('Código de autenticação inválido', 401);
        // }
    }
    
    // Gerar tokens
    $accessToken = $jwt->generateToken($user['id'], $user['user_role'], 'access');
    $refreshToken = $jwt->generateToken($user['id'], $user['user_role'], 'refresh');
    
    // Salvar refresh token no banco
    $stmt = $db->prepare("
        INSERT INTO auth_tokens (user_id, token_hash, token_type, expires_at, ip_address, user_agent) 
        VALUES (:user_id, :token_hash, 'refresh', :expires_at, :ip, :user_agent)
    ");
    $stmt->execute([
        'user_id' => $user['id'],
        'token_hash' => hash('sha256', $refreshToken),
        'expires_at' => date('Y-m-d H:i:s', time() + JWT_REFRESH_EXPIRATION),
        'ip' => $clientIp,
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    // Atualizar último login
    $stmt = $db->prepare("UPDATE users SET ultimo_login = NOW() WHERE id = :id");
    $stmt->execute(['id' => $user['id']]);
    
    // Log do login bem-sucedido
    $stmt = $db->prepare("
        INSERT INTO access_logs (user_id, ip_address, action, success, details) 
        VALUES (:user_id, :ip, 'login_success', TRUE, :details)
    ");
    $stmt->execute([
        'user_id' => $user['id'],
        'ip' => $clientIp,
        'details' => json_encode(['user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''])
    ]);
    
    // Remover dados sensíveis
    unset($user['password_hash'], $user['two_factor_secret']);
    
    ApiResponse::success([
        'access_token' => $accessToken,
        'refresh_token' => $refreshToken,
        'expires_in' => JWT_EXPIRATION,
        'token_type' => 'Bearer',
        'user' => $user
    ], 'Login realizado com sucesso');
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    ApiResponse::serverError('Erro interno do servidor');
}
?>

## 8. ENDPOINT DE CONSULTA CPF (api/v2/consultation/cpf.php)

<?php
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../middleware/auth.php';
require_once __DIR__ . '/../../../utils/response.php';
require_once __DIR__ . '/../../../classes/RateLimiter.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $auth = new AuthMiddleware($db);
    $rateLimiter = new RateLimiter($db);
    
    // Autenticar usuário
    $user = $auth->authenticate();
    
    // Rate limiting por usuário
    if (!$rateLimiter->checkRateLimit("cpf_" . $user['id'], 60, 60)) {
        ApiResponse::error('Limite de consultas excedido. Tente novamente em alguns instantes.', 429);
    }
    
    $cpf = '';
    $tier = 'basic'; // basic, complete, premium
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $pathInfo = $_SERVER['PATH_INFO'] ?? '';
        if (preg_match('/\\/([0-9]{11})(?:\\/([a-z]+))?/', $pathInfo, $matches)) {
            $cpf = $matches[1];
            $tier = $matches[2] ?? 'basic';
        }
    } else {
        $input = json_decode(file_get_contents('php://input'), true);
        $cpf = $input['cpf'] ?? '';
        $tier = $input['tier'] ?? 'basic';
    }
    
    // Validar CPF
    if (!preg_match('/^[0-9]{11}$/', $cpf)) {
        ApiResponse::validation(['cpf' => 'CPF deve conter exatamente 11 dígitos']);
    }
    
    if (!isValidCPF($cpf)) {
        ApiResponse::validation(['cpf' => 'CPF inválido']);
    }
    
    // Verificar preços por tier
    $prices = [
        'basic' => 2.50,
        'complete' => 5.00,
        'premium' => 10.00
    ];
    
    $cost = $prices[$tier] ?? $prices['basic'];
    
    // Verificar saldo
    if ($user['saldo'] < $cost) {
        ApiResponse::error('Saldo insuficiente para realizar a consulta', 402);
    }
    
    $startTime = microtime(true);
    
    try {
        $db->beginTransaction();
        
        // Debitar saldo do usuário
        $stmt = $db->prepare("
            UPDATE users 
            SET saldo = saldo - :cost 
            WHERE id = :user_id AND saldo >= :cost
        ");
        $result = $stmt->execute(['cost' => $cost, 'user_id' => $user['id']]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('Saldo insuficiente');
        }
        
        // Realizar consulta na API externa
        $consultationData = performCPFConsultation($cpf, $tier);
        
        $processingTime = round((microtime(true) - $startTime) * 1000);
        
        // Salvar no histórico
        $stmt = $db->prepare("
            INSERT INTO consultation_history 
            (user_id, consultation_type, document, cost, success, response_data, processing_time_ms, ip_address, user_agent) 
            VALUES (:user_id, 'CPF', :cpf, :cost, TRUE, :response_data, :processing_time, :ip, :user_agent)
        ");
        $stmt->execute([
            'user_id' => $user['id'],
            'cpf' => $cpf,
            'cost' => $cost,
            'response_data' => json_encode($consultationData),
            'processing_time' => $processingTime,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? ''
        ]);
        
        // Inserir transação financeira
        $stmt = $db->prepare("
            INSERT INTO financial_transactions 
            (user_id, transaction_type, amount, net_amount, status, description) 
            VALUES (:user_id, 'CONSULTATION', :amount, :amount, 'completed', :description)
        ");
        $stmt->execute([
            'user_id' => $user['id'],
            'amount' => $cost,
            'description' => "Consulta CPF {$tier} - {$cpf}"
        ]);
        
        $db->commit();
        
        ApiResponse::success([
            'consultation_id' => $db->lastInsertId(),
            'cpf' => $cpf,
            'tier' => $tier,
            'cost' => $cost,
            'processing_time_ms' => $processingTime,
            'data' => $consultationData
        ], 'Consulta realizada com sucesso');
        
    } catch (Exception $e) {
        $db->rollback();
        
        // Log do erro
        $stmt = $db->prepare("
            INSERT INTO consultation_history 
            (user_id, consultation_type, document, cost, success, error_message, processing_time_ms) 
            VALUES (:user_id, 'CPF', :cpf, :cost, FALSE, :error, :processing_time)
        ");
        $stmt->execute([
            'user_id' => $user['id'],
            'cpf' => $cpf,
            'cost' => $cost,
            'error' => $e->getMessage(),
            'processing_time' => round((microtime(true) - $startTime) * 1000)
        ]);
        
        throw $e;
    }
    
} catch (Exception $e) {
    error_log("CPF consultation error: " . $e->getMessage());
    ApiResponse::serverError('Erro ao realizar consulta: ' . $e->getMessage());
}

function isValidCPF($cpf) {
    // Implementar validação de CPF
    if (strlen($cpf) != 11 || preg_match('/^(\\d)\\\\1{10}$/', $cpf)) {
        return false;
    }
    
    for ($i = 9; $i < 11; $i++) {
        $sum = 0;
        for ($j = 0; $j < $i; $j++) {
            $sum += intval($cpf[$j]) * (($i + 1) - $j);
        }
        $remainder = $sum % 11;
        $digit = $remainder < 2 ? 0 : 11 - $remainder;
        
        if (intval($cpf[$i]) !== $digit) {
            return false;
        }
    }
    
    return true;
}

function performCPFConsultation($cpf, $tier) {
    // Implementar chamada para API externa real
    // Esta é uma implementação mock
    
    $baseData = [
        'cpf' => $cpf,
        'nome' => 'João Silva Santos',
        'data_nascimento' => '1985-05-15',
        'genero' => 'M',
        'situacao_cpf' => 'Regular'
    ];
    
    if ($tier === 'complete' || $tier === 'premium') {
        $baseData['endereco'] = [
            'logradouro' => 'Rua das Flores, 123',
            'bairro' => 'Centro',
            'cidade' => 'São Paulo',
            'uf' => 'SP',
            'cep' => '01234-567'
        ];
        
        $baseData['telefones'] = [
            ['numero' => '11987654321', 'tipo' => 'Celular'],
            ['numero' => '1133334444', 'tipo' => 'Residencial']
        ];
    }
    
    if ($tier === 'premium') {
        $baseData['score_credito'] = 750;
        $baseData['restricoes'] = [];
        $baseData['relacionamentos'] = [
            ['nome' => 'Maria Santos', 'parentesco' => 'Cônjuge']
        ];
    }
    
    return $baseData;
}
?>

## Para ver o manual completo com todos os endpoints, configurações de segurança, deploy e manutenção, continue lendo o arquivo baixado...

## SUPORTE E DOCUMENTAÇÃO

Para suporte técnico e documentação completa:
- Website: https://artepuradesign.com.br
- Email: suporte@artepuradesign.com.br
- Documentação da API: https://api.artepuradesign.com.br/docs

Desenvolvido por Arte Pura Design (APD) - 2024
Todos os direitos reservados.
`;
};
