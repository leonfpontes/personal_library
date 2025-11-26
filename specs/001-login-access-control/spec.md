# Feature Specification: Login e Controle de Acesso da Biblioteca (com Proteção de Conteúdo e Marca d’Água)

**Feature Branch**: `[001-login-access-control]`  
**Created**: 2025-11-25  
**Status**: Draft  
**Input**: User description: "Quero implementar um sistema simples de login para que eu consiga criar usuários e dar acesso a minha biblioteca para eles. Preciso dar acesso por livro e conseguir revogar acesso quando necessário. Preciso garantir que o usuário não consiga copiar o conteúdo da página de nenhuma forma. Sem prints, sem copiar texto, sem salvar conteúdo. Também preciso colocar uma marca d'água em todas as páginas com os dados de nome completo e cpf do usuário que está vendo o conteúdo, evitando que ele tire foto da tela sem ser identificado. Esse sistema tem um pipeline automático que sempre que fazemos commit na main, roda o pipeline na vercel para publicar a página, então preciso garantir que o pipeline não quebre."

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

### User Story 1 - Entrar e ler livro autorizado com marca d’água (Priority: P1)

Usuário autenticado acessa um livro para o qual possui permissão e visualiza o conteúdo com marca d’água personalizada (nome completo + CPF) em todas as páginas.

**Why this priority**: Entrega valor imediato (leitura controlada) e valida o núcleo do acesso por usuário e por livro.

**Independent Test**: Criar usuário com acesso a 1 livro → autenticar → abrir o leitor desse livro → confirmar renderização com marca d’água e aplicação de proteções contra cópia/impressão.

**Acceptance Scenarios**:

1. **Given** usuário autenticado com acesso ao Livro A, **When** abre `livros/<livroA>.html`, **Then** conteúdo carrega e marca d’água com nome + CPF aparece sobre o conteúdo em múltiplas posições.
2. **Given** usuário autenticado, **When** tenta selecionar texto, copiar (Ctrl/Cmd+C), salvar (Ctrl/Cmd+S) ou imprimir (Ctrl/Cmd+P), **Then** a ação é bloqueada e uma mensagem de aviso é exibida.
3. **Given** usuário autenticado, **When** aciona menu de contexto (botão direito) ou tecla PrintScreen, **Then** ação é bloqueada ou recebe alerta de política; impressão exibe apenas marca d’água/blank conforme política.

---

### User Story 2 - Administrar usuários e concessões por livro (Priority: P2)

Administrador cria usuários (nome completo, CPF, credenciais) e concede acesso por livro; pode consultar a lista de concessões por usuário/livro.

**Why this priority**: Permite operar o sistema com múltiplos usuários e gerenciar permissões de leitura.

**Independent Test**: Criar dois usuários e conceder acessos distintos a dois livros; cada usuário acessa apenas seus respectivos livros.

**Acceptance Scenarios**:

1. **Given** administrador, **When** cadastra usuário informando nome completo e CPF válidos, **Then** usuário é criado e fica apto a autenticar.
2. **Given** administrador, **When** concede acesso do usuário X ao Livro B, **Then** usuário X consegue abrir `livros/<livroB>.html` após login e não consegue abrir outros livros sem concessão.

---

### User Story 3 - Revogar acesso e impedir leitura (Priority: P3)

Administrador revoga a concessão de acesso de um usuário a um livro; o usuário perde o acesso imediatamente na próxima navegação/atualização.

**Why this priority**: Garante controle contínuo e remoção de acessos indevidos.

**Independent Test**: Conceder acesso → usuário lê → revogar → usuário tenta reler e é bloqueado.

**Acceptance Scenarios**:

