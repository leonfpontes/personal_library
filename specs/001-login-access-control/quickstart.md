# Quickstart: Login e Controle de Acesso da Biblioteca

**Date**: 2025-11-25  
**Stack**: Vercel Edge Functions + Neon PostgreSQL  
**Status**: ✅ MVP Completo

---

## 🎯 Visão Geral

Sistema completo de autenticação e controle de acesso implementado com:
- **Vercel Edge Middleware** para validação de sessão/ACL
- **Vercel Functions** para APIs de auth/admin
- **Neon PostgreSQL** (serverless, sa-east-1) para armazenamento
- **Proteção em múltiplas camadas** (middleware + client-side + watermark)

---

## ⚡ Setup Rápido (5 minutos)

### 1. Clonar e instalar
```bash
git clone https://github.com/leonfpontes/personal_library.git
cd personal_library
npm install
```

### 2. Configurar `.env.local`
```bash
# Já existe no projeto, ajuste os valores para produção:
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-XXX.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=$(openssl rand -base64 32)
ADMIN_TOKEN=$(openssl rand -hex 16)
SESSION_TTL_SECONDS=86400
```

### 3. Aplicar migrations
```bash
node migrate-postgres.js
```

### 4. Criar admin
```bash
node seed.js
# Output: ✅ Admin criado: admin@library.local / changeme123
```

### 5. Rodar local
```bash
npm run dev
# Acesse: http://localhost:3000
```

---

## 🗄️ Banco de Dados (Neon PostgreSQL)

### Por que Neon?
- ✅ Integração nativa com Vercel
- ✅ PostgreSQL serverless (escala para zero)
- ✅ Região sa-east-1 (Brasil)
- ✅ Tier gratuito: 512 MB storage, 200h compute/mês
- ✅ Branching (um DB por preview deployment)

