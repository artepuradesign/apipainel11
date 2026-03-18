
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Server, Database, Code, FileText, Layers } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferencePanels = () => {
  const [activeTab, setActiveTab] = useState('endpoints');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  };

  // Código PHP completo para o sistema de painéis
  const phpExample = `<?php
// arquivo: api/paineis/index.php - Sistema completo de Painéis
require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class PaineisAPI {
    private $db;
    private $conn;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->connect();
        $this->checkAuth();
    }

    private function checkAuth() {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        
        if (!$authHeader || !str_contains($authHeader, 'Bearer ')) {
            $this->sendError('Token de autorização obrigatório', 401);
        }
        
        $token = str_replace('Bearer ', '', $authHeader);
        if ($token !== 'bG92YWJsZS5kZXY=') {
            $this->sendError('Token inválido', 401);
        }
    }

    private function sendResponse($data = null, $message = '', $status = 200) {
        http_response_code($status);
        echo json_encode([
            'success' => true,
            'data' => $data,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    private function sendError($message, $status = 400) {
        http_response_code($status);
        echo json_encode([
            'success' => false,
            'error' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    private function getRequestData() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    // Listar todos os painéis
    public function getAllPanels() {
        try {
            $stmt = $this->conn->prepare("
                SELECT p.*, 
                       COUNT(m.id) as total_modulos,
                       COUNT(CASE WHEN m.ativo = 1 THEN 1 END) as modulos_ativos
                FROM paineis p 
                LEFT JOIN modulos m ON p.id = m.painel_id
                GROUP BY p.id 
                ORDER BY p.ordem ASC, p.id ASC
            ");
            $stmt->execute();
            $paineis = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($paineis as &$painel) {
                $painel['configuracoes'] = json_decode($painel['configuracoes'] ?? '{}', true);
                $painel['total_modulos'] = (int)$painel['total_modulos'];
                $painel['modulos_ativos'] = (int)$painel['modulos_ativos'];
                $painel['ativo'] = (bool)$painel['ativo'];
                $painel['publico'] = (bool)$painel['publico'];
            }
            
            $this->sendResponse($paineis, 'Painéis carregados com sucesso');
        } catch (Exception $e) {
            $this->sendError('Erro ao carregar painéis: ' . $e->getMessage());
        }
    }

    // Buscar painel por ID
    public function getPanelById($painelId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT p.*, 
                       COUNT(m.id) as total_modulos,
                       COUNT(CASE WHEN m.ativo = 1 THEN 1 END) as modulos_ativos
                FROM paineis p 
                LEFT JOIN modulos m ON p.id = m.painel_id
                WHERE p.id = :id
                GROUP BY p.id
            ");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            $painel = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$painel) {
                $this->sendError('Painel não encontrado', 404);
            }
            
            $painel['configuracoes'] = json_decode($painel['configuracoes'] ?? '{}', true);
            $painel['total_modulos'] = (int)$painel['total_modulos'];
            $painel['modulos_ativos'] = (int)$painel['modulos_ativos'];
            $painel['ativo'] = (bool)$painel['ativo'];
            $painel['publico'] = (bool)$painel['publico'];
            
            // Buscar módulos do painel
            $stmt = $this->conn->prepare("
                SELECT * FROM modulos 
                WHERE painel_id = :painel_id 
                ORDER BY ordem ASC, id ASC
            ");
            $stmt->bindParam(':painel_id', $painelId);
            $stmt->execute();
            $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($modulos as &$modulo) {
                $modulo['configuracoes'] = json_decode($modulo['configuracoes'] ?? '{}', true);
                $modulo['ativo'] = (bool)$modulo['ativo'];
            }
            
            $painel['modulos'] = $modulos;
            
            $this->sendResponse($painel, 'Painel encontrado');
        } catch (Exception $e) {
            $this->sendError('Erro ao buscar painel: ' . $e->getMessage());
        }
    }

    // Criar novo painel
    public function createPanel() {
        try {
            $data = $this->getRequestData();
            
            if (!isset($data['nome']) || empty($data['nome'])) {
                $this->sendError('Nome do painel é obrigatório', 400);
            }
            
            if (!isset($data['slug']) || empty($data['slug'])) {
                $this->sendError('Slug do painel é obrigatório', 400);
            }
            
            // Verificar se slug já existe
            $stmt = $this->conn->prepare("SELECT id FROM paineis WHERE slug = :slug");
            $stmt->bindParam(':slug', $data['slug']);
            $stmt->execute();
            
            if ($stmt->fetch()) {
                $this->sendError('Slug já existe', 409);
            }
            
            $stmt = $this->conn->prepare("
                INSERT INTO paineis (nome, slug, descricao, categoria, cor_tema, icone, configuracoes, ativo, publico, ordem)
                VALUES (:nome, :slug, :descricao, :categoria, :cor_tema, :icone, :configuracoes, :ativo, :publico, :ordem)
            ");
            
            $configuracoes = json_encode($data['configuracoes'] ?? []);
            
            $stmt->bindParam(':nome', $data['nome']);
            $stmt->bindParam(':slug', $data['slug']);
            $stmt->bindParam(':descricao', $data['descricao'] ?? '');
            $stmt->bindParam(':categoria', $data['categoria'] ?? 'Geral');
            $stmt->bindParam(':cor_tema', $data['cor_tema'] ?? '#1e40af');
            $stmt->bindParam(':icone', $data['icone'] ?? 'Layers');
            $stmt->bindParam(':configuracoes', $configuracoes);
            $stmt->bindParam(':ativo', $data['ativo'] ?? true, PDO::PARAM_BOOL);
            $stmt->bindParam(':publico', $data['publico'] ?? false, PDO::PARAM_BOOL);
            $stmt->bindParam(':ordem', $data['ordem'] ?? 0);
            
            $stmt->execute();
            $painelId = $this->conn->lastInsertId();
            
            $this->getPanelById($painelId);
        } catch (Exception $e) {
            $this->sendError('Erro ao criar painel: ' . $e->getMessage());
        }
    }

    // Atualizar painel
    public function updatePanel($painelId) {
        try {
            $data = $this->getRequestData();
            
            $stmt = $this->conn->prepare("SELECT id FROM paineis WHERE id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                $this->sendError('Painel não encontrado', 404);
            }
            
            $fields = [];
            $params = [':id' => $painelId];
            
            $allowedFields = ['nome', 'slug', 'descricao', 'categoria', 'cor_tema', 'icone', 'ativo', 'publico', 'ordem'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
                    // Verificar slug único se estiver sendo atualizado
                    if ($field === 'slug') {
                        $stmt = $this->conn->prepare("SELECT id FROM paineis WHERE slug = :slug AND id != :id");
                        $stmt->bindParam(':slug', $data[$field]);
                        $stmt->bindParam(':id', $painelId);
                        $stmt->execute();
                        
                        if ($stmt->fetch()) {
                            $this->sendError('Slug já existe', 409);
                        }
                    }
                    
                    $fields[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (isset($data['configuracoes'])) {
                $fields[] = "configuracoes = :configuracoes";
                $params[':configuracoes'] = json_encode($data['configuracoes']);
            }
            
            if (empty($fields)) {
                $this->sendError('Nenhum campo para atualizar', 400);
            }
            
            $sql = "UPDATE paineis SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            $this->getPanelById($painelId);
        } catch (Exception $e) {
            $this->sendError('Erro ao atualizar painel: ' . $e->getMessage());
        }
    }

    // Desativar painel
    public function deactivatePanel($painelId) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM paineis WHERE id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                $this->sendError('Painel não encontrado', 404);
            }
            
            $stmt = $this->conn->prepare("UPDATE paineis SET ativo = 0 WHERE id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            
            $this->sendResponse(null, 'Painel desativado com sucesso');
        } catch (Exception $e) {
            $this->sendError('Erro ao desativar painel: ' . $e->getMessage());
        }
    }

    // Reordenar painéis
    public function reorderPanels() {
        try {
            $data = $this->getRequestData();
            
            if (!isset($data['order']) || !is_array($data['order'])) {
                $this->sendError('Array de ordenação é obrigatório', 400);
            }
            
            $this->conn->beginTransaction();
            
            foreach ($data['order'] as $index => $painelId) {
                $stmt = $this->conn->prepare("UPDATE paineis SET ordem = :ordem WHERE id = :id");
                $stmt->bindParam(':ordem', $index);
                $stmt->bindParam(':id', $painelId);
                $stmt->execute();
            }
            
            $this->conn->commit();
            
            $this->sendResponse(null, 'Ordem dos painéis atualizada com sucesso');
        } catch (Exception $e) {
            $this->conn->rollback();
            $this->sendError('Erro ao reordenar painéis: ' . $e->getMessage());
        }
    }

    // Buscar painéis por categoria
    public function getPanelsByCategory($categoria) {
        try {
            $stmt = $this->conn->prepare("
                SELECT p.*, 
                       COUNT(m.id) as total_modulos,
                       COUNT(CASE WHEN m.ativo = 1 THEN 1 END) as modulos_ativos
                FROM paineis p 
                LEFT JOIN modulos m ON p.id = m.painel_id
                WHERE p.categoria = :categoria AND p.ativo = 1
                GROUP BY p.id 
                ORDER BY p.ordem ASC, p.id ASC
            ");
            $stmt->bindParam(':categoria', $categoria);
            $stmt->execute();
            $paineis = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($paineis as &$painel) {
                $painel['configuracoes'] = json_decode($painel['configuracoes'] ?? '{}', true);
                $painel['total_modulos'] = (int)$painel['total_modulos'];
                $painel['modulos_ativos'] = (int)$painel['modulos_ativos'];
                $painel['ativo'] = (bool)$painel['ativo'];
                $painel['publico'] = (bool)$painel['publico'];
            }
            
            $this->sendResponse($paineis, "Painéis da categoria '$categoria' carregados");
        } catch (Exception $e) {
            $this->sendError('Erro ao buscar painéis por categoria: ' . $e->getMessage());
        }
    }

    // Roteamento principal
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        $painelId = null;
        if (count($pathParts) >= 3 && is_numeric($pathParts[2])) {
            $painelId = (int)$pathParts[2];
        }
        
        // Rota especial para reordenação
        if ($method === 'PUT' && isset($pathParts[2]) && $pathParts[2] === 'reordenar') {
            $this->reorderPanels();
            return;
        }
        
        // Rota especial para categoria
        if ($method === 'GET' && isset($pathParts[2]) && $pathParts[2] === 'categoria' && isset($pathParts[3])) {
            $this->getPanelsByCategory($pathParts[3]);
            return;
        }
        
        switch ($method) {
            case 'GET':
                if ($painelId) {
                    $this->getPanelById($painelId);
                } else {
                    $this->getAllPanels();
                }
                break;
                
            case 'POST':
                $this->createPanel();
                break;
                
            case 'PUT':
                if (!$painelId) {
                    $this->sendError('ID obrigatório para atualização', 400);
                }
                $this->updatePanel($painelId);
                break;
                
            case 'DELETE':
                if (!$painelId) {
                    $this->sendError('ID obrigatório para desativação', 400);
                }
                $this->deactivatePanel($painelId);
                break;
                
            default:
                $this->sendError('Método não permitido', 405);
                break;
        }
    }
}

// Inicializar API
try {
    $api = new PaineisAPI();
    $api->handleRequest();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno do servidor',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>`;

  const sqlPaineis = `-- Script SQL para criação da tabela de painéis
CREATE TABLE IF NOT EXISTS paineis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    categoria ENUM('Geral', 'Consultas', 'Financeiro', 'Administrativo', 'Relatórios', 'Customizado') NOT NULL DEFAULT 'Geral',
    cor_tema VARCHAR(7) DEFAULT '#1e40af',
    icone VARCHAR(100) DEFAULT 'Layers',
    configuracoes JSON,
    ativo BOOLEAN DEFAULT TRUE,
    publico BOOLEAN DEFAULT FALSE,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_categoria (categoria),
    INDEX idx_ativo (ativo),
    INDEX idx_publico (publico),
    INDEX idx_ordem (ordem)
);

-- Tabela para módulos dos painéis
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    painel_id INT NOT NULL,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    descricao TEXT,
    tipo ENUM('consulta', 'relatorio', 'widget', 'customizado') NOT NULL DEFAULT 'consulta',
    icone VARCHAR(100) DEFAULT 'Square',
    cor_tema VARCHAR(7) DEFAULT '#1e40af',
    configuracoes JSON,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (painel_id) REFERENCES paineis(id) ON DELETE CASCADE,
    INDEX idx_painel_id (painel_id),
    INDEX idx_slug (slug),
    INDEX idx_tipo (tipo),
    INDEX idx_ativo (ativo),
    INDEX idx_ordem (ordem),
    UNIQUE KEY unique_painel_slug (painel_id, slug)
);

-- Inserir painéis de exemplo
INSERT INTO paineis (nome, slug, descricao, categoria, cor_tema, icone, ativo, publico, ordem) VALUES
('Dashboard Principal', 'dashboard-principal', 'Painel principal com visão geral do sistema', 'Geral', '#1e40af', 'LayoutDashboard', TRUE, TRUE, 1),
('Consultas Avançadas', 'consultas-avancadas', 'Painel especializado em consultas de dados', 'Consultas', '#059669', 'Search', TRUE, FALSE, 2),
('Gestão Financeira', 'gestao-financeira', 'Controle financeiro e relatórios', 'Financeiro', '#dc2626', 'DollarSign', TRUE, FALSE, 3),
('Administração', 'administracao', 'Ferramentas administrativas do sistema', 'Administrativo', '#7c3aed', 'Settings', TRUE, FALSE, 4),
('Relatórios Gerenciais', 'relatorios-gerenciais', 'Relatórios detalhados e métricas', 'Relatórios', '#f59e0b', 'FileText', TRUE, FALSE, 5);`;

  const jsExample = `// Exemplo de uso da API de Painéis com JavaScript/React
import { useState, useEffect } from 'react';

const usePaineisAPI = () => {
  const [paineis, setPaineis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer bG92YWJsZS5kZXY='
  };

  // Listar todos os painéis
  const getAllPaineis = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/paineis', {
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        setPaineis(data.data);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar painel por ID (com módulos)
  const getPainelById = async (painelId) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/paineis/\${painelId}\`, {
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Criar novo painel
  const createPainel = async (painelData) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/paineis', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(painelData)
      });
      const data = await response.json();
      
      if (data.success) {
        setPaineis(prev => [...prev, data.data]);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar painel
  const updatePainel = async (painelId, painelData) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/paineis/\${painelId}\`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(painelData)
      });
      const data = await response.json();
      
      if (data.success) {
        setPaineis(prev => prev.map(p => p.id === painelId ? data.data : p));
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Desativar painel
  const deactivatePainel = async (painelId) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/paineis/\${painelId}\`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        setPaineis(prev => prev.map(p => p.id === painelId ? {...p, ativo: false} : p));
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Reordenar painéis
  const reorderPaineis = async (orderArray) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/paineis/reordenar', {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ order: orderArray })
      });
      const data = await response.json();
      
      if (data.success) {
        // Reordenar localmente
        const reordered = [...paineis].sort((a, b) => {
          const aIndex = orderArray.indexOf(a.id);
          const bIndex = orderArray.indexOf(b.id);
          return aIndex - bIndex;
        });
        setPaineis(reordered);
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar painéis por categoria
  const getPaineisByCategory = async (categoria) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/paineis/categoria/\${categoria}\`, {
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    paineis,
    loading,
    error,
    getAllPaineis,
    getPainelById,
    createPainel,
    updatePainel,
    deactivatePainel,
    reorderPaineis,
    getPaineisByCategory
  };
};

export default usePaineisAPI;`;

  const downloadFiles = () => {
    const files = {
      'paineis/index.php': phpExample,
      'sql/paineis.sql': sqlPaineis,
      'js/paineis-api.js': jsExample,
      'README-paineis.md': `# API de Painéis - Arte Pura Design

## Estrutura de Arquivos

\`\`\`
paineis/
├── index.php          # API completa de painéis
└── config/
    └── database.php   # Configuração do banco

sql/
└── paineis.sql        # Script de criação das tabelas

js/
└── paineis-api.js     # Hook React para consumo
\`\`\`

## Sistema de Painéis

Os painéis são containers para módulos e funcionalidades:

### Categorias Disponíveis:
- Geral (dashboards principais)
- Consultas (painéis de busca)
- Financeiro (controle financeiro)
- Administrativo (ferramentas admin)
- Relatórios (métricas e relatórios)
- Customizado (painéis personalizados)

### Características:
- Slug único para cada painel
- Sistema de ordenação
- Controle de visibilidade (público/privado)
- Configurações JSON flexíveis
- Relacionamento com módulos

## Endpoints Disponíveis

- GET /api/paineis - Listar todos
- GET /api/paineis/{id} - Buscar por ID (inclui módulos)
- GET /api/paineis/categoria/{categoria} - Por categoria
- POST /api/paineis - Criar novo
- PUT /api/paineis/{id} - Atualizar
- PUT /api/paineis/reordenar - Reordenar
- DELETE /api/paineis/{id} - Desativar

## Autenticação

Todas as requisições precisam do header:
\`Authorization: Bearer bG92YWJsZS5kZXY=\`
`
    };

    let content = `=== API PAINÉIS - ARQUIVOS COMPLETOS ===\n\n`;
    
    Object.entries(files).forEach(([path, fileContent]) => {
      content += `═══════════════════════════════════════════════════════════════\n`;
      content += `📄 ARQUIVO: ${path}\n`;
      content += `═══════════════════════════════════════════════════════════════\n`;
      content += `${fileContent}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'API_Paineis_Completa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('API de Painéis baixada!', {
      description: 'Arquivos PHP, SQL e JS prontos para uso.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API de Painéis</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Documentação completa da API para gerenciamento de painéis e módulos
          </p>
        </div>
        <Button onClick={downloadFiles} className="bg-purple-600 hover:bg-purple-700">
          <Download className="h-4 w-4 mr-2" />
          Baixar API Completa
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="php">PHP Completo</TabsTrigger>
          <TabsTrigger value="sql">Banco SQL</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Endpoints da API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">GET</Badge>
                      <p className="font-mono text-sm">/api/paineis</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Listar todos os painéis</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/paineis', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">GET</Badge>
                      <p className="font-mono text-sm">/api/paineis/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Buscar painel por ID (inclui módulos)</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/paineis/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">GET</Badge>
                      <p className="font-mono text-sm">/api/paineis/categoria/consultas</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Buscar painéis por categoria</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/paineis/categoria/consultas', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-blue-600 text-white mb-2">POST</Badge>
                      <p className="font-mono text-sm">/api/paineis</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Criar novo painel</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('POST /api/paineis', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-orange-600 text-white mb-2">PUT</Badge>
                      <p className="font-mono text-sm">/api/paineis/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Atualizar painel</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('PUT /api/paineis/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-orange-600 text-white mb-2">PUT</Badge>
                      <p className="font-mono text-sm">/api/paineis/reordenar</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reordenar painéis</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('PUT /api/paineis/reordenar', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-red-600 text-white mb-2">DELETE</Badge>
                      <p className="font-mono text-sm">/api/paineis/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Desativar painel</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('DELETE /api/paineis/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="php" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Implementação PHP Completa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                  <code>{phpExample}</code>
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  size="sm"
                  onClick={() => copyToClipboard(phpExample, 'Código PHP')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Script SQL - Tabelas Painéis e Módulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{sqlPaineis}</code>
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  size="sm"
                  onClick={() => copyToClipboard(sqlPaineis, 'Script SQL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Hook React para Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                  <code>{jsExample}</code>
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  size="sm"
                  onClick={() => copyToClipboard(jsExample, 'Código React')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiReferencePanels;
