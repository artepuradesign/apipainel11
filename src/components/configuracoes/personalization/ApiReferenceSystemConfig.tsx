
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Server, Database, Settings, Globe } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferenceSystemConfig = () => {
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
    getSystemConfig: {
      method: 'GET',
      url: '/api/system/config',
      description: 'Obter configurações gerais do sistema',
      response: `{
  "success": true,
  "data": {
    "siteName": "API Painel",
    "siteDescription": "Sistema completo de consultas e dados",
    "maintenanceMode": false,
    "registrationEnabled": true,
    "maxDailyConsultations": 100,
    "welcomeBonus": 5.00,
    "minWithdrawalAmount": 100.00,
    "maxWithdrawalAmount": 5000.00,
    "supportEmail": "suporte@apipainel.com",
    "supportPhone": "+55 11 99999-9999",
    "systemCurrency": "BRL",
    "autoApproveRegistrations": false,
    "apiTimeout": 30,
    "maxFileUploadSize": 5
  }
}`
    },
    updateSystemConfig: {
      method: 'PUT',
      url: '/api/system/config',
      description: 'Atualizar configurações do sistema',
      body: `{
  "siteName": "Meu API Painel",
  "siteDescription": "Sistema personalizado",
  "welcomeBonus": 10.00,
  "minWithdrawalAmount": 50.00,
  "maxWithdrawalAmount": 10000.00,
  "supportEmail": "novo@email.com"
}`,
      response: `{
  "success": true,
  "message": "Configurações atualizadas com sucesso",
  "data": {
    "siteName": "Meu API Painel",
    "siteDescription": "Sistema personalizado"
  }
}`
    },
    getMaintenanceStatus: {
      method: 'GET',
      url: '/api/system/maintenance',
      description: 'Verificar status de manutenção',
      response: `{
  "success": true,
  "data": {
    "maintenanceMode": false,
    "scheduledMaintenance": null,
    "lastMaintenance": "2024-01-15T10:00:00Z"
  }
}`
    },
    toggleMaintenance: {
      method: 'POST',
      url: '/api/system/maintenance/toggle',
      description: 'Ativar/Desativar modo de manutenção',
      body: `{
  "enabled": true,
  "message": "Sistema em manutenção programada"
}`,
      response: `{
  "success": true,
  "message": "Modo de manutenção ativado",
  "data": {
    "maintenanceMode": true,
    "message": "Sistema em manutenção programada"
  }
}`
    }
  };

  const phpExamples = {
    systemConfigApi: `<?php
// arquivo: api/system/index.php - Sistema completo de Configuração do Sistema
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
        if (strpos($path, '/config') !== false) {
            getSystemConfig();
        } elseif (strpos($path, '/maintenance') !== false) {
            getMaintenanceStatus();
        }
        break;
    
    case 'PUT':
        if (strpos($path, '/config') !== false) {
            updateSystemConfig();
        }
        break;
    
    case 'POST':
        if (strpos($path, '/maintenance/toggle') !== false) {
            toggleMaintenance();
        }
        break;
}

function getSystemConfig() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT config_key, config_value, config_type FROM system_config");
        $configs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $systemConfig = [];
        foreach ($configs as $config) {
            $value = $config['config_value'];
            
            // Converter valor baseado no tipo
            switch ($config['config_type']) {
                case 'boolean':
                    $value = (bool) $value;
                    break;
                case 'number':
                    $value = is_numeric($value) ? (float) $value : $value;
                    break;
                case 'json':
                    $value = json_decode($value, true);
                    break;
            }
            
            $systemConfig[$config['config_key']] = $value;
        }
        
        echo json_encode([
            'success' => true,
            'data' => $systemConfig
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao obter configurações: ' . $e->getMessage()
        ]);
    }
}

function updateSystemConfig() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        $updated = [];
        foreach ($input as $key => $value) {
            // Determinar tipo do valor
            $type = 'string';
            if (is_bool($value)) {
                $type = 'boolean';
                $value = $value ? '1' : '0';
            } elseif (is_numeric($value)) {
                $type = 'number';
            } elseif (is_array($value)) {
                $type = 'json';
                $value = json_encode($value);
            }
            
            $stmt = $pdo->prepare("
                INSERT INTO system_config (config_key, config_value, config_type, updated_at) 
                VALUES (?, ?, ?, NOW()) 
                ON DUPLICATE KEY UPDATE 
                config_value = VALUES(config_value), 
                config_type = VALUES(config_type), 
                updated_at = NOW()
            ");
            
            $stmt->execute([$key, $value, $type]);
            $updated[$key] = $input[$key];
        }
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Configurações atualizadas com sucesso',
            'data' => $updated
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao atualizar configurações: ' . $e->getMessage()
        ]);
    }
}

function getMaintenanceStatus() {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT config_value FROM system_config WHERE config_key = 'maintenanceMode'");
        $stmt->execute();
        $maintenance = $stmt->fetchColumn();
        
        $stmt = $pdo->prepare("SELECT updated_at FROM system_config WHERE config_key = 'maintenanceMode'");
        $stmt->execute();
        $lastUpdate = $stmt->fetchColumn();
        
        echo json_encode([
            'success' => true,
            'data' => [
                'maintenanceMode' => (bool) $maintenance,
                'scheduledMaintenance' => null,
                'lastMaintenance' => $lastUpdate
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao obter status de manutenção: ' . $e->getMessage()
        ]);
    }
}

function toggleMaintenance() {
    global $pdo;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $enabled = isset($input['enabled']) ? (bool) $input['enabled'] : false;
    $message = isset($input['message']) ? $input['message'] : '';
    
    try {
        $stmt = $pdo->prepare("
            INSERT INTO system_config (config_key, config_value, config_type, updated_at) 
            VALUES ('maintenanceMode', ?, 'boolean', NOW()) 
            ON DUPLICATE KEY UPDATE 
            config_value = VALUES(config_value), 
            updated_at = NOW()
        ");
        
        $stmt->execute([$enabled ? '1' : '0']);
        
        if ($message) {
            $stmt = $pdo->prepare("
                INSERT INTO system_config (config_key, config_value, config_type, updated_at) 
                VALUES ('maintenanceMessage', ?, 'string', NOW()) 
                ON DUPLICATE KEY UPDATE 
                config_value = VALUES(config_value), 
                updated_at = NOW()
            ");
            $stmt->execute([$message]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Modo de manutenção ' . ($enabled ? 'ativado' : 'desativado'),
            'data' => [
                'maintenanceMode' => $enabled,
                'message' => $message
            ]
        ]);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Erro ao alterar modo de manutenção: ' . $e->getMessage()
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
    
    consumeApi: `<?php
// Exemplo de consumo da API de Configuração do Sistema
require_once '../config/database.php';

// Obter configurações do sistema
function getSystemConfigurations() {
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.artepuradesign.com.br/api/system/config',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer SEU_TOKEN_AQUI',
            'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $data = json_decode($response, true);
    
    if ($httpCode == 200 && $data['success']) {
        echo "<h2>Configurações do Sistema:</h2>";
        echo "<p><strong>Site:</strong> " . $data['data']['siteName'] . "</p>";
        echo "<p><strong>Descrição:</strong> " . $data['data']['siteDescription'] . "</p>";
        echo "<p><strong>Bônus de Boas-vindas:</strong> R$ " . number_format($data['data']['welcomeBonus'], 2, ',', '.') . "</p>";
        echo "<p><strong>Saque Mínimo:</strong> R$ " . number_format($data['data']['minWithdrawalAmount'], 2, ',', '.') . "</p>";
        echo "<p><strong>Saque Máximo:</strong> R$ " . number_format($data['data']['maxWithdrawalAmount'], 2, ',', '.') . "</p>";
        echo "<p><strong>Manutenção:</strong> " . ($data['data']['maintenanceMode'] ? 'Ativo' : 'Inativo') . "</p>";
        
        return $data['data'];
    } else {
        echo "Erro ao obter configurações do sistema";
        return false;
    }
}

// Atualizar configurações
function updateSystemConfigurations($configs) {
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://api.artepuradesign.com.br/api/system/config',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'PUT',
        CURLOPT_POSTFIELDS => json_encode($configs),
        CURLOPT_HTTPHEADER => array(
            'Authorization: Bearer SEU_TOKEN_AQUI',
            'Content-Type: application/json'
        ),
    ));
    
    $response = curl_exec($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
    
    $result = json_decode($response, true);
    
    if ($httpCode == 200 && $result['success']) {
        echo "Configurações atualizadas com sucesso!";
        return true;
    } else {
        echo "Erro ao atualizar configurações: " . ($result['message'] ?? 'Erro desconhecido');
        return false;
    }
}

