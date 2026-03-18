
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Database, Code, Globe, User, Settings, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ApiReferenceUser = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const phpCode = `<?php
// arquivo: api/user/index.php - Sistema completo de Usuário
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

class UserAPI {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Obter dados do usuário
    public function getUser($user_id) {
        $query = "SELECT u.*, up.* FROM users u 
                 LEFT JOIN user_preferences up ON u.id = up.user_id 
                 WHERE u.id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'login' => $user['login'],
                    'email' => $user['email'],
                    'full_name' => $user['full_name'],
                    'cpf' => $user['cpf'],
                    'data_nascimento' => $user['data_nascimento'],
                    'telefone' => $user['telefone'],
                    'cep' => $user['cep'],
                    'endereco' => $user['endereco'],
                    'numero' => $user['numero'],
                    'bairro' => $user['bairro'],
                    'cidade' => $user['cidade'],
                    'estado' => $user['estado'],
                    'tipoplano' => $user['tipoplano'],
                    'saldo' => $user['saldo'],
                    'status' => $user['status'],
                    'user_role' => $user['user_role'],
                    'indicador_id' => $user['indicador_id'],
                    'created_at' => $user['created_at'],
                    'updated_at' => $user['updated_at'],
                    'preferences' => [
                        'emailNotifications' => (bool)$user['email_notifications'],
                        'pushNotifications' => (bool)$user['push_notifications'],
                        'smsNotifications' => (bool)$user['sms_notifications'],
                        'marketingEmails' => (bool)$user['marketing_emails'],
                        'securityAlerts' => (bool)$user['security_alerts'],
                        'compactView' => (bool)$user['compact_view'],
                        'showBalance' => (bool)$user['show_balance'],
                        'autoLogout' => (bool)$user['auto_logout']
                    ]
                ]
            ];
        }
        
        return ['success' => false, 'message' => 'Usuário não encontrado'];
    }
    
    // Atualizar dados do usuário
    public function updateUser($user_id, $data) {
        $updateFields = [];
        $params = [':user_id' => $user_id];
        
        $allowedFields = [
            'login', 'email', 'full_name', 'cpf', 'data_nascimento', 
            'telefone', 'cep', 'endereco', 'numero', 'bairro', 
            'cidade', 'estado', 'tipoplano'
        ];
        
        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateFields[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }
        
        if (empty($updateFields)) {
            return ['success' => false, 'message' => 'Nenhum campo para atualizar'];
        }
        
        $updateFields[] = "updated_at = NOW()";
        $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params) ? 
            ['success' => true, 'message' => 'Usuário atualizado com sucesso'] :
            ['success' => false, 'message' => 'Erro ao atualizar usuário'];
    }
    
    // Alterar senhas
    public function updatePasswords($user_id, $passwords, $birthDate) {
        // Verificar data de nascimento
        $query = "SELECT data_nascimento FROM users WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user || $user['data_nascimento'] !== $birthDate) {
            return ['success' => false, 'message' => 'Data de nascimento incorreta'];
        }
        
        $updateFields = [];
        $params = [':user_id' => $user_id];
        
        if (isset($passwords['senhaalfa'])) {
            $updateFields[] = "senhaalfa = :senhaalfa";
            $params[':senhaalfa'] = password_hash($passwords['senhaalfa'], PASSWORD_DEFAULT);
        }
        
        if (isset($passwords['senha4'])) {
            $updateFields[] = "senha4 = :senha4";
            $params[':senha4'] = $passwords['senha4'];
        }
        
        if (isset($passwords['senha6'])) {
            $updateFields[] = "senha6 = :senha6";
            $params[':senha6'] = $passwords['senha6'];
        }
        
        if (isset($passwords['senha8'])) {
            $updateFields[] = "senha8 = :senha8";
            $params[':senha8'] = $passwords['senha8'];
        }
        
        if (empty($updateFields)) {
            return ['success' => false, 'message' => 'Nenhuma senha para atualizar'];
        }
        
        $updateFields[] = "updated_at = NOW()";
        $query = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        return $stmt->execute($params) ?
            ['success' => true, 'message' => 'Senhas atualizadas com sucesso'] :
            ['success' => false, 'message' => 'Erro ao atualizar senhas'];
    }
    
    // Atualizar preferências
    public function updatePreferences($user_id, $preferences) {
        $query = "INSERT INTO user_preferences (
            user_id, email_notifications, push_notifications, sms_notifications,
            marketing_emails, security_alerts, compact_view, show_balance, auto_logout,
            updated_at
        ) VALUES (
            :user_id, :email_notifications, :push_notifications, :sms_notifications,
            :marketing_emails, :security_alerts, :compact_view, :show_balance, :auto_logout,
            NOW()
        ) ON DUPLICATE KEY UPDATE
            email_notifications = :email_notifications,
            push_notifications = :push_notifications,
            sms_notifications = :sms_notifications,
            marketing_emails = :marketing_emails,
            security_alerts = :security_alerts,
            compact_view = :compact_view,
            show_balance = :show_balance,
            auto_logout = :auto_logout,
            updated_at = NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':email_notifications', $preferences['emailNotifications']);
        $stmt->bindParam(':push_notifications', $preferences['pushNotifications']);
        $stmt->bindParam(':sms_notifications', $preferences['smsNotifications']);
        $stmt->bindParam(':marketing_emails', $preferences['marketingEmails']);
        $stmt->bindParam(':security_alerts', $preferences['securityAlerts']);
        $stmt->bindParam(':compact_view', $preferences['compactView']);
        $stmt->bindParam(':show_balance', $preferences['showBalance']);
        $stmt->bindParam(':auto_logout', $preferences['autoLogout']);
        
        return $stmt->execute() ?
            ['success' => true, 'message' => 'Preferências atualizadas com sucesso'] :
            ['success' => false, 'message' => 'Erro ao atualizar preferências'];
    }
}

// Processar requisições
$method = $_SERVER['REQUEST_METHOD'];
$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'ID do usuário é obrigatório']);
    exit;
}

$userAPI = new UserAPI($pdo);

switch ($method) {
    case 'GET':
        echo json_encode($userAPI->getUser($user_id));
        break;
        
    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] === 'updatePasswords') {
            echo json_encode($userAPI->updatePasswords($user_id, $data['passwords'], $data['birthDate']));
        } elseif (isset($data['action']) && $data['action'] === 'updatePreferences') {
            echo json_encode($userAPI->updatePreferences($user_id, $data['preferences']));
        } else {
            echo json_encode($userAPI->updateUser($user_id, $data));
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Método não permitido']);
}
?>`;

  const sqlCode = `-- Estrutura de banco de dados para usuários e preferências

-- Tabela principal de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senhaalfa VARCHAR(255),
    senha4 VARCHAR(4),
    senha6 VARCHAR(6),
    senha8 VARCHAR(8),
    full_name VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    data_nascimento DATE,
    telefone VARCHAR(15),
    cep VARCHAR(10),
    endereco VARCHAR(200),
    numero VARCHAR(10),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    tipoplano VARCHAR(50) DEFAULT 'Pré-Pago',
    data_inicio DATE,
    data_fim DATE,
    user_role ENUM('assinante', 'suporte') DEFAULT 'assinante',
    status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'pendente',
    saldo DECIMAL(10,2) DEFAULT 0.00,
    saldo_atualizado BOOLEAN DEFAULT FALSE,
    aceite_termos BOOLEAN DEFAULT FALSE,
    indicador_id INT,
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_status (status),
    INDEX idx_user_role (user_role),
    INDEX idx_indicador (indicador_id)
);

-- Tabela de preferências do usuário
CREATE TABLE user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    security_alerts BOOLEAN DEFAULT TRUE,
    compact_view BOOLEAN DEFAULT FALSE,
    show_balance BOOLEAN DEFAULT TRUE,
    auto_logout BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_preferences (user_id)
);

-- Inserir dados de exemplo
INSERT INTO users (login, email, full_name, cpf, data_nascimento, tipoplano, status, user_role) VALUES
('admin', 'admin@exemplo.com', 'Administrador do Sistema', '123.456.789-00', '1990-01-01', 'Premium', 'ativo', 'suporte'),
('usuario1', 'usuario1@exemplo.com', 'João Silva', '987.654.321-00', '1985-05-15', 'Pré-Pago', 'ativo', 'assinante');

-- Inserir preferências padrão
INSERT INTO user_preferences (user_id, email_notifications, push_notifications, security_alerts) VALUES
(1, TRUE, TRUE, TRUE),
(2, TRUE, FALSE, TRUE);`;

  const frontendCode = `// Exemplo de uso da API de Usuário no Frontend React

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const UserAPI = {
  baseURL: 'https://api.artepuradesign.com.br/api/user',
  
  // Obter dados do usuário
  async getUser(userId: number) {
    try {
      const response = await fetch(\`\${this.baseURL}?user_id=\${userId}\`);
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },
  
  // Atualizar informações pessoais
  async updateUser(userId: number, userData: any) {
    try {
      const response = await fetch(\`\${this.baseURL}?user_id=\${userId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },
  
  // Alterar senhas
  async updatePasswords(userId: number, passwords: any, birthDate: string) {
    try {
      const response = await fetch(\`\${this.baseURL}?user_id=\${userId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePasswords',
          passwords,
          birthDate
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar senhas:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  },
  
  // Atualizar preferências
  async updatePreferences(userId: number, preferences: any) {
    try {
      const response = await fetch(\`\${this.baseURL}?user_id=\${userId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePreferences',
          preferences
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      return { success: false, message: 'Erro de conexão' };
    }
  }
};

// Hook personalizado para gerenciar dados do usuário
export const useUserData = (userId: number) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const loadUserData = async () => {
    setLoading(true);
    const result = await UserAPI.getUser(userId);
    if (result.success) {
      setUserData(result.user);
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
  
  const updateUserInfo = async (data: any) => {
    setLoading(true);
    const result = await UserAPI.updateUser(userId, data);
    if (result.success) {
      toast.success('Informações atualizadas!');
      await loadUserData();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
  
  const changePasswords = async (passwords: any, birthDate: string) => {
    setLoading(true);
    const result = await UserAPI.updatePasswords(userId, passwords, birthDate);
    if (result.success) {
      toast.success('Senhas alteradas com sucesso!');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
  
  const savePreferences = async (preferences: any) => {
    setLoading(true);
    const result = await UserAPI.updatePreferences(userId, preferences);
    if (result.success) {
      toast.success('Preferências salvas!');
      await loadUserData();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);
  
  return {
    userData,
    loading,
    updateUserInfo,
    changePasswords,
    savePreferences,
    reload: loadUserData
  };
};

export default UserAPI;`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-600" />
          Referência da API - Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Endpoints */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-green-600" />
            Endpoints da API
          </h3>
          <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <code className="text-sm">GET https://api.artepuradesign.com.br/api/user?user_id={'{id}'}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('GET https://api.artepuradesign.com.br/api/user?user_id={id}', 'endpoint-get')}
              >
                <Copy className="h-4 w-4" />
                {copiedSection === 'endpoint-get' ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <code className="text-sm">PUT https://api.artepuradesign.com.br/api/user?user_id={'{id}'}</code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('PUT https://api.artepuradesign.com.br/api/user?user_id={id}', 'endpoint-put')}
              >
                <Copy className="h-4 w-4" />
                {copiedSection === 'endpoint-put' ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
        </div>

        {/* PHP Completo */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            PHP Completo
          </h3>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(phpCode, 'php')}
            >
              <Copy className="h-4 w-4" />
              {copiedSection === 'php' ? 'Copiado!' : 'Copiar'}
            </Button>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{phpCode}</code>
            </pre>
          </div>
        </div>

        {/* Banco SQL */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Database className="h-5 w-5 text-orange-600" />
            Estrutura do Banco de Dados
          </h3>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(sqlCode, 'sql')}
            >
              <Copy className="h-4 w-4" />
              {copiedSection === 'sql' ? 'Copiado!' : 'Copiar'}
            </Button>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{sqlCode}</code>
            </pre>
          </div>
        </div>

        {/* Frontend */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-600" />
            Exemplo Frontend React
          </h3>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 z-10"
              onClick={() => copyToClipboard(frontendCode, 'frontend')}
            >
              <Copy className="h-4 w-4" />
              {copiedSection === 'frontend' ? 'Copiado!' : 'Copiar'}
            </Button>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{frontendCode}</code>
            </pre>
          </div>
        </div>

        {/* Funcionalidades Disponíveis */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Funcionalidades Disponíveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Informações pessoais completas</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm">Alteração de senhas segura</span>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Preferências do sistema</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Configurações de notificação</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <span className="text-sm">Dados de endereço completos</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-600" />
                <span className="text-sm">Validação por data de nascimento</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiReferenceUser;
