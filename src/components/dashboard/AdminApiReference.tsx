import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, Database, Globe, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';

const phpBackendCode = `<?php
/**
 * API Backend Completo para Dashboard Admin
 * Suporte a todos os endpoints necessários
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Configuração do Banco de Dados
class Database {
    private $host = 'localhost';
    private $db_name = 'dashboard_admin';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, 
                                $this->username, $this->password);
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Erro de conexão: " . $exception->getMessage();
        }
        return $this->conn;
    }
}

// Classe principal da API
class AdminAPI {
    private $db;
    private $request_method;
    private $endpoint;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->request_method = $_SERVER['REQUEST_METHOD'];
        $this->endpoint = explode('/', trim($_SERVER['PATH_INFO'], '/'));
    }

    public function processRequest() {
        switch ($this->endpoint[0]) {
            case 'users':
                return $this->handleUsers();
            case 'stats':
                return $this->handleStats();
            case 'transactions':
                return $this->handleTransactions();
            case 'activities':
                return $this->handleActivities();
            case 'balance':
                return $this->handleBalance();
            default:
                return $this->response(['error' => 'Endpoint não encontrado'], 404);
        }
    }

    // Gerenciamento de Usuários
    private function handleUsers() {
        switch ($this->request_method) {
            case 'GET':
                if (isset($this->endpoint[1])) {
                    return $this->getUserById($this->endpoint[1]);
                }
                return $this->getAllUsers();
            case 'POST':
                return $this->createUser();
            case 'PUT':
                return $this->updateUser($this->endpoint[1]);
            case 'DELETE':
                return $this->deleteUser($this->endpoint[1]);
        }
    }

    private function getAllUsers() {
        $query = "SELECT u.*, 
                         COUNT(DISTINCT c.id) as total_consultations,
                         SUM(t.amount) as total_spent,
                         MAX(l.login_time) as last_login
                  FROM users u
                  LEFT JOIN consultations c ON u.id = c.user_id
                  LEFT JOIN transactions t ON u.id = t.user_id
                  LEFT JOIN login_logs l ON u.id = l.user_id
                  GROUP BY u.id
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        $users = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $users[] = [
                'id' => $row['id'],
                'name' => $row['full_name'],
                'email' => $row['email'],
                'login' => $row['login'],
                'cpf' => $row['cpf'],
                'telefone' => $row['telefone'],
                'plan' => $row['current_plan'],
                'balance' => floatval($row['balance']),
                'status' => $row['status'],
                'total_consultations' => intval($row['total_consultations']),
                'total_spent' => floatval($row['total_spent'] ?? 0),
                'last_login' => $row['last_login'],
                'created_at' => $row['created_at'],
                'is_online' => $this->isUserOnline($row['id'])
            ];
        }
        
        return $this->response(['users' => $users, 'total' => count($users)]);
    }

    private function getUserById($userId) {
        $query = "SELECT u.*, 
                         COUNT(DISTINCT c.id) as total_consultations,
                         SUM(t.amount) as total_spent
                  FROM users u
                  LEFT JOIN consultations c ON u.id = c.user_id
                  LEFT JOIN transactions t ON u.id = t.user_id
                  WHERE u.id = :id
                  GROUP BY u.id";
        
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        
        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            return $this->response([
                'user' => [
                    'id' => $row['id'],
                    'name' => $row['full_name'],
                    'email' => $row['email'],
                    'login' => $row['login'],
                    'cpf' => $row['cpf'],
                    'telefone' => $row['telefone'],
                    'plan' => $row['current_plan'],
                    'balance' => floatval($row['balance']),
                    'status' => $row['status'],
                    'total_consultations' => intval($row['total_consultations']),
                    'total_spent' => floatval($row['total_spent'] ?? 0),
                    'created_at' => $row['created_at']
                ]
            ]);
        }
        
        return $this->response(['error' => 'Usuário não encontrado'], 404);
    }

    // Estatísticas do Sistema
    private function handleStats() {
        switch ($this->endpoint[1]) {
            case 'dashboard':
                return $this->getDashboardStats();
            case 'financial':
                return $this->getFinancialStats();
            case 'users':
                return $this->getUserStats();
            case 'consultations':
                return $this->getConsultationStats();
            default:
                return $this->getAllStats();
        }
    }

    private function getDashboardStats() {
        // Saldo em Caixa
        $cashQuery = "SELECT COALESCE(SUM(amount), 0) as total_cash FROM central_cash WHERE type = 'in'";
        $cashStmt = $this->db->prepare($cashQuery);
        $cashStmt->execute();
        $cashResult = $cashStmt->fetch(PDO::FETCH_ASSOC);

        // Receita Hoje
        $todayQuery = "SELECT COALESCE(SUM(amount), 0) as today_revenue 
                       FROM transactions 
                       WHERE DATE(created_at) = CURDATE() AND status = 'completed'";
        $todayStmt = $this->db->prepare($todayQuery);
        $todayStmt->execute();
        $todayResult = $todayStmt->fetch(PDO::FETCH_ASSOC);

        // Total de Usuários
        $usersQuery = "SELECT COUNT(*) as total_users FROM users WHERE status = 'active'";
        $usersStmt = $this->db->prepare($usersQuery);
        $usersStmt->execute();
        $usersResult = $usersStmt->fetch(PDO::FETCH_ASSOC);

        // Comissões Pagas
        $commissionsQuery = "SELECT COALESCE(SUM(amount), 0) as total_commissions 
                            FROM commissions WHERE status = 'paid'";
        $commissionsStmt = $this->db->prepare($commissionsQuery);
        $commissionsStmt->execute();
        $commissionsResult = $commissionsStmt->fetch(PDO::FETCH_ASSOC);

        // Total em Recargas
        $rechargesQuery = "SELECT COALESCE(SUM(amount), 0) as total_recharges 
                          FROM transactions WHERE type = 'recharge' AND status = 'completed'";
        $rechargesStmt = $this->db->prepare($rechargesQuery);
        $rechargesStmt->execute();
        $rechargesResult = $rechargesStmt->fetch(PDO::FETCH_ASSOC);

        // Vendas de Planos
        $plansQuery = "SELECT COALESCE(SUM(amount), 0) as plan_sales 
                       FROM plan_purchases WHERE status = 'completed'";
        $plansStmt = $this->db->prepare($plansQuery);
        $plansStmt->execute();
        $plansResult = $plansStmt->fetch(PDO::FETCH_ASSOC);

        // Total de Saques
        $withdrawalsQuery = "SELECT COALESCE(SUM(amount), 0) as total_withdrawals 
                            FROM withdrawals WHERE status = 'completed'";
        $withdrawalsStmt = $this->db->prepare($withdrawalsQuery);
        $withdrawalsStmt->execute();
        $withdrawalsResult = $withdrawalsStmt->fetch(PDO::FETCH_ASSOC);

        // Consultas Realizadas
        $consultationsQuery = "SELECT COUNT(*) as total_consultations FROM consultations";
        $consultationsStmt = $this->db->prepare($consultationsQuery);
        $consultationsStmt->execute();
        $consultationsResult = $consultationsStmt->fetch(PDO::FETCH_ASSOC);

        return $this->response([
            'cash_balance' => floatval($cashResult['total_cash']),
            'today_revenue' => floatval($todayResult['today_revenue']),
            'total_users' => intval($usersResult['total_users']),
            'total_commissions' => floatval($commissionsResult['total_commissions']),
            'total_recharges' => floatval($rechargesResult['total_recharges']),
            'plan_sales' => floatval($plansResult['plan_sales']),
            'total_withdrawals' => floatval($withdrawalsResult['total_withdrawals']),
            'total_consultations' => intval($consultationsResult['total_consultations'])
        ]);
    }

    // Atividades em Tempo Real
    private function handleActivities() {
        switch ($this->request_method) {
            case 'GET':
                return $this->getRecentActivities();
            case 'POST':
                return $this->createActivity();
        }
    }

    private function getRecentActivities() {
        $type = $_GET['type'] ?? 'all';
        $limit = $_GET['limit'] ?? 20;
        
        $whereClause = $type !== 'all' ? "WHERE a.type = :type" : "";
        
        $query = "SELECT a.*, u.full_name as user_name, u.login as user_login
                  FROM activities a
                  LEFT JOIN users u ON a.user_id = u.id
                  $whereClause
                  ORDER BY a.created_at DESC
                  LIMIT :limit";
        
        $stmt = $this->db->prepare($query);
        
        if ($type !== 'all') {
            $stmt->bindParam(':type', $type);
        }
        
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $activities = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $activities[] = [
                'id' => $row['id'],
                'type' => $row['type'],
                'description' => $row['description'],
                'user_name' => $row['user_name'],
                'user_login' => $row['user_login'],
                'amount' => $row['amount'] ? floatval($row['amount']) : null,
                'created_at' => $row['created_at']
            ];
        }
        
        return $this->response(['activities' => $activities]);
    }

    // Usuários Online
    private function isUserOnline($userId) {
        $query = "SELECT COUNT(*) as count FROM user_sessions 
                  WHERE user_id = :user_id AND last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':user_id', $userId);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $result['count'] > 0;
    }

    // Transações do Caixa Central
    private function handleTransactions() {
        $query = "SELECT t.*, u.full_name as user_name
                  FROM central_cash_transactions t
                  LEFT JOIN users u ON t.user_id = u.id
                  ORDER BY t.created_at DESC
                  LIMIT 50";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        $transactions = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $transactions[] = [
                'id' => $row['id'],
                'type' => $row['type'],
                'description' => $row['description'],
                'amount' => floatval($row['amount']),
                'user_name' => $row['user_name'],
                'status' => $row['status'],
                'created_at' => $row['created_at']
            ];
        }
        
        return $this->response(['transactions' => $transactions]);
    }

    // Resposta da API
    private function response($data, $status = 200) {
        http_response_code($status);
        return json_encode($data);
    }
}

// Inicializar API
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$api = new AdminAPI();
echo $api->processRequest();
?>`;

