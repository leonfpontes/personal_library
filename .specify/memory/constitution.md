<!--
Sync Impact Report
- Version change: N/A → 1.0.0
- Modified principles: (initial adoption) — all principles added
- Added sections: Core Principles, Project Constraints, Development Workflow, Governance
- Removed sections: none
- Templates requiring updates:
	- .specify/templates/plan-template.md: ✅ updated (Constitution Check gates + note cleanup)
	- .specify/templates/spec-template.md: ✅ reviewed (no changes required)
	- .specify/templates/tasks-template.md: ✅ reviewed (tests remain optional)
	- .specify/templates/agent-file-template.md: ✅ reviewed (no changes)
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): Confirm original adoption date for this constitution
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

## Project Constraints

- Direitos autorais: respeite a seção “Direitos Autorais” dos manuscritos; não
  distribua conteúdo sem autorização.
- Hospedagem: site estático (ex.: Vercel). Não incluir código de servidor.
- Dependências: use apenas HTML/CSS/JS puros; bibliotecas via CDN (ex.: Marked.js)
  são aceitáveis no leitor. Não introduza toolchains de build.
- Caminhos: sempre relativos (`../Source/...`). Evite caminhos absolutos.
- Encoding: UTF-8 em todos os arquivos; preserve acentuação.

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
   capítulo, responsividade, persistência de preferências, cores consistentes).

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
  relativos, `mdPath`, tema/cores/favicon e card no catálogo.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-11-25
