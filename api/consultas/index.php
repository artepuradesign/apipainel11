<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../auth/middleware.php';

// Verificar autenticação
$authResult = verifyAuth();
if (!$authResult['success']) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => $authResult['error']]);
    exit;
}

$userId = $authResult['user_id'];
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Estrutura: /consultas/{tipo}/{acao}
if (count($pathParts) < 3) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid endpoint']);
    exit;
}

$consultationType = $pathParts[1]; // cpf, cnpj, veiculo
$action = $pathParts[2]; // consultar, historico

switch ($consultationType) {
    case 'cpf':
        handleCPFConsultation($action);
        break;
    case 'cnpj':
        handleCNPJConsultation($action);
        break;
    case 'veiculo':
        handleVehicleConsultation($action);
        break;
    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid consultation type']);
}

function handleCPFConsultation($action) {
    global $pdo, $userId;
    
    if ($action === 'consultar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $cpf = $input['cpf'] ?? '';
        
        if (empty($cpf) || strlen($cpf) !== 11) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'CPF inválido']);
            return;
        }
        
        // Verificar saldo
        $balanceCheck = checkUserBalance($userId, 2.00);
        if (!$balanceCheck['success']) {
            http_response_code(400);
            echo json_encode($balanceCheck);
            return;
        }
        
        // Verificar se já existe consulta recente
        $stmt = $pdo->prepare("SELECT * FROM cpf WHERE user_id = ? AND cpf_consultado = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$userId, $cpf]);
        $existingConsult = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingConsult) {
            echo json_encode([
                'success' => true,
                'data' => $existingConsult,
                'message' => 'Consulta já realizada nas últimas 24 horas'
            ]);
            return;
        }
        
        // Simular chamada à API externa de CPF
        $mockData = [
            'nome' => 'João da Silva Santos',
            'situacao_cpf' => 'REGULAR',
            'data_nascimento' => '1985-05-15',
            'sexo' => 'M',
            'mae' => 'Maria da Silva',
            'pai' => 'José dos Santos',
            'endereco' => 'Rua das Flores, 123, Apto 45, Centro',
            'cep' => '01234567',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'renda_presumida' => 3500.00,
            'score' => 750,
            'restricoes' => null,
            'telefones' => '(11) 98765-4321',
            'emails' => 'joao.silva@email.com'
        ];
        
        // Descontar saldo
        $debitResult = debitUserBalance($userId, 2.00);
        if (!$debitResult['success']) {
            http_response_code(400);
            echo json_encode($debitResult);
            return;
        }
        
        // Salvar consulta na tabela
        try {
            $stmt = $pdo->prepare("
                INSERT INTO cpf (
                    user_id, cpf_consultado, nome, situacao_cpf, data_nascimento, sexo, 
                    mae, pai, endereco, cep, cidade, estado, renda_presumida, score, 
                    restricoes, telefones, emails, custo, status, ip_consulta, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sucesso', ?, ?)
            ");
            
            $stmt->execute([
                $userId, $cpf, $mockData['nome'], $mockData['situacao_cpf'], 
                $mockData['data_nascimento'], $mockData['sexo'], $mockData['mae'], 
                $mockData['pai'], $mockData['endereco'], $mockData['cep'], 
                $mockData['cidade'], $mockData['estado'], $mockData['renda_presumida'], 
                $mockData['score'], $mockData['restricoes'], $mockData['telefones'], 
                $mockData['emails'], 2.00, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']
            ]);
            
            $consultId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'data' => array_merge($mockData, ['id' => $consultId, 'cpf' => $cpf])
            ]);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro ao salvar consulta']);
        }
        
    } elseif ($action === 'historico' && $_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $stmt = $pdo->prepare("SELECT * FROM cpf WHERE user_id = ? ORDER BY created_at DESC LIMIT 50");
            $stmt->execute([$userId]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['success' => true, 'data' => $history]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro ao buscar histórico']);
        }
    }
}

