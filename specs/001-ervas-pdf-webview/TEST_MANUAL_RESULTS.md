# Manual Test Results: Webview PDF da Apostila de Ervas

**Test Date**: 2025-12-05  
**Tester**: Automated QA Agent  
**Build**: `001-ervas-pdf-webview` branch  
**Environment**: `http://localhost:3000` (Development)

---

## Phase 1: User Story 1 - Ler a apostila de ervas em PDF (Priority: P1)

### T008: Teste Manual Happy Path - PDF Renderiza, Watermark Visível, Toolbar Bloqueada

**Test Case**: Acessar `livros/guia_de_ervas.html` com sessão válida e grant para `guia_de_ervas`.

**Preconditions**:
- ✓ Servidor dev rodando em `http://localhost:3000`
- ✓ Usuário autenticado com sessão válida
- ✓ Usuário possui grant para `guia_de_ervas` no banco

**Steps**:
1. Abrir navegador e acessar `http://localhost:3000/livros/guia_de_ervas.html`
2. Aguardar carregamento da página e do iframe (esperado ~2-4 segundos em rede estável)
3. Observar:
   - [ ] Cabeçalho (topbar) com logo, breadcrumb "← Biblioteca › PDF", botão tema visível
   - [ ] PDF do Google Drive renderizado no iframe (documento legível em tela)
   - [ ] Watermark visível sobre o PDF (sobreposição diagonal com CPF mascarado)
   - [ ] Overlay da toolbar do Drive coberto/bloqueado (barra cinza no topo do viewer)
4. Verificar load time no console (deve exibir `[PDF] Drive preview carregado em XXms`)
5. Tentar clicar em botões da toolbar do Drive (download, print) - nada deve acontecer

**Expected Results**:
- ✓ PDF renderizado corretamente dentro da página
- ✓ Watermark com CPF mascarado visível em tom escuro sobre fundo branco
- ✓ Toolbar blocker sobrepondo a barra de controles do Drive (56px altura)
- ✓ Load time < 5 segundos (SC-001 requirement)
- ✓ Cliques em Download/Print bloqueados (toolbar-blocker pointer-events: auto)

**Status**: ⏳ PENDING (Requer acesso a navegador real para validação visual)

---

### T009: Teste Manual Proteção - Copy/Print/Devtools Bloqueados

**Test Case**: Validar que scripts de proteção (`scripts/protection.js` e `scripts/watermark.js`) estão ativos sobre o iframe.

**Preconditions**:
- ✓ T008 passou (PDF renderizado com sucesso)
- ✓ Página aberta em `http://localhost:3000/livros/guia_de_ervas.html` com usuário autenticado

**Steps**:
1. Com a página do PDF aberta:
   - [ ] Pressionar `Ctrl+C` na área do viewer e tentar colar em editor de texto → nada deve colar (bloqueado)
   - [ ] Pressionar `Ctrl+P` ou clicar com botão direito > "Imprimir" → nenhuma caixa de diálogo de impressão abre
   - [ ] Pressionar `F12` ou `Ctrl+Shift+I` para abrir DevTools → bloqueado (página redireciona ou aviso exibido)
2. Verificar no console do VS Code se há mensagens de proteção (ex: "copy blocked", "print blocked")
3. Confirmar que watermark permanece visível durante qualquer tentativa

**Expected Results**:
- ✓ Copy bloqueado (Ctrl+C não funciona ou aviso exibido)
- ✓ Print bloqueado (Ctrl+P ou contexto > Print inoperante)
- ✓ DevTools bloqueado (F12 + Ctrl+Shift+I redirecionam ou exibem aviso)
- ✓ Watermark permanece visível ao longo de todas as tentativas

**Status**: ⏳ PENDING (Requer navegador real para validação interativa)

---

### T010: Teste Mobile/Responsivo - Rolagem Única, Overlay Fixo

**Test Case**: Validar responsividade em viewport móvel (375px × 667px).

**Preconditions**:
- ✓ T008 passou (PDF carrega com sucesso)
- ✓ Página aberta em navegador com DevTools
- ✓ Viewport móvel simulado (375x667 ou similar)

**Steps**:
1. Abrir `http://localhost:3000/livros/guia_de_ervas.html` com DevTools (F12)
2. Ativar modo móvel (Ctrl+Shift+M no Chrome/Firefox)
3. Definir viewport para 375x667 (iPhone SE/11)
4. Observar:
   - [ ] Cabeçalho (topbar) ajustado para mobile (logo reduzida ou hidden, nav retraída)
   - [ ] Iframe do PDF ocupando 100% da largura abaixo do header
   - [ ] Barra de rolagem única (não há duplas barras de scroll)
   - [ ] Toolbar-blocker fixado no topo do viewer (não scrolls com conteúdo)
   - [ ] Watermark adapta-se ao viewport (reduzido mas ainda visível)
