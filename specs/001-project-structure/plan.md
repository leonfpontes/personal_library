# Implementation Plan: Project Structure Audit & Reorganization

**Branch**: `001-project-structure` | **Date**: 2025-12-05 | **Spec**: `specs/001-project-structure/spec.md`
**Input**: Feature specification from `/specs/001-project-structure/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Auditar a estrutura atual (dirs/arquivos críticos, leitores, rotas protegidas, scripts), mapear riscos e executar reorganização segura de documentação/assets/leitores sem quebrar autenticação, ACL, middleware, watermark ou links. Manter stack estático (HTML/CSS/JS, Vercel Edge, Neon Postgres, Node 18) e rastreabilidade (spec/plan/tasks).

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Node.js 18 (Vercel runtime) + browser JS/HTML/CSS (no build)  
**Primary Dependencies**: Vercel Edge runtime, Neon Postgres driver (pg), bcrypt, JWT; client-side vanilla JS; no bundler  
**Storage**: Neon PostgreSQL (sa-east-1)  
**Testing**: Manual smoke (login/admin/leitores), curl for APIs, link checking; expand as needed  
**Target Platform**: Vercel Edge + static hosting for leitores/documentação  
**Project Type**: Web (Edge functions + static assets)  
**Performance Goals**: Não degradar middleware ou leitores; zero 404/500 introduzidos  
**Constraints**: Proteção de conteúdo (watermark/bloqueios), ACL por grant, URLs limpas, sem build step, LGPD (logs 90d, mascaramento)  
**Scale/Scope**: Reorganização de estrutura de pastas/arquivos, sem mudanças funcionais de produto

## Constitution Check

Must comply with:
- I. Access Control & Edge Enforcement: não mover/remover middleware, rotas protegidas ou grants sem validação de caminho feliz/negado.
- II. Privacy & LGPD Auditability: manter mascaramento/retention 90d; não expor dados pessoais em novos caminhos públicos.
- III. Content Protection & Anti-Exfiltration: leitores devem manter watermark, bloqueio de cópia/print/devtools; não mover para pastas públicas sem proteção.
- IV. Documentation & Traceable Specs: todas mudanças descritas em spec/plan; registrar mapeamento antigo→novo.
- V. Static Stack Discipline & Operational Simplicity: sem build/bundler; manter Vercel Edge + Node 18 + Neon.

Gate status: PASS (reorg planejada sem violar princípios; validação obrigatória após design e antes de mover arquivos).

## Project Structure

### Documentation (this feature)

```text
specs/001-project-structure/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Inventory, risks, validation checkpoints
├── tasks.md             # Phase 2 output (/speckit.tasks command)
│
│ [Out of scope: data-model.md, quickstart.md, contracts/ are template artifacts]
```

### Source Code (repository root)

```text
personal_library/
├── api/                  # Edge functions (auth, users, grants, audit)
├── auth/                 # DB/JWT helpers, admin UI
├── livros/               # Leitores HTML protegidos
├── scripts/              # Client-side proteção (watermark, bloqueios, admin)
├── Source/               # Manuscritos Markdown
├── styles/               # CSS temas
├── specs/                # Specs por feature (inclui 001-project-structure)
├── .specify/             # Templates e memória (constituição, etc.)
├── migrations/, migrations-postgres.sql, migrate-postgres.js
├── middleware.js, vercel.json
├── README.md, DEPLOY*.md, STATUS.md, etc.
```

**Structure Decision**: Manter organização atual (Edge + estático). Escopo do feature: mapear/melhorar organização de docs/assets/leitores sem alterar stack; ajustar caminhos conforme plano aprovado.

---

## T008: Mapeamento Antigo → Novo (Documentação)

### Documentação a Mover para `docs/ops/`

| Arquivo (Raiz) | Novo Caminho | Motivo |
|---|---|---|
| `COMO_RODAR.md` | `docs/ops/COMO_RODAR.md` | Setup/instruções operacionais |
| `DEPLOY.md` | `docs/ops/DEPLOY.md` | Deploy guide |
| `DEPLOYMENT_READY.md` | `docs/ops/DEPLOYMENT_READY.md` | Deployment checklist |
| `MOBILE_PATCH.md` | `docs/ops/MOBILE_PATCH.md` | Mobile-specific issues |
| `PRODUCTION_DEBUG_GUIDE.md` | `docs/ops/PRODUCTION_DEBUG_GUIDE.md` | Debug guide for prod |
| `RESUMO_EXECUTIVO.md` | `docs/ops/RESUMO_EXECUTIVO.md` | Executive summary |
| `STATUS.md` | `docs/ops/STATUS.md` | Project status |

### Documentação que Permanece na Raiz

| Arquivo | Razão |
|---|---|
| `README.md` | Entry point (deve permanecer na raiz, será atualizado com links para `docs/ops/`) |
| `package.json` | Dependências de projeto |
| `vercel.json` | Configuração de deployment (crítico) |
| `.gitignore`, `.env*` | Config |

### Estrutura Final de Docs

```
personal_library/
├── README.md (atualizado com links para docs/ops/)
├── docs/
│   └── ops/
│       ├── COMO_RODAR.md
│       ├── DEPLOY.md
│       ├── DEPLOYMENT_READY.md
│       ├── MOBILE_PATCH.md
│       ├── PRODUCTION_DEBUG_GUIDE.md
│       ├── RESUMO_EXECUTIVO.md
│       └── STATUS.md
│
├── [restante da estrutura inalterado]
```

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | Feature executed in full compliance with Constitution v1.0.0 | Zero changes to middleware, routes, ACL, content protection, or stack |

---

## Feature 001 Completion Summary (2025-12-05)

### Overall Status
✅ **COMPLETE** — All 5 phases executed successfully, zero regressions.

### Execution Recap
1. **Phase 1-3 (Inventory)**: Comprehensive analysis in research.md (12 tables, 6 risks, 5 validation checkpoints)
2. **Phase 4 (Reorganization)**: 7 operational docs moved to docs/ops/ via git mv; README/index.html updated; smoke test 5/5 PASS
3. **Phase 5 (Guardrails)**: 3 operational docs created (guide 300+, checklist 150+, validation script 350 lines)
4. **Phase 6 (Polish)**: tasks.md finalized, diffs reviewed, zero modifications to critical code

### Deliverables
- Constitution v1.0.0 established in `.specify/memory/constitution.md`
- Complete spec/plan/tasks/research in `specs/001-project-structure/`
- 3 new guardrails: `docs/structure-guide.md`, `docs/structure-checklist.md`, `scripts/structure-check.ps1`
- 7 operational docs reorganized to `docs/ops/` with git history preserved

### Final Metrics
- **Commits**: 1 single commit (13 files, 7 renames, 855 insertions)
- **Smoke Tests**: 5/5 checkpoints PASS
- **Link Validation**: 100% (7 README refs + 5 book links valid)
- **Critical Code Safety**: 100% untouched (middleware, auth, API, protection, watermark)
- **Zero Regressions**: All paths tested, all protections verified

### Next Steps
1. Deploy to Vercel using `docs/ops/DEPLOY.md`
2. Monitor production with `docs/ops/PRODUCTION_DEBUG_GUIDE.md`
3. Begin Feature 002 (admin/watermark improvements)
4. Plan Feature 003 (PDF reader for ervas)
