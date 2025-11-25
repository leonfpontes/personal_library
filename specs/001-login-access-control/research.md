# Research: Login e Controle de Acesso da Biblioteca

**Date**: 2025-11-25  
**Purpose**: Resolver clarificações técnicas e definir abordagem de implementação

## Clarifications from Spec

### 1. Backend permitido? (FR-002, Constituição)

**Question**: A constituição estabelece "site estático sem código de servidor". Autenticação e ACL requerem backend. Qual abordagem usar?

**Options Evaluated**:

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **A. Vercel Edge Middleware + KV** | Auth real, ACL seguro, pipeline mantido, sem build | Requer emenda à constituição; custo Vercel Pro | ✅ **RECOMMENDED** |
| B. Managed Auth (Auth0, Clerk) | Sem código no repo; forte segurança | Custo mensal; vendor lock-in; complexidade de integração | ❌ Rejected: custo/complexidade |
| C. Client-side puro (localStorage) | Sem backend; 100% estático | Sem segurança real; tokens no browser; não atende FR-003/FR-009 | ❌ Rejected: não atende requisitos |

**Decision**: **Approach A — Vercel Edge Middleware + Vercel KV**

**Rationale**:
- Edge Middleware intercepta requisições antes do render, validando sessão/ACL
- Vercel KV (Redis) armazena usuários/concessões/sessões com TTL
- Pipeline Vercel mantido: commit → deploy automático (middleware/KV são recursos da plataforma)
- Sem build: HTML/CSS/JS permanecem estáticos; middleware é serverless gerenciado
- Custo: Vercel Pro (~$20/mês) para Edge Middleware + KV (~$0.50/100k reads)

**Constituição Impact**: Requer **emenda MINOR (1.1.0)** ou exceção documentada para permitir "serverless da plataforma de hospedagem (Vercel Edge/Functions)" sem violar "sem código de servidor" (interpretado como "sem servidor próprio/Docker/VM").

**Alternatives Considered**: Firebase Auth, Supabase Auth, static JSON + obfuscation (todos rejeitados por custo, complexidade ou falta de segurança).

---

### 2. Escopo de proteção de conteúdo (FR-005 a FR-007)

**Question**: Aceitamos proteção client-side de melhor esforço, sabendo que 100% de prevenção (incluindo fotos/devtools) é impossível?

**Technical Reality**:
- **Impossível prevenir**: fotos de tela física, máquinas virtuais, extensões de browser, devtools, OCR
- **Best-effort possível**: bloqueio de seleção, copy/paste, print CSS, contextmenu, keyboard shortcuts

**Recommended Approach**:

| Protection | Implementation | Effectiveness | User Impact |
|------------|----------------|---------------|-------------|
| **Watermark overlay** | CSS absolute positioned div, repetido, opacidade 10-15%, pointer-events: none | ⭐⭐⭐⭐⭐ Sempre visível em fotos | Baixo (transparente) |
| **Disable text selection** | `user-select: none`, `-webkit-touch-callout: none` | ⭐⭐⭐ Bloqueado (bypassável via devtools) | Nenhum |
| **Block copy/paste** | `oncopy`, `oncut`, `onpaste` preventDefault + `document.addEventListener` | ⭐⭐⭐ Bloqueado (bypassável via devtools) | Nenhum |
| **Block print** | `@media print { body { display: none; } }` + `onbeforeprint` handler | ⭐⭐⭐⭐ Bloqueado (bypassável via devtools/PDF) | Nenhum |
| **Block context menu** | `oncontextmenu` preventDefault | ⭐⭐ Bypassado facilmente | Nenhum |
| **Block keyboard shortcuts** | `onkeydown` preventDefault (Ctrl+C/P/S/U, F12) | ⭐⭐ Bypassado via menu/devtools | Nenhum |
| **PrintScreen detection** | ⚠️ **Não confiável** (apenas Windows via clipboard API; macOS/Linux não suportam) | ⭐ Muito limitado | N/A |