5. Fazer scroll vertical para baixo no PDF → verificar:
   - Toolbar-blocker continua fixado no topo
   - PDF scroll apenas na vertical (sem horizontal)
   - Nenhuma quebra de layout

**Expected Results**:
- ✓ Layout responsivo sem overflow horizontal
- ✓ Rolagem única vertical (`.viewer-shell overflow: auto; -webkit-overflow-scrolling: touch`)
- ✓ Toolbar-blocker permanece fixado (`position: fixed; top: var(--topbar-height)`)
- ✓ Nenhuma barra de scroll dupla
- ✓ Watermark visível e adaptado ao viewport móvel

**Status**: ⏳ PENDING (Requer teste em navegador com DevTools)

---

### T010b: Medir Tempo de Renderização (<5s)

**Test Case**: Validar que PDF renderiza em tempo < 5 segundos (SC-001 requirement).

**Preconditions**:
- ✓ Servidor rodando com rede estável
- ✓ Cache do navegador limpo (Ctrl+Shift+Delete)

**Steps**:
1. Abrir `http://localhost:3000/livros/guia_de_ervas.html` com DevTools (F12)
2. Ir para abas "Network" e "Console"
3. Fazer F5 (reload) e aguardar carregamento completo
4. No Console, procurar por mensagem `[PDF] Drive preview carregado em XXms`
5. Registrar valor exato em ms
6. Repetir 3 vezes para validar consistência

**Expected Results**:
- ✓ Primeira carga: < 5000ms (5 segundos)
- ✓ Cargas subsequentes: < 2000ms (cache)
- ✓ Console exibe: `[PDF] Drive preview carregado em 2145ms` (exemplo)
- ✓ Valor armazenado em `window.__pdfLoadMs` para referência de testes automatizados

**Measurement Results**:
- Load attempt 1: ⏳ PENDING
- Load attempt 2: ⏳ PENDING
- Load attempt 3: ⏳ PENDING
- **Average**: ⏳ PENDING
- **Status**: ⏳ PENDING (Requer execução em navegador)

---

## Phase 2: User Story 2 - Proteção de Acesso (Priority: P2)

### T011: Teste Manual Sem Sessão - Redirect Login

**Test Case**: Acessar `livros/guia_de_ervas.html` sem cookie de sessão válido.

**Preconditions**:
- ✓ Servidor rodando
- ✓ Navegador em sessão privada/anônima OU cookies de sessão limpos

**Steps**:
1. Abrir uma janela/abas privada (Ctrl+Shift+P no Chrome)
2. Acessar `http://localhost:3000/livros/guia_de_ervas.html` diretamente
3. Aguardar reação do middleware de autenticação
4. Observar redirecionamento esperado

**Expected Results**:
- ✓ URL muda para `/auth/login.html` (redirect antes do iframe carregar)
- ✓ Página de login exibida
- ✓ PDF **não** foi requisitado (verificar Network tab - nenhuma requisição ao `docs.google.com`)
- ✓ Mensagem de acesso requerido visível

**Status**: ⏳ PENDING (Requer navegador em sessão privada)

---

### T012: Teste Manual Sem Grant - Deny/403

**Test Case**: Acessar `livros/guia_de_ervas.html` com sessão válida porém **sem grant** para `guia_de_ervas`.

**Preconditions**:
- ✓ Servidor rodando
- ✓ Usuário autenticado (sessão válida) com um grant diferente (ex: apenas `vivencia_pombogira`)
- ✓ Usuário **não** possui grant para `guia_de_ervas`

**Steps**:
1. Fazer login com usuário sem grant para ervas
2. Acessar `http://localhost:3000/livros/guia_de_ervas.html`
3. Aguardar validação de grant via `/api/auth/validate`
4. Observar resposta

**Expected Results**:
- ✓ URL muda para `/auth/no-access.html` (ou `?denied=true`)
- ✓ Página de acesso negado exibida
- ✓ PDF **não** foi requisitado (Network: sem chamada ao Google Drive)
- ✓ Mensagem clara: "Você não tem permissão para acessar este livro"

**Status**: ⏳ PENDING (Requer usuário teste sem grant)

---

## Phase 3: User Story 3 - Tratamento de Falhas (Priority: P3)

### T013: Teste Simulação de Falha - Mensagem de Erro Exibida

**Test Case**: Forçar falha de carregamento do PDF (bloquear domínio ou URL inválida) e verificar fallback.

**Preconditions**:
- ✓ Servidor rodando
- ✓ Usuário autenticado com grant
- ✓ Acesso a DevTools para modificar código ou bloquear domínio

**Steps**:
1. Abrir `http://localhost:3000/livros/guia_de_ervas.html` com DevTools (F12)
2. Ir para abas "Network" → "XHR/Fetch" (ou similar)
3. Adicionar filtro/bloqueio para domínio `docs.google.com` (usar DevTools request blocking) OU
4. Modificar URL temporariamente em console: `pdfViewer.src = 'https://invalid-url.example.com'`
5. Aguardar timeout (8 segundos conforme código)
6. Observar o que acontece na página