1. **Given** acesso concedido ao Livro C, **When** administrador revoga o acesso do usuário, **Then** em novo carregamento da página do Livro C o acesso é negado.
2. **Given** sessão ativa no Livro C, **When** revogação ocorre em paralelo, **Then** na próxima interação crítica (p.ex., troca de capítulo/atualização) o acesso é reavaliado e pode ser bloqueado.

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- Usuário tenta abrir livro sem login: redirecionar para tela de autenticação.
- Usuário autenticado tenta abrir livro sem concessão: exibir mensagem de acesso negado e link para voltar ao catálogo.
- CPF ausente ou inválido no cadastro: bloquear criação de usuário com mensagem de validação.
- Tentativas de impressão via diálogo do navegador: conteúdo oculto para mídia print, exibindo somente marca d’água/placeholder.
- Acesso via URL compartilhada: sem sessão/autorização válida, negar acesso.
- Múltiplas sessões do mesmo usuário em diferentes dispositivos: permitir, mas aplicar marca d’água e regras de proteção em todas.
- Modo offline/cache: impedir exibição de conteúdo sem sessão/autorização válida.

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: Administrador DEVE poder criar usuários com campos obrigatórios: nome completo e CPF; credenciais de login também devem ser definidas.
- **FR-002**: O sistema DEVE autenticar usuários via email + senha (bcrypt, salt rounds=10) gerando JWT (HttpOnly cookie) associado a sessão registrada em SQLite; SSO não faz parte do escopo.
- **FR-003**: O sistema DEVE manter controle de acesso por livro (concessões por usuário e por obra) e verificar autorização a cada carregamento do leitor do livro.
- **FR-004**: Ao exibir um livro autorizado, o sistema DEVE aplicar marca d’água visível contendo nome completo e CPF do usuário em todas as páginas, com repetição e posicionamentos que dificultem ocultação, sem prejudicar a leitura.
- **FR-005**: O sistema DEVE bloquear seleção de texto, cópia para área de transferência (atalhos e menu), clique direito, arrastar/soltar texto e salvar página (Ctrl/Cmd+S), exibindo aviso de política.
- **FR-006**: O sistema DEVE bloquear impressão (Ctrl/Cmd+P e diálogo do navegador), exibindo página de impressão sem conteúdo do livro (apenas marca d’água/mensagem) e restaurando o conteúdo após o evento.
- **FR-007**: O sistema DEVE tentar detectar PrintScreen e eventos similares quando suportado pelo ambiente e registrar/alertar o usuário (best effort; ver notas de limitação abaixo).
- **FR-008**: O sistema DEVE impedir exibição de conteúdo quando offline ou sem sessão/autorização válida.
- **FR-009**: Administrador DEVE poder conceder e revogar acesso por livro, com efeito no próximo carregamento/ação do usuário.
- **FR-010**: O sistema DEVE registrar eventos mínimos de auditoria (autenticação, acesso permitido/negado, tentativas de cópia/impressão), respeitando a privacidade.
- **FR-011**: O sistema NÃO DEVE quebrar o pipeline de publicação na Vercel; o fluxo de commit na `main` deve continuar publicando normalmente.
- **FR-012**: O sistema DEVE apresentar interface e mensagens em pt-BR.
- **FR-013**: O CPF DEVE ser coletado (regex ^\d{11}$), consentimento explícito via checkbox no cadastro (armazenar `consent_at`), exibição mascarada na marca d'água (ex.: 123***01 - primeiros 3 dígitos + *** + últimos 2 dígitos; armazenamento no banco permanece 11 dígitos sem máscara); retenção: remover com exclusão do usuário ou após 12 meses de inatividade se política LGPD exigir.
- **FR-014**: O sistema DEVE garantir que dados pessoais (CPF, nome) não apareçam em URLs, títulos de página ou em requisições externas (apenas no render do leitor).
- **FR-015**: O sistema DEVE manter legibilidade: marca d’água com opacidade e repetição configuradas para não comprometer a leitura (p.ex., opacidade ≤ 10–15%).

Notas importantes sobre proteção de conteúdo: é tecnicamente impossível impedir capturas fotográficas do monitor e impossível garantir 100% de bloqueio de cópia/impressão em todos os navegadores/ambientes. As medidas aqui definidas são de melhor esforço no cliente e visam dificultar e desincentivar a extração.

