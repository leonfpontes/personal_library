# Quickstart: Shoelace UI Integration

**Feature**: 003-antdesign-facelift (Pivot to Shoelace)  
**Updated**: 2025-11-26  
**Audience**: Developers implementing the UI modernization

## Prerequisites

- ✅ No build tools required (CDN-only approach)
- ✅ No npm/node_modules installation needed
- ✅ Modern browser for testing (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- ✅ Access to repository at `personal_library/`
- ✅ Familiarity with HTML5, CSS3, vanilla JavaScript ES6+

## 5-Minute Setup

### Step 1: Load Shoelace from CDN

Add to `<head>` of any HTML page you're modernizing:

```html
<!-- Shoelace CSS (light theme base) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/themes/light.css" />

<!-- Shoelace JavaScript (auto-loads components) -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/shoelace-autoloader.js"></script>

<!-- Your existing styles -->
<link rel="stylesheet" href="../styles/base.css" />
```

**Note**: Shoelace autoloader only fetches component JS when that component is used on the page (tree-shaking via CDN).

---

### Step 2: Add Your First Component

Replace an existing button with Shoelace:

**Before (vanilla HTML)**:
```html
<button id="newUserBtn" class="primary-btn">Novo Usuário</button>
```

**After (Shoelace)**:
```html
<sl-button variant="primary" id="newUserBtn">Novo Usuário</sl-button>
```

**JavaScript interaction (unchanged)**:
```javascript
document.getElementById('newUserBtn').addEventListener('click', () => {
  console.log('Button clicked!');
});
```

---

### Step 3: Customize Theme Colors

In `styles/base.css`, override Shoelace design tokens:

```css
/* Light theme (default) */
:root,
[data-theme="light"] {
  --sl-color-primary-600: #b10e3c;  /* Pombogira red */
  --sl-color-primary-700: #8a0b2f;  /* Darker variant */
  --sl-font-sans: 'Roboto', -apple-system, sans-serif;
}

/* Dark theme */
[data-theme="dark"] {
  --sl-color-neutral-0: #1a1a1a;     /* Dark background */
  --sl-color-neutral-1000: #ffffff;  /* Light text */
  --sl-color-primary-600: #e23a6a;   /* Lighter red for contrast */
}

/* Sepia theme */
[data-theme="sepia"] {
  --sl-color-neutral-0: #f4ecd8;     /* Warm beige background */
  --sl-color-neutral-1000: #3d2817;  /* Dark brown text */
  --sl-color-primary-600: #c77a00;   /* Amber accent */
}
```

**Theme switching (existing logic unchanged)**:
```javascript
// Already implemented - no changes needed
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## Common Patterns

### Pattern 1: Form with Validation

```html
<form id="userForm">
  <sl-input 
    label="Nome" 
    name="name" 
    required 
    minlength="3"
    help-text="Mínimo 3 caracteres">
  </sl-input>
  
  <sl-input 
    label="Email" 
    type="email" 
    name="email" 
    required>
  </sl-input>
  
  <sl-input 
    label="CPF" 
    name="cpf" 
    pattern="\d{3}\.\d{3}\.\d{3}-\d{2}"
    required>
  </sl-input>
  
  <sl-checkbox name="is_admin">Administrador</sl-checkbox>
  
  <sl-button type="submit" variant="primary">Salvar</sl-button>
</form>

<script>
  document.getElementById('userForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Native HTML5 validation
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
    
    // Collect form data
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // API call
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(user => {
      showSuccessAlert('Usuário criado com sucesso!');
    })
    .catch(err => {
      showErrorAlert('Erro ao criar usuário: ' + err.message);
    });
  });
</script>
```

---

### Pattern 2: Drawer (Side Panel)

```html
<sl-drawer label="Editar Usuário" id="editDrawer" placement="end">
  <!-- Form content -->
  <form id="editForm">
    <sl-input label="Nome" name="name"></sl-input>
    <sl-input label="Email" type="email" name="email"></sl-input>
  </form>
  
  <!-- Footer with actions -->
  <div slot="footer">
    <sl-button variant="primary" id="saveBtn">Salvar</sl-button>
    <sl-button id="cancelBtn">Cancelar</sl-button>
  </div>
