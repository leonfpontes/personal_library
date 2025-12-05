# Research: Project Structure Audit & Reorganization

**Feature**: 001-project-structure | **Date**: 2025-12-05  
**Input**: spec.md, plan.md, tasks.md | **Status**: MVP Phase (US1 Inventory & Risks)

---

## Phase 1: Setup & Foundational (T001–T003)

### T001 / T002: Inventário de Baseline

#### Estrutura Atual: Diretórios de 1º e 2º nível

```
personal_library/
├── .github/              # Workflows, prompts, config (NÃO mexer)
├── .specify/             # Templates, memória, scripts speckit (NÃO mexer)
├── .venv/                # Python venv (gitignore)
├── .vscode/              # Editor config (gitignore)
├── api/                  # Edge Functions (protegidas)
│   ├── auth/
│   ├── grants/
│   ├── health.js
│   ├── helpers/
│   └── users/
├── auth/                 # Auth UI e DB helpers (protegidas)
│   ├── admin.html
│   ├── debug-access.html
│   ├── login.html
│   ├── no-access.html
│   └── db.js
├── livros/               # HTML Readers (PROTEGIDOS, críticos)
│   ├── aula_iansa.html
│   ├── aula_oba.html
│   ├── aula_oya_loguna.html
│   ├── guia_de_ervas.html
│   └── vivencia_pombogira.html
├── migrations/           # SQL migrations
│   ├── add_is_admin_column.sql
│   └── run_migration.js
├── scripts/              # Client-side + admin scripts
│   ├── access-guard.js
│   ├── admin.js
│   ├── check-user.js
│   ├── cleanup.js
│   ├── diagnose-login.js
│   ├── messages.pt-BR.json
│   ├── protection.js (CRÍTICO: watermark, bloqueios)
│   ├── reset-password.js
│   ├── setup-user.js
│   └── watermark.js (CRÍTICO: proteção dinâmica)
├── Source/               # Manuscritos Markdown (conteúdo)
│   ├── Aula_iansa.md
│   ├── Aula_oba.md
│   ├── Aula_oya_loguna.md
│   ├── vivencia_ervas.md
│   ├── vivencia_pombogira.md
│   └── img/
├── specs/                # Feature specs (001-project-structure, etc.)
│   └── 001-project-structure/
├── styles/               # CSS temas (crítico para readers)
│   ├── base.css
│   ├── theme-ervas.css
│   ├── theme-iansa.css
│   ├── theme-oba.css
│   ├── theme-oya_loguna.css
│   └── theme-pombogira.css
├── node_modules/         # (gitignore)
├── .env, .env.local      # (gitignore)
├── package.json          # Deps (crítico)
├── package-lock.json     # (gitignore)
├── middleware.js         # Edge middleware (CRÍTICO: ACL enforcement)
├── vercel.json           # Vercel config (CRÍTICO: rewrites, headers)
│
├── [DOCUMENTAÇÃO A MOVER PARA docs/ops/]:
├── COMO_RODAR.md
├── DEPLOY.md
├── DEPLOYMENT_READY.md
├── MOBILE_PATCH.md
├── PRODUCTION_DEBUG_GUIDE.md
├── RESUMO_EXECUTIVO.md
├── STATUS.md
│
├── [RAIZ - OUTRAS]:
├── README.md
├── favicon.svg
├── seed.js
├── migrate-postgres.js
├── migrations-postgres.sql
├── check-users.js, create-test-user.js, debug-login.js, dev-server.js
└── test-*.ps1 scripts
```

---

## Phase 3: User Story 1 — Inventário e Diagnóstico (T004–T007)

### T004 / T005 / T006: Mapeamento Detalhado

#### Diretórios Críticos (1º nível)

