(function(){
  // Toast helper using Shoelace <sl-alert>
  // Ensure toast container exists at top-right
  function getToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.style.cssText = 'position: fixed; top: 16px; right: 16px; z-index: 10000; display: flex; flex-direction: column; gap: 8px; pointer-events: none;';
      document.body.appendChild(container);
    }
    return container;
  }

  function toast(variant, message, duration = 3000) {
    const container = getToastContainer();
    const alert = Object.assign(document.createElement('sl-alert'), {
      variant,
      closable: true,
      duration,
      innerHTML: message
    });
    alert.style.pointerEvents = 'auto';
    container.appendChild(alert);
    if (typeof alert.toast === 'function') {
      alert.toast();
    } else {
      alert.setAttribute('open', '');
    }
    // Auto-remove from DOM after closing
    alert.addEventListener('sl-after-hide', () => alert.remove());
  }

  function markInvalid(el, msg) {
    if (!el) return;
    el.setAttribute('invalid', '');
    if (msg && typeof el.setCustomValidity === 'function') el.setCustomValidity(msg);
    if (typeof el.focus === 'function') el.focus();
  }

  function clearInvalid(el) {
    if (!el) return;
    el.removeAttribute('invalid');
    if (typeof el.setCustomValidity === 'function') el.setCustomValidity('');
  }

  // Fix Shoelace duplicate id="input" warning
  function fixShoelaceInputIds() {
    const inputs = document.querySelectorAll('#userForm sl-input');
    inputs.forEach((slInput, index) => {
      // Access the internal input element via Shoelace's shadow DOM
      if (slInput.shadowRoot) {
        const internalInput = slInput.shadowRoot.querySelector('input');
        if (internalInput && internalInput.id === 'input') {
          internalInput.id = `${slInput.id || 'input'}-internal-${index}`;
        }
      }
    });
  }

  const BOOKS = [
    { slug: 'vivencia_pombogira', title: 'Pombogira' },
    { slug: 'guia_de_ervas', title: 'Guia de Ervas' },
    { slug: 'aula_iansa', title: 'Aula Iansã' },
    { slug: 'aula_oba', title: 'Aula Obá' },
    { slug: 'aula_oya_loguna', title: 'Aula Oyá Logunã' },
  ];

  // T012-T013: State for sorting and filtering
  let allUsers = []; // Store all users for filtering
  let currentSortColumn = null;
  let currentSortDirection = 'asc';

  // Validate CPF format: strip non-digits and check for exactly 11 digits
  function validateCPF(cpf) {
    const clean = cpf.replace(/[^\d]/g, '');
    return /^\d{11}$/.test(clean) ? clean : null;
  }

  // Format CPF with mask: 123.456.789-01
  function formatCPF(value) {
    if (!value) return '';
    const clean = value.replace(/[^\d]/g, '');
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`;
    if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`;
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
  }

  // Admin token is retrieved from session storage (set during login)
  function token(){ 
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    // In production, the backend validates session cookie, so we just need to identify as admin
    // For API calls that need X-Admin-Token, we'll use a placeholder since session cookie handles auth
    return 'from-session'; // Backend will validate via session cookie
  }
  function showMsg(el, msg){ el.textContent = msg; el.style.display = 'block'; setTimeout(()=>{ el.style.display='none'; }, 5000); }

  async function fetchUsers(){
    const res = await fetch('/api/users', { headers: { 'X-Admin-Token': token() } });
    if (!res.ok) throw new Error('Falha ao carregar usuários');
    const data = await res.json();
    allUsers = data.users || []; // T013: Store for filtering
    return allUsers;
  }

  // T012: Sort users by column
  function sortUsers(column) {
    if (currentSortColumn === column) {
      // Toggle direction if same column
      currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      currentSortColumn = column;
      currentSortDirection = 'asc';
    }

    allUsers.sort((a, b) => {
      let aVal = a[column] || '';
      let bVal = b[column] || '';
      
      // Handle string comparison
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    renderUsers(allUsers);
    updateSortIndicators();
  }

  // T012: Update visual sort indicators on headers
  function updateSortIndicators() {
    document.querySelectorAll('th[data-sortable]').forEach(th => {
      th.classList.remove('sorted-asc', 'sorted-desc');
      if (th.dataset.sortable === currentSortColumn) {
        th.classList.add(`sorted-${currentSortDirection}`);
      }
    });
  }

  // T013: Filter users by search term
  function filterUsers(searchTerm) {
    const term = searchTerm.toLowerCase().trim();
    if (!term) {
      renderUsers(allUsers);
      return;
    }

    const filtered = allUsers.filter(u => {
      const nome = (u.nome || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const cpf = (u.cpf || '').toLowerCase();
      return nome.includes(term) || email.includes(term) || cpf.includes(term);
    });

    renderUsers(filtered);
  }

  function renderUsers(users){
    const tbody = document.getElementById('usersTbody');
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      // Nome
      const nameTd = document.createElement('td'); nameTd.textContent = u.nome;
      // Email
      const emailTd = document.createElement('td'); emailTd.textContent = u.email;
      // CPF
      const cpfTd = document.createElement('td'); cpfTd.textContent = formatCPF(u.cpf);
      // Status badge Shoelace
      const statusTd = document.createElement('td');
      const badge = document.createElement('sl-badge');
      badge.variant = u.status === 'active' ? 'success' : 'neutral';
      badge.pill = true;
      badge.style.cursor = 'pointer';
      badge.textContent = u.status === 'active' ? 'Ativo' : 'Inativo';
      badge.title = 'Clique para alternar';
      badge.addEventListener('click', async () => {
        // Alternar status
        const novo = u.status === 'active' ? 'inactive' : 'active';
        const res = await fetch(`/api/users?userId=${encodeURIComponent(u.id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
          body: JSON.stringify({ status: novo })
        });
        if (res.ok) {
          u.status = novo;
          renderUsers(allUsers);
        } else {
          toast('danger', 'Erro ao atualizar status');
        }
      });
      statusTd.appendChild(badge);
      // Admin badge
      const adminTd = document.createElement('td');
      const adminBadge = document.createElement('sl-badge');
      adminBadge.variant = u.isAdmin ? 'primary' : 'neutral';
      adminBadge.pill = true;
      adminBadge.textContent = u.isAdmin ? 'Admin' : '';
      adminTd.appendChild(adminBadge);
      // Ações: ícones Shoelace
      const actionsTd = document.createElement('td');
      actionsTd.style.display = 'flex';
      actionsTd.style.gap = '8px';
      // Editar (abre drawer) com tooltip
      const btnEdit = document.createElement('sl-icon-button');
      btnEdit.setAttribute('name', 'pencil');
      btnEdit.setAttribute('label', 'Editar');
      btnEdit.setAttribute('variant', 'primary');
      btnEdit.addEventListener('click', () => openUserDrawer(u));
      const tipEdit = document.createElement('sl-tooltip');
      tipEdit.setAttribute('content', 'Editar usuário');
      tipEdit.appendChild(btnEdit);
      actionsTd.appendChild(tipEdit);
      // Excluir com tooltip
      const btnDelete = document.createElement('sl-icon-button');
      btnDelete.setAttribute('name', 'trash');
      btnDelete.setAttribute('label', 'Excluir');
      btnDelete.setAttribute('variant', 'danger');
      btnDelete.addEventListener('click', () => promptDelete(u.id, u.nome));
      const tipDelete = document.createElement('sl-tooltip');
      tipDelete.setAttribute('content', 'Excluir usuário');
      tipDelete.appendChild(btnDelete);
      actionsTd.appendChild(tipDelete);
      tr.appendChild(nameTd);
      tr.appendChild(emailTd);
      tr.appendChild(cpfTd);
      tr.appendChild(statusTd);
      tr.appendChild(adminTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }

  // Novo: renderizar acessos no drawer
  async function renderDrawerAccess(userId) {
    const container = document.getElementById('drawerAccessBooks');
    container.innerHTML = '';
    let active = new Set();
    if (userId) {
      try {
        const res = await fetch(`/api/grants?userId=${encodeURIComponent(userId)}`, { headers: { 'X-Admin-Token': token() } });
        if (res.ok) {
          const data = await res.json();
          active = new Set((data.grants || []).filter(g => g.status === 'active').map(g => g.bookSlug));
        }
      } catch (e) {
        // Fallback: no active grants
      }
    }
    BOOKS.forEach(b => {
      const cb = document.createElement('sl-checkbox');
      cb.value = b.slug;
      cb.checked = active.has(b.slug);
      cb.textContent = b.title;
      container.appendChild(cb);
    });
  }

  async function syncGrants(userId, container){
    const checks = Array.from(container.querySelectorAll('sl-checkbox'));
    for (const cb of checks){
      const slug = cb.value;
      const action = cb.checked ? 'grant' : 'revoke';
      const res = await fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
        body: JSON.stringify({ userId, bookSlug: slug, action })
      });
      if (!res.ok) throw new Error('Falha ao atualizar concessões');
    }
    toast('success', 'Acessos atualizados.');
  }

  // Drawer único para criar/editar usuário
  function openUserDrawer(user) {
    const drawer = document.getElementById('userDrawer');
    const form = document.getElementById('userForm');
    // Limpar
    form.reset();
    form.dataset.userId = user?.id || '';
    // Preencher campos se edição
    if (user) {
      form.querySelector('[name="name"]').value = user.nome || '';
      form.querySelector('[name="email"]').value = user.email || '';
      form.querySelector('[name="cpf"]').value = formatCPF(user.cpf || '');
      form.querySelector('[name="is_admin"]').checked = !!user.isAdmin;
      // Senha em branco (não altera)
      form.querySelector('[name="password"]').value = '';
      renderDrawerAccess(user.id);
    } else {
      // Novo usuário: renderiza opções de livros (todas desmarcadas)
      renderDrawerAccess(null);
    }
    drawer.label = user ? 'Editar Usuário' : 'Novo Usuário';
    drawer.show();
    
    // Fix Shoelace duplicate input IDs after drawer renders
    drawer.addEventListener('sl-after-show', () => {
      fixShoelaceInputIds();
    }, { once: true });
  }

  // T032: Delete user with confirmation (for US5)
  let pendingDelete = null;
  function promptDelete(userId, userName){
    pendingDelete = { userId, userName };
    const dlg = document.getElementById('confirmDeleteDialog');
    const txt = document.getElementById('confirmDeleteText');
    if (txt) txt.textContent = `Excluir usuário "${userName}"? Esta ação não pode ser desfeita.`;
    dlg.show();
  }

  async function deleteUser(userId, userName){
    // T036: Block self-deletion
    const currentUser = getCurrentUserId();
    if (currentUser && userId === currentUser) {
      toast('warning', 'Você não pode excluir sua própria conta.');
      return;
    }

    // T033: handled by dialog

    // T034: Send DELETE request
    // Usar alerts para feedback simples (será substituído por Shoelace notifications em T025)
    try {
      const res = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token() }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Erro ao excluir usuário' }));
        throw new Error(err.message || 'Erro ao excluir usuário');
      }
      // T035: Refresh table after successful deletion
      await refresh();
      toast('success', 'Usuário excluído com sucesso!');
    } catch (err) {
      toast('danger', err.message || 'Erro ao excluir usuário');
    }
  }

  // Helper: Get current logged-in user ID from session
  function getCurrentUserId(){
    // Assume session stores user data in localStorage or sessionStorage
    try {
      const session = sessionStorage.getItem('adminSession') || localStorage.getItem('adminSession');
      if (session) {
        const data = JSON.parse(session);
        return data.userId;
      }
    } catch (e) {
      console.warn('Could not retrieve current user ID:', e);
    }
    return null;
  }

  // T015/T016: Criar novo usuário via drawer
  async function createUser(){
    const msg = document.getElementById('createMsg'); // Reuso da área de mensagem existente (pode ficar oculta)
    const nome = document.getElementById('create-nome').value.trim();
    const cpfRaw = document.getElementById('create-cpf').value.trim();
    const email = document.getElementById('create-email').value.trim();
    const password = document.getElementById('create-password').value;
    const isAdmin = document.getElementById('create-isAdmin').checked;

    const cpf = validateCPF(cpfRaw);
    if (!cpf) { toast('warning', 'CPF inválido (11 dígitos).'); return; }

    if (isAdmin) {
      const confirmed = confirm('Criar usuário como ADMIN? Terá acesso total.');
      if (!confirmed) return;
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
      body: JSON.stringify({ nome, cpf, email, password, isAdmin })
    });
    const data = await res.json();
    if (!res.ok){ toast('danger', data.error || 'Erro ao cadastrar'); return; }
    toast('success', 'Usuário cadastrado com sucesso');
    document.getElementById('createDrawer').hide();
    await refresh();
    document.getElementById('createUserForm').reset();
  }

  // T026: Update user (PATCH request)
  // T019: Salvar alterações de usuário via drawer de edição
  async function updateUser(userId){
    const nome = document.getElementById('edit-nome').value.trim();
    const cpfRaw = document.getElementById('edit-cpf').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    let password = document.getElementById('edit-password').value;
    const isAdmin = document.getElementById('edit-isAdmin').checked;

    const cpf = validateCPF(cpfRaw);
    if (!cpf) { toast('warning', 'CPF inválido (11 dígitos).'); return; }

    const payload = { nome, cpf, email, isAdmin };
    if (password) payload.password = password; // Em branco mantém atual

    const res = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok){ toast('danger', data.error || 'Erro ao atualizar'); return; }
    toast('success', 'Usuário atualizado com sucesso!');
    document.getElementById('editDrawer').hide();
    await refresh();
  }

  // T028: Cancel edit mode and reset form
  function cancelEditMode(){
    document.getElementById('editUserForm').reset();
    document.getElementById('edit-editingUserId').value='';
    document.getElementById('editDrawer').hide();
  }

  async function refresh(){ const users = await fetchUsers(); renderUsers(users); }

  function init(){
    // Botão para abrir drawer de criação
    const newUserBtn = document.getElementById('newUserBtn');
    if (newUserBtn){ newUserBtn.addEventListener('click', () => openUserDrawer(null)); }

    // Submit drawer único
    document.getElementById('userForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const userId = form.dataset.userId;
      const nomeInput = form.querySelector('sl-input[name="name"]');
      const emailInput = form.querySelector('sl-input[name="email"]');
      const cpfInput = form.querySelector('sl-input[name="cpf"]');
      const passInput = form.querySelector('sl-input[name="password"]');
      const adminInput = form.querySelector('sl-checkbox[name="is_admin"]');

      [nomeInput, emailInput, cpfInput, passInput].forEach(clearInvalid);

      const nome = (nomeInput?.value || '').trim();
      const email = (emailInput?.value || '').trim();
      const cpfRaw = (cpfInput?.value || '').trim();
      const password = passInput?.value || '';
      const isAdmin = !!(adminInput?.checked);
      const cpf = validateCPF(cpfRaw);
      if (!nome || nome.length < 3) { markInvalid(nomeInput); toast('warning', 'Informe um nome válido (mínimo 3 caracteres).'); return; }
      const emailOk = /.+@.+\..+/.test(email);
      if (!emailOk) { markInvalid(emailInput); toast('warning', 'Informe um email válido.'); return; }
      if (!cpf) { markInvalid(cpfInput); toast('warning', 'CPF inválido (11 dígitos).'); return; }
      if (!userId && (!password || password.length < 8)) { markInvalid(passInput); toast('warning', 'Senha deve ter no mínimo 8 caracteres.'); return; }
      if (userId && password && password.length < 8) { markInvalid(passInput); toast('warning', 'Senha deve ter no mínimo 8 caracteres.'); return; }
      const payload = { nome, email, cpf, isAdmin };
      if (password) payload.password = password;
      const saveBtn = document.getElementById('saveUserBtn');
      if (saveBtn) { saveBtn.loading = true; saveBtn.disabled = true; }
      try {
        let res, data;
        if (userId) {
          // Editar
          res = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
            body: JSON.stringify(payload)
          });
          data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Erro ao atualizar');
          toast('success', 'Usuário atualizado com sucesso!');
          try {
            await syncGrants(userId, document.getElementById('drawerAccessBooks'));
          } catch (e) {
            toast('warning', 'Usuário salvo, mas falhou ao salvar acessos.');
          }
        } else {
          // Criar
          res = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
            body: JSON.stringify(payload)
          });
          data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || 'Erro ao cadastrar');
          toast('success', 'Usuário cadastrado com sucesso');
          const newId = data?.user?.id;
          if (newId) {
            try {
              await syncGrants(newId, document.getElementById('drawerAccessBooks'));
            } catch (e) {
              toast('warning', 'Usuário criado, mas falhou ao salvar acessos.');
            }
          }
        }
        document.getElementById('userDrawer').hide();
        await refresh();
        form.reset();
      } catch (err) {
        toast('danger', err.message || 'Erro ao salvar usuário');
      } finally {
        if (saveBtn) { saveBtn.loading = false; saveBtn.disabled = false; }
      }
    });

    // Cancelar drawer
    document.getElementById('cancelBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('userDrawer').hide();
    });

    // Delete dialog wiring
    const dlg = document.getElementById('confirmDeleteDialog');
    document.getElementById('confirmDeleteNo')?.addEventListener('click', () => dlg.hide());
    document.getElementById('confirmDeleteYes')?.addEventListener('click', async () => {
      if (!pendingDelete) { dlg.hide(); return; }
      const { userId, userName } = pendingDelete; pendingDelete = null;
      dlg.hide();
      await deleteUser(userId, userName);
    });

    // Máscara CPF
    const cpfField = document.querySelector('#userForm [name="cpf"]');
    if (cpfField) {
      cpfField.addEventListener('input', (e) => {
        e.target.value = formatCPF(e.target.value);
      });
      cpfField.addEventListener('keypress', (e) => {
        if (!/[0-9]/.test(e.key) && !['Backspace','Delete','Tab'].includes(e.key)) e.preventDefault();
      });
    }

    // Sorting
    document.querySelectorAll('th[data-sortable]').forEach(th => {
      th.style.cursor = 'pointer';
      th.addEventListener('click', () => sortUsers(th.dataset.sortable));
    });

    // Filtering
    const searchInput = document.getElementById('userSearch');
    searchInput?.addEventListener('input', e => filterUsers(e.target.value));

    // Carregar usuários
    refresh().catch(err => {
      console.error('Erro ao carregar usuários:', err);
      toast('danger', 'Erro ao carregar usuários. Verifique se você está logado como admin.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
