# Pipeline de Sucesso (Vercel)

## Critérios

- Sem build: apenas HTML/CSS/JS estáticos; APIs em `api/**/*.js`.
- Edge Functions: `runtime=nodejs18.x` e respostas em warm < 300ms.
- Middleware presente (`middleware.js`) sem bloquear rotas públicas.
- Headers de segurança aplicados via `vercel.json`.
- Rota `livros/*` com `Cache-Control: private, no-cache, no-store`.

## Verificações

1. Variáveis de ambiente
   - `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `JWT_SECRET`, `ADMIN_TOKEN`.
2. Dependências instaladas (`package.json`).
3. Estrutura de pastas criada: `api/`, `auth/`, `scripts/`, `livros/`.
4. Seed de admin executado (`node seed.js`).
5. Deploy de preview: `vercel --prod` ou GitHub → Vercel.
6. Teste de login e acesso protegido em preview.
7. Auditoria: `/api/audit/track` aceita eventos.

## Medições

- Marca d'água: render em < 300ms (medir `performance.now()` no `DOMContentLoaded`).
- Middleware: resposta de validação em < 150ms (warm) — medir em logs.

## Remediação

- Ajustar `@media print` se conteúdo aparecer impresso.
- Revisar bloqueios se navegadores atualizados mudarem comportamento.
- Aumentar TTL de sessão ou otimizar consultas/índices no SQLite.
