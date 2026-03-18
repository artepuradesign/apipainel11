<?php
// src/controllers/ConsultasCpfController.php

require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../services/ConsultasCpfService.php';
require_once __DIR__ . '/../models/Consultations.php';

class ConsultasCpfController {
    private $db;
    private $consultasCpfService;
    
    public function __construct($db) {
        $this->db = $db;
        $this->consultasCpfService = new ConsultasCpfService($db);
    }
    
    public function getAll() {
        try {
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            $search = $_GET['search'] ?? '';
            
            $result = $this->consultasCpfService->getAllConsultas($page, $limit, $search);
            
            Response::success($result, 'Consultas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consultas: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $consulta = $this->consultasCpfService->getConsultaById($id);
            
            if (!$consulta) {
                Response::error('Consulta não encontrada', 404);
                return;
            }
            
            Response::success($consulta, 'Consulta carregada com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consulta: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByUserId() {
        try {
            $userId = $_GET['user_id'] ?? null;
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 50;
            
            if (!$userId) {
                Response::error('ID do usuário é obrigatório', 400);
                return;
            }
            
            $consultas = $this->consultasCpfService->getConsultasByUserId($userId, $page, $limit);
            
            Response::success($consultas, 'Consultas do usuário carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar consultas do usuário: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            error_log("CREATE_CONSULTA: Iniciando criação de consulta");
            
            $rawInput = file_get_contents('php://input');
            error_log("CREATE_CONSULTA: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("CREATE_CONSULTA: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("CREATE_CONSULTA: Dados inválidos ou malformados - JSON decode error: " . json_last_error_msg());
                Response::error('Dados inválidos: ' . json_last_error_msg(), 400);
                return;
            }
            
            // Validar campos obrigatórios
            if (empty($input['user_id'])) {
                error_log("CREATE_CONSULTA: user_id ausente");
                Response::error('ID do usuário é obrigatório', 400);
                return;
            }
            
            // Aceitar tanto 'document' quanto 'documento'
            $document = $input['document'] ?? $input['documento'] ?? '';
            if (empty($document)) {
                error_log("CREATE_CONSULTA: document/documento ausente");
                Response::error('Documento é obrigatório', 400);
                return;
            }
            
            // Se module_type não está definido, assumir 'cpf' baseado no contexto
            if (empty($input['module_type'])) {
                $input['module_type'] = 'cpf';
                error_log("CREATE_CONSULTA: module_type ausente, assumindo 'cpf'");
            }
            
            // Validar formato do CPF
            if (!$this->isValidCPF($document)) {
                error_log("CREATE_CONSULTA: CPF inválido: {$document}");
                Response::error('CPF inválido', 422);
                return;
            }
            
            // Normalizar o campo document no input
            $input['document'] = $document;
            
// Log do status recebido
error_log("CREATE_CONSULTA: Status recebido: " . ($input['status'] ?? 'não informado'));

// Pré-criar registro na tabela consultations com status 'processing'
try {
    $consultationsModel = new Consultations($this->db);
    $preMetadata = [
        'source' => 'consultar-cpf-puxa-tudo',
        'discount' => ($input['metadata']['discount'] ?? 0),
        'original_price' => ($input['metadata']['original_price'] ?? ($input['cost'] ?? 2.00)),
        'final_price' => ($input['metadata']['final_price'] ?? ($input['cost'] ?? 2.00))
    ];
    $preId = $consultationsModel->create([
        'user_id' => (int)$input['user_id'],
        'module_type' => $input['module_type'] ?? 'cpf',
        'document' => $input['document'],
        'cost' => (float)($input['cost'] ?? 2.00),
        'status' => 'processing',
        'saldo_usado' => $input['saldo_usado'] ?? 'carteira',
        'metadata' => $preMetadata
    ]);
    $input['pre_consultation_id'] = $preId;
    error_log("CREATE_CONSULTA: Pré-registro criado em consultations com ID: " . $preId . " com custo: " . ($input['cost'] ?? 2.00));
} catch (Exception $e) {
    error_log("CREATE_CONSULTA: Falha ao pré-criar registro em consultations: " . $e->getMessage());
}
            
error_log("CREATE_CONSULTA: Chamando service...");
$result = $this->consultasCpfService->createConsulta($input);
            error_log("CREATE_CONSULTA: Resultado do service: " . json_encode($result));
            
            // Verificar se o resultado é um array (nova estrutura) ou ID (estrutura antiga)
            if (is_array($result)) {
                // Nova estrutura - retornar resultado completo
                if ($result['success']) {
                    Response::success($result['data'], $result['message']);
                } else {
                    Response::success(null, $result['message']);
                }
            } else {
                // Estrutura antiga - manter compatibilidade
                Response::success([
                    'id' => $result,
                    'message' => 'Consulta criada com sucesso'
                ], 'Consulta criada com sucesso');
            }
            
        } catch (Exception $e) {
            error_log("CREATE_CONSULTA: Erro capturado - " . $e->getMessage());
            error_log("CREATE_CONSULTA: Stack trace - " . $e->getTraceAsString());
            Response::error('Erro ao criar consulta: ' . $e->getMessage(), 400);
        }
    }
    
    public function update() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::error('Dados inválidos', 400);
                return;
            }
            
            $success = $this->consultasCpfService->updateConsulta($id, $input);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Consulta atualizada com sucesso'
                ], 'Consulta atualizada com sucesso');
            } else {
                Response::error('Erro ao atualizar consulta', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao atualizar consulta: ' . $e->getMessage(), 400);
        }
    }
    
