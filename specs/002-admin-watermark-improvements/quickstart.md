# Quickstart: Admin & Watermark Improvements

**Feature**: 002-admin-watermark-improvements  
**Status**: Implementation Ready  
**Prerequisites**: Feature 001 (login-access-control) deployed and functional

## TL;DR

Duas melhorias no sistema de autenticação:

1. **Admin Role**: Checkbox no formulário `/auth/admin.html` para criar usuários com acesso total
2. **Adaptive Watermark**: Marca d'água ajusta cor automaticamente por tema (light/dark/sepia)

## Quick Implementation Guide

### 1. Admin Checkbox (5 min)

**File**: `auth/admin.html`

Add after password field:

```html
<div>
  <label>
    <input id="isAdmin" type="checkbox" style="margin-right: 8px;" />
    Usuário Admin (acesso total aos livros)
  </label>
</div>
```

**File**: `scripts/admin.js`

Update form submission:

```javascript
// In createUser() function, add:
const isAdmin = document.getElementById('isAdmin').checked;

// In fetch body:
body: JSON.stringify({ nome, cpf, email, password, isAdmin })
```

**File**: `api/users/index.js`

Update user creation logic:

```javascript
// Around line 60-70, modify:
const status = req.body.isAdmin === true ? 'admin' : 'active';
const userId = await createUser({ nome, cpf, email, password, status });
```

### 2. CPF Validation (5 min)

**File**: `scripts/admin.js`

Add validation function:

```javascript
function validateCPF(cpf) {
  const clean = cpf.replace(/[^\d]/g, '');
  if (!/^\d{11}$/.test(clean)) {
    return { valid: false, error: 'CPF inválido (deve ter 11 dígitos)' };
  }
  return { valid: true, cpf: clean };
}
```

Call in form submit handler:

```javascript
const cpfResult = validateCPF(document.getElementById('cpf').value);
if (!cpfResult.valid) {
  showMsg(noticeEl, cpfResult.error);
  return;
}
```

### 3. Adaptive Watermark (10 min)

**File**: `scripts/watermark.js`

Add theme color map at top:

```javascript
const THEME_COLORS = {
  light: 'rgba(0, 0, 0, 0.08)',
  dark: 'rgba(255, 255, 255, 0.12)',
  sepia: 'rgba(80, 60, 40, 0.10)'
};

function getTheme() {
  const theme = document.documentElement.dataset.theme;
  if (theme) return theme;
  if (document.documentElement.classList.contains('dark')) return 'dark';
  if (document.documentElement.classList.contains('sepia')) return 'sepia';
  return 'light';
}
```

Update `createWatermark()` function:

```javascript
// Replace hard-coded color:
// OLD: d.style.color = '#000';
// OLD: d.style.opacity = '0.6';

// NEW:
const theme = getTheme();
d.style.color = THEME_COLORS[theme];
d.style.opacity = '1'; // Opacity now in RGBA
```

Add theme change observer:

```javascript
// At end of init() function:
const observer = new MutationObserver(() => {
  const theme = getTheme();
  const color = THEME_COLORS[theme];
  document.querySelectorAll('.wm-overlay div').forEach(cell => {
    cell.style.color = color;
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme', 'class']
});
```

## Testing Checklist

### Admin Role

- [ ] Open `/auth/admin.html`
- [ ] Fill form with checkbox **checked**
- [ ] Submit → verify no errors
- [ ] Check database: `SELECT status FROM users WHERE email='test@example.com'` → should be `'admin'`
- [ ] Login with new admin user
- [ ] Verify access to `/auth/admin.html` (no redirect)
- [ ] Open any book without grant → verify watermark appears (full access)

### CPF Validation

- [ ] Enter CPF `123` → error "CPF inválido (deve ter 11 dígitos)"
- [ ] Enter CPF `12345678901234` → error (too long)
- [ ] Enter CPF `abc` → error (non-numeric)
- [ ] Enter CPF `12345678901` → ✅ accepts
- [ ] Enter CPF `123.456.789-01` → ✅ strips formatting, accepts

### Watermark Theme Adaptation

- [ ] Open book in light theme → watermark black, subtle
- [ ] Toggle to dark theme → watermark turns white within 500ms
- [ ] Toggle to sepia theme → watermark turns brown
- [ ] Text remains readable in all themes
- [ ] Open DevTools → inspect watermark cell → verify correct RGBA value

## Usage Examples

### Creating Admin User

1. Admin logs in → `/auth/admin.html`
2. Fills form:
   - Nome: `Carlos Admin`
   - CPF: `12345678901`
   - Email: `carlos@example.com`
   - Password: `senha123`
   - ✅ Check "Usuário Admin"
3. Click "Criar Usuário"
4. Success message → user created with `status='admin'`
5. Carlos can now login and access all books + admin dashboard

### Creating Regular User

