# Feature Specification: Project Structure Audit & Reorganization

**Feature Branch**: `001-project-structure`  
**Created**: 2025-12-05  
**Status**: Draft  
**Input**: User description: "Quero analisar toda a estrutura de pastas e arquivos do meu projeto e ajustar tudo para melhores práticas, mantendo os arquivos em pastas e bem organizados e sem quebrar nenhuma execução ou funcionalidade."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Inventário e diagnóstico da estrutura (Priority: P1)

Como mantenedor, quero um inventário completo de diretórios, arquivos críticos, rotas protegidas e dependências de caminho, com diagnóstico de riscos, para decidir reordenação sem quebrar execução.

**Why this priority**: Sem mapa e riscos não há reorg segura; bloqueia qualquer mudança estrutural.

**Independent Test**: Gerar relatório de inventário (dirs/arquivos-chave, rotas, dependências de caminho) e revisão de riscos aprovada sem alterar arquivos; entrega valor sozinha.

**Acceptance Scenarios**:

1. **Given** o repositório atual, **When** o inventário é gerado, **Then** ele lista todos os diretórios de primeiro e segundo nível com propósito resumido e exemplos de arquivos críticos.
2. **Given** o inventário, **When** riscos são documentados, **Then** cada risco indica impacto potencial (auth/ACL, conteúdo, deploy) e como validar após mudanças.

---

### User Story 2 - Reorganização segura de conteúdos e referências (Priority: P2)

Como mantenedor, quero aplicar uma reorganização acordada (ex.: alinhar documentação, assets e leitores) com mapeamento antigo→novo e atualização das referências, mantendo autenticação, ACL e conteúdo intactos.

**Why this priority**: Entrega a melhoria pedida (estrutura organizada) sem quebrar funcionalidades protegidas.

**Independent Test**: Executar plano de migração para escopo definido (docs/assets), atualizar referências e validar acesso (login, grants, leitores) sem regressões.

**Acceptance Scenarios**:

1. **Given** o plano de migração aprovado, **When** arquivos/documentação são movidos, **Then** todas as referências internas (links, imports, rotas) apontam para o novo caminho e builds/dev server continuam rodando.
2. **Given** autenticação e grants existentes, **When** acessos aos livros são testados após reorganização, **Then** middleware, watermark e bloqueios de cópia permanecem ativos e nenhum 404 é introduzido.

---

### User Story 3 - Guardrails e guia de manutenção (Priority: P3)

Como equipe, quero um guia curto de organização + checklist/validação rápida (script ou passos) para manter a estrutura padronizada e prevenir regressões futuras.

**Why this priority**: Sustenta o ganho da reorganização, reduz risco de desvio e facilita onboardings.

**Independent Test**: Guia e checklist publicados; rodar checklist em ambiente atual sem ações corretivas pendentes.

**Acceptance Scenarios**:

1. **Given** o guia publicado, **When** um revisor segue o checklist, **Then** ele consegue validar estrutura e caminhos críticos em <15 minutos sem conhecimento prévio.
2. **Given** o script/checklist, **When** executado em CI local/pre-deploy, **Then** ele falha se houver links ou caminhos quebrados e passa quando tudo está íntegro.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Caminhos case-sensitive em produção (Vercel) vs. desenvolvimento em Windows: mover/renomear deve considerar casing para evitar 404; validação obrigatória via script ou CI que verifica href/src contra nomes reais com case-sensitive check (ex.: `livros/Vivencia_Pombogira.html` vs `livros/vivencia_pombogira.html`).
- Referências relativas em HTML/JS/CSS e rotas do middleware: garantir que mudanças não quebrem rewrites/redirects do `vercel.json` e middleware.
- Arquivos protegidos por grants (livros) e assets compartilhados: evitar mover para locais públicos não protegidos.
- Scripts e comandos em docs (ex.: README, DEPLOY): atualizá-los se caminhos mudarem para evitar instruções quebradas.
- Conteúdos grandes (PDFs/imagens) e histórico de git: evitar mover se causar bloat ou duplicação; preferir mover com preservação de git mv.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Inventariar diretórios/arquivos críticos, rotas protegidas, leitores HTML, scripts e referências cruzadas, com propósito e riscos associados.
- **FR-002**: Escopo autorizado desta feature: reorganizar apenas documentação/specs e leitores HTML (com atualização de links/rotas), manter APIs, middleware e auth inalterados; propor layout-alvo alinhado à constituição (sem mudar stack ou proteção) e mapear antigo→novo.
- **FR-003**: Definir plano de migração seguro com passos ordenados, checkpoints de validação e rollback descrito.
- **FR-004**: Executar reorganização dentro do escopo aprovado usando movimentações rastreáveis (git mv) e atualizar referências internas (links, imports, rewrites, instruções de uso) sem introduzir 404/500.
- **FR-005**: Validar regressões pós-movimentação: login/logout, middleware de ACL, grants por livro, carregamento dos 5 leitores principais, watermark e bloqueios de cópia/print/devtools.
- **FR-006**: Entregar guia de estrutura e checklist curto (ou script) para verificações futuras, cobrindo paths críticos, rotas Vercel, middleware e proteção de conteúdo.
- **FR-007**: Registrar decisões e estado final (antes/depois) no spec/plan ou docs relacionados, garantindo rastreabilidade.

### Key Entities *(include if feature involves data)*

- **Artefato do Projeto**: qualquer arquivo/diretório relevante (código, livros HTML, markdown, scripts) com metadados de propósito e sensibilidade (protegido/público).
- **Rotas e Recursos Protegidos**: caminhos servidos via Vercel + middleware (livros, auth, admin, API) que dependem de grants e proteção de conteúdo; relacionam-se com assets e documentos que não podem ficar públicos.

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 0 rotas protegidas ou leitores quebrados (404/500) após reorganização, verificado por smoke manual ou curl para login, admin, grants e 5 livros principais.
- **SC-001**: 0 rotas protegidas ou leitores quebrados (404/500) após reorganização, verificado por smoke manual ou curl para login, admin, grants e 5 livros principais.
- **SC-002**: 0 links quebrados em `index.html`, `livros/*.html` e `docs/ops/*.md` validado com `npx linkinator ./index.html ./livros ./docs/ops --skip http(s)` ou script PowerShell equivalente; falha se houver erros 4xx/5xx.
- **SC-003**: Inventário cobre 100% dos diretórios de primeiro nível e todos os leitores/rotas protegidas, com propósito descrito e risco classificado.

## Clarifications

### Session 2025-12-05
- Q: Escopo da reorganização que devemos executar nesta feature → A: Reorganizar documentação/specs e leitores HTML + atualizar links/rotas (manter APIs/middleware onde estão).