| Diretório | Propósito | Crítico? | Tipo | Exemplos |
|-----------|-----------|---------|------|----------|
| `.github/` | Workflows, prompts, governance | Sim | Configuração | `.github/workflows/`, `.github/prompts/` |
| `.specify/` | Templates speckit, constituição | Sim | Ferramenta | `.specify/memory/constitution.md`, `.specify/templates/` |
| `api/` | Edge Functions (auth, users, grants) | **SIM** | Lógica protegida | `api/auth/`, `api/users/`, `api/grants/` |
| `auth/` | Auth UI, DB helpers, login | **SIM** | Lógica protegida | `auth/login.html`, `auth/db.js` |
| `livros/` | Leitores HTML (protegidos, watermarked) | **SIM** | Conteúdo crítico | `vivencia_pombogira.html`, `guia_de_ervas.html` |
| `migrations/` | SQL, schema, setup | Sim | Infra | `migrations/add_is_admin_column.sql` |
| `scripts/` | Client-side + proteção | **SIM** | Lógica crítica | `protection.js`, `watermark.js`, `access-guard.js` |
| `Source/` | Manuscritos Markdown (conteúdo sensível) | Sim | Conteúdo | `vivencia_pombogira.md`, `vivencia_ervas.md` |
| `specs/` | Feature specs (design docs) | Não | Documentação | `specs/001-project-structure/` |
| `styles/` | CSS temas (para readers) | Sim | Estilo crítico | `theme-pombogira.css`, `theme-ervas.css` |

#### Rotas Protegidas & Middleware

**Arquivo crítico**: `middleware.js`
- Tipo: Edge Middleware (Vercel)
- Função: JWT validation, grant enforcement, ACL check
- Proteção: Qualquer requisição sem sessão válida → redireciona para `/auth/login.html`
- Escopo: `/livros/*`, `/api/*`, `/auth/admin.html`

**Arquivo crítico**: `vercel.json`
- Tipo: Deployment config
- Função: Rewrites, headers, edge config
- Proteção: Define rotas internas, CORS, security headers
- Crítico: Mudanças de caminhos aqui podem quebrar ACL

#### Leitores HTML & Dependências

| Reader | Caminho | CSS Dependências | Script Dependências | Manuscrito |
|--------|---------|------------------|---------------------|-----------|
| Vivência Pombogira | `livros/vivencia_pombogira.html` | `styles/theme-pombogira.css`, `styles/base.css` | `scripts/protection.js`, `scripts/watermark.js` | `Source/vivencia_pombogira.md` |
| Guia de Ervas | `livros/guia_de_ervas.html` | `styles/theme-ervas.css`, `styles/base.css` | `scripts/protection.js`, `scripts/watermark.js` | `Source/vivencia_ervas.md` |
| Aula Iansa | `livros/aula_iansa.html` | `styles/theme-iansa.css`, `styles/base.css` | `scripts/protection.js`, `scripts/watermark.js` | `Source/Aula_iansa.md` |
| Aula Oba | `livros/aula_oba.html` | `styles/theme-oba.css`, `styles/base.css` | `scripts/protection.js`, `scripts/watermark.js` | `Source/Aula_oba.md` |
| Aula Oya Loguna | `livros/aula_oya_loguna.html` | `styles/theme-oya_loguna.css`, `styles/base.css` | `scripts/protection.js`, `scripts/watermark.js` | `Source/Aula_oya_loguna.md` |

**Links em `index.html`**:
- `<a href="livros/vivencia_pombogira.html">Vivência Pombogira</a>`
- `<a href="livros/guia_de_ervas.html">Guia de Ervas</a>`
- `<a href="livros/aula_iansa.html">Aula Iansa</a>`
- etc.

**Proteção Crítica em Leitores**:
- ✅ Watermark com CPF (dinâmico)
- ✅ Bloqueio de cópia/seleção
- ✅ Bloqueio de print
- ✅ Bloqueio de devtools
- ✅ JWT check em middleware
- ✅ Grant by livro em ACL

#### Referências de Caminho (Path Dependencies)