### Criar banco (se ainda não tiver)
1. Acesse [console.neon.tech](https://console.neon.tech)
2. Clique em "New Project"
3. Nome: `personal-library`
4. Região: **South America (São Paulo) - sa-east-1**
5. Copie a **Connection String** (com pooling)

### Variáveis de ambiente
```env
DATABASE_URL=postgresql://neondb_owner:PASSWORD@HOST.sa-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ Importante**: Use a URL **com pooling** (`-pooler` no hostname) para Edge Functions.

---

## 📋 Schema do Banco

O script `migrate-postgres.js` cria 4 tabelas:

### 1. `users` (Usuários)
```sql
id TEXT PRIMARY KEY              -- UUID v4
nome TEXT NOT NULL               -- Nome completo
cpf TEXT UNIQUE NOT NULL         -- CPF (11 dígitos)
email TEXT UNIQUE NOT NULL       -- Email (único)
hashed_password TEXT NOT NULL    -- bcrypt hash
status TEXT NOT NULL             -- 'active' | 'inactive'
created_at BIGINT NOT NULL       -- Unix timestamp
last_access_at BIGINT NOT NULL   -- Último acesso
consent_at BIGINT NOT NULL       -- Data do consentimento LGPD
```

### 2. `grants` (Permissões por livro)
```sql
id TEXT PRIMARY KEY              -- UUID v4
user_id TEXT NOT NULL            -- FK para users.id
book_slug TEXT NOT NULL          -- 'vivencia_pombogira' | 'guia_de_ervas' | ...
status TEXT NOT NULL             -- 'active' | 'revoked'
granted_at BIGINT NOT NULL       -- Quando foi concedido
revoked_at BIGINT                -- Quando foi revogado (nullable)
```

### 3. `sessions` (Sessões JWT)
```sql
id TEXT PRIMARY KEY              -- UUID v4
user_id TEXT NOT NULL            -- FK para users.id
created_at BIGINT NOT NULL       -- Criação
expires_at BIGINT NOT NULL       -- Expiração
revoked_at BIGINT                -- Revogação manual (logout)
ip_hash TEXT                     -- SHA-256 do IP (LGPD)
user_agent TEXT                  -- Navegador/SO
```

### 4. `audit_log` (Auditoria LGPD)
```sql
id TEXT PRIMARY KEY              -- UUID v4
user_id TEXT                     -- FK para users.id (nullable)
action TEXT NOT NULL             -- 'login_success' | 'access_granted' | ...
book_slug TEXT                   -- Livro acessado (nullable)
timestamp BIGINT NOT NULL        -- Quando ocorreu
ip_hash TEXT                     -- SHA-256 do IP
user_agent TEXT                  -- Navegador/SO
```

---

## 🔐 Credenciais Iniciais

Após executar `node seed.js`:

```
Email: admin@library.local
Senha: changeme123
```

**⚠️ TROCAR APÓS PRIMEIRO LOGIN!**

---

## 🚀 Deploy na Vercel

### 1. Conectar projeto
```bash
vercel
```

Siga o wizard e conecte ao repositório Git.

### 2. Configurar env vars no Dashboard

Acesse: **Vercel Dashboard → Settings → Environment Variables**

Adicione (aplicar em Production + Preview + Development):
```
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-XXX.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=(gerar novo: openssl rand -base64 32)
ADMIN_TOKEN=(gerar novo: openssl rand -hex 16)
SESSION_TTL_SECONDS=86400
```

### 3. Push para deploy
```bash
git add .
git commit -m "feat: setup complete"
git push origin 001-login-access-control
```

**Vercel fará deploy automático em ~30s.**

### 4. Aplicar migrations em produção

**Opção A: Via Neon Dashboard (recomendado)**
1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione o projeto `personal-library`
3. Clique em **SQL Editor**
4. Copie e cole o conteúdo de `migrations-postgres.sql`
5. Clique em **Run**

**Opção B: Localmente (apontando para prod)**
```bash
DATABASE_URL="postgresql://..." node migrate-postgres.js
DATABASE_URL="postgresql://..." node seed.js
```

---

## 🧪 Testando o Sistema

### 1. Middleware bloqueando acesso não autenticado
```bash
curl -I https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
# Esperado: 302 Found (redirect para /api/auth/login)
```

### 2. Login
```bash
curl -X POST https://seu-projeto.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.local","password":"changeme123"}' \
  -c cookies.txt
# Esperado: {"ok":true} + cookie auth_token
```

### 3. Acesso sem grant (autenticado mas sem permissão)
```bash
curl -b cookies.txt https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
# Esperado: HTML com "Você não tem permissão para acessar este conteúdo"
```

### 4. Criar grant via Admin Dashboard
1. Acesse: `https://seu-projeto.vercel.app/auth/admin.html`
2. Login com admin
3. Vá em "Gerenciar Permissões"
4. Conceda acesso ao livro `vivencia_pombogira`

### 5. Acesso com grant (autorizado)
```bash
curl -b cookies.txt https://seu-projeto.vercel.app/livros/vivencia_pombogira.html
# Esperado: HTML completo do livro + watermark com CPF
```

### 6. Verificar audit log
```bash
curl -b cookies.txt "https://seu-projeto.vercel.app/api/audit?userId=admin&limit=10"
# Esperado: JSON com array de logs (login_success, access_granted, etc)
```

---

## 📂 Estrutura de Arquivos Implementada

```
personal_library/
├── api/
│   ├── auth/
│   │   ├── login.js          # POST /api/auth/login (autenticação)
│   │   ├── logout.js         # POST /api/auth/logout (revoga sessão)
│   │   └── validate.js       # GET /api/auth/validate (valida token)
│   ├── users/
│   │   ├── index.js          # GET /api/users (list), POST /api/users (create)
│   │   └── [userId].js       # GET /api/users/{userId}, DELETE /api/users/{userId}
│   ├── grants/
│   │   ├── index.js          # POST /api/grants (conceder/revogar)
│   │   └── [userId].js       # GET /api/grants/{userId} (listar grants)
│   └── audit/
│       └── index.js          # GET /api/audit (logs de auditoria LGPD)
├── auth/
│   ├── db.js                 # Cliente Neon + queries SQL
│   ├── jwt.js                # Geração/validação JWT
│   ├── admin.html            # Dashboard administrativo
│   └── access-denied.html    # Página de acesso negado
├── livros/
│   ├── vivencia_pombogira.html
│   ├── guia_de_ervas.html
│   ├── aula_iansa.html
│   ├── aula_oba.html
│   └── aula_oya_loguna.html
├── scripts/
│   ├── watermark.js          # Marca d'água dinâmica (CPF do usuário)
│   ├── protection.js         # Bloqueio de cópia/print/devtools
│   └── admin.js              # Lógica do dashboard admin
├── middleware.js             # Edge Middleware (authN + authZ)
├── migrate-postgres.js       # Script de migrations
├── seed.js                   # Criação do admin inicial
├── .env.local                # Variáveis de ambiente (local)
├── package.json              # Dependências
└── vercel.json               # Configuração de rotas
```

---

## 🔑 Variáveis de Ambiente (Resumo)

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Connection string do Neon PostgreSQL (com pooling) | `postgresql://neondb_owner:npg_XXX@ep-XXX-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Chave secreta para assinar JWT (gerar com `openssl rand -base64 32`) | `Hy8f3k2J9vLmN4pQ7rS0tU1vW2xY3zA4bC5dE6fG7hI=` |
| `ADMIN_TOKEN` | Token para autenticação no admin dashboard (gerar com `openssl rand -hex 16`) | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `SESSION_TTL_SECONDS` | Tempo de expiração da sessão JWT (24h = 86400) | `86400` |

**⚠️ Segurança:**
- Nunca commitar `.env.local` no Git
- Gerar novos valores para produção (diferentes do dev)
- Rotacionar `JWT_SECRET` periodicamente (invalida sessões antigas)

---

## 🎯 Fluxo Completo de Acesso

```
1. User tenta acessar /livros/vivencia_pombogira.html
   ↓
2. Middleware intercepta a requisição
   ↓
3. Verifica cookie auth_token
   ├─ Não existe → Redirect 302 para /api/auth/login
   └─ Existe → Valida JWT
      ├─ Inválido/expirado → Redirect 302 para /api/auth/login
      └─ Válido → Extrai userId do token
         ↓
4. Consulta BD: SELECT status FROM grants WHERE user_id={userId} AND book_slug='vivencia_pombogira'
   ├─ Não encontrado ou status='revoked' → Redirect 302 para /auth/access-denied.html
   └─ status='active' → Allow
      ↓
5. HTML do livro é servido
   ↓
6. Client-side scripts carregam:
   - watermark.js → Injeta overlay com CPF mascarado
   - protection.js → Bloqueia copy/paste/print/devtools
   ↓
7. Audit log registrado: action='access_granted', book_slug='vivencia_pombogira', timestamp=now()
```

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev                          # Vercel dev server (http://localhost:3000)

# Migrations e seed
node migrate-postgres.js             # Aplicar schema no banco
node seed.js                         # Criar admin inicial

# Deploy
vercel                               # Deploy preview
vercel --prod                        # Deploy production

# Logs
vercel logs                          # Ver logs de produção
vercel logs --follow                 # Tail em tempo real

# Limpar cache local
rm -rf .vercel node_modules
npm install
```

---

## 📖 Próximos Passos

1. **Trocar senha do admin** após primeiro login
2. **Criar usuários reais** via dashboard
3. **Conceder grants** por livro para cada usuário
4. **Monitorar audit logs** (LGPD: 90 dias de retenção)
5. **Configurar alertas** (Vercel Monitoring)
6. **Implementar rate limiting** (próxima iteração)

---

## 🐛 Troubleshooting

### Erro: "Missing env var DATABASE_URL"
**Causa:** `.env.local` não existe ou Vercel não tem as env vars configuradas.  
**Solução:** 
- Local: Criar `.env.local` na raiz com `DATABASE_URL=postgresql://...`
- Vercel: Configurar via Dashboard → Settings → Environment Variables

### Middleware não redireciona
**Causa:** `middleware.js` não está na raiz ou `vercel.json` está incorreto.  
**Solução:** Verificar `middleware.js` na raiz e `vercel.json` com rotas corretas.

### Login retorna 401 "Invalid credentials"
**Causa:** Senha incorreta ou usuário não existe.  
**Solução:** Verificar se `node seed.js` foi executado. Checar se email é `admin@library.local` (lowercase).

### Admin dashboard não carrega usuários
**Causa:** Token expirado ou `ADMIN_TOKEN` incorreto.  
**Solução:** Verificar se `ADMIN_TOKEN` no `.env.local` é o mesmo usado no dashboard (cookie `admin_token`).

### Watermark não aparece
**Causa:** Script `watermark.js` não carregou ou usuário sem CPF.  
**Solução:** Abrir DevTools (F12) → Console → Ver erros. Verificar se `<script src="/scripts/watermark.js">` está no HTML.

---

## 📚 Documentação Relacionada

- **README.md**: Visão geral e setup completo
- **DEPLOYMENT_READY.md**: Guia detalhado de deploy
- **specs/001-login-access-control/spec.md**: Especificação técnica completa
- **specs/001-login-access-control/security-audit.md**: Auditoria de segurança

---

**Status:** ✅ Sistema pronto para produção  
**Última atualização:** 2025-11-25  
**Versão:** 1.0.0


## Passo 6: Seed do Primeiro Admin

Após deploy inicial, execute manualmente um script para criar o admin no banco SQLite:

**seed.js**:
```javascript
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const db = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const adminId = 'admin';
const adminEmail = 'admin@library.local';
const adminPassword = 'changeme123';  // ⚠️ TROCAR APÓS PRIMEIRO LOGIN
const hashedPassword = await bcrypt.hash(adminPassword, 10);

await db.execute(
  `INSERT OR REPLACE INTO users (id, nome, cpf, email, hashedPassword, status, createdAt, lastAccessAt)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [adminId, 'Administrador', '00000000000', adminEmail, hashedPassword, 'active', Date.now(), Date.now()]
);

