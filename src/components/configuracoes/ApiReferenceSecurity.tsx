import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const ApiReferenceSecurity = () => {
  const { isSupport } = useAuth();
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});

  // Só renderizar para usuários de suporte
  if (!isSupport) {
    return null;
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [key]: true }));
    toast.success('Código copiado!');
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const jsonStructure = {
    passwords: {
      senhaalfa: "string (senha alfanumérica principal, máx 16 caracteres)",
      senha4: "string (senha numérica de 4 dígitos)",
      senha6: "string (senha numérica de 6 dígitos)", 
      senha8: "string (senha numérica de 8 dígitos)"
    },
    validation: {
      current_password: "string (senha atual para alteração)",
      birth_date: "string (data de nascimento para alteração da senha principal)",
      new_password: "string (nova senha)",
      password_type: "enum ('senhaalfa' | 'senha4' | 'senha6' | 'senha8')"
    }
  };

  const phpApiExample = `<?php
// Endpoint: PUT /api/users/security
// Atualizar senhas de segurança

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Conectar ao banco
$servername = "localhost";
$username = "seu_usuario";
$password = "sua_senha";
$dbname = "seu_banco";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['user_id'];
        $passwordType = $input['password_type'];
        $newPassword = $input['new_password'];
        
        // Buscar dados do usuário
        $sql = "SELECT senhaalfa, data_nascimento FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
            exit;
        }
        
        // Validação baseada no tipo de senha
        if ($passwordType === 'senhaalfa') {
            // Para alterar senha principal, verificar data de nascimento
            if ($input['birth_date'] !== $user['data_nascimento']) {
                echo json_encode(['success' => false, 'message' => 'Data de nascimento incorreta']);
                exit;
            }
        } else {
            // Para alterar outras senhas, verificar senha principal
            if ($input['current_password'] !== $user['senhaalfa']) {
                echo json_encode(['success' => false, 'message' => 'Senha alfanumérica incorreta']);
                exit;
            }
            
            // Validar tamanho da senha baseado no tipo
            $expectedLength = (int)substr($passwordType, 5); // senha4 -> 4, senha6 -> 6, etc
            if (strlen($newPassword) !== $expectedLength || !ctype_digit($newPassword)) {
                echo json_encode(['success' => false, 'message' => "A senha deve ter exatamente $expectedLength dígitos numéricos"]);
                exit;
            }
        }
        
        // Atualizar senha
        $sql = "UPDATE users SET $passwordType = :new_password, updated_at = NOW() WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':new_password' => $newPassword,
            ':user_id' => $userId
        ]);
        
        // Log de segurança
        $sql = "INSERT INTO security_logs (user_id, action, details, created_at) 
                VALUES (:user_id, 'password_change', :details, NOW())";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':details' => json_encode(['password_type' => $passwordType, 'ip' => $_SERVER['REMOTE_ADDR']])
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Senha atualizada com sucesso']);
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['action']) && $_GET['action'] === 'verify') {
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['user_id'];
        $passwordType = $input['password_type'];
        $password = $input['password'];
        
        // Verificar senha
        $sql = "SELECT $passwordType FROM users WHERE id = :user_id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $userId]);
        $storedPassword = $stmt->fetchColumn();
        
        $isValid = ($password === $storedPassword);
        
        echo json_encode(['success' => true, 'valid' => $isValid]);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>`;

  const mysqlSchema = `-- Atualizar tabela de usuários com campos de senha
ALTER TABLE users ADD COLUMN IF NOT EXISTS senhaalfa VARCHAR(16);
ALTER TABLE users ADD COLUMN IF NOT EXISTS senha4 VARCHAR(4);
ALTER TABLE users ADD COLUMN IF NOT EXISTS senha6 VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS senha8 VARCHAR(8);

-- Tabela de logs de segurança
CREATE TABLE IF NOT EXISTS security_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Tabela de tentativas de login falhadas
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    ip_address VARCHAR(45) NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_ip_address (ip_address),
    INDEX idx_attempted_at (attempted_at)
);

-- Procedure para limpar logs antigos (executar via cron)
DELIMITER //
CREATE PROCEDURE CleanOldSecurityLogs()
BEGIN
    DELETE FROM security_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
    DELETE FROM failed_login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
END//
DELIMITER ;`;

  const frontendExample = `// Exemplo de integração no frontend
import { toast } from 'sonner';

// Função para alterar senha alfanumérica
const changeMainPassword = async (newPassword, birthDate) => {
  try {
    const response = await fetch('/api/users/security', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        user_id: userId,
        password_type: 'senhaalfa',
        new_password: newPassword,
        birth_date: birthDate
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success('Senha alfanumérica alterada com sucesso!');
    } else {
      toast.error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    toast.error('Erro interno ao alterar senha');
    return { success: false };
  }
};

// Função para alterar senhas de acesso (4, 6, 8 dígitos)
const changeAccessPassword = async (passwordType, newPassword, currentPassword) => {
  try {
    const response = await fetch('/api/users/security', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        user_id: userId,
        password_type: passwordType,
        new_password: newPassword,
        current_password: currentPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      toast.success(\`Senha de \${passwordType.slice(-1)} dígitos alterada com sucesso!\`);
    } else {
      toast.error(result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    toast.error('Erro interno ao alterar senha');
    return { success: false };
  }
};

// Função para verificar senha
const verifyPassword = async (passwordType, password) => {
  try {
    const response = await fetch('/api/users/security?action=verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify({
        user_id: userId,
        password_type: passwordType,
        password: password
      })
    });
    
    const result = await response.json();
    return result.success && result.valid;
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

// Validação de senha no frontend
const validatePassword = (passwordType, password) => {
  switch (passwordType) {
    case 'senhaalfa':
      return password.length <= 16 && password.length >= 6;
    case 'senha4':
      return /^\d{4}$/.test(password);
    case 'senha6':
      return /^\d{6}$/.test(password);
    case 'senha8':
      return /^\d{8}$/.test(password);
    default:
      return false;
  }
};`;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Shield className="h-5 w-5" />
          Referência da API - Segurança
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">Estrutura JSON</TabsTrigger>
            <TabsTrigger value="php">PHP API</TabsTrigger>
            <TabsTrigger value="mysql">MySQL Schema</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
          </TabsList>

          <TabsContent value="structure" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Estrutura de Segurança</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(jsonStructure, null, 2), 'structure')}
                >
                  {copiedStates.structure ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {JSON.stringify(jsonStructure, null, 2)}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="php" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">API PHP para Segurança</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(phpApiExample, 'php')}
                >
                  {copiedStates.php ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {phpApiExample}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="mysql" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Schema MySQL</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(mysqlSchema, 'mysql')}
                >
                  {copiedStates.mysql ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {mysqlSchema}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="frontend" className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Integração Frontend</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(frontendExample, 'frontend')}
                >
                  {copiedStates.frontend ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <pre className="text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                {frontendExample}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Regras de Segurança</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• Para alterar senha alfanumérica: usar data de nascimento</li>
            <li>• Para alterar senhas de acesso: usar senha alfanumérica</li>
            <li>• Senhas numéricas devem ter exatamente 4, 6 ou 8 dígitos</li>
            <li>• Todas as alterações são registradas nos logs de segurança</li>
            <li>• Logs de segurança são mantidos por 90 dias</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiReferenceSecurity;
