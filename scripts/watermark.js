(function(){
  async function getUser() {
    try {
      const res = await fetch('/api/auth/validate', { credentials: 'include' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.valid) return null;
      return data.user; // { id, nome, cpfMasked }
    } catch { return null; }
  }

  function createWatermark(text) {
    const wm = document.createElement('div');
    wm.className = 'wm-overlay';
    wm.style.position = 'fixed';
    wm.style.pointerEvents = 'none';
    wm.style.inset = '0';
    wm.style.zIndex = '9999';
    wm.style.opacity = '0.12';
    wm.style.backgroundImage = `repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 60px)`;
    document.body.appendChild(wm);

    const tile = document.createElement('div');
    tile.style.position = 'absolute';
    tile.style.top = '0';
    tile.style.left = '0';
    tile.style.right = '0';
    tile.style.bottom = '0';
    tile.style.display = 'grid';
    tile.style.gridTemplateColumns = 'repeat(6, 1fr)';
    tile.style.gridAutoRows = '180px';
    tile.style.alignItems = 'center';
    tile.style.justifyItems = 'center';

    const makeCell = () => {
      const d = document.createElement('div');
      d.style.transform = `rotate(${(Math.random()*20-10).toFixed(1)}deg)`;
      d.style.fontFamily = 'Merriweather, serif';
      d.style.fontSize = '14px';
      d.style.color = '#000';
      d.style.opacity = '0.6';
      d.textContent = text;
      return d;
    };

    for (let i=0;i<180;i++) tile.appendChild(makeCell());
    wm.appendChild(tile);
  }

  async function init() {
    const user = await getUser();
    if (!user) {
      // redirect to home
      location.href = '/index.html?denied=true';
      return;
    }
    const text = `${user.nome} — CPF ${user.cpfMasked}`;
    createWatermark(text);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
