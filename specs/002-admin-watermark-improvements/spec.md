# Feature Specification: Melhorias no Admin e Marca d'Água

**Feature Branch**: `002-admin-watermark-improvements`  
**Created**: 2025-11-26  
**Updated**: 2025-11-26 (Scope Expanded)  
**Status**: Draft  
**Input Original**: "Quero implementar melhorias no formulário de cadastro de usuário, trazendo uma validação de CPF e possibilidade de marcar se um usuário é admin ou não. Também quero implementar melhorias na marca d'água que em alguns casos em que o tema da página é escuro, a marca d'água fica apagada. Precisa ter cores antagonistas às aplicadas como tema para se destacar, além de diminuir o efeito de transparência sem afetar a leitura, pois está muito apagado."

**Scope Expansion**: Após testes, identificados problemas: (1) Falta máscara visual no CPF, (2) Impossível editar/excluir usuários cadastrados, (3) Checkbox LGPD sem termo associado. Escopo expandido para incluir CRUD completo de usuários.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar usuário admin via formulário (Priority: P1)

Administrador cadastra novo usuário marcando checkbox "Admin" no formulário, e o sistema valida CPF antes de salvar.

**Why this priority**: Permite delegar permissões administrativas sem acesso ao banco diretamente.

**Independent Test**: Criar usuário com checkbox "Admin" marcado → verificar que `user.status === 'admin'` no banco → testar login e confirmar acesso irrestrito.

**Acceptance Scenarios**:

1. **Given** admin acessa `/auth/admin.html`, **When** preenche formulário com checkbox "Admin" marcado e CPF válido `12345678901`, **Then** usuário é criado como admin e pode acessar dashboard administrativo.
2. **Given** admin tenta cadastrar com CPF inválido `123`, **When** clica em "Criar Usuário", **Then** exibe erro "CPF inválido (deve ter 11 dígitos)" e não salva.
3. **Given** admin cria usuário comum (checkbox desmarcado), **When** usuário faz login, **Then** acessa apenas livros com grants, não acessa `/auth/admin.html`.

---

### User Story 2 - Marca d'água com contraste adaptativo (Priority: P1)

Marca d'água ajusta automaticamente sua cor conforme o tema da página (light/dark/sepia) para manter legibilidade e visibilidade.

**Why this priority**: Marca d'água atual desaparece em temas escuros, comprometendo segurança (identificação de capturas).

**Independent Test**: Abrir livro em tema dark → verificar marca d'água visível com contraste alto → mudar para tema light → marca d'água ajusta cor automaticamente.

**Acceptance Scenarios**:

1. **Given** usuário lê livro em tema light (fundo branco), **When** marca d'água renderiza, **Then** cor é escura (rgba(0,0,0,0.08)) com boa visibilidade.
2. **Given** usuário muda para tema dark (fundo escuro), **When** marca d'água atualiza, **Then** cor é clara (rgba(255,255,255,0.12)) com contraste suficiente.
3. **Given** usuário lê em tema sepia (fundo bege), **When** marca d'água renderiza, **Then** cor é marrom escuro (rgba(80,60,40,0.10)) adequada ao tema.
4. **Given** opacidade aumentada, **When** usuário lê conteúdo, **Then** texto permanece legível sem sobreposição excessiva da marca d'água.

---

### User Story 3 - Máscara de CPF no formulário (Priority: P1)

Campo de CPF formata automaticamente enquanto o usuário digita, melhorando UX e reduzindo erros de digitação.

**Why this priority**: Usuários estão digitando CPF sem formatação visual, causando confusão sobre o formato esperado.

**Independent Test**: Digitar CPF no campo → verificar que pontos e traço aparecem automaticamente (123.456.789-01) → verificar que apenas números são aceitos.

**Acceptance Scenarios**:

1. **Given** admin digita "12345678901" no campo CPF, **When** sai do campo, **Then** valor é formatado para "123.456.789-01" automaticamente.
2. **Given** admin digita letras ou caracteres especiais, **When** pressiona tecla, **Then** caractere é bloqueado (apenas números aceitos).
3. **Given** admin cola CPF formatado "123.456.789-01", **When** valida, **Then** sistema remove formatação e valida 11 dígitos corretamente.

