<?php
// api/src/endpoints/base-cpf/calculate-score.php - Endpoint para calcular score automaticamente

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/auth.php';

// Verificar autenticação
$auth = verifyAuthentication();
if (!$auth['success']) {
    http_response_code(401);
    echo json_encode($auth);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

if (!isset($_GET['cpf'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'CPF é obrigatório']);
    exit;
}

$cpf = preg_replace('/\D/', '', $_GET['cpf']);

if (strlen($cpf) !== 11) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'CPF inválido']);
    exit;
}

try {
    // Buscar dados do CPF
    $stmt = $pdo->prepare("SELECT * FROM base_cpf WHERE cpf = ?");
    $stmt->execute([$cpf]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$data) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'CPF não encontrado']);
        exit;
    }
    
    // Calcular score baseado nos dados disponíveis
    $calculatedScore = calculateScore($data);
    
    // Atualizar score na base de dados
    $stmt = $pdo->prepare("UPDATE base_cpf SET score = ?, updated_at = NOW() WHERE cpf = ?");
    $stmt->execute([$calculatedScore['score'], $cpf]);
    
    // Registrar no histórico
    try {
        $stmt = $pdo->prepare("
            INSERT INTO score_history (cpf, score, reason, created_at) 
            VALUES (?, ?, ?, NOW())
        ");
        $stmt->execute([$cpf, $calculatedScore['score'], 'Cálculo automático']);
    } catch (PDOException $e) {
        // Tabela de histórico pode não existir
        error_log("Score history insert failed: " . $e->getMessage());
    }
    
    echo json_encode([
        'success' => true,
        'data' => $calculatedScore
    ]);
    
} catch (Exception $e) {
    error_log("Calculate score error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Erro ao calcular score']);
}

function calculateScore($data) {
    $score = 300; // Score base
    $factors = [];
    
    // Fatores que aumentam o score
    
    // 1. Renda (peso alto - até 200 pontos)
    if (!empty($data['renda'])) {
        $renda = preg_replace('/\D/', '', $data['renda']);
        if ($renda > 5000) {
            $score += 200;
            $factors[] = 'Renda alta';
        } elseif ($renda > 3000) {
            $score += 120;
            $factors[] = 'Renda média-alta';
        } elseif ($renda > 1500) {
            $score += 80;
            $factors[] = 'Renda média';
        } elseif ($renda > 0) {
            $score += 40;
            $factors[] = 'Renda declarada';
        }
    }
    
    // 2. Escolaridade (peso médio - até 100 pontos)
    if (!empty($data['escolaridade'])) {
        $escolaridade = strtolower($data['escolaridade']);
        if (strpos($escolaridade, 'superior') !== false || strpos($escolaridade, 'faculdade') !== false) {
            $score += 100;
            $factors[] = 'Ensino superior';
        } elseif (strpos($escolaridade, 'médio') !== false) {
            $score += 60;
            $factors[] = 'Ensino médio';
        } elseif (strpos($escolaridade, 'fundamental') !== false) {
            $score += 30;
            $factors[] = 'Ensino fundamental';
        }
    }
    
    // 3. Emprego (peso médio - até 80 pontos)
    if (!empty($data['tipo_emprego'])) {
        if (strpos(strtolower($data['tipo_emprego']), 'servidor') !== false || 
            strpos(strtolower($data['tipo_emprego']), 'público') !== false) {
            $score += 80;
            $factors[] = 'Servidor público';
        } elseif (!empty($data['tipo_emprego'])) {
            $score += 50;
            $factors[] = 'Emprego registrado';
        }
    }
    
    // 4. Documentos (peso baixo - até 60 pontos)
    $documents = 0;
    if (!empty($data['rg'])) $documents++;
    if (!empty($data['cnh'])) $documents++;
    if (!empty($data['titulo_eleitor'])) $documents++;
    if (!empty($data['ctps'])) $documents++;
    if (!empty($data['passaporte'])) $documents++;
    
    if ($documents >= 4) {
        $score += 60;
        $factors[] = 'Documentação completa';
    } elseif ($documents >= 2) {
        $score += 30;
        $factors[] = 'Documentação parcial';
    }
    
    // 5. Estado Civil (peso baixo - até 40 pontos)
    if (!empty($data['estado_civil'])) {
        $estadoCivil = strtolower($data['estado_civil']);
        if (strpos($estadoCivil, 'casado') !== false || strpos($estadoCivil, 'união') !== false) {
            $score += 40;
            $factors[] = 'União estável/casado';
        } elseif (strpos($estadoCivil, 'solteiro') !== false) {
            $score += 20;
            $factors[] = 'Estado civil definido';
        }
    }
    
    // 6. Idade (baseado na data de nascimento - até 50 pontos)
    if (!empty($data['data_nascimento'])) {
        $birthDate = new DateTime($data['data_nascimento']);
        $today = new DateTime();
        $age = $today->diff($birthDate)->y;
        
        if ($age >= 25 && $age <= 50) {
            $score += 50;
            $factors[] = 'Faixa etária produtiva';
        } elseif ($age >= 18 && $age < 65) {
            $score += 30;
            $factors[] = 'Idade adulta';
        }
    }
    
    // 7. Poder Aquisitivo CSB8/CSBA (peso alto - até 150 pontos)
    if (!empty($data['csb8']) || !empty($data['csba'])) {
        $csb8 = (int)$data['csb8'];
        $csba = (int)$data['csba'];
        
        if ($csb8 > 200 || $csba > 200) {
            $score += 150;
            $factors[] = 'Alto poder aquisitivo';
        } elseif ($csb8 > 100 || $csba > 100) {
            $score += 100;
            $factors[] = 'Bom poder aquisitivo';
        } elseif ($csb8 > 50 || $csba > 50) {
            $score += 60;
            $factors[] = 'Poder aquisitivo médio';
        }
    }
    
    // 8. Situação do CPF (peso crítico)
    if (!empty($data['situacao_cpf'])) {
        $situacao = strtolower($data['situacao_cpf']);
        if (strpos($situacao, 'regular') !== false) {
            $score += 50;
            $factors[] = 'CPF regular';
        } elseif (strpos($situacao, 'irregular') !== false || strpos($situacao, 'suspenso') !== false) {
            $score -= 200;
            $factors[] = 'CPF irregular (impacto negativo)';
        }
    }
    
    // Fatores que diminuem o score
    
    // Data de óbito (crítico)
    if (!empty($data['data_obito'])) {
        $score = 0;
        $factors = ['Pessoa falecida'];
    }
    
    // Garantir que o score está dentro dos limites
    $score = max(0, min(1000, $score));
    
    // Determinar mensagem baseada no score
    $message = '';
    if ($score >= 800) {
        $message = 'Excelente perfil creditício com alto potencial de aprovação';
    } elseif ($score >= 600) {
        $message = 'Bom perfil creditício com chances favoráveis de aprovação';
    } elseif ($score >= 400) {
        $message = 'Perfil creditício regular que pode ser melhorado';
    } else {
        $message = 'Perfil creditício baixo, requer atenção especial';
    }
    
    return [
        'score' => $score,
        'factors' => $factors,
        'message' => $message
    ];
}