# personal_library Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-26

## Active Technologies
- JavaScript ES6+ (client-side), Node.js 18+ (Vercel Edge Functions) (2-admin-watermark-improvements)
- Neon PostgreSQL (serverless, sa-east-1) - table `users` com coluna `status` VARCHAR (2-admin-watermark-improvements)
- JavaScript (Node 18+), HTML/CSS/JS puro + Vercel Edge (middleware/api), scripts internos `watermark.js` e `protection.js`, Google Drive preview embed (001-ervas-pdf-webview)
- Neon Postgres já existente (não alterado nesta feature) (001-ervas-pdf-webview)
- Neon Postgres já existente (não alterado) (001-ervas-pdf-webview)

**Frontend (Static):**
- HTML5, CSS3, JavaScript ES6+ (no build/transpilation)
- Marked.js for client-side Markdown rendering
- Pure CSS Grid/Flexbox layouts

**Backend (Serverless - Authentication Only):**
- Vercel Edge Middleware (route interception, JWT validation)
- Vercel Edge Functions (API endpoints at /api/*)
- Node.js 18+ runtime

**Storage:**
- Vercel KV (Redis) for user data, grants, sessions, audit logs

**Authentication:**
- JWT tokens in HttpOnly cookies (24h expiry)
- bcryptjs for password hashing (10 rounds)
- Session-based access control

**Content Protection:**
- Client-side watermark overlay (nome + CPF, opacity 12%, rotated)
- JavaScript event blocking (copy/paste/print/devtools)
- CSS user-select: none

**Compliance:**
- LGPD-compliant CPF handling (format validation, 12mo retention, consent required)

## Project Structure

```text
Source/               # Markdown manuscripts (pt-BR)
livros/              # HTML book readers (one per manuscript)
api/                 # Vercel Edge Functions
	auth/              # Authentication endpoints
	users/             # User management (admin)
	grants/            # Grant management (admin)
auth/                # Shared auth utilities
scripts/             # CLI tools (seed admin, etc.)
middleware.js        # Vercel Edge Middleware (route protection)
index.html           # Library catalog homepage
styles/              # CSS themes per book
.github/
	copilot-instructions.md  # This file
```

## Commands

```bash
# Local development
vercel dev

# Deploy to production
git push origin main  # Auto-deploys via Vercel pipeline

# Seed admin user
node scripts/seed-admin.js
```

## Code Style

**JavaScript:**
- ES6+ syntax (async/await, arrow functions, destructuring)
- No build step - code runs directly in browser/Node.js
- Use `import` for serverless functions (@vercel/kv, jsonwebtoken, bcryptjs)

**HTML:**
- Semantic HTML5 tags
- Preserve existing reader template structure
- Add watermark/protection scripts minimally

**CSS:**
- CSS custom properties for theming
- No preprocessors (pure CSS)
- Mobile-first responsive design

**Portuguese (pt-BR):**
- All user-facing text in Portuguese
- API error messages in Portuguese
- Comments can be English or Portuguese

## Recent Changes
- 001-ervas-pdf-webview: Added JavaScript (Node 18+), HTML/CSS/JS puro + Vercel Edge (middleware/api), scripts internos `watermark.js` e `protection.js`, Google Drive preview embed
- 001-ervas-pdf-webview: Added JavaScript (Node 18+), HTML/CSS/JS puro + Vercel Edge (middleware/api), scripts internos `watermark.js` e `protection.js`, Google Drive preview embed
- 2-admin-watermark-improvements: Added JavaScript ES6+ (client-side), Node.js 18+ (Vercel Edge Functions)

	- Resolved: Vercel Edge Middleware + Vercel KV for authentication
	- Resolved: Best-effort content protection (watermark primary, JS blocks secondary)
	- Resolved: CPF format validation (^\d{11}$), plaintext storage, 12mo retention
	- Generated: data-model.md (User, Grant, Session, AuditLog entities)
	- Generated: contracts/auth-api.yaml (8 REST endpoints)
	- Generated: quickstart.md (10-step setup guide)
	- Pending: Constitution amendment 1.0.0 → 1.1.0 (serverless exception)

## Constitution Principles

**I. Content-First, No Build Complexity:**
Static site with serverless authentication layer. No build tools for frontend.

**II. Editorial Integrity (pt-BR):**
Manuscripts in `Source/` are sacred. Authentication protects but doesn't modify content.

**III. Surgical Changes Only:**
Add new files (`api/`, `auth/`, `middleware.js`); modify `livros/*.html` minimally for watermark/protection.

**IV. Reader Template Fidelity:**
Preserve TOC, search, theme switching, font controls, progress bar. Add protection invisibly.

**V. Catalog Consistency:**
`index.html` catalog maintains card-based navigation. Login may gate access (UX decision pending).

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
