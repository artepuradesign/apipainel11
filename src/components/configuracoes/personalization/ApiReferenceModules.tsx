
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Server, Database, Code, FileText, Package } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferenceModules = () => {
  const [activeTab, setActiveTab] = useState('endpoints');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copiado para a área de transferência!`);
  };

  // Código PHP completo para o sistema de módulos
  const phpExample = `<?php
// arquivo: api/modulos/index.php - Sistema completo de Módulos
require_once '../config/database.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

class ModulosAPI {
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

    // Listar todos os módulos
    public function getAllModules() {
        try {
            $stmt = $this->conn->prepare("
                SELECT m.*, 
                       p.nome as painel_nome,
                       COUNT(u.id) as total_usuarios
                FROM modulos m 
                LEFT JOIN paineis p ON m.painel_id = p.id
                LEFT JOIN usuarios_modulos u ON m.id = u.modulo_id
                GROUP BY m.id 
                ORDER BY m.painel_id ASC, m.ordem ASC
            ");
            $stmt->execute();
            $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($modulos as &$modulo) {
                $modulo['configuracoes'] = json_decode($modulo['configuracoes'] ?? '{}', true);
                $modulo['total_usuarios'] = (int)$modulo['total_usuarios'];
            }
            
            $this->sendResponse($modulos, 'Módulos carregados com sucesso');
        } catch (Exception $e) {
            $this->sendError('Erro ao carregar módulos: ' . $e->getMessage());
        }
    }

    // Buscar módulo por ID
    public function getModuleById($moduloId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT m.*, 
                       p.nome as painel_nome,
                       COUNT(u.id) as total_usuarios
                FROM modulos m 
                LEFT JOIN paineis p ON m.painel_id = p.id
                LEFT JOIN usuarios_modulos u ON m.id = u.modulo_id
                WHERE m.id = :id
                GROUP BY m.id
            ");
            $stmt->bindParam(':id', $moduloId);
            $stmt->execute();
            $modulo = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$modulo) {
                $this->sendError('Módulo não encontrado', 404);
            }
            
            $modulo['configuracoes'] = json_decode($modulo['configuracoes'] ?? '{}', true);
            $modulo['total_usuarios'] = (int)$modulo['total_usuarios'];
            
            $this->sendResponse($modulo, 'Módulo encontrado');
        } catch (Exception $e) {
            $this->sendError('Erro ao buscar módulo: ' . $e->getMessage());
        }
    }

    // Listar módulos por painel
    public function getModulesByPanel($painelId) {
        try {
            $stmt = $this->conn->prepare("
                SELECT * FROM modulos 
                WHERE painel_id = :painel_id AND ativo = 1 
                ORDER BY ordem ASC
            ");
            $stmt->bindParam(':painel_id', $painelId);
            $stmt->execute();
            $modulos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($modulos as &$modulo) {
                $modulo['configuracoes'] = json_decode($modulo['configuracoes'] ?? '{}', true);
            }
            
            $this->sendResponse($modulos, 'Módulos do painel carregados');
        } catch (Exception $e) {
            $this->sendError('Erro ao carregar módulos do painel: ' . $e->getMessage());
        }
    }

    // Criar novo módulo
    public function createModule() {
        try {
            $data = $this->getRequestData();
            
            if (!isset($data['nome']) || empty($data['nome'])) {
                $this->sendError('Nome do módulo é obrigatório', 400);
            }
            
            if (!isset($data['painel_id']) || empty($data['painel_id'])) {
                $this->sendError('ID do painel é obrigatório', 400);
            }
            
            $stmt = $this->conn->prepare("
                INSERT INTO modulos (nome, descricao, icone, path, painel_id, preco, categoria, ativo, ordem, configuracoes)
                VALUES (:nome, :descricao, :icone, :path, :painel_id, :preco, :categoria, :ativo, :ordem, :configuracoes)
            ");
            
            $configuracoes = json_encode($data['configuracoes'] ?? []);
            
            $stmt->bindParam(':nome', $data['nome']);
            $stmt->bindParam(':descricao', $data['descricao'] ?? '');
            $stmt->bindParam(':icone', $data['icone'] ?? 'Package');
            $stmt->bindParam(':path', $data['path'] ?? '');
            $stmt->bindParam(':painel_id', $data['painel_id']);
            $stmt->bindParam(':preco', $data['preco'] ?? 'R$ 0,50');
            $stmt->bindParam(':categoria', $data['categoria'] ?? 'ferramentas');
            $stmt->bindParam(':ativo', $data['ativo'] ?? true, PDO::PARAM_BOOL);
            $stmt->bindParam(':ordem', $data['ordem'] ?? 0);
            $stmt->bindParam(':configuracoes', $configuracoes);
            
            $stmt->execute();
            $moduloId = $this->conn->lastInsertId();
            
            $this->getModuleById($moduloId);
        } catch (Exception $e) {
            $this->sendError('Erro ao criar módulo: ' . $e->getMessage());
        }
    }

    // Atualizar módulo
    public function updateModule($moduloId) {
        try {
            $data = $this->getRequestData();
            
            $stmt = $this->conn->prepare("SELECT id FROM modulos WHERE id = :id");
            $stmt->bindParam(':id', $moduloId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                $this->sendError('Módulo não encontrado', 404);
            }
            
            $fields = [];
            $params = [':id' => $moduloId];
            
            $allowedFields = ['nome', 'descricao', 'icone', 'path', 'painel_id', 'preco', 'categoria', 'ativo', 'ordem'];
            
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
            
            $sql = "UPDATE modulos SET " . implode(', ', $fields) . " WHERE id = :id";
            $stmt = $this->conn->prepare($sql);
            $stmt->execute($params);
            
            $this->getModuleById($moduloId);
        } catch (Exception $e) {
            $this->sendError('Erro ao atualizar módulo: ' . $e->getMessage());
        }
    }

    // Deletar módulo
    public function deleteModule($moduloId) {
        try {
            $stmt = $this->conn->prepare("SELECT id FROM modulos WHERE id = :id");
            $stmt->bindParam(':id', $moduloId);
            $stmt->execute();
            
            if (!$stmt->fetch()) {
                $this->sendError('Módulo não encontrado', 404);
            }
            
            $stmt = $this->conn->prepare("DELETE FROM modulos WHERE id = :id");
            $stmt->bindParam(':id', $moduloId);
            $stmt->execute();
            
            $this->sendResponse(null, 'Módulo removido com sucesso');
        } catch (Exception $e) {
            $this->sendError('Erro ao deletar módulo: ' . $e->getMessage());
        }
    }

    // Reordenar módulos
    public function reorderModules() {
        try {
            $data = $this->getRequestData();
            
            if (!isset($data['modules']) || !is_array($data['modules'])) {
                $this->sendError('Lista de módulos obrigatória', 400);
            }
            
            $this->conn->beginTransaction();
            
            foreach ($data['modules'] as $module) {
                if (!isset($module['id']) || !isset($module['ordem'])) {
                    continue;
                }
                
                $stmt = $this->conn->prepare("UPDATE modulos SET ordem = :ordem WHERE id = :id");
                $stmt->bindParam(':ordem', $module['ordem']);
                $stmt->bindParam(':id', $module['id']);
                $stmt->execute();
            }
            
            $this->conn->commit();
            $this->sendResponse(null, 'Ordem dos módulos atualizada com sucesso');
        } catch (Exception $e) {
            $this->conn->rollBack();
            $this->sendError('Erro ao reordenar módulos: ' . $e->getMessage());
        }
    }

    // Roteamento principal
    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $pathParts = explode('/', trim($path, '/'));
        
        $moduloId = null;
        if (count($pathParts) >= 3 && is_numeric($pathParts[2])) {
            $moduloId = (int)$pathParts[2];
        }
        
        // Rota especial para reordenar
        if ($method === 'PUT' && isset($pathParts[2]) && $pathParts[2] === 'reorder') {
            $this->reorderModules();
            return;
        }
        
        // Rota para módulos por painel
        if ($method === 'GET' && isset($pathParts[2]) && $pathParts[2] === 'painel' && isset($pathParts[3])) {
            $this->getModulesByPanel((int)$pathParts[3]);
            return;
        }
        
        switch ($method) {
            case 'GET':
                if ($moduloId) {
                    $this->getModuleById($moduloId);
                } else {
                    $this->getAllModules();
                }
                break;
                
            case 'POST':
                $this->createModule();
                break;
                
            case 'PUT':
                if (!$moduloId) {
                    $this->sendError('ID obrigatório para atualização', 400);
                }
                $this->updateModule($moduloId);
                break;
                
            case 'DELETE':
                if (!$moduloId) {
                    $this->sendError('ID obrigatório para exclusão', 400);
                }
                $this->deleteModule($moduloId);
                break;
                
            default:
                $this->sendError('Método não permitido', 405);
                break;
        }
    }
}

// Inicializar API
try {
    $api = new ModulosAPI();
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

  const sqlModulos = `-- Script SQL para criação da tabela de módulos
CREATE TABLE IF NOT EXISTS modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    icone VARCHAR(100) DEFAULT 'Package',
    path VARCHAR(500),
    painel_id INT NOT NULL,
    preco VARCHAR(20) DEFAULT 'R$ 0,50',
    categoria ENUM('consultas', 'relatorios', 'ferramentas', 'financeiro', 'configuracoes') DEFAULT 'ferramentas',
    ativo BOOLEAN DEFAULT TRUE,
    ordem INT DEFAULT 0,
    configuracoes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (painel_id) REFERENCES paineis(id) ON DELETE CASCADE,
    INDEX idx_painel_id (painel_id),
    INDEX idx_ativo (ativo),
    INDEX idx_ordem (ordem),
    INDEX idx_categoria (categoria)
);

-- Tabela para relacionar usuários com módulos
CREATE TABLE IF NOT EXISTS usuarios_modulos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    modulo_id INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_ativacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modulos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (usuario_id, modulo_id)
);

-- Inserir módulos de exemplo
INSERT INTO modulos (nome, descricao, icone, path, painel_id, preco, categoria, ordem) VALUES
('CPF Consultas', 'Consulta completa de CPF com dados pessoais', 'User', '/consultas/cpf', 1, 'R$ 2,50', 'consultas', 1),
('CNPJ Consultas', 'Consulta empresarial completa', 'Building', '/consultas/cnpj', 1, 'R$ 5,00', 'consultas', 2),
('Score Consultas', 'Consulta de score e histórico de crédito', 'TrendingUp', '/consultas/score', 1, 'R$ 8,00', 'consultas', 3),
('Relatório Mensal', 'Relatório detalhado mensal', 'FileText', '/relatorios/mensal', 2, 'R$ 15,00', 'relatorios', 1),
('Dashboard Analytics', 'Painel de análises avançadas', 'BarChart3', '/relatorios/analytics', 2, 'R$ 25,00', 'relatorios', 2);`;

  const jsExample = `// Exemplo de uso da API de Módulos com JavaScript/React
import { useState, useEffect } from 'react';

const useModulosAPI = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer bG92YWJsZS5kZXY='
  };

  // Listar todos os módulos
  const getAllModulos = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/modulos', {
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        setModulos(data.data);
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

  // Listar módulos por painel
  const getModulosByPanel = async (painelId) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/modulos/painel/\${painelId}\`, {
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

  // Criar novo módulo
  const createModulo = async (moduloData) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/modulos', {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(moduloData)
      });
      const data = await response.json();
      
      if (data.success) {
        setModulos(prev => [...prev, data.data]);
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

  // Atualizar módulo
  const updateModulo = async (moduloId, moduloData) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/modulos/\${moduloId}\`, {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify(moduloData)
      });
      const data = await response.json();
      
      if (data.success) {
        setModulos(prev => prev.map(m => m.id === moduloId ? data.data : m));
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

  // Deletar módulo
  const deleteModulo = async (moduloId) => {
    setLoading(true);
    try {
      const response = await fetch(\`https://api.artepuradesign.com.br/api/modulos/\${moduloId}\`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      const data = await response.json();
      
      if (data.success) {
        setModulos(prev => prev.filter(m => m.id !== moduloId));
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

  // Reordenar módulos
  const reorderModulos = async (modulosOrder) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.artepuradesign.com.br/api/modulos/reorder', {
        method: 'PUT',
        headers: apiHeaders,
        body: JSON.stringify({ modules: modulosOrder })
      });
      const data = await response.json();
      
      if (data.success) {
        await getAllModulos(); // Recarregar lista
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
    modulos,
    loading,
    error,
    getAllModulos,
    getModulosByPanel,
    createModulo,
    updateModulo,
    deleteModulo,
    reorderModulos
  };
};

export default useModulosAPI;`;

  const downloadFiles = () => {
    const files = {
      'modulos/index.php': phpExample,
      'sql/modulos.sql': sqlModulos,
      'js/modulos-api.js': jsExample,
      'README-modulos.md': `# API de Módulos - Arte Pura Design

## Estrutura de Arquivos

\`\`\`
modulos/
├── index.php          # API completa de módulos
└── config/
    └── database.php   # Configuração do banco

sql/
└── modulos.sql        # Script de criação da tabela

js/
└── modulos-api.js     # Hook React para consumo
\`\`\`

## Instalação

1. Execute o script SQL para criar a tabela
2. Configure suas credenciais no database.php
3. Coloque o index.php na pasta /api/modulos/
4. Teste: GET https://seudominio.com/api/modulos/

## Endpoints Disponíveis

- GET /api/modulos - Listar todos
- GET /api/modulos/{id} - Buscar por ID  
- GET /api/modulos/painel/{id} - Módulos por painel
- POST /api/modulos - Criar novo
- PUT /api/modulos/{id} - Atualizar
- DELETE /api/modulos/{id} - Deletar
- PUT /api/modulos/reorder - Reordenar módulos

## Autenticação

Todas as requisições precisam do header:
\`Authorization: Bearer bG92YWJsZS5kZXY=\`
`
    };

    let content = `=== API MÓDULOS - ARQUIVOS COMPLETOS ===\n\n`;
    
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
    a.download = 'API_Modulos_Completa.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('API de Módulos baixada!', {
      description: 'Arquivos PHP, SQL e JS prontos para uso.'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API de Módulos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Documentação completa da API para gerenciamento de módulos
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
                      <p className="font-mono text-sm">/api/modulos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Listar todos os módulos</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/modulos', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">GET</Badge>
                      <p className="font-mono text-sm">/api/modulos/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Buscar módulo por ID</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/modulos/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-green-600 text-white mb-2">GET</Badge>
                      <p className="font-mono text-sm">/api/modulos/painel/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Módulos por painel</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('GET /api/modulos/painel/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-blue-600 text-white mb-2">POST</Badge>
                      <p className="font-mono text-sm">/api/modulos</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Criar novo módulo</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('POST /api/modulos', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-orange-600 text-white mb-2">PUT</Badge>
                      <p className="font-mono text-sm">/api/modulos/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Atualizar módulo</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('PUT /api/modulos/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-red-600 text-white mb-2">DELETE</Badge>
                      <p className="font-mono text-sm">/api/modulos/1</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Deletar módulo</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('DELETE /api/modulos/1', 'Endpoint')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-purple-600 text-white mb-2">PUT</Badge>
                      <p className="font-mono text-sm">/api/modulos/reorder</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reordenar módulos</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('PUT /api/modulos/reorder', 'Endpoint')}
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
                Script SQL - Tabela Módulos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{sqlModulos}</code>
                </pre>
                <Button
                  className="absolute top-2 right-2"
                  size="sm"
                  onClick={() => copyToClipboard(sqlModulos, 'Script SQL')}
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

export default ApiReferenceModules;
