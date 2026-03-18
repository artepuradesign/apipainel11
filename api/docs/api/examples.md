
# Exemplos Práticos - API Painéis

## 🚀 Exemplos de Integração

### 1. Login e Dashboard Completo

```javascript
class ApiPaineis {
  constructor(baseUrl = 'https://api.artepuradesign.com.br/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('api_token');
  }

  async login(login, password) {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login, password })
      });

      const data = await response.json();
      
      if (data.success) {
        this.token = data.data.token;
        localStorage.setItem('api_token', this.token);
        return data.data.user;
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async getDashboard() {
    return this.makeRequest('/dashboard/home');
  }

  async makeRequest(endpoint, options = {}) {
    const config = {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    return response.json();
  }
}

// Uso
const api = new ApiPaineis();

// Login
const user = await api.login('usuario123', 'senha123');
console.log('Usuário logado:', user);

// Dashboard
const dashboard = await api.getDashboard();
console.log('Dados do dashboard:', dashboard);
```

### 2. Sistema de Consultas

```javascript
class ConsultaService {
  constructor(api) {
    this.api = api;
  }

  async consultarCPF(cpf) {
    try {
      const response = await this.api.makeRequest('/consultas/cpf', {
        method: 'POST',
        body: JSON.stringify({ cpf: this.limparCPF(cpf) })
      });

      if (response.success) {
        console.log(`Consulta realizada! Custo: R$ ${response.cost}`);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Erro na consulta CPF:', error);
      throw error;
    }
  }

  async consultarCNPJ(cnpj) {
    const response = await this.api.makeRequest('/consultas/cnpj', {
      method: 'POST',
      body: JSON.stringify({ cnpj: this.limparCNPJ(cnpj) })
    });

    return response;
  }

  async consultarVeiculo(placa) {
    const response = await this.api.makeRequest('/consultas/veiculo', {
      method: 'POST',
      body: JSON.stringify({ placa: placa.toUpperCase() })
    });

    return response;
  }

  async obterHistorico(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await this.api.makeRequest(`/consultas/historico?${params}`);
    return response;
  }

  limparCPF(cpf) {
    return cpf.replace(/\D/g, '');
  }

  limparCNPJ(cnpj) {
    return cnpj.replace(/\D/g, '');
  }
}

// Uso
const consultas = new ConsultaService(api);

// Consultar CPF
const dadosCPF = await consultas.consultarCPF('123.456.789-09');
console.log('Dados do CPF:', dadosCPF);

// Consultar CNPJ
const dadosCNPJ = await consultas.consultarCNPJ('12.345.678/0001-90');
console.log('Dados do CNPJ:', dadosCNPJ);

// Histórico
const historico = await consultas.obterHistorico({
  page: 1,
  limit: 20,
  type: 'cpf'
});
```

### 3. Gerenciamento de Carteira

```javascript
class CarteiraService {
  constructor(api) {
    this.api = api;
  }

  async obterSaldo() {
    const response = await this.api.makeRequest('/wallet/balance');
    return response.data;
  }

  async transferir(destinatario, valor, descricao = '') {
    const response = await this.api.makeRequest('/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify({
        recipient_login: destinatario,
        amount: parseFloat(valor),
        description: descricao
      })
    });

    return response;
  }

  async criarChavePix(tipo, valor) {
    const response = await this.api.makeRequest('/wallet/pix/create', {
      method: 'POST',
      body: JSON.stringify({
        key_type: tipo,
        key_value: valor
      })
    });

    return response;
  }

  async solicitarSaque(valor, chavePix) {
    const response = await this.api.makeRequest('/wallet/pix/withdrawal', {
      method: 'POST',
      body: JSON.stringify({
        amount: parseFloat(valor),
        pix_key: chavePix
      })
    });

    return response;
  }

  async obterTransacoes(filtros = {}) {
    const params = new URLSearchParams(filtros);
    const response = await this.api.makeRequest(`/wallet/transactions?${params}`);
    return response;
  }
}

// Uso
const carteira = new CarteiraService(api);

// Ver saldo
const saldo = await carteira.obterSaldo();
console.log('Saldo atual:', saldo.current_balance);

// Transferir
await carteira.transferir('usuario_destino', 50.00, 'Pagamento serviços');

// Criar chave PIX
await carteira.criarChavePix('cpf', '12345678909');

// Solicitar saque
await carteira.solicitarSaque(100.00, '12345678909');
```

