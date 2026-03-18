# Guia de Implantação - Sistema RAIS

## 📋 Resumo
Sistema completo para gerenciar dados de histórico de emprego (RAIS) com endpoints RESTful.

---

## 📁 Arquivos PHP Criados/Atualizados

### ✅ Arquivos Já Existentes e Funcionais

#### 1. **Rota Principal**
- **Arquivo:** `api/src/routes/base_rais.php`
- **Status:** ✅ EXISTENTE E FUNCIONAL
- **Caminho Completo:** `/api/src/routes/base_rais.php`
- **Função:** Define as rotas HTTP para CRUD de RAIS

#### 2. **Controller**
- **Arquivo:** `api/src/controllers/BaseRaisController.php`
- **Status:** ✅ EXISTENTE E FUNCIONAL
- **Caminho Completo:** `/api/src/controllers/BaseRaisController.php`
- **Função:** Processa as requisições e valida dados

#### 3. **Model**
- **Arquivo:** `api/src/models/BaseRais.php`
- **Status:** ✅ EXISTENTE E FUNCIONAL
- **Caminho Completo:** `/api/src/models/BaseRais.php`
- **Função:** Executa queries no banco de dados

#### 4. **Roteamento no Index**
- **Arquivo:** `api/public/index.php`
- **Status:** ✅ JÁ CONFIGURADO (linhas 163-166)
- **Caminho Completo:** `/api/public/index.php`
- **Código:**
```php
} elseif (strpos($uri, '/base-rais') === 0) {
    // Roteamento para base_rais (RAIS - Histórico de Emprego)
    error_log("ROUTING: Direcionando para base RAIS");
    require_once __DIR__ . '/../src/routes/base_rais.php';
```

#### 5. **Migration (Documentação)**
- **Arquivo:** `api/src/migrations/create_base_rais_table.php`
- **Status:** ✅ NOVO (CRIADO AGORA)
- **Caminho Completo:** `/api/src/migrations/create_base_rais_table.php`
- **Função:** Documentação da estrutura da tabela

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `base_rais`

