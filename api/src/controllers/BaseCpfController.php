<?php
// src/controllers/BaseCpfController.php

require_once __DIR__ . '/../models/BaseCpf.php';
require_once __DIR__ . '/../models/BaseRg.php';
require_once __DIR__ . '/../models/BaseCnh.php';
require_once __DIR__ . '/../models/BaseEndereco.php';
require_once __DIR__ . '/../models/BaseTelefone.php';
require_once __DIR__ . '/../models/BaseEmail.php';
require_once __DIR__ . '/../models/BaseFoto.php';
require_once __DIR__ . '/../utils/Response.php';

class BaseCpfController {
    private $db;
    private $baseCpfModel;
    private $baseRgModel;
    private $baseCnhModel;
    private $baseEnderecoModel;
    private $baseTelefoneModel;
    private $baseEmailModel;
    private $baseFotoModel;
    
    public function __construct($db) {
        $this->db = $db;
        $this->baseCpfModel = new BaseCpf($db);
        $this->baseRgModel = new BaseRg($db);
        $this->baseCnhModel = new BaseCnh($db);
        $this->baseEnderecoModel = new BaseEndereco($db);
        $this->baseTelefoneModel = new BaseTelefone($db);
        $this->baseEmailModel = new BaseEmail($db);
        $this->baseFotoModel = new BaseFoto($db);
    }
    
