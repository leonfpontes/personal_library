# Feature Specification: AntDesign UI Facelift

**Feature Branch**: `003-antdesign-facelift`  
**Created**: 2025-11-26  
**Status**: Draft  
**Input**: User description: "Eu quero fazer um facelift na aplicação, implementando a biblioteca AntDesign (https://ant.design/) em todos os componentes do site. Migrar todo o front para que passe a utilizar essa biblioteca. Com isso, quero melhorar a experiência de CRUD de usuário, trazendo uma table componentizada e drawers para inclusão e edição. Melhorar toda a experiência do index.html com os componentes do Ant sem perder o formato atual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin User Management with AntD Components (Priority: P1)

Administradores precisam gerenciar usuários através de uma interface moderna e profissional que substitua os formulários HTML básicos atuais por componentes AntDesign, mantendo todas as funcionalidades existentes (listar, criar, editar, atribuir permissões).

**Why this priority**: O admin dashboard é o componente crítico do sistema de controle de acesso. Melhorar sua usabilidade impacta diretamente a eficiência operacional dos administradores. É a área com maior necessidade de modernização e a mais visível para usuários privilegiados.

**Independent Test**: Acessar `/auth/admin.html` logado como admin, visualizar tabela de usuários com componentes AntD, abrir drawer para criar novo usuário, preencher formulário e salvar, verificar persistência no PostgreSQL e atualização da tabela.

**Acceptance Scenarios**:

1. **Given** admin está logado e acessa `/auth/admin.html`, **When** a página carrega, **Then** deve exibir AntD Table com colunas (Nome, Email, CPF, Admin, Ações) e dados dos usuários carregados via API
2. **Given** tabela de usuários está exibida, **When** admin clica em "Novo Usuário", **Then** deve abrir AntD Drawer lateral com formulário de criação usando componentes AntD (Input, Form, Button)
3. **Given** drawer de criação está aberto, **When** admin preenche todos os campos e clica em "Salvar", **Then** deve enviar POST para `/api/users`, fechar drawer, atualizar tabela com novo usuário
4. **Given** usuário existe na tabela, **When** admin clica em ícone de edição, **Then** deve abrir AntD Drawer pré-populado com dados do usuário selecionado
5. **Given** drawer de edição está aberto com dados carregados, **When** admin modifica campos e salva, **Then** deve enviar PUT para `/api/users/:id`, fechar drawer e atualizar linha na tabela
6. **Given** tabela possui múltiplos usuários, **When** admin utiliza busca ou filtros da AntD Table, **Then** deve filtrar resultados localmente sem chamadas à API
7. **Given** admin clica no botão de permissões de um usuário, **When** modal de grants abre, **Then** deve exibir checkboxes estilizados com AntD para cada livro disponível
8. **Given** modal de permissões está aberto, **When** admin marca/desmarca livros e salva, **Then** deve enviar PUT para `/api/grants/:userId`, fechar modal e atualizar indicador visual na tabela

---

### User Story 2 - Library Catalog Enhanced with AntD (Priority: P2)

Visitantes do catálogo devem ter uma experiência visual aprimorada com componentes AntDesign no `index.html`, mantendo o layout atual de cards mas melhorando a apresentação, filtros e responsividade através de componentes profissionais.

**Why this priority**: O index.html é a porta de entrada da biblioteca. Melhorar sua aparência aumenta profissionalismo e experiência do usuário. Menos crítico que admin pois não impacta operações, mas importante para primeira impressão.

**Independent Test**: Acessar `index.html`, visualizar cards de livros renderizados com AntD Card, utilizar filtros por tags com AntD Tag e Select, verificar responsividade em mobile e desktop.

**Acceptance Scenarios**:

1. **Given** usuário acessa `index.html`, **When** a página carrega, **Then** deve exibir catálogo usando AntD Card para cada livro com layout de grid responsivo
2. **Given** cards de livros estão exibidos, **When** usuário visualiza em desktop, **Then** deve mostrar 3 colunas com espaçamento uniforme usando AntD Grid
3. **Given** cards de livros estão exibidos, **When** usuário visualiza em mobile, **Then** deve empilhar cards em coluna única mantendo proporções adequadas
4. **Given** página possui múltiplos livros com tags diferentes, **When** área de filtros renderiza, **Then** deve exibir AntD Select com opções de tags para filtragem
5. **Given** usuário seleciona uma ou mais tags no filtro, **When** seleção muda, **Then** deve filtrar cards visíveis instantaneamente sem reload
6. **Given** card de livro está visível, **When** usuário passa mouse sobre card, **Then** deve aplicar efeito hover do AntD (elevação, sombra)
7. **Given** card possui tags do livro, **When** tags são renderizadas, **Then** deve usar AntD Tag component com cores temáticas definidas

