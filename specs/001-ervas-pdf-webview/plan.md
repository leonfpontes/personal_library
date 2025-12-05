# Implementation Plan: Webview PDF da Apostila de Ervas (Google Drive)

**Branch**: `001-ervas-pdf-webview` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ervas-pdf-webview/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Tornar `livros/guia_de_ervas.html` um webview/iframe do PDF do Google Drive, mantendo cabeçalho/tema/TOC, proteção anti-cópia/print/devtools e watermark. Usar a URL de preview do Drive; aplicar overlay para bloquear toolbar de download/print; exibir fallback de erro se o PDF não carregar. Middleware e grants seguem protegendo a rota.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: JavaScript (Node 18+), HTML/CSS/JS puro  
**Primary Dependencies**: Vercel Edge (middleware/api), scripts internos `watermark.js` e `protection.js`, Google Drive preview embed  
**Storage**: Neon Postgres já existente (não alterado)  
**Testing**: Playwright/manual: embed happy path, allow/deny middleware/grant, bloqueio copy/print/devtools, fallback de erro  
**Target Platform**: Web (Vercel; desktop/mobile browsers)  
**Project Type**: Web app estático com Edge middleware  
**Performance Goals**: PDF renderizar em até ~5s; manter proteção sem degradação perceptível  
**Constraints**: Sem bundler/framework; manter rota estática `livros/guia_de_ervas.html` e regex em `vercel.json`; sem novos campos PII; bloquear download/print  
**Scale/Scope**: Uma página de reader (guia_de_ervas) + scripts existentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Access Control & Edge Enforcement**: Toda rota nova (API, admin, livros) deve ter cobertura do middleware, testes feliz/negado e grants explícitos por livro/usuário.
- **Privacy & LGPD Auditability**: Declare PII coletada (CPF/IP), retenção 90 dias e consentimento; qualquer novo campo pessoal requer justificativa e plano de audit log.
- **Content Protection & Anti-Exfiltration**: Livros novos ou alterados precisam manter watermark (CPF), bloqueios de cópia/print/devtools e impedir download direto (`scripts/watermark.js` + `scripts/protection.js`). Inclua steps de teste.
- **Documentation & Traceable Specs**: Plano, spec e tasks em Português dentro de `specs/[###-feature]/` com links cruzados; registrar riscos e fontes.
- **Static Stack & Operational Constraints**: Manter stack HTML/CSS/JS + Vercel Edge + Neon Postgres + Node 18; não adicionar bundler/framework sem justificativa. Rotas de livros devem seguir regex de `vercel.json`; env vars novas/rotacionadas precisam de anotação.

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
livros/
├── guia_de_ervas.html   # reader a ser convertido em webview PDF
├── vivencia_pombogira.html
└── aula_*.html

scripts/
├── watermark.js         # overlay com CPF
├── protection.js        # bloqueio copy/print/devtools
└── ...

styles/
├── theme-ervas.css      # tema atual do livro
└── base.css

api/, middleware.js      # controle de sessão e grants (Edge)
```

**Structure Decision**: Projeto web estático com páginas em `livros/` e scripts globais em `scripts/`. Alteração limitada a `livros/guia_de_ervas.html` (+ ajuste opcional em styles/scripts para overlay). Sem novas dependências ou diretórios.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