### Key Entities *(include if feature involves data)*

- **Usuário**: nome completo, CPF, credenciais de login, status (ativo/inativo).
- **Livro**: identificador do leitor HTML, título, slug.
- **Concessão de Acesso**: usuário, livro, status (concedido/revogado), datas (criação/revogação).
- **Sessão**: identificador de sessão, usuário, expiração/inatividade.
- **Registro de Acesso**: usuário, livro, timestamp, ação (permitido/negado/tentativa de cópia/impressão).

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: Usuário autorizado consegue abrir o livro e ver a marca d’água personalizada em ≤ 3 segundos após login em rede típica.
- **SC-002**: 100% dos carregamentos autorizados exibem marca d’água com nome + CPF e 0% a exibem ausente ou incorreta.
- **SC-003**: Bloqueio de proteção deve interceptar ≥95% das tentativas de copiar/imprimir/salvar em navegadores Chromium/Firefox/Edge recentes. Lista explícita de ações bloqueadas: seleção de texto (mouse drag), Ctrl/Cmd+C (copiar), Ctrl/Cmd+X (cortar), Ctrl/Cmd+V (colar), Ctrl/Cmd+S (salvar página), Ctrl/Cmd+P (imprimir), menu de contexto (botão direito), arrastar/soltar texto. Eventos logados na tabela audit_log com tipo `copy_attempt`. Fallback: apresentar aviso em navegadores não suportados.
- **SC-004**: Usuário sem concessão tem 0% de acesso ao conteúdo do livro (bloqueio consistente) — verificado por tentativa direta via URL do leitor.
- **SC-005**: Revogação de acesso reflete em ≤ 1 minuto ou no próximo carregamento do leitor (o que ocorrer primeiro), bloqueando o acesso.
- **SC-006**: Publicações via commit na `main` continuam com taxa de sucesso de 100% no pipeline da Vercel para este projeto.
- **SC-007**: Detecção de PrintScreen (best-effort) gera log `copy_attempt` em até 500ms quando suportado (Windows key events / focus blur heurística). Onde não suportado, política de limitação documentada.
- **SC-008**: Tempo de injeção da marca d'água (do DOMContentLoaded à renderização completa) ≤ 300ms em dispositivos baseline (Intel i5 ou equivalente, 8GB RAM, Chrome 120+ ou Firefox 121+, conexão 10Mbps+).



## Clarifications

### Session 2025-11-25

- Q: Qual banco de dados usar, já que Vercel KV/Postgres não são mais suportados? → A: Usar SQLite (Deno KV, Turso, LiteFS) hospedado em edge/serverless.

### Respostas Integradas

1) Backend permitido: Sim, pode usar Edge Middleware/Functions da Vercel, mas o armazenamento será via SQLite (Deno KV, Turso, LiteFS) hospedado em edge/serverless, não mais Vercel KV/Postgres.
2) Proteção: Aceita proteção best-effort no cliente (bloqueio de seleção/atalhos/print CSS, marca d'água visível). Não há requisito de marcação forense.
3) CPF: Validar formato (11 dígitos). Exibir máscara na marca d'água (primeiros 3 + últimos 2). Armazenar valor claro apenas em backend protegido; não expor em URLs. Reter por até 12 meses de inatividade ou até solicitação de exclusão (direito ao esquecimento). Consentimento explícito via checkbox obrigatório.
4) Sessões: duração padrão 24h (`SESSION_TTL_SECONDS`), revogação imediata via `revoked_at`; multi-sessões permitidas.
5) Pipeline: qualquer mudança no feature não deve exigir build adicional (apenas arquivos estáticos + funções edge) preservando princípio de site estático.

---

**Requisitos impactados:**

- FR-001, FR-003, FR-009, FR-010: O armazenamento de usuários, concessões, sessões e auditoria será feito em SQLite (Deno KV, Turso, LiteFS) hospedado em edge/serverless.