**Em HTML** (`index.html`, `auth/*.html`, `livros/*.html`):
- Links relativos para `/livros/`, `/auth/`, `/api/`
- Links para stylesheets: `../styles/theme-*.css`
- Links para scripts: `../scripts/protection.js`, `../scripts/watermark.js`

**Em JavaScript** (`scripts/`, `api/`):
- `import` ou `require` de módulos locais
- URLs hardcoded para `/api/auth/*`, `/api/grants/`, etc.
- Paths em `fetch()` calls

**Em CSS**:
- Font imports, asset references (raro)

**Em Node/Edge**:
- `vercel.json` rewrites: `/livros/*` → `livros/*.html`
- `middleware.js` path matching: `/livros/`, `/api/`, `/auth/`

---

### T007: Consolidar Riscos & Plano de Validação

#### Matriz de Riscos (Movimentação de Docs)

| Risco ID | Descrição | Severidade | Impacto | Validação Pós-Move |
|----------|-----------|-----------|--------|-------------------|
| **R001** | Quebra de links em `README.md` se docs não forem atualizados | Alta | Docs inacessíveis | Rodar link-check em `docs/ops/` |
| **R002** | `vercel.json` rewrites/headers quebrados se caminhos movidos | **CRÍTICA** | ACL falha, 404 em readers | Testar POST `/api/auth/login`, GET `/livros/vivencia_pombogira.html` |
| **R003** | `middleware.js` path matching quebrado se estrutura mudar | **CRÍTICA** | Sessões expiram, 403 para todos | Smoke: login → access leitores |
| **R004** | Case-sensitivity em Vercel (prod) vs Windows (dev) | Alta | 404 em prod após move | Validação: verificar href/src contra nomes reais (case-sensitive) |
| **R005** | Leitores perdem CSS/JS se paths relativos mudarem | **CRÍTICA** | Watermark/proteção falha, conteúdo quebrado | Carregar cada leitor, validar visualmente + protections |
| **R006** | Documentação fora-de-sync com código (COMO_RODAR, DEPLOY) | Média | Instruções incorretas | Review docs, comparar com source code |

#### Plano de Validação (Happy Path)

**Checkpoint 1: Após T009 (git mv docs)**
- ✅ Diretório `docs/ops/` existe
- ✅ 7 arquivos movidos (COMO_RODAR.md, DEPLOY.md, etc.)
- ✅ Git history preservado (`git log --follow docs/ops/DEPLOY.md`)

**Checkpoint 2: Após T010 (atualizar refs em README)**
- ✅ README.md contém links para `docs/ops/` (não para raiz)
- ✅ Rodar `npx linkinator ./README.md --skip http(s)` → sem 4xx/5xx

**Checkpoint 3: Após T011 (ajustar links em index.html + leitores)**
- ✅ `index.html` links para `livros/*.html` funcionam
- ✅ Cada leitor carrega (curl `-H "Cookie: jwt=..."` test)
- ✅ CSS renderiza (inspecionar console, sem 404 em styles)
- ✅ Watermark visível, bloqueios ativos (F12 → network, verificar scripts carregados)

**Checkpoint 4: Após T012 (smoke manual)**
1. **Login**: POST `/api/auth/login` (curl com credenciais de teste)
   - ✅ Retorna 200, define cookie JWT
2. **Admin**: GET `/auth/admin.html` (curl com JWT cookie)
   - ✅ Retorna 200, não 403
3. **Grants**: GET `/api/grants/` (curl com JWT)
   - ✅ Retorna lista de livros autorizado
4. **Leitor 1: Pombogira**: GET `/livros/vivencia_pombogira.html` (curl com JWT)
   - ✅ Retorna 200, HTML valido, CSS + scripts carregam
   - ✅ Watermark renderizado (verificar inspect → document.body.innerHTML)
   - ✅ Proteção ativa (try F12 → DevTools bloqueado, print desativado)
5. **Leitor 2: Ervas**: GET `/livros/guia_de_ervas.html` (mesmo teste)
   - ✅ Idem
