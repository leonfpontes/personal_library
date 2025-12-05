<!--
Sync Impact Report
- Version: 1.0.0 -> 1.0.1
- Modified principles: I. Access Control & Edge Enforcement (middleware + admin scope clarificado); II. Privacy & LGPD Auditability (mascaramento/retencao reforçados); III. Content Protection & Anti-Exfiltration (leitores vinculados aos scripts); Operational Constraints (regex de rota, rotação de env vars); Delivery Workflow & Quality Gates (testes agora exigem allow/deny + anti-cópia)
- Added sections: none
- Removed sections: none
- Templates requiring updates: ✅ .specify/templates/plan-template.md (Constitution Check gates ampliados); ✅ .specify/templates/spec-template.md (nota de segurança/LGPD adicionada); ✅ .specify/templates/tasks-template.md (tasks destacam auth + proteção obrigatória)
- Follow-up TODOs: none
-->

# Personal Library Access Control Constitution

## Core Principles

### I. Access Control & Edge Enforcement (NON-NEGOTIABLE)
Todos os livros HTML, APIs e páginas administrativas são protegidos por autenticação JWT em cookie HttpOnly e autorização por grant individual. O Edge Middleware e as funções do diretório `api/` devem recusar qualquer requisição sem sessão válida, revogar sessões expiradas, aplicar redireciono seguro para login e validar grants por livro. Nenhuma rota nova (incluindo admin UI e endpoints auxiliares) pode ignorar middleware, e mudanças em ACL exigem testes de caminho feliz e negado.

### II. Privacy & LGPD Auditability
Dados pessoais (CPF, IP) devem ser minimizados, mascarados e/ou hasheados; retenção de logs limitada a 90 dias conforme README e `audit_log` schema. Consentimento precisa ser registrado no fluxo de cadastro. Auditoria é obrigatória para login, acesso e cópia; exports de dados ou novos campos pessoais exigem justificativa LGPD, documentação de retenção e plano de sanitização.

### III. Content Protection & Anti-Exfiltration
Watermark dinâmico com CPF, bloqueio de cópia/print/devtools e proteção contra download direto são obrigatórios em todos os livros. Qualquer novo reader deve importar `scripts/watermark.js` e `scripts/protection.js`, manter overlay, handlers de teclado/mouse e desabilitar seleção. Falhas de proteção bloqueiam release e devem ter testes (manual ou automatizados) para copiar/imprimir e para overlay visível.

### IV. Documentation & Traceable Specs
Cada mudança nasce de um spec em specs/[###-feature]/spec.md, com plano (plan.md) e tasks (tasks.md) vinculados. Atualizações de segurança, ACL ou conteúdo sensível devem ter rastreabilidade explícita (link para spec ou issue) e documentação em Português, mantendo a estrutura de diretórios atual.

### V. Static Stack Discipline & Operational Simplicity
Frontend permanece HTML, CSS e JS puro (sem build ou bundler). Backend segue Vercel Edge Functions, Neon Postgres e Node 18+. Evite dependências novas sem justificativa; prefira soluções simples e auditáveis. URLs limpas (regex de `vercel.json` para `/livros/slug` e `/livros/slug.html`), tipografia consistente e configuração via variáveis de ambiente são obrigatórias em todos os ambientes.

## Operational Constraints
Stack fixo: Vercel Edge, Neon Postgres (sa-east-1), Node 18+. JWT_SECRET e ADMIN_TOKEN devem ser gerados fortes e rotacionados conforme checklists de deploy; sessões expiram em 24h. ACL é por livro e deve existir grant explícito por usuário. Auditoria LGPD retém 90 dias; export ou import de dados precisa de aprovação e plano de sanitização. Rotas de livros devem permanecer estáticas (HTML) e protegidas pelo middleware e regex do `vercel.json`; conteúdo permanece em Português e sem build pipeline.

## Delivery Workflow & Quality Gates
Antes de pesquisa ou implementação, executar Constitution Check no plano e registrar riscos. Cada spec deve definir histórias independentes e testes de autenticação (feliz/negado), ACL e anti-cópia (copy/print/devtools). Novas rotas exigem contratos e testes (happy e forbidden). Qualquer mudança de livro deve preservar watermark, bloqueios e breadcrumbs de navegação. Deploy requer validação de middleware, grants, scripts de migração, env vars rotacionadas e smoke de overlay/anti-cópia; produção só com ambientes completos e revisão de segurança.

## Governance
Esta constituição rege decisões de arquitetura, segurança, privacidade e documentação. Alterações exigem justificativa, revisão e atualização de templates quando aplicável. Versionamento segue semver: MAJOR para mudanças incompatíveis de princípios, MINOR para novos princípios ou seções, PATCH para ajustes textuais. Revisões de código e planos devem confirmar aderência a todos os princípios e constraints antes de merge ou deploy. Em caso de conflito, esta constituição prevalece sobre outros guias locais.

**Version**: 1.0.1 | **Ratified**: 2025-12-05 | **Last Amended**: 2025-12-05
