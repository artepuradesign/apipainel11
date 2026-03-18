# Auditoria de Endpoints - Página CPF View

## Status dos Endpoints para /dashboard/admin/cpf-view/:id

### ✅ CORRIGIDOS E FUNCIONANDO

| Seção | Tabela | Endpoint | Status | Observações |
|-------|--------|----------|--------|-------------|
| **CNPJ MEI** | `base_cnpj_mei` | `/base-cnpj-mei` | ✅ **OK** | Roteamento corrigido para `api/routes/base-cnpj-mei.php` |
| **Dívidas Ativas (SIDA)** | `base_dividas_ativas` | `/base-dividas-ativas` | ✅ **OK** | Roteamento corrigido para `api/routes/base-dividas-ativas.php` |
| **Auxílio Emergencial** | `base_auxilio_emergencial` | `/base-auxilio-emergencial` | ✅ **OK** | Roteamento corrigido para `api/routes/base-auxilio-emergencial.php` |
| **Senhas de Email** | `base_senha_email` | `/base-senha-email` | ✅ **OK** | Roteamento corrigido para `api/routes/base-senha-email.php` com controller |
| **Senhas de CPF** | `base_senha_cpf` | `/base-senha-cpf` | ✅ **OK** | Roteamento corrigido para `api/routes/base-senha-cpf.php` com controller |
| **INSS** | `base_inss` | `/base-inss` | ✅ **OK** | Usa `api/routes/base-inss.php` |

### ⚠️ USANDO ESTRUTURA ANTIGA (src/routes/)

| Seção | Tabela | Endpoint | Status | Ação Necessária |
|-------|--------|----------|--------|-----------------|
| **CPF** | `base_cpf` | `/base-cpf` | ⚠️ **OLD** | Migrar para `api/routes/base-cpf.php` |
| **RG** | `base_rg` | `/base-rg` | ⚠️ **OLD** | Migrar para `api/routes/base-rg.php` |
| **CNH** | `base_cnh` | `/base-cnh` | ⚠️ **OLD** | Migrar para `api/routes/base-cnh.php` |
| **Telefones** | `base_telefone` | `/base-telefone` | ⚠️ **OLD** | Migrar para `api/routes/base-telefone.php` |
| **Emails** | `base_email` | `/base-email` | ⚠️ **OLD** | Migrar para `api/routes/base-email.php` |
| **Endereços** | `base_endereco` | `/base-endereco` | ⚠️ **OLD** | Migrar para `api/routes/base-endereco.php` |
| **Fotos** | `base_foto` | `/base-foto` | ⚠️ **OLD** | Migrar para `api/routes/base-foto.php` |
| **Credilink** | `base_credilink` | `/base-credilink` | ⚠️ **OLD** | Migrar para `api/routes/base-credilink.php` |
| **Vacina** | `base_vacina` | `/base-vacina` | ⚠️ **OLD** | Migrar para `api/routes/base-vacina.php` |
| **Parentes** | `base_parente` | `/base-parente` | ⚠️ **OLD** | Migrar para `api/routes/base-parente.php` |
| **Empresas Sócio** | `base_empresa_socio` | `/base-empresa-socio` | ⚠️ **OLD** | Migrar para `api/routes/base-empresa-socio.php` |
| **Rais** | `base_rais` | `/base-rais` | ⚠️ **OLD** | Migrar para `api/routes/base-rais.php` |
| **Vivo** | `base_vivo` | `/base-vivo` | ⚠️ **OLD** | Migrar para `api/routes/base-vivo.php` |
| **Claro** | `base_claro` | `/base-claro` | ⚠️ **OLD** | Migrar para `api/routes/base-claro.php` |
| **Tim** | `base_tim` | `/base-tim` | ⚠️ **OLD** | Migrar para `api/routes/base-tim.php` |
| **Boletim Ocorrência** | `base_boletim_ocorrencia` | `/base-boletim-ocorrencia` | ⚠️ **OLD** | Migrar para `api/routes/base-boletim-ocorrencia.php` |
| **Histórico Veículo** | `base_historico_veiculo` | `/base-historico-veiculo` | ⚠️ **OLD** | Migrar para `api/routes/base-historico-veiculo.php` |