### 4. Sistema de Suporte

```javascript
class SuporteService {
  constructor(api) {
    this.api = api;
  }

  async criarTicket(assunto, descricao, categoria = 'duvida') {
    const response = await this.api.makeRequest('/support/tickets/create', {
      method: 'POST',
      body: JSON.stringify({
        subject: assunto,
        description: descricao,
        category: categoria,
        priority: 'media'
      })
    });

    return response;
  }

  async obterTickets() {
    const response = await this.api.makeRequest('/support/tickets');
    return response;
  }

  async responderTicket(ticketId, mensagem) {
    const response = await this.api.makeRequest(`/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message: mensagem })
    });

    return response;
  }

  async fecharTicket(ticketId) {
    const response = await this.api.makeRequest(`/support/tickets/${ticketId}/close`, {
      method: 'PUT'
    });

    return response;
  }
}

// Uso
const suporte = new SuporteService(api);

// Criar ticket
const ticket = await suporte.criarTicket(
  'Problema na consulta CPF',
  'Estou tendo dificuldades para realizar consultas de CPF...',
  'tecnico'
);

// Listar tickets
const tickets = await suporte.obterTickets();

// Responder ticket
await suporte.responderTicket(1, 'Obrigado pelo retorno!');
```

### 5. Integração com React/Next.js

```jsx
// hooks/useApi.js
import { useState, useEffect } from 'react';

export function useApi() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = new ApiPaineis();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (api.token) {
        const response = await api.makeRequest('/auth/me');
        if (response.success) {
          setUser(response.data);
        } else {
          localStorage.removeItem('api_token');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      localStorage.removeItem('api_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const user = await api.login(credentials.login, credentials.password);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('api_token');
    setUser(null);
    api.token = null;
  };

  return { api, user, login, logout, loading };
}

// components/Dashboard.jsx
import { useApi } from '../hooks/useApi';
import { useState, useEffect } from 'react';

function Dashboard() {
  const { api, user } = useApi();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    try {
      const data = await api.getDashboard();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    }
  };

  if (!user) return <div>Carregando...</div>;

  return (
    <div className="dashboard">
      <h1>Bem-vindo, {user.full_name}!</h1>
      <div className="stats">
        <div>Saldo: R$ {user.balance}</div>
        <div>Plano: {user.plan}</div>
      </div>
      
      {dashboardData && (
        <div className="dashboard-content">
          <div>Total de Consultas: {dashboardData.stats.total_consultations}</div>
          <div>Taxa de Sucesso: {dashboardData.stats.success_rate}%</div>
        </div>
      )}
    </div>
  );
}
```

### 6. Tratamento de Erros

```javascript
class ApiErrorHandler {
  static handle(error, context = '') {
    console.error(`Erro na API ${context}:`, error);

    // Tratar diferentes tipos de erro
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          this.handleUnauthorized();
          break;
        case 403:
          this.handleForbidden();
          break;
        case 429:
          this.handleRateLimit();
          break;
        case 500:
          this.handleServerError();
          break;
        default:
          this.handleGenericError(data?.message || 'Erro desconhecido');
      }
    } else if (error.request) {
      this.handleNetworkError();
    } else {
      this.handleGenericError(error.message);
    }
  }

  static handleUnauthorized() {
    localStorage.removeItem('api_token');
    window.location.href = '/login';
  }

  static handleForbidden() {
    alert('Você não tem permissão para realizar esta ação.');
  }

  static handleRateLimit() {
    alert('Muitas requisições. Tente novamente em alguns minutos.');
  }

  static handleServerError() {
    alert('Erro interno do servidor. Tente novamente mais tarde.');
  }

  static handleNetworkError() {
    alert('Erro de conexão. Verifique sua internet.');
  }

  static handleGenericError(message) {
    alert(`Erro: ${message}`);
  }
}