6. **Leitor 3: Iansa**, **Leitor 4: Oba**, **Leitor 5: Oya Loguna**
   - ✅ Idem

**Checkpoint 5: Link Integrity (SC-002)**
- ✅ Rodar `npx linkinator ./index.html ./livros ./docs/ops --skip http(s)` → 0 erros 4xx/5xx

#### Plano de Rollback (se algo falhar)

**Se T009 falhar (git mv)**:
```powershell
# Reverte todos os moves
git reset --hard HEAD
# ou, se já foi commitado:
git revert --no-edit <commit-hash>
```

**Se T010 falha (refs em README)**:
```powershell
# Reverte README apenas
git checkout HEAD -- README.md
# Editar manualmente com cuidado
```

**Se T011 falha (links em leitores)**:
```powershell
# Reverte index.html e livros/
git checkout HEAD -- index.html livros/
# Verificar com git diff antes de reapplicar
```

**Se T012 falha (smoke)**:
```powershell
# Rollback completo até antes de T009
git reset --hard <commit-before-T009>
# Revisar middleware.js e vercel.json para incompatibilidades
# Ajustar plan → novo plan antes de retentar T009
```

**Checkpoints Explícitos (após cada operação)**:

| Checkpoint | Comando | Esperado | Falha → Ação |
|---|---|---|---|
| **T009-CHECK** | `ls -la docs/ops/` | 7 arquivos .md | `git reset --hard` |
| **T010-CHECK** | `grep -c "docs/ops/" README.md` | ≥7 (um por arquivo) | `git checkout HEAD -- README.md` |
| **T011-CHECK** | `grep -c "livros/" index.html` | ≥5 (um por leitor) | `git checkout HEAD -- index.html livros/` |
| **T012-CHECK-LOGIN** | `curl -X POST http://localhost:3000/api/auth/login -d "..."`  | 200 OK, JWT cookie | Revisar `middleware.js` |
| **T012-CHECK-LEITOR** | `curl -H "Cookie: jwt=..." http://localhost:3000/livros/vivencia_pombogira.html` | 200 OK, HTML + CSS/JS carregam | Verificar caminhos relativos |
| **LINK-CHECK** | `npx linkinator ./index.html ./livros ./docs/ops --skip http(s)` | 0 erros 4xx/5xx | Revisar href/src |

---

#### Procedimento de Reversão (Step-by-Step)

**Se precisar reverter COMPLETAMENTE**:

1. **Identifique o commit antes de T009**:
   ```powershell
   git log --oneline | head -5
   # Copie o hash do commit anterior
   ```

2. **Reset hard**:
   ```powershell
   git reset --hard <hash-antes-de-T009>
   ```

3. **Verificar estado**:
   ```powershell
   ls -la | grep "COMO_RODAR.md"  # Deve existir na raiz
   ls -la docs/ops/ 2>/dev/null    # Deve falhar (diretório não existe)
   ```

4. **Após fix, reapplicar T009 com cuidado**:
   ```powershell
   mkdir -p docs/ops
   git mv COMO_RODAR.md docs/ops/
   # ... (repetir para cada arquivo)
   ```

---

## Notas e Decisões

- **Escopo aprovado**: Docs (COMO_RODAR, DEPLOY, etc.) → `docs/ops/`. Manter `api/`, `auth/`, `scripts/`, `livros/`, `styles/`, `Source/`.
- **Stack intocado**: Vercel Edge, Neon Postgres, Node 18, HTML/CSS/JS puro.
- **Constitution Check**: PASS — nenhuma mudança quebra princípios I–V.
- **Parallelization**: T004/T005/T006 foram feitos em paralelo; T007 consolida.

---

## Próximos Passos (após aprovação de riscos)

- [ ] **US2**: T008 → T008a → T009 (git mv docs)
- [ ] **US2**: T010 → T011 → T012 (atualizar refs + smoke)
- [ ] **US3**: T013 → T014 → T015 (guardrails + script)
- [ ] **Polish**: T016 → T017 → T018 (review final)
