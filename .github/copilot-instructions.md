# Copilot Instructions for `personal_library`

Purpose: Help AI coding/writing agents work productively in this repository by following the current structure and editorial conventions. Keep guidance concrete and specific to this repo.

## Big Picture
- This is a content-first repo for Portuguese (pt-BR) manuscripts. No build system, tests, or scripts are present.
- Primary artifact: long-form Markdown under `Source/`. Example: `Source/vivencia_pombogira.md` (≈780+ lines), `Source/vivencia_ervas.md` (≈1629 lines).
- `index.html`: library catalog homepage with card-based navigation to books.
- `livros/`: directory containing HTML readers for each book (e.g., `vivencia_pombogira.html`, `guia_de_ervas.html`).

## Layout
- `Source/`: manuscript files in Markdown.
- `livros/`: HTML book readers (one per manuscript).
- `index.html`: library homepage catalog.
- `README.md`: minimal project label; avoid expanding with process docs unless asked.
- `.github/`: this instruction file for AI agents.

## Authoring Conventions (observed)
- **Language:** Portuguese (pt-BR). Preserve diacritics and original terminology (e.g., “Pombogira”, “Umbanda Sagrada”).
- **Tone/Style:** Didactic, theological, and explanatory; narrative paragraphs over heavy Markdown formatting.
- **Headings:**
  - Top-level title often in uppercase (e.g., `OS MISTÉRIOS DE POMBOGIRA...`).
  - Chapters start with `CAPÍTULO N` on its own line.
  - Subsections use numeric prefix and en dash: `N.M – Título`.
- **Paragraphs:** Separate with a blank line. Keep natural prose lines; avoid hard-wrapping every ~80 chars.
- **Lists:** Used sparingly for emphasis; prefer simple `-` bullets. Keep list items as short, single sentences.
- **Quotes/Emphasis:** Minimal use. Prefer plain text over bold/italic unless clarifying structure.
- **Encoding:** UTF-8. Do not strip or normalize accents.

### Examples from `Source/vivencia_pombogira.md`
- Chapter header:
  ```
  CAPÍTULO 3
  O MISTÉRIO INTERIORIZADOR: A SENHORA DOS INTERIORES
  ```
- Subsection with numbering and en dash:
  ```
  2.2 – Da opressão ao empoderamento: a transmutação espiritual da dor
  ```
- Short emphasis lists embedded in prose:
  ```
  Ela não é vulgar; é profunda.
  Não é sedutora; é verdadeira.
  ```

## Working Practices
- Add new manuscripts under `Source/` using lowercase snake_case or descriptive slugs (e.g., `Source/nova_apostila.md`).
- Maintain the chapter structure (`CAPÍTULO N`, subsections `N.M – ...`) for long-form works.
- If cross-linking, use relative links from the current file (e.g., from `.github/` use `[Vivência Pombogira](../Source/vivencia_pombogira.md)`). Avoid adding external navigation until requested.
- Keep edits focused: content improvements, typo fixes, or structural consistency. Do not introduce doctrinal changes without explicit prompts.

## Creating a New Book Page

When the user requests a new book/manuscript to be added to the library, follow this complete workflow:

### Step 1: Prepare the Markdown Content
1. **Create or format the manuscript** in `Source/`:
   - Filename: lowercase snake_case (e.g., `Source/novo_livro.md`)
   - Encoding: UTF-8 with proper diacritics
   - Structure:
     * Start with `# TÍTULO DO LIVRO` (H1)
     * Use `## CAPÍTULO N` (H2) for chapters
     * Use `### Título da Seção` (H3) for sections
     * Use `#### Subtítulo` (H4) for subsections
   - Ensure all headings are properly formatted with Markdown hierarchy
   - Include blank lines between paragraphs
   - Add `## Direitos Autorais` section at the end if applicable

### Step 2: Create the HTML Reader
1. **Use `livros/vivencia_pombogira.html` as the template** (this is the canonical reference)
2. **Create new file** in `livros/` directory (e.g., `livros/novo_livro.html`)
3. **Update metadata** in `<head>`:
   ```html
   <title>Título do Livro — Livro Digital</title>
   <meta name="description" content="Descrição concisa do conteúdo do livro..." />
   <meta property="og:title" content="Título do Livro — Livro Digital" />
   <meta property="og:description" content="Descrição para redes sociais..." />
   ```
4. **Update the mdPath variable**:
   ```javascript
   const mdPath = '../Source/nome_do_arquivo.md';
   ```
5. **Update branding elements**:
   - `.brand h1`: Update to book title
   - `.brand nav`: Keep as "Biblioteca › Livro"
   - `#tocSearch` placeholder: Customize for content type (e.g., "Filtrar ervas…", "Filtrar capítulos…")

### Step 3: Customize the Theme Colors
Choose a color scheme that fits the book's theme:

**Template color variables to update in `:root`:**
```css
--accent: #228b22;      /* Primary brand color */
--accent-2: #60a060;    /* Secondary/hover color */
```