**Decision**: **Best-effort protection bundle** (watermark + selection/copy/print blocks)

**Rationale**:
- Marca d'água é a **proteção mais efetiva**: sempre presente em capturas
- Bloqueios JS são **deterrentes**: dificultam cópia casual, mas não impedem usuários determinados
- Solução **pragmática**: atende FR-005 a FR-007 com reconhecimento de limitações técnicas
- UX mantida: proteções são invisíveis até tentativa de cópia

**Acceptance Criteria Updated**: SC-003 revisado para "95% das tentativas usuais bloqueadas em navegadores suportados, reconhecendo que devtools/extensões/fotos podem contornar"

**Not Implemented**: DRM/EME (overkill), PrintScreen detection universal (tecnicamente impossível), telemetria agressiva (privacidade).

---

### 3. CPF: Validação, Consentimento, Retenção (FR-001, FR-013)

**Question**: Regras de validação, consentimento, e por quanto tempo reter CPF?

**Options Evaluated**:

| Approach | Validation | Storage | Retention | Consent |
|----------|------------|---------|-----------|---------|
| **A. Validate format + hash** | Dígitos verificadores | Hash (SHA-256) | Até revogação manual | Termo ao cadastrar |
| **B. Format only + plaintext** | 11 dígitos numéricos | Plaintext | 12 meses | Termo ao cadastrar |
| **C. Session-only** | Nenhuma | Não persiste | Session end | Aviso ao login |

**Decision**: **Approach B — Format validation + plaintext storage + 12 meses retention**

**Rationale**:
- **Validação formato**: 11 dígitos numéricos, regex `^\d{11}$` (sem validação de dígito verificador por simplicidade inicial)
- **Storage plaintext**: CPF exibido na marca d'água; hash complicaria UX sem ganho real (sistema interno, não público)
- **Retention**: 12 meses desde último acesso ou revogação manual pelo admin
- **Consent**: Checkbox obrigatório no cadastro: "Autorizo o uso de meu CPF e nome para identificação em marca d'água nas páginas acessadas, conforme Termo de Uso"

**LGPD Considerations**:
- **Base legal**: Legítimo interesse (proteção de direitos autorais) + consentimento
- **Finalidade**: Identificação em marca d'água para dissuadir reprodução não autorizada
- **Minimização**: Apenas nome + CPF coletados; sem outras informações pessoais
- **Transparência**: Termo de Uso explica propósito e retenção
- **Direitos**: Admin pode excluir usuário e dados a qualquer momento

**Implementation Notes**:
- Campo CPF: `<input type="text" pattern="\d{11}" required>`
- Validação JS: `if (!/^\d{11}$/.test(cpf)) { alert("CPF inválido"); return; }`
- Storage: `users[id] = { nome, cpf, hashedPassword, grants: [], createdAt, lastAccessAt }`
- Watermark: `${user.nome} — CPF: ${user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}`

**Future Enhancement**: Validação completa de dígitos verificadores (algoritmo módulo 11) se necessário.

---

## Technology Stack Decisions

### Authentication & Session Management

**Choice**: Vercel Edge Middleware + JWT + Vercel KV

**Implementation**:
1. **Login flow**:
   - User submits email/password → `POST /api/auth/login`
   - Edge Function valida credenciais (bcrypt) no Vercel KV
   - Retorna JWT (signed, 24h expiry) + HttpOnly cookie
   
2. **Session validation**:
   - Edge Middleware (`middleware.js`) intercepta requests para `/livros/*`
   - Valida JWT do cookie
   - Busca grants do usuário no KV
   - Se autorizado para livro: inject user data via header/cookie → página renderiza
   - Se não autorizado: redirect `/auth/login.html?redirect=/livros/...`

3. **Data storage** (Vercel KV):
   ```js
   // Keys
   user:{userId}                // { nome, cpf, email, hashedPassword, createdAt }
   grants:{userId}              // Set of book slugs
   session:{sessionId}          // { userId, expiresAt }
   book:{bookSlug}:users        // Set of userIds with access
   ```

