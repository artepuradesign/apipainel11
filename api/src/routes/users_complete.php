
<?php
// src/routes/users_complete.php - Rotas completas para usuários

require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../services/UserProfileService.php';
require_once __DIR__ . '/../utils/UserValidation.php';
require_once __DIR__ . '/../middleware/CorsMiddleware.php';

$corsMiddleware = new CorsMiddleware();
$corsMiddleware->handle();

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

try {
    // Conectar ao banco usando conexao.php
    $db = getDBConnection();
} catch (Exception $e) {
    error_log("USERS_COMPLETE: Erro de conexão: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro de conexão com banco de dados: ' . $e->getMessage()
    ]);
    exit();
}

    $userController = new UserController($db);

    switch ($method) {
        case 'GET':
            if (strpos($path, '/users/profile') !== false) {
                $userController->getProfile();
            } elseif (strpos($path, '/users/balance') !== false) {
                $userController->getBalance();
            } elseif (strpos($path, '/users/audit') !== false) {
                $userController->getAuditHistory();
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        case 'PUT':
            if (strpos($path, '/users/profile') !== false) {
                $userController->updateProfile();
            } elseif (strpos($path, '/users/passwords') !== false) {
                $userController->updatePasswords();
            } elseif (strpos($path, '/users/settings') !== false) {
                $userController->updateProfileSettings();
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'message' => 'Endpoint não encontrado'
                ]);
            }
            break;
            
        case 'OPTIONS':
            // Já tratado pelo CORS middleware
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'message' => 'Método não permitido'
            ]);
            break;
    }

} catch (Exception $e) {
    error_log("USERS_COMPLETE EXCEPTION: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Erro interno do servidor'
    ]);
}
