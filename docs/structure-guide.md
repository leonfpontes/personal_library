# Guia de Estrutura do Projeto: Personal Library

**Versão**: 1.0 | **Data**: 2025-12-05 | **Status**: ✅ Estável

## Visão Geral

A estrutura do projeto Personal Library segue princípios de separação de responsabilidades, proteção de conteúdo e auditoria LGPD. Este guia estabelece as regras para manutenção e evolução da estrutura.

---

## Princípios de Organização

### 1. Separação por Camada

```
personal_library/
├── api/           → Edge Functions (lógica, sem apresentação)
├── auth/          → Autenticação, DB helpers, UI admin
├── livros/        → Conteúdo protegido (readers HTML)
├── scripts/       → Client-side (proteção, admin, utilitários)
├── styles/        → CSS (temas, base)
├── Source/        → Manuscritos Markdown (conteúdo-fonte)
├── specs/         → Documentação técnica (design, planos)
├── migrations/    → Schema e migrações SQL
├── .specify/      → Ferramenta speckit (templates, constituição)
├── .github/       → Workflows, governance
├── docs/ops/      → Documentação operacional (deploy, setup)
└── [raiz]         → Config, entry points (package.json, vercel.json, middleware.js, index.html)
```

### 2. Proteção de Conteúdo

Qualquer arquivo sob `/livros/` ou que sirva via `/api/` deve respeitar:
- ✅ **JWT authentication** (middleware Edge)
- ✅ **Grants ACL** (autorização por livro)
- ✅ **Watermark + proteção** (scripts/watermark.js, scripts/protection.js)
- ✅ **Auditoria LGPD** (logs mascarados, retenção 90d)

### 3. Documentação Rastreável

Toda mudança de:
- **Segurança** (middleware, ACL, auth)
- **Conteúdo protegido** (livros, manuscritos)
- **Estrutura de diretórios**

Deve ter um **spec** em `specs/[###-feature]/` com:
- `spec.md`: requisitos, histórias de usuário
- `plan.md`: planejamento técnico
- `tasks.md`: tarefas de execução
- `research.md`: análise, riscos, validação

---

## Mapa de Diretórios Críticos

### `/api/` — Edge Functions (Protegidas)

| Arquivo/Pasta | Propósito | Modificação | Testes |
|---|---|---|---|
| `api/auth/` | Login, logout, validação JWT | Rare | Happy + forbidden paths |
| `api/users/` | CRUD usuários (admin only) | Rare | ACL enforcement |
| `api/grants/` | Autorização por livro | Rare | Grant validation |
| `api/audit/` | Logs LGPD | Forbidden | Auditoria passiva |
| `api/health.js` | Health check | Never | Smoke test |

**Regra**: Mudanças em qualquer rota API requerem testes de caminho feliz (200) e negado (403/401).

### `/auth/` — Autenticação

| Arquivo | Propósito | Modificação | Restrição |
|---|---|---|---|
| `auth/db.js` | Cliente PostgreSQL + queries | Rare | Qualquer nova query precisa de teste |
| `auth/admin.html` | Dashboard administrativo | Occasional | Manter proteção JWT, validação de admin |
| `auth/login.html` | Formulário de login | Rare | Manter segurança (CSRF, headers) |
| `auth/no-access.html` | Página de acesso negado | Rare | Manter UX clara |

### `/livros/` — Leitores Protegidos (CRÍTICO)

| Arquivo | Dependências | Proteção |
|---|---|---|
| `vivencia_pombogira.html` | `../styles/theme-pombogira.css`, `../scripts/protection.js`, `../scripts/watermark.js`, `../Source/vivencia_pombogira.md` | ✅ Watermark, bloqueio de cópia/print/devtools |
| `guia_de_ervas.html` | `../styles/theme-ervas.css`, `../scripts/protection.js`, `../scripts/watermark.js`, `../Source/vivencia_ervas.md` | ✅ Idem |
| `aula_iansa.html` | `../styles/theme-iansa.css`, `../scripts/protection.js`, `../scripts/watermark.js`, `../Source/Aula_iansa.md` | ✅ Idem |
| `aula_oba.html` | `../styles/theme-oba.css`, `../scripts/protection.js`, `../scripts/watermark.js`, `../Source/Aula_oba.md` | ✅ Idem |
| `aula_oya_loguna.html` | `../styles/theme-oya_loguna.css`, `../scripts/protection.js`, `../scripts/watermark.js`, `../Source/Aula_oya_loguna.md` | ✅ Idem |

**Regra**: Mover qualquer leitor requer:
1. Atualizar referências relativas em `index.html`
2. Validar casing (Vercel = case-sensitive)
3. Smoke test: login + acesso + watermark visível + bloqueios ativos

### `/scripts/` — Client-Side (Proteção)

| Arquivo | Responsabilidade | Modificação |
|---|---|---|
| `scripts/protection.js` | Bloqueio de cópia, print, devtools | Rare, CRITICAL |
| `scripts/watermark.js` | Overlay dinâmico com CPF | Rare, CRITICAL |
| `scripts/access-guard.js` | Guarda de acesso (pre-render check) | Rare, CRITICAL |
| `scripts/admin.js` | Lógica do dashboard | Occasional |
| `scripts/messages.pt-BR.json` | Mensagens localizadas | Frequent |

**Regra**: Qualquer mudança em `protection.js` ou `watermark.js` bloqueia release até validação manual de proteção (F12 devtools, test print, test copy).

### `/styles/` — CSS (Temas)

