# Data Model: Admin & Watermark Improvements

**Feature**: 002-admin-watermark-improvements  
**Date**: 2025-11-26  
**Database**: Neon PostgreSQL (serverless, sa-east-1)

## Entity: users

**Status**: ✅ **NO SCHEMA CHANGES REQUIRED** - Using existing `status` column

### Current Schema

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,           -- UUID v4
  nome VARCHAR(255) NOT NULL,           -- Full name
  cpf VARCHAR(11) NOT NULL UNIQUE,      -- Unmasked CPF (11 numeric digits)
  cpfMasked VARCHAR(14) NOT NULL,       -- Masked format: 123***789-01
  email VARCHAR(255) NOT NULL UNIQUE,   -- Email address
  password VARCHAR(255) NOT NULL,       -- bcrypt hash (10 salt rounds)
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- Role: 'admin' | 'active' | 'inactive'
  createdAt TIMESTAMP DEFAULT NOW()     -- Creation timestamp
);

CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE UNIQUE INDEX idx_users_cpf ON users(cpf);
```

### Status Column Values

| Value | Meaning | Permissions |
|-------|---------|-------------|
| `'admin'` | Administrator | • Full book access (bypass grants)<br>• Access to `/auth/admin.html`<br>• Can create/manage users<br>• Can grant book access to others |
| `'active'` | Regular user (default) | • Requires explicit grants per book<br>• Cannot access admin dashboard<br>• Can only read granted books |
| `'inactive'` | Disabled account | • Cannot login<br>• All access revoked |

### Business Rules

1. **Admin Status Assignment**
   - New users: `status='active'` by default
   - Admin creation: Set `status='admin'` when checkbox marked
   - Persistence: Status persists across logins (stored in DB, not session)
   - Revocation: Currently requires manual DB update (no UI)

2. **CPF Validation**
   - Format: Exactly 11 numeric digits
   - Uniqueness: Enforced by UNIQUE constraint on `cpf` column
   - Storage: Unmasked in `cpf`, masked in `cpfMasked`
   - Frontend: Strip punctuation before validation (`cpf.replace(/[^\d]/g, '')`)
   - Backend: Validates format via existing regex (no changes needed)

3. **Admin Access Control**
   - Middleware (`middleware.js`): Checks `user.status === 'admin'` from session
   - API endpoints: `api/helpers/auth.js` function `isAdmin(req)` validates admin
   - Grants bypass: Admin users skip grants table lookup entirely
   - Dashboard access: `/auth/admin.html` route requires admin status

4. **Status Transitions**
   - `active` → `admin`: Via admin form checkbox (this feature)
   - `admin` → `active`: Manual DB update only (out of scope)
   - `active` → `inactive`: Manual DB update only (existing)
   - No automatic status changes (no expiration, no role rotation)

### State Diagram

```text
[New User]
    ↓
    ↓ (checkbox unchecked)
    ↓
[status='active']  ←──────┐
    │                     │
    │ (admin creates      │ (revoke admin)
    │  with checkbox)     │ (manual DB)
    │                     │
    ↓                     │
[status='admin'] ─────────┘
    │
    │ (deactivate)
    │ (manual DB)
    ↓
[status='inactive']
```

### Data Integrity

**Constraints**:
- `id`: PRIMARY KEY (prevents duplicates)
- `cpf`: UNIQUE (one account per CPF)
- `email`: UNIQUE (one account per email)
- `status`: NOT NULL with DEFAULT (always has value)

**Indexes**:
- `idx_users_email`: Fast email lookup (login)
- `idx_users_cpf`: Fast CPF lookup (registration)

**No new indexes required** - existing indexes sufficient for admin queries.

### Sample Data

```sql
-- Regular user (default)
INSERT INTO users (id, nome, cpf, cpfMasked, email, password, status)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'João Silva',
  '12345678901',
  '123***789-01',
  'joao@example.com',
  '$2a$10$...',  -- bcrypt hash
  'active'
);

