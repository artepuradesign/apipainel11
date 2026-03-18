
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Server, Database, Code, FileText } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferencePanel = () => {
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

class PainelsAPI {
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
                       GROUP_CONCAT(m.nome SEPARATOR ', ') as modulos_nomes
                FROM paineis p 
                LEFT JOIN modulos m ON p.id = m.painel_id AND m.ativo = 1
                GROUP BY p.id 
                ORDER BY p.ordem ASC, p.id ASC
            ");
            $stmt->execute();
            $paineis = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($paineis as &$painel) {
                $painel['configuracoes'] = json_decode($painel['configuracoes'] ?? '{}', true);
                $painel['total_modulos'] = (int)$painel['total_modulos'];
                $painel['modulos_nomes'] = $painel['modulos_nomes'] ? explode(', ', $painel['modulos_nomes']) : [];
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
                       COUNT(m.id) as total_modulos
                FROM paineis p 
                LEFT JOIN modulos m ON p.id = m.painel_id AND m.ativo = 1
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
            
            // Buscar módulos do painel
            $stmt = $this->conn->prepare("
                SELECT * FROM modulos 
                WHERE painel_id = :id AND ativo = 1 
                ORDER BY ordem ASC
            ");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            $painel['modulos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
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
            
            $stmt = $this->conn->prepare("
                INSERT INTO paineis (nome, descricao, icon, cor_primaria, cor_secundaria, layout, tema_id, ativo, ordem, configuracoes)
                VALUES (:nome, :descricao, :icon, :cor_primaria, :cor_secundaria, :layout, :tema_id, :ativo, :ordem, :configuracoes)
            ");
            
            $configuracoes = json_encode($data['configuracoes'] ?? []);
            
            $stmt->bindParam(':nome', $data['nome']);
            $stmt->bindParam(':descricao', $data['descricao'] ?? '');
            $stmt->bindParam(':icon', $data['icon'] ?? 'Layers');
            $stmt->bindParam(':cor_primaria', $data['cor_primaria'] ?? '#1e40af');
            $stmt->bindParam(':cor_secundaria', $data['cor_secundaria'] ?? '#3b82f6');
            $stmt->bindParam(':layout', $data['layout'] ?? 'grid');
            $stmt->bindParam(':tema_id', $data['tema_id'] ?? 1);
            $stmt->bindParam(':ativo', $data['ativo'] ?? true, PDO::PARAM_BOOL);
            $stmt->bindParam(':ordem', $data['ordem'] ?? 0);
            $stmt->bindParam(':configuracoes', $configuracoes);
            
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
            
            $allowedFields = ['nome', 'descricao', 'icon', 'cor_primaria', 'cor_secundaria', 'layout', 'tema_id', 'ativo', 'ordem'];
            
            foreach ($allowedFields as $field) {
                if (isset($data[$field])) {
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

    // Deletar painel
    public function deletePanel($painelId) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM paineis WHERE id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                $this->sendError('Painel não encontrado', 404);
            }
            
            // Verificar se há módulos associados
            $stmt = $this->conn->prepare("SELECT COUNT(*) as total FROM modulos WHERE painel_id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            $total = $stmt->fetch()['total'];
            
            if ($total > 0) {
                $this->sendError('Não é possível deletar painel com módulos associados', 409);
            }
            
            $stmt = $this->conn->prepare("DELETE FROM paineis WHERE id = :id");
            $stmt->bindParam(':id', $painelId);
            $stmt->execute();
            
            $this->sendResponse(null, 'Painel removido com sucesso');
        } catch (Exception $e) {
            $this->sendError('Erro ao deletar painel: ' . $e->getMessage());
        }
    }

    // Atualizar ordem dos painéis
    public function updateOrder() {
        try {
            $data = $this->getRequestData();
            
            if (!isset($data['panels']) || !is_array($data['panels'])) {
                $this->sendError('Lista de painéis obrigatória', 400);
            }
            
            $this->conn->beginTransaction();
            
            foreach ($data['panels'] as $panel) {
                if (!isset($panel['id']) || !isset($panel['ordem'])) {
                    continue;
                }
                
                $stmt = $this->conn->prepare("UPDATE paineis SET ordem = :ordem WHERE id = :id");
                $stmt->bindParam(':ordem', $panel['ordem']);
                $stmt->bindParam(':id', $panel['id']);
                $stmt->execute();
            }
            
            $this->conn->commit();
            $this->sendResponse(null, 'Ordem dos painéis atualizada com sucesso');
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->sendError('Erro ao atualizar ordem: ' . $e->getMessage());
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
        
        // Rota especial para atualizar ordem
        if ($method === 'PUT' && isset($pathParts[2]) && $pathParts[2] === 'order') {
            $this->updateOrder();
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
                    $this->sendError('ID obrigatório para exclusão', 400);
                }
                $this->deletePanel($painelId);
                break;
                
            default:
                $this->sendError('Método não permitido', 405);
                break;
        }
    }
}

// Inicializar API
try {
    $api = new PainelsAPI();
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
    descricao TEXT,
    icon VARCHAR(100) DEFAULT 'Layers',
    cor_primaria VARCHAR(7) DEFAULT '#1e40af',
    cor_secundaria VARCHAR(7) DEFAULT '#3b82f6',
    layout ENUM('grid', 'list', 'cards') DEFAULT 'grid',
    tema_id INT DEFAULT 1,
    ativo BOOLEAN DEFAULT TRUE,
    ordem INT DEFAULT 0,
    configuracoes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ativo (ativo),
    INDEX idx_ordem (ordem)
);

-- Inserir painéis padrão
INSERT INTO paineis (nome, descricao, icon, cor_primaria, layout, ordem) VALUES
('Consultas', 'Painel principal de consultas e pesquisas', 'Search', '#1e40af', 'grid', 1),
('Relatórios', 'Painel de relatórios e análises', 'BarChart3', '#059669', 'cards', 2),
('Configurações', 'Painel de configurações do sistema', 'Settings', '#dc2626', 'list', 3),
('Financeiro', 'Painel de controle financeiro', 'DollarSign', '#7c3aed', 'grid', 4);`;

  const jsExample = `// Exemplo de uso da API de Painéis com JavaScript/React
import { useState, useEffect } from 'react';

const usePainelsAPI = () => {
  const [paineis, setPaineis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer bG92YWJsZS5kZXY='
  };

  // Listar todos os painéis
  const getAllPainels = async () => {
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

  // Deletar painel
  const deletePainel = async (painelId) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/paineis/\${painelId}\`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        setPaineis(prev => prev.filter(p => p.id !== painelId));
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

  return {
    paineis,
    loading,
    error,
    getAllPainels,
    createPainel,
    updatePainel,
    deletePainel
  };
};

export default usePainelsAPI;`;

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
└── paineis.sql        # Script de criação da tabela

js/
└── paineis-api.js     # Hook React para consumo
\`\`\`

## Instalação

1. Execute o script SQL para criar a tabela
2. Configure suas credenciais no database.php
3. Coloque o index.php na pasta /api/paineis/
4. Teste: GET https://seudominio.com/api/paineis/

## Endpoints Disponíveis

- GET /api/paineis - Listar todos
- GET /api/paineis/{id} - Buscar por ID  
- POST /api/paineis - Criar novo
- PUT /api/paineis/{id} - Atualizar
- DELETE /api/paineis/{id} - Deletar
- PUT /api/paineis/order - Atualizar ordem

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
            Documentação completa da API para gerenciamento de painéis
          </p>
        </div>
        <Button onClick={downloadFiles} className="bg-blue-600 hover:bg-blue-700">
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">Buscar painel por ID</p>
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

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-red-600 text-white mb-2">DELETE</Badge>
                      <p className="font-mono text-sm">/api/paineis/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Deletar painel</p>
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

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-purple-600 text-white mb-2">PUT</Badge>
                      <p className="font-mono text-sm">/api/paineis/order</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Atualizar ordem dos painéis</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('PUT /api/paineis/order', 'Endpoint')}
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
                Script SQL - Tabela Painéis
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

export default ApiReferencePanel;