const frontendCode = `// Frontend JavaScript para integração com API PHP
class AdminDashboardAPI {
    constructor() {
        this.baseURL = 'https://api.artepuradesign.com.br/api';
        this.token = localStorage.getItem('auth_token');
    }

    // Headers padrão
    getHeaders() {
        return {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${this.token}\`,
            'Accept': 'application/json'
        };
    }

    // Buscar estatísticas do dashboard
    async getDashboardStats() {
        try {
            const response = await fetch(\`\${this.baseURL}/stats/dashboard\`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (!response.ok) throw new Error('Erro ao buscar estatísticas');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    // Buscar usuários online
    async getOnlineUsers() {
        try {
            const response = await fetch(\`\${this.baseURL}/users?status=online\`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Erro ao buscar usuários online:', error);
            return [];
        }
    }

    // Buscar atividades recentes
    async getRecentActivities(type = 'all', limit = 20) {
        try {
            const response = await fetch(\`\${this.baseURL}/activities?type=\${type}&limit=\${limit}\`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            return data.activities || [];
        } catch (error) {
            console.error('Erro ao buscar atividades:', error);
            return [];
        }
    }

    // Buscar transações do caixa central
    async getCentralCashTransactions() {
        try {
            const response = await fetch(\`\${this.baseURL}/transactions\`, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            const data = await response.json();
            return data.transactions || [];
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
            return [];
        }
    }

    // Atualizar dados em tempo real
    startRealTimeUpdates() {
        setInterval(async () => {
            try {
                const [stats, activities, transactions] = await Promise.all([
                    this.getDashboardStats(),
                    this.getRecentActivities(),
                    this.getCentralCashTransactions()
                ]);

                // Atualizar interface
                this.updateDashboardUI(stats, activities, transactions);
            } catch (error) {
                console.error('Erro na atualização em tempo real:', error);
            }
        }, 30000); // Atualizar a cada 30 segundos
    }

    // Atualizar interface do dashboard
    updateDashboardUI(stats, activities, transactions) {
        // Atualizar cards de estatísticas
        document.querySelector('[data-stat="cash-balance"]').textContent = 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                .format(stats.cash_balance);

        document.querySelector('[data-stat="today-revenue"]').textContent = 
            new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                .format(stats.today_revenue);

        document.querySelector('[data-stat="total-users"]').textContent = stats.total_users;
        document.querySelector('[data-stat="total-consultations"]').textContent = stats.total_consultations;

        // Atualizar lista de atividades
        const activitiesContainer = document.querySelector('[data-activities]');
        if (activitiesContainer) {
            activitiesContainer.innerHTML = activities.map(activity => \`
                <div class="activity-item p-3 border-b">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-medium">\${activity.user_name || 'Sistema'}</p>
                            <p class="text-sm text-gray-600">\${activity.description}</p>
                        </div>
                        <span class="text-xs text-gray-500">
                            \${new Date(activity.created_at).toLocaleString('pt-BR')}
                        </span>
                    </div>
                </div>
            \`).join('');
        }

        // Atualizar transações
        const transactionsContainer = document.querySelector('[data-transactions]');
        if (transactionsContainer) {
            transactionsContainer.innerHTML = transactions.slice(0, 5).map(transaction => \`
                <div class="transaction-item p-3 border-b">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-medium">\${transaction.description}</p>
                            <p class="text-sm text-gray-600">\${transaction.user_name || 'Sistema'}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-bold \${transaction.type === 'in' ? 'text-green-600' : 'text-red-600'}">
                                \${transaction.type === 'in' ? '+' : '-'}
                                \${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                    .format(transaction.amount)}
                            </p>
                            <p class="text-xs text-gray-500">
                                \${new Date(transaction.created_at).toLocaleString('pt-BR')}
                            </p>
                        </div>
                    </div>
                </div>
            \`).join('');
        }
    }
}

// Inicializar API do Dashboard
const dashboardAPI = new AdminDashboardAPI();

// Carregar dados iniciais
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const stats = await dashboardAPI.getDashboardStats();
        const activities = await dashboardAPI.getRecentActivities();
        const transactions = await dashboardAPI.getCentralCashTransactions();
        
        dashboardAPI.updateDashboardUI(stats, activities, transactions);
        dashboardAPI.startRealTimeUpdates();
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
    }
});`;

