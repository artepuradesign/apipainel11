

## Plano de Implementação — 4 Tarefas

### 1. Sistema de Blog (página `/blog` e `/blog/:slug`)

Como o projeto não tem backend próprio (usa API PHP externa), o blog será gerenciado via **dados estáticos no código** com uma estrutura que facilite futuras migrações para um CMS ou banco de dados.

**Arquivos a criar:**
- `src/data/blogPosts.ts` — Array de posts com campos: `id`, `slug`, `title`, `excerpt`, `content` (markdown/HTML), `image` (opcional), `date`, `tags`
- `src/pages/Blog.tsx` — Listagem de posts com cards, busca por título, filtro por tag
- `src/pages/BlogPost.tsx` — Página individual do post com conteúdo completo e imagem opcional

**Arquivos a modificar:**
- `src/App.tsx` — Adicionar rotas `/blog` e `/blog/:slug`
- `src/components/MenuSuperior.tsx` — Alterar o link "Blog" (linha 155) de `/docs` para `/blog`

O blog terá layout com `MenuSuperior` + `NewFooter`, cards com imagem de destaque opcional, data formatada e tags coloridas.

---

### 2. Cards "O que você ganha" — Mais Coloridos e Modernos

**Arquivo:** `src/components/sections/WhatYouGetSection.tsx`

Redesign dos cards com:
- Ícones com gradiente colorido de fundo (não apenas o hover atual)
- Bordas com gradiente visível permanente
- Efeito de brilho/glow mais pronunciado
- Cores vibrantes nos ícones (violeta, azul, verde, laranja) já ativas sem hover
- Animação de hover mais expressiva com scale e shadow colorido

---

### 3. Páginas de Política de Privacidade e Cookies — Modernização

**Arquivos:** `src/pages/PrivacyPolicy.tsx` e `src/pages/CookiePolicy.tsx`

Ambas já existem e têm rotas (`/privacy`, `/cookies`). Vou modernizá-las para:
- Usar `PageLayout` com `MenuSuperior` + `NewFooter` (consistente com o resto do site)
- Usar variáveis de tema (`bg-background`, `text-foreground`) em vez de cores hardcoded
- Design mais limpo com tipografia melhorada e espaçamento

---

### 4. Seção de Benefícios Após o Hero — Redesign Completo

**Arquivo:** `src/components/sections/HomeCarouselSection.tsx` (linhas 250-274, barra de benefícios)

A barra atual com "Rápido / Seguro / Completo" será substituída por uma seção mais impactante:
- Cards com ícones grandes e coloridos, cada um com cor distinta
- Números/estatísticas destacados (ex: "+10.000 consultas", "99.9% uptime", "LGPD compliant")
- Layout mais visual com gradientes sutis e bordas arredondadas
- Animação de entrada com framer-motion

---

### Resumo Técnico

| Tarefa | Arquivos Novos | Arquivos Modificados |
|--------|---------------|---------------------|
| Blog | 3 (data, Blog, BlogPost) | 2 (App.tsx, MenuSuperior) |
| Cards coloridos | 0 | 1 (WhatYouGetSection) |
| Políticas | 0 | 2 (PrivacyPolicy, CookiePolicy) |
| Benefícios hero | 0 | 1 (HomeCarouselSection) |

