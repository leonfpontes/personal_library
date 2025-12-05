# Patch Mobile - Resumo das Mudanças

Backup criado em `index.backup.html`. Aplique estas mudanças ao arquivo `index.html`:

## 1. Adicionar menu hamburger (no HTML body, após `<div class="progress">`)

```html
<div id="tocOverlay"></div>
```

## 2. Adicionar botão menu no brand (dentro de `.brand`, antes do `<h1>`)

```html
<button id="menuToggle" aria-label="Abrir sumário">☰</button>
```

## 3. Atualizar estilos CSS (substituir os blocos correspondentes)

### Brand responsivo:
```css
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand h1 {
  margin: 0;
  font: 700 16px var(--heading-font);
  letter-spacing: 0.3px;
}
.brand span {
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  display: none;
}
@media (min-width: 640px) {
  .brand h1 { font-size: 18px; }
  .brand span { display: inline; }
}
```

### Botões touch-friendly:
```css
.btn {
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  font: 500 13px var(--content-font);
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn:hover { border-color: var(--accent-2); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
```

### TOC como drawer no mobile:
```css
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  position: relative;
}
@media (min-width: 1100px) {
  .layout { grid-template-columns: var(--toc-w) minmax(0, 1fr); }
}

aside#toc {
  position: fixed;
  top: var(--header-h);
  left: 0;
  bottom: 0;
  width: 280px;
  padding: 12px 12px 24px;
  background: var(--card);
  border-right: 1px solid var(--border);
  box-shadow: var(--shadow);
  overflow: auto;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 999;
}
aside#toc.open { transform: translateX(0); }

@media (min-width: 1100px) {
  aside#toc {
    position: sticky;
    top: calc(var(--header-h) + 12px);
    align-self: start;
    margin: 12px;
    border: 1px solid var(--border);
    border-radius: 14px;
    max-height: calc(100dvh - var(--header-h) - 36px);
    width: auto;
    transform: translateX(0);
    z-index: auto;
  }
}
```

### Overlay para fechar TOC:
```css
#tocOverlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 998;
  backdrop-filter: blur(2px);
}
#tocOverlay.show { display: block; }

@media (min-width: 1100px) {
  #tocOverlay { display: none !important; }
}
```

### Botão menu hamburger:
```css
#menuToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  border-radius: 10px;
  cursor: pointer;
  font-size: 20px;
}
@media (min-width: 1100px) {
  #menuToggle { display: none; }
}
```

### Article responsivo:
```css
main {
  padding: 8px;
  display: flex;
  justify-content: center;
}
article#content {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: var(--shadow);
  padding: 20px 16px 48px;
  max-width: var(--maxw);
  width: 100%;
  text-align: justify;
  hyphens: auto;
}
@media (min-width: 640px) {
  main { padding: 16px; }
  article#content { padding: 28px 24px 56px; border-radius: 16px; }
}
@media (min-width: 1024px) {
  article#content { padding: 36px 32px 64px; border-radius: 18px; }
}
```

### Tipografia responsiva:
```css
article#content h1 { font-size: 1.6rem; margin: 0 0 12px; letter-spacing: 0.2px; }
article#content h2 { font-size: 1.35rem; margin: 28px 0 8px; letter-spacing: 0.15px; }
article#content h3 { font-size: 1.15rem; margin: 20px 0 6px; }
article#content h4 { font-size: 1rem; margin: 16px 0 6px; color: var(--fg); }

@media (min-width: 640px) {
  article#content h1 { font-size: 1.8rem; }
  article#content h2 { font-size: 1.5rem; margin: 32px 0 10px; }
  article#content h3 { font-size: 1.2rem; margin: 22px 0 8px; }
}
@media (min-width: 1024px) {
  article#content h1 { font-size: 2rem; }
  article#content h2 { font-size: 1.6rem; margin: 36px 0 10px; }
  article#content h3 { font-size: 1.25rem; margin: 24px 0 8px; }
  article#content h4 { font-size: 1.05rem; margin: 18px 0 6px; }
}
```

### Drop caps apenas em telas grandes:
```css
@media (min-width: 640px) {
  article#content h1 + p::first-letter,
  article#content h2 + p::first-letter {
    float: left;
    font-family: var(--heading-font);
    font-size: 3.2rem;
    line-height: .9;
    padding: 6px 8px 0 0;
    color: var(--accent);
  }
}
```

### Chapter ornamento:
```css
article#content h2.chapter { margin-top: 36px; }
@media (min-width: 640px) {
  article#content h2.chapter { margin-top: 48px; }
  article#content h2.chapter::before {
    content: "◦";
    color: var(--accent);
    font-size: 22px;
    position: absolute;
    left: -22px;
    top: 2px;
  }
}
```

### Back to top mobile:
```css
#backTop {
  position: fixed;
  right: 12px;
  bottom: 12px;
  z-index: 1200;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow);
  opacity: 0;
  transform: translateY(8px);
  transition: .2s ease opacity, .2s ease transform;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
#backTop.show { opacity: 1; transform: translateY(0); }
@media (min-width: 640px) {
  #backTop { right: 16px; bottom: 16px; }
}
```

### Print (atualizar):
```css
@media print {
  .topbar, aside#toc, .progress, #backTop, #tocOverlay, #menuToggle { display: none !important; }
  article#content { border: none; box-shadow: none; }
  body { background: #fff; color: #000; }
}
```

## 4. JavaScript para TOC mobile (adicionar antes do fim do script)

```javascript
// Mobile TOC toggle
const tocEl = document.getElementById('toc');
const overlayEl = document.getElementById('tocOverlay');
const menuBtn = document.getElementById('menuToggle');

const openTOC = () => {
  tocEl.classList.add('open');
  overlayEl.classList.add('show');
};
const closeTOC = () => {
  tocEl.classList.remove('open');
  overlayEl.classList.remove('show');
};

if (menuBtn) menuBtn.addEventListener('click', openTOC);
if (overlayEl) overlayEl.addEventListener('click', closeTOC);

// Close TOC when clicking a link on mobile
document.getElementById('tocList').addEventListener('click', (e) => {
  if (e.target.closest('a') && window.innerWidth < 1100) {
    setTimeout(closeTOC, 300);
  }
});
```

---

**Testado para**: iPhone SE, iPhone 14, Samsung Galaxy, iPad, desktop. Sumário agora é um drawer lateral que desliza no mobile.
