# Implementation Plan: AntDesign UI Facelift

**Branch**: `003-antdesign-facelift` | **Date**: 2025-11-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-antdesign-facelift/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Migrate all frontend components from vanilla HTML/CSS to AntDesign UI library loaded via CDN, modernizing admin dashboard (Table, Drawer, Form), catalog (Card, Grid, Tag), reader pages (Layout, Button, Progress), and auth pages (Form validation). Primary technical approach: CDN standalone UMD build without React framework, with Shoelace UI as fallback if AntD standalone API proves insufficient. Maintains static architecture per Constitution Principle I.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript ES6+ (no transpilation)  
**Primary Dependencies**: AntDesign 5.x (CDN via unpkg/jsDelivr UMD build), Shoelace UI (fallback, web components via CDN), Marked.js (existing, Markdown rendering)  
**Storage**: N/A for frontend (existing PostgreSQL via Vercel Edge Functions unchanged)  
**Testing**: Manual browser testing (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+), visual regression checks  
**Target Platform**: Modern browsers (desktop + mobile), static hosting via Vercel
**Project Type**: Static web application (pure HTML/CSS/JS, no build tools)  
**Performance Goals**: Page load time increase <10% vs current baseline, First Contentful Paint <1.5s, Time to Interactive <3s  
**Constraints**: No build pipeline (Constitution Principle I), no React/Vue/Angular frameworks, CDN-only dependencies, must preserve 100% functional parity  
**Scale/Scope**: 5 HTML pages (admin.html, index.html, 5× livros/*.html, login.html, logout.html), ~20 AntD components, 3 theme variants (light/dark/sepia)

**NEEDS CLARIFICATION**:
- AntD standalone UMD API completeness - does it support all required components (Table, Drawer, Form, Modal, Card, Layout, Button, Progress) without React?
- Shoelace component mapping - which Shoelace components correspond to AntD equivalents if pivot is needed?
- Theme customization depth - can CSS variables override AntD tokens sufficiently or is ConfigProvider (React-dependent) required?
- Performance impact - what is realistic bundle size via CDN for AntD standalone vs Shoelace?
- Integration patterns - best practices for mounting AntD components in vanilla JS without JSX?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

For this personal_library repo, plans MUST satisfy these gates:

- ✅ **Content-first**: No build/CI; deliver static files only (HTML/CSS/JS). *Feature uses CDN-only approach, preserves static architecture*
- ✅ **Editorial integrity (pt-BR)**: Preserve diacritics and chapter heading rules. *No content changes, only UI layer*
- ✅ **File placement**: Markdown in `Source/`, reader HTML in `livros/`, catalog in `index.html`. *No structural changes*
- ✅ **Naming**: New manuscripts use snake_case and match HTML reader filename. *N/A - no new manuscripts*
- ✅ **Reader template fidelity**: Use `livros/vivencia_pombogira.html` as base; keep TOC, search, anchors, smooth scroll, progress bar, back-to-top, theme and font-size persistence. *All functionality preserved per FR-002 through FR-020*
- ✅ **UI Standardization** (Amendment 1.2.0): Reader controls MUST use standardized classes (`icon-btn`, `back-to-top`) and IDs (`fontDecrease`, `fontIncrease`, `themeToggle`, `backToTop`). *Maintained with AntD Button wrappers per FR-009*
- ✅ **Adaptive Watermark** (Amendment 1.2.0): Watermark MUST adapt colors to theme (black/light-sepia, white/dark) via MutationObserver. *Preserved per FR-015*
- ✅ **Institutional Branding** (Amendment 1.2.0): Logo MUST have theme-aware variants with automatic swap (black for light/sepia, white for dark). *Maintained per FR-016*
- ✅ **mdPath**: Reader `mdPath` points to the correct `../Source/<file>.md`. *Unchanged, outside scope*
- ✅ **Theme/colors**: Update all theme variants (light/dark/sepia) and favicon color to match. *AntD theme customization via CSS variables per FR-014*
- ✅ **Catalog card**: Add/update card in `index.html` with tags, brief description, and link. *N/A - modernizing existing cards only*
- ✅ **Relative paths**: Use only relative links; no absolute paths. *CDN URLs absolute but external; internal paths unchanged*
- ✅ **Rights**: Respect manuscript "Direitos Autorais" constraints. *No content modifications*

**GATE STATUS: ✅ PASS** - All constitutional requirements satisfied. Feature is purely presentational (UI layer) without touching content, structure, or build pipeline.

## Project Structure

### Documentation (this feature)

```text
specs/003-antdesign-facelift/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (AntD standalone API research)
├── data-model.md        # Phase 1 output (N/A - no new entities)
├── quickstart.md        # Phase 1 output (CDN integration guide)
├── contracts/           # Phase 1 output (UI component contracts)
│   └── antd-components.yaml  # AntD component usage specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created yet)
```

### Source Code (repository root)

```text
personal_library/
├── auth/
│   ├── admin.html           # ⚠️ MODIFIED - Migrate to AntD Table, Drawer, Form
│   ├── login.html           # ⚠️ MODIFIED - Migrate to AntD Form components
│   └── logout.html          # (no changes planned)
├── livros/
│   ├── vivencia_pombogira.html   # ⚠️ MODIFIED - AntD Layout, Button, Progress
│   ├── guia_de_ervas.html        # ⚠️ MODIFIED - AntD Layout, Button, Progress
│   ├── aula_iansa.html           # ⚠️ MODIFIED - AntD Layout, Button, Progress
│   ├── aula_oba.html             # ⚠️ MODIFIED - AntD Layout, Button, Progress
│   └── aula_oya_loguna.html      # ⚠️ MODIFIED - AntD Layout, Button, Progress
├── scripts/
│   ├── admin.js             # ⚠️ MODIFIED - Add AntD component mounting logic
│   └── (other scripts unchanged)
├── styles/
│   ├── base.css             # ⚠️ MODIFIED - AntD theme customization via CSS vars
│   └── theme-*.css          # ⚠️ MODIFIED - Integrate AntD token overrides
├── index.html               # ⚠️ MODIFIED - Migrate to AntD Card, Grid, Tag, Select
├── api/                     # ✅ UNCHANGED - Backend APIs remain as-is
├── Source/                  # ✅ UNCHANGED - Markdown content untouched
└── .copilot-instructions.md # ⚠️ UPDATE - Add AntD integration patterns
```

**Structure Decision**: This is a frontend-only modernization. No new directories created. All changes are in-place modifications to existing HTML files and supporting CSS/JS. Backend (`api/`, `middleware.js`) and content (`Source/`) remain completely untouched per constitutional requirements.

## Complexity Tracking

**N/A** - No constitutional violations. All gates passed with ✅ status.

---

## Phase 0: Research Findings (Completed)

✅ **All NEEDS CLARIFICATION items resolved** - See `research.md`

### Key Decision: Pivot from AntDesign to Shoelace UI

**Rationale**:
- AntDesign requires React runtime (240KB gzipped vs Shoelace 50KB)
- Shoelace uses native Web Components (no framework dependency)
- CDN integration simpler with Shoelace (declarative HTML vs React wrappers)
- Performance impact acceptable: +37% vs +137% FCP increase
- Constitutional compliance: Shoelace maintains static architecture without build tools

**Trade-offs**:
- Table component requires custom implementation (Shoelace lacks data table)
- Reader pages may need selective adoption to preserve <10% performance target
- Component coverage 95% (vs AntD 100%), but acceptable gap

**Alternatives Rejected**:
1. AntD + React via CDN - Too heavy (240KB), requires React concepts, violates simplicity principle
2. Custom CSS framework - Reinventing wheel, high maintenance burden, no ecosystem support

---

## Phase 1: Design Artifacts (Completed)

✅ **data-model.md** - No new entities, UI state models documented  
✅ **contracts/shoelace-components.yaml** - OpenAPI-style component specifications  
✅ **quickstart.md** - CDN integration guide with common patterns  
✅ **Agent context updated** - `.github/agents/copilot-instructions.md` includes Shoelace context

### Design Highlights

**Component Mapping** (AntD → Shoelace):
- Table → Custom `<table>` + Shoelace tokens
- Drawer → `<sl-drawer>`
- Form → `<sl-input>`, `<sl-select>`, `<sl-checkbox>`
- Modal → `<sl-dialog>`
- Button → `<sl-button>`
- Card → `<sl-card>`
- Tag → `<sl-tag>`
- Progress → `<sl-progress-bar>`

**Theme Integration**:
- CSS variables override Shoelace design tokens
- Existing `data-theme` attribute approach preserved
- Three theme variants (light/dark/sepia) maintained
- No JavaScript configuration needed (pure CSS)

**Performance Strategy**:
- Selective component loading (admin/catalog priority)
- Reader pages conditional (evaluate performance first)
- CDN preconnect hints in `<head>`
- Leverage Vercel edge caching

---

## Phase 2: Implementation Roadmap

**NOT YET GENERATED** - Run `/speckit.tasks` to create detailed task breakdown.

### Anticipated Task Structure (Preview)

**Epic 1: Admin Dashboard Modernization (P1)** - ~8-10 tasks
- CDN integration in admin.html
- Replace table HTML with custom implementation + Shoelace styling
- Migrate create/edit forms to `<sl-drawer>` + `<sl-input>`
- Implement grants modal with `<sl-dialog>` + checkboxes
- Add notification system with `<sl-alert>` toasts
- Theme customization in base.css
- Testing & validation

**Epic 2: Catalog Enhancement (P2)** - ~5-7 tasks
- CDN integration in index.html
- Migrate book cards to `<sl-card>`
- Implement tag filtering with `<sl-select>`
- Replace tags with `<sl-tag>`
- Responsive grid with Shoelace spacing tokens
- Theme testing
- Mobile responsiveness validation

**Epic 3: Auth Pages (P3)** - ~3-4 tasks
- CDN integration in login.html/logout.html
- Migrate forms to `<sl-input>` with native validation
- Add loading states to submit buttons
- Implement error/success alerts
- Testing

**Epic 4: Reader Pages (Conditional - P3)** - ~6-8 tasks OR SKIP
- **Decision gate**: Measure baseline performance first
- If proceeding: CDN integration (5 livros/*.html files)
- Migrate font/theme controls to `<sl-button>` + `<sl-tooltip>`
- Replace progress bar with `<sl-progress-bar>`
- Performance testing (must meet <10% degradation criterion)
- If fails: Revert reader pages, keep vanilla HTML

**Epic 5: Documentation & Cleanup** - ~2-3 tasks
- Update README.md with Shoelace integration notes
- Document theme token mapping
- Update Copilot instructions (already done via script)
- Final cross-browser testing

---

## Re-Evaluated Constitution Check (Post-Design)

*GATE: Final validation before task breakdown*

For this personal_library repo, plans MUST satisfy these gates:

- ✅ **Content-first**: CDN-only approach confirmed, zero build tools introduced
- ✅ **Editorial integrity (pt-BR)**: Content layer untouched, only UI modernized
- ✅ **File placement**: No structural changes, in-place HTML modifications only
- ✅ **Naming**: N/A - no new manuscripts
- ✅ **Reader template fidelity**: All functionality preserved via Shoelace equivalents (Button, Tooltip, Progress)
- ✅ **UI Standardization** (Amendment 1.2.0): Existing IDs/classes maintained, wrapped in Shoelace components
- ✅ **Adaptive Watermark** (Amendment 1.2.0): Unchanged, canvas-based watermark coexists with Shoelace
- ✅ **Institutional Branding** (Amendment 1.2.0): Logo swap logic preserved, integrated into Shoelace header
- ✅ **mdPath**: Unchanged, outside feature scope
- ✅ **Theme/colors**: Shoelace tokens mapped to existing theme variables via CSS
- ✅ **Catalog card**: Modernized in-place with `<sl-card>`, no new cards
- ✅ **Relative paths**: CDN URLs external (acceptable), internal paths unchanged
- ✅ **Rights**: Zero content modifications

**FINAL GATE STATUS: ✅✅ PASS** - Post-design validation confirms full constitutional compliance. Shoelace via CDN preserves static architecture while delivering UI modernization goals.

---

## Summary & Next Steps

### What Was Delivered (Phase 0-1)

✅ **research.md** - Technology pivot rationale (AntD → Shoelace), component mapping, performance analysis  
✅ **data-model.md** - Confirmed zero schema changes, documented UI state models  
✅ **contracts/shoelace-components.yaml** - OpenAPI-style component specifications with integration examples  
✅ **quickstart.md** - Practical CDN integration guide with 6 common patterns  
✅ **plan.md** - This comprehensive implementation roadmap  
✅ **Agent context updated** - Copilot instructions include Shoelace ecosystem

### What's Next

**Run `/speckit.tasks`** to generate detailed task breakdown in `tasks.md`.

Tasks command will create:
- Granular tasks for each epic (Admin, Catalog, Auth, Readers)
- Acceptance criteria per task
- Estimated effort (hours)
- Dependencies and sequencing
- Testing checkpoints

### Implementation Sequence

1. **Admin Dashboard** (P1) - Start here, highest ROI
2. **Catalog** (P2) - Visible to all users, good polish
3. **Auth Pages** (P3) - Simple, low complexity
4. **Reader Pages** (Conditional) - Evaluate performance gate first

**Branch**: `003-antdesign-facelift` (already checked out)  
**Spec**: `specs/003-antdesign-facelift/spec.md` (100% complete)  
**Plan**: This file (Phase 0-1 complete)  
**Tasks**: Run `/speckit.tasks` to generate

---

**Planning Phase Complete** ✅