console.log('✅ Admin criado:', adminEmail, '/', adminPassword);
```

Executar:
```bash
node seed.js
```

---

## Passo 7: Deploy Inicial

```bash
# Commit inicial (antes de implementar funcionalidades)
git add .
git commit -m "chore: setup auth infrastructure (middleware, api structure, vercel config)"
git push origin 001-login-access-control

# Deploy automático via Vercel (se conectado ao GitHub)
# Ou manualmente:
vercel --prod
```

**Resultado**: Site publicado com estrutura básica (arquivos vazios ainda não implementados).

---

## Passo 8: Teste Local (Desenvolvimento)

```bash
# Instalar Vercel CLI (se ainda não instalado)
npm install -g vercel

# Iniciar dev server (emula Edge Middleware + Functions)
vercel dev
```

**Acesso local**: `http://localhost:3000`

**Nota**: Vercel Dev emula KV localmente (storage em memória). Para testar com KV real, use `vercel dev --prod` (requer deploy prévio).

---


## Passo 9: Validar Setup

Checklist de validação:

- [ ] Banco SQLite edge criado e variáveis de ambiente configuradas
- [ ] `package.json` com dependências instaladas
- [ ] Estrutura de pastas criada (`api/`, `auth/`, `scripts/`, `middleware.js`)
- [ ] `vercel.json` configurado
- [ ] Admin seed executado com sucesso
- [ ] Deploy inicial bem-sucedido (pipeline não quebrou)
- [ ] Dev server local rodando (`vercel dev`)

