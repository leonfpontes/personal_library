(function(){
  const post = (payload) => fetch('/api/audit/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).catch(()=>{});

  function blockEvent(e, type) {
    e.preventDefault(); e.stopPropagation();
    post({ action: type });
    alert('Ação bloqueada pela política de proteção.');
    return false;
  }

  function onKeydown(e){
    const k = e.key.toLowerCase();
    if ((e.ctrlKey||e.metaKey) && ['c','x','v','p','s'].includes(k)) return blockEvent(e, k==='p'?'print_blocked':'copy_attempt');
    if (k === 'printscreen') return blockEvent(e, 'copy_attempt');
  }

  function onContext(e){ return blockEvent(e,'context_blocked'); }
  function onSelect(e){ return blockEvent(e,'copy_attempt'); }
  function onCopy(e){ return blockEvent(e,'copy_attempt'); }

  function installCSS(){
    const style = document.createElement('style');
    style.textContent = `@media print { body * { display:none !important; } body::before { content: 'Conteúdo protegido'; display:block; margin: 2rem; font: 16px sans-serif; } }`;
    document.head.appendChild(style);
  }

  function init(){
    installCSS();
    document.addEventListener('keydown', onKeydown, true);
    document.addEventListener('contextmenu', onContext, true);
    document.addEventListener('selectstart', onSelect, true);
    document.addEventListener('copy', onCopy, true);

    // Show access denied banner if ?denied=true
    try {
      const params = new URLSearchParams(location.search);
      if (params.get('denied') === 'true') {
        const banner = document.createElement('div');
        banner.style.position = 'fixed';
        banner.style.bottom = '16px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.background = 'rgba(255,255,255,0.95)';
        banner.style.border = '1px solid #e0dada';
        banner.style.boxShadow = '0 6px 18px rgba(0,0,0,.12)';
        banner.style.padding = '10px 14px';
        banner.style.borderRadius = '10px';
        banner.style.color = '#b10e3c';
        banner.style.font = '600 14px Inter, system-ui, sans-serif';
        banner.innerHTML = 'Acesso negado: faça login ou solicite permissão. <a href="/auth/login.html" style="margin-left:8px; color:#1f6feb; text-decoration:none;">Entrar →</a>';
        document.body.appendChild(banner);
        setTimeout(()=> banner.remove(), 8000);
      }
    } catch {}
  }

  document.addEventListener('DOMContentLoaded', init);
})();
