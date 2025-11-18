# Deploy na Vercel

Este repositório está pronto para publicação na Vercel.

## Passos para deploy

### 1. Via Vercel CLI (recomendado)

```bash
# Instalar Vercel CLI (se ainda não tiver)
npm i -g vercel

# Na raiz do projeto
cd c:\Users\Educacross\Documents\personal_library

# Fazer login (primeira vez)
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 2. Via Dashboard da Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe o repositório `leonfpontes/personal_library`
4. Vercel detecta automaticamente que é um site estático
5. Clique em "Deploy"

## Configuração

- **Framework Preset**: Nenhum (site estático)
- **Build Command**: (vazio)
- **Output Directory**: `.` (raiz)
- **Install Command**: (vazio, não há dependências)

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