| Arquivo | Aplicação | Dependência |
|---|---|---|
| `styles/base.css` | Base para todos os leitores | ✅ Referenciado em todos os `.html` |
| `styles/theme-pombogira.css` | Tema cor pombogira | ✅ vivencia_pombogira.html |
| `styles/theme-ervas.css` | Tema cor ervas | ✅ guia_de_ervas.html |
| `styles/theme-iansa.css` | Tema cor iansa | ✅ aula_iansa.html |
| `styles/theme-oba.css` | Tema cor oba | ✅ aula_oba.html |
| `styles/theme-oya_loguna.css` | Tema cor oya | ✅ aula_oya_loguna.html |

**Regra**: Remover ou renomear CSS requer verificação de referências em todos os leitores.

### `/Source/` — Manuscritos (Conteúdo Sensível)

| Arquivo | Leitor Correspondente | Proteção |
|---|---|---|
| `vivencia_pombogira.md` | `livros/vivencia_pombogira.html` | ✅ Protegido via `/livros/` ACL |
| `vivencia_ervas.md` | `livros/guia_de_ervas.html` | ✅ Idem |
| `Aula_iansa.md` | `livros/aula_iansa.html` | ✅ Idem |
| `Aula_oba.md` | `livros/aula_oba.html` | ✅ Idem |
| `Aula_oya_loguna.md` | `livros/aula_oya_loguna.html` | ✅ Idem |
| `img/` | Ativos para readers (logos, imagens) | ✅ Idem |

**Regra**: Nunca mover `Source/` para fora de `/Source/`. Manuscritos são fonte-de-verdade.

### `/specs/` — Documentação Técnica

| Pasta | Conteúdo | Renovação |
|---|---|---|
| `specs/[###-feature]/` | Spec, plan, tasks, research de cada feature | Por feature |
| `specs/001-project-structure/` | Projeto estrutural (este feature) | Concluído |
| `specs/002-admin-watermark-improvements/` | Melhorias admin/watermark | Planejado |
| `specs/003-pdf-reader-ervas/` | PDF reader (futuro) | Proposto |

**Regra**: Novas features começam com `specs/[###-feature]/spec.md`. Não comece code antes de spec.

### `/docs/ops/` — Documentação Operacional

| Arquivo | Público? | Frequência |
|---|---|---|
| `docs/ops/COMO_RODAR.md` | Não | Setup local |
| `docs/ops/DEPLOY.md` | Não | Deploy manual |
| `docs/ops/DEPLOYMENT_READY.md` | Não | Checklist pre-deploy |
| `docs/ops/MOBILE_PATCH.md` | Não | Mobile issues |
| `docs/ops/PRODUCTION_DEBUG_GUIDE.md` | Não | Troubleshooting prod |
| `docs/ops/RESUMO_EXECUTIVO.md` | Não | Status/summary |
| `docs/ops/STATUS.md` | Não | Project status |

**Regra**: Docs ops referenciadas em `README.md`. Atualizar links se mover diretório.

### Raiz — Entry Points & Config

| Arquivo | Propósito | Crítico? | Mudança |
|---|---|---|---|
| `README.md` | Página inicial do projeto | SIM | Atualizar ao mover docs |
| `index.html` | Catálogo de livros | SIM | Atualizar refs de livros |
| `middleware.js` | Edge Middleware ACL | **SIM** | Testes obrigatórios |
| `vercel.json` | Config Vercel (rewrites, headers) | **SIM** | Testes obrigatórios |
| `package.json` | Dependências | SIM | Não mudar sem justificativa |
| `scripts/dev/` | Scripts de desenvolvimento | Não | Atualizar package.json se mover |
| `scripts/test/` | Scripts de validação | Não | Usar para CI/CD |

---

## Regras de Mudança Estrutural

### ✅ Permitido

- Adicionar novo reader em `/livros/` (se protegido + validado)
- Adicionar novo CSS tema em `/styles/` (se referenciado)
- Adicionar scripts utilitário em `/scripts/` (se não quebra proteção)
- Adicionar nova rota API (se testa ACL)
- Adicionar doc operacional em `docs/ops/` (se referenciado)
- Refatorar internals (ex.: quebrar `api/auth/` em subpastas)

### ❌ Proibido (sem spec + teste)

- Mover `/livros/` para outro lugar
- Mover `/api/` para outro lugar
- Remover `middleware.js`
- Remover `protection.js` ou `watermark.js`
- Mudar estrutura de grants ACL sem testes
- Novo `/api/` público sem testes de forbidden path

---

## Checklist de Validação Pós-Mudança

Após qualquer reorganização estrutural:

- [ ] `npm run dev` inicia sem erros
- [ ] Login funciona: `http://localhost:3000/auth/login.html`
- [ ] Admin carrega: `http://localhost:3000/auth/admin.html` (com JWT)
- [ ] Todos 5 leitores carregam (com JWT, sem 404)
- [ ] CSS renderiza (F12 → no 404 em styles/)
- [ ] Watermark visível (F12 → inspect `.watermark-overlay`)
- [ ] Proteção ativa:
  - Devtools bloqueado (F12 → bloqueado)
  - Print desativado (Ctrl+P → "Origem" está desativada)
  - Cópia bloqueada (Ctrl+C sobre texto → nada)
- [ ] Links em `index.html`, `README.md`, docs válidos (sem 404)
- [ ] Smoke test script passa: `powershell specs\001-project-structure\smoke-test.ps1`

---

## Próximas Melhorias Estruturais

1. **PDF Reader** (`specs/003-pdf-reader-ervas/`) — Adicionar suporte a PDFs
2. **API Versioning** — Se houver mudanças breaking, versionar (`/api/v2/`)
3. **Internacionalização** — Suportar outras línguas em `messages/`
4. **Microservices** — Se crescer, considerar funções separadas

---

## Contato & Dúvidas

- **Tech Lead**: [admin@library.local](mailto:admin@library.local)
- **Spec Reference**: `specs/001-project-structure/spec.md`
- **Constitution**: `.specify/memory/constitution.md`
