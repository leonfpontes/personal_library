# Checklist de Estrutura: Personal Library

**Propósito**: Validação rápida (≤15 min) da integridade estrutural pós-mudança.  
**Frequência**: Antes de deploy, após reorganização, antes de merge.  
**Tempo**: ~10–15 minutos

---

## Parte 1: Existência de Arquivos Críticos (3 min)

- [ ] **Raiz**: `middleware.js` existe
- [ ] **Raiz**: `vercel.json` existe
- [ ] **Raiz**: `package.json` existe
- [ ] **Raiz**: `README.md` existe
- [ ] **Raiz**: `index.html` existe
- [ ] **API**: `api/auth/` existe com `login.js`, `logout.js`, `validate.js`
- [ ] **Auth**: `auth/db.js` existe
- [ ] **Auth**: `auth/admin.html` existe
- [ ] **Livros**: `livros/` existe com 5 `.html` (pombogira, ervas, iansa, oba, oya)
- [ ] **Scripts**: `scripts/protection.js` existe
- [ ] **Scripts**: `scripts/watermark.js` existe
- [ ] **Styles**: `styles/base.css` existe
- [ ] **Styles**: `styles/theme-*.css` existe (5 arquivos: pombogira, ervas, iansa, oba, oya)
- [ ] **Source**: `Source/` existe com `.md` manuscritos

---

## Parte 2: Referências Internas (5 min)

### index.html Links

- [ ] Link para `/livros/vivencia_pombogira.html` existe
- [ ] Link para `/livros/guia_de_ervas.html` existe
- [ ] Link para `/livros/aula_iansa.html` existe
- [ ] Link para `/livros/aula_oba.html` existe
- [ ] Link para `/livros/aula_oya_loguna.html` existe

### README.md References

- [ ] Pelo menos uma referência para `docs/ops/` (ex.: DEPLOY, COMO_RODAR)
- [ ] Link para `specs/001-login-access-control/spec.md` ou similar existe
- [ ] Não há referências para arquivos deletados (ex.: COMO_RODAR.md na raiz)

### Leitores (livros/*.html) References

- [ ] Verificar um leitor (ex.: `vivencia_pombogira.html`)
  - [ ] `<link rel="stylesheet" href="../styles/base.css" />`
  - [ ] `<link rel="stylesheet" href="../styles/theme-pombogira.css" />`
  - [ ] `<script src="../scripts/protection.js"></script>` ou similar
  - [ ] `<script src="../scripts/watermark.js"></script>` ou similar

---

## Parte 3: Documentação Operacional (2 min)

- [ ] `docs/ops/COMO_RODAR.md` existe
- [ ] `docs/ops/DEPLOY.md` existe
- [ ] `docs/ops/DEPLOYMENT_READY.md` existe
- [ ] `docs/ops/MOBILE_PATCH.md` existe
- [ ] `docs/ops/PRODUCTION_DEBUG_GUIDE.md` existe
- [ ] `docs/ops/RESUMO_EXECUTIVO.md` existe
- [ ] `docs/ops/STATUS.md` existe
- [ ] `docs/structure-guide.md` existe
- [ ] Nenhum doc operacional está na raiz (ex.: não deve haver `COMO_RODAR.md` em `/`)

---

## Parte 4: Spec & Design Docs (1 min)

- [ ] `specs/001-project-structure/` existe
- [ ] `specs/001-project-structure/spec.md` existe
- [ ] `specs/001-project-structure/plan.md` existe
- [ ] `specs/001-project-structure/tasks.md` existe
- [ ] `specs/001-project-structure/research.md` existe

---

## Parte 5: Casing Validation (2 min)

**Windows é case-insensitive, Vercel (Linux) é case-sensitive.**

- [ ] `livros/vivencia_pombogira.html` (minúsculas, não VIVENCIA_POMBOGIRA)
- [ ] `livros/guia_de_ervas.html` (minúsculas)
- [ ] `livros/aula_iansa.html` (minúsculas)
- [ ] `livros/aula_oba.html` (minúsculas)
- [ ] `livros/aula_oya_loguna.html` (minúsculas)
- [ ] `styles/theme-pombogira.css` (minúsculas)
- [ ] `styles/theme-ervas.css` (minúsculas)
- [ ] `styles/theme-iansa.css` (minúsculas)
- [ ] `styles/theme-oba.css` (minúsculas)
- [ ] `styles/theme-oya_loguna.css` (minúsculas)

---

## Parte 6: Dev Server Check (3 min)

Executar localmente:

```bash
npm run dev
```

- [ ] **Startup**: Sem erros fatais na inicialização
- [ ] **Index**: `http://localhost:3000` carrega catálogo
- [ ] **Login**: `http://localhost:3000/auth/login.html` carrega
- [ ] **Network**: F12 → Network tab → Nenhum `404 Not Found` em:
  - Stylesheets (`.css`)
  - Scripts (`.js`)
  - Imagens (`.svg`, `.png`)

---

## Parte 7: Link Integrity (2 min)

Se tiver `npx linkinator` instalado:

```bash
npx linkinator ./index.html ./livros ./docs --skip http(s)
```

- [ ] Exit code = 0 (sem erros)
- [ ] Nenhum `4xx` (404, 403, etc.)
- [ ] Nenhum `5xx` (500, etc.)

Se não tiver, fazer manual:
- [ ] Abrir `index.html` no navegador
- [ ] Clicar em cada link de livro (não deve dar 404)
- [ ] Abrir `README.md` → clicar em links para `docs/ops/` (visualmente validar)

---

## Parte 8: Protection & Security (2 min)

1. Abrir um leitor em dev server (ex.: `http://localhost:3000/livros/vivencia_pombogira.html`)
2. **F12** → Inspect Elements:
   - [ ] Existe elemento com classe `.watermark-overlay` ou similar
   - [ ] Console não tem erros 403/401 (autenticação OK)
3. **Tente Ctrl+C** (copiar texto):
   - [ ] [ ] Texto **não** é copiável (proteção ativa)
4. **Tente Ctrl+P** (print):
   - [ ] Abre dialog, mas JavaScript bloqueou (ou página não printa sensível)

---

## Parte 9: Final Verification

- [ ] Spec/Plan/Tasks para mudanças documentado em `specs/`
- [ ] Nenhum arquivo crítico foi deletado (verificar `git status`)
- [ ] Todas as mudanças foram `git add` + `git commit`

---

## Resultado

**✅ PASS**: Todas as caixas marcadas → Estrutura válida, pronta para deploy.

**❌ FAIL**: Alguma caixa desmarcada → Revisar item correspondente, corrigir, re-testar.

---

## Comandos Rápidos (Copiar & Colar)

```bash
# Verificar que docs ops não estão na raiz
ls -la *.md | grep -E "COMO_RODAR|DEPLOY|STATUS"  # Deve retornar 0 matches

# Verificar que docs ops estão em docs/ops/
ls docs/ops/*.md | wc -l  # Deve retornar 7

# Dev server
npm run dev

# Link check (se linkinator instalado)
npx linkinator ./index.html ./livros ./docs --skip http(s)

# Git status (verificar mudanças)
git status

# Git diff (ver o que mudou)
git diff --name-status
```

---

## Próxima Iteração

- Após PASS deste checklist → Pronto para deploy
- Após deploy → Validar em ambiente de produção (similar checklist)
