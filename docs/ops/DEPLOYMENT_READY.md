# 🚀 Guia de Deploy - Personal Library

## ✅ Status Atual do Projeto

- ✅ **Código 100% implementado** (38 tasks concluídas)
- ✅ **Database: Neon PostgreSQL** (serverless, sa-east-1, tier gratuito)
- ✅ **Migrations aplicadas** (`migrate-postgres.js`)
- ✅ **Seed executado** (admin criado: admin@library.local)
- ✅ **Dependências atualizadas** (`@neondatabase/serverless`, `bcryptjs`, `jsonwebtoken`, `uuid`)
- ✅ **Documentação completa** (README.md + quickstart.md + api-reference.md)
- ✅ **Deploy na Vercel COMPLETO** (produção funcionando)
- ✅ **Bugs críticos corrigidos** (regex clean URLs, grant persistence, admin access)
- ✅ **UI/UX polido** (responsividade, favicon, tipografia)

---

## 📋 Pré-requisitos

- ✅ Conta Vercel conectada ao repositório Git
- ✅ Banco Neon PostgreSQL provisionado
- ✅ Variáveis de ambiente conhecidas (`.env.local`)
- ✅ Admin user criado (admin@library.local / changeme123)

---

## 🌐 Deploy na Vercel (Passo a Passo)

### 1. Conectar repositório (se ainda não conectou)

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Conectar projeto
vercel
```

**Wizard vai perguntar:**
- Link to existing project? → **No**
- What's your project's name? → **personal-library** (ou outro nome)
- In which directory is your code located? → **./** (raiz)
- Want to modify settings? → **No**

**Resultado:** Projeto criado no Vercel Dashboard.

---

### 2. Configurar Variáveis de Ambiente

Acesse: **[Vercel Dashboard](https://vercel.com/dashboard) → Seu Projeto → Settings → Environment Variables**

#### Adicionar as seguintes variáveis:

| Name | Value | Environments |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_XXX@ep-XXX-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `JWT_SECRET` | **(GERAR NOVO)** `openssl rand -base64 32` | Production, Preview, Development |
| `ADMIN_TOKEN` | **(GERAR NOVO)** `openssl rand -hex 16` | Production, Preview, Development |
| `SESSION_TTL_SECONDS` | `86400` | Production, Preview, Development |

**⚠️ IMPORTANTE:**
- Use a DATABASE_URL **com pooling** (`-pooler` no hostname) para Edge Functions
- **GERE NOVOS valores** de `JWT_SECRET` e `ADMIN_TOKEN` para produção (diferentes do `.env.local`)
- Marque **Production + Preview + Development** para todas as variáveis

**Como adicionar:**
1. Clique em **"Add New"**
2. Preencha **Name** e **Value**
3. Selecione os 3 environments
4. Clique **Save**
5. Repita para cada variável

---

### 3. Fazer Deploy

```bash
# Deploy da branch atual (preview)
vercel

# OU: Deploy direto para produção
vercel --prod

# OU: Fazer push para o Git (deploy automático)
git add .
git commit -m "feat: ready for production"
git push origin 001-login-access-control
```

**Vercel fará deploy automático em ~30-60 segundos.**

**URL gerada:**
- Preview: `https://personal-library-xxx.vercel.app`
- Production: `https://personal-library.vercel.app` (ou domínio custom)

---

### 4. Verificar Deploy

Acesse: **Vercel Dashboard → Deployments**

Status esperado: ✅ **Ready**

**Se der erro:**
- Clique no deployment
- Vá em **"Function Logs"** ou **"Build Logs"**
- Verifique se há erro de env var (ex: "Missing env var DATABASE_URL")

```powershell
turso db shell personallibrary-leonfpontes < specs/001-login-access-control/checklists/migrations.sql
```

Ou copie o SQL de `MIGRATION_MANUAL.md` e execute no shell interativo:

```powershell
turso db shell personallibrary-leonfpontes
# Colar SQL e executar
```

### Opção 2: Via Turso Dashboard (Mais Visual)

