<!--
Sync Impact Report (v1.2.0 → v1.2.1)
- Version change: 1.2.0 → 1.2.1 (PATCH)
- Modified principles: None
- Added sections: None
- Removed sections: None
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated (added Amendment 1.2.0 requirements to Constitution Check)
	- .specify/templates/spec-template.md: ✅ no changes required (no constitution-specific checks)
	- .specify/templates/tasks-template.md: ✅ no changes required (inherits from plan/spec)
	- .specify/templates/agent-file-template.md: ✅ no changes required
	- .specify/templates/checklist-template.md: ✅ no changes required
- Follow-up TODOs: None
- Rationale: PATCH version bump to document template synchronization. Added UI Standardization, Adaptive Watermark, and Institutional Branding requirements from Amendment 1.2.0 to plan-template.md Constitution Check section, ensuring future features comply with these standards. No semantic changes to constitution itself.
-->


# personal_library Constitution

## Core Principles

### I. Content-First, Static Site

O repositório é uma biblioteca digital pessoal e estático. Não há build, CI/CD
ou pipelines. Entregas são arquivos Markdown em `Source/` e leitores HTML em
`livros/`, com `index.html` como catálogo. Evite adicionar ferramentas,
frameworks ou processos que aumentem a complexidade.

### II. Integridade Editorial (pt-BR)

Todo conteúdo é em português (pt-BR) com diacríticos preservados (UTF-8).
Mantenha voz/autoria originais e a estrutura de capítulos: título H1 do livro,
capítulos com H2 (`## CAPÍTULO N`) e seções H3/H4. Evite formatação pesada;
listas apenas quando necessário. Não introduza alterações doutrinárias sem
instrução explícita.

### III. Mudanças Cirúrgicas e Organização de Arquivos

Faça apenas edições necessárias e focadas. Não reestruture diretórios nem renomeie
arquivos existentes sem motivo. Para novos manuscritos: `Source/nome_do_arquivo.md`
(snake_case). Mantenha nomes consistentes entre Markdown e HTML. Use somente links
relativos.

### IV. Fidelidade ao Leitor HTML

Use `livros/vivencia_pombogira.html` como template canônico ao criar novos
leitores. Preserve 100% das funcionalidades (TOC, busca no TOC, âncoras,
scroll suave, barra de progresso, botão voltar ao topo, persistência de tema e
fonte). Atualize `mdPath`, metadados, título/marca e cores de tema (incluindo
favicon) em todas as variantes (light/dark/sepia).

### V. Consistência no Catálogo

Toda nova obra deve ganhar um card em `index.html` com tags, descrição breve e
link para o leitor correspondente em `livros/`. Garanta responsividade móvel e
coerência visual. Imagens e ativos residem em `Source/assets` ou `Source/img`.

### VI. Consistência de Experiência do Usuário

Garanta uniformidade nos controles interativos entre todos os leitores HTML.
Use classes padronizadas (`icon-btn`, `back-to-top`) e IDs consistentes
(`fontDecrease`, `fontIncrease`, `themeToggle`, `backToTop`). Preserve a
lógica de gerenciamento de tema (cycling light/dark/sepia com localStorage) e
ajuste de fonte (incremento/decremento com localStorage). Marca d'água deve
adaptar cores ao tema (preta em light/sepia, branca em dark). Logo
institucional deve ter variantes por tema com swap automático via CSS e
MutationObserver.

## Project Constraints

- Direitos autorais: respeite a seção "Direitos Autorais" dos manuscritos; não
  distribua conteúdo sem autorização.
- Hospedagem: site estático (ex.: Vercel). Não incluir código de servidor.
- Dependências: use apenas HTML/CSS/JS puros; bibliotecas via CDN (ex.: Marked.js)
  são aceitáveis no leitor. Não introduza toolchains de build.
- Caminhos: sempre relativos (`../Source/...`). Evite caminhos absolutos.
- Encoding: UTF-8 em todos os arquivos; preserve acentuação.

### Amendment 1.1.0 - Serverless Exception (2025-11-26)

**Exceção para Autenticação**: Permitido o uso de recursos serverless da plataforma
de hospedagem (Vercel Edge Middleware e Functions) exclusivamente para autenticação,
controle de acesso por livro e auditoria LGPD, sem introduzir pipelines de build.
O código serverless deve ser mínimo (API routes em `/api/`, middleware em
`middleware.js`) e manter o princípio de site estático para conteúdo público.
Banco de dados: Neon PostgreSQL (serverless, sa-east-1) via `@neondatabase/serverless`.

**Rationale**: Sem backend, autenticação real é impossível. Client-side puro não
atende requisitos de segurança. Vercel Edge/Functions são recursos da plataforma,
não requerem builds, e mantêm pipeline de publicação inalterado. Conteúdo dos
manuscritos permanece estático.