**Libraries**:
- `jsonwebtoken` (JWT signing/verify) via Edge Function
- `bcryptjs` (password hashing) via Edge Function
- Native `crypto.subtle` para hash session IDs

**Alternatives Rejected**:
- LocalStorage/SessionStorage: inseguro, não atende requisitos
- Cookies sem HttpOnly: XSS vulnerable
- Basic Auth: sem logout, sem grants management

---

### Content Protection

**Choice**: Inline JavaScript + CSS (no external libraries)

**Watermark Rendering**:
```js
// watermark.js (inline no <head> de cada leitor)
function renderWatermark(nome, cpf) {
  const container = document.createElement('div');
  container.id = 'watermark-layer';
  container.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    pointer-events: none; z-index: 9999; overflow: hidden;
  `;
  
  const text = `${nome} — CPF: ${cpf}`;
  const rows = Math.ceil(window.innerHeight / 150);
  const cols = Math.ceil(window.innerWidth / 300);
  
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const mark = document.createElement('div');
      mark.textContent = text;
      mark.style.cssText = `
        position: absolute;
        top: ${r * 150 + 50}px; left: ${c * 300 + 50}px;
        color: rgba(0,0,0,0.12); font: 12px monospace;
        transform: rotate(-30deg); white-space: nowrap;
      `;
      container.appendChild(mark);
    }
  }
  
  document.body.appendChild(container);
}

// Chamado após validação de sessão
const userData = JSON.parse(sessionStorage.getItem('user')); // injected by middleware
renderWatermark(userData.nome, userData.cpf);
```

**Protection Bundle**:
```js
// protection.js (inline no <head>)
(function() {
  // Disable text selection
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';
  
  // Block copy/cut/paste
  ['copy', 'cut', 'paste'].forEach(evt => {
    document.addEventListener(evt, e => {
      e.preventDefault();
      alert('Ação bloqueada por política de proteção de conteúdo.');
    });
  });
  
  // Block context menu
  document.addEventListener('contextmenu', e => e.preventDefault());
  
  // Block keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey) {
      if (['c','x','s','p','u'].includes(e.key.toLowerCase()) || e.keyCode === 123) {
        e.preventDefault();
        alert('Atalho bloqueado por política de proteção de conteúdo.');
      }
    }
  });
  
  // Block print
  window.addEventListener('beforeprint', e => {
    document.querySelector('main').style.display = 'none';
  });
  window.addEventListener('afterprint', e => {
    document.querySelector('main').style.display = 'block';
  });
})();
```

**CSS Protection**:
```css
/* protection.css */
@media print {
  body { display: none !important; }
  body::before {
    content: "Impressão não autorizada. Marca d'água: [USER_DATA]";
    display: block; font-size: 24px; text-align: center; padding: 50px;
  }
}
```

**Alternatives Rejected**:
- Canvas-based rendering: complexo, performance impact
- Iframe sandbox: quebra funcionalidades existentes (TOC, anchors)
- Service Worker: overkill, cache issues

---

## Data Model Design

### Entities (mapped to Vercel KV)

#### User
```typescript
interface User {
  id: string;              // UUID v4
  nome: string;            // Nome completo
  cpf: string;             // 11 dígitos, formato 12345678901
  email: string;           // Login credential
  hashedPassword: string;  // bcrypt hash
  status: 'active' | 'inactive';
  createdAt: number;       // Unix timestamp
  lastAccessAt: number;    // Unix timestamp
}
```

#### Grant
```typescript
interface Grant {
  userId: string;
  bookSlug: string;        // e.g., "vivencia_pombogira"
  status: 'active' | 'revoked';
  grantedAt: number;
  revokedAt?: number;
}
```

#### Session
```typescript
interface Session {
  id: string;              // UUID v4
  userId: string;
  expiresAt: number;       // Unix timestamp (24h)
  createdAt: number;
}
```

### Access Patterns

| Operation | KV Keys Used | Method |
|-----------|-------------|--------|
| **Login** | `user:email:{email}` → userId<br>`user:{userId}` → User | GET |
| **Check grant** | `grants:{userId}` → Set\<bookSlug\> | SISMEMBER |
| **List user grants** | `grants:{userId}` | SMEMBERS |
| **Grant access** | `grants:{userId}` + `book:{bookSlug}:users` | SADD (both) |
| **Revoke access** | `grants:{userId}` + `book:{bookSlug}:users` | SREM (both) |
| **List users for book** | `book:{bookSlug}:users` → Set\<userId\> | SMEMBERS |
| **Validate session** | `session:{sessionId}` → Session | GET + TTL check |

---

## API Contracts (Vercel Functions)

### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "plaintext"
}

Response (200):
{
  "success": true,
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "12345678901",
    "email": "user@example.com"
  },
  "token": "jwt..."
}
// + Set-Cookie: session=jwt; HttpOnly; Secure; SameSite=Strict; Max-Age=86400

Response (401):
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

### POST /api/auth/logout
```json
Request: (no body, reads cookie)