// Exemplo de uso
$configs = getSystemConfigurations();

if ($configs) {
    // Atualizar algumas configurações
    $newConfigs = array(
        'siteName' => 'Meu Site Personalizado',
        'welcomeBonus' => 15.00,
        'minWithdrawalAmount' => 75.00
    );
    
    updateSystemConfigurations($newConfigs);
}
?>`
  };

  const sqlStructure = `-- Estrutura do banco de dados para Configuração do Sistema

CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_config_key (config_key)
);

CREATE TABLE IF NOT EXISTS api_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);

-- Inserir configurações padrão
INSERT INTO system_config (config_key, config_value, config_type) VALUES
('siteName', 'API Painel', 'string'),
('siteDescription', 'Sistema completo de consultas e dados', 'string'),
('maintenanceMode', '0', 'boolean'),
('registrationEnabled', '1', 'boolean'),
('maxDailyConsultations', '100', 'number'),
('welcomeBonus', '5.00', 'number'),
('minWithdrawalAmount', '100.00', 'number'),
('maxWithdrawalAmount', '5000.00', 'number'),
('supportEmail', 'suporte@apipainel.com', 'string'),
('supportPhone', '+55 11 99999-9999', 'string'),
('systemCurrency', 'BRL', 'string'),
('autoApproveRegistrations', '0', 'boolean'),
('apiTimeout', '30', 'number'),
('maxFileUploadSize', '5', 'number')
ON DUPLICATE KEY UPDATE config_key = config_key;`;

  const frontendExample = `// Frontend React - Configuração do Sistema
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemConfigManager = () => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadSystemConfig();
  }, []);

  const loadSystemConfig = async () => {
    try {
      const response = await axios.get('https://api.artepuradesign.com.br/api/system/config', {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    setUpdating(true);
    try {
      const response = await axios.put('https://api.artepuradesign.com.br/api/system/config', newConfig, {
        headers: {
          'Authorization': \`Bearer \${localStorage.getItem('apiToken')}\`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setConfig(prev => ({ ...prev, ...newConfig }));
        alert('Configurações atualizadas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar configurações');
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newConfig = {
      siteName: formData.get('siteName'),
      siteDescription: formData.get('siteDescription'),
      welcomeBonus: parseFloat(formData.get('welcomeBonus')),
      minWithdrawalAmount: parseFloat(formData.get('minWithdrawalAmount')),
      maxWithdrawalAmount: parseFloat(formData.get('maxWithdrawalAmount'))
    };
    updateConfig(newConfig);
  };

  if (loading) return <div>Carregando configurações...</div>;

  return (
    <div className="system-config-manager">
      <h2>Configuração do Sistema</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome do Site:</label>
          <input 
            name="siteName" 
            defaultValue={config.siteName} 
            required 
          />
        </div>
        <div>
          <label>Descrição:</label>
          <textarea 
            name="siteDescription" 
            defaultValue={config.siteDescription}
          />
        </div>
        <div>
          <label>Bônus de Boas-vindas (R$):</label>
          <input 
            name="welcomeBonus" 
            type="number" 
            step="0.01"
            defaultValue={config.welcomeBonus} 
          />
        </div>
        <div>
          <label>Saque Mínimo (R$):</label>
          <input 
            name="minWithdrawalAmount" 
            type="number" 
            step="0.01"
            defaultValue={config.minWithdrawalAmount} 
          />
        </div>
        <div>
          <label>Saque Máximo (R$):</label>
          <input 
            name="maxWithdrawalAmount" 
            type="number" 
            step="0.01"
            defaultValue={config.maxWithdrawalAmount} 
          />
        </div>
        <button type="submit" disabled={updating}>
          {updating ? 'Atualizando...' : 'Atualizar Configurações'}
        </button>
      </form>
    </div>
  );
};

export default SystemConfigManager;`;

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
                    {key === 'systemConfigApi' && 'API Completa - Sistema de Configuração'}
                    {key === 'consumeApi' && 'Exemplo de Consumo da API'}
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
                  Frontend React - Gerenciador de Configurações
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

export default ApiReferenceSystemConfig;
