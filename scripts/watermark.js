(function(){
  // Theme color mapping for adaptive watermark contrast
  const THEME_COLORS = {
    light: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(255, 255, 255, 0.12)',
    sepia: 'rgba(80, 60, 40, 0.15)'
  };

  // Get current theme from data-theme attribute or CSS classes
  function getTheme() {
    const dataTheme = document.documentElement.dataset.theme;
    if (dataTheme && THEME_COLORS[dataTheme]) {
      return dataTheme;
    }
    
    // Fallback to CSS class detection
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    if (document.documentElement.classList.contains('sepia')) {
      return 'sepia';
    }
    
    return 'light'; // default
  }

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
    const theme = getTheme();
    const themeColor = THEME_COLORS[theme];
    
    const wm = document.createElement('div');
    wm.className = 'wm-overlay';
    wm.style.position = 'fixed';
    wm.style.pointerEvents = 'none';
    wm.style.inset = '0';
    wm.style.zIndex = '9999';
    wm.style.opacity = '1'; // Full opacity, color includes transparency
    // Remove grid background (quadriculados)
    wm.style.backgroundImage = 'none';
    document.body.appendChild(wm);

    const tile = document.createElement('div');
    tile.style.position = 'absolute';
    tile.style.top = '0';
    tile.style.left = '0';
    tile.style.right = '0';
    tile.style.bottom = '0';
    tile.style.display = 'grid';
    // Reduce repetitions: fewer columns and taller rows for sparser layout
    tile.style.gridTemplateColumns = 'repeat(4, 1fr)';
    tile.style.gridAutoRows = '260px';
    tile.style.alignItems = 'center';
    tile.style.justifyItems = 'center';

    const makeCell = () => {
      const d = document.createElement('div');
      d.style.transform = `rotate(${(Math.random()*20-10).toFixed(1)}deg)`;
      d.style.fontFamily = 'Merriweather, serif';
      d.style.fontSize = '14px';
      d.style.color = themeColor; // Use theme-appropriate color
      d.style.opacity = '1'; // Full opacity, color includes transparency
      d.textContent = text;
      return d;
    };

    // Previously 180 cells; now significantly fewer to reduce visual noise
    for (let i=0;i<40;i++) tile.appendChild(makeCell());
    wm.appendChild(tile);

    return wm; // Return the watermark element for updates
  }

  function updateWatermarkColors() {
    const wm = document.querySelector('.wm-overlay');
    if (!wm) return;

    const theme = getTheme();
    const themeColor = THEME_COLORS[theme];

    // Ensure background remains disabled (no quadriculados)
    wm.style.backgroundImage = 'none';

    // Update all text cells
    const cells = wm.querySelectorAll('div div');
    cells.forEach(cell => {
      cell.style.color = themeColor;
    });
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

    // Observe theme changes on <html> element
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'data-theme' || mutation.attributeName === 'class')) {
          updateWatermarkColors();
          break;
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class']
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
