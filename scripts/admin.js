(function(){
  const BOOKS = [
    { slug: 'vivencia_pombogira', title: 'Pombogira' },
    { slug: 'guia_de_ervas', title: 'Guia de Ervas' },
    { slug: 'aula_iansa', title: 'Aula Iansã' },
    { slug: 'aula_oba', title: 'Aula Obá' },
    { slug: 'aula_oya_loguna', title: 'Aula Oyá Logunã' },
  ];

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
      const btnSync = document.createElement('button'); btnSync.className = 'btn secondary'; btnSync.textContent = 'Salvar acessos';
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

  async function createUser(){
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const consent = document.getElementById('consent').checked;
    const msg = document.getElementById('createMsg');

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token() },
      body: JSON.stringify({ nome, cpf, email, password, consent })
    });
    const data = await res.json();
    if (!res.ok){ showMsg(msg, data.error || 'Erro ao cadastrar'); return; }
    showMsg(msg, 'Usuário cadastrado com sucesso');
    await refresh();
  }

  async function refresh(){ const users = await fetchUsers(); renderUsers(users); }

  function init(){
    document.getElementById('createUser').addEventListener('click', (e) => { e.preventDefault(); createUser().catch(err => alert(err.message)); });
    // Auto-load users on page load
    refresh().catch(err => {
      console.error('Erro ao carregar usuários:', err);
      alert('Erro ao carregar usuários. Verifique se você está logado como admin.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
