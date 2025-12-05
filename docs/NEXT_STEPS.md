# 🎯 PRÓXIMAS TAREFAS - QA MANUAL & FINALIZAÇÃO

**Data**: 2025-12-05  
**Status**: Implementação Completa ✅ | Aguardando Testes Manuais  
**Branch**: `001-ervas-pdf-webview`  
**Documentação**: `/specs/001-ervas-pdf-webview/TEST_MANUAL_RESULTS.md`

---

## 📋 TAREFAS PENDENTES (T008-T017)

### ⏳ FASE 1: TESTES MVP (T008-T010) - User Story 1
**Prioridade**: 🔴 CRÍTICA (Valida funcionalidade principal)

#### T008: Teste Manual Happy Path ✓ Implementation Ready
**O que testar**: Acessar a página com sessão válida + grant para `guia_de_ervas`

**Checklist**:
- [ ] Navegador: Chrome/Firefox/Safari (desktop)
- [ ] URL: `http://localhost:3000/livros/guia_de_ervas.html`
- [ ] Autenticação: Fazer login com usuário que tem grant
- [ ] Validação:
  - [ ] Página carrega (cabeçalho visível, logo aparece)
  - [ ] PDF renderiza no iframe (documento legível em tela)
  - [ ] Watermark visível (CPF mascarado em tom escuro diagonal)
  - [ ] Toolbar do Drive está coberta/bloqueada (barra cinza no topo)
  - [ ] Load time exibido no console (abrir DevTools > Console)
  - [ ] Message: `[PDF] Drive preview carregado em XXms` (deve ser < 5000ms)
  - [ ] Tentar clicar em botões da toolbar Drive (download, print) → nada acontece

**Expected Result**:
```
✅ PDF renderizado < 5 segundos
✅ Watermark com CPF visível
✅ Toolbar bloqueada (nenhuma ação possível)
✅ Console mostra: [PDF] Drive preview carregado em ~2000ms
```

**Como executar**:
```bash
# 1. Verificar servidor rodando
npm run dev  # Se não estiver rodando

# 2. Abrir navegador
http://localhost:3000/livros/guia_de_ervas.html

# 3. Abrir DevTools (F12) > Console
# Procurar pela mensagem [PDF] Drive preview carregado em...

# 4. Notar o watermark diagonal
# 5. Tentar clicar em download/print na toolbar
```

---

#### T009: Teste Manual Proteção ✓ Implementation Ready
**O que testar**: Bloqueios de copy/print/devtools permanecem ativos

**Checklist**:
- [ ] Com página aberta (T008 completo):
  - [ ] Pressionar `Ctrl+C` → nada é copiado (tentar colar em notepad → vazio)
  - [ ] Pressionar `Ctrl+P` ou menu > Print → nenhuma janela de print abre
  - [ ] Pressionar `F12` ou `Ctrl+Shift+I` → bloqueado ou aviso exibido
  - [ ] Botão direito na página → contexto pode não ter "Copy" ou está disabled
- [ ] Watermark permanece visível durante qualquer tentativa

**Expected Result**:
```
✅ Copy (Ctrl+C) bloqueado
✅ Print (Ctrl+P) bloqueado
✅ DevTools (F12) bloqueado
✅ Watermark visível durante tentativas
```

**Como executar**:
```bash
# 1. Com página de T008 ainda aberta
# 2. Pressionar Ctrl+C na área do PDF
# 3. Abrir Notepad e tentar colar (Ctrl+V)
#    → Resultado esperado: nada cola
# 4. Pressionar Ctrl+P ou menu > Print
#    → Resultado esperado: nenhuma janela abre
# 5. Pressionar F12 para abrir DevTools
#    → Resultado esperado: bloqueado ou redirect
```

---

#### T010: Teste Mobile ✓ Implementation Ready
**O que testar**: Responsividade em viewport móvel (375x667)

