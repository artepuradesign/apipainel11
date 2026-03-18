
# API Painéis - Documentação Completa de Endpoints

**Base URL:** `https://api.artepuradesign.com.br/api`

## 📋 Índice
- [Autenticação](#autenticação)
- [Usuários](#usuários)
- [Dashboard](#dashboard)
- [Consultas](#consultas)
- [Carteira](#carteira)
- [Pagamentos](#pagamentos)
- [Planos](#planos)
- [Módulos](#módulos)
- [Suporte](#suporte)
- [Relatórios](#relatórios)
- [Sistema](#sistema)
- [Webhooks](#webhooks)
- [Administração](#administração)
- [Home/Público](#homepúblico)

---

## 🔐 Autenticação

### POST /auth/login
Autenticar usuário no sistema.

**Body:**
```json
{
  "login": "usuario123",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": 1,
      "login": "usuario123",
      "email": "user@email.com",
      "role": "assinante",
      "plan": "queens",
      "balance": 150.50
    }
  }
}
```

### POST /auth/register
Registrar novo usuário.

**Body:**
```json
{
  "login": "novousuario",
  "email": "novo@email.com",
  "password": "senha123",
  "full_name": "Nome Completo",
  "cpf": "12345678909",
  "phone": "11999999999",
  "referral_code": "REF123" // opcional
}
```

### POST /auth/logout
Fazer logout do usuário.

### POST /auth/refresh
Renovar token de acesso.

### POST /auth/forgot-password
Solicitar recuperação de senha.

**Body:**
```json
{
  "email": "user@email.com"
}
```

### POST /auth/reset-password
Redefinir senha com token.

**Body:**
```json
{
  "token": "reset_token",
  "password": "nova_senha"
}
```

### GET /auth/verify-email
Verificar email com token.

### GET /auth/me
Obter dados do usuário autenticado.

---

## 👤 Usuários

### GET /users/profile
Obter perfil do usuário atual.

### PUT /users/profile
Atualizar perfil do usuário.

**Body:**
```json
{
  "full_name": "Nome Atualizado",
  "phone": "11888888888",
  "address": "Nova Rua, 123"
}
```

### PUT /users/password
Alterar senha do usuário.

**Body:**
```json
{
  "current_password": "senha_atual",
  "new_password": "nova_senha"
}
```

### GET /users/stats
Obter estatísticas do usuário.

---

## 📊 Dashboard

### GET /dashboard/home
Obter dados principais do dashboard.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "João Silva",
      "plan": "queens",
      "balance": 250.75
    },
    "stats": {
      "total_consultations": 45,
      "monthly_consultations": 12,
      "success_rate": 98.5
    },
    "recent_activities": [...],
    "active_modules": [...]
  }
}
```

### GET /dashboard/balance
Obter saldo do usuário.

### GET /dashboard/transactions
Obter transações do usuário.

### GET /dashboard/modules
Obter módulos disponíveis para o usuário.

### POST /dashboard/modules/execute
Executar um módulo específico.

### GET /dashboard/stats
Obter estatísticas detalhadas.

---

## 🔍 Consultas

### POST /consultas/cpf
Consultar dados por CPF.

**Body:**
```json
{
  "cpf": "12345678909"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cpf": "123.456.789-09",
    "nome": "MARIA SILVA",
    "data_nascimento": "1980-05-15",
    "situacao_cadastral": "REGULAR",
    "genero": "F"
  },
  "cost": 2.50
}
```

### POST /consultas/cnpj
Consultar dados por CNPJ.

**Body:**
```json
{
  "cnpj": "12345678000190"
}
```

### POST /consultas/veiculo
Consultar dados de veículo.

**Body:**
```json
{
  "placa": "ABC1234"
}
```

### POST /consultas/nome
Buscar por nome.

**Body:**
```json
{
  "nome": "Maria Silva",
  "uf": "SP" // opcional
}
```

### POST /consultas/telefone
Buscar por telefone.

**Body:**
```json
{
  "telefone": "11999999999"
}
```

### GET /consultas/historico
Obter histórico de consultas.

**Query Params:**
- `page`: Página (padrão: 1)
- `limit`: Limite por página (padrão: 20)
- `type`: Tipo de consulta (cpf, cnpj, veiculo, etc.)
- `date_start`: Data início
- `date_end`: Data fim

### GET /consultas/stats
Obter estatísticas de consultas.

---

## 💰 Carteira

### GET /wallet/balance
Obter saldo detalhado da carteira.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_balance": 150.75,
    "pending_balance": 25.00,
    "total_earned": 1250.00,
    "total_spent": 1099.25
  }
}
```

### GET /wallet/transactions
Obter histórico de transações.

### POST /wallet/transfer
Transferir saldo entre usuários.

**Body:**
```json
{
  "recipient_login": "usuario_destino",
  "amount": 50.00,
  "description": "Transferência"
}
```

### GET /wallet/pix/keys
Obter chaves PIX do usuário.

### POST /wallet/pix/create
Criar nova chave PIX.

**Body:**
```json
{
  "key_type": "cpf",
  "key_value": "12345678909"
}
```

### POST /wallet/pix/qrcode
Gerar QR Code PIX.

### POST /wallet/pix/withdrawal
Criar saque via PIX.

**Body:**
```json
{
  "amount": 100.00,
  "pix_key": "12345678909"
}
```

### DELETE /wallet/pix/{id}
Remover chave PIX.

### GET /wallet/bank/accounts
Obter contas bancárias.

### POST /wallet/bank/add
Adicionar conta bancária.

### DELETE /wallet/bank/{id}
Remover conta bancária.

### GET /wallet/stats
Obter estatísticas da carteira.

---

## 💳 Pagamentos

### POST /payments/create
Criar novo pagamento.

**Body:**
```json
{
  "amount": 100.00,
  "method": "pix",
  "description": "Recarga de saldo"
}
```

### POST /payments/confirm
Confirmar pagamento.

**Body:**
```json
{
  "payment_id": "12345",
  "confirmation_code": "ABC123"
}
```

### GET /payments/history
Obter histórico de pagamentos.

### GET /payments/methods
Obter métodos de pagamento disponíveis.

### GET /payments/{id}
Obter detalhes de um pagamento.

### POST /payments/webhook
Webhook para processamento de pagamentos.

---

## 📋 Planos

### GET /plans
Obter todos os planos disponíveis.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Queens",
      "price": 29.90,
      "duration_days": 30,
      "discount_percentage": 10,
      "features": [
        "10% desconto em consultas",
        "Suporte prioritário"
      ]
    }
  ]
}
```

### GET /plans/queens
Obter planos Queens.

### GET /plans/kings
Obter planos Kings.

### GET /plans/{id}
Obter detalhes de um plano específico.

---

## 🔧 Módulos

### GET /modules
Obter todos os módulos.

### GET /modules/latest
Obter módulos mais recentes.

### GET /modules/category/{category}
Obter módulos por categoria.

### GET /modules/{id}
Obter detalhes de um módulo.

---

## 🎧 Suporte

### GET /support/tickets
Obter tickets do usuário.

### POST /support/tickets/create
Criar novo ticket.

**Body:**
```json
{
  "subject": "Problema na consulta",
  "description": "Descrição detalhada do problema",
  "category": "tecnico",
  "priority": "media"
}
```

### GET /support/tickets/{id}
Obter detalhes de um ticket.

### POST /support/tickets/{id}/reply
Responder a um ticket.

**Body:**
```json
{
  "message": "Minha resposta ao ticket"
}
```

### PUT /support/tickets/{id}/close
Fechar um ticket.

### GET /support/categories
Obter categorias de suporte.

### GET /support/faq
Obter perguntas frequentes.

### POST /support/feedback
Enviar feedback.

---

## 📈 Relatórios

### GET /reports/transactions
Relatório de transações.

**Query Params:**
- `date_start`: Data início
- `date_end`: Data fim
- `format`: json, pdf, excel

### GET /reports/consultations
Relatório de consultas.

### GET /reports/users
Relatório de usuários.

### GET /reports/revenue
Relatório de receita.

### GET /reports/activity
Relatório de atividades.

### POST /reports/generate
Gerar relatório customizado.

### POST /reports/export
Exportar relatório.

---

## ⚙️ Sistema

### GET /system/status
Obter status do sistema.

### GET /system/config
Obter configurações do sistema.

### PUT /system/config
Atualizar configurações.

### GET /system/logs
Obter logs do sistema.

### POST /system/maintenance
Ativar/desativar modo manutenção.

### POST /system/backup/create
Criar backup.

### GET /system/backup/list
Listar backups.

### POST /system/cache/clear
Limpar cache.

---

## 🎣 Webhooks

### POST /webhooks/payment
Webhook de pagamentos.

### POST /webhooks/pix
Webhook PIX.

### POST /webhooks/mercadopago
Webhook MercadoPago.

### POST /webhooks/pagseguro
Webhook PagSeguro.

### POST /webhooks/stripe
Webhook Stripe.

### POST /webhooks/paypal
Webhook PayPal.

### GET /webhooks/test
Testar endpoint de webhook.

---

## 👑 Administração

### GET /admin/dashboard
Dashboard administrativo.

### GET /admin/stats
Estatísticas administrativas.

### GET /admin/users
Listar todos os usuários.

### POST /admin/users/create
Criar usuário.

### PUT /admin/users/{id}
Atualizar usuário.

### DELETE /admin/users/{id}
Deletar usuário.

### POST /admin/users/block
Bloquear usuário.

### GET /admin/reports
Relatórios administrativos.

### POST /admin/system/maintenance
Modo manutenção.

---

## 🏠 Home/Público

### GET /home
Obter dados da página inicial.

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 15420,
    "total_consultations": 89234,
    "success_rate": 99.2,
    "featured_plans": [...],
    "latest_modules": [...],
    "testimonials": [...]
  }
}
```

### GET /home/plans
Obter planos em destaque.

### GET /home/modules
Obter módulos em destaque.

### GET /home/testimonials
Obter depoimentos.

### GET /testimonials
Obter todos os depoimentos.

### GET /testimonials/{id}
Obter depoimento específico.

---

## 🔑 Headers de Autenticação

Para endpoints que requerem autenticação, incluir:

```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## 📝 Códigos de Status

- **200**: Sucesso
- **201**: Criado
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Proibido
- **404**: Não encontrado
- **429**: Muitas requisições
- **500**: Erro interno do servidor

## 🛡️ Rate Limiting

- **Autenticados**: 1000 requisições/hora
- **Não autenticados**: 100 requisições/hora
- **Webhooks**: Sem limite

## 📧 Exemplos de Uso

### Fluxo de Login Completo
```bash
# 1. Login
curl -X POST https://api.artepuradesign.com.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"usuario123","password":"senha123"}'

# 2. Usar token nas próximas requisições
curl -X GET https://api.artepuradesign.com.br/api/dashboard/home \
  -H "Authorization: Bearer jwt_token_here"
```

### Consulta CPF
```bash
curl -X POST https://api.artepuradesign.com.br/api/consultas/cpf \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678909"}'
```

### Transferência de Saldo
```bash
curl -X POST https://api.artepuradesign.com.br/api/wallet/transfer \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{"recipient_login":"destino123","amount":50.00,"description":"Transferência"}'
```

---

**📅 Última atualização:** Dezembro 2024  
**🌐 Ambiente:** Produção  
**📞 Suporte:** Através do sistema de tickets da API