-- Admin user (via checkbox)
INSERT INTO users (id, nome, cpf, cpfMasked, email, password, status)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Maria Admin',
  '98765432109',
  '987***432-09',
  'maria@example.com',
  '$2a$10$...',  -- bcrypt hash
  'admin'
);
```

### Migration

**Required**: ❌ None

**Rationale**: Column `users.status` already exists with correct type (VARCHAR) and default ('active'). Feature only modifies values, not schema.

**Existing Data**: All existing users have `status='active'` by default. No retroactive changes needed.

**Special Case**: The hardcoded admin user (current implementation checks `userId === 'admin'`) will be migrated to use `status` column check instead of ID check.

### Related Tables (No Changes)

#### grants

```sql
CREATE TABLE grants (
  userId VARCHAR(36) NOT NULL,
  bookSlug VARCHAR(100) NOT NULL,
  grantedAt TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (userId, bookSlug),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Interaction with Feature**:
- Admin users (`status='admin'`) bypass grants table entirely
- Regular users (`status='active'`) still require entries in grants table
- No schema changes needed

#### sessions (Vercel Edge Functions - in-memory)

Session data stored in HttpOnly cookie (encrypted JWT):

```javascript
{
  userId: "uuid",
  nome: "string",
  cpfMasked: "123***789-01",
  isAdmin: boolean,  // Derived from users.status === 'admin'
  exp: timestamp
}
```

**Change**: `isAdmin` flag generation logic in `api/auth/login.js`:

```javascript
// OLD (hardcoded):
isAdmin: user.id === 'admin'

// NEW (status-based):
isAdmin: user.status === 'admin'
```

#### audit_log (LGPD compliance - no changes)

```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  userId VARCHAR(36),
  action VARCHAR(50) NOT NULL,
  details JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Interaction with Feature**:
- Admin user actions still logged (CREATE_USER, GRANT_BOOK, etc.)
- No differentiation needed in logs (admin actions already tracked)
- No schema changes needed

---

## Entity: watermark (client-side - no database)

**Status**: Client-side JavaScript only - no data persistence

### Runtime Data Structure

```javascript
// Theme color configuration (static)
const THEME_COLORS = {
  light: 'rgba(0, 0, 0, 0.08)',   // Black with low opacity
  dark: 'rgba(255, 255, 255, 0.12)', // White with higher opacity
  sepia: 'rgba(80, 60, 40, 0.10)'  // Brown with medium opacity
};

// Watermark state (runtime)
{
  text: string,              // CPF masked (from API: "123***789-01")
  theme: 'light' | 'dark' | 'sepia',  // Current theme
  color: string,             // RGBA value from THEME_COLORS
  cells: HTMLDivElement[],   // Array of 180 watermark cells
  observer: MutationObserver // Theme change detector
}
```

### Lifecycle

1. **Initialization** (page load):
   - Fetch user from `/api/auth/validate`
   - Extract `cpfMasked` from response
   - Detect initial theme via `data-theme` attribute
   - Create 180 watermark cells with current theme color
   - Append to DOM

2. **Theme Change** (user toggles theme):
   - MutationObserver detects `data-theme` attribute change
   - Read new theme value
   - Lookup new color from `THEME_COLORS`
   - Update `style.color` on all 180 cells
   - Transition completes in ≤500ms

3. **Cleanup** (page unload):
   - MutationObserver disconnects
   - Watermark DOM elements removed by browser

### No Database Interaction

- Watermark configuration (colors) is hardcoded in JavaScript
- No user preferences stored
- No analytics/logging of theme changes
- No server-side rendering

---

## Data Flow Diagram

### Admin User Creation

```text
[Admin Form]
    ↓ (submit with isAdmin=true)
POST /api/users { nome, cpf, email, password, isAdmin: true }
    ↓
[api/users/index.js]
    ↓ (determine status)
status = isAdmin ? 'admin' : 'active'
    ↓
[auth/db.js: createUser()]
    ↓
INSERT INTO users (..., status) VALUES (..., 'admin')
    ↓
[Neon PostgreSQL]
    ↓
Response: { success: true, userId: "uuid" }
```

### Admin Login & Access

```text
[Login Form]
    ↓
POST /api/auth/login { email, password }
    ↓
[api/auth/login.js]
    ↓
SELECT * FROM users WHERE email=? AND status IN ('active', 'admin')
    ↓
bcrypt.compare(password, user.password)
    ↓
isAdmin = (user.status === 'admin')  // NEW logic
    ↓
Set session cookie: { userId, nome, cpfMasked, isAdmin }
    ↓
[middleware.js] (on protected route request)
    ↓
Read session cookie
    ↓
if (isAdmin) { allow access to /auth/admin.html + bypass grants }
else { require grant in grants table }
```

### Watermark Theme Adaptation

```text
[Reader Page Load]
    ↓
<script src="./scripts/watermark.js">
    ↓
getUser() → fetch /api/auth/validate
    ↓
createWatermark(user.cpfMasked)
    ↓
theme = document.documentElement.dataset.theme || 'light'
    ↓
color = THEME_COLORS[theme]
    ↓
Create 180 <div> cells with style.color = color
    ↓
Append to DOM
    ↓
[User clicks theme toggle]
    ↓
<html data-theme="dark">  // Attribute changes
    ↓
[MutationObserver fires]
    ↓
newTheme = getTheme()  // 'dark'
    ↓
newColor = THEME_COLORS[newTheme]  // 'rgba(255,255,255,0.12)'
    ↓
cells.forEach(cell => cell.style.color = newColor)
    ↓
Watermark updates (≤500ms)
```

---

## Summary

**Database Changes**: ❌ None (using existing `users.status` column)

**Schema Validation**: ✅ Pass (column exists, correct type, has default)

**Data Integrity**: ✅ Maintained (UNIQUE constraints, foreign keys unchanged)

**Backwards Compatibility**: ✅ Yes (existing users unaffected, default status='active')

**Performance Impact**: ✅ None (no new indexes, no JOIN changes)

**LGPD Compliance**: ✅ Maintained (audit_log still tracks admin actions)

**Feature Complete**: ✅ Data model supports all FR-001 to FR-012 requirements
