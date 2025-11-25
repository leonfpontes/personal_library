# Implementation Plan: Login e Controle de Acesso da Biblioteca

**Branch**: `001-login-access-control` | **Date**: 2025-11-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-login-access-control/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Implementar sistema de autenticação, controle de acesso por livro (concessão/revogação) e proteção de conteúdo com marca d'água personalizada (nome + CPF). Requer autenticação de usuários, gerenciamento de permissões por obra, aplicação de proteções client-side (bloqueio de seleção/cópia/impressão), e renderização de marca d'água visível em todas as páginas. O sistema deve manter compatibilidade com o pipeline de publicação estática da Vercel e seguir a constituição do repositório (sem builds, HTML/CSS/JS puro). Abordagem técnica e escolha de infraestrutura (serverless vs. client-side) serão definidas na Phase 0 após resolução das clarificações.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES6+) — estático, sem transpilação  
**Primary Dependencies**: Vercel Edge Middleware/Functions, @libsql/client (Turso, SQLite edge/serverless), jsonwebtoken, bcryptjs, uuid  
**Storage**: SQLite edge/serverless (Turso, Deno KV, LiteFS) — usuários, concessões, sessões e auditoria em tabelas relacionais  
**Testing**: Manual (navegadores Chrome/Firefox/Safari) — sem framework de testes automatizados  
**Target Platform**: Web estático (Vercel), navegadores modernos (últimas 2 versões de Chrome, Firefox, Safari, Edge)  
**Project Type**: Web estático (frontend-only com possível layer serverless para autenticação)  
**Performance Goals**: Carregamento de leitor ≤ 3s, marca d'água renderizada em < 500ms, sem degradação perceptível da leitura  
**Constraints**: 
- Sem build/CI: entregas são arquivos HTML/CSS/JS diretos
- Pipeline Vercel (commit → publish) não deve quebrar
- Proteção client-side (best-effort): bloqueios podem ser contornados por usuários técnicos
- Marca d'água com opacidade ≤ 15% para não prejudicar leitura
- UTF-8 e pt-BR em todo conteúdo
**Scale/Scope**: 
- Estimativa inicial: < 50 usuários, 5 livros
- Administração: 1 admin (criador do repositório)
- Sessões concorrentes: baixas (< 10 simultâneas)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Evaluation (Pre-Research)

| Gate | Status | Notes |
|------|--------|-------|
| Content-first: No build/CI; deliver static files only (HTML/CSS/JS) | ⚠️ **CONDITIONAL** | Autenticação pode requerer Vercel Edge/Functions (serverless); client-side puro tem limitações. **NEEDS RESOLUTION** |
| Editorial integrity (pt-BR): Preserve diacritics and chapter heading rules | ✅ **PASS** | Interface de admin/login em pt-BR; manuscritos não alterados |
| File placement: Markdown in `Source/`, reader HTML in `livros/`, catalog in `index.html` | ✅ **PASS** | Leitores modificados em `livros/` com proteções; catálogo pode ganhar login gate |
| Naming: New manuscripts use snake_case and match HTML reader filename | ✅ **PASS** | Sem novos manuscritos; apenas modificação de leitores existentes |
| Reader template fidelity | ⚠️ **MODIFIED** | Leitores ganham: marca d'água layer, bloqueios JS, verificação de auth. TOC/busca/tema/fonte preservados |
| mdPath correctness | ✅ **PASS** | `mdPath` não muda; leitores continuam apontando para `../Source/<file>.md` |
| Theme/colors | ✅ **PASS** | Marca d'água usa cor neutra (não altera tema do livro) |
| Catalog card | ✅ **PASS** | Catálogo pode requerer login antes de exibir cards ou links (decisão de UX) |
| Relative paths | ✅ **PASS** | Todos os links/scripts permanecem relativos |
| Rights | ✅ **PASS** | Proteção de conteúdo reforça "Direitos Autorais" |


**Critical Violation Requiring Justification**: 

- **Serverless/backend**: A constituição atual proíbe "código de servidor" e estabelece "site estático". Autenticação real e ACL por livro requerem serverless (Edge Middleware/Functions) e banco SQLite edge/serverless (Turso, Deno KV, LiteFS). **Justificativa**: Sem backend, a solução seria 100% client-side (obfuscação/deterrent), sem autenticação verdadeira. Para atender requisitos de segurança e auditoria (FR-002, FR-003, FR-009, FR-010), é necessário um layer serverless mínimo (Vercel Edge Middleware ou Functions) que valide sessões e permissões e um banco relacional persistente.

**Decision Point**: Este plano propõe uma **emenda temporária ou exceção à constituição** para permitir uso de recursos serverless da Vercel (Edge Middleware/Functions) e banco SQLite edge/serverless (Turso, Deno KV, LiteFS) exclusivamente para autenticação, controle de acesso e auditoria, mantendo o pipeline de publicação inalterado e sem introduzir builds. Alternativa: reduzir escopo para proteção client-side pura (sem login real), mas isso não atenderia os requisitos funcionais.