---

### User Story 4 - Editar dados de usuário (Priority: P1)

Administrador pode editar nome, email, CPF, senha e status admin de usuários existentes diretamente no painel.

**Why this priority**: Impossível corrigir erros de cadastro ou alterar permissões sem acesso direto ao banco de dados.

**Independent Test**: Clicar em "Editar" na linha do usuário → alterar nome → salvar → verificar que mudança persiste no banco e aparece na lista.

**Acceptance Scenarios**:

1. **Given** admin clica em "Editar" para usuário comum, **When** marca checkbox "Admin" e salva, **Then** usuário passa a ter `status='admin'` e acesso total.
2. **Given** admin edita email de usuário, **When** salva com email já existente, **Then** exibe erro "Email já cadastrado" e não salva.
3. **Given** admin edita CPF, **When** salva com CPF inválido (10 dígitos), **Then** exibe erro "CPF inválido" e não salva.
4. **Given** admin edita senha, **When** deixa campo vazio, **Then** senha não é alterada (campo opcional na edição).
5. **Given** admin desmarca checkbox "Admin" de usuário admin, **When** salva, **Then** usuário perde privilégios e passa a `status='active'`.

---

### User Story 5 - Excluir usuário (Priority: P2)

Administrador pode remover usuários do sistema com confirmação de segurança.

**Why this priority**: Necessário para remover contas inativas, duplicadas ou criadas por erro.

**Independent Test**: Clicar em "Excluir" na linha do usuário → confirmar dialog → verificar que usuário desaparece da lista e é removido do banco.

**Acceptance Scenarios**:

1. **Given** admin clica em "Excluir" para usuário, **When** confirma dialog "Excluir usuário [nome]? Esta ação não pode ser desfeita.", **Then** usuário é removido do banco e da lista.
2. **Given** admin clica em "Excluir", **When** cancela dialog, **Then** usuário permanece intacto.
3. **Given** usuário tem grants ativos, **When** admin exclui, **Then** grants são removidos automaticamente (CASCADE ou limpeza explícita).
4. **Given** admin tenta excluir a si mesmo, **When** clica em "Excluir", **Then** exibe aviso "Não é possível excluir sua própria conta" e bloqueia ação.

---

### User Story 6 - Remover checkbox LGPD (Priority: P3)

Remover checkbox de consentimento LGPD do formulário até que termo de uso esteja pronto.

**Why this priority**: Checkbox sem termo associado não tem validade legal e confunde o usuário.

**Independent Test**: Acessar `/auth/admin.html` → verificar que checkbox "Confirmo consentimento LGPD" não aparece no formulário.

**Acceptance Scenarios**:

1. **Given** admin acessa formulário de cadastro, **When** visualiza campos, **Then** checkbox LGPD não está presente.
2. **Given** backend recebe request sem campo `consent`, **When** cria usuário, **Then** não gera erro (campo é opcional).

---

### Edge Cases (Updated)

- **CPF formatado**: Máscara adiciona pontos/traço automaticamente; validação remove antes de enviar ao backend
- **CPF repetido**: Sistema valida unique constraint no banco; exibe erro "CPF já cadastrado"
- **Admin editando outro admin**: Permitido (pode remover privilégios de outro admin)
- **Admin excluindo a si mesmo**: Bloqueado com mensagem de erro
- **Edição sem alterações**: Salvar sem mudar nada não gera erro, apenas recarrega lista
- **Grants órfãos**: Ao excluir usuário com grants, remover grants automaticamente (integridade referencial)
- **Email/CPF em uso**: Backend já valida; frontend exibe mensagem clara do erro retornado
- **Senha vazia na edição**: Campo opcional; se vazio, senha atual é mantida
- **Transição admin→active**: Usuário perde acesso imediato ao dashboard e livros (requer grants)
- **Marca d'água em dispositivos com temas forçados (acessibilidade)**: Respeitar preferência do usuário
- **Transição de tema (light→dark)**: Marca d'água deve atualizar instantaneamente sem piscar
- **Múltiplas marcas d'água na mesma página**: Todas devem ajustar cor sincronizadamente

