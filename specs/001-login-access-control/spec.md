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

### Functional Requirements

- **FR-001**: Administrador DEVE poder criar usuários com campos obrigatórios: nome completo e CPF; credenciais de login também devem ser definidas.
- **FR-002**: O sistema DEVE autenticar usuários via email + senha e manter uma sessão segura, não acessível por scripts, com expiração configurável; SSO está fora do escopo desta versão.
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
- **FR-013**: O CPF DEVE ser coletado (regex ^\d{11}$), consentimento explícito via checkbox no cadastro (armazenar `consent_at`), exibição mascarada na marca d'água (ex.: 123\*\*\*01 — primeiros 3 dígitos + *** + últimos 2 dígitos; armazenamento no banco permanece 11 dígitos sem máscara); retenção: remover com exclusão do usuário ou após 12 meses de inatividade se política LGPD exigir.
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

### Measurable Outcomes

- **SC-001**: Usuário autorizado consegue abrir o livro e ver a marca d’água personalizada em ≤ 3 segundos após login em rede típica.
- **SC-002**: 100% dos carregamentos autorizados exibem marca d’água com nome + CPF e 0% a exibem ausente ou incorreta.
- **SC-003**: Bloqueio de proteção deve interceptar ≥95% das tentativas de copiar/imprimir/salvar em navegadores Chromium/Firefox/Edge recentes (com fallback de aviso em ambientes não suportados).
- **SC-004**: Usuário sem concessão tem 0% de acesso ao conteúdo do livro (bloqueio consistente) — verificado por tentativa direta via URL do leitor.
- **SC-005**: Revogação de acesso reflete em ≤ 1 minuto ou no próximo carregamento do leitor (o que ocorrer primeiro), bloqueando o acesso.
- **SC-006**: Publicações via commit na `main` continuam com taxa de sucesso de 100% no pipeline da Vercel para este projeto.
- **SC-007**: Detecção de PrintScreen (best-effort) gera log `copy_attempt` em até 500ms quando suportado. Onde não suportado, política de limitação documentada.
- **SC-008**: Tempo de injeção da marca d'água (do DOMContentLoaded à renderização completa) ≤ 300ms em dispositivos baseline.

## Critérios de Aceitação por Requisito

- **FR-001 (Criar usuários)**
  - Dado admin com dados válidos (nome, CPF, email, senha), quando submeter o cadastro, então o usuário é criado e aparece na listagem.
  - Dado CPF inválido ou duplicado, quando tentar cadastrar, então recebe erro de validação e nada é criado.
- **FR-002 (Autenticar e sessão segura)**
  - Dado credenciais válidas, quando autenticar, então a sessão é criada e persiste entre páginas até expirar.
  - Dado credenciais inválidas, quando autenticar, então retorna erro e nenhuma sessão é criada.
- **FR-003 (ACL por livro)**
  - Dado usuário sem concessão para Livro X, quando acessar `livros/x.html`, então o acesso é bloqueado.
  - Dado usuário com concessão, quando acessar, então o conteúdo carrega normalmente.
- **FR-004 (Marca d’água)**
  - Dado acesso autorizado, quando renderizar a página, então a marca d’água com nome + CPF mascarado aparece em múltiplas posições sem prejudicar a leitura.
- **FR-005 (Bloqueios de cópia)**
  - Dado usuário autenticado, quando tentar selecionar/copiar/imprimir/salvar, então a ação é bloqueada e evento é registrado.
- **FR-006 (Bloqueio de impressão)**
  - Dado comando de impressão, quando abrir o diálogo, então o conteúdo sensível não é impresso e apenas marca d’água/mensagem aparece.
- **FR-007 (PrintScreen best‑effort)**
  - Dado ambiente suportado, quando capturar tela, então um aviso é exibido e evento é registrado.
- **FR-008 (Offline/sem sessão)**
  - Dado ausência de sessão/autorização, quando abrir leitor, então o conteúdo não é exibido.
- **FR-009 (Conceder/revogar)**
  - Dado admin, quando conceder/revogar acesso, então a mudança reflete no próximo carregamento (ou ≤ 1 minuto).
- **FR-010 (Auditoria)**
  - Dado ações de login/acesso/bloqueio, quando ocorrerem, então ficam registradas com timestamp e ator (quando aplicável).
- **FR-011 (Pipeline intacto)**
  - Dado commit na `main`, quando a publicação ocorrer, então não há falhas adicionais atribuíveis a esta feature.
- **FR-012 (pt‑BR)**
  - Dado qualquer mensagem/label, quando exibida, então está em português do Brasil.
- **FR-013 (CPF, consentimento, retenção)**
  - Dado CPF inválido, quando criar/atualizar usuário, então o sistema rejeita com mensagem.
  - Dado consentimento não marcado, quando cadastrar, então o sistema bloqueia o cadastro (ou sinaliza pendência para coleta posterior, conforme política definida).
  - Dado usuário inativo por > 12 meses, quando executar rotina de retenção, então o CPF é removido/anonimizado conforme LGPD.
- **FR-014 (Privacidade em URLs)**
  - Dado navegação, quando capturar URLs/títulos/requisições, então dados pessoais (nome/CPF) não aparecem.
- **FR-015 (Legibilidade)**
  - Dado página com marca d’água, quando leitor percorre o texto, então a leitura permanece confortável (opacidade dentro do limite).

## Não‑Objetivos e Agnosticismo Tecnológico

- Esta especificação é agnóstica de infraestrutura: não determina banco de dados, modelo de implantação ou bibliotecas criptográficas. Essas decisões ficam no plano técnico.
- O objetivo funcional é garantir autenticação, ACL por livro, proteção best‑effort e marca d’água, independentemente de tecnologia específica.

## Clarifications

### Session 2025-11-25

- Q: Qual banco de dados usar, já que Vercel KV/Postgres não são mais suportados? → A: Usar solução compatível com a plataforma escolhida; decisão técnica fora do escopo da especificação.

### Respostas Integradas

1) Execução/Backend: É permitido uso de recursos de backend/plataforma para autenticação e ACL, mas esta especificação permanece agnóstica de tecnologia.
2) Proteção: Proteção best‑effort no cliente (bloqueio de seleção/atalhos/print CSS e similares) e marca d'água visível. Sem requisito de marcação forense.
3) CPF: Validar formato (11 dígitos). Exibir máscara na marca d'água (primeiros 3 + últimos 2). Não expor CPF em URLs. Reter por até 12 meses de inatividade ou até solicitação de exclusão (direito ao esquecimento). Consentimento explícito obrigatório (fluxo a decidir no plano: no cadastro ou no primeiro login).
4) Sessões: Duração padrão sugerida 24h, com possibilidade de revogação imediata; múltiplas sessões permitidas.
5) Pipeline: A feature não deve exigir builds adicionais; publicação contínua deve permanecer funcional.

---

**Requisitos impactados:**

- FR-001, FR-003, FR-009, FR-010: Sem alteração funcional; detalhes de armazenamento e implantação ficam fora do escopo desta especificação e serão definidos no plano técnico.
