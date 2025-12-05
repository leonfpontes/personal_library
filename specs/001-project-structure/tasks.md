# Tasks: Project Structure Audit & Reorganization

**Input**: Design documents from `/specs/001-project-structure/`
**Prerequisites**: plan.md (ready), spec.md (ready), constitution in `.specify/memory/constitution.md`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar artefatos para inventário e reorg controlada

- [x] T001 Criar esqueleto de inventário em `specs/001-project-structure/research.md` (se não existir)
- [x] T002 [P] Registrar baseline de árvore atual (lista de arquivos-chave) em `specs/001-project-structure/research.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Garantir observabilidade e checkpoints antes de mover arquivos

- [x] T003 Definir seções de riscos e validação pós-movimento em `specs/001-project-structure/research.md` (inclua rotas protegidas, leitores, middleware)

**Checkpoint**: Fundamentos prontos — iniciar histórias ✅

---

## Phase 3: User Story 1 - Inventário e diagnóstico da estrutura (Priority: P1) 🎯 MVP

**Goal**: Inventário completo + riscos antes de qualquer reorg
**Independent Test**: Inventário e riscos aprovados, sem mover arquivos

### Implementação

- [x] T004 [P] [US1] Mapear diretórios de 1º e 2º nível com propósito e exemplos em `specs/001-project-structure/research.md`
- [x] T005 [P] [US1] Catalogar rotas protegidas, middleware (`middleware.js`, `vercel.json`) e dependências de caminho em `specs/001-project-structure/research.md`
- [x] T006 [P] [US1] Inventariar leitores HTML em `livros/` (links em `index.html`, dependências de `styles/` e `scripts/`) em `specs/001-project-structure/research.md`
- [x] T007 [US1] Consolidar riscos e plano de validação (login, grants, leitores, links) em `specs/001-project-structure/research.md`

**Checkpoint**: Inventário + riscos prontos ✅

---

## Phase 4: User Story 2 - Reorganização segura de conteúdos e referências (Priority: P2)

**Goal**: Reorganizar documentação/specs e leitores (referências) com mapeamento antigo→novo
**Independent Test**: Docs movidos e links atualizados; leitores e rotas intactos

### Implementação

- [x] T008 [US2] Definir mapeamento antigo→novo para docs em `specs/001-project-structure/plan.md` (ex.: mover DEPLOY/STATUS/RESUMO/COMO_RODAR/PRODUCTION_DEBUG_GUIDE/DEPLOYMENT_READY/MOBILE_PATCH para `docs/ops/`)
- [x] T008a [US2] Definir rollback/restore strategy (git checkout / reset de caminhos) e checkpoints de validação por passo de move; registrar em `specs/001-project-structure/research.md` (ex.: "após git mv docs → link-check; após atualizar refs → smoke leitores")
- [x] T009 [US2] Executar `git mv` dos arquivos documentais para `docs/ops/` conforme mapeamento (ex.: `COMO_RODAR.md`, `DEPLOY.md`, `DEPLOYMENT_READY.md`, `MOBILE_PATCH.md`, `PRODUCTION_DEBUG_GUIDE.md`, `RESUMO_EXECUTIVO.md`, `STATUS.md`)
- [x] T010 [US2] Atualizar referências em `README.md` e demais docs para novos caminhos `docs/ops/...`
- [x] T011 [P] [US2] Ajustar links de leitores em `index.html` e nos próprios `livros/*.html` se houver caminhos relativos afetados pela mudança de docs; validar casing (case-sensitive check de href/src contra nomes reais no novo layout)
- [x] T012 [US2] Smoke manual pós-movimento: login, admin, grants, acesso aos 5 leitores, watermark e bloqueios (registrar em `specs/001-project-structure/research.md`)

**Checkpoint**: Reorganização aplicada e validada ✅

---

## Phase 5: User Story 3 - Guardrails e guia de manutenção (Priority: P3)

**Goal**: Estabelecer guia e checklist para manter estrutura futura
**Independent Test**: Guia + checklist executável sem pendências

### Implementação

- [x] T013 [US3] Criar `docs/structure-guide.md` com princípios, layout final e regras para novos arquivos ✅
- [x] T014 [US3] Criar checklist rápido em `docs/structure-checklist.md` (≤15 min) cobrindo docs, specs, leitores, links e rotas ✅
- [x] T015 [P] [US3] Adicionar script simples `scripts/structure-check.ps1` para validar existência de caminhos críticos e executar link check via `npx linkinator ./index.html ./livros ./docs/ops --skip http(s)` ou equivalente; falha se houver erros 4xx/5xx ✅

**Checkpoint**: Guardrails publicados

---

## Phase N: Polish & Cross-Cutting Concerns

- [x] T016 Atualizar `specs/001-project-structure/tasks.md` com conclusão e notas finais (se surgirem deltas) ✅
- [x] T017 Revisar diffs para garantir que middleware/auth/API não foram alterados; ajustar comentários se necessário ✅
- [x] T018 Registrar resumo final e próximos passos em `specs/001-project-structure/plan.md` ✅

---

## Dependencies & Execution Order

- Setup → Foundational → US1 (MVP) → US2 → US3 → Polish
- US1 inventário/riscos é pré-requisito de US2; US2 concluído antes de US3
- T008 → T008a → T009 → T010 → T011 → T012 (rollback definido em T008a, antes de mover arquivos)
- T011 depende de T009; validação de casing ocorre em T011
- US3 pode começar após US2 validar smoke (T012)

## Parallel Opportunities

- T002 pode rodar em paralelo com T001 (mesmo arquivo, coordenar merges se simultâneo)
- Em US1, T004/T005/T006 podem ser feitos em paralelo; consolidar em T007
- Em US2, T011 (ajustes de links em leitores) pode ocorrer em paralelo a T010, após T009
- Em US3, T013/T014 podem ser paralelos; T015 paralelizável após caminhos finais definidos

## Implementation Strategy

- MVP = US1 inventário + riscos (nenhuma mudança estrutural)
- US2 aplica reorg de docs/links; validar smoke antes de seguir
- US3 documenta guardrails; após validação, encerrar com polish
