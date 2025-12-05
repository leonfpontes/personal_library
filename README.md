# 📚 Personal Library - Sistema de Controle de Acesso

**Status**: ✅ **100% Funcional em Produção** | **Última Atualização**: 26 Nov 2025

Biblioteca digital privada com sistema de autenticação, controle de acesso por livro, auditoria LGPD e proteção contra cópia.

## 🎯 Visão Geral

Este projeto implementa um sistema completo de gestão de acesso para uma biblioteca digital de manuscritos em português (pt-BR). O sistema protege conteúdo sensível através de:

- ✅ **Autenticação JWT** com sessões seguras (HttpOnly cookies + SameSite)
- ✅ **ACL granular** por livro (grants individuais por usuário)
- ✅ **Proteção em múltiplas camadas** (Edge Middleware + client-side + watermark)
- ✅ **Auditoria completa** em conformidade com LGPD (retenção 90 dias)
- ✅ **Admin dashboard** responsivo para gestão de usuários e permissões
- ✅ **Clean URLs** com Vercel (regex otimizado para `/livros/livro` e `/livros/livro.html`)
- ✅ **Tipografia consistente** (Roboto em UI, Inter+Merriweather nos livros)

## 🏗️ Arquitetura

**Stack:**
- **Frontend**: HTML/CSS/JavaScript puro (sem build)
- **Backend**: Vercel Edge Functions + Middleware
- **Database**: Neon PostgreSQL (serverless, região sa-east-1)
- **Auth**: JWT + bcrypt + HttpOnly cookies
- **Deploy**: Vercel (edge-first, zero-config)

**Estrutura de Diretórios:**
```
personal_library/
├── api/                      # Vercel Edge Functions
│   ├── auth/                 # Login, logout, validação
│   ├── users/                # CRUD de usuários (admin only)
│   ├── grants/               # Gerenciamento de permissões
│   └── audit/                # Logs de auditoria LGPD
├── auth/                     # Módulos de autenticação
│   ├── db.js                 # Cliente PostgreSQL + queries
│   ├── jwt.js                # Geração e validação JWT
│   └── admin.html            # Dashboard administrativo
├── livros/                   # Livros HTML protegidos
│   ├── vivencia_pombogira.html
│   ├── guia_de_ervas.html
│   ├── aula_iansa.html
│   ├── aula_oba.html
│   └── aula_oya_loguna.html
├── scripts/                  # Client-side protection
│   ├── watermark.js          # Overlay com CPF do usuário
│   ├── protection.js         # Bloqueio de cópia/print/devtools
│   └── admin.js              # Lógica do dashboard
├── middleware.js             # Edge Middleware (authz + redirect)
├── migrate-postgres.js       # Script de migrations
├── seed.js                   # Criação do admin inicial
└── vercel.json               # Configuração de rotas
```

## 🚀 Pré-requisitos

- **Node.js** 18+ (para desenvolvimento local)
- **Conta Vercel** (deploy)
- **Banco Neon PostgreSQL** (já provisionado)
- **Git** (versionamento)

## 📦 Instalação

### 1. Clonar o repositório
```bash
git clone https://github.com/leonfpontes/personal_library.git
cd personal_library
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie `.env.local` e ajuste os valores de produção:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-XXX.sa-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (TROCAR EM PRODUÇÃO - gerar com: openssl rand -base64 32)
JWT_SECRET=Hy8f3k2J9vLmN4pQ7rS0tU1vW2xY3zA4bC5dE6fG7hI=

# Admin Token (TROCAR EM PRODUÇÃO - gerar com: openssl rand -hex 16)
ADMIN_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# Session TTL (24 horas)
SESSION_TTL_SECONDS=86400
```

### 4. Aplicar migrations (primeira vez)
```bash
node migrate-postgres.js
```

**Saída esperada:**
```
✅ Conexão OK
📋 Criando tabelas e índices...
   → users table...
   → grants table...
   → sessions table...
   → audit_log table...
✅ Migrations aplicadas com sucesso!
```

### 5. Criar usuário admin
```bash
node seed.js
```

**Saída esperada:**
```
✅ Admin criado: admin@library.local / changeme123
```

### 6. Rodar localmente
```bash
npm run dev
```

**Acesse:**
- **Biblioteca**: http://localhost:3000
- **Admin**: http://localhost:3000/auth/admin.html
- **Login**: http://localhost:3000/api/auth/login (POST)

## 🔐 Credenciais Iniciais

**Admin (após seed):**
- Email: `admin@library.local`
- Senha: `changeme123`
- **⚠️ TROCAR APÓS PRIMEIRO LOGIN!**

## 🌐 Deploy na Vercel

### 1. Conectar repositório
```bash
vercel
```

Siga o wizard (selecione o projeto Git).

### 2. Configurar env vars no Dashboard

Acesse: **Vercel Dashboard → Settings → Environment Variables**

Adicione:
```
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-XXX.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=(gerar novo valor com openssl rand -base64 32)
ADMIN_TOKEN=(gerar novo valor com openssl rand -hex 16)
SESSION_TTL_SECONDS=86400
```

**Aplicar em**: Production, Preview, Development

### 3. Deploy
```bash
git add .
git commit -m "feat: setup complete"
git push origin 001-login-access-control
```

