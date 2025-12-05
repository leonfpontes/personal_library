# Tasks: Webview PDF da Apostila de Ervas (Google Drive)

**Input**: Design documents from `/specs/001-ervas-pdf-webview/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Confirm branch `001-ervas-pdf-webview` checked out e deps instaladas (`npm install`) na raiz

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Verificar middleware e grants ativos para `livros/guia_de_ervas.html` (nenhum código novo) e anotar resultado

---

## Phase 3: User Story 1 - Ler a apostila de ervas em PDF (Priority: P1) 🎯 MVP

**Goal**: Exibir o PDF do Drive embutido em `livros/guia_de_ervas.html` com cabeçalho/tema/TOC e proteção ativa.
**Independent Test**: Acessar com sessão+grant e ver PDF renderizado em até ~5s, watermark visível, bloqueio de copy/print/devtools e toolbar do Drive inoperante.

### Implementation

- [X] T003 [US1] Atualizar `livros/guia_de_ervas.html` para embutir iframe do PDF (URL preview do Drive) ocupando área de leitura principal
- [X] T004 [P] [US1] Adicionar overlay/bloqueio sobre toolbar do viewer no HTML/CSS local, prevenindo cliques em download/print (altura configurável)
- [X] T005 [P] [US1] Garantir que `scripts/watermark.js` e `scripts/protection.js` continuam aplicando overlay e bloqueios sobre o webview (ajustar seletor se necessário)
- [X] T006 [US1] Ajustar layout/responsividade do contêiner do iframe (altura mínima ~80vh, rolagem única; evitar barras duplas) em `livros/guia_de_ervas.html` ou `styles/theme-ervas.css`
- [X] T007 [US1] Implementar fallback de erro/timeout: se iframe não carregar em tempo razoável, mostrar mensagem amigável no contêiner sem oferecer download

### Tests (manual / e2e leve)

- [ ] T008 [US1] Teste manual happy: sessão+grant → PDF renderiza, watermark visível, tentativa de clicar download/print não abre nada (📍 PRÓXIMA AÇÃO)
- [ ] T009 [US1] Teste manual proteção: copy/print/devtools bloqueados como antes; overlay permanece sobre iframe
- [ ] T010 [US1] Teste mobile/responsivo: verificar rolagem única e overlay cobrindo toolbar
- [X] T010b [US1] Medir tempo de renderização inicial do PDF (<5s em rede estável) com cronômetro ou Performance API e registrar resultado

---

## Phase 4: User Story 2 - Proteção de acesso (Priority: P2)

**Goal**: Bloquear acesso sem sessão ou sem grant antes de carregar o PDF.
**Independent Test**: Sem sessão → redirect login; com sessão sem grant → deny/403, PDF não requisitado.

- [ ] T011 [US2] Teste manual sem sessão: acessar `livros/guia_de_ervas.html` → redirect login; validar que PDF não carrega
- [ ] T012 [US2] Teste manual sem grant: com sessão válida e sem grant para `guia_de_ervas` → deny/403 antes do iframe

---

## Phase 5: User Story 3 - Tratamento de falhas (Priority: P3)

**Goal**: Mensagem amigável se o PDF não carregar, mantendo proteção e sem oferecer download.
**Independent Test**: Forçar falha (URL inválida/bloqueio de domínio) → mensagem de erro exibida, overlay/bloqueios mantidos.

- [ ] T013 [US3] Simular falha de carregamento (alterar URL temporariamente ou bloquear domínio) e validar mensagem de erro no contêiner
- [ ] T014 [US3] Confirmar que, mesmo em falha, bloqueios de copy/print/devtools e watermark permanecem ativos

---

## Phase N: Polish & Cross-Cutting

- [X] T015 [P] Revisar `vercel.json`/roteamento se necessário para garantir regex de livros intacta (✅ NO CHANGES NEEDED - middleware já cobre)
- [X] T016 [P] Atualizar documentação (✅ COMPLETE - 4 docs + validation script criados)
- [ ] T017 Rodar checklist final: happy/forbidden, proteção (copy/print/devtools), overlay toolbar, fallback de erro (⏳ APÓS T008-T014)

## Dependencies & Execution Order

- Foundational (T002) deve estar ok antes das histórias.
- US1 entrega MVP (P1). US2 e US3 são independentes mas requerem base pronta.

## Parallel Opportunities

- T003/T004/T006 podem ser paralelos se coordenar o mesmo arquivo; preferir sequência para evitar conflitos.
- T004/T005 podem rodar em paralelo se ajustes separados (HTML vs scripts), mas revisar juntos.
- Testes manuais podem ser executados em sequência curta após implementação.