**Implementation**: Feature 001-login-access-control (38 tasks, status: ✅ completo,
produção funcional desde 2025-11-25).

### Amendment 1.2.0 - UI Standardization & Branding (2025-11-26)

**Padronização de Controles**: Todos os leitores HTML devem seguir o padrão
estabelecido em `livros/vivencia_pombogira.html` para controles interativos:

- Classes padronizadas: `icon-btn` para controles de fonte/tema, `back-to-top` para
  botão de retorno ao topo
- IDs consistentes: `fontDecrease`, `fontIncrease`, `themeToggle`, `backToTop`
- Lógica de tema: cycling através de ['light', 'dark', 'sepia'] com persistência
  em localStorage ('theme-index')
- Lógica de fonte: incremento/decremento de `--content-size` (2px por ação) com
  persistência em localStorage ('font-size')
- Back-to-top: toggle de classe 'visible' ao atingir 600px de scroll

**Marca d'Água Adaptativa**: A marca d'água deve reagir automaticamente ao tema da
página via MutationObserver:

- Tema light: rgba(0,0,0,0.08) - texto preto com opacidade reduzida
- Tema dark: rgba(255,255,255,0.12) - texto branco com opacidade aumentada
- Tema sepia: rgba(80,60,40,0.10) - texto marrom compatível com fundo bege
- Layout: 40 células em grid 4 colunas × 260px altura (densidade reduzida vs. 180
  células anteriores)
- Desabilitar grid de fundo (backgroundImage: 'none')

**Identidade Visual Institucional**: Logo do Terreiro Tia Maria e Cabocla Jupira
deve aparecer em todos os headers (leitores e index) com swap automático por tema:

- Versões: `Source/img/Logo_Terreiro_Black.png` e `Logo_Terreiro_White.png`
- CSS: `.logo.black` visível em light/sepia; `.logo.white` visível em dark
- Implementação: regras CSS em `styles/base.css` + MutationObserver no index.html
- Tamanho: height 28px nos leitores, 26px no index
- Copyright: rodapé com "© Copyright Terreiro Tia Maria e Cabocla Jupira"

**Rationale**: Feature 002 revelou inconsistências críticas nos controles dos
leitores (Iansã não funcionava), marca d'água invisível em temas escuros e
ausência de branding institucional. A padronização garante experiência uniforme,
a adaptação cromática resolve problemas de contraste e o branding estabelece
identidade visual profissional.

**Implementation**: Feature 002-admin-watermark-improvements (18 tasks, status:
em produção via PR #5, branch `2-admin-watermark-improvements`).

## Development Workflow

### Fluxo para Novo Livro (obrigatório)

1) Markdown: criar `Source/nome_do_arquivo.md` com H1 do título, H2 capítulos
   (`## CAPÍTULO N`), H3/H4 seções e espaçamento entre parágrafos.

2) Leitor HTML: copiar o template canônico para `livros/nome_do_arquivo.html`;
   ajustar título, descrição, Open Graph e `mdPath`.

3) Tema: definir paleta e aplicá-la nas três variantes (light/dark/sepia) e no
   favicon SVG.

4) Catálogo: adicionar card do livro em `index.html`.

5) Verificação: passar pelo checklist funcional do leitor (TOC, busca, tema,
   fonte, progress bar, âncoras, smooth scroll, drop caps, decoradores de
   capítulo, responsividade, persistência de preferências, cores consistentes,
   controles padronizados com IDs/classes corretos, marca d'água adaptativa ao
   tema, logo institucional com swap automático).

### Mudanças Menores

Correções ortográficas, ajustes de metadados e melhorias pontuais seguem os
princípios acima e não devem alterar estrutura nem remover funcionalidades do
leitor.

## Governance

- Precedência: esta Constituição rege decisões editoriais e técnicas do
  repositório e prevalece sobre práticas ad hoc.
- Conformidade: toda mudança deve respeitar os Princípios, Constraints e o
  “Fluxo para Novo Livro”. Use `.github/copilot-instructions.md` como guia
  operacional detalhado.
- Emendas: proponha via PR com justificativa e impacto. Ao aprovar, atualize a
  versão (semver), registre a data “Last Amended” e sincronize os templates do
  Speckit quando aplicável.
- Versionamento (Constitution):
  - MAJOR: mudanças incompatíveis (remoção/redefinição de princípios/regras)
  - MINOR: novos princípios/seções ou expansão material
  - PATCH: clarificações e ajustes redacionais sem impacto semântico
- Revisão/Compliance: antes de merge, validar o checklist de leitor e links
  relativos, `mdPath`, tema/cores/favicon, card no catálogo, controles
  padronizados (IDs e classes), marca d'água adaptativa e logo institucional.

**Version**: 1.2.1 | **Ratified**: 2025-11-25 | **Last Amended**: 2025-11-26