- CPF com formatação (123.456.789-01): remover pontuação antes de validar
- CPF repetido: sistema já valida unique constraint no banco
- Admin criando outro admin: permitido
- Marca d'água em dispositivos com temas forçados (acessibilidade): respeitar preferência do usuário
- Transição de tema (light→dark): marca d'água deve atualizar instantaneamente sem piscar
- Múltiplas marcas d'água na mesma página: todas devem ajustar cor sincronizadamente

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Formulário de cadastro DEVE ter checkbox "Admin" que, quando marcado, cria usuário com `status='admin'` no banco (coluna users.status).
- **FR-002**: Sistema DEVE validar CPF no frontend antes de enviar: exatamente 11 dígitos numéricos; remover pontuação se presente (regex: `/^\d{11}$/` após limpeza).
- **FR-003**: Se CPF inválido, sistema DEVE exibir mensagem de erro "CPF inválido (deve ter 11 dígitos)" abaixo do campo e impedir submit.
- **FR-004**: Usuários admin DEVEM ter acesso irrestrito a todos os livros (bypass de grants), além de acesso ao dashboard `/auth/admin.html`.
- **FR-005**: Script de marca d'água (`scripts/watermark.js`) DEVE detectar tema atual da página via `document.documentElement.dataset.theme` ou classe CSS.
- **FR-006**: Marca d'água DEVE ajustar cor dinamicamente:
  - Tema light: `rgba(0, 0, 0, 0.08)` (preto semi-transparente)
  - Tema dark: `rgba(255, 255, 255, 0.12)` (branco semi-transparente, maior opacidade)
  - Tema sepia: `rgba(80, 60, 40, 0.10)` (marrom escuro)
- **FR-007**: Opacidade aumentada (0.08→0.12 no dark) DEVE manter legibilidade do texto, testado visualmente em dispositivos comuns.
- **FR-008**: Marca d'água DEVE atualizar cor automaticamente quando usuário troca tema (listener em `themeToggle` ou MutationObserver).
- **FR-009**: Backend (`/api/users`) DEVE aceitar campo opcional `isAdmin: boolean` no POST e setar `status='admin'` ou `status='active'` conforme valor.
- **FR-010**: Validação de CPF DEVE ocorrer tanto no frontend (UX imediata) quanto no backend (segurança), mas backend já valida formato via regex existente.
- **FR-011**: Interface DEVE ser em pt-BR; mensagens de erro claras e consistentes com catálogo `scripts/messages.pt-BR.json`.
- **FR-012**: Alterações DEVEM manter compatibilidade com pipeline Vercel (sem build adicional) e não quebrar funcionalidades existentes.
- **FR-013**: Campo CPF DEVE aplicar máscara automática durante digitação: formato `123.456.789-01`; aceitar apenas dígitos numéricos (0-9).
- **FR-014**: Máscara de CPF DEVE ser removida antes de validação/envio ao backend (armazenar apenas 11 dígitos sem formatação).
- **FR-015**: Cada linha da tabela de usuários DEVE ter botões "Editar" e "Excluir" nas ações.
- **FR-016**: Ao clicar em "Editar", formulário DEVE preencher campos com dados atuais do usuário (nome, email, CPF, status admin).
- **FR-017**: Edição de usuário DEVE enviar PATCH `/api/users/{userId}` com campos alterados; validar unicidade de email/CPF.
- **FR-018**: Campo senha na edição é OPCIONAL: se vazio, manter senha atual; se preenchido, hash e atualizar.
- **FR-019**: Ao clicar em "Excluir", exibir dialog de confirmação com nome do usuário: "Excluir usuário [nome]? Esta ação não pode ser desfeita."
- **FR-020**: Exclusão DEVE enviar DELETE `/api/users/{userId}`; remover grants associados automaticamente (ON DELETE CASCADE ou limpeza explícita).
- **FR-021**: Sistema DEVE bloquear exclusão do próprio usuário logado (admin não pode se auto-excluir); exibir mensagem "Não é possível excluir sua própria conta".
- **FR-022**: Checkbox LGPD DEVE ser removido do formulário (`auth/admin.html`); backend DEVE aceitar requests sem campo `consent`.
- **FR-023**: Backend DEVE validar que apenas admins podem editar/excluir usuários (verificar `isAdmin()` em rotas PATCH/DELETE).

---