1. Admin logs in → `/auth/admin.html`
2. Fills form:
   - Nome: `Ana User`
   - CPF: `98765432109`
   - Email: `ana@example.com`
   - Password: `senha456`
   - ❌ Leave "Usuário Admin" unchecked
3. Click "Criar Usuário"
4. User created with `status='active'`
5. Ana needs explicit grants to access books

### Theme Adaptation in Action

**Scenario**: User reading book switches theme

1. User opens `livros/vivencia_pombogira.html`
2. Watermark loads: black text (light theme default)
3. User clicks theme toggle → selects "Dark"
4. Page background turns dark
5. Watermark **automatically** turns white
6. Transition smooth, no page reload
7. User can continue reading with visible watermark

## API Reference

### POST /api/users (updated)

**Headers**:
```
X-Admin-Token: <from session>
Content-Type: application/json
```

**Body**:
```json
{
  "nome": "string (required)",
  "cpf": "string (required, 11 digits)",
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "isAdmin": boolean (optional, default: false)
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Errors**:
- 400: CPF/email inválido
- 409: Email/CPF já cadastrado
- 403: Sem permissão admin
- 500: Erro interno

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                       Admin Form                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Nome: [_______________]                               │   │
│  │ CPF:  [_______________] ← validateCPF() frontend      │   │
│  │ Email: [_______________]                              │   │
│  │ Password: [_______________]                           │   │
│  │ ☑ Usuário Admin (acesso total) ← NEW CHECKBOX        │   │
│  │ [Criar Usuário]                                       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    POST /api/users
                    { ..., isAdmin: true }
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (api/users/index.js)                │
│  status = isAdmin ? 'admin' : 'active'                       │
│  createUser({ nome, cpf, email, password, status })         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Neon PostgreSQL (users table)                   │
│  INSERT (id, nome, cpf, email, password, status='admin')    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Login Flow                                │
│  1. User logs in                                             │
│  2. Backend checks: users.status === 'admin'                 │
│  3. Session: { isAdmin: true }                               │
│  4. Middleware: if (isAdmin) bypass grants                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Watermark Theme Flow                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Page Load → getTheme() → 'light'                     │   │
│  │ Apply THEME_COLORS['light'] → 'rgba(0,0,0,0.08)'    │   │
│  │ Create 180 cells with black color                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ User clicks theme toggle → data-theme="dark"         │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ MutationObserver fires                               │   │
│  │ getTheme() → 'dark'                                  │   │
│  │ Apply THEME_COLORS['dark'] → 'rgba(255,255,255,0.12)'│  │
│  │ Update all 180 cells → white color                  │   │
│  │ Transition: ≤500ms                                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Admin checkbox not working

**Symptom**: User created but not admin (status='active')

**Check**:
1. DevTools Network tab → POST /api/users → Request payload → verify `isAdmin: true`
2. If missing: Check `scripts/admin.js` → ensure `isAdmin` added to fetch body
3. If present: Check `api/users/index.js` → verify status logic `req.body.isAdmin === true`

**Fix**: Add missing code from sections above

### CPF validation not showing errors

**Symptom**: Invalid CPF submitted without error message

**Check**:
1. DevTools Console → check for JavaScript errors
2. Verify `validateCPF()` function exists in `scripts/admin.js`
3. Verify `showMsg()` function called with error message

**Fix**: Add validation function and error display logic

### Watermark not changing color

**Symptom**: Watermark stays same color when theme toggles

**Check**:
1. DevTools Console → check for MutationObserver errors
2. Inspect `<html>` element → verify `data-theme` attribute changes
3. Verify `THEME_COLORS` object exists in `watermark.js`
4. Check MutationObserver setup (should be at end of `init()` function)

**Fix**: Add MutationObserver code from section 3 above

### Watermark too transparent/visible

**Symptom**: Can't read text (too dark) or watermark invisible (too light)

**Adjustment**: Modify opacity values in `THEME_COLORS`:
- Decrease if too visible: `0.12` → `0.10` or `0.08`
- Increase if too transparent: `0.08` → `0.10` or `0.12`

**Test**: View on multiple devices/screens before finalizing

## Performance Notes

- CPF validation: <1ms (regex only)
- Watermark theme update: <100ms (180 cells, style property change)
- MutationObserver overhead: <1ms per theme toggle
- No network requests during theme changes (all client-side)

## Next Steps

After implementation:

1. Test admin user creation + login
2. Test CPF validation edge cases
3. Test watermark in all themes × all books (15 combinations)
4. Deploy to Vercel
5. Verify production (https://personal-library.vercel.app)
6. Update documentation (if needed)
7. Mark feature 002 complete

## Related Documentation

- [Feature Spec](./spec.md) - Full requirements
- [Implementation Plan](./plan.md) - Detailed design
- [Data Model](./data-model.md) - Database schema
- [API Contract](./contracts/admin-api.yaml) - OpenAPI spec
- [Feature 001 Docs](../001-login-access-control/) - Authentication system
