# Sistema de Upload de Fotos via N8N

## Visão Geral

Sistema completo para receber fotos em base64 do N8N, converter para JPG, salvar em disco e cadastrar no banco de dados.

---

## Fluxo de Dados

```
N8N (HTML com imagens)
    ↓
Extração de imagens (base64)
    ↓
API: /upload-photo-base64.php
    ↓
1. Validação cpf_id no banco
2. Busca CPF completo
3. Conversão base64 → JPG
4. Redimensionamento (máx 800px)
5. Salvamento em /fotos/{cpf}.jpg
6. Cadastro na tabela base_foto
    ↓
Resposta de sucesso com URL da foto
```

---

## Endpoints

### POST `/upload-photo-base64.php`

**URL Completa:** `https://api.apipainel.com.br/upload-photo-base64.php`

**Content-Type:** `application/json`

**Payload:**
```json
{
  "cpf_id": 123,
  "image_data": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "type": "foto2"
}
```

**Campos:**
- `cpf_id` (obrigatório): ID do CPF na tabela `base_cpf`
- `image_data` (obrigatório): Imagem em base64 (com ou sem prefixo data:image)
- `type` (opcional): Tipo da foto
  - Sem valor ou `"foto"`: Primeira foto → `{cpf}.jpg`
  - `"foto2"`: Segunda foto → `{cpf}_2.jpg`
  - `"foto3"`: Terceira foto → `{cpf}_3.jpg`
  - `"foto4"`: Quarta foto → `{cpf}_4.jpg`

---

## Resposta da API

### Sucesso (200)
```json
{
  "success": true,
  "message": "Foto base64 enviada e cadastrada com sucesso",
  "data": {
    "message": "Foto enviada e cadastrada com sucesso",
    "filename": "12345678900_2.jpg",
    "path": "/fotos/12345678900_2.jpg",
    "cpf": "12345678900",
    "cpf_id": 123,
    "photo_url": "https://api.apipainel.com.br/fotos/12345678900_2.jpg",
    "db_id": 456
  }
}
```

### Erros
```json
// cpf_id não encontrado (404)
{
  "success": false,
  "error": "cpf_id não encontrado na base de dados"
}

// Campos obrigatórios faltando (400)
{
  "success": false,
  "error": "cpf_id ou cpf é obrigatório"
}

// Imagem muito grande (400)
{
  "success": false,
  "error": "Imagem muito grande. Máximo: 5MB"
}

// Base64 inválido (400)
{
  "success": false,
  "error": "Erro ao decodificar base64"
}
```

---

## Estrutura do Banco de Dados

### Tabela: `base_foto`

```sql
CREATE TABLE `base_foto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cpf_id` int(11) NOT NULL,
  `nome` varchar(50) DEFAULT NULL COMMENT 'foto, foto2, foto3, foto4',
  `photo` varchar(255) DEFAULT NULL COMMENT 'Nome do arquivo',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cpf_id` (`cpf_id`),
  CONSTRAINT `fk_base_foto_cpf` FOREIGN KEY (`cpf_id`) 
    REFERENCES `base_cpf` (`id`) ON DELETE CASCADE
);
```

**Exemplo de dados:**
| id  | cpf_id | nome   | photo              | created_at          |
|-----|--------|--------|--------------------|---------------------|
| 1   | 123    | foto   | 12345678900.jpg    | 2025-01-27 10:00:00 |
| 2   | 123    | foto2  | 12345678900_2.jpg  | 2025-01-27 10:01:00 |
| 3   | 456    | foto   | 98765432100.jpg    | 2025-01-27 10:02:00 |

---

## Fluxo N8N

### Importar JSON
Arquivo: `n8n-fluxo-upload-fotos.json`

### Configuração

**Node 1: Extrair Fotos do HTML**
- Tipo: Code (JavaScript)
- Entrada esperada: `{ cpf_id: 123, data: "<html>...</html>" }`
- Saída: Array de fotos com `{ cpf_id, image_data, type }`

**Node 2: Upload Foto via API**
- Tipo: HTTP Request
- Método: POST
- URL: `https://api.apipainel.com.br/upload-photo-base64.php`
- Headers: `Content-Type: application/json`
- Body: JSON com `cpf_id`, `image_data`, `type`

---

## Processamento da Imagem

1. **Validação do Base64**
   - Remove prefixo `data:image/*;base64,` se existir
   - Decodifica base64 para binário
   - Valida tamanho máximo: 5MB