---

### User Story 3 - Reader Pages Header/Footer with AntD (Priority: P3)

Leitores autenticados que acessam páginas de manuscritos devem ter cabeçalhos e rodapés modernizados com componentes AntDesign, mantendo todas as funcionalidades atuais (controles de fonte, tema, navegação) mas com aparência profissional.

**Why this priority**: Menor prioridade pois a área de conteúdo (Markdown renderizado) permanece inalterada. Impacto visual é menor e funcionalidade atual já é adequada. Foco está em consistência visual com resto do site após P1 e P2.

**Independent Test**: Acessar qualquer livro em `/livros/*.html` autenticado, verificar que header usa AntD Layout.Header, controles de tema/fonte usam AntD Button/Tooltip, e footer usa AntD Layout.Footer mantendo copyright e watermark.

**Acceptance Scenarios**:

1. **Given** usuário autenticado acessa `/livros/vivencia_pombogira.html`, **When** página carrega, **Then** header deve usar AntD Layout.Header com logo, título e controles alinhados
2. **Given** header está renderizado, **When** controles de fonte (+/-) são exibidos, **Then** devem usar AntD Button (icon button) com tooltips explicativos
3. **Given** header está renderizado, **When** botão de troca de tema é exibido, **Then** deve usar AntD Button com ícone de sol/lua e cycling entre light/dark/sepia
4. **Given** usuário rola página para baixo, **When** atinge 600px de scroll, **Then** botão "voltar ao topo" deve aparecer usando AntD FloatButton
5. **Given** footer está renderizado, **When** página carrega, **Then** deve usar AntD Layout.Footer com copyright institucional e watermark integrado
6. **Given** página possui barra de progresso de leitura, **When** usuário rola, **Then** deve usar AntD Progress (linear) no topo refletindo posição no documento

---

### User Story 4 - Login/Logout Pages with AntD Form (Priority: P3)

Usuários que acessam páginas de login devem ter formulários modernizados com validação visual clara usando componentes AntDesign Form, melhorando feedback de erros e estados de loading.

**Why this priority**: Login funciona adequadamente hoje. Modernização melhora aparência mas não resolve problemas críticos. Após admin e catalog estarem modernizados, login deve seguir a mesma linguagem visual.

**Independent Test**: Acessar `/auth/login.html`, preencher formulário usando AntD Form.Item e Input, submeter com loading indicator, receber feedback de erro/sucesso via AntD Message.

**Acceptance Scenarios**:

1. **Given** usuário acessa `/auth/login.html`, **When** página carrega, **Then** deve exibir AntD Form com campos Email e Senha usando Input components
2. **Given** formulário está visível, **When** usuário submete com campos vazios, **Then** deve exibir validações inline do AntD (bordas vermelhas, mensagens de erro)
3. **Given** usuário preenche credenciais corretas, **When** clica em "Entrar", **Then** botão deve mostrar AntD Spin (loading) durante autenticação
4. **Given** autenticação falha, **When** resposta retorna erro, **Then** deve exibir AntD Message.error com mensagem legível
5. **Given** autenticação sucede, **When** resposta retorna JWT, **Then** deve exibir AntD Message.success antes de redirecionar para catálogo
6. **Given** página de logout é acessada, **When** carrega, **Then** deve exibir AntD Result (success) confirmando logout antes de redirecionar

---

### Edge Cases

