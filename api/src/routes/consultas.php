
<?php
// src/routes/consultas.php

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../config/conexao.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ConsultaService.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

// Obter conexão do pool
$db = getDBConnection();

// Verificar autenticação
$authMiddleware = new AuthMiddleware($db);
if (!$authMiddleware->handle()) {
    Response::error('Token de autenticação inválido ou expirado', 401);
    exit;
}

$userId = AuthMiddleware::getCurrentUserId();

$consultaService = new ConsultaService($db);
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

error_log("CONSULTAS_ROUTE: Method: {$method}, Path: {$path}");

switch ($method) {
    case 'GET':
        if (strpos($path, '/consultas/history') !== false) {
            // Obter histórico de consultas
            $limit = $_GET['limit'] ?? 20;
            $offset = $_GET['offset'] ?? 0;
            
            try {
                $history = $consultaService->getUserConsultationHistory($userId, null, $limit, $offset);
                Response::success($history, 'Histórico carregado com sucesso');
            } catch (Exception $e) {
                Response::error('Erro ao carregar histórico: ' . $e->getMessage(), 500);
            }
        } elseif (strpos($path, '/consultas/stats') !== false) {
            // Obter estatísticas de consultas
            try {
                $stats = $consultaService->getConsultationStats($userId);
                Response::success($stats, 'Estatísticas carregadas com sucesso');
            } catch (Exception $e) {
                Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
            }
        } elseif (preg_match('/\/consultas\/(\d+)$/', $path, $matches)) {
            // Obter consulta específica por ID
            $consultationId = $matches[1];
            
            try {
                // Aqui você pode implementar a busca por ID específico se necessário
                Response::error('Endpoint não implementado', 501);
            } catch (Exception $e) {
                Response::error('Erro ao carregar consulta: ' . $e->getMessage(), 500);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    case 'POST':
        // IMPORTANTE: /consultas-nome/* não pode cair aqui (também contém "/consultas" no path)
        if (preg_match('#/consultas(/|$)#', $path) && strpos($path, '/consultas-nome') === false) {
            // Realizar consulta (CPF, CNPJ, Veículo)
            try {
                error_log("CONSULTAS_ROUTE: Iniciando criação de consulta");
                
                $input = json_decode(file_get_contents('php://input'), true);
                error_log("CONSULTAS_ROUTE: Input recebido: " . json_encode($input));
                
                if (!$input) {
                    Response::error('Dados inválidos', 400);
                    return;
                }
                
                // Determinar tipo de consulta
                $tipo = null;
                $documento = null;
                
                if (!empty($input['cpf'])) {
                    $tipo = 'cpf';
                    $documento = $input['cpf'];
                } elseif (!empty($input['cnpj'])) {
                    $tipo = 'cnpj';
                    $documento = $input['cnpj'];
                } elseif (!empty($input['placa'])) {
                    $tipo = 'veiculo';
                    $documento = $input['placa'];
                } elseif (!empty($input['document'])) {
                    // Fallback para document genérico
                    $tipo = $input['module_type'] ?? 'cpf';
                    $documento = $input['document'];
                } else {
                    Response::error('Tipo de consulta não identificado', 400);
                    return;
                }
                
                error_log("CONSULTAS_ROUTE: Tipo: {$tipo}, Documento: {$documento}");
                
                // Obter custo da requisição (valor já com desconto aplicado)
                $cost = isset($input['cost']) ? (float)$input['cost'] : null;
                $metadata = isset($input['metadata']) ? $input['metadata'] : null;
                
                error_log("CONSULTAS_ROUTE: Custo recebido: " . ($cost ?? 'NULL'));
                error_log("CONSULTAS_ROUTE: Metadata recebido: " . json_encode($metadata));
                
                // Executar consulta usando o serviço principal com custo dinâmico
                switch ($tipo) {
                    case 'cpf':
                        $result = $consultaService->performConsultation($userId, 'cpf', $documento, $cost, $metadata);
                        break;
                    case 'cnpj':
                        $result = $consultaService->performConsultation($userId, 'cnpj', $documento, $cost, $metadata);
                        break;
                    case 'veiculo':
                        $result = $consultaService->performConsultation($userId, 'veiculo', $documento, $cost, $metadata);
                        break;
                    default:
                        Response::error('Tipo de consulta não suportado', 400);
                        return;
                }
                
                error_log("CONSULTAS_ROUTE: Resultado: " . json_encode($result));
                
                if ($result) {
                    Response::success($result, 'Consulta realizada com sucesso');
                } else {
                    Response::success(null, 'Consulta realizada mas nenhum resultado encontrado');
                }
                
            } catch (Exception $e) {
                error_log("CONSULTAS_ROUTE ERROR: " . $e->getMessage());
                Response::error('Erro ao processar consulta: ' . $e->getMessage(), 400);
            }
        } else {
            Response::notFound('Endpoint não encontrado');
        }
        break;
        
    default:
        Response::methodNotAllowed('Método não permitido');
        break;
}