### Key Entities *(include if feature involves data)*

- **users.status**: VARCHAR, valores possíveis: `'active'` (padrão), `'admin'`, `'inactive'`
  - Admin: acesso total, bypass grants, acesso a dashboard
  - Active: usuário comum, requer grants por livro
  - Inactive: desabilitado

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos cadastros com checkbox "Admin" marcado resultam em `users.status='admin'` no banco.
- **SC-002**: 100% das tentativas de cadastro com CPF inválido (<11 ou >11 dígitos, ou não-numérico) são bloqueadas com mensagem de erro antes de enviar ao backend.
- **SC-003**: Usuários admin conseguem acessar qualquer livro sem grants e acessar `/auth/admin.html` sem bloqueio do middleware.
- **SC-004**: Marca d'água em tema dark tem opacidade ≥0.12 e cor branca (RGB 255,255,255), verificável por inspeção CSS no DevTools.
- **SC-005**: Marca d'água em tema light tem cor preta (RGB 0,0,0) com opacidade 0.08, mantendo visibilidade sem comprometer leitura.
- **SC-006**: Transição de tema (light↔dark↔sepia) atualiza cor da marca d'água em ≤500ms sem necessidade de reload da página.
- **SC-007**: Legibilidade do texto não é comprometida: usuários conseguem ler parágrafos completos sem desconforto visual (teste qualitativo com 3+ pessoas).
- **SC-008**: Pipeline Vercel continua com 100% de sucesso no deploy após merge da feature.
- **SC-009**: 100% das entradas no campo CPF são formatadas visualmente como `123.456.789-01` enquanto usuário digita.
- **SC-010**: Edição de usuário persiste alterações no banco; refresh da página mostra dados atualizados na tabela.
- **SC-011**: Exclusão de usuário remove registro do banco; grants associados são removidos automaticamente.
- **SC-012**: Admin não consegue excluir a própria conta (bloqueio + mensagem de erro).
- **SC-013**: Checkbox LGPD não aparece no formulário de cadastro em `/auth/admin.html`.
- **SC-014**: Edição com email/CPF duplicado exibe erro claro ("Email já cadastrado" ou "CPF já cadastrado").

---

## Clarifications

### Session 2025-11-26

**Q1: Como identificar se um usuário é admin no banco?**
- **A**: Coluna `users.status` já existe (VARCHAR). Usar valores: `'admin'` para admin, `'active'` para usuário comum.

**Q2: Admin pode ter grants individuais ou acesso é sempre total?**
- **A**: Admin tem acesso total, bypass completo de grants. Não precisa de grants na tabela.

**Q3: Marca d'água deve detectar tema automaticamente ou via configuração manual?**
- **A**: Detecção automática via atributo `data-theme` no `<html>` ou classe CSS (já implementado nos leitores).

**Q4: Opacidade aumentada pode afetar leitura em dispositivos móveis?**
- **A**: Testar visualmente. Se comprometer leitura, ajustar para 0.10 no dark (meio termo entre 0.08 e 0.12).

**Q5: Validação de CPF deve incluir dígitos verificadores?**
- **A**: Não. Apenas validar formato (11 dígitos numéricos). Validação completa de dígitos verificadores é opcional (nice-to-have, não bloqueante).

---

## Assumptions

- Leitores HTML já possuem atributo `data-theme` ou classe CSS para identificar tema ativo
- Script `watermark.js` já é carregado em todos os leitores protegidos
- Formulário de admin (`auth/admin.html`) já carrega script `admin.js`
- Backend `/api/users` aceita campos adicionais via JSON body
- Nenhum usuário admin existente será afetado pela mudança (migrations não necessárias, apenas novos cadastros)

---

## Out of Scope

- Validação de dígitos verificadores do CPF (algoritmo complexo, não crítico para segurança)
- Configuração manual de cores da marca d'água via settings
- Marca d'água em páginas públicas (catálogo, login) - apenas leitores protegidos
- Termo de uso LGPD (checkbox removido até termo estar pronto)
- Alteração em massa de usuários (bulk edit/delete)
- Histórico de alterações de usuários (audit log)
- Recuperação de usuários excluídos (soft delete)
- Paginação da lista de usuários (suficiente para volume atual)
