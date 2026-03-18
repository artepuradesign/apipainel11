
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Database, FileCode, Download, Settings, Terminal, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ApiManual = () => {
  const [copiedSection, setCopiedSection] = useState<string>('');

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success('Código copiado!');
      setTimeout(() => setCopiedSection(''), 2000);
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  const mysqlScript = `-- APIPanel v2.0 - Script Completo MySQL
-- Execute este script no seu MySQL para criar toda a estrutura

CREATE DATABASE IF NOT EXISTS apipainel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apipainel_db;

-- Tabela principal de usuários
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senhaalfa VARCHAR(16) DEFAULT NULL,
    cpf VARCHAR(15) UNIQUE DEFAULT NULL,
    senha4 VARCHAR(4) DEFAULT NULL,
    senha6 VARCHAR(6) DEFAULT NULL,
    senha8 VARCHAR(8) DEFAULT NULL,
    full_name VARCHAR(200) NOT NULL,
    data_nascimento DATE DEFAULT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    cep VARCHAR(10) DEFAULT NULL,
    endereco VARCHAR(300) DEFAULT NULL,
    numero VARCHAR(10) DEFAULT NULL,
    bairro VARCHAR(100) DEFAULT NULL,
    cidade VARCHAR(100) DEFAULT NULL,
    estado VARCHAR(50) DEFAULT NULL,
    indicador_id INT DEFAULT NULL,
    tipoplano VARCHAR(100) DEFAULT 'Pré-Pago',
    data_inicio DATE DEFAULT NULL,
    data_fim DATE DEFAULT NULL,
    user_role ENUM('assinante', 'suporte') DEFAULT 'assinante',
    status ENUM('ativo', 'inativo', 'suspenso', 'pendente') DEFAULT 'pendente',
    saldo DOUBLE DEFAULT 0.00,
    saldo_plano DOUBLE DEFAULT 0.00,
    saldo_atualizado TINYINT(1) DEFAULT 0,
    aceite_termos TINYINT(1) DEFAULT 0,
    ultimo_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (indicador_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_login (login),
    INDEX idx_email (email),
    INDEX idx_cpf (cpf),
    INDEX idx_status (status),
    INDEX idx_indicador (indicador_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de logs de consultas
CREATE TABLE consultation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    document VARCHAR(100) NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    amount DECIMAL(10,2) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de transações de saldo
CREATE TABLE balance_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    balance_type ENUM('wallet', 'plan') DEFAULT 'wallet',
    description VARCHAR(255) NOT NULL,
    consultation_id VARCHAR(100) DEFAULT NULL,
    previous_balance DECIMAL(10,2) DEFAULT 0.00,
    new_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_balance_type (balance_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de chaves PIX
CREATE TABLE pix_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    pix_key VARCHAR(100) NOT NULL,
    pix_type ENUM('cpf', 'email', 'telefone', 'chave_aleatoria') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_pix_key (pix_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuários iniciais
INSERT INTO users (login, email, senhaalfa, full_name, tipoplano, user_role, saldo, saldo_plano, status, aceite_termos) VALUES 
('anjoip', 'anjoip@msn.com', '112233', 'Luiz C P Junior', 'Pré-Pago', 'assinante', 0.00, 0.00, 'ativo', 1),
('suporte', 'suporte@artepuradesign.com', '332211', 'Suporte Arte Pura', 'Administrador', 'suporte', 1000.00, 0.00, 'ativo', 1),
('admin', 'admin@apipainel.com', 'admin123', 'Administrador Sistema', 'Administrador', 'suporte', 2000.00, 0.00, 'ativo', 1),
('teste', 'teste@teste.com', 'teste123', 'Usuário de Teste', 'Pré-Pago', 'assinante', 10.00, 5.00, 'ativo', 1);

-- Script concluído com sucesso!
-- Database APIPanel v2.0 criado e configurado`;

  const phpCode = `<?php
// config/database.php - Configuração de conexão MySQL
class Database {
    private $host = 'localhost';
    private $database = 'apipainel_db';
    private $username = 'root';
    private $password = '';
    private $charset = 'utf8mb4';
    
    public function connect() {
        $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            return new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
    }
}

// classes/User.php - Classe para gerenciar usuários
class User {
    private $db;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->connect();
    }
    
    public function authenticate($login, $password) {
        $sql = "SELECT * FROM users WHERE (login = :login OR email = :login) 
                AND senhaalfa = :password AND status = 'ativo'";
        $stmt = $this->db->prepare($sql);
        $stmt->bindParam(':login', $login);
        $stmt->bindParam(':password', $password);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            $user = $stmt->fetch();
            // Atualizar último login
            $this->updateLastLogin($user['id']);
            return $user;
        }
        return false;
    }
    
    public function createUser($data) {
        $sql = "INSERT INTO users (login, email, senhaalfa, full_name, user_role, status, aceite_termos) 
                VALUES (:login, :email, :password, :name, :role, :status, 1)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            ':login' => $data['login'],
            ':email' => $data['email'],
            ':password' => $data['password'],
            ':name' => $data['name'],
            ':role' => $data['role'] ?? 'assinante',
            ':status' => $data['status'] ?? 'ativo'
        ]);
    }
    
    public function updateBalance($userId, $amount, $type = 'credit', $description = '') {
        $this->db->beginTransaction();
        
        try {
            // Buscar saldo atual
            $stmt = $this->db->prepare("SELECT saldo FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $currentBalance = $stmt->fetchColumn();
            
            // Calcular novo saldo
            $newBalance = ($type === 'credit') ? 
                $currentBalance + $amount : $currentBalance - $amount;
            
            // Atualizar saldo do usuário
            $stmt = $this->db->prepare("UPDATE users SET saldo = :balance WHERE id = :id");
            $stmt->execute([':balance' => $newBalance, ':id' => $userId]);
            
            // Registrar transação
            $stmt = $this->db->prepare("
                INSERT INTO balance_transactions 
                (user_id, amount, type, description, previous_balance, new_balance) 
                VALUES (:user_id, :amount, :type, :description, :prev_balance, :new_balance)
            ");
            $stmt->execute([
                ':user_id' => $userId,
                ':amount' => $amount,
                ':type' => $type,
                ':description' => $description,
                ':prev_balance' => $currentBalance,
                ':new_balance' => $newBalance
            ]);
            
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
    
    private function updateLastLogin($userId) {
        $sql = "UPDATE users SET ultimo_login = NOW() WHERE id = :id";
        $stmt = $this->db->prepare($sql);
        $stmt->execute([':id' => $userId]);
    }
}

// api/login.php - Endpoint de autenticação
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (isset($input['login']) && isset($input['password'])) {
        $user = new User();
        $result = $user->authenticate($input['login'], $input['password']);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'user' => [
                    'id' => $result['id'],
                    'login' => $result['login'],
                    'email' => $result['email'],
                    'name' => $result['full_name'],
                    'role' => $result['user_role'],
                    'balance' => $result['saldo']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Credenciais inválidas']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Login e senha obrigatórios']);
    }
}
?>`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Manual Completo da API - APIPanel v2.0
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="mysql" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mysql">Script MySQL</TabsTrigger>
              <TabsTrigger value="php">Manual PHP</TabsTrigger>
              <TabsTrigger value="install">Tutorial Instalação</TabsTrigger>
            </TabsList>

            <TabsContent value="mysql" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Script MySQL Completo</h3>
                <Button
                  onClick={() => copyToClipboard(mysqlScript, 'mysql')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedSection === 'mysql' ? 'Copiado!' : 'Copiar Script'}
                </Button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">{mysqlScript}</pre>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Como usar:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Abra o phpMyAdmin ou MySQL Workbench</li>
                  <li>Cole o script completo acima</li>
                  <li>Execute o script</li>
                  <li>Banco <code>apipainel_db</code> será criado com todas as tabelas</li>
                  <li>4 usuários de teste serão inseridos</li>
                </ol>
              </div>
            </TabsContent>

            <TabsContent value="php" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Manual PHP Completo</h3>
                <Button
                  onClick={() => copyToClipboard(phpCode, 'php')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedSection === 'php' ? 'Copiado!' : 'Copiar Código'}
                </Button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">{phpCode}</pre>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium mb-2">🚀 Recursos implementados:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <Badge className="bg-green-500 text-white mb-1">✅ Conexão PDO</Badge><br/>
                    <Badge className="bg-green-500 text-white mb-1">✅ Autenticação</Badge><br/>
                    <Badge className="bg-green-500 text-white mb-1">✅ Gestão de Usuários</Badge>
                  </div>
                  <div>
                    <Badge className="bg-green-500 text-white mb-1">✅ Controle de Saldo</Badge><br/>
                    <Badge className="bg-green-500 text-white mb-1">✅ Transações</Badge><br/>
                    <Badge className="bg-green-500 text-white mb-1">✅ API REST</Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="install" className="space-y-6">
              <h3 className="text-lg font-semibold">Tutorial de Instalação Completo</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Passo 1: Download e Preparação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">1.1 - Instalar Git (se não tiver)</h4>
                    <p className="text-sm mb-2">Baixe em: <a href="https://git-scm.com/downloads" className="text-blue-600 underline" target="_blank">https://git-scm.com/downloads</a></p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">1.2 - Clonar o repositório</h4>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                      git clone https://github.com/seu-usuario/apipainel-v2.git<br/>
                      cd apipainel-v2
                    </code>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">1.3 - Instalar Node.js</h4>
                    <p className="text-sm mb-2">Baixe em: <a href="https://nodejs.org" className="text-blue-600 underline" target="_blank">https://nodejs.org</a> (versão LTS)</p>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                      node --version<br/>
                      npm --version
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Passo 2: Configurar MySQL
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">2.1 - Instalar XAMPP</h4>
                    <p className="text-sm mb-2">Baixe em: <a href="https://www.apachefriends.org" className="text-blue-600 underline" target="_blank">https://www.apachefriends.org</a></p>
                    <ul className="text-sm list-disc list-inside">
                      <li>Instale o XAMPP</li>
                      <li>Inicie Apache e MySQL no painel do XAMPP</li>
                      <li>Acesse: http://localhost/phpmyadmin</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">2.2 - Criar banco de dados</h4>
                    <ol className="text-sm list-decimal list-inside space-y-1">
                      <li>No phpMyAdmin, clique em "Novo" (à esquerda)</li>
                      <li>Nome do banco: <code>apipainel_db</code></li>
                      <li>Cotejamento: <code>utf8mb4_unicode_ci</code></li>
                      <li>Clique em "Criar"</li>
                    </ol>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">2.3 - Executar script SQL</h4>
                    <ol className="text-sm list-decimal list-inside space-y-1">
                      <li>Selecione o banco <code>apipainel_db</code></li>
                      <li>Clique na aba "SQL"</li>
                      <li>Cole o script MySQL completo da aba anterior</li>
                      <li>Clique em "Executar"</li>
                      <li>Verificar se aparecem as tabelas criadas</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Passo 3: Configurar Aplicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">3.1 - Instalar dependências</h4>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                      npm install
                    </code>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">3.2 - Configurar backend</h4>
                    <p className="text-sm mb-2">Edite o arquivo <code>backend/.env</code>:</p>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                      DB_HOST=localhost<br/>
                      DB_USER=root<br/>
                      DB_PASSWORD=<br/>
                      DB_NAME=apipainel_db<br/>
                      DB_PORT=3306
                    </code>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">3.3 - Iniciar serviços</h4>
                    <code className="block bg-gray-900 text-gray-100 p-2 rounded text-sm">
                      # Terminal 1 - Backend<br/>
                      cd backend<br/>
                      npm install<br/>
                      npm start<br/><br/>
                      
                      # Terminal 2 - Frontend<br/>
                      npm run dev
                    </code>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Passo 4: Configurar Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">4.1 - Acessar o sistema</h4>
                    <ul className="text-sm list-disc list-inside space-y-1">
                      <li>Frontend: <a href="http://localhost:8080" className="text-blue-600 underline">http://localhost:8080</a></li>
                      <li>Backend: <a href="http://localhost:3000" className="text-blue-600 underline">http://localhost:3000</a></li>
                      <li>MySQL: <a href="http://localhost/phpmyadmin" className="text-blue-600 underline">http://localhost/phpmyadmin</a></li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">4.2 - Fazer login no sistema</h4>
                    <p className="text-sm mb-2">Use um dos usuários criados:</p>
                    <div className="text-sm space-y-1">
                      <Badge className="bg-blue-500 text-white">anjoip / 112233</Badge> (Assinante)<br/>
                      <Badge className="bg-green-500 text-white">suporte / 332211</Badge> (Suporte)<br/>
                      <Badge className="bg-purple-500 text-white">admin / admin123</Badge> (Admin)
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">4.3 - Configurar MySQL no painel</h4>
                    <ol className="text-sm list-decimal list-inside space-y-1">
                      <li>Acesse <strong>Administração Geral</strong></li>
                      <li>Vá para aba <strong>Banco de Dados</strong></li>
                      <li>Configure: Host=localhost, Porta=3306, User=root, Database=apipainel_db</li>
                      <li>Clique em <strong>Testar Conexão MySQL</strong></li>
                      <li>Clique em <strong>Definir MySQL como Base de Dados Padrão</strong></li>
                      <li>Sistema agora usa dados reais do MySQL!</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                  🎉 Instalação Concluída!
                </h3>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  Seu APIPanel v2.0 está funcionando com MySQL real. Todos os dados agora são persistidos no banco de dados.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiManual;