function handleCNPJConsultation($action) {
    global $pdo, $userId;
    
    if ($action === 'consultar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $cnpj = $input['cnpj'] ?? '';
        
        if (empty($cnpj) || strlen($cnpj) !== 14) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'CNPJ inválido']);
            return;
        }
        
        // Verificar saldo
        $balanceCheck = checkUserBalance($userId, 3.00);
        if (!$balanceCheck['success']) {
            http_response_code(400);
            echo json_encode($balanceCheck);
            return;
        }
        
        // Simular chamada à API externa de CNPJ
        $mockData = [
            'razao_social' => 'Empresa de Tecnologia LTDA',
            'nome_fantasia' => 'Tech Solutions',
            'situacao_cnpj' => 'ATIVA',
            'data_abertura' => '2015-05-10',
            'natureza_juridica' => 'Sociedade Empresária Limitada',
            'porte_empresa' => 'MÉDIO',
            'capital_social' => 150000.00,
            'cnae_principal' => '6201-5/01',
            'cnae_secundarios' => '6202-3/00, 6204-0/00',
            'endereco' => 'Avenida Paulista, 1000, Sala 1010, Bela Vista',
            'cep' => '01310100',
            'cidade' => 'São Paulo',
            'estado' => 'SP',
            'telefone' => '(11) 3456-7890',
            'email' => 'contato@techsolutions.com.br',
            'socios' => 'Carlos Alberto Silva (Sócio-Administrador), Ana Maria Santos (Sócio)',
            'situacao_receita' => 'ATIVA'
        ];
        
        // Descontar saldo
        $debitResult = debitUserBalance($userId, 3.00);
        if (!$debitResult['success']) {
            http_response_code(400);
            echo json_encode($debitResult);
            return;
        }
        
        // Salvar consulta na tabela
        try {
            $stmt = $pdo->prepare("
                INSERT INTO cnpj (
                    user_id, cnpj_consultado, razao_social, nome_fantasia, situacao_cnpj, 
                    data_abertura, natureza_juridica, porte_empresa, capital_social, 
                    cnae_principal, cnae_secundarios, endereco, cep, cidade, estado, 
                    telefone, email, socios, situacao_receita, custo, status, ip_consulta, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sucesso', ?, ?)
            ");
            
            $stmt->execute([
                $userId, $cnpj, $mockData['razao_social'], $mockData['nome_fantasia'], 
                $mockData['situacao_cnpj'], $mockData['data_abertura'], $mockData['natureza_juridica'], 
                $mockData['porte_empresa'], $mockData['capital_social'], $mockData['cnae_principal'], 
                $mockData['cnae_secundarios'], $mockData['endereco'], $mockData['cep'], 
                $mockData['cidade'], $mockData['estado'], $mockData['telefone'], $mockData['email'], 
                $mockData['socios'], $mockData['situacao_receita'], 3.00, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']
            ]);
            
            $consultId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'data' => array_merge($mockData, ['id' => $consultId, 'cnpj' => $cnpj])
            ]);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro ao salvar consulta']);
        }
    }
}

