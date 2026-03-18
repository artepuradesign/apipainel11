
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Globe, Database, Code } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferenceSitePanel = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  interface Endpoint {
    method: string;
    url: string;
    description: string;
    body?: string;
    response: string;
  }

  const endpoints: Record<string, Endpoint> = {
    getSiteInfo: {
      method: 'GET',
      url: '/api/site/info',
      description: 'Obter informações gerais do site',
      response: `{
  "success": true,
  "data": {
    "siteName": "API Painel",
    "siteDescription": "Sistema completo de consultas e dados",
    "logo": "/assets/logo.png",
    "favicon": "/assets/favicon.ico",
    "theme": "blue",
    "version": "1.0.0",
    "maintenance": false,
    "supportInfo": {
      "email": "suporte@apipainel.com",
      "phone": "+55 11 99999-9999",
      "hours": "Segunda a Sexta, 9h às 18h"
    }
  }
}`
    },
    updateSiteInfo: {
      method: 'PUT',
      url: '/api/site/info',
      description: 'Atualizar informações do site',
      body: `{
  "siteName": "Meu Site API",
  "siteDescription": "Nova descrição do site",
  "theme": "purple",
  "supportInfo": {
    "email": "novo@email.com",
    "phone": "+55 11 88888-8888"
  }
}`,
      response: `{
  "success": true,
  "message": "Informações do site atualizadas",
  "data": {
    "siteName": "Meu Site API",
    "siteDescription": "Nova descrição do site"
  }
}`
    },
    getThemes: {
      method: 'GET',
      url: '/api/site/themes',
      description: 'Listar temas disponíveis',
      response: `{
  "success": true,
  "data": [
    {
      "id": "blue",
      "name": "Azul Corporativo",
      "primary": "#3b82f6",
      "secondary": "#1e40af"
    },
    {
      "id": "purple",
      "name": "Roxo Moderno",
      "primary": "#8b5cf6",
      "secondary": "#7c3aed"
    },
    {
      "id": "green",
      "name": "Verde Natureza",
      "primary": "#10b981",
      "secondary": "#059669"
    }
  ]
}`
    },
    setTheme: {
      method: 'POST',
      url: '/api/site/theme',
      description: 'Definir tema do site',
      body: `{
  "themeId": "purple"
}`,
      response: `{
  "success": true,
  "message": "Tema aplicado com sucesso",
  "data": {
    "themeId": "purple",
    "name": "Roxo Moderno"
  }
}`
    }
  };

  const phpExamples = {
    getSiteInfo: `<?php
// arquivo: api/site/index.php - Sistema completo de Painel Geral do Site
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar autorização
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token || !validateToken($token)) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Token inválido']);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

switch ($method) {
    case 'GET':
        if (strpos($path, '/info') !== false) {
            getSiteInfo();
        } elseif (strpos($path, '/themes') !== false) {
            getThemes();
        }
        break;
    
    case 'PUT':
        if (strpos($path, '/info') !== false) {
            updateSiteInfo();
        }
        break;
    
    case 'POST':
        if (strpos($path, '/theme') !== false) {
            setTheme();
        }
        break;
}

function getSiteInfo() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM site_settings WHERE id = 1");
        $siteInfo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$siteInfo) {
            // Criar configuração padrão se não existir
            $stmt = $pdo->prepare("
                INSERT INTO site_settings (site_name, site_description, logo_url, favicon_url, theme_id, support_info) 
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                'API Painel',
                'Sistema completo de consultas e dados',
                '/assets/logo.png',
                '/assets/favicon.ico',
                'blue',
                json_encode([
                    'email' => 'suporte@apipainel.com',
                    'phone' => '+55 11 99999-9999',
                    'hours' => 'Segunda a Sexta, 9h às 18h'
                ])
            ]);
            
            $siteInfo = [
                'site_name' => 'API Painel',
                'site_description' => 'Sistema completo de consultas e dados',
                'logo_url' => '/assets/logo.png',
                'favicon_url' => '/assets/favicon.ico',
                'theme_id' => 'blue',
                'support_info' => json_encode([
                    'email' => 'suporte@apipainel.com',
                    'phone' => '+55 11 99999-9999',
                    'hours' => 'Segunda a Sexta, 9h às 18h'
                ])
            ];
        }
        
        echo json_encode([
            'success' => true,
            'data' => [
                'siteName' => $siteInfo['site_name'],
                'siteDescription' => $siteInfo['site_description'],
                'logo' => $siteInfo['logo_url'],
                'favicon' => $siteInfo['favicon_url'],
                'theme' => $siteInfo['theme_id'],
                'version' => '1.0.0',
                'maintenance' => false,
                'supportInfo' => json_decode($siteInfo['support_info'], true)
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao obter informações do site: ' . $e->getMessage()
        ]);
    }
}

function updateSiteInfo() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        return;
    }
    
    try {
        $updates = [];
        $params = [];
        
        if (isset($input['siteName'])) {
            $updates[] = 'site_name = ?';
            $params[] = $input['siteName'];
        }
        
        if (isset($input['siteDescription'])) {
            $updates[] = 'site_description = ?';
            $params[] = $input['siteDescription'];
        }
        
        if (isset($input['theme'])) {
            $updates[] = 'theme_id = ?';
            $params[] = $input['theme'];
        }
        
        if (isset($input['supportInfo'])) {
            $updates[] = 'support_info = ?';
            $params[] = json_encode($input['supportInfo']);
        }
        
        if (!empty($updates)) {
            $sql = "UPDATE site_settings SET " . implode(', ', $updates) . " WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Informações do site atualizadas',
            'data' => $input
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar informações: ' . $e->getMessage()
        ]);
    }
}

function getThemes() {
    $themes = [
        ['id' => 'blue', 'name' => 'Azul Corporativo', 'primary' => '#3b82f6', 'secondary' => '#1e40af'],
        ['id' => 'purple', 'name' => 'Roxo Moderno', 'primary' => '#8b5cf6', 'secondary' => '#7c3aed'],
        ['id' => 'green', 'name' => 'Verde Natureza', 'primary' => '#10b981', 'secondary' => '#059669'],
        ['id' => 'red', 'name' => 'Vermelho Energia', 'primary' => '#ef4444', 'secondary' => '#dc2626'],
        ['id' => 'orange', 'name' => 'Laranja Vibrante', 'primary' => '#f97316', 'secondary' => '#ea580c']
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $themes
    ]);
}

function setTheme() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $themeId = isset($input['themeId']) ? $input['themeId'] : '';
    
    if (!$themeId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID do tema é obrigatório']);
        return;
    }
    
    try {
        $stmt = $pdo->prepare("UPDATE site_settings SET theme_id = ? WHERE id = 1");
        $stmt->execute([$themeId]);
        
        $themes = [
            'blue' => 'Azul Corporativo',
            'purple' => 'Roxo Moderno',
            'green' => 'Verde Natureza',
            'red' => 'Vermelho Energia',
            'orange' => 'Laranja Vibrante'
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Tema aplicado com sucesso',
            'data' => [
                'themeId' => $themeId,
                'name' => $themes[$themeId] ?? 'Tema Desconhecido'
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao aplicar tema: ' . $e->getMessage()
        ]);
    }
}

function validateToken($token) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT id FROM api_tokens WHERE token = ? AND expires_at > NOW()");
        $stmt->execute([$token]);
        return $stmt->fetchColumn() !== false;
    } catch (Exception $e) {
        return false;
    }
}
?>`,
    
    updateSiteInfo: `<?php
// Exemplo de consumo da API do Painel Geral do Site
require_once '../config/database.php';

// Obter informações do site
function getSiteInformation() {
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.artepuradesign.com.br/api/site/info',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer SEU_TOKEN_AQUI',
            'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "<h1>" . $data['data']['siteName'] . "</h1>";
        echo "<p>" . $data['data']['siteDescription'] . "</p>";
        echo "<img src='" . $data['data']['logo'] . "' alt='Logo'>";
        
        $support = $data['data']['supportInfo'];
        echo "<div class='support-info'>";
        echo "<h3>Suporte:</h3>";
        echo "<p>Email: " . $support['email'] . "</p>";
        echo "<p>Telefone: " . $support['phone'] . "</p>";
        echo "<p>Horário: " . $support['hours'] . "</p>";
        echo "</div>";
        
        return $data['data'];
    } else {
        echo "Erro ao carregar informações do site";
        return false;
    }
}

// Atualizar informações do site
function updateSiteInformation($siteData) {
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.artepuradesign.com.br/api/site/info',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PUT',
        CURLOPT_POSTFIELDS => json_encode($siteData),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer SEU_TOKEN_AQUI',
            'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    curl_close($curl);
    
    $result = json_decode($response, true);
    echo $result['success'] ? 'Site atualizado!' : 'Erro na atualização!';
    return $result['success'];
}

// Listar temas disponíveis
function listAvailableThemes() {
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.artepuradesign.com.br/api/site/themes',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer SEU_TOKEN_AQUI'
        ),
    ));
    
    $response = curl_exec($curl);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        echo "<select name='theme' id='themeSelector'>";
        foreach ($data['data'] as $theme) {
            echo "<option value='" . $theme['id'] . "' style='color: " . $theme['primary'] . "'>";
            echo $theme['name'] . "</option>";
        }
        echo "</select>";
        return $data['data'];
    }
    return false;
}

// Exemplo de uso completo
$siteInfo = getSiteInformation();

if ($siteInfo) {
    echo "<hr>";
    echo "<h2>Temas Disponíveis:</h2>";
    listAvailableThemes();
    
    // Atualizar informações
    $newData = array(
        'siteName' => 'Meu Site Personalizado',
        'siteDescription' => 'Nova descrição do meu site',
        'theme' => 'purple'
    );
    
    updateSiteInformation($newData);
}
?>`
  };

  const sqlStructure = `-- Estrutura do banco de dados para Painel Geral do Site

CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    site_name VARCHAR(100) NOT NULL DEFAULT 'API Painel',
    site_description TEXT,
    logo_url VARCHAR(255) DEFAULT '/assets/logo.png',
    favicon_url VARCHAR(255) DEFAULT '/assets/favicon.ico',
    theme_id VARCHAR(50) DEFAULT 'blue',
    support_info JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_themes (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    primary_color VARCHAR(7) NOT NULL,
    secondary_color VARCHAR(7) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão
INSERT INTO site_settings (site_name, site_description, support_info) VALUES
('API Painel', 'Sistema completo de consultas e dados', JSON_OBJECT(
    'email', 'suporte@apipainel.com',
    'phone', '+55 11 99999-9999',
    'hours', 'Segunda a Sexta, 9h às 18h'
)) ON DUPLICATE KEY UPDATE id = id;

-- Inserir temas padrão
INSERT INTO site_themes (id, name, primary_color, secondary_color) VALUES
('blue', 'Azul Corporativo', '#3b82f6', '#1e40af'),
('purple', 'Roxo Moderno', '#8b5cf6', '#7c3aed'),
('green', 'Verde Natureza', '#10b981', '#059669'),
('red', 'Vermelho Energia', '#ef4444', '#dc2626'),
('orange', 'Laranja Vibrante', '#f97316', '#ea580c')
ON DUPLICATE KEY UPDATE name = VALUES(name);`;

  const frontendExample = `// Frontend React - Painel Geral do Site
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SitePanelManager = () => {
  const [siteInfo, setSiteInfo] = useState({});
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSiteInfo();
    loadThemes();
  }, []);

  const loadSiteInfo = async () => {
    try {
      const response = await axios.get('https://api.artepuradesign.com.br/api/site/info', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
        }
      });

      if (response.data.success) {
        setSiteInfo(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do site:', error);
    }
  };

  const loadThemes = async () => {
    try {
      const response = await axios.get('https://api.artepuradesign.com.br/api/site/themes', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
        }
      });

      if (response.data.success) {
        setThemes(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSiteInfo = async (newInfo) => {
    setUpdating(true);
    try {
      const response = await axios.put('https://api.artepuradesign.com.br/api/site/info', newInfo, {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSiteInfo(prev => ({ ...prev, ...newInfo }));
        alert('Informações atualizadas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setUpdating(false);
    }
  };

  const changeTheme = async (themeId) => {
    try {
      await axios.post('https://api.artepuradesign.com.br/api/site/theme', 
        { themeId }, 
        {
          headers: {
            'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setSiteInfo(prev => ({ ...prev, theme: themeId }));
      alert('Tema aplicado com sucesso!');
    } catch (error) {
      console.error('Erro ao alterar tema:', error);
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="site-panel-manager">
      <header>
        <img src={siteInfo.logo} alt="Logo" style={{ height: '50px' }} />
        <h1>{siteInfo.siteName}</h1>
        <p>{siteInfo.siteDescription}</p>
      </header>

      <div className="theme-selector">
        <h3>Selecionar Tema:</h3>
        <div className="themes-grid">
          {themes.map(theme => (
            <div 
              key={theme.id}
              className="theme-option"
              style={{ 
                backgroundColor: theme.primary,
                border: siteInfo.theme === theme.id ? '3px solid #000' : 'none'
              }}
              onClick={() => changeTheme(theme.id)}
            >
              <span style={{ color: 'white' }}>{theme.name}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        updateSiteInfo({
          siteName: formData.get('siteName'),
          siteDescription: formData.get('siteDescription')
        });
      }}>
        <div>
          <label>Nome do Site:</label>
          <input name="siteName" defaultValue={siteInfo.siteName} />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea name="siteDescription" defaultValue={siteInfo.siteDescription} />
        </div>
        <button type="submit" disabled={updating}>
          {updating ? 'Atualizando...' : 'Atualizar'}
        </button>
      </form>

      <div className="support-info">
        <h3>Informações de Suporte:</h3>
        <p>Email: {siteInfo.supportInfo?.email}</p>
        <p>Telefone: {siteInfo.supportInfo?.phone}</p>
        <p>Horário: {siteInfo.supportInfo?.hours}</p>
      </div>
    </div>
  );
};

export default SitePanelManager;`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="endpoints" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="php">PHP Completo</TabsTrigger>
          <TabsTrigger value="database">Banco SQL</TabsTrigger>
          <TabsTrigger value="frontend">Frontend</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints" className="space-y-4">
          {Object.entries(endpoints).map(([key, endpoint]) => (
            <Card key={key} className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                      className={endpoint.method === 'GET' ? 'bg-green-500' : 'bg-blue-500'}
                    >
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      https://api.artepuradesign.com.br{endpoint.url}
                    </code>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`https://api.artepuradesign.com.br${endpoint.url}`, key)}
                  >
                    {copiedEndpoint === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {endpoint.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {endpoint.body && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Body da Requisição:</h4>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                      <code>{endpoint.body}</code>
                    </pre>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-2">Resposta:</h4>
                  <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs overflow-x-auto">
                    <code>{endpoint.response}</code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="php" className="space-y-4">
          {Object.entries(phpExamples).map(([key, code]) => (
            <Card key={key} className="border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {key === 'getSiteInfo' && 'API Completa - Painel Geral do Site'}
                    {key === 'updateSiteInfo' && 'Exemplo de Consumo da API'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(code, key)}
                  >
                    {copiedEndpoint === key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto">
                  <code>{code}</code>
                </pre>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Estrutura SQL Completa
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(sqlStructure, 'sql')}
                >
                  {copiedEndpoint === 'sql' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto">
                <code>{sqlStructure}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="frontend" className="space-y-4">
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Frontend React - Painel Geral do Site
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(frontendExample, 'frontend')}
                >
                  {copiedEndpoint === 'frontend' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded text-xs overflow-x-auto">
                <code>{frontendExample}</code>
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ApiReferenceSitePanel;
