
# Guia de Autenticação - API Painéis

## 🔐 Visão Geral

A API Painéis utiliza autenticação baseada em **JWT (JSON Web Tokens)** para proteger os endpoints. Este documento detalha como implementar a autenticação corretamente.

## 🚀 Processo de Autenticação

### 1. Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "login": "usuario123",
  "password": "senha123"
}
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_in": 3600,
    "user": {
      "id": 1,
      "login": "usuario123",
      "email": "user@email.com",
      "role": "assinante",
      "plan": "queens",
      "balance": 150.50,
      "status": "ativo"
    }
  }
}
```

### 2. Usando o Token
Inclua o token em todas as requisições autenticadas:

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

### 3. Renovação do Token
```bash
POST /api/auth/refresh
Authorization: Bearer {current_token}
```

## 🛡️ Middleware de Autenticação

O middleware verifica:
- ✅ Presença do token
- ✅ Validade do token
- ✅ Expiração
- ✅ Status do usuário
- ✅ Permissões de acesso

## 👥 Níveis de Acesso

### Assinante (assinante)
- Acesso ao dashboard pessoal
- Realizar consultas
- Gerenciar carteira
- Criar tickets de suporte

### Suporte (suporte)
- Tudo do assinante +
- Acesso administrativo
- Gerenciar usuários
- Visualizar relatórios
- Configurações do sistema

## 🔒 Segurança

### Headers Obrigatórios
```
Authorization: Bearer {token}
Content-Type: application/json
```

### Tratamento de Erros
```json
{
  "success": false,
  "message": "Token inválido ou expirado",
  "error_code": "UNAUTHORIZED"
}
```

### Rate Limiting
- **Tentativas de login**: 5/minuto por IP
- **Requisições autenticadas**: 1000/hora
- **Requisições públicas**: 100/hora

## 📝 Implementação no Cliente

### JavaScript/React
```javascript
// Armazenar token
localStorage.setItem('api_token', response.data.token);

// Usar token nas requisições
const token = localStorage.getItem('api_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Interceptor para renovação automática
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expirado, tentar renovar
      try {
        const newToken = await refreshToken();
        localStorage.setItem('api_token', newToken);
        // Repetir requisição original
        return axios.request(error.config);
      } catch (refreshError) {
        // Redirecionar para login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### PHP
```php
// Fazer login
$response = $this->http->post('/api/auth/login', [
    'login' => $login,
    'password' => $password
]);

$token = $response['data']['token'];

// Usar token
$headers = [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
```

## 🔄 Fluxo Completo

```mermaid
sequenceDiagram
    Client->>API: POST /auth/login
    API->>Client: Token + User Data
    Client->>API: GET /dashboard (with token)
    API->>Client: Dashboard Data
    Note over API: Token expires
    Client->>API: POST /auth/refresh
    API->>Client: New Token
```

## ⚠️ Melhores Práticas

### ✅ Fazer
- Armazenar token de forma segura
- Implementar renovação automática
- Validar token antes de fazer requisições
- Fazer logout ao sair da aplicação
- Usar HTTPS em produção

### ❌ Não Fazer
- Armazenar token em cookies não seguros
- Ignorar tokens expirados
- Fazer muitas tentativas de login
- Compartilhar tokens entre usuários
- Logar tokens no console em produção

## 🔧 Debugging

### Verificar Token
```javascript
function decodeToken(token) {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

const tokenData = decodeToken(localStorage.getItem('api_token'));
console.log('Token expira em:', new Date(tokenData.exp * 1000));
```

### Testar Autenticação
```bash
# Testar token válido
curl -X GET https://api.artepuradesign.com.br/api/auth/me \
  -H "Authorization: Bearer {seu_token}"

# Resposta esperada
{
  "success": true,
  "data": {
    "id": 1,
    "login": "usuario123",
    "email": "user@email.com"
  }
}
```