**Vercel fará deploy automático.**

### 4. Aplicar migrations em produção

Via Neon Dashboard (SQL Editor):
```sql
-- Copiar e colar conteúdo de migrations-postgres.sql
```

Depois, executar seed (localmente, apontando para DATABASE_URL de produção):
```bash
DATABASE_URL="postgresql://..." node seed.js
```

## 🧪 Testando o Sistema

### 1. Testar middleware (sem login)
```bash
curl https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
```
**Esperado:** Redirect 302 para `/api/auth/login`

### 2. Login
```bash
curl -X POST https://seu-projeto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.local","password":"changeme123"}' \
  -c cookies.txt
```
**Esperado:** `{"ok":true}` + cookie `auth_token`

### 3. Acessar livro (sem grant)
```bash
curl -b cookies.txt https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
```
**Esperado:** HTML com mensagem "Você não tem permissão..."

### 4. Criar grant via admin
- Acessar: `https://seu-projeto.vercel.app/auth/admin.html`
- Login com admin
- Ir em "Gerenciar Permissões"
- Conceder acesso ao livro

### 5. Acessar livro (com grant)
```bash
curl -b cookies.txt https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
```
**Esperado:** HTML completo do livro com watermark

## 📊 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login com email/senha (bcrypt)
- [x] JWT em HttpOnly cookie (seguro contra XSS)
- [x] Sessões com TTL (24h)
- [x] Logout com revogação de sessão
- [x] Middleware Edge para validação

### ✅ Controle de Acesso (ACL)
- [x] Grants por usuário + livro
- [x] Status: active/revoked
- [x] API admin para criar/revogar grants
- [x] Validação em Edge Middleware

### ✅ Proteção do Conteúdo
- [x] Middleware (authN + authZ)
- [x] Watermark dinâmico (CPF do usuário)
- [x] Bloqueio de cópia (copy, cut, paste)
- [x] Bloqueio de print (CSS + JS)
- [x] Bloqueio de DevTools (F12, Ctrl+Shift+I)
- [x] Bloqueio de seleção de texto

### ✅ Admin Dashboard
- [x] Interface web (`/auth/admin.html`)
- [x] Listar usuários (com CPF mascarado)
- [x] Criar novos usuários
- [x] Deletar usuários
- [x] Gerenciar grants (conceder/revogar)
- [x] Ver logs de auditoria

### ✅ Auditoria LGPD
- [x] Log de todas as ações (login, acesso, cópia, logout)
- [x] Retenção de 90 dias
- [x] CPF mascarado nas APIs (`123***01`)
- [x] Captura de consentimento no cadastro
- [x] IP hash (SHA-256) para privacidade

## 🔒 Segurança

**Implementado:**
- Senhas hasheadas com bcrypt (10 rounds)
- JWT em HttpOnly cookie (protege contra XSS)
- CSRF protection via SameSite=Strict
- Foreign keys com CASCADE
- CPF mascarado em todas as APIs admin
- IP hasheado nos logs (não armazena IP real)
- Rate limiting natural (Vercel Edge)

**Pendente (próximas iterações):**
- Rate limiting explícito (ex: 5 tentativas/min)
- CAPTCHA no login
- 2FA (opcional)
- Rotação de JWT_SECRET

## 📝 Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Criar admin
npm run seed

# Deploy preview
vercel

# Deploy production
vercel --prod

# Ver logs (Vercel Dashboard)
vercel logs

# Limpar node_modules
rm -rf node_modules && npm install
```

## 📖 Documentação Adicional

- **Especificação completa**: `specs/001-login-access-control/spec.md`
- **Guia de deploy**: `docs/ops/DEPLOY.md`
- **Auditoria de segurança**: `specs/001-login-access-control/security-audit.md`
- **Guia rápido**: `specs/001-login-access-control/quickstart.md`
- **Como rodar localmente**: `docs/ops/COMO_RODAR.md`
- **Deployment checklist**: `docs/ops/DEPLOYMENT_READY.md`
- **Status do projeto**: `docs/ops/STATUS.md`
- **Mobile patches**: `docs/ops/MOBILE_PATCH.md`
- **Production debug guide**: `docs/ops/PRODUCTION_DEBUG_GUIDE.md`
- **Resumo executivo**: `docs/ops/RESUMO_EXECUTIVO.md`

## 🐛 Troubleshooting

### Erro: "Database connection string format..."
**Solução:** Verificar se `DATABASE_URL` no `.env.local` está correto (formato PostgreSQL).

### Erro: "Missing env var JWT_SECRET"
**Solução:** Verificar se `.env.local` existe e está na raiz do projeto.

### Middleware não redireciona
**Solução:** Verificar `vercel.json` e garantir que `middleware.js` está na raiz.

### Admin dashboard não carrega usuários
**Solução:** Verificar network tab (F12) se API `/api/users` retorna 401/403. Pode ser token expirado.

## 📄 Licença

Este projeto contém conteúdo protegido por direitos autorais (Lei nº 9.610/1998).  
**Uso restrito** aos participantes autorizados.

## 🤝 Contato

**Terreiro Tia Maria e Cabocla Jupira**  
Dúvidas: [admin@library.local](mailto:admin@library.local)

---

**Status do Projeto:** ✅ MVP Completo | 🚀 Pronto para Deploy