</sl-drawer>

<script>
  const drawer = document.getElementById('editDrawer');
  const cancelBtn = document.getElementById('cancelBtn');
  
  // Open drawer
  function editUser(userId) {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(user => {
        // Populate form
        document.querySelector('#editForm [name="name"]').value = user.name;
        document.querySelector('#editForm [name="email"]').value = user.email;
        
        // Show drawer
        drawer.show();
      });
  }
  
  // Close drawer
  cancelBtn.addEventListener('click', () => {
    drawer.hide();
  });
  
  // Listen to close event
  drawer.addEventListener('sl-after-hide', () => {
    document.getElementById('editForm').reset();
  });
</script>
```

---

### Pattern 3: Modal Dialog

```html
<sl-dialog label="Confirmar Exclusão" id="confirmDialog">
  <p>Tem certeza que deseja excluir este usuário?</p>
  
  <div slot="footer">
    <sl-button variant="danger" id="confirmDeleteBtn">Sim, excluir</sl-button>
    <sl-button id="cancelDeleteBtn">Cancelar</sl-button>
  </div>
</sl-dialog>

<script>
  const dialog = document.getElementById('confirmDialog');
  
  function confirmDelete(userId) {
    dialog.show();
    
    document.getElementById('confirmDeleteBtn').onclick = () => {
      fetch(`/api/users/${userId}`, { method: 'DELETE' })
        .then(() => {
          dialog.hide();
          showSuccessAlert('Usuário excluído');
          refreshTable();
        });
    };
  }
  
  document.getElementById('cancelDeleteBtn').onclick = () => {
    dialog.hide();
  };
</script>
```

---

### Pattern 4: Notification Alerts

```html
<!-- No HTML needed - create dynamically -->

<script>
  function showSuccessAlert(message) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'success',
      closable: true,
      duration: 3000,
      innerHTML: `
        <sl-icon slot="icon" name="check-circle"></sl-icon>
        ${message}
      `
    });
    document.body.append(alert);
    alert.toast();  // Shows as floating notification
  }
  
  function showErrorAlert(message) {
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant: 'danger',
      closable: true,
      duration: 5000,
      innerHTML: `
        <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
        ${message}
      `
    });
    document.body.append(alert);
    alert.toast();
  }
</script>
```

---

### Pattern 5: Loading States

```html
<sl-button variant="primary" id="submitBtn">
  Salvar
</sl-button>

<script>
  const submitBtn = document.getElementById('submitBtn');
  
  submitBtn.addEventListener('click', async () => {
    // Set loading state
    submitBtn.loading = true;
    
    try {
      await fetch('/api/users', { method: 'POST', /* ... */ });
      showSuccessAlert('Salvo com sucesso!');
    } catch (err) {
      showErrorAlert('Erro ao salvar');
    } finally {
      // Remove loading state
      submitBtn.loading = false;
    }
  });
</script>
```

---

### Pattern 6: Icon Buttons with Tooltips

```html
<sl-tooltip content="Aumentar fonte">
  <sl-button id="fontIncrease" size="small" circle>
    <sl-icon name="plus"></sl-icon>
  </sl-button>
</sl-tooltip>

<sl-tooltip content="Diminuir fonte">
  <sl-button id="fontDecrease" size="small" circle>
    <sl-icon name="dash"></sl-icon>
  </sl-button>
</sl-tooltip>

<script>
  // Existing font size logic unchanged
  document.getElementById('fontIncrease').addEventListener('click', () => {
    const current = parseInt(localStorage.getItem('font-size') || 16);
    const newSize = current + 2;
    localStorage.setItem('font-size', newSize);
    document.documentElement.style.setProperty('--content-size', `${newSize}px`);
  });
</script>
```

---

## Migration Checklist

Use this checklist when migrating a page:

### Admin Dashboard (`auth/admin.html`)
- [ ] Load Shoelace CDN in `<head>`
- [ ] Replace "Novo Usuário" button with `<sl-button>`
- [ ] Replace modal with `<sl-drawer>` for create/edit forms
- [ ] Replace form inputs with `<sl-input>`, `<sl-checkbox>`
- [ ] Replace grants modal with `<sl-dialog>`
- [ ] Style table with Shoelace design tokens (CSS variables)
- [ ] Add `<sl-alert>` toast notifications for success/error
- [ ] Test theme switching (light/dark/sepia)
- [ ] Test form validation (required, pattern, type)
- [ ] Test drawer open/close animations
- [ ] Verify localStorage persistence (unchanged)

### Catalog (`index.html`)
- [ ] Load Shoelace CDN in `<head>`
- [ ] Replace book cards with `<sl-card>`
- [ ] Replace tags with `<sl-tag>`
- [ ] Add `<sl-select>` for tag filtering
- [ ] Update CSS Grid to use Shoelace spacing tokens
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Test filter functionality (multiple tag selection)
- [ ] Verify card hover effects
- [ ] Test theme switching
- [ ] Verify logo swap (black/white per theme)

### Reader Pages (`livros/*.html`) - **CONDITIONAL**
- [ ] **Decision needed**: Evaluate performance impact first
- [ ] If proceeding: Load Shoelace CDN in `<head>`
- [ ] Replace font controls with `<sl-button>` + `<sl-tooltip>`
- [ ] Replace theme toggle with `<sl-button>` (icon button)
- [ ] Replace progress bar with `<sl-progress-bar>`
- [ ] Keep back-to-top as CSS-only (or use `<sl-button>` if already loading Shoelace)
- [ ] Test existing functionality (font size, theme, scroll tracking)
- [ ] **Critical**: Measure FCP before/after - must be <10% increase
- [ ] If performance degrades >10%, revert reader pages to vanilla HTML

### Auth Pages (`auth/login.html`, `auth/logout.html`)
- [ ] Load Shoelace CDN in `<head>`
- [ ] Replace form inputs with `<sl-input>`
- [ ] Replace submit button with `<sl-button>` (with loading state)
- [ ] Add `<sl-alert>` for error messages
- [ ] Test HTML5 validation (email, required)
- [ ] Test loading state during authentication
- [ ] Test success notification before redirect
- [ ] Verify theme consistency with rest of site

---

## Troubleshooting

### Components not rendering?
- ✅ Check browser console for errors
- ✅ Verify Shoelace CDN URLs are correct (https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/...)
- ✅ Ensure `<script type="module">` is used (not `<script>`)
- ✅ Check that component is closed properly (`<sl-button></sl-button>`, not `<sl-button />`)

### Theme not applying?
- ✅ Verify `data-theme` attribute on `<html>` element
- ✅ Check CSS variable overrides in `styles/base.css`
- ✅ Use browser DevTools to inspect computed CSS variables
- ✅ Ensure Shoelace CSS is loaded **before** custom CSS

### Form validation not working?
- ✅ Use native HTML5 attributes (`required`, `type="email"`, `pattern`)
- ✅ Call `form.checkValidity()` before submitting
- ✅ Use `form.reportValidity()` to show validation messages
- ✅ Shoelace respects native validation (no custom API needed)

### Drawer/Dialog not opening?
- ✅ Call `.show()` method, not `.open = true` attribute
- ✅ Verify element is not hidden by CSS
- ✅ Check z-index conflicts with existing elements (watermark, header)
- ✅ Ensure drawer is direct child of `<body>` or container with `position: relative`

---

## Next Steps

1. **Start with Admin Dashboard** - Highest priority (P1), most complex
2. **Then Catalog** - Medium priority (P2), good ROI for user-facing polish
3. **Then Auth Pages** - Lower priority (P3), simple forms
4. **Evaluate Reader Pages Last** - Conditional based on performance testing

See `tasks.md` (generated by `/speckit.tasks`) for detailed task breakdown.

---

## Resources

- **Shoelace Documentation**: https://shoelace.style/
- **Component Gallery**: https://shoelace.style/components/button
- **Design Tokens Reference**: https://shoelace.style/tokens/color
- **Web Components Intro**: https://developer.mozilla.org/en-US/docs/Web/Web_Components
- **Feature Spec**: `specs/003-antdesign-facelift/spec.md`
- **Research Findings**: `specs/003-antdesign-facelift/research.md`
- **Component Contracts**: `specs/003-antdesign-facelift/contracts/shoelace-components.yaml`