**Common themes:**
- **Pombogira/Spiritual**: Red/pink (`#b10e3c`, `#e23a6a`, `#d9608f`)
- **Ervas/Nature**: Green (`#228b22`, `#60a060`, `#3aae3a`)
- **Ancestral/Wisdom**: Purple (`#6b2d8f`, `#9b60c0`, `#7a3faa`)
- **Sacred/Universal**: Gold/amber (`#c77a00`, `#d4a033`, `#e8b45a`)
- **Healing/Peace**: Blue (`#2e5c8f`, `#4a7fbe`, `#689dd9`)

**Update in all three theme variants:**
- `:root` (light theme)
- `[data-theme="dark"]`
- `[data-theme="sepia"]`

**Also update the favicon SVG** color in the `<link rel="icon">` tag to match:
```html
<link rel="icon" href="data:image/svg+xml,%3Csvg...fill='%23228b22'..." />
```

### Step 4: Add to the Library Catalog
Update `index.html` to add the new book card:

```html
<article class="card">
  <div class="tag-row">
    <span class="tag">tag1</span>
    <span class="tag">tag2</span>
  </div>
  <h2>Título do Livro</h2>
  <p class="meta">Subtítulo ou descrição breve</p>
  <p>Resumo do conteúdo em 2-3 frases...</p>
  <a href="livros/novo_livro.html" class="cta">Ler manuscrito →</a>
</article>
```

### Step 5: Verify the Implementation
Test the following features:
- [ ] Markdown renders correctly with all headings
- [ ] TOC (table of contents) generates properly in sidebar
- [ ] TOC search/filter works
- [ ] Theme switching cycles through light/dark/sepia
- [ ] Font size controls increase/decrease properly
- [ ] Progress bar tracks scroll position
- [ ] Back-to-top button appears after scrolling
- [ ] Active section highlights in TOC (Intersection Observer)
- [ ] Smooth scrolling to sections works
- [ ] Anchor links (#) appear on heading hover
- [ ] Drop caps appear on chapter paragraphs
- [ ] Chapter decorators (◦) appear on H2 with "CAPÍTULO"
- [ ] Responsive design works on mobile
- [ ] Colors match the chosen theme
- [ ] localStorage persists theme and font size

### Template Feature Reference

The canonical HTML template (`livros/vivencia_pombogira.html`) includes:

**Layout & Navigation:**
- Sticky header with breadcrumb navigation
- Two-column grid layout (TOC sidebar + content) on desktop
- Single column on mobile (TOC hidden)
- Sticky TOC with search/filter functionality
- Progress bar at top of page
- Floating back-to-top button

**Theming System:**
- CSS custom properties for easy color customization
- Three theme variants: light (default), dark, sepia
- localStorage persistence for theme preference
- Theme toggle button in header

**Typography:**
- Inter font for body text (clear, readable)
- Merriweather font for headings (elegant, serif)
- Adjustable font size with localStorage persistence
- Drop caps on chapter-opening paragraphs
- Chapter decorators (◦ symbol) before H2 with "CAPÍTULO"

**Interactive Features:**
- TOC auto-generated from Markdown headings (H1-H4)
- Intersection Observer for active section highlighting
- Smooth scrolling to anchor links
- Anchor links (#) on all headings
- TOC search input to filter sections
- Responsive design with mobile-first approach

**Technical Stack:**
- Pure HTML/CSS/JavaScript (no build process)
- Marked.js for client-side Markdown rendering (CDN)
- CSS Grid for layout
- Intersection Observer API for scroll tracking
- localStorage for preferences

### File Naming Conventions
- **Markdown source**: `Source/nome_descritivo.md` (snake_case)
- **HTML reader**: `livros/nome_descritivo.html` (match the Markdown filename)
- **Consistency**: Keep filenames in sync for maintainability

### Common Pitfalls to Avoid
1. **Don't forget to update mdPath** — the most common error
2. **Don't mix color schemes** — update all three theme variants
3. **Don't skip the favicon** — update the SVG fill color
4. **Don't forget the catalog** — always add the book card to `index.html`
5. **Don't use absolute paths** — use relative paths (`../Source/...`)
6. **Don't modify the template structure** — only update content and colors
7. **Don't remove features** — preserve all interactive functionality

### Quick Checklist for New Books
- [ ] Markdown file created/formatted in `Source/`
- [ ] HTML reader created in `livros/` using template
- [ ] All metadata updated (title, description, Open Graph)
- [ ] mdPath points to correct Markdown file
- [ ] Theme colors customized and consistent across all variants
- [ ] Favicon color matches theme
- [ ] TOC search placeholder customized
- [ ] Book card added to `index.html` with proper tags
- [ ] All features tested and working
- [ ] Content renders properly without errors

## Local Preview
- Use VS Code’s Markdown preview to review changes before committing: Command Palette → “Markdown: Open Preview to the Side”.

## Non-Goals
- Do not add build pipelines, static site generators, or CI.
- Do not restructure directories or rename existing files without instruction.
- Do not translate content or change language defaults unless asked.

## When Unsure
- Prefer minimal, surgical edits that preserve the author’s voice and structure.
- Ask for clarification before introducing new patterns (e.g., templates, TOCs, front matter).
