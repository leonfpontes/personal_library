# Deploy na Vercel

**Status**: ✅ Projeto 100% funcional em produção  
**URL**: https://personal-library.vercel.app (ou seu domínio custom)

Este repositório está **pronto** e **testado** para publicação na Vercel com autenticação completa.

## ⚠️ Pré-requisitos

- ✅ Banco Neon PostgreSQL provisionado (sa-east-1)
- ✅ Variáveis de ambiente configuradas no Vercel
- ✅ Migrations aplicadas (`node migrate-postgres.js`)
- ✅ Seed executado (`node seed.js`)

## Passos para deploy

### 1. Via Vercel CLI (recomendado)

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Na raiz do projeto
cd personal_library

# Fazer login (primeira vez)
vercel login

# Deploy para preview
vercel

# Deploy para produção
vercel --prod
```

### 2. Via Dashboard da Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique em "Add New Project"
3. Importe o repositório `leonfpontes/personal_library`
4. Vercel detecta automaticamente: **Edge Functions + Middleware**
5. Configure variáveis de ambiente (veja seção abaixo)
6. Clique em "Deploy"

## 🔧 Configuração de Variáveis (CRÍTICO)

**Settings → Environment Variables** no Vercel Dashboard:

| Variable | Example | Environments |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_XXX@ep-XXX-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require` | Production, Preview, Development |
| `JWT_SECRET` | `openssl rand -base64 32` | Production, Preview, Development |
| `ADMIN_TOKEN` | `openssl rand -hex 16` | Production, Preview, Development |
| `SESSION_TTL_SECONDS` | `86400` | Production, Preview, Development |

**⚠️ IMPORTANTE**: Use a URL do Neon **com pooling** (`-pooler` no hostname).

## Configuração Técnica

- **Framework Preset**: Other
- **Build Command**: (vazio - sem build)
- **Output Directory**: `.` (raiz)
- **Install Command**: `npm install`
- **Node Version**: 18.x

## Estrutura

```
personal_library/
├── index.html          # Página principal (livro digital)
├── Source/
│   └── vivencia_pombogira.md  # Conteúdo do manuscrito
├── vercel.json         # Configuração de headers e rotas
└── README.md           # Documentação do projeto
```

## O que foi configurado

### vercel.json
- Headers de segurança (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- URLs limpas sem extensão
- Configuração de trailing slash

### index.html
- Meta tags para SEO (description, author)
- Open Graph para compartilhamento (Facebook, WhatsApp)
- Twitter Cards
- Favicon inline (SVG)
- Temas: light, dark e sepia
- Carregamento client-side do Markdown
- Sumário navegável com busca
- Progresso de leitura

## Domínio customizado (opcional)

Após o deploy, você pode configurar um domínio próprio:

1. No dashboard do projeto na Vercel
2. Settings → Domains
3. Adicione seu domínio (ex.: `vivencia-pombogira.com`)
4. Configure DNS conforme instruções

## Notas

- O site carrega `Source/vivencia_pombogira.md` via fetch
- Funciona offline se o usuário usar o botão "Abrir arquivo"
- Totalmente estático, sem backend ou build
- Otimizado para leitura em qualquer dispositivo