### Post-Design Re-evaluation

**Phase 1 Complete**: research.md, data-model.md, contracts/, quickstart.md gerados

| Gate | Final Status | Post-Design Notes |
|------|--------------|-------------------|
| Content-first: No build/CI | ✅ **PASS (w/ amendment)** | Vercel Edge/Functions permitidos via emenda constitucional 1.1.0; pipeline mantido inalterado |
| Editorial integrity (pt-BR) | ✅ **PASS** | Interfaces em pt-BR; manuscritos não alterados |
| File placement | ✅ **PASS** | Novos arquivos: `api/`, `auth/`, `scripts/`, `middleware.js`; leitores em `livros/` modificados in-place |
| Naming conventions | ✅ **PASS** | Sem novos manuscritos; nomenclatura de APIs segue REST padrão |
| Reader template fidelity | ✅ **PASS (modified)** | Leitores ganham watermark + protection; TOC/busca/tema/fonte preservados |
| mdPath correctness | ✅ **PASS** | `mdPath` inalterado; leitores continuam apontando para `../Source/<file>.md` |
| Theme/colors | ✅ **PASS** | Marca d'água usa `rgba(0,0,0,0.12)` (neutro, não altera tema) |
| Catalog card | ✅ **PASS** | Catálogo (`index.html`) pode requerer login via middleware (decisão de UX em tasks) |
| Relative paths | ✅ **PASS** | Scripts: `/scripts/`, `/auth/`; API: `/api/` (todos relativos à raiz) |
| Rights | ✅ **PASS** | Proteção reforça direitos autorais; marca d'água identifica usuário |

**Constitution Amendment Required**: Version 1.0.0 → **1.1.0 (MINOR)**

**Proposed Amendment Text** (add to "Project Constraints"):

```text
Exceção para autenticação: Permitido o uso de recursos serverless da plataforma
de hospedagem (Vercel Edge Middleware e Functions) exclusivamente para autenticação,
controle de acesso e auditoria, sem introduzir pipelines de build. O código serverless
deve ser mínimo e manter o princípio de site estático para conteúdo público.
```

**Rationale**: Sem backend, autenticação real é impossível. Client-side puro não atende requisitos de segurança. Vercel Edge/Functions são recursos da plataforma, não requerem builds, e mantêm pipeline de publicação inalterado.

**Approval Status**: ⏳ Pending (deve ser aprovado antes de Phase 2 - tasks)

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Estrutura estática existente (preservada)
index.html                        # Catálogo (pode ganhar login gate)
livros/
├── vivencia_pombogira.html      # Leitor modificado: auth check + watermark + protection
├── guia_de_ervas.html           # Leitor modificado: auth check + watermark + protection
├── aula_iansa.html              # Leitor modificado: auth check + watermark + protection
├── aula_oba.html                # Leitor modificado: auth check + watermark + protection
└── aula_oya_loguna.html         # Leitor modificado: auth check + watermark + protection

Source/                          # Manuscritos (inalterados)
styles/                          # CSS (pode ganhar watermark.css, protection.css)

# Novos arquivos para autenticação e admin
auth/
├── login.html                   # Página de login
├── admin.html                   # Painel de administração (CRUD usuários/concessões)
└── logout.html                  # Logout

scripts/
├── auth.js                      # Funções de autenticação/sessão
├── watermark.js                 # Renderização de marca d'água
├── protection.js                # Bloqueios de cópia/impressão/print
└── admin.js                     # Lógica do painel de admin

# Serverless/Edge (se permitido pela constituição)
api/                             # ou middleware/ (Vercel Functions/Edge)
├── auth.js                      # Endpoint de autenticação
├── users.js                     # CRUD usuários
├── grants.js                    # Concessões/revogações
└── validate.js                  # Validação de sessão/ACL por livro

# Configuração Vercel (se serverless)
vercel.json                      # Rotas de middleware/functions (atualizado)

# Dados (a definir na research)
data/                            # ou external DB
└── users.json                   # (se client-side mock/demo; não recomendado para prod)
```

**Structure Decision**: Estrutura estática base preservada. Leitores HTML em `livros/` ganham scripts inline ou referências a `scripts/`. Nova pasta `auth/` para telas de login/admin. Se serverless for aprovado, pasta `api/` (ou config em `vercel.json`) para endpoints de autenticação/ACL. Manuscritos em `Source/` permanecem intocados. Sem builds: todos os arquivos são entregues diretamente.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Serverless/backend (Vercel Edge/Functions) | Autenticação real, ACL por livro, auditoria de acessos (FR-002, FR-003, FR-009, FR-010) requerem validação server-side | Client-side puro: sem segurança real (dados/tokens expostos no browser); obfuscação facilmente contornável; sem auditoria confiável; não atende requisitos de concessão/revogação |
| Modificação de leitores HTML existentes | Aplicar marca d'água e proteções em todos os livros sem alterar manuscritos | Criar leitores separados: duplicação de código; manutenção fragmentada; quebra a arquitetura unificada dos leitores |