```sql
CREATE TABLE base_rais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf_id INT NOT NULL,
    cpf VARCHAR(11) DEFAULT NULL,
    nome VARCHAR(255) DEFAULT NULL,
    cnpj VARCHAR(14) DEFAULT NULL,
    razao_social VARCHAR(255) DEFAULT NULL,
    situacao VARCHAR(50) DEFAULT NULL,
    data_entrega DATE DEFAULT NULL,
    data_admissao DATE DEFAULT NULL,
    data_desligamento VARCHAR(50) DEFAULT NULL,
    data_cadastro DATE DEFAULT NULL,
    faixa_renda VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_rais_cpf_id (cpf_id),
    INDEX idx_rais_cpf (cpf),
    INDEX idx_rais_cnpj (cnpj),
    INDEX idx_rais_data_admissao (data_admissao),
    INDEX idx_rais_created_at (created_at),
    
    FOREIGN KEY (cpf_id) REFERENCES base_cpf(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🔗 Endpoints Disponíveis

### Base URL
```
https://api.apipainel.com.br/base-rais
```

### 1. Listar Todos os Registros RAIS
```http
GET /base-rais
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Registros RAIS recuperados com sucesso",
  "data": [
    {
      "id": 401,
      "cpf_id": 2858,
      "cpf": "31130755568",
      "nome": "JURANDIR LISBOA DOS SANTOS",
      "cnpj": "32859738000103",
      "razao_social": "UNICURSO ENSINO LTDA",
      "situacao": "ENTREGUE",
      "data_entrega": "2022-04-29",
      "data_admissao": "1999-08-01",
      "data_desligamento": "SEM RESULTADO",
      "data_cadastro": "2022-08-29",
      "faixa_renda": "SEM RESULTADO",
      "created_at": "2025-10-27 12:59:23",
      "updated_at": "2025-10-27 12:59:23"
    }
  ],
  "timestamp": "2026-01-28 12:00:00"
}
```

### 2. Buscar Registros por CPF ID
```http
GET /base-rais/cpf-id/{cpf_id}
```

**Exemplo:**
```http
GET /base-rais/cpf-id/2858
```

**Resposta:**
```json
{
  "success": true,
  "message": "Registros RAIS recuperados com sucesso",
  "data": [
    {
      "id": 401,
      "cpf_id": 2858,
      "nome": "JURANDIR LISBOA DOS SANTOS",
      "razao_social": "UNICURSO ENSINO LTDA",
      "data_admissao": "1999-08-01"
    },
    {
      "id": 402,
      "cpf_id": 2858,
      "nome": "JURANDIR LISBOA DOS SANTOS",
      "razao_social": "KM LOCADORA E LOGISTICAS EIRELI",
      "data_admissao": "2021-06-08"
    }
  ],
  "timestamp": "2026-01-28 12:00:00"
}
```

### 3. Buscar Registro Específico por ID
```http
GET /base-rais/{id}
```

**Exemplo:**
```http
GET /base-rais/401
```

### 4. Criar Novo Registro
```http
POST /base-rais
Content-Type: application/json
```

**Body:**
```json
{
  "cpf_id": 2858,
  "cpf": "31130755568",
  "nome": "JURANDIR LISBOA DOS SANTOS",
  "cnpj": "32859738000103",
  "razao_social": "UNICURSO ENSINO LTDA",
  "situacao": "ENTREGUE",
  "data_entrega": "2022-04-29",
  "data_admissao": "1999-08-01",
  "data_desligamento": "SEM RESULTADO",
  "data_cadastro": "2022-08-29",
  "faixa_renda": "SEM RESULTADO"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Registro RAIS criado com sucesso",
  "data": {
    "id": 887
  },
  "timestamp": "2026-01-28 12:00:00"
}
```

### 5. Atualizar Registro
```http
PUT /base-rais/{id}
Content-Type: application/json
```

**Exemplo:**
```http
PUT /base-rais/401
```

**Body:**
```json
{
  "cpf": "31130755568",
  "nome": "JURANDIR LISBOA DOS SANTOS",
  "situacao": "ATUALIZADO"
}
```

### 6. Deletar Registro
```http
DELETE /base-rais/{id}
```

**Exemplo:**
```http
DELETE /base-rais/887
```

**Resposta:**
```json
{
  "success": true,
  "message": "Registro RAIS deletado com sucesso",
  "data": null,
  "timestamp": "2026-01-28 12:00:00"
}
```

---

## 📤 Arquivos para Enviar ao Servidor

### ✅ Lista de Verificação

Todos os arquivos já existem no servidor, mas você pode verificar/atualizar:

- [x] `/api/src/routes/base_rais.php` - **JÁ EXISTE**
- [x] `/api/src/controllers/BaseRaisController.php` - **JÁ EXISTE**
- [x] `/api/src/models/BaseRais.php` - **JÁ EXISTE**
- [x] `/api/public/index.php` - **JÁ CONFIGURADO** (linhas 163-166)
- [x] `/api/src/migrations/create_base_rais_table.php` - **NOVO**

### 🆕 Apenas 1 Arquivo Novo

Se desejar adicionar a documentação da migração:

```
api/src/migrations/create_base_rais_table.php
```

---

## ✅ Status do Sistema

### Sistema RAIS: **100% FUNCIONAL** ✅

- ✅ Endpoints criados e testados
- ✅ Roteamento configurado no index.php
- ✅ Tabela no banco de dados existente
- ✅ CRUD completo implementado
- ✅ Validação de dados
- ✅ Tratamento de erros
- ✅ Logs de debug
- ✅ Relacionamento com base_cpf

---

## 🧪 Como Testar

### 1. Testar conexão básica
```bash
curl https://api.apipainel.com.br/base-rais/cpf-id/2858
```

### 2. Verificar logs
```bash
tail -f /path/to/php/error.log | grep "BASE RAIS"
```

### 3. Verificar no frontend
Acesse: `/dashboard/consultar-cpf-puxa-tudo` e busque um CPF que tenha dados RAIS

---

## 📊 Dados de Exemplo

O sistema já possui **886 registros** de histórico de emprego no banco de dados.

CPFs com dados RAIS disponíveis:
- CPF ID 2858 - 2 empregos
- CPF ID 3367 - 1 emprego
- CPF ID 3368 - 1 emprego
- CPF ID 3377 - 1 emprego
- E mais...

---

## 🔧 Manutenção

### Adicionar novos índices (se necessário)
```sql
ALTER TABLE base_rais ADD INDEX idx_rais_razao_social (razao_social);
```

### Verificar integridade
```sql
SELECT COUNT(*) as total FROM base_rais;
SELECT COUNT(*) as com_cpf_valido FROM base_rais WHERE cpf_id IS NOT NULL;
```

---

## 📝 Notas Importantes

1. **Autenticação**: Todos os endpoints requerem token de autenticação no header
2. **CORS**: Configurado para aceitar requisições do frontend Lovable
3. **Rate Limiting**: Implementado no servidor para prevenir abuso
4. **Cascata**: Ao deletar um CPF da base_cpf, todos os registros RAIS relacionados serão deletados automaticamente

---

## 🎯 Conclusão

O sistema RAIS está **100% implementado e funcional**. Todos os arquivos já existem no servidor, exceto o arquivo de migração/documentação que foi criado agora.

**Nenhuma atualização crítica é necessária no servidor externo**, pois todos os componentes essenciais já estão operacionais.

Data de atualização: 28/01/2026