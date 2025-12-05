# 👉 INSTRUÇÕES IMEDIATAS - O QUE FAZER AGORA

**Leia este documento para saber exatamente o que fazer a seguir.**

---

## 🎯 SITUAÇÃO ATUAL

✅ **Implementação está 100% completa**  
✅ **Validação técnica passou 11/11 testes**  
✅ **Documentação criada (5+ arquivos)**  
⏳ **Aguardando: Testes manuais (T008-T017)**

---

## 🚀 PRÓXIMA AÇÃO: T008 (Happy Path Test)

### PASSO 1: Verificar Servidor
```bash
# No terminal, na raiz do projeto:
npm run dev

# Resultado esperado:
# Server is running at http://localhost:3000
```

### PASSO 2: Abrir Navegador
```
URL: http://localhost:3000/livros/guia_de_ervas.html
```

### PASSO 3: Validar Funcionamento
```
Quando a página carregar, você deve ver:

1. ✅ Cabeçalho com logo e "Guia de Ervas"
2. ✅ PDF renderizado no iframe (documento legível)
3. ✅ Watermark diagonal com seu CPF mascarado
4. ✅ Uma barra cinza no topo (toolbar blocker)
```

### PASSO 4: Verificar Timing
```bash
1. Abrir DevTools: F12
2. Ir para aba "Console"
3. Procurar pela mensagem:
   "[PDF] Drive preview carregado em XXms"
4. Anotar o valor:
   - Se < 5000ms (5 segundos) → ✅ PASS
   - Se ≥ 5000ms → ❌ FAIL (muito lento)
```

### PASSO 5: Testar Proteções
```bash
1. Com a página aberta:
   - Pressionar Ctrl+C (copy)
   - Tentar colar em Notepad: Ctrl+V
   → Esperado: Nada cola (bloqueado ✅)

2. Pressionar Ctrl+P (print)
   → Esperado: Nenhuma janela de print abre (bloqueado ✅)

3. Pressionar F12 (DevTools)
   → Esperado: Bloqueado ou aviso (protegido ✅)
```

---

## 📊 RESULTADO ESPERADO DE T008

Se todos os passos acima passaram:

```
✅ T008 = PASS (Happy Path)

Critérios:
  ✅ PDF renderiza
  ✅ Watermark visível
  ✅ Timing < 5s
  ✅ Proteções ativas (copy/print/devtools bloqueados)
  ✅ Toolbar bloqueada (não clica em download)
```

---

## ⏳ O QUE VEM DEPOIS (Se T008 passar)

Se T008 passou, continue com:

### T009 (Proteção Detalhada)
Mesmos testes de proteção, mas mais minuciosamente.  
**Tempo**: ~3 min

### T010 (Mobile)
Abrir DevTools > Mobile mode > Viewport 375x667  
Verificar scroll único e overlay fixado.  
**Tempo**: ~3 min

### T011-T012 (Access Control)
Testar sem sessão e sem grant.  
**Tempo**: ~5 min

### T013-T014 (Failure)
Simular falha de carregamento.  
**Tempo**: ~5 min

### T015-T017 (Final)
Revisar checklist final.  
**Tempo**: ~5 min

**⏱️ Total: ~30 minutos**

---

## 📖 DOCUMENTAÇÃO CRIADA

Se precisar de mais detalhes, consulte:

1. **NEXT_STEPS.md** (raiz)
   - Instruções detalhadas para cada teste
   - Checklist completo

2. **TEST_MANUAL_RESULTS.md** (/specs/001-ervas-pdf-webview/)
   - Descrição de cada teste (T008-T017)
   - Expected results
   - Como executar

3. **IMPLEMENTATION_REPORT.md** (raiz)
   - Relatório técnico completo
   - Arquivos modificados
   - Métricas

4. **STATUS_DASHBOARD.md** (raiz)
   - Dashboard visual
   - KPIs
   - Progress tracking

5. **IMPLEMENTACAO_RESUMIDA.md** (raiz)
   - Resumo em português
   - Quick reference

---

## ✅ VALIDATION SCRIPT

Se quiser validação rápida sem navegador:

```bash
node scripts/test/validate-guia-ervas.js
```

**Resultado esperado**: ✅ 11/11 Testes PASS

---

## 🎯 RESUMO

| O que | Quando | Como |
|------|--------|------|
| **T008** | Agora | Seguir instruções acima |
| **T009-T014** | Depois de T008 pass | Consultar NEXT_STEPS.md |
| **T015-T017** | Depois de T014 pass | Consultar NEXT_STEPS.md |
| **Merge** | Depois de T017 pass | Fazer commit/push |
| **Deploy** | Automático | Via Vercel |

---

## 🆘 SE ALGO DER ERRADO

### Erro: "Servidor não está rodando"
```bash
npm run dev
# Se porta 3000 já está em uso:
npm run dev -- --port 3001
```

### Erro: "Não consigo logar"
```bash
# Verificar que usuário tem grant para guia_de_ervas
# Usar usuário que tem grants de outros livros como referência
```

### Erro: "PDF não carrega"
```bash
# Verificar conexão com Google Drive
# Verificar que URL está correta (deve ser /preview, não /edit)
# Consultar: NEXT_STEPS.md > T013 (Failure scenarios)
```

### Erro: "Timing muito lento (> 5s)"
```bash
# Esperado em rede lenta
# Recarregar página (F5) para nova medição
# Se consistentemente > 5s, consultar logs de rede
```

---

## 📞 INFORMAÇÕES IMPORTANTES

**Branch**: `001-ervas-pdf-webview`  
**Servidor**: http://localhost:3000  
**Arquivo Principal**: `/livros/guia_de_ervas.html`  
**Google Drive URL**: `https://docs.google.com/document/d/.../preview`  
**Proteção Ativa**: Sim (copy/print/devtools bloqueados)  
**Documentação**: 5+ arquivos (português + inglês)  

---

## 🎉 PRÓXIMO PASSO

**AGORA**: Abrir navegador e acessar:
```
http://localhost:3000/livros/guia_de_ervas.html
```

**DEPOIS**: Abrir DevTools (F12) > Console e procurar:
```
[PDF] Drive preview carregado em XXms
```

Se timing < 5000ms → ✅ **T008 PASSA**

---

**Tempo estimado para T008**: ~5 minutos  
**Tempo para completar todos os testes (T008-T017)**: ~30 minutos  
**Status**: ✅ Pronto para começar!

> 👉 **Abra o navegador e teste agora!**