- **Layout Responsivo**: AntD Grid deve adaptar colunas em breakpoints mobile/tablet/desktop sem quebrar layout atual
- **Tema Escuro**: Componentes AntD devem respeitar os 3 temas existentes (light/dark/sepia) via CSS variables ou ConfigProvider
- **Marca d'Água**: Watermark atual (canvas) deve coexistir com componentes AntD sem sobreposição ou conflito z-index
- **Logo Institucional**: Logo com swap por tema (black/white) deve permanecer funcional no header AntD
- **Persistência de Estado**: localStorage de tema e tamanho de fonte deve continuar funcionando após migração para AntD
- **Formulários Nested**: Drawers de edição com grants (checkboxes) devem usar AntD Form.List para coleções dinâmicas
- **Validação LGPD**: Campos CPF devem manter mask e validação existentes integrados com AntD Form validation
- **Estados de Loading**: Todas as chamadas API (CRUD users, grants) devem exibir spinners AntD apropriados
- **Mensagens de Erro**: Erros de API devem usar AntD Message ou Notification para feedback consistente
- **CDN vs NPM**: Sistema usará AntD via CDN (unpkg/jsDelivr) com UMD standalone build. Se API standalone provar insuficiente, pivotaremos para Shoelace UI (web components, CDN-friendly, sem build). Mantém arquitetura estática constitucional.

## Clarifications

### Session 2025-11-26