2. **Conversão para JPG**
   - Usa `imagecreatefromstring()` do PHP
   - Suporta entrada: JPG, PNG, GIF, WEBP

3. **Redimensionamento**
   - Se largura > 800px, redimensiona mantendo proporção
   - Qualidade JPG: 85%

4. **Nomenclatura dos Arquivos**
   - Primeira foto: `{cpf}.jpg`
   - Segunda foto: `{cpf}_2.jpg`
   - Terceira foto: `{cpf}_3.jpg`
   - Quarta foto: `{cpf}_4.jpg`

---

## Logs de Debug

O sistema gera logs detalhados para debug:

```
UPLOAD_BASE64: Usando cpf_id direto: 123
UPLOAD_BASE64: CPF encontrado no banco: 12345678900
UPLOAD_BASE64: Image type detected: jpeg
UPLOAD_BASE64: Decoded image size: 245678 bytes
UPLOAD_BASE64: Nome do arquivo criado: 12345678900_2.jpg
UPLOAD_BASE64: Original dimensions: 1920x1080
UPLOAD_BASE64: Resized to: 800x450
UPLOAD_BASE64: Image saved successfully: /path/to/fotos/12345678900_2.jpg
UPLOAD_BASE64: Foto salva no banco com ID: 456
```

---

## Tratamento de Erros

### Erros Comuns

1. **"cpf_id não encontrado na base de dados"**
   - Causa: cpf_id não existe na tabela `base_cpf`
   - Solução: Cadastrar o CPF antes de enviar a foto

2. **"Erro ao decodificar base64"**
   - Causa: String base64 inválida ou corrompida
   - Solução: Verificar se o base64 está completo

3. **"Imagem muito grande. Máximo: 5MB"**
   - Causa: Imagem decodificada excede 5MB
   - Solução: Comprimir imagem antes de enviar

4. **"Erro ao processar imagem. Formato inválido."**
   - Causa: Formato de imagem não suportado
   - Solução: Converter para JPG, PNG ou GIF

---

## Integração com Frontend

### Exemplo TypeScript (baseFotoService.ts)

```typescript
import { API_BASE_URL } from '@/config/apiConfig';

export const uploadPhotoBase64 = async (
  cpfId: number,
  imageBase64: string,
  type?: 'foto' | 'foto2' | 'foto3' | 'foto4'
) => {
  const response = await fetch(`${API_BASE_URL}/upload-photo-base64.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cpf_id: cpfId,
      image_data: imageBase64,
      type: type || 'foto'
    }),
  });

  return await response.json();
};
```

---

## Segurança

1. **Validações Implementadas:**
   - ✅ cpf_id deve existir no banco
   - ✅ Tamanho máximo: 5MB
   - ✅ Formatos aceitos: JPG, PNG, GIF, WEBP
   - ✅ SQL Injection protegido (prepared statements)

2. **CORS:**
   - Configurado para aceitar todas as origens (`*`)
   - Métodos permitidos: POST, OPTIONS

3. **Armazenamento:**
   - Arquivos salvos em `/fotos/` fora do webroot
   - Nomenclatura padronizada por CPF
   - Permissões: 0755

---

## Manutenção

### Limpeza de Fotos Antigas
```bash
# Remover fotos não cadastradas no banco
cd /path/to/api/fotos
find . -type f -name "*.jpg" -mtime +30 -delete
```

### Backup
```bash
# Backup da pasta de fotos
tar -czf fotos-backup-$(date +%Y%m%d).tar.gz /path/to/api/fotos/
```

---

## Checklist de Implementação

- [x] Atualizar credenciais do banco (`conexao.php`)
- [x] Criar tabela `base_foto` no banco
- [x] Configurar roteamento no `index.php`
- [x] Criar controller `PhotoUploadBase64Controller.php`
- [x] Criar endpoint `upload-photo-base64.php`
- [x] Importar fluxo no N8N
- [x] Testar upload com cpf_id válido
- [x] Verificar fotos na pasta `/fotos/`
- [x] Verificar registros na tabela `base_foto`

---

## Suporte

Para dúvidas ou problemas:
1. Verificar logs do PHP: `tail -f /var/log/php-errors.log`
2. Verificar logs da aplicação com prefixo `UPLOAD_BASE64:`
3. Testar endpoint com Postman/Insomnia
4. Verificar se pasta `/fotos/` tem permissão de escrita

---

**Última atualização:** 2025-01-27