## Estrutura Padrão das Rotas

### Estrutura NOVA (Recomendada) ✅
```
api/routes/
├── base-cnpj-mei.php          ✅ CORRIGIDO
├── base-dividas-ativas.php    ✅ CORRIGIDO
├── base-auxilio-emergencial.php ✅ CORRIGIDO
├── base-senha-email.php       ✅ CORRIGIDO
├── base-senha-cpf.php         ✅ CORRIGIDO
└── base-inss.php              ✅ OK
```

**Características:**
- ✅ Própria conexão com `getConnection()`
- ✅ Headers CORS configurados
- ✅ Middleware de autenticação
- ✅ Controllers padronizados
- ✅ Tratamento completo de exceções
- ✅ Suporte a todos os métodos HTTP (GET, POST, PUT, DELETE)

### Estrutura ANTIGA (A Migrar) ⚠️
```
api/src/routes/
├── base_cpf.php               ⚠️ MIGRAR
├── base_rg.php                ⚠️ MIGRAR
├── base_cnh.php               ⚠️ MIGRAR
└── ... (outros arquivos)      ⚠️ MIGRAR
```

**Problemas:**
- ⚠️ Depende de `$db` externo
- ⚠️ Estrutura inconsistente
- ⚠️ Falta padronização

## Operações CRUD Necessárias

Todas as tabelas devem suportar:

1. **CREATE** - POST `/base-{nome}` - Criar novo registro
2. **READ** - GET `/base-{nome}?cpf_id={id}` - Buscar por CPF ID
3. **UPDATE** - PUT `/base-{nome}/{id}` - Atualizar registro
4. **DELETE** - DELETE `/base-{nome}/{id}` - Deletar registro individual
5. **DELETE BY CPF** - DELETE `/base-{nome}/cpf/{cpf_id}` - Deletar todos do CPF

## Componentes Frontend

Todos os componentes em `src/components/dashboard/` seguem o padrão:
- `{Nome}Section.tsx` - Componente de exibição
- Service em `src/services/base{Nome}Service.ts`
- Hook (opcional) em `src/hooks/useBase{Nome}.ts`

## Próximos Passos

1. ✅ **Concluído:** CNPJ MEI, Dívidas Ativas, Auxílio Emergencial, Senhas
2. ⏳ **Pendente:** Migrar demais rotas para estrutura padronizada
3. ⏳ **Pendente:** Testar todos os endpoints
4. ⏳ **Pendente:** Documentar API com Swagger/OpenAPI

## Teste de Validação

Para testar cada endpoint:

```bash
# GET - Listar por CPF ID
curl -H "Authorization: Bearer {token}" \
  https://api.apipainel.com.br/base-{nome}?cpf_id=4042

# POST - Criar
curl -X POST -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"cpf_id": 4042, ...}' \
  https://api.apipainel.com.br/base-{nome}

# PUT - Atualizar
curl -X PUT -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{...}' \
  https://api.apipainel.com.br/base-{nome}/{id}

# DELETE - Deletar
curl -X DELETE -H "Authorization: Bearer {token}" \
  https://api.apipainel.com.br/base-{nome}/{id}
```

## Notas Importantes

- ⚠️ Todos os endpoints devem validar `cpf_id` obrigatório
- ⚠️ Autenticação via Bearer token é obrigatória
- ⚠️ CORS deve estar habilitado para todas as origens
- ⚠️ Respostas devem seguir formato padronizado:
  ```json
  {
    "success": true/false,
    "data": {...},
    "message": "...",
    "timestamp": "..."
  }
  ```