const sqlCode = `-- Estrutura do Banco de Dados para Dashboard Admin
-- Execute este script no seu MySQL para criar as tabelas necessárias

CREATE DATABASE IF NOT EXISTS dashboard_admin;
USE dashboard_admin;

-- Tabela de usuários
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    login VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    cpf VARCHAR(11) UNIQUE NOT NULL,
    telefone VARCHAR(15),
    current_plan VARCHAR(50) DEFAULT 'Pré-Pago',
    balance DECIMAL(10,2) DEFAULT 0.00,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de sessões de usuários (para controle online)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de atividades do sistema
CREATE TABLE activities (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('new_user', 'consultation', 'recharge', 'withdrawal', 'plan_purchase') NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de consultas
CREATE TABLE consultations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('cpf', 'cnpj', 'vehicle', 'score') NOT NULL,
    query_data VARCHAR(50) NOT NULL,
    cost DECIMAL(8,2) NOT NULL,
    status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
    response_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de transações
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('recharge', 'withdrawal', 'consultation', 'commission') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela do caixa central
CREATE TABLE central_cash (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('in', 'out') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de transações do caixa central
CREATE TABLE central_cash_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type ENUM('in', 'out') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('completed', 'pending', 'cancelled') DEFAULT 'completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabela de compras de planos
CREATE TABLE plan_purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de comissões
CREATE TABLE commissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    referral_user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('registration', 'consultation', 'plan_purchase') NOT NULL,
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referral_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de saques
CREATE TABLE withdrawals (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    pix_key VARCHAR(100) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de logs de login
CREATE TABLE login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO users (login, email, password_hash, full_name, cpf, telefone, current_plan, balance) VALUES
('admin', 'admin@sistema.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador do Sistema', '12345678901', '11999999999', 'Premium', 1000.00),
('luizjunior', 'luiz@teste.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luiz Junior', '98765432100', '11888888888', 'Básico', 250.50);

-- Inserir atividades de exemplo
INSERT INTO activities (user_id, type, description, amount) VALUES
(2, 'new_user', 'Novo usuário cadastrado: Luiz Junior', NULL),
(2, 'recharge', 'Recarga realizada via PIX', 100.00),
(2, 'consultation', 'Consulta CPF realizada', 2.50);

-- Inserir transações do caixa central
INSERT INTO central_cash_transactions (user_id, type, amount, description) VALUES
(2, 'in', 100.00, 'Recarga de saldo - PIX'),
(2, 'out', 2.50, 'Consulta CPF realizada'),
(1, 'in', 500.00, 'Depósito inicial do sistema');

-- Índices para melhor performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_consultations_type ON consultations(type);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_last_activity ON user_sessions(last_activity);`;

