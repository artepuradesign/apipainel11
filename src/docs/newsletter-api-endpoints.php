<?php
/**
 * Endpoints da Newsletter para API Externa
 * Arquivo: /api/newsletter/index.php
 * 
 * Adicione essas rotas na sua API externa para funcionar com o frontend
 */

// Configurações
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection (ajuste conforme sua configuração)
try {
    $pdo = new PDO("mysql:host=localhost;dbname=your_database;charset=utf8mb4", "username", "password");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro de conexão com o banco de dados',
        'message' => 'Erro de conexão com o banco de dados'
    ]);
    exit();
}

// Routing
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Remove 'api' and 'newsletter' from path
$action = $pathParts[2] ?? '';
$param = $pathParts[3] ?? '';

try {
    switch ($method) {
        case 'POST':
            if ($action === 'subscribe') {
                handleSubscribe($pdo);
            } elseif ($action === 'unsubscribe') {
                handleUnsubscribe($pdo);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Endpoint não encontrado']);
            }
            break;
            
        case 'GET':
            if ($action === 'check' && $param) {
                handleCheckSubscription($pdo, $param);
            } elseif ($action === 'list') {
                handleListSubscriptions($pdo);
            } elseif ($action === 'stats') {
                handleGetStats($pdo);
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'error' => 'Endpoint não encontrado']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

/**
 * Inscrever email na newsletter
 * POST /api/newsletter/subscribe
 */
function handleSubscribe($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $name = trim($input['name'] ?? '');
    $source = trim($input['source'] ?? 'website');
    $ipAddress = $input['ip_address'] ?? $_SERVER['REMOTE_ADDR'] ?? null;
    $userAgent = $input['user_agent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? null;
    
    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email inválido',
            'message' => 'Email inválido'
        ]);
        return;
    }
    
    try {
        // Verificar se já existe
        $stmt = $pdo->prepare("SELECT id, status FROM newsletter_emails WHERE email = ?");
        $stmt->execute([$email]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            if ($existing['status'] === 'active') {
                echo json_encode([
                    'success' => false,
                    'error' => 'Email já cadastrado',
                    'message' => 'Este email já está inscrito na newsletter'
                ]);
                return;
            } else {
                // Reativar inscrição
                $stmt = $pdo->prepare("UPDATE newsletter_emails SET status = 'active', name = ?, updated_at = NOW() WHERE email = ?");
                $stmt->execute([$name, $email]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscrição reativada com sucesso',
                    'data' => ['id' => $existing['id'], 'email' => $email]
                ]);
                return;
            }
        }
        
        // Inserir novo email
        $stmt = $pdo->prepare("
            INSERT INTO newsletter_emails (email, name, source, ip_address, user_agent, status, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())
        ");
        $stmt->execute([$email, $name, $source, $ipAddress, $userAgent]);
        
        $newId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Email inscrito com sucesso na newsletter',
            'data' => [
                'id' => $newId,
                'email' => $email,
                'name' => $name,
                'source' => $source
            ]
        ]);
        
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) { // Duplicate entry
            echo json_encode([
                'success' => false,
                'error' => 'Email já cadastrado',
                'message' => 'Este email já está inscrito na newsletter'
            ]);
        } else {
            throw $e;
        }
    }
}

/**
 * Cancelar inscrição
 * POST /api/newsletter/unsubscribe
 */
function handleUnsubscribe($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    $email = filter_var(trim($input['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    
    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email inválido',
            'message' => 'Email inválido'
        ]);
        return;
    }
    
    $stmt = $pdo->prepare("UPDATE newsletter_emails SET status = 'unsubscribed', updated_at = NOW() WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Inscrição cancelada com sucesso'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Email não encontrado',
            'message' => 'Email não encontrado na newsletter'
        ]);
    }
}

/**
 * Verificar se email está inscrito
 * GET /api/newsletter/check/{email}
 */
function handleCheckSubscription($pdo, $email) {
    $email = filter_var(urldecode($email), FILTER_VALIDATE_EMAIL);
    
    if (!$email) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email inválido',
            'subscribed' => false
        ]);
        return;
    }
    
    $stmt = $pdo->prepare("SELECT status FROM newsletter_emails WHERE email = ?");
    $stmt->execute([$email]);
    $result = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'subscribed' => $result && $result['status'] === 'active',
        'status' => $result['status'] ?? null
    ]);
}

/**
 * Listar inscrições (apenas para admin)
 * GET /api/newsletter/list?page=1&limit=50
 */
function handleListSubscriptions($pdo) {
    $page = max(1, (int)($_GET['page'] ?? 1));
    $limit = min(100, max(10, (int)($_GET['limit'] ?? 50)));
    $offset = ($page - 1) * $limit;
    
    // Contar total
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM newsletter_emails");
    $stmt->execute();
    $total = $stmt->fetch()['total'];
    
    // Buscar dados
    $stmt = $pdo->prepare("
        SELECT id, email, name, status, source, created_at, updated_at 
        FROM newsletter_emails 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
    ");
    $stmt->execute([$limit, $offset]);
    $emails = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'data' => $emails,
        'meta' => [
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Obter estatísticas
 * GET /api/newsletter/stats
 */
function handleGetStats($pdo) {
    $stmt = $pdo->prepare("
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN status = 'unsubscribed' THEN 1 ELSE 0 END) as unsubscribed,
            SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
        FROM newsletter_emails
    ");
    $stmt->execute();
    $stats = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'total' => (int)$stats['total'],
            'active' => (int)$stats['active'],
            'unsubscribed' => (int)$stats['unsubscribed'],
            'inactive' => (int)$stats['inactive']
        ]
    ]);
}

?>

<!-- 
INSTRUÇÕES DE INSTALAÇÃO:

1. Crie o arquivo /api/newsletter/index.php no seu servidor
2. Copie todo este conteúdo PHP acima
3. Ajuste as configurações de banco de dados (host, nome, usuário, senha)
4. Configure o arquivo .htaccess para reescrever URLs:

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^api/newsletter/(.*)$ /api/newsletter/index.php [L,QSA]

5. Teste os endpoints:
   - POST /api/newsletter/subscribe
   - POST /api/newsletter/unsubscribe  
   - GET /api/newsletter/check/{email}
   - GET /api/newsletter/list
   - GET /api/newsletter/stats

6. Certifique-se de que a tabela newsletter_emails foi criada corretamente
-->