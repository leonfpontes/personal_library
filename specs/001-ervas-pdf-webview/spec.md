# Feature Specification: Webview PDF da Apostila de Ervas (Google Drive)

**Feature Branch**: `001-ervas-pdf-webview`  
**Created**: 2025-12-05  
**Status**: Draft  
**Input**: User description: "Quero que a página da apostila de ervas seja um webview para o arquivo PDF que está no drive do Google nesse link: https://drive.google.com/file/d/1DUDvuMoSVsUfEInYFT__Mb94hvsuq4a9/view?usp=drive_link"

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

### User Story 1 - Ler a apostila de ervas em PDF (Priority: P1)

Usuário autenticado e com grant para o livro acessa `livros/guia_de_ervas.html` e visualiza o PDF hospedado no Google Drive dentro da própria página, mantendo cabeçalho, navegação e proteção anti-cópia/print/devtools com watermark visível (CPF).

**Why this priority**: Entrega o valor principal solicitado: leitura do material via webview mantendo controles de segurança existentes.

**Independent Test**: Acessar a página com sessão válida e grant para "guia_de_ervas" e verificar renderização do PDF embutido, overlay de watermark e bloqueios de cópia/print/devtools funcionando sem abrir link externo.

**Acceptance Scenarios**:

1. **Given** usuário autenticado com grant para `guia_de_ervas`, **When** acessa `livros/guia_de_ervas.html`, **Then** o PDF do link fornecido renderiza em webview/iframe dentro da página e o cabeçalho/tema permanecem visíveis.
2. **Given** usuário autenticado com grant, **When** tenta copiar, imprimir ou abrir devtools na página, **Then** bloqueios permanecem ativos e o overlay de watermark com CPF continua visível sobre a área do viewer.

---

### User Story 2 - Proteção de acesso (Priority: P2)

Usuário sem sessão ou sem grant para o livro não consegue visualizar o PDF e recebe redirecionamento/login ou resposta proibida coerente com o middleware.

**Why this priority**: Mantém o controle de acesso obrigatório e evita exposição do conteúdo por rota protegida.

**Independent Test**: Acessar a página sem cookie de sessão e com cookie válido porém sem grant, verificando redirecionamento a login (sem sessão) ou 403/deny (sem grant) antes de carregar o webview.

**Acceptance Scenarios**:

1. **Given** usuário sem sessão, **When** acessa `livros/guia_de_ervas.html`, **Then** é redirecionado para login pelo middleware e o PDF não é requisitado.
2. **Given** usuário autenticado sem grant para `guia_de_ervas`, **When** acessa `livros/guia_de_ervas.html`, **Then** recebe resposta de acesso negado (redirect/403) e o webview não é carregado.

---

### User Story 3 - Tratamento de falhas de carregamento (Priority: P3)

Quando o PDF do Google Drive não carrega (erro de rede, permissão do link ou bloqueio de terceiros), o usuário recebe mensagem clara de indisponibilidade na própria página, sem oferecer download externo, mantendo proteção ativa.

**Why this priority**: Evita experiência quebrada e previne exfiltração via links alternativos em caso de falha do webview.

**Independent Test**: Simular falha de carregamento (bloquear domínio do Drive ou usar link inválido) e verificar exibição de mensagem amigável e manutenção do bloqueio de cópia/print/devtools, sem botões de download.

**Acceptance Scenarios**:

1. **Given** falha de carregamento do PDF, **When** o webview não consegue exibir o documento, **Then** a página mostra mensagem de erro/indisponibilidade e sugere tentar novamente mais tarde, sem links de download.
2. **Given** falha de carregamento, **When** o usuário tenta interagir, **Then** os bloqueios de cópia/print/devtools permanecem ativos e o watermark continua visível no contêiner.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Link do Google Drive acessível mas exibindo toolbar com opções de download/impressão: a UI do viewer deve ocultar/bloquear ações de download/print ou ser coberta por overlay que impeça clique nessas ações.
- Navegador bloqueando third-party content ou mixed content: exibir mensagem de permissão necessária ao usuário, sem oferecer link externo.
- Acesso mobile com viewport reduzido: webview deve manter responsividade com rolagem vertical e sem barras de rolagem duplas que encubram o overlay.
- Queda de sessão durante a leitura: ao expirar o cookie, próximo evento de interação ou requisição deve forçar redirect/login antes de novo carregamento.

## Requirements *(mandatory)*

**Constitution alignment**: Requer sessão válida e grant para `guia_de_ervas`; manter `scripts/watermark.js` e `scripts/protection.js` ativos sobre o webview; impedir download/print e impedir devtools/cópia; sem novos campos de PII ou retenção além do já previsto (90 dias em audit_log); manter página estática HTML/JS sem bundler.

### Functional Requirements

- **FR-001**: Embutir o PDF da apostila de ervas via webview/iframe em `livros/guia_de_ervas.html`, usando o link fornecido do Google Drive na forma de preview (sem abrir nova aba).
- **FR-002**: Preservar cabeçalho, breadcrumb e controles atuais do reader (tema, fonte, TOC) e posicionar o webview de modo responsivo, ocupando a área de leitura principal.
- **FR-003**: Manter proteção anti-cópia/print/devtools e overlay de watermark com CPF sobre a área do webview; o viewer não deve expor nem permitir acionamento de botões de download ou impressão do Google Drive.
- **FR-004**: Garantir que a rota `livros/guia_de_ervas.html` continue protegida pelo middleware (auth) e pelo grant do livro; sem sessão → redirect login; sem grant → deny/403 antes de carregar o webview.
- **FR-005**: Exibir mensagem amigável dentro da página quando o PDF não carregar (erro de rede/permissão/bloqueio), sem oferecer link de download externo e mantendo proteção ativa.
- **FR-006**: Garantir compatibilidade em desktop e mobile (rolagem fluida; evitar barras duplas) e manter performance aceitável (renderização inicial do viewer em até ~5s em rede estável).

### Key Entities *(include if feature involves data)*

- **Livro "Guia de Ervas"**: Conteúdo do livro exibido via PDF do Google Drive, protegido por grant específico e sujeito às políticas de audit/acesso existentes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% dos acessos autenticados com grant carregam o PDF embutido e o watermark visível em até 5 segundos em rede estável, medido por cronômetro ou Performance API e registrado no teste dedicado.
- **SC-002**: 100% das tentativas sem sessão ou sem grant são bloqueadas (redirect/403) antes de qualquer renderização do PDF.
- **SC-003**: Toolbar/botões de download/print do viewer não são acionáveis em 100% dos testes manuais (bloqueio visual ou overlay) e bloqueios de copy/print/devtools permanecem ativos.
- **SC-004**: Em cenários de falha de carregamento do PDF, mensagem de indisponibilidade é exibida em 100% dos testes sem oferecer link/arquivo para download, mantendo overlay de proteção.
