# Sistema de Indicação - Documentação

## Visão Geral

O sistema de indicação permite que usuários ganhem bônus ao indicar novos usuários para a plataforma. Os bônus são creditados automaticamente quando o usuário indicado faz seu primeiro login.

## Estrutura do Banco de Dados

### Tabela `indicacoes`

```sql
CREATE TABLE indicacoes (
  id int PRIMARY KEY AUTO_INCREMENT,
  indicador_id int NOT NULL,
  indicado_id int NOT NULL,
  codigo varchar(50) NOT NULL,
  status enum('ativo','inativo','cancelado') DEFAULT 'ativo',
  bonus_indicador decimal(10,2) DEFAULT 5.00,
  bonus_indicado decimal(10,2) DEFAULT 5.00,
  first_login_bonus_processed tinyint(1) DEFAULT 0,
  first_login_at timestamp NULL,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Campos adicionados na tabela `users`

- `codigo_indicacao`: Código único de indicação do usuário
- `codigo_usado_indicacao`: Código de indicação usado no cadastro

## Endpoints da API

### GET /referrals
Busca dados de indicação do usuário autenticado.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_indicados": 5,
      "indicados_ativos": 3,
      "total_bonus": 15.00,
      "bonus_este_mes": 10.00
    },
    "referrals": [
      {
        "id": 1,
        "indicado_id": 123,
        "codigo": "USER001",
        "status": "ativo",
        "bonus_indicador": 5.00,
        "bonus_indicado": 5.00,
        "first_login_bonus_processed": true,
        "first_login_at": "2025-07-29 15:30:00",
        "created_at": "2025-07-29 14:00:00",
        "indicado_nome": "João Silva",
        "indicado_email": "joao@email.com",
        "indicado_cadastro": "2025-07-29 14:00:00"
      }
    ]
  }
}
```

### GET /system/referral-config
Busca configurações do sistema de indicação.

**Resposta:**
```json
{
  "success": true,
  "data": {
    "referral_system_enabled": true,
    "referral_bonus_enabled": true,
    "referral_commission_enabled": false,
    "referral_bonus_amount": 5.00,
    "referral_commission_percentage": 0.0
  }
}
```

## Como Funciona

### 1. Cadastro com Código de Indicação
- Usuário se cadastra usando URL com parâmetro `ref`: `/registration?ref=CODIGO123`
- Sistema armazena o código na tabela `users.codigo_usado_indicacao`
- Cria registro na tabela `indicacoes` vinculando indicador e indicado

### 2. Processamento de Bônus
- Quando o usuário indicado faz primeiro login, sistema chama procedure `ProcessarBonusPrimeiroLogin`
- Bônus é creditado no `saldo_plano` do indicador
- Atualiza `first_login_bonus_processed = 1` e `first_login_at`

### 3. Exibição na Interface
- Cards mostram estatísticas: Total Indicados, Ativos Este Mês, Bônus Total, Este Mês
- Lista mostra indicados recentes com detalhes de cadastro e primeiro login
- Status visual: Pendente (amarelo), Ativo (verde)

## Integração Frontend

### Componentes Principais

1. **ReferralStatsCards**: Exibe estatísticas dos bônus
2. **RecentReferralsCard**: Lista os indicados recentes
3. **referralApiService**: Service para comunicação com API

### Chamadas da API

```typescript
// Buscar dados de indicação
const data = await referralApiService.getUserReferrals();

// Buscar configurações
const config = await referralApiService.getReferralConfig();
```

## Logs e Monitoramento

- Todos os bônus processados são registrados na tabela `system_logs`
- Logs incluem: user_id, ação, descrição, módulo e timestamp
- Console logs em PHP para debug durante desenvolvimento

## Configurações

O sistema permite configurar:
- Valor do bônus por indicação (padrão: R$ 5,00)
- Habilitar/desabilitar sistema de indicação
- Habilitar/desabilitar bônus
- Porcentagem de comissão (futuro recurso)

## Próximos Passos

1. Implementar tabela de configurações dinâmicas
2. Dashboard admin para gerenciar indicações
3. Relatórios de performance
4. Sistema de comissões por vendas