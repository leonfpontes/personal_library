# Tasks: Login e Controle de Acesso da Biblioteca

## Phase 1: Setup
- [X] T001 Criar banco SQLite edge/serverless (Turso, Deno KV, LiteFS) - Banco Turso provisionado, migrations em MIGRATION_MANUAL.md
- [X] T002 Configurar variáveis de ambiente (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `JWT_SECRET`, `ADMIN_TOKEN`) - Configuradas em .env.local, instruções para Vercel em DEPLOYMENT_READY.md
- [X] T003 Instalar dependências: `@libsql/client`, `jsonwebtoken`, `bcryptjs`, `uuid`
- [X] T004 Criar estrutura de pastas e arquivos base (`api/`, `auth/`, `scripts/`, `middleware.js`, etc.)
- [X] T005 Criar/atualizar `vercel.json` para funções e rotas

## Phase 2: Fundacional
- [X] T006 Criar script de seed para admin inicial no banco SQLite
- [X] T007 Criar migrations SQL para tabelas: users, grants, sessions, audit_log
- [X] T008 Implementar conexão utilitária com SQLite edge em `auth/db.js` ou similar

## Phase 3: User Story 1 (P1) — Leitura com marca d’água
- [X] T009 [US1] Implementar login (`api/auth/login.js`) — autenticação, JWT, bcrypt
- [X] T010 [US1] Implementar middleware de sessão e ACL (`middleware.js`)
- [X] T011 [US1] Implementar validação de permissão por livro (grant) no middleware
- [X] T012 [US1] Modificar leitores HTML (`livros/*.html`) para exigir login e injetar marca d’água
- [X] T013 [US1] Implementar `scripts/watermark.js` (renderização dinâmica do nome+CPF)
- [X] T014 [US1] Implementar `scripts/protection.js` (bloqueio de seleção, cópia, impressão, printscreen best-effort)
- [X] T015 [US1] Mensagens de erro e interface em pt-BR

## Phase 4: User Story 2 (P2) — Administração de usuários e concessões
- [X] T016 [US2] Implementar cadastro de usuário (`api/users/index.js` POST)
- [X] T017 [US2] Implementar listagem de usuários (`api/users/index.js` GET)
- [X] T018 [US2] Implementar concessão/revogação de acesso (`api/grants/index.js` POST)
- [X] T019 [US2] Implementar listagem de concessões por usuário (`api/grants/[userId].js` GET)
- [X] T020 [US2] Criar painel admin (`auth/admin.html`, `scripts/admin.js`)
 
 
## Phase 5: User Story 3 (P3) — Revogação de acesso

- [X] T021 [US3] Ajustar endpoint único de concessão/revogação (já em T018) para garantir idempotência e atualização imediata (status=revoked)
- [X] T022 [US3] Garantir que revogação bloqueia acesso imediatamente (middleware/session revalidação)
- [X] T023 [US3] Mensagem de acesso negado clara no leitor

 
## Phase 6: Auditoria, segurança e polish

- [X] T024 Implementar tabela e endpoints de auditoria mínima (login, acesso, tentativas de cópia/impressão)
- [X] T025 Garantir que dados sensíveis não vazam em URLs, títulos ou requisições externas
- [X] T026 Validar CPF (formato 11 dígitos) e consentimento no cadastro
- [ ] T027 Testar pipeline Vercel (deploy, publish, sem quebras)
- [X] T028 Revisar e documentar todos os endpoints e scripts
 
## Phase 7: Compliance e Refinamentos

- [X] T029 Definir critérios objetivos de proteção (lista de eventos bloqueados + fallback documentado)
- [X] T030 Implementar detecção best-effort de PrintScreen (key events / blur heurística) + log `copy_attempt`
- [X] T031 Implementar máscara de CPF na marca d'água (ex.: 123***01) + ajustar script watermark
- [X] T032 Logging de consentimento: armazenar `consent_at` e não permitir criação sem checkbox
- [X] T033 Catálogo de mensagens pt-BR (JSON) com códigos e textos padronizados (erro, acesso negado, proteção)
- [X] T034 Critérios de sucesso do pipeline: documento de verificação (lista: build ausente, funções edge respondem <300ms em warm) e ajuste se necessário
- [X] T035 Job/rotina de limpeza (sessions expiradas, audit >90d) script manual (`scripts/cleanup.js`)
- [X] T036 Verificação de performance watermark (injeção <300ms) medição e ajuste
- [X] T037 [FR-008] Implementar detecção de offline/cache e bloquear conteúdo sem sessão válida (verificar `navigator.onLine`, bloquear render se sessão ausente, exibir mensagem pt-BR)
- [X] T038 [FR-015] Validar opacidade da marca d'água não excede 15% (teste visual + ajuste CSS se necessário)

---

### Dependências

- Fases são sequenciais, mas tasks dentro de cada fase podem ser paralelizadas se não houver dependência explícita (ex: T009/T010/T011 podem ser feitas em paralelo após setup).

### MVP

- Fases 1, 2 e 3 (até T015) entregam o MVP: login, leitura protegida, marca d’água, proteção básica.
- Fases 4 e 5 completam controle administrativo e revogação.
- Fases 6 e 7 agregam auditoria, compliance, refinamentos e métricas.