// Interceptor global de erros
api.interceptError = (error, context) => {
  ApiErrorHandler.handle(error, context);
};
```

### 7. WebSocket para Atualizações em Tempo Real

```javascript
class RealTimeUpdates {
  constructor(api) {
    this.api = api;
    this.eventSource = null;
    this.listeners = {};
  }

  connect() {
    // Simulação de WebSocket com Server-Sent Events
    this.eventSource = new EventSource(`${this.api.baseUrl}/stream?token=${this.api.token}`);
    
    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleEvent(data);
    };

    this.eventSource.onerror = (error) => {
      console.error('Erro na conexão em tempo real:', error);
    };
  }

  handleEvent(data) {
    const { type, payload } = data;
    
    if (this.listeners[type]) {
      this.listeners[type].forEach(callback => callback(payload));
    }
  }

  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}

// Uso
const realTime = new RealTimeUpdates(api);

// Escutar atualizações de saldo
realTime.on('balance_updated', (data) => {
  console.log('Saldo atualizado:', data.new_balance);
  updateBalanceDisplay(data.new_balance);
});

// Escutar novas notificações
realTime.on('new_notification', (notification) => {
  showNotification(notification);
});

realTime.connect();
```

### 8. Exemplo PHP Completo

```php
<?php
class ApiPaineisClient {
    private $baseUrl;
    private $token;
    
    public function __construct($baseUrl = 'https://api.artepuradesign.com.br/api') {
        $this->baseUrl = $baseUrl;
    }
    
    public function login($login, $password) {
        $response = $this->makeRequest('/auth/login', 'POST', [
            'login' => $login,
            'password' => $password
        ]);
        
        if ($response['success']) {
            $this->token = $response['data']['token'];
            return $response['data']['user'];
        }
        
        throw new Exception($response['message']);
    }
    
    public function consultarCPF($cpf) {
        return $this->makeRequest('/consultas/cpf', 'POST', [
            'cpf' => preg_replace('/\D/', '', $cpf)
        ]);
    }
    
    private function makeRequest($endpoint, $method = 'GET', $data = null) {
        $ch = curl_init();
        
        $headers = ['Content-Type: application/json'];
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $this->baseUrl . $endpoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        
        if ($data && in_array($method, ['POST', 'PUT'])) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception("HTTP Error: $httpCode");
        }
        
        return json_decode($response, true);
    }
}

// Uso
try {
    $api = new ApiPaineisClient();
    
    // Login
    $user = $api->login('usuario123', 'senha123');
    echo "Usuário logado: " . $user['full_name'] . "\n";
    
    // Consultar CPF
    $resultado = $api->consultarCPF('123.456.789-09');
    if ($resultado['success']) {
        echo "Nome: " . $resultado['data']['nome'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}
?>
```

## 🔧 Ferramentas de Teste

### Postman Collection
```json
{
  "info": {
    "name": "API Painéis",
    "description": "Collection completa da API"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{api_token}}"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Auto-refresh token if needed",
          "if (pm.globals.get('token_expires') < Date.now()) {",
          "  // Refresh token logic",
          "}"
        ]
      }
    }
  ]
}
```

## 📊 Monitoramento

```javascript
// Métricas de performance
class ApiMetrics {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }

  trackRequest(startTime, success) {
    this.metrics.requests++;
    if (!success) this.metrics.errors++;
    
    const responseTime = Date.now() - startTime;
    this.metrics.avgResponseTime = (
      (this.metrics.avgResponseTime * (this.metrics.requests - 1) + responseTime) / 
      this.metrics.requests
    );
  }

  getStats() {
    return {
      ...this.metrics,
      errorRate: (this.metrics.errors / this.metrics.requests) * 100
    };
  }
}
```

Estes exemplos cobrem os principais casos de uso da API Painéis e demonstram como integrar corretamente com diferentes tecnologias.
