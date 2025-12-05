<!--
Sync Impact Report
- Version: unversioned -> 1.0.0
- Modified principles: template placeholders -> I. Access Control & Edge Enforcement; II. Privacy & LGPD Auditability; III. Content Protection & Anti-Exfiltration; IV. Documentation & Traceable Specs; V. Static Stack Discipline & Operational Simplicity
- Added sections: Operational Constraints; Delivery Workflow & Quality Gates
- Removed sections: none
- Templates requiring updates: OK - .specify/templates/plan-template.md (Constitution Check points to principles); OK - .specify/templates/spec-template.md; OK - .specify/templates/tasks-template.md
- Follow-up TODOs: none
-->

# Personal Library Access Control Constitution

## Core Principles

### I. Access Control & Edge Enforcement (NON-NEGOTIABLE)
All livros HTML são protegidos por autenticação JWT em cookie HttpOnly e autorização por grant individual. O Edge Middleware deve rejeitar qualquer requisição sem sessão válida, revogar sessões expiradas e aplicar redireciono seguro para login. Nenhuma rota nova pode ignorar middleware, e mudanças em ACL exigem testes de caminho feliz e negado.

### II. Privacy & LGPD Auditability
Dados pessoais (CPF, IP) devem ser minimizados, mascarados e/ou hasheados; retenção de logs limitada a 90 dias. Consentimento precisa ser registrado em fluxo de cadastro. Auditoria é obrigatória para login, acesso e cópia; exports de dados ou novos campos pessoais precisam de justificativa LGPD e documentação de retenção.

### III. Content Protection & Anti-Exfiltration
Watermark dinâmico com CPF, bloqueio de cópia, print e devtools e proteção contra download direto são obrigatórios em todos os livros. Qualquer novo reader deve manter mesma proteção (overlay, handlers de teclado ou mouse, desabilitar seleção). Falhas de proteção bloqueiam release.

### IV. Documentation & Traceable Specs
Cada mudança nasce de um spec em specs/[###-feature]/spec.md, com plano (plan.md) e tasks (tasks.md) vinculados. Atualizações de segurança, ACL ou conteúdo sensível devem ter rastreabilidade explícita (link para spec ou issue) e documentação em Português, mantendo a estrutura de diretórios atual.

### V. Static Stack Discipline & Operational Simplicity
Frontend permanece HTML, CSS e JS puro (sem build ou bundler). Backend segue Vercel Edge Functions, Neon Postgres e Node 18+. Evite dependências novas sem justificativa; prefira soluções simples e auditáveis. URLs limpas, tipografia consistente e configuração via variáveis de ambiente são obrigatórios em todos os ambientes.

## Operational Constraints
Stack fixo: Vercel Edge, Neon Postgres (sa-east-1), Node 18+. JWT_SECRET e ADMIN_TOKEN devem ser gerados fortes e rotacionados conforme checklists de deploy; sessões expiram em 24h. ACL é por livro e deve existir grant explícito por usuário. Auditoria LGPD retém 90 dias; export ou import de dados precisa de aprovação e plano de sanitização. Conteúdo de livros permanece em Português e sem build pipeline.

## Delivery Workflow & Quality Gates
Antes de pesquisa ou implementação, executar Constitution Check no plano e registrar riscos. Cada spec deve definir histórias independentes e testes de autenticação, ACL e anti-cópia. Novas rotas exigem contratos e testes (happy e forbidden). Qualquer mudança de livro deve preservar watermark, bloqueios e breadcrumbs de navegação. Deploy requer validação de middleware, grants e scripts de migração; produção só com ambientes completos e revisão de segurança.

## Governance
Esta constituição rege decisões de arquitetura, segurança, privacidade e documentação. Alterações exigem justificativa, revisão e atualização de templates quando aplicável. Versionamento segue semver: MAJOR para mudanças incompatíveis de princípios, MINOR para novos princípios ou seções, PATCH para ajustes textuais. Revisões de código e planos devem confirmar aderência a todos os princípios e constraints antes de merge ou deploy. Em caso de conflito, esta constituição prevalece sobre outros guias locais.

**Version**: 1.0.0 | **Ratified**: 2025-12-05 | **Last Amended**: 2025-12-05