**Checklist**:
- [ ] Abrir DevTools (F12) e ativar modo mobile:
  - Chrome: `Ctrl+Shift+M`
  - Firefox: `Ctrl+Shift+K`
  - Safari: Develop > Enter Responsive Design Mode
- [ ] Definir viewport: 375x667 (iPhone SE/11)
- [ ] Validar:
  - [ ] Cabeçalho (topbar) ajustado para mobile
  - [ ] PDF ocupa 100% da largura
  - [ ] Scroll vertical funciona (uma única barra de scroll)
  - [ ] **NÃO há** duplas barras de scroll horizontal/vertical
  - [ ] Toolbar-blocker fixado no topo (não se move ao scrollar)
  - [ ] Layout não quebra (sem overflow horizontal)
  - [ ] Watermark adapta ao viewport
- [ ] Fazer scroll down no PDF:
  - [ ] Toolbar-blocker continua fixado
  - [ ] Scroll apenas vertical
  - [ ] Nenhuma quebra de layout

**Expected Result**:
```
✅ Layout responsivo (sem overflow)
✅ Single scroll vertical (sem duplas barras)
✅ Toolbar-blocker fixado (position: fixed)
✅ Watermark visível e adaptado
✅ Touch scrolling suave (iOS/Android)
```

**Como executar**:
```bash
# 1. Abrir http://localhost:3000/livros/guia_de_ervas.html
# 2. Pressionar F12 (DevTools)
# 3. Pressionar Ctrl+Shift+M (mobile mode)
# 4. Definir tamanho: 375x667
# 5. Fazer scroll vertical
# 6. Observar: uma barra de scroll, toolbar-blocker fixado, sem overflow horizontal
```

---

### ⏳ FASE 2: TESTES ACCESS CONTROL (T011-T012) - User Story 2
**Prioridade**: 🟡 ALTA (Valida segurança)

#### T011: Teste Sem Sessão ✓ Code Ready
**O que testar**: Acesso sem autenticação redireciona para login

**Checklist**:
- [ ] Abrir janela privada/anônima (`Ctrl+Shift+P` Chrome ou equivalente)
- [ ] Acessar: `http://localhost:3000/livros/guia_de_ervas.html`
- [ ] Aguardar resposta do middleware (2-3 segundos)
- [ ] Validar:
  - [ ] URL muda para `/auth/login.html` (redirect)
  - [ ] Página de login exibida
  - [ ] PDF **não** foi requisitado (DevTools > Network: nenhuma requisição a `docs.google.com`)
  - [ ] Mensagem clara: "Faça login para continuar" ou similar

**Expected Result**:
```
✅ Sem sessão → redirect /auth/login.html
✅ PDF não requisitado (Network clean)
✅ Página de login exibida
```

**Como executar**:
```bash
# 1. Abrir janela privada (Ctrl+Shift+P)
# 2. Acessar http://localhost:3000/livros/guia_de_ervas.html
# 3. Observar: redirecionamento para /auth/login.html
# 4. Abrir DevTools > Network
# 5. Verificar: nenhuma requisição a docs.google.com
```

---

#### T012: Teste Sem Grant ✓ Code Ready
**O que testar**: Acesso com sessão mas sem grant nega acesso

**Checklist**:
- [ ] Fazer login com usuário que **não tem** grant para `guia_de_ervas`
  - Dica: Fazer login com usuário que apenas tem `vivencia_pombogira` grant
- [ ] Acessar: `http://localhost:3000/livros/guia_de_ervas.html`
- [ ] Aguardar resposta de validação (2-3 segundos)
- [ ] Validar:
  - [ ] URL muda para `/auth/no-access.html` (redirect)
  - [ ] Página de acesso negado exibida
  - [ ] Mensagem: "Você não tem permissão para acessar este livro"
  - [ ] PDF **não** foi requisitado (DevTools > Network: nenhuma requisição a `docs.google.com`)

**Expected Result**:
```
✅ Sem grant → redirect /auth/no-access.html
✅ PDF não requisitado (Network clean)
✅ Página de acesso negado exibida
```

**Como executar**:
```bash
# 1. Fazer login com usuário sem grant para ervas
# 2. Acessar http://localhost:3000/livros/guia_de_ervas.html
# 3. Observar: redirecionamento para /auth/no-access.html
# 4. Abrir DevTools > Network
# 5. Verificar: nenhuma requisição a docs.google.com
```

---

### ⏳ FASE 3: TESTES FAILURE (T013-T014) - User Story 3
**Prioridade**: 🟢 MÉDIA (Valida fallback)

#### T013: Teste Falha de Carregamento ✓ Code Ready
**O que testar**: Fallback error message exibida após timeout

**Checklist**:
- [ ] Abrir página com sessão + grant (T008)
- [ ] Forçar falha (uma das opções):
  - [ ] **Opção 1**: DevTools > Network > block URL `docs.google.com`
  - [ ] **Opção 2**: DevTools > Console: `document.getElementById('pdfViewer').src = 'https://invalid-url-test.example.com'`
- [ ] Aguardar 8-10 segundos
- [ ] Validar:
  - [ ] Loader desaparece
  - [ ] Mensagem de erro exibida:
    ```
    "Não foi possível carregar o PDF agora.
     Verifique sua conexão ou tente novamente em instantes."
    ```
  - [ ] **NÃO há** botão de download
  - [ ] **NÃO há** link externo
  - [ ] Overlay (watermark) permanece visível sobre mensagem de erro

**Expected Result**:
```
✅ Timeout 8s acionado
✅ Mensagem de erro exibida
✅ Nenhum link de download oferecido
✅ Watermark visível sobre error
```

**Como executar**:
```bash
# Opção 1: Bloquear domínio do Drive
# 1. Abrir http://localhost:3000/livros/guia_de_ervas.html
# 2. DevTools (F12) > Network > filtrar 'docs.google.com'
# 3. Clicar no domínio > Right-click > Block URL
# 4. Recarregar página (F5)
# 5. Aguardar 8s → mensagem de erro

# Opção 2: Modificar URL via console
# 1. Abrir http://localhost:3000/livros/guia_de_ervas.html
# 2. DevTools (F12) > Console
# 3. Executar: document.getElementById('pdfViewer').src = 'https://invalid.example.com'
# 4. Aguardar 8s → mensagem de erro
```

---

#### T014: Teste Proteção Ativa em Erro ✓ Code Ready
**O que testar**: Bloqueios continuam após falha

**Checklist**:
- [ ] Com página mostrando erro (T013 completo):
  - [ ] Pressionar `Ctrl+C` → nada é copiado
  - [ ] Pressionar `Ctrl+P` → nenhuma janela de print abre
  - [ ] Pressionar `F12` → bloqueado
  - [ ] Watermark visível sobre mensagem de erro
  - [ ] Z-index layering correto (watermark não é escondido)

**Expected Result**:
```
✅ Copy bloqueado mesmo em erro
✅ Print bloqueado mesmo em erro
✅ DevTools bloqueado mesmo em erro
✅ Watermark visível acima da error message
```

**Como executar**:
```bash
# 1. Com página de T013 ainda mostrando erro
# 2. Pressionar Ctrl+C, Ctrl+P, F12 como em T009
# 3. Observar: todos bloqueados
# 4. Watermark visível sobre a mensagem
```

---

### ⏳ FASE 4: POLISH & FINAL (T015-T017)
**Prioridade**: 🟢 BAIXA (Hygiene & documentation)

#### T015: Revisar Roteamento ✓ Already Verified
**Status**: ✅ PASS - Nenhuma mudança necessária  
**Verificação**: `vercel.json` regex para `/livros/*` já cobre a rota  
**Ação**: Nenhuma

---

