# 🚀 Como Rodar o Projeto Personal Library

**Guia passo a passo para desenvolvedores**  
**Status**: ✅ Projeto 100% funcional em produção  
**Última Atualização**: 26 Nov 2025

---

## 📋 Pré-requisitos

Antes de começar, certifique-se que você tem:

- ✅ **Node.js 18+** instalado ([baixar aqui](https://nodejs.org))
- ✅ **Git** instalado
- ✅ **Conta Vercel** (para deploy) → [criar conta gratuita](https://vercel.com/signup)
- ✅ **Banco Neon PostgreSQL** provisionado (região sa-east-1, tier gratuito disponível)

---

## 🏁 Setup Completo (Local Development)

### Passo 1: Clonar o repositório

```bash
git clone https://github.com/leonfpontes/personal_library.git
cd personal_library
```

---

### Passo 2: Instalar dependências

```bash
npm install
```

**Pacotes instalados:**
- `@neondatabase/serverless` - Cliente PostgreSQL para Neon
- `jsonwebtoken` - Geração e validação de JWT
- `bcryptjs` - Hash de senhas
- `uuid` - Geração de IDs únicos

---

### Passo 3: Configurar banco de dados

#### Opção A: Usar banco existente (Neon)

Se você já tem um banco Neon provisionado, copie a connection string:

```env
# .env.local (já existe no projeto)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@HOST-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=Hy8f3k2J9vLmN4pQ7rS0tU1vW2xY3zA4bC5dE6fG7hI=
ADMIN_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
SESSION_TTL_SECONDS=86400
```

**⚠️ Atenção:** Use a URL **com pooling** (hostname termina em `-pooler`).

#### Opção B: Criar novo banco Neon

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Clique em **"New Project"**
3. Nome: `personal-library`
4. Região: **South America (São Paulo) - sa-east-1**
5. Clique **"Create Project"**
6. Copie a **"Connection String"** (com pooling)
7. Cole no `.env.local` como `DATABASE_URL`

---

### Passo 4: Aplicar migrations (criar tabelas)

```bash
node migrate-postgres.js
```

**Saída esperada:**
```
🔌 Testando conexão...
✅ Conexão OK

📋 Criando tabelas e índices...
   → users table...
   → users indexes...
   → grants table...
   → grants indexes...
   → sessions table...
   → sessions indexes...
   → audit_log table...
   → audit_log indexes...

✅ Migrations aplicadas com sucesso!

📊 Verificando tabelas criadas...
   Tabelas encontradas:

🎉 Pronto! Agora execute: node seed.js
```

**Se der erro:**
- Verifique se `DATABASE_URL` no `.env.local` está correto
- Verifique se o banco Neon está rodando (não pausado)
- Verifique conexão com internet

---

### Passo 5: Criar usuário administrador

```bash
node seed.js
```

**Saída esperada:**
```
✅ Admin criado: admin@library.local / changeme123
```

**Credenciais do admin:**
- **Email:** `admin@library.local`
- **Senha:** `changeme123`
- **⚠️ TROCAR após primeiro login!**

---

### Passo 6: Rodar servidor local

```bash
npm run dev
```

**Saída esperada:**
```
Vercel CLI 28.x.x
> Ready! Available at http://localhost:3000
```

**URLs disponíveis:**
- **Biblioteca:** http://localhost:3000
- **Admin:** http://localhost:3000/auth/admin.html
- **API Login:** http://localhost:3000/api/auth/login (POST)

---

## 🧪 Testando Localmente

### 1. Acessar página inicial

Abra o navegador em: **http://localhost:3000**

**Esperado:** Lista de livros da biblioteca.

---

### 2. Tentar acessar livro sem login

Clique em qualquer livro (ex: "Os Mistérios de Pombogira").

**Esperado:** Redirect automático para `/api/auth/login` (página de erro JSON ou HTML).

---

### 3. Fazer login no admin

1. Acesse: **http://localhost:3000/auth/admin.html**
2. Clique em **"Login"** no topo
3. Digite:
   - Email: `admin@library.local`
   - Senha: `changeme123`
4. Clique **"Entrar"**

**Esperado:** Redirect para dashboard admin com menu de usuários e permissões.

---

### 4. Criar um novo usuário

1. No dashboard admin, clique **"Criar Novo Usuário"**
2. Preencha:
   - Nome: `João Silva`
   - Email: `joao@test.com`
   - CPF: `12345678901`
   - Senha: `senha123`
3. Clique **"Criar"**

**Esperado:** Usuário aparece na lista (CPF mascarado: `123***01`).

---

### 5. Conceder acesso a um livro

1. Vá em **"Gerenciar Permissões"** no admin
2. Selecione o usuário `joao@test.com`
3. Selecione o livro `vivencia_pombogira`
4. Clique **"Conceder Acesso"**

**Esperado:** Grant criado com status "Ativo".

---

### 6. Fazer logout do admin e login com usuário criado

1. Clique **"Logout"** no admin
2. Volte para: **http://localhost:3000**
3. Tente acessar o livro "Os Mistérios de Pombogira"
4. Faça login com:
   - Email: `joao@test.com`
   - Senha: `senha123`

**Esperado:** Livro carrega completo com watermark mostrando CPF mascarado no canto inferior direito.

---

### 7. Testar proteções

Com o livro aberto:

- **Tente copiar texto:** Bloqueado (Ctrl+C não funciona)
- **Tente abrir DevTools:** Bloqueado (F12 desabilitado)
- **Tente imprimir:** Bloqueado (Ctrl+P mostra página em branco)
- **Tente selecionar texto:** Bloqueado (cursor não seleciona)

**Esperado:** Todas as tentativas bloqueadas.

---

### 8. Verificar audit log

1. Volte para o admin: **http://localhost:3000/auth/admin.html**
2. Login com admin
3. Vá em **"Logs de Auditoria"**
4. Filtre por usuário `joao@test.com`

**Esperado:** Ver logs de:
- `login_success` (quando João fez login)
- `access_granted` (quando acessou o livro)

---

## 🌐 Deploy para Produção

### Passo 1: Conectar com Vercel

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Conectar projeto
vercel
```

---

### Passo 2: Configurar env vars na Vercel

1. Acesse: **[Vercel Dashboard](https://vercel.com/dashboard)**
2. Selecione o projeto
3. Vá em **Settings → Environment Variables**
4. Adicione cada variável (marque Production + Preview + Development):

```
DATABASE_URL=postgresql://...
JWT_SECRET=(gerar novo: openssl rand -base64 32)
ADMIN_TOKEN=(gerar novo: openssl rand -hex 16)
SESSION_TTL_SECONDS=86400
```

**⚠️ IMPORTANTE:** Gere novos valores de `JWT_SECRET` e `ADMIN_TOKEN` para produção!

---

### Passo 3: Deploy

```bash
# Deploy da branch atual (preview)
vercel

# OU: Deploy direto para produção
vercel --prod

# OU: Push para Git (deploy automático)
git add .
git commit -m "feat: ready for production"
git push origin 001-login-access-control
```

**Vercel fará deploy automático em ~30-60s.**

---

### Passo 4: Aplicar migrations em produção

**Via Neon Dashboard:**

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione o projeto
3. Clique em **SQL Editor**
4. Copie e cole o conteúdo de `migrations-postgres.sql`
5. Clique **Run**

**Via CLI (alternativa):**

```bash
# Apontar para banco de produção
DATABASE_URL="postgresql://..." node migrate-postgres.js
DATABASE_URL="postgresql://..." node seed.js
```

---

### Passo 5: Testar em produção

Acesse a URL do deploy: `https://seu-projeto.vercel.app`

Repita os testes locais:
- Login admin
- Criar usuário
- Conceder grant
- Acessar livro
- Verificar proteções
- Verificar audit log

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento local
npm run dev                   # Vercel dev server

# Database
node migrate-postgres.js      # Aplicar schema
node seed.js                  # Criar admin

# Deploy
vercel                        # Deploy preview
vercel --prod                 # Deploy production

# Logs
vercel logs                   # Ver logs de produção
vercel logs --follow          # Tail em tempo real

# Limpar cache
rm -rf .vercel node_modules
npm install
```

---

## 🐛 Problemas Comuns

### "Missing env var DATABASE_URL"

**Causa:** `.env.local` não existe ou não está na raiz.

**Solução:**
```bash
# Verificar se existe
ls .env.local

# Se não existir, criar:
cp .env.local.example .env.local  # (se tiver exemplo)
# OU editar manualmente
```

---

### "relation 'users' does not exist"

**Causa:** Migrations não foram aplicadas.

**Solução:**
```bash
node migrate-postgres.js
```

---

### Middleware não redireciona

**Causa:** `middleware.js` não está na raiz ou deploy não pegou o arquivo.

**Solução:**
```bash
# Verificar se arquivo existe
ls middleware.js

# Se existir, fazer novo deploy
vercel --prod --force
```

---

### Admin dashboard não carrega usuários

**Causa:** Token expirado ou `ADMIN_TOKEN` incorreto.

**Solução:**
1. Verificar se `ADMIN_TOKEN` no `.env.local` é o mesmo usado no dashboard
2. Limpar cookies do navegador
3. Fazer login novamente

---

### Watermark não aparece

**Causa:** Script `watermark.js` não carregou ou usuário sem CPF.

**Solução:**
1. Abrir DevTools (F12)
2. Ir em **Console**
3. Verificar erros de carregamento
4. Verificar se `<script src="/scripts/watermark.js">` está no HTML

---

## 📚 Documentação Completa

- **README.md** - Visão geral e arquitetura
- **specs/001-login-access-control/quickstart.md** - Setup detalhado
- **specs/001-login-access-control/spec.md** - Especificação técnica
- **DEPLOYMENT_READY.md** - Guia de deploy avançado

---

## 🎯 Checklist de Sucesso

**Local:**
- [ ] `npm install` executado com sucesso
- [ ] `.env.local` configurado com DATABASE_URL correto
- [ ] `node migrate-postgres.js` criou 4 tabelas
- [ ] `node seed.js` criou admin
- [ ] `npm run dev` rodando em http://localhost:3000
- [ ] Login admin funcionando
- [ ] Usuário criado via dashboard
- [ ] Grant concedido
- [ ] Livro acessível com watermark
- [ ] Proteções funcionando (cópia bloqueada, DevTools bloqueado)

**Produção:**
- [ ] Projeto conectado na Vercel
- [ ] Env vars configuradas no Dashboard
- [ ] Deploy realizado com sucesso
- [ ] Migrations aplicadas no banco de produção
- [ ] Seed executado (admin criado)
- [ ] URL pública acessível
- [ ] Login funcionando em produção
- [ ] Proteções ativas
- [ ] Audit log registrando ações

---

**🎉 Parabéns! Sistema rodando com sucesso!**

**Próximos passos:**
1. Trocar senha do admin
2. Criar usuários reais
3. Conceder acesso aos livros
4. Monitorar logs de auditoria
5. Configurar domínio custom (opcional)

---

**Dúvidas?** Consulte a documentação completa no diretório `specs/`.