Response (200):
{
  "success": true
}
// + Set-Cookie: session=; Max-Age=0
```

### GET /api/users (Admin only)
```json
Response (200):
{
  "users": [
    {
      "id": "uuid",
      "nome": "João Silva",
      "cpf": "12345678901",
      "email": "user@example.com",
      "status": "active",
      "grants": ["vivencia_pombogira", "guia_de_ervas"]
    }
  ]
}
```

### POST /api/users (Admin only)
```json
Request:
{
  "nome": "Maria Santos",
  "cpf": "98765432109",
  "email": "maria@example.com",
  "password": "plaintext"
}

Response (201):
{
  "success": true,
  "user": {
    "id": "uuid",
    "nome": "Maria Santos",
    "cpf": "98765432109",
    "email": "maria@example.com",
    "status": "active"
  }
}

Response (400):
{
  "success": false,
  "error": "CPF inválido ou já cadastrado"
}
```

### POST /api/grants (Admin only)
```json
Request:
{
  "userId": "uuid",
  "bookSlug": "vivencia_pombogira",
  "action": "grant" | "revoke"
}

Response (200):
{
  "success": true,
  "grant": {
    "userId": "uuid",
    "bookSlug": "vivencia_pombogira",
    "status": "active" | "revoked"
  }
}
```

### GET /api/validate (Internal, called by middleware)
```json
Request Headers:
Authorization: Bearer <jwt>

Response (200):
{
  "valid": true,
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "cpf": "12345678901"
  },
  "grants": ["vivencia_pombogira", "guia_de_ervas"]
}