- Q: AntDesign Integration Architecture - CDN Standalone vs CDN+React vs Build Tools Amendment? → A: CDN Standalone - Load AntD via CDN (unpkg/jsDelivr) using standalone UMD build without React. If standalone API proves limited, pivot to Shoelace UI (web components, CDN-friendly, no build required).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistema MUST integrar biblioteca AntDesign via CDN (unpkg/jsDelivr) usando UMD standalone build sem React, com Shoelace UI como fallback caso standalone API seja insuficiente
- **FR-002**: Admin dashboard MUST substituir tabela HTML por AntD Table com ordenação, filtro e paginação client-side
- **FR-003**: Admin dashboard MUST usar AntD Drawer para formulários de criar/editar usuário (em vez de modals atuais)
- **FR-004**: Formulários de usuário MUST usar AntD Form, Form.Item, Input, Button com validação inline integrada
- **FR-005**: Modal de permissões (grants) MUST usar AntD Modal e Checkbox.Group para seleção de livros
- **FR-006**: Index.html MUST renderizar cards de livros usando AntD Card component mantendo layout de grid atual
- **FR-007**: Index.html MUST implementar filtros de tags usando AntD Select e Tag components
- **FR-008**: Leitores (livros/*.html) MUST usar AntD Layout (Header/Content/Footer) mantendo estrutura semântica
- **FR-009**: Controles de tema e fonte nos leitores MUST usar AntD Button (icon) com Tooltip para acessibilidade
- **FR-010**: Botão "voltar ao topo" MUST usar AntD FloatButton mantendo comportamento atual (visível após 600px scroll)
- **FR-011**: Barra de progresso de leitura MUST usar AntD Progress component (type="line") no header
- **FR-012**: Login/logout pages MUST usar AntD Form components com validação visual e feedback de estados
- **FR-013**: Feedback de ações (criar/editar/deletar) MUST usar AntD Message para sucesso e erro
- **FR-014**: Sistema MUST preservar funcionalidade de 3 temas (light/dark/sepia) aplicando estilos AntD via CSS variables
- **FR-015**: Sistema MUST manter marca d'água adaptativa funcionando sobre componentes AntD sem conflitos visuais
- **FR-016**: Sistema MUST preservar logo institucional com swap automático de tema no header AntD
- **FR-017**: Sistema MUST manter persistência de preferências (tema, fonte) em localStorage após migração
- **FR-018**: Componentes AntD MUST respeitar identidade visual institucional (cores, tipografia Roboto) via customização de tema
- **FR-019**: Sistema MUST garantir responsividade mobile usando AntD Grid system (Col/Row) em todas as páginas
- **FR-020**: Sistema MUST manter performance atual (sem degradação) após adicionar biblioteca AntD via CDN

### Key Entities

**N/A** - Esta feature não introduz novas entidades de dados. Trabalha com entidades existentes (Users, Grants, Books) mantendo estrutura do banco PostgreSQL inalterada.

## Success Criteria *(mandatory)*

1. **Visual Consistency**: 100% das páginas HTML (admin, index, livros, auth) usam componentes AntDesign com aparência profissional e consistente
2. **Functional Parity**: Todas as funcionalidades atuais (CRUD usuários, grants, autenticação, controles de leitor) permanecem operacionais após migração
3. **Responsive Design**: Layout adapta corretamente em 3 breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px) usando AntD Grid
4. **Theme Persistence**: Troca entre light/dark/sepia funciona perfeitamente com componentes AntD mantendo cores e contraste adequados
5. **Performance Maintained**: Tempo de carregamento de páginas não aumenta mais que 10% após adicionar AntD (medido via Network waterfall)
6. **No Build Requirement**: Integração via CDN (AntD standalone ou Shoelace fallback) mantém arquitetura estática sem introduzir webpack, vite ou similares, preservando Principle I constitucional
7. **User Experience**: Administradores conseguem completar operações de CRUD de usuários 30% mais rápido usando Table + Drawers vs formulários HTML
8. **Accessibility**: Componentes AntD mantêm suporte a navegação por teclado e screen readers em formulários e controles
9. **Brand Compliance**: Customização de tema AntD reflete identidade visual institucional (Terreiro Tia Maria) com cores e logo preservados
10. **Zero Regression**: Funcionalidades LGPD (auditoria, watermark) permanecem intactas após migração

## Assumptions *(mandatory)*

1. **CDN Integration**: AntDesign será carregado via CDN público (unpkg ou jsDelivr) sem necessidade de npm/node_modules
2. **No React Required**: Usaremos componentes AntD standalone via UMD build sem framework React. Se limitações forem identificadas, migraremos para Shoelace UI (web components nativos)
3. **CSS Variables**: Customização de tema será feita via CSS variables sobrescrevendo tokens do AntD após carregamento
4. **Backward Compatibility**: APIs existentes (`/api/users`, `/api/grants`, `/api/auth`) não precisam mudanças para suportar novo frontend
5. **Progressive Enhancement**: Migração será incremental (admin primeiro, depois index, depois leitores) permitindo releases parciais
6. **Browser Support**: AntD via CDN funcionará em navegadores modernos (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
7. **Mobile First**: AntD Grid system suporta adequadamente layouts responsivos sem CSS adicional complexo
8. **Static Hosting**: Vercel continuará servindo arquivos HTML estáticos com AntD carregado client-side sem SSR
9. **No Breaking Changes**: Estrutura de diretórios (`auth/`, `livros/`, `scripts/`, `styles/`) permanece inalterada
10. **Institutional Branding**: Logo PNG existente (black/white variants) será reutilizado no header AntD sem necessidade de re-design

## Scope *(mandatory)*

### In Scope

- Integração da biblioteca AntDesign via CDN em todas as páginas HTML
- Migração completa do admin dashboard (`auth/admin.html`) para componentes AntD (Table, Drawer, Form, Modal)
- Modernização do catálogo (`index.html`) usando AntD Card, Grid, Select, Tag
- Atualização de headers/footers dos leitores (`livros/*.html`) com AntD Layout
- Migração de formulários de login/logout para AntD Form components
- Customização do tema AntD para refletir identidade visual institucional
- Adaptação de 3 temas existentes (light/dark/sepia) para funcionar com AntD
- Garantia de responsividade mobile usando AntD Grid system
- Preservação de marca d'água, logo institucional e controles de acessibilidade
- Documentação de componentes AntD utilizados e padrões de customização

### Out of Scope

- Migração para framework JavaScript (React, Vue, Angular) - permanecemos com HTML/CSS/JS puro
- Introdução de build tools (webpack, vite, rollup) - mantemos arquitetura estática
- Refatoração de backend (APIs, middleware, autenticação) - apenas frontend muda
- Redesign completo do catálogo - mantemos formato atual de cards, apenas modernizamos aparência
- Mudanças na estrutura de dados (PostgreSQL schemas) - entidades permanecem inalteradas
- Migração de conteúdo dos manuscritos (Source/*.md) - Markdown permanece como está
- Alteração de funcionalidade de watermark - apenas garantimos compatibilidade visual com AntD
- Implementação de novos recursos (busca avançada, favoritos, histórico) - apenas modernizamos UI existente
- Mudança de tipografia base (Roboto/Inter/Merriweather) - mantemos fontes atuais integrando com AntD
- Otimização de performance backend - foco exclusivo em frontend
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