function handleVehicleConsultation($action) {
    global $pdo, $userId;
    
    if ($action === 'consultar' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $placa = $input['placa'] ?? '';
        
        if (empty($placa)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Placa inválida']);
            return;
        }
        
        // Verificar saldo
        $balanceCheck = checkUserBalance($userId, 3.00);
        if (!$balanceCheck['success']) {
            http_response_code(400);
            echo json_encode($balanceCheck);
            return;
        }
        
        // Simular chamada à API externa de Veículo
        $mockData = [
            'marca' => 'VOLKSWAGEN',
            'modelo' => 'GOL 1.0',
            'ano_fabricacao' => 2019,
            'ano_modelo' => 2020,
            'cor' => 'PRATA',
            'combustivel' => 'FLEX',
            'chassi' => '9BWHE21JX24060960',
            'renavam' => '01234567890',
            'situacao' => 'REGULAR',
            'restricoes' => null,
            'municipio' => 'São Paulo',
            'uf' => 'SP',
            'proprietario' => 'João da Silva Santos',
            'documento_proprietario' => '12345678901',
            'valor_fipe' => 25000.00,
            'debitos' => null
        ];
        
        // Descontar saldo
        $debitResult = debitUserBalance($userId, 3.00);
        if (!$debitResult['success']) {
            http_response_code(400);
            echo json_encode($debitResult);
            return;
        }
        
        // Salvar consulta na tabela
        try {
            $stmt = $pdo->prepare("
                INSERT INTO veiculo (
                    user_id, placa_consultada, marca, modelo, ano_fabricacao, ano_modelo, 
                    cor, combustivel, chassi, renavam, situacao, restricoes, municipio, 
                    uf, proprietario, documento_proprietario, valor_fipe, debitos, custo, 
                    status, ip_consulta, user_agent
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sucesso', ?, ?)
            ");
            
            $stmt->execute([
                $userId, $placa, $mockData['marca'], $mockData['modelo'], 
                $mockData['ano_fabricacao'], $mockData['ano_modelo'], $mockData['cor'], 
                $mockData['combustivel'], $mockData['chassi'], $mockData['renavam'], 
                $mockData['situacao'], $mockData['restricoes'], $mockData['municipio'], 
                $mockData['uf'], $mockData['proprietario'], $mockData['documento_proprietario'], 
                $mockData['valor_fipe'], $mockData['debitos'], 3.00, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT']
            ]);
            
            $consultId = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'data' => array_merge($mockData, ['id' => $consultId, 'placa' => $placa])
            ]);
            
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Erro ao salvar consulta']);
        }
    }
}

function checkUserBalance($userId, $requiredAmount) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT saldo, saldo_plano FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }
        
        $planBalance = floatval($user['saldo_plano'] ?? 0);
        $walletBalance = floatval($user['saldo'] ?? 0);
        $totalBalance = $planBalance + $walletBalance;
        
        if ($totalBalance < $requiredAmount) {
            return [
                'success' => false, 
                'error' => 'Saldo insuficiente',
                'required' => $requiredAmount,
                'available' => $totalBalance
            ];
        }
        
        return [
            'success' => true,
            'planBalance' => $planBalance,
            'walletBalance' => $walletBalance,
            'totalBalance' => $totalBalance
        ];
        
    } catch (PDOException $e) {
        return ['success' => false, 'error' => 'Erro ao verificar saldo'];
    }
}

function debitUserBalance($userId, $amount) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();
        
        // Buscar saldos atuais
        $stmt = $pdo->prepare("SELECT saldo, saldo_plano FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            $pdo->rollBack();
            return ['success' => false, 'error' => 'Usuário não encontrado'];
        }
        
        $planBalance = floatval($user['saldo_plano'] ?? 0);
        $walletBalance = floatval($user['saldo'] ?? 0);
        
        // Lógica prioritária: descontar do saldo do plano primeiro
        if ($planBalance >= $amount) {
            $newPlanBalance = $planBalance - $amount;
            $newWalletBalance = $walletBalance;
        } else {
            $remainingAmount = $amount - $planBalance;
            $newPlanBalance = 0;
            $newWalletBalance = $walletBalance - $remainingAmount;
        }
        
        // Atualizar saldos
        $stmt = $pdo->prepare("UPDATE users SET saldo = ?, saldo_plano = ? WHERE id = ?");
        $stmt->execute([$newWalletBalance, $newPlanBalance, $userId]);
        
        $pdo->commit();
        
        return [
            'success' => true,
            'newPlanBalance' => $newPlanBalance,
            'newWalletBalance' => $newWalletBalance
        ];
        
    } catch (PDOException $e) {
        $pdo->rollBack();
        return ['success' => false, 'error' => 'Erro ao debitar saldo'];
    }
}
?>