const AdminApiReference = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, title: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(title);
    toast.success(`Código ${title} copiado!`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-6 w-6 text-blue-600" />
          Referência da API - PHP Completo Backend
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Código PHP completo para backend e integração frontend com todos os endpoints necessários para o Dashboard Admin
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="php" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="php" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              PHP Backend
            </TabsTrigger>
            <TabsTrigger value="frontend" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Frontend JS
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Database SQL
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
          </TabsList>

          <TabsContent value="php" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Backend PHP Completo</h3>
                  <p className="text-sm text-muted-foreground">
                    API PHP completa com todos os endpoints para Dashboard Admin
                  </p>
                </div>
                <Button
                  onClick={() => copyToClipboard(phpBackendCode, 'PHP Backend')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedCode === 'PHP Backend' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-green-400 text-xs">
                  <code>{phpBackendCode}</code>
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Recursos Incluídos</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Gerenciamento completo de usuários</li>
                    <li>• Estatísticas em tempo real</li>
                    <li>• Transações do caixa central</li>
                    <li>• Atividades do sistema</li>
                    <li>• Controle de usuários online</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">🔧 Configuração</h4>
                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <li>• Configure o banco MySQL</li>
                    <li>• Ajuste credenciais em Database</li>
                    <li>• Implemente em servidor PHP 7.4+</li>
                    <li>• Configure CORS se necessário</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frontend" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Frontend JavaScript</h3>
                  <p className="text-sm text-muted-foreground">
                    Código JavaScript para integração com API PHP
                  </p>
                </div>
                <Button
                  onClick={() => copyToClipboard(frontendCode, 'Frontend')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedCode === 'Frontend' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-yellow-400 text-xs">
                  <code>{frontendCode}</code>
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sql" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Estrutura do Banco de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Script SQL completo para criar todas as tabelas necessárias
                  </p>
                </div>
                <Button
                  onClick={() => copyToClipboard(sqlCode, 'SQL')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedCode === 'SQL' ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              
              <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-cyan-400 text-xs">
                  <code>{sqlCode}</code>
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="endpoints" className="mt-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Endpoints Disponíveis</h3>
              
              {/* Users Endpoints */}
              <div className="space-y-3">
                <h4 className="font-medium text-blue-600">👥 Usuários</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/users</code>
                    <span className="text-sm text-gray-600">Listar todos os usuários</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/users/{`{id}`}</code>
                    <span className="text-sm text-gray-600">Buscar usuário por ID</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="secondary">POST</Badge>
                    <code className="text-sm">/api/users</code>
                    <span className="text-sm text-gray-600">Criar novo usuário</span>
                  </div>
                </div>
              </div>

              {/* Stats Endpoints */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">📊 Estatísticas</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/stats/dashboard</code>
                    <span className="text-sm text-gray-600">Estatísticas do dashboard</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/stats/financial</code>
                    <span className="text-sm text-gray-600">Estatísticas financeiras</span>
                  </div>
                </div>
              </div>

              {/* Activities Endpoints */}
              <div className="space-y-3">
                <h4 className="font-medium text-purple-600">⚡ Atividades</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/activities?type=all</code>
                    <span className="text-sm text-gray-600">Todas as atividades</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/activities?type=new_user</code>
                    <span className="text-sm text-gray-600">Novos cadastros</span>
                  </div>
                </div>
              </div>

              {/* Transactions Endpoints */}
              <div className="space-y-3">
                <h4 className="font-medium text-orange-600">💰 Transações</h4>
                <div className="grid gap-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <Badge variant="default">GET</Badge>
                    <code className="text-sm">/api/transactions</code>
                    <span className="text-sm text-gray-600">Transações do caixa central</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Informações importantes */}
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            ⚠️ Instruções de Implementação
          </h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>1. Execute o script SQL para criar o banco de dados</li>
            <li>2. Configure as credenciais do banco no arquivo PHP</li>
            <li>3. Implemente o arquivo PHP no seu servidor</li>
            <li>4. Adicione o código JavaScript ao frontend</li>
            <li>5. Configure as URLs da API no frontend</li>
            <li>6. Teste todos os endpoints antes do uso em produção</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminApiReference;