Response (401):
{
  "valid": false,
  "error": "Token inválido ou expirado"
}
```

---

## Middleware Logic (Vercel Edge)

```js
// middleware.js (root do projeto)
import { NextResponse } from 'next/server';
import { jwtVerify } from '@twind/core'; // ou lib JWT Edge-compatible

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect /livros/* routes
  if (pathname.startsWith('/livros/')) {
    const token = request.cookies.get('session')?.value;
    
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login.html', request.url));
    }
    
    try {
      // Verify JWT
      const { payload } = await jwtVerify(token, process.env.JWT_SECRET);
      const userId = payload.sub;
      
      // Extract book slug from path (e.g., /livros/vivencia_pombogira.html → vivencia_pombogira)
      const bookSlug = pathname.match(/\/livros\/([^.]+)\.html/)?.[1];
      
      if (!bookSlug) {
        return NextResponse.next();
      }
      
      // Check grant in KV
      const kv = await getKV(); // Vercel KV client
      const hasGrant = await kv.sismember(`grants:${userId}`, bookSlug);
      
      if (!hasGrant) {
        return NextResponse.redirect(new URL('/auth/access-denied.html', request.url));
      }
      
      // Inject user data for watermark (via custom header)
      const user = await kv.get(`user:${userId}`);
      const response = NextResponse.next();
      response.headers.set('X-User-Data', JSON.stringify({
        nome: user.nome,
        cpf: user.cpf
      }));
      
      return response;
      
    } catch (err) {
      console.error('Auth error:', err);
      return NextResponse.redirect(new URL('/auth/login.html', request.url));
    }
  }
  
  // Allow other routes
  return NextResponse.next();
}

export const config = {
  matcher: ['/livros/:path*']
};
```

---

## Implementation Sequence (Phases)

### Phase 0: Research ✅ (this document)
- [x] Resolve backend clarification → Vercel Edge + KV
- [x] Define protection scope → best-effort + watermark
- [x] Define CPF handling → format validation + 12 meses
- [x] Design data model, API contracts, middleware logic

### Phase 1: Data Model & Contracts (next: `/speckit.plan` will generate)
- [ ] `data-model.md`: formalize entities, KV schema, access patterns
- [ ] `contracts/`: OpenAPI specs for `/api/auth/*`, `/api/users`, `/api/grants`
- [ ] `quickstart.md`: setup Vercel project, KV store, environment variables

### Phase 2: Tasks (after Phase 1: `/speckit.tasks` will generate)
- [ ] Implement middleware.js (auth validation + grant check)
- [ ] Implement /api/auth/login, /api/auth/logout
- [ ] Implement /api/users (CRUD)
- [ ] Implement /api/grants (grant/revoke)
- [ ] Create auth/login.html, auth/admin.html
- [ ] Create scripts/watermark.js, scripts/protection.js
- [ ] Modify all livros/*.html to include watermark + protection
- [ ] Test flow: cadastro → login → acesso livro → marca d'água → bloqueios
- [ ] Test revogação: revogar → reload → bloqueio

---

## Open Questions / Follow-up

1. **Admin authentication**: Usar credencial hardcoded (env var) ou criar role system? → **Decision pending** (Phase 1)
2. **Password reset**: Necessário? → **Out of scope** para MVP (pode adicionar via email future)
3. **Multi-tenancy**: Suportar múltiplos admins/bibliotecas? → **Out of scope** (single admin)
4. **Audit log persistence**: Vercel KV ou external? → **Decision pending** (Phase 1)
5. **Rate limiting**: Necessário para /api/auth/login? → **Recommended** (Vercel Edge rate limit middleware)

---

## Constitution Amendment Proposal

**Proposed Change**: Add to "Project Constraints" section:

> **Exceção para autenticação**: Permitido o uso de recursos serverless da plataforma de hospedagem (Vercel Edge Middleware e Functions) exclusivamente para autenticação, controle de acesso e auditoria, sem introduzir pipelines de build. O código serverless deve ser mínimo e manter o princípio de site estático para conteúdo público.

**Version Impact**: Constitution 1.0.0 → 1.1.0 (MINOR: new constraint exception)

**Justification**: Sem servidor/serverless, autenticação real é impossível. Client-side puro não atende requisitos de segurança (FR-002, FR-003, FR-009). Vercel Edge/Functions são recursos da plataforma, não requerem builds adicionais, e mantêm o pipeline de publicação inalterado.

---

## Summary for Phase 1

**Resolved Clarifications**:
1. ✅ Backend: Vercel Edge Middleware + KV (serverless permitido via emenda)
2. ✅ Protection: Best-effort client-side + watermark (pragmático)
3. ✅ CPF: Format validation + plaintext + 12 meses + consent

**Technology Stack**:
- Frontend: HTML/CSS/JS puro (sem build)
- Backend: Vercel Edge Middleware + Vercel Functions (Node.js)
- Storage: Vercel KV (Redis)
- Auth: JWT + HttpOnly cookies

**Next Steps**:
- Generate `data-model.md` (formal entity schemas)
- Generate `contracts/` (OpenAPI specs)
- Generate `quickstart.md` (setup guide)
- Update Constitution to 1.1.0 with serverless exception

**Ready for Phase 1**: ✅ All NEEDS CLARIFICATION items resolved