    public function delete() {
        try {
            $id = $_GET['id'] ?? null;
            
            if (!$id) {
                Response::error('ID é obrigatório', 400);
                return;
            }
            
            $success = $this->consultasCpfService->deleteConsulta($id);
            
            if ($success) {
                Response::success([
                    'id' => $id,
                    'message' => 'Consulta deletada com sucesso'
                ], 'Consulta deletada com sucesso');
            } else {
                Response::error('Erro ao deletar consulta', 500);
            }
            
        } catch (Exception $e) {
            Response::error('Erro ao deletar consulta: ' . $e->getMessage(), 400);
        }
    }
    
    public function getStats() {
        try {
            $stats = $this->consultasCpfService->getStats();
            
            Response::success($stats, 'Estatísticas carregadas com sucesso');
        } catch (Exception $e) {
            Response::error('Erro ao carregar estatísticas: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Validar formato de CPF
     */
    private function isValidCPF($cpf) {
        $cpf = preg_replace('/[^0-9]/', '', $cpf);
        
        if (strlen($cpf) != 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false;
        }
        
        // Calcular primeiro dígito verificador
        $sum = 0;
        for ($i = 0; $i < 9; $i++) {
            $sum += intval($cpf[$i]) * (10 - $i);
        }
        $remainder = $sum % 11;
        $digit1 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        // Calcular segundo dígito verificador
        $sum = 0;
        for ($i = 0; $i < 10; $i++) {
            $sum += intval($cpf[$i]) * (11 - $i);
        }
        $remainder = $sum % 11;
        $digit2 = ($remainder < 2) ? 0 : 11 - $remainder;
        
        return (intval($cpf[9]) == $digit1 && intval($cpf[10]) == $digit2);
    }
    
    /**
     * Chamar API externa para consulta de CPF
     */
    public function callExternalApi() {
        try {
            error_log("EXTERNAL_API: Iniciando chamada para API externa");
            
            $rawInput = file_get_contents('php://input');
            error_log("EXTERNAL_API: Raw input: " . $rawInput);
            
            $input = json_decode($rawInput, true);
            error_log("EXTERNAL_API: Input decodificado: " . json_encode($input));
            
            if (!$input) {
                error_log("EXTERNAL_API: Dados inválidos");
                Response::error('Dados inválidos', 400);
                return;
            }
            
            // Validar CPF
            $cpf = $input['cpf'] ?? $input['document'] ?? '';
            if (empty($cpf)) {
                error_log("EXTERNAL_API: CPF não fornecido");
                Response::error('CPF é obrigatório', 400);
                return;
            }
            
            // Limpar CPF
            $cpf = preg_replace('/[^0-9]/', '', $cpf);
            
            if (!$this->isValidCPF($cpf)) {
                error_log("EXTERNAL_API: CPF inválido: {$cpf}");
                Response::error('CPF inválido', 422);
                return;
            }
            
            error_log("EXTERNAL_API: Enviando CPF para API externa: {$cpf}");
            
            // Preparar dados para enviar à API externa
            $postData = [
                'cpf' => $cpf,
                'user_id' => $input['user_id'] ?? null
            ];
            
            // Fazer requisição para a API externa
            $ch = curl_init('https://api.atito.com.br/consulta/index.php');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlError = curl_error($ch);
            curl_close($ch);
            
            if ($curlError) {
                error_log("EXTERNAL_API: Erro cURL: {$curlError}");
                Response::error('Erro ao consultar API externa: ' . $curlError, 500);
                return;
            }
            
            error_log("EXTERNAL_API: Resposta da API externa (HTTP {$httpCode}): " . $response);
            
            $responseData = json_decode($response, true);
            
            if (!$responseData) {
                error_log("EXTERNAL_API: Resposta inválida da API externa");
                Response::error('Resposta inválida da API externa', 500);
                return;
            }
            
            Response::success($responseData, 'Consulta na API externa realizada com sucesso');
            
        } catch (Exception $e) {
            error_log("EXTERNAL_API: Erro capturado - " . $e->getMessage());
            Response::error('Erro ao consultar API externa: ' . $e->getMessage(), 500);
        }
    }
}