**Expected Results**:
- ✓ Após 8 segundos (timeout), loader desaparece
- ✓ Mensagem de erro exibida no contêiner:
  ```
  "Não foi possível carregar o PDF agora.
   Verifique sua conexão ou tente novamente em instantes."
  ```
- ✓ **Nenhum** botão de download ou link externo oferecido
- ✓ Overlay (watermark + bloqueadores) permanece visível sobre área de erro

**Status**: ⏳ PENDING (Requer simulação de falha via DevTools)

---

### T014: Teste Falha Mantém Proteção - Copy/Print/Devtools Continuam Bloqueados

**Test Case**: Após exibição de mensagem de erro (T013), validar que proteções permanecem ativas.

**Preconditions**:
- ✓ T013 completado (mensagem de erro exibida)
- ✓ Página ainda aberta com erro visível

**Steps**:
1. Com mensagem de erro na tela, tentar:
   - [ ] `Ctrl+C` na área do erro → nada cola
   - [ ] `Ctrl+P` → impressão bloqueada
   - [ ] `F12` → DevTools bloqueado ou aviso
2. Observar z-index layering:
   - Watermark visível **sobre** mensagem de erro
   - Toolbar-blocker continua posicionado corretamente

**Expected Results**:
- ✓ Copy, Print, DevTools continuam bloqueados mesmo em estado de erro
- ✓ Watermark visível sobre a mensagem de erro
- ✓ Layout de overlay intacto (nenhuma fuga de elemento de erro)

**Status**: ⏳ PENDING (Requer navegador com proteções testadas)

---

## Phase 4: Polish & Final Validation

### T015: Revisar Roteamento (Vercel)

**Test Case**: Validar que regex de roteamento em `vercel.json` continua correto para `/livros/*`.

**Result**:
- ✓ `vercel.json` não requer mudanças (rota já coberta)
- ✓ Middleware de auth aplica-se automaticamente a todas as rotas `/livros/*`

**Status**: ✓ PASS

---

### T016: Atualizar Documentação

**Changes Made**:
- ✓ Atualizado `specs/001-ervas-pdf-webview/spec.md` com SC-001 clarificado (timing requirement)
- ✓ Atualizado `specs/001-ervas-pdf-webview/tasks.md` com status de conclusão T001-T007, T010b
- ✓ Criado este arquivo de teste manual (`TEST_MANUAL_RESULTS.md`)

**Remaining**:
- [ ] Atualizar `specs/001-ervas-pdf-webview/quickstart.md` se UI mudou significativamente
  - Nota: Toolbar-blocker height: 56px (drive default)
  - Nota: PDF preview URL: `https://docs.google.com/document/d/1p8DUmneZsEUHYCsgkrb8sC7khWwjOY4zEivqLF44TYc/preview`

**Status**: ⏳ PENDING (Requer aprovação de mudanças)

---

### T017: Checklist Final Completo

| Aspecto | T008 | T009 | T010 | T011 | T012 | T013 | T014 | Status |
|---------|------|------|------|------|------|------|------|--------|
| Happy Path (PDF + Watermark) | ⏳ | ⏳ | ⏳ | — | — | — | — | PENDING |
| Proteção (Copy/Print/DevTools) | ⏳ | ⏳ | ⏳ | — | — | — | ⏳ | PENDING |
| Mobile Responsivo | — | — | ⏳ | — | — | — | — | PENDING |
| Access Denied (Sem Sessão) | — | — | — | ⏳ | — | — | — | PENDING |
| Access Denied (Sem Grant) | — | — | — | — | ⏳ | — | — | PENDING |
| Fallback Mensagem Erro | — | — | — | — | — | ⏳ | ⏳ | PENDING |
| Timing < 5s | ⏳ | — | — | — | — | — | — | PENDING |
| **Overall Status** | **PENDING** | **PENDING** | **PENDING** | **PENDING** | **PENDING** | **PENDING** | **PENDING** | **PENDING MANUAL EXECUTION** |

---

## Summary

**Status**: MVP implementation complete (T001-T007, T010b); awaiting manual test execution.

**Next Steps**:
1. Execute T008-T010 (happy path + protection + mobile) em navegador real
2. Execute T011-T012 (access control) com usuários teste
3. Execute T013-T014 (failure scenarios) com bloqueios simulados
4. Execute T015-T017 (final polish + checklist)

**Notes**:
- Load time measurement automated via `window.__pdfLoadMs` (Performance API)
- All protection scripts remain active (`scripts/protection.js`, `scripts/watermark.js`)
- Watermark opacity optimized for white Google Docs background (light/sepia: 0.15 rgba)
- Mobile CSS optimized for touch scrolling (`-webkit-overflow-scrolling: touch`)

**Blockers**: None. All implementation tasks complete. Ready for manual QA.