**Teste básico**:
```bash
# Verificar admin criado
sqlite3 <arquivo-local-ou-remote> "SELECT * FROM users WHERE id = 'admin';"
# Esperado: retorno com dados do admin
```

---

## Passo 10: Próximas Etapas (Tasks)

Após setup completo, implementar funcionalidades conforme `tasks.md`:

1. **Middleware**: Validação de sessão + ACL check
2. **APIs**: `/api/auth/*`, `/api/users`, `/api/grants`
3. **Frontend**: `auth/login.html`, `auth/admin.html`
4. **Scripts**: `watermark.js`, `protection.js`, `admin.js`
5. **Leitores**: Modificar `livros/*.html` para incluir auth check + watermark

---


## Troubleshooting

### Erro: "DATABASE_URL is not defined"
**Solução**: Verifique se variáveis de ambiente foram criadas no painel do provedor e sincronizadas localmente (`vercel env pull .env`).

### Erro: "Cannot find module @libsql/client"
**Solução**: Execute `npm install @libsql/client` na raiz do projeto.

### Pipeline quebrou após commit
**Solução**: Verifique `vercel.json` por erros de sintaxe. Confirme que `middleware.js` existe (mesmo vazio, não causará erro).

### Admin login falha
**Solução**: Confirme que seed foi executado corretamente (`curl` comando do Passo 6). Verifique hash bcrypt.

---

## Segurança & Boas Práticas

1. **JWT_SECRET**: Nunca commitar; gerar aleatório; rotacionar periodicamente
2. **ADMIN_TOKEN**: Usar token forte; considerar adicionar rate limiting
3. **Passwords**: Sempre bcrypt (min 10 rounds); nunca plaintext
4. **HTTPS**: Vercel força HTTPS automaticamente; cookies com flag `Secure`
5. **CORS**: Não necessário (mesmo domínio); se necessário, configurar no middleware
6. **Rate Limiting**: Considerar adicionar em `/api/auth/login` (Vercel rate limit middleware)

---


## Recursos Adicionais

- [Turso (SQLite Edge)](https://turso.tech/docs/)
- [@libsql/client (npm)](https://www.npmjs.com/package/@libsql/client)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

## API Reference

Para exemplos completos de uso das APIs (curl, responses, c�digos de erro), consulte:

**[API Reference - Exemplos de Uso](./api-reference.md)**

Endpoints documentados:
- Autentica��o (login, valida��o de sess�o)
- Gerenciamento de usu�rios (listar, criar, obter, deletar)
- Gerenciamento de grants (conceder, revogar, listar)
- Auditoria (registrar eventos, listar logs)

---

## Summary

Setup completo requer:
- Turso SQLite + env vars
- Dependencies via npm
- Estrutura de arquivos (\`api/\`, \`auth/\`, \`scripts/\`, \`middleware.js\`)
- \`vercel.json\` configurado
- Admin seed executado
- Deploy inicial testado

**Tempo estimado**: 15-20 minutos

**Pr�ximo passo**: Implementar \`tasks.md\` (Phase 2)