#### T016: Atualizar Documentação ✓ Already Completed
**Status**: ✅ COMPLETED  
**Documentos criados**:
- ✅ `IMPLEMENTATION_COMPLETE.md` (sumário executivo)
- ✅ `TEST_MANUAL_RESULTS.md` (plano de testes)
- ✅ `IMPLEMENTATION_REPORT.md` (relatório final)
- ✅ `scripts/test/validate-guia-ervas.js` (validação automatizada)

**Ação**: None (documentation complete)

---

#### T017: Checklist Final
**Status**: ⏳ PENDING (Após T008-T014)  
**O que fazer**: Preencher tabela de validação final

```markdown
| Aspecto | T008 | T009 | T010 | T011 | T012 | T013 | T014 | Status |
|---------|------|------|------|------|------|------|------|--------|
| Happy Path (PDF renderiza) | [ ] | [ ] | [ ] | — | — | — | — | PENDING |
| Watermark visível | [ ] | [ ] | [ ] | — | — | — | — | PENDING |
| Copy bloqueado | [ ] | [ ] | [ ] | — | — | — | [ ] | PENDING |
| Print bloqueado | [ ] | [ ] | [ ] | — | — | — | [ ] | PENDING |
| DevTools bloqueado | [ ] | [ ] | [ ] | — | — | — | [ ] | PENDING |
| Toolbar bloqueada | [ ] | [ ] | [ ] | — | — | — | — | PENDING |
| Mobile responsivo | — | — | [ ] | — | — | — | — | PENDING |
| Timing < 5s | [ ] | — | — | — | — | — | — | PENDING |
| Access denied (sem sessão) | — | — | — | [ ] | — | — | — | PENDING |
| Access denied (sem grant) | — | — | — | — | [ ] | — | — | PENDING |
| Fallback message | — | — | — | — | — | [ ] | [ ] | PENDING |
| **OVERALL** | | | | | | | | **PENDING** |
```

---

## ⏱️ CRONOGRAMA ESTIMADO

| Fase | Tarefas | Tempo Estimado |
|------|---------|--------|
| Fase 1 (MVP) | T008-T010 | 15 min |
| Fase 2 (Access) | T011-T012 | 5 min |
| Fase 3 (Failure) | T013-T014 | 5 min |
| Fase 4 (Final) | T015-T017 | 5 min |
| **TOTAL** | T008-T017 | **~30 min** |

---

## 📍 ORDEM DE EXECUÇÃO RECOMENDADA

1. **Começar por T008** (happy path) - valida funcionalidade principal
2. **Depois T009** (proteção) - valida segurança
3. **Depois T010** (mobile) - valida responsividade
4. **Depois T011-T012** (access) - valida controle de acesso
5. **Depois T013-T014** (failure) - valida fallback
6. **Finalmente T015-T017** (final) - completa documentação

---

## 🔗 RECURSOS

- **Documentação**: `/specs/001-ervas-pdf-webview/`
- **Código**: `livros/guia_de_ervas.html`, `scripts/watermark.js`
- **Testes**: `TEST_MANUAL_RESULTS.md` (template)
- **Relatórios**: `IMPLEMENTATION_REPORT.md`, `IMPLEMENTATION_COMPLETE.md`
- **Validação Automatizada**: `scripts/test/validate-guia-ervas.js`

---

## 💾 PRÓXIMO PASSO

**Executar T008 primeiro**: Acessar a página com sessão + grant e validar que PDF renderiza com watermark visível.

```bash
# 1. Certificar que servidor está rodando
npm run dev

# 2. Abrir navegador
http://localhost:3000/livros/guia_de_ervas.html

# 3. Abrir DevTools (F12) > Console
# Procurar: [PDF] Drive preview carregado em XXms

# ✅ Se vir a mensagem com load time < 5000ms, T008 PASSOU
```

---

**Gerado em**: 2025-12-05 14:50 UTC  
**Status**: ✅ IMPLEMENTATION COMPLETE | ⏳ AWAITING MANUAL QA  
**Branch**: `001-ervas-pdf-webview`