1. Acesse [https://turso.tech/app](https://turso.tech/app)
2. Navegue até o banco `personallibrary-leonfpontes`
3. Clique em **"SQL Editor"** ou **"Shell"**
4. Copie TODO o SQL de `MIGRATION_MANUAL.md` e execute
5. Verifique se as 4 tabelas foram criadas:

```sql
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

Deve retornar: `audit_log`, `grants`, `sessions`, `users`

---

## ✅ Após Migrations: Executar Seed

Com as env vars ainda configuradas na sessão do PowerShell, execute:

```powershell
node seed.js
```

**Resultado esperado**:
```
✅ Admin criado: admin@library.local / changeme123
```

---

## ✅ Configurar Env Vars no Vercel

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Navegue até o projeto `personal_library`
3. **Settings → Environment Variables**
4. Adicione para **Production, Preview e Development**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `libsql://personallibrary-leonfpontes.aws-us-east-1.turso.io` |
| `DATABASE_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` (token completo) |
| `JWT_SECRET` | `Hy8f3k2J9vLmN4pQ7rS0tU1vW2xY3zA4bC5dE6fG7hI=` |
| `ADMIN_TOKEN` | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `SESSION_TTL_SECONDS` | `86400` |

⚠️ **IMPORTANTE**: Trocar `JWT_SECRET` e `ADMIN_TOKEN` em produção! Use:

```powershell
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 24  # ADMIN_TOKEN
```

---

## ✅ Deploy Preview

1. **Commit e push**:

```powershell
git add .
git commit -m "feat: auth system complete with migrations and seed"
git push origin 001-login-access-control
```

2. **Vercel fará deploy automático** do preview

3. **Verificar no dashboard**: `https://vercel.com/<seu-projeto>/deployments`

---

## ✅ Validação Final

Após deploy preview, teste:

1. **Middleware funcional**:
   - Acesse `https://<preview-url>/livros/vivencia_pombogira.html` sem login
   - Deve redirecionar para `index.html?denied=true`

2. **Admin panel**:
   - Acesse `https://<preview-url>/auth/admin.html`
   - Cole o `ADMIN_TOKEN` (que você configurou no Vercel)
   - Crie um usuário de teste:
     - Nome: João Silva
     - CPF: 12345678901
     - Email: joao@test.com
     - Password: teste123
     - Marcar consent checkbox
   - Clique "Cadastrar usuário" → deve aparecer na lista

3. **Conceder acesso**:
   - Na lista de usuários, marque checkbox "vivencia_pombogira" para João
   - Clique "Salvar acessos"

4. **Login** (via API, pois login.html não foi implementado):

```powershell
curl -X POST https://<preview-url>/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"joao@test.com","password":"teste123"}'
```

Copie o cookie `session` retornado.

5. **Acessar reader protegido**:
   - Abra browser, cole cookie manualmente (F12 → Application → Cookies)
   - Acesse `https://<preview-url>/livros/vivencia_pombogira.html`
   - Watermark com "João Silva — CPF 123***01" deve aparecer
   - Tente copiar texto → alert bloqueado

6. **Auditoria**:

```powershell
curl -X GET "https://<preview-url>/api/audit/logs?limit=10" `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

Deve retornar eventos de `copy_attempt`, etc.

---

## ✅ Deploy Production

Após validação no preview:

```powershell
git checkout main
git merge 001-login-access-control
git push origin main
```

Vercel fará deploy automático em produção.

---

## 📊 Checklist Final

- [ ] Migrations aplicadas no Turso (via CLI ou dashboard)
- [ ] Seed executado com sucesso (admin criado)
- [ ] Env vars configuradas no Vercel Dashboard
- [ ] Deploy preview realizado
- [ ] Middleware testado (redireciona sem login)
- [ ] Admin panel testado (cria usuário e concede grant)
- [ ] Login testado (retorna cookie)
- [ ] Reader protegido testado (watermark aparece)
- [ ] Proteções testadas (cópia bloqueada)
- [ ] Auditoria testada (logs registrados)
- [ ] Deploy production realizado

---

## 🎯 Próximos Passos Após Deploy

1. **Trocar senha do admin**:
   - Login como `admin@library.local` / `changeme123`
   - (Implementar endpoint `/api/users/change-password` futuramente)

2. **Implementar `auth/login.html`** (UX completa)
   - Atualmente login só via API
   - Criar página com formulário de login
   - Redirecionar para catálogo após login

3. **Implementar logout endpoint** `/api/auth/logout`
   - Marcar sessão como `revoked_at`
   - Limpar cookie

4. **Monitoramento**:
   - Integrar Vercel Logs ou Sentry
   - Configurar alertas para erros 5xx
   - Dashboard de métricas (usuários ativos, livros acessados)

5. **Melhorias de segurança**:
   - Rate limiting em `/api/auth/login`
   - IP tracking em audit logs
   - 2FA para admin

---

## 📚 Documentação Completa

Toda a documentação está em `specs/001-login-access-control/`:

- `deploy.md` - Guia completo de deployment
- `security-audit.md` - Auditoria de segurança
- `api-reference.md` - Exemplos de uso das APIs
- `NEXT_STEPS.md` - Roadmap e melhorias futuras
- `MIGRATION_MANUAL.md` - Instruções detalhadas de migrations

---

## 🆘 Troubleshooting

### Seed falha com "table users does not exist"
→ Migrations não foram aplicadas. Execute SQL manualmente no Turso.

### Vercel deploy falha com "Cannot find module @libsql/client"
→ Confirme que `package.json` tem a dependência e foi commitado.

### Middleware não redireciona
→ Verifique que `middleware.js` está na raiz e `config.matcher` está correto.

### Admin token não funciona
→ Confirme que o valor no Vercel Dashboard é exatamente o mesmo do `.env.local`.

### Cookie não persiste
→ Confirme que o site está em HTTPS (Vercel força automaticamente).

---

**🚀 Sistema pronto para deploy! Basta aplicar migrations e configurar env vars no Vercel.**