    public function getAll() {
        try {
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 50;
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            
            $offset = ($page - 1) * $limit;
            $cpfs = $this->baseCpfModel->getAll($limit, $offset, $search);
            $total = $this->baseCpfModel->getCount($search);
            
            Response::success([
                'data' => $cpfs,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => $total,
                    'total_pages' => ceil($total / $limit)
                ]
            ]);
            
        } catch (Exception $e) {
            error_log("❌ Erro ao buscar CPFs: " . $e->getMessage());
            Response::error('Erro ao buscar CPFs: ' . $e->getMessage(), 500);
        }
    }
    
    public function getById() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }
            
            // Buscar dados principais
            $cpf = $this->baseCpfModel->getById($id);
            
            if (!$cpf) {
                Response::notFound('CPF não encontrado');
                return;
            }
            
            // Buscar fotos da tabela base_foto
            $fotos = $this->baseFotoModel->getByCpfId($id);
            
            // Adicionar fotos ao resultado (até 4 fotos)
            $cpf['photo'] = isset($fotos[0]) ? $fotos[0]['photo'] : null;
            $cpf['photo2'] = isset($fotos[1]) ? $fotos[1]['photo'] : null;
            $cpf['photo3'] = isset($fotos[2]) ? $fotos[2]['photo'] : null;
            $cpf['photo4'] = isset($fotos[3]) ? $fotos[3]['photo'] : null;
            
            Response::success($cpf);
            
        } catch (Exception $e) {
            error_log("❌ Erro ao buscar CPF por ID: " . $e->getMessage());
            Response::error('Erro ao buscar CPF: ' . $e->getMessage(), 500);
        }
    }
    
    public function getByCpf() {
        try {
            $cpf = isset($_GET['cpf']) ? trim($_GET['cpf']) : '';
            
            if (empty($cpf)) {
                Response::badRequest('CPF é obrigatório');
                return;
            }
            
            $cpfData = $this->baseCpfModel->getByCpf($cpf);
            
            if (!$cpfData) {
                Response::notFound('CPF não encontrado');
                return;
            }
            
            // Retornar apenas dados principais
            Response::success($cpfData);
            
        } catch (Exception $e) {
            error_log("❌ Erro ao buscar CPF por número: " . $e->getMessage());
            Response::error('Erro ao buscar CPF: ' . $e->getMessage(), 500);
        }
    }
    
    public function create() {
        try {
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::badRequest('Dados inválidos');
                return;
            }
            
            // Validar dados obrigatórios
            if (empty($input['cpf'])) {
                Response::badRequest('CPF é obrigatório');
                return;
            }
            
            if (empty($input['nome'])) {
                Response::badRequest('Nome é obrigatório');
                return;
            }
            
            // Sanitizar campos principais
            $input['cpf'] = preg_replace('/\D/', '', $input['cpf'] ?? '');
            if (isset($input['cep'])) {
                $input['cep'] = preg_replace('/\D/', '', $input['cep']);
            }
            
            // Verificar se CPF já existe
            $existing = $this->baseCpfModel->getByCpf($input['cpf']);
            if ($existing) {
                Response::badRequest('CPF já cadastrado');
                return;
            }
            
            // Iniciar transação
            $this->db->beginTransaction();
            
            try {
                // Criar registro principal
                $cpfId = $this->baseCpfModel->create($input);
                
                // Criar registros relacionados se fornecidos
                if (isset($input['rg']) && !empty($input['rg'])) {
                    // Se RG é enviado como string simples, criar estrutura de array
                    if (is_string($input['rg'])) {
                        $rgData = [
                            'rg' => $input['rg'],
                            'orgao_emissor' => $input['orgao_emissor'] ?? null,
                            'uf_emissao' => $input['uf_emissao'] ?? null,
                            'cpf_id' => $cpfId
                        ];
                    } else {
                        $rgData = $input['rg'];
                        $rgData['cpf_id'] = $cpfId;
                    }
                    $this->baseRgModel->create($rgData);
                }
                
                // Criar documentos RG se fornecidos
                if (isset($input['rg_documentos']) && is_array($input['rg_documentos'])) {
                    foreach ($input['rg_documentos'] as $rgDoc) {
                        $rgDoc['cpf_id'] = $cpfId;
                        $this->baseRgModel->create($rgDoc);
                    }
                }
                
                // Criar documentos CNH se fornecidos
                if (isset($input['cnh_documentos']) && is_array($input['cnh_documentos'])) {
                    foreach ($input['cnh_documentos'] as $cnhDoc) {
                        $cnhDoc['cpf_id'] = $cpfId;
                        $this->baseCnhModel->create($cnhDoc);
                    }
                }
                
                if (isset($input['enderecos']) && is_array($input['enderecos'])) {
                    foreach ($input['enderecos'] as $endereco) {
                        $endereco['cpf_id'] = $cpfId;
                        $this->baseEnderecoModel->create($endereco);
                    }
                }
                
                if (isset($input['telefones']) && is_array($input['telefones'])) {
                    foreach ($input['telefones'] as $telefone) {
                        $telefone['cpf_id'] = $cpfId;
                        $this->baseTelefoneModel->create($telefone);
                    }
                }
                
                if (isset($input['emails']) && is_array($input['emails'])) {
                    foreach ($input['emails'] as $email) {
                        $email['cpf_id'] = $cpfId;
                        $this->baseEmailModel->create($email);
                    }
                }
                
                // Salvar nomes dos arquivos de fotos na tabela base_foto
                $cpfLimpo = preg_replace('/\D/', '', $input['cpf']);
                $photoNames = [
                    ['nome' => 'Foto 1', 'photo' => "{$cpfLimpo}.jpg"],
                    ['nome' => 'Foto 2', 'photo' => "{$cpfLimpo}_2.jpg"],
                    ['nome' => 'Foto 3', 'photo' => "{$cpfLimpo}_3.jpg"],
                    ['nome' => 'Foto 4', 'photo' => "{$cpfLimpo}_4.jpg"]
                ];
                
                foreach ($photoNames as $photoData) {
                    // Verificar se o arquivo existe antes de salvar na base
                    $photoPath = __DIR__ . '/../../fotos/' . $photoData['photo'];
                    if (file_exists($photoPath)) {
                        $this->baseFotoModel->create([
                            'cpf_id' => $cpfId,
                            'cpf' => $cpfLimpo,
                            'nome' => $photoData['nome'],
                            'photo' => $photoData['photo']
                        ]);
                        error_log("✅ Registro de foto salvo na base_foto: " . $photoData['photo']);
                    }
                }
                
                $this->db->commit();
                
                // Buscar registro criado
                $createdData = $this->baseCpfModel->getById($cpfId);
                
                Response::success($createdData, 'CPF cadastrado com sucesso', 201);
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("❌ Erro ao criar CPF: " . $e->getMessage());
            error_log("❌ Stack trace: " . $e->getTraceAsString());
            Response::error('Erro ao cadastrar CPF: ' . $e->getMessage(), 500);
        }
    }
    
    public function update() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                Response::badRequest('Dados inválidos');
                return;
            }
            
            // Verificar se existe
            $existing = $this->baseCpfModel->getById($id);
            if (!$existing) {
                Response::notFound('CPF não encontrado');
                return;
            }
            
            // Garantir integridade do CPF no update
            if (!isset($input['cpf']) || trim((string)$input['cpf']) === '') {
                // Preserva CPF atual quando não for editado/enviado
                $input['cpf'] = $existing['cpf'];
            } else {
                // Sanitizar CPF quando enviado
                $input['cpf'] = preg_replace('/\D/', '', (string)$input['cpf']);
                if ($input['cpf'] === '') {
                    $input['cpf'] = $existing['cpf'];
                }
            }

            // Iniciar transação
            $this->db->beginTransaction();
            
            try {
                // Atualizar dados principais
                $this->baseCpfModel->update($id, $input);
                
                // Atualizar dados relacionados conforme necessário
                if (isset($input['rg'])) {
                    // Remover RGs existentes e recriar
                    $this->baseRgModel->deleteByCpfId($id);
                    if (!empty($input['rg'])) {
                        // Se RG é enviado como string simples, criar estrutura de array
                        if (is_string($input['rg'])) {
                            $rgData = [
                                'rg' => $input['rg'],
                                'orgao_emissor' => $input['orgao_emissor'] ?? null,
                                'uf_emissao' => $input['uf_emissao'] ?? null,
                                'cpf_id' => $id
                            ];
                        } else {
                            $rgData = $input['rg'];
                            $rgData['cpf_id'] = $id;
                        }
                        $this->baseRgModel->create($rgData);
                    }
                }
                
                // Atualizar documentos RG se fornecidos
                if (isset($input['rg_documentos'])) {
                    $this->baseRgModel->deleteByCpfId($id);
                    if (is_array($input['rg_documentos'])) {
                        foreach ($input['rg_documentos'] as $rgDoc) {
                            $rgDoc['cpf_id'] = $id;
                            $this->baseRgModel->create($rgDoc);
                        }
                    }
                }
                
                // Atualizar documentos CNH se fornecidos
                if (isset($input['cnh_documentos'])) {
                    $this->baseCnhModel->deleteByCpfId($id);
                    if (is_array($input['cnh_documentos'])) {
                        foreach ($input['cnh_documentos'] as $cnhDoc) {
                            $cnhDoc['cpf_id'] = $id;
                            $this->baseCnhModel->create($cnhDoc);
                        }
                    }
                }
                
                if (isset($input['enderecos'])) {
                    // Remover endereços existentes e recriar
                    $this->baseEnderecoModel->deleteByCpfId($id);
                    if (is_array($input['enderecos'])) {
                        foreach ($input['enderecos'] as $endereco) {
                            $endereco['cpf_id'] = $id;
                            $this->baseEnderecoModel->create($endereco);
                        }
                    }
                }
                
                if (isset($input['telefones'])) {
                    // Remover telefones existentes e recriar
                    $this->baseTelefoneModel->deleteByCpfId($id);
                    if (is_array($input['telefones'])) {
                        foreach ($input['telefones'] as $telefone) {
                            $telefone['cpf_id'] = $id;
                            $this->baseTelefoneModel->create($telefone);
                        }
                    }
                }
                
                if (isset($input['emails'])) {
                    // Remover emails existentes e recriar
                    $this->baseEmailModel->deleteByCpfId($id);
                    if (is_array($input['emails'])) {
                        foreach ($input['emails'] as $email) {
                            $email['cpf_id'] = $id;
                            $this->baseEmailModel->create($email);
                        }
                    }
                }
                
                // Atualizar registros de fotos na tabela base_foto
                // Limpar registros antigos
                $this->baseFotoModel->deleteByCpfId($id);

                // Usar CPF atualizado quando disponível (fallback para o existente)
                $cpfReferencia = isset($input['cpf']) ? (string)$input['cpf'] : (string)($existing['cpf'] ?? '');
                $cpfLimpo = preg_replace('/\D/', '', $cpfReferencia);

                // Atualizar fotos apenas quando houver CPF válido
                if ($cpfLimpo !== '') {
                    $photoNames = [
                        ['nome' => 'Foto 1', 'photo' => "{$cpfLimpo}.jpg"],
                        ['nome' => 'Foto 2', 'photo' => "{$cpfLimpo}_2.jpg"],
                        ['nome' => 'Foto 3', 'photo' => "{$cpfLimpo}_3.jpg"],
                        ['nome' => 'Foto 4', 'photo' => "{$cpfLimpo}_4.jpg"]
                    ];

                    foreach ($photoNames as $photoData) {
                        // Verificar se o arquivo existe antes de salvar na base
                        $photoPath = __DIR__ . '/../../fotos/' . $photoData['photo'];
                        if (file_exists($photoPath)) {
                            $this->baseFotoModel->create([
                                'cpf_id' => $id,
                                'cpf' => $cpfLimpo,
                                'nome' => $photoData['nome'],
                                'photo' => $photoData['photo']
                            ]);
                            error_log("✅ Registro de foto atualizado na base_foto: " . $photoData['photo']);
                        }
                    }
                }
                
                $this->db->commit();
                
                // Buscar dados atualizados
                $updatedData = $this->baseCpfModel->getById($id);
                
                Response::success($updatedData, 'CPF atualizado com sucesso');
                
            } catch (Exception $e) {
                $this->db->rollback();
                throw $e;
            }
            
        } catch (Exception $e) {
            error_log("❌ Erro ao atualizar CPF: " . $e->getMessage());
            error_log("❌ Stack trace: " . $e->getTraceAsString());
            Response::error('Erro ao atualizar CPF: ' . $e->getMessage(), 500);
        }
    }
    
    public function delete() {
        try {
            $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
            
            if ($id <= 0) {
                Response::badRequest('ID inválido');
                return;
            }
            
            // Verificar se existe
            $existing = $this->baseCpfModel->getById($id);
            if (!$existing) {
                Response::notFound('CPF não encontrado');
                return;
            }
            
            // Deletar fotos do servidor e registros da base_foto
            $fotosDir = __DIR__ . '/../../fotos/';
            $cpfLimpo = preg_replace('/\D/', '', $existing['cpf']);
            
            // Buscar todas as fotos do CPF na base_foto
            $fotos = $this->baseFotoModel->getByCpfId($id);
            
            // Deletar arquivos físicos das fotos
            foreach ($fotos as $foto) {
                $fotoPath = $fotosDir . $foto['photo'];
                if (file_exists($fotoPath)) {
                    unlink($fotoPath);
                    error_log("✅ FOTO_DELETED: Foto removida: " . $fotoPath);
                }
            }
            
            // Tentar também deletar pelas convenções de nome padrão
            $photoPatterns = [
                $cpfLimpo . '.jpg',
                $cpfLimpo . '_2.jpg',
                $cpfLimpo . '_3.jpg',
                $cpfLimpo . '_4.jpg'
            ];
            
            foreach ($photoPatterns as $pattern) {
                $fotoPath = $fotosDir . $pattern;
                if (file_exists($fotoPath)) {
                    unlink($fotoPath);
                    error_log("✅ FOTO_DELETED: Foto padrão removida: " . $fotoPath);
                }
            }
            
            // Deletar registros da base_foto (CASCADE irá remover relacionados)
            $this->baseFotoModel->deleteByCpfId($id);
            
            // Deletar o CPF principal
            $this->baseCpfModel->delete($id);
            
            Response::success(null, 'CPF e fotos removidos com sucesso');
            
        } catch (Exception $e) {
            error_log("❌ Erro ao deletar CPF: " . $e->getMessage());
            error_log("❌ Stack trace: " . $e->getTraceAsString());
            Response::error('Erro ao deletar CPF: ' . $e->getMessage(), 500);
        }
    }
}