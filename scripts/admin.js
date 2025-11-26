(function(){
  const BOOKS = [
    { slug: 'vivencia_pombogira', title: 'Pombogira' },
    { slug: 'guia_de_ervas', title: 'Guia de Ervas' },
    { slug: 'aula_iansa', title: 'Aula Iansã' },
    { slug: 'aula_oba', title: 'Aula Obá' },
    { slug: 'aula_oya_loguna', title: 'Aula Oyá Logunã' },
  ];

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
    return data.users || [];
  }

  function renderUsers(users){
    const tbody = document.getElementById('usersTbody');
    tbody.innerHTML = '';
    users.forEach(u => {
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td'); nameTd.textContent = u.nome;
      const emailTd = document.createElement('td'); emailTd.textContent = u.email;
      const statusTd = document.createElement('td'); statusTd.textContent = u.status;
      const accessTd = document.createElement('td');
      const form = document.createElement('div'); form.className = 'tags';
      BOOKS.forEach(b => {
        const label = document.createElement('label'); label.className = 'tag';
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.dataset.slug = b.slug; cb.style.marginRight = '6px';
        label.appendChild(cb); label.appendChild(document.createTextNode(b.title));
        form.appendChild(label);
      });
      accessTd.appendChild(form);
      const actionsTd = document.createElement('td');
      
      // T023: Add Edit button
      const btnEdit = document.createElement('button');
      btnEdit.className = 'btn secondary';
      btnEdit.textContent = 'Editar';
      btnEdit.style.marginRight = '8px';
      btnEdit.addEventListener('click', () => editUser(u));
      actionsTd.appendChild(btnEdit);
      
      // T031: Add Delete button (for US5)
      const btnDelete = document.createElement('button');
      btnDelete.className = 'btn';
      btnDelete.textContent = 'Excluir';
      btnDelete.style.marginRight = '8px';
      btnDelete.style.backgroundColor = '#c53030';
      btnDelete.addEventListener('click', () => deleteUser(u.id, u.nome));
      actionsTd.appendChild(btnDelete);
      
      const btnSync = document.createElement('button');
      btnSync.className = 'btn secondary';
      btnSync.textContent = 'Salvar acessos';
      actionsTd.appendChild(btnSync);

      tr.appendChild(nameTd);
      tr.appendChild(emailTd);
      tr.appendChild(statusTd);
      tr.appendChild(accessTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);

      // Load current grants
      loadGrants(u.id, form).catch(()=>{});
      btnSync.addEventListener('click', () => syncGrants(u.id, form).catch(err => alert(err.message)));
    });
  }

  async function loadGrants(userId, container){
    const res = await fetch(`/api/grants?userId=${encodeURIComponent(userId)}`, { headers: { 'X-Admin-Token': token() } });
    if (!res.ok) return;
    const data = await res.json();
    console.log('[loadGrants] Data received:', data);
    const active = new Set((data.grants||[]).filter(g => g.status === 'active').map(g => g.bookSlug));
    console.log('[loadGrants] Active grants:', Array.from(active));
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = active.has(cb.dataset.slug);
      console.log(`[loadGrants] Checkbox ${cb.dataset.slug}: ${cb.checked}`);
    });
  }

  async function syncGrants(userId, container){
    const checks = Array.from(container.querySelectorAll('input[type="checkbox"]').values());
    for (const cb of checks){
      const slug = cb.dataset.slug;
      const action = cb.checked ? 'grant' : 'revoke';
      const res = await fetch('/api/grants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
        body: JSON.stringify({ userId, bookSlug: slug, action })
      });
      if (!res.ok) throw new Error('Falha ao atualizar concessões');
    }
    alert('Acessos atualizados.');
  }

  // T024: Edit user - fetch data and populate form
  async function editUser(user){
    // T029: Block self-edit
    const currentUser = getCurrentUserId();
    if (currentUser && user.id === currentUser) {
      alert('Você não pode editar sua própria conta por segurança.');
      return;
    }

    // Populate form fields
    document.getElementById('nome').value = user.nome;
    // Use full CPF (now available in listUsers for admin context)
    document.getElementById('cpf').value = formatCPF(user.cpf || '');
    document.getElementById('email').value = user.email;
    // Show masked password value; treat '********' as keep-current sentinel
    document.getElementById('password').value = '********';
    // Check admin status from is_admin field
    document.getElementById('isAdmin').checked = !!user.isAdmin;
    
    // T025: Set hidden field to track edit mode
    document.getElementById('editingUserId').value = user.id;
    
    // T028: Show cancel button, change submit button text
    document.getElementById('createUser').textContent = 'Salvar Alterações';
    document.getElementById('cancelEdit').style.display = 'inline-block';
    
    // Scroll to form
    document.querySelector('.panel').scrollIntoView({ behavior: 'smooth' });
  }

  // T032: Delete user with confirmation (for US5)
  async function deleteUser(userId, userName){
    // T036: Block self-deletion
    const currentUser = getCurrentUserId();
    if (currentUser && userId === currentUser) {
      alert('Você não pode excluir sua própria conta.');
      return;
    }

    // T033: Confirmation dialog
    const confirmed = confirm(`Excluir usuário "${userName}"?\n\nEsta ação não pode ser desfeita.`);
    if (!confirmed) return;

    // T034: Send DELETE request
    const msg = document.getElementById('createMsg');
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
      showMsg(msg, 'Usuário excluído com sucesso!', 'success');
    } catch (err) {
      showMsg(msg, err.message);
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

  async function createUser(){
    const editingUserId = document.getElementById('editingUserId').value;
    
    // T026: Route to update if in edit mode
    if (editingUserId) {
      return await updateUser(editingUserId);
    }
    
    // CREATE mode: original logic
    const nome = document.getElementById('nome').value.trim();
    const cpfRaw = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const isAdmin = document.getElementById('isAdmin').checked;
    const msg = document.getElementById('createMsg');

    // Validate CPF format
    const cpf = validateCPF(cpfRaw);
    if (!cpf) {
      showMsg(msg, 'CPF inválido (deve ter 11 dígitos)');
      return;
    }

    // Confirm admin creation
    if (isAdmin) {
      const confirmed = confirm('Criar usuário como ADMIN? Terá acesso total.');
      if (!confirmed) {
        return;
      }
    }

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
      body: JSON.stringify({ nome, cpf, email, password, isAdmin })
    });
    const data = await res.json();
    if (!res.ok){ showMsg(msg, data.error || 'Erro ao cadastrar'); return; }
    showMsg(msg, 'Usuário cadastrado com sucesso', 'success');
    await refresh();
  }

  // T026: Update user (PATCH request)
  async function updateUser(userId){
    const nome = document.getElementById('nome').value.trim();
    const cpfRaw = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value; // '********' or empty = keep current
    const isAdmin = document.getElementById('isAdmin').checked;
    const msg = document.getElementById('createMsg');

    // Validate CPF format
    const cpf = validateCPF(cpfRaw);
    if (!cpf) {
      showMsg(msg, 'CPF inválido (deve ter 11 dígitos)');
      return;
    }

    // Build update payload (only include password if provided)
    const payload = { nome, cpf, email, isAdmin };
    if (password && password !== '********') {
      payload.password = password;
    }

    // Use query param to avoid dynamic route 404
    const res = await fetch(`/api/users?userId=${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok){ showMsg(msg, data.error || 'Erro ao atualizar usuário'); return; }
    showMsg(msg, 'Usuário atualizado com sucesso!', 'success');
    cancelEditMode(); // T028: Reset form to create mode
    await refresh();
  }

  // T028: Cancel edit mode and reset form
  function cancelEditMode(){
    document.getElementById('editingUserId').value = '';
    document.getElementById('nome').value = '';
    document.getElementById('cpf').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('isAdmin').checked = false;
    document.getElementById('createUser').textContent = 'Cadastrar usuário';
    document.getElementById('cancelEdit').style.display = 'none';
    document.getElementById('createMsg').style.display = 'none';
  }

  async function refresh(){ const users = await fetchUsers(); renderUsers(users); }

  function init(){
    document.getElementById('createUser').addEventListener('click', (e) => { e.preventDefault(); createUser().catch(err => alert(err.message)); });
    
    // T028: Cancel edit button
    document.getElementById('cancelEdit').addEventListener('click', (e) => {
      e.preventDefault();
      cancelEditMode();
    });
    
    // T020: Apply CPF mask on input
    const cpfField = document.getElementById('cpf');
    cpfField.addEventListener('input', (e) => {
      const formatted = formatCPF(e.target.value);
      e.target.value = formatted;
    });
    
    // T021: Block non-numeric characters in CPF field
    cpfField.addEventListener('keypress', (e) => {
      // Allow only numbers (0-9)
      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    });
    
    // Auto-load users on page load
    refresh().catch(err => {
      console.error('Erro ao carregar usuários:', err);
      alert('Erro ao carregar usuários. Verifique se você está logado como admin.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
