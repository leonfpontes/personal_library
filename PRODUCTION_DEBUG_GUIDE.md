# Guia de Resolução do Erro 500 em Produção

## Problema
Erro 500 no endpoint `/api/auth/login` em produção (Vercel).

## Causa mais provável
**Variáveis de ambiente não configuradas no Vercel**.

---

## PASSO 1: Fazer merge do PR #4

1. Acesse: https://github.com/leonfpontes/personal_library/pull/4
2. Clique em **Merge pull request**
3. Aguarde o deployment automático do Vercel

---

## PASSO 2: Testar login novamente

1. Acesse seu site em produção
2. Tente fazer login com: `leonfpontes@gmail.com` / `changeme123`
3. Abra o **Console do navegador** (F12 → Console)
4. Observe a resposta do erro 500

### O que você verá:
- **Se DATABASE_URL estiver faltando**: 
  ```json
  {
    "success": false,
    "error": "Server configuration error",
    "detail": "DATABASE_URL not set"
  }
  ```

- **Se JWT_SECRET estiver faltando**:
  ```json
  {
    "success": false,
    "error": "Server configuration error",
    "detail": "JWT_SECRET not set"
  }
  ```

---

## PASSO 3: Verificar variáveis de ambiente no Vercel

### Opção A: Via Dashboard (RECOMENDADO)

1. Acesse: https://vercel.com/dashboard
2. Clique no seu projeto `personal_library`
3. Vá em **Settings** → **Environment Variables**
4. Verifique se estas variáveis existem para **Production**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ADMIN_TOKEN`
   - `SESSION_TTL_SECONDS` (opcional)

### Opção B: Via endpoint debug (se preferir)

1. No terminal local, pegue o valor do ADMIN_TOKEN:
   ```powershell
   Get-Content .env.local | Select-String "ADMIN_TOKEN"
   ```

2. No navegador ou Postman, acesse:
   ```
   GET https://[seu-dominio-vercel].vercel.app/api/debug/check-env
   Authorization: Bearer [seu-ADMIN_TOKEN]
   ```

3. Resposta esperada:
   ```json
   {
     "DATABASE_URL": true,
     "JWT_SECRET": true,
     "ADMIN_TOKEN": true,
     "SESSION_TTL_SECONDS": false,
     "NODE_VERSION": "v18.x.x",
     "VERCEL_ENV": "production"
   }
   ```

---

## PASSO 4: Configurar variáveis faltantes

### Se DATABASE_URL estiver faltando:

1. No Neon Database (https://neon.tech):
   - Vá no seu projeto
   - Clique em **Connection Details**
   - Copie a **Connection string** com "Pooled connection"
   - Exemplo: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`

2. No Vercel Dashboard:
   - Settings → Environment Variables
   - Clique **Add New**
   - Name: `DATABASE_URL`
   - Value: Cole a string de conexão
   - Environment: Marque **Production**
   - Clique **Save**

### Se JWT_SECRET estiver faltando:

1. No terminal local:
   ```powershell
   # Gera um secret aleatório de 64 caracteres
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
   ```

2. No Vercel Dashboard:
   - Settings → Environment Variables
   - Clique **Add New**
   - Name: `JWT_SECRET`
   - Value: Cole o valor gerado
   - Environment: Marque **Production**
   - Clique **Save**

### Se ADMIN_TOKEN estiver faltando:

1. Pegue o valor do seu .env.local:
   ```powershell
   Get-Content .env.local | Select-String "ADMIN_TOKEN"
   ```

2. No Vercel Dashboard:
   - Settings → Environment Variables
   - Clique **Add New**
   - Name: `ADMIN_TOKEN`
   - Value: Cole o valor do .env.local
   - Environment: Marque **Production**
   - Clique **Save**

### Opcional: SESSION_TTL_SECONDS

- Name: `SESSION_TTL_SECONDS`
- Value: `86400` (24 horas)
- Environment: Production

---

## PASSO 5: Redeploy (se necessário)

Após adicionar variáveis, o Vercel pode redeploy automaticamente.

**Se não redeploy automaticamente:**

1. Vercel Dashboard → Deployments
2. Clique nos 3 pontinhos da última deployment
3. Clique **Redeploy**

---

## PASSO 6: Testar novamente

1. Aguarde o deployment terminar (1-2 minutos)
2. Acesse seu site
3. Faça login com: `leonfpontes@gmail.com` / `changeme123`

### ✅ Sucesso esperado:
- Login funciona
- Redireciona para catálogo
- Botão "Painel Admin" aparece (pois você é admin)

---

## PASSO 7: LIMPAR CÓDIGO DEBUG (IMPORTANTE!)

Após resolver, DELETE o arquivo de debug:

1. Local:
   ```powershell
   git checkout main
   git pull origin main
   Remove-Item api\debug\check-env.js
   git add -A
   git commit -m "chore: remove debug endpoint"
   git push origin main
   ```

Ou simplesmente deletar via GitHub:
1. Vá em: https://github.com/leonfpontes/personal_library/blob/main/api/debug/check-env.js
2. Clique no ícone da lixeira (Delete)
3. Commit: "chore: remove debug endpoint"

---

## Troubleshooting adicional

### Se ainda der 500 após configurar variáveis:

1. Acesse Vercel Dashboard → Project → Functions
2. Clique em `/api/auth/login`
3. Veja os logs de Runtime
4. Procure por erros específicos (conexão DB, JWT, etc.)

### Se DATABASE_URL estiver correto mas ainda falhar:

Verifique se a string tem `?sslmode=require` no final:
```
postgresql://user:pass@host/db?sslmode=require
```

### Se nada funcionar:

Me mande:
1. Screenshot da resposta do erro 500 (console do navegador)
2. Screenshot das Environment Variables no Vercel (pode ocultar valores)
3. Screenshot dos Function Logs (se possível)

---

## Resumo rápido

```
1. Merge PR #4
2. Teste login → veja qual variável está faltando
3. Configure variável no Vercel Dashboard
4. Aguarde redeploy
5. Teste login novamente
6. Delete arquivo /api/debug/check-env.js
```

---

## Próximos passos após resolver

Quando o login funcionar em produção, podemos:
- Criar mais usuários via painel admin
- Implementar sistema de grants de acesso a livros
- Adicionar recuperação de senha
- Melhorar segurança (rate limiting, etc.)
