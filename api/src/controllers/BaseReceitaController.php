<?php

require_once __DIR__ . '/../services/BaseReceitaService.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Auth.php';

class BaseReceitaController {
    private $service;
    
    public function __construct() {
        $this->service = new BaseReceitaService();
    }
    
    public function getByCpf() {
        // Verificar autenticação
        $auth = Auth::validateToken();
        if (!$auth['valid']) {
            Response::unauthorized($auth['message']);
            return;
        }
        
        if (!isset($_GET['cpf'])) {
            Response::error('CPF é obrigatório', 400);
            return;
        }
        
        $cpf = $_GET['cpf'];
        
        if (empty($cpf)) {
            Response::error('CPF não pode estar vazio', 400);
            return;
        }
        
        $result = $this->service->getByCpf($cpf);
        
        if ($result['success']) {
            Response::success($result['data'], 'Dados da Receita Federal encontrados');
        } else {
            Response::error($result['error'], 404);
        }
    }
    
    public function create() {
        // Verificar autenticação
        $auth = Auth::validateToken();
        if (!$auth['valid']) {
            Response::unauthorized($auth['message']);
            return;
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Dados inválidos', 400);
            return;
        }
        
        // Validar presença de cpf ou cpf_id - apenas um dos dois é necessário
        if (((!isset($input['cpf'])) || empty($input['cpf'])) && ((!isset($input['cpf_id'])) || empty($input['cpf_id']))) {
            Response::error("Campo 'cpf' ou 'cpf_id' é obrigatório", 400);
            return;
        }
        
        // Todos os outros campos da Receita Federal são opcionais
        // O usuário pode salvar apenas alguns campos sem erro
        
        $result = $this->service->create($input);
        
        if ($result['success']) {
            Response::success($result['data'], $result['message']);
        } else {
            Response::error($result['error'], 500);
        }
    }
    
    public function update() {
        // Verificar autenticação
        $auth = Auth::validateToken();
        if (!$auth['valid']) {
            Response::unauthorized($auth['message']);
            return;
        }
        
        if (!isset($_GET['id'])) {
            Response::error('ID é obrigatório', 400);
            return;
        }
        
        $id = $_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            Response::error('Dados inválidos', 400);
            return;
        }
        
        $result = $this->service->update($id, $input);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['error'], 500);
        }
    }
    
    public function delete() {
        // Verificar autenticação
        $auth = Auth::validateToken();
        if (!$auth['valid']) {
            Response::unauthorized($auth['message']);
            return;
        }
        
        if (!isset($_GET['id'])) {
            Response::error('ID é obrigatório', 400);
            return;
        }
        
        $id = $_GET['id'];
        
        $result = $this->service->delete($id);
        
        if ($result['success']) {
            Response::success(null, $result['message']);
        } else {
            Response::error($result['error'], 500);
        }
    }
    
    public function getAll() {
        // Verificar autenticação
        $auth = Auth::validateToken();
        if (!$auth['valid']) {
            Response::unauthorized($auth['message']);
            return;
        }
        
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        $result = $this->service->getAll($limit, $offset, $search);
        
        if ($result['success']) {
            Response::success($result['data'], 'Dados da Receita Federal obtidos com sucesso');
        } else {
            Response::error($result['error'], 500);
        }
    }
}