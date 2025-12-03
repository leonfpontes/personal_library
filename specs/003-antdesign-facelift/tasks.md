# Tasks: Shoelace UI Modernization (Pivot from AntDesign)

**Feature**: 003-antdesign-facelift  
**Input**: Design documents from `/specs/003-antdesign-facelift/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅ (Shoelace pivot), data-model.md ✅, contracts/shoelace-components.yaml ✅, quickstart.md ✅

**Technology Stack**: Shoelace UI v2.12+ (Web Components via CDN), HTML5, CSS3, Vanilla JavaScript ES6+

**Tests**: Not explicitly requested in specification - tasks focus on implementation and manual testing

**Note**: Originally specified as "AntDesign" but research phase (research.md) determined Shoelace UI is the correct implementation path due to React dependency in AntD and constitutional requirement for static architecture.

---

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3, US4)
- File paths are absolute from repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Shoelace CDN integration baseline

- [X] T001 Document Shoelace pivot decision in `specs/003-antdesign-facelift/research.md` (already complete - verify exists)
- [X] T002 Create Shoelace theme tokens mapping in `styles/base.css` - define CSS variables for --sl-color-primary-600, --sl-color-neutral-* for light/dark/sepia themes
- [X] T003 [P] Add Shoelace CDN preconnect hint in template header: `<link rel="preconnect" href="https://cdn.jsdelivr.net">`
- [X] T004 [P] Create reusable notification utilities in `scripts/notifications.js` - showSuccessAlert(), showErrorAlert() using `<sl-alert>` toast pattern

**Checkpoint**: Foundation ready - Shoelace theme configured, utilities available for all pages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Baseline performance measurement - capture current FCP/TTI for admin.html, index.html, vivencia_pombogira.html using Chrome DevTools Network waterfall
- [X] T006 Create Shoelace integration test page `test-shoelace.html` - verify CDN loading, basic components (<sl-button>, <sl-card>), theme switching works
- [X] T007 Validate Shoelace components inventory - confirm `<sl-drawer>`, `<sl-dialog>`, `<sl-input>`, `<sl-select>`, `<sl-card>`, `<sl-tag>`, `<sl-button>`, `<sl-tooltip>`, `<sl-progress-bar>`, `<sl-alert>` are available via CDN autoloader
- [X] T008 Define custom table styles in `styles/base.css` - create .shoelace-table class using Shoelace design tokens (--sl-spacing-*, --sl-color-neutral-*, --sl-border-radius-*)

**Checkpoint**: Foundation verified - Shoelace loads correctly, theme system compatible, performance baseline captured

---

## Phase 3: User Story 1 - Admin User Management with Shoelace Components (Priority: P1) 🎯 MVP

**Goal**: Modernize admin dashboard with Shoelace Table, Drawer, Form, Dialog components while preserving all CRUD and grants functionality

**Independent Test**: Login as admin at `/auth/admin.html`, create new user via drawer form, edit existing user, assign book permissions via grants dialog, verify all operations persist to PostgreSQL and table updates reflect changes

### Implementation for User Story 1

- [X] T009 [P] [US1] Load Shoelace CDN in `auth/admin.html` - add stylesheet link and autoloader script to `<head>`
- [X] T010 [P] [US1] Replace "Novo Usuário" button with `<sl-button variant="primary">` in `auth/admin.html`
- [X] T011 [US1] Convert existing HTML table to semantic `<table>` with Shoelace styling in `auth/admin.html` - apply .shoelace-table class, preserve existing column structure (Nome, Email, CPF, Admin, Ações)
- [X] T012 [US1] Implement client-side table sorting in `scripts/admin.js` - add click handlers to <th> elements, sort users array by column, re-render tbody
- [X] T013 [US1] Implement client-side table filtering in `scripts/admin.js` - add search input above table, filter users array by name/email/cpf, re-render tbody
- [X] T014 [US1] Create user create drawer in `auth/admin.html` - add `<sl-drawer label="Novo Usuário" id="createDrawer" placement="end">` with form fields
- [X] T015 [US1] Add Shoelace form inputs to create drawer in `auth/admin.html` - `<sl-input label="Nome" ...>`, `<sl-input type="email" ...>`, `<sl-input label="CPF" ...>`, `<sl-input type="password" ...>`, `<sl-checkbox>`
- [X] T016 [US1] Implement create drawer open/close logic in `scripts/admin.js` - newUserBtn abre drawer, submit dispara POST /api/users
- [X] T017 [US1] Create user edit drawer in `auth/admin.html` - `<sl-drawer label="Editar Usuário" id="editDrawer">` com mesma estrutura
- [X] T018 [US1] Implement edit drawer population in `scripts/admin.js` - função editUser preenche campos e abre drawer
- [X] T019 [US1] Implement edit drawer save logic in `scripts/admin.js` - submit PATCH /api/users?userId=, fecha drawer e atualiza tabela
- [X] T020 [US1] Add action buttons to table rows in `auth/admin.html` - replace edit/delete links with `<sl-button size="small"><sl-icon name="pencil"></sl-icon></sl-button>` and `<sl-button size="small" variant="danger"><sl-icon name="trash"></sl-icon></sl-button>`
- [X] T021 [US1] Create grants dialog in `auth/admin.html` - add `<sl-dialog label="Permissões de Acesso" id="grantsModal">` with checkbox group for books
- [X] T022 [US1] Implement grants dialog population in `scripts/admin.js` - fetch grants via GET /api/grants/:userId, render `<sl-checkbox value="book_id" checked>` for each book
- [X] T023 [US1] Implement grants save logic in `scripts/admin.js` - collect checked book IDs, submit via PUT /api/grants/:userId, show success notification
- [X] T024 [US1] Add loading states to admin forms in `scripts/admin.js` - set submitButton.loading = true during API calls, disable form inputs, reset on completion
- [X] T025 [US1] Replace success/error alerts with Shoelace notifications in `scripts/admin.js` - use showSuccessAlert() / showErrorAlert() from notifications.js for all CRUD operations
- [X] T026 [US1] Add form validation feedback in `auth/admin.html` - ensure Shoelace shows invalid state (red borders) on required fields when form.checkValidity() fails
- [X] T027 [US1] Test admin dashboard theme switching - verify Shoelace components adapt to light/dark/sepia themes via CSS variables in base.css

**Checkpoint**: Admin dashboard fully functional with Shoelace - create/edit/delete users via drawers, assign permissions via dialog, table sorting/filtering works, all operations persist correctly

---

## Phase 4: User Story 2 - Library Catalog Enhanced with Shoelace (Priority: P2)

**Goal**: Modernize catalog page with Shoelace Cards, Tags, and Select filter while preserving current layout structure and responsiveness

**Independent Test**: Access `index.html`, view book cards rendered with Shoelace styling, select multiple tags in filter dropdown, verify cards filter instantly without page reload, test mobile responsive layout (cards stack in single column)

### Implementation for User Story 2

- [X] T028 [P] [US2] Load Shoelace CDN in `index.html` - add stylesheet link and autoloader script to `<head>`
- [X] T029 [P] [US2] Convert existing book cards to `<sl-card>` in `index.html` - wrap each book article with `<sl-card>`, move title to header slot, description to default slot, "Ler manuscrito →" link to footer slot
- [X] T030 [US2] Replace tag spans with `<sl-tag size="small" variant="primary">` in `index.html` - convert existing category tags for each book card
- [X] T031 [US2] Add Shoelace Select filter above catalog grid in `index.html` - create `<sl-select label="Filtrar por categoria" multiple clearable id="tagFilter">` with `<sl-option>` for each unique tag
- [X] T032 [US2] Implement tag filtering logic in `index.html` script section - listen to 'sl-change' event, get selected values, show/hide cards via style.display based on data-tags attribute match
- [X] T033 [US2] Update CSS Grid for Shoelace cards in `index.html` style section - ensure grid-template-columns respects Shoelace card dimensions, use --sl-spacing-large for gap
- [X] T034 [US2] Add hover effects to Shoelace cards - verify `<sl-card>` applies elevation/shadow on :hover (native Shoelace behavior, may need CSS override)
- [X] T035 [US2] Test catalog responsive layout - verify cards display 3 columns on desktop (>1024px), 2 columns on tablet (768-1024px), 1 column on mobile (<768px)
- [X] T036 [US2] Test catalog theme switching - verify Shoelace cards adapt colors to light/dark/sepia themes, logo swap still works
- [X] T037 [US2] Validate institutional branding in catalog header - ensure logo variants (black/white) swap correctly per theme using existing MutationObserver logic

**Checkpoint**: Catalog fully modernized with Shoelace - cards render correctly, tag filtering works instantly, responsive layout maintained, theme switching functional

---

## Phase 5: User Story 4 - Login/Logout Pages with Shoelace Form (Priority: P3)

**Goal**: Modernize authentication pages with Shoelace form inputs, validation feedback, and loading states

**Independent Test**: Access `/auth/login.html`, submit form with empty fields (verify inline validation shows), enter valid credentials (verify loading spinner appears), successful login shows success notification before redirect

### Implementation for User Story 4

- [X] T038 [P] [US4] Load Shoelace CDN in `auth/login.html` - add stylesheet link and autoloader script to `<head>`
- [X] T039 [P] [US4] Replace email input with `<sl-input type="email" label="Email" name="email" required autocomplete="username">` in `auth/login.html`
- [X] T040 [P] [US4] Replace password input with `<sl-input type="password" label="Senha" name="password" required toggle-password autocomplete="current-password">` in `auth/login.html`
- [X] T041 [US4] Replace submit button with `<sl-button type="submit" variant="primary">Entrar</sl-button>` in `auth/login.html`
- [X] T042 [US4] Implement form validation in login script - call form.checkValidity() before submission, show validation messages via form.reportValidity() if invalid
- [X] T043 [US4] Add loading state to login button in login script - set loginButton.loading = true during authentication API call, reset on response
- [X] T044 [US4] Replace error message div with Shoelace alert in login script - use showErrorAlert() from notifications.js for authentication failures
- [X] T045 [US4] Add success notification before redirect in login script - use showSuccessAlert('Login realizado com sucesso!') before window.location.href = '/index.html'
- [X] T046 [P] [US4] Load Shoelace CDN in `auth/logout.html` - add stylesheet link and autoloader script to `<head>`
- [X] T047 [US4] Add logout confirmation with `<sl-alert variant="success" open>` in `auth/logout.html` - show "Logout realizado com sucesso" message before redirect
- [ ] T048 [US4] Test login form theme switching - verify Shoelace inputs adapt to light/dark/sepia themes
- [ ] T049 [US4] Test login form validation - submit empty form, verify Shoelace shows red borders and error messages for required fields

**Checkpoint**: Auth pages fully modernized with Shoelace - form validation visual feedback works, loading states display during authentication, success/error notifications appear correctly

---

## Phase 6: User Story 3 - Reader Pages Header/Footer with Shoelace (Priority: P3) ⚠️ CONDITIONAL

**Goal**: Modernize reader page controls with Shoelace buttons, tooltips, and progress bar while preserving all existing functionality (font size, theme, scroll tracking)

**CRITICAL GATE**: Measure performance impact BEFORE implementing. If Shoelace loading increases FCP >10% on reader pages, SKIP this phase entirely and keep vanilla HTML controls.

**Independent Test**: Access `/livros/vivencia_pombogira.html`, use font increase/decrease buttons (verify localStorage updates), toggle theme (verify cycling light→dark→sepia), scroll down (verify progress bar updates, back-to-top button appears at 600px)

### Performance Gate

- [ ] T050 [US3] Measure baseline reader page performance - capture FCP/TTI for `livros/vivencia_pombogira.html` WITHOUT Shoelace, record waterfall times
- [ ] T051 [US3] Create test reader page with Shoelace - copy `vivencia_pombogira.html` to `vivencia_pombogira_test.html`, add Shoelace CDN, measure FCP/TTI
- [ ] T052 [US3] **DECISION GATE**: Compare performance metrics - if FCP increase >10% (e.g., 800ms → 880ms+), ABORT Phase 6 and document rationale in research.md; otherwise proceed with T053+

### Implementation for User Story 3 (IF performance gate passes)

- [ ] T053 [P] [US3] Load Shoelace CDN in `livros/vivencia_pombogira.html` - add stylesheet link and autoloader script to `<head>`
- [ ] T054 [P] [US3] Replace font increase button with `<sl-tooltip content="Aumentar fonte"><sl-button id="fontIncrease" size="small" circle><sl-icon name="plus"></sl-icon></sl-button></sl-tooltip>` in vivencia_pombogira.html
- [ ] T055 [P] [US3] Replace font decrease button with Shoelace equivalent in vivencia_pombogira.html
- [ ] T056 [P] [US3] Replace theme toggle button with `<sl-tooltip content="Trocar tema"><sl-button id="themeToggle" size="small" circle><sl-icon name="sun"></sl-icon></sl-button></sl-tooltip>` in vivencia_pombogira.html
- [ ] T057 [US3] Update theme toggle icon in reader script - change icon name from 'sun' to 'moon' when theme is dark using button.querySelector('sl-icon').name = 'moon'
- [ ] T058 [US3] Replace progress bar with `<sl-progress-bar value="0" id="readingProgress"></sl-progress-bar>` in vivencia_pombogira.html header
- [ ] T059 [US3] Update progress bar value in scroll listener - set document.getElementById('readingProgress').value = scrollPercent
- [ ] T060 [US3] Replace back-to-top button with Shoelace button (fixed positioning via CSS) in vivencia_pombogira.html
- [ ] T061 [US3] Verify font size persistence still works - test fontIncrease/Decrease buttons update localStorage 'font-size' and apply --content-size CSS variable
- [ ] T062 [US3] Verify theme persistence still works - test themeToggle cycles through light→dark→sepia, updates localStorage 'theme-index', applies data-theme attribute
- [ ] T063 [US3] Test watermark adaptation - verify canvas watermark colors change correctly (black/light-sepia, white/dark) with Shoelace components present
- [ ] T064 [P] [US3] Apply same Shoelace updates to `livros/guia_de_ervas.html` - replicate T053-T063 steps
- [ ] T065 [P] [US3] Apply same Shoelace updates to `livros/aula_iansa.html` - replicate T053-T063 steps
- [ ] T066 [P] [US3] Apply same Shoelace updates to `livros/aula_oba.html` - replicate T053-T063 steps
- [ ] T067 [P] [US3] Apply same Shoelace updates to `livros/aula_oya_loguna.html` - replicate T053-T063 steps
- [ ] T068 [US3] Final performance validation - measure FCP/TTI for all 5 reader pages with Shoelace, confirm <10% degradation from baseline captured in T050

**Checkpoint (if implemented)**: Reader pages modernized with Shoelace controls - buttons have tooltips, progress bar renders correctly, theme/font controls maintain localStorage functionality, performance criteria met

**Checkpoint (if skipped)**: Reader pages remain with vanilla HTML controls to preserve performance - document decision and rationale in research.md

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and cross-browser validation

- [ ] T069 [P] Update `.github/agents/copilot-instructions.md` - add Shoelace UI integration patterns and component usage examples (already updated via script - verify completeness)
- [ ] T070 [P] Create Shoelace migration guide in `specs/003-antdesign-facelift/MIGRATION_NOTES.md` - document common patterns used, CDN integration steps, theme token mappings
- [ ] T071 Update `README.md` - add section about Shoelace UI integration with link to quickstart.md and migration notes
- [ ] T072 Final cross-browser testing - validate admin, catalog, auth, and (conditionally) reader pages in Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- [ ] T073 Mobile responsiveness validation - test all pages on mobile viewport (375px, 768px breakpoints), verify Shoelace Grid adapts correctly
- [ ] T074 Theme switching validation - cycle through light→dark→sepia on all modernized pages, verify CSS variables apply correctly to Shoelace components
- [ ] T075 Accessibility audit - test keyboard navigation (Tab, Enter, Esc) on drawers, dialogs, and form inputs; verify screen reader announcements for Shoelace components
- [ ] T076 Performance final check - compare FCP/TTI metrics post-migration against baseline from T005, confirm <10% degradation criterion met
- [ ] T077 Functional regression testing - verify all original functionality works: CRUD users, grants assignment, login/logout, theme/font persistence, watermark, logo swap
- [ ] T078 Create production checklist in `specs/003-antdesign-facelift/DEPLOYMENT_CHECKLIST.md` - list pre-deployment validation steps, rollback plan, monitoring targets

**Checkpoint**: Feature complete, tested, documented, and ready for production deployment

---

## Dependencies & Story Completion Order

### Dependency Graph

```
Phase 1 (Setup) → Phase 2 (Foundational) → [User Stories can run in parallel]
                                           ├─→ Phase 3 (US1 - Admin) [P1] 🎯 MVP
                                           ├─→ Phase 4 (US2 - Catalog) [P2]
                                           ├─→ Phase 5 (US4 - Auth) [P3]
                                           └─→ Phase 6 (US3 - Readers) [P3] [CONDITIONAL]
                                                      ↓
                                             Phase 7 (Polish)
```

### Story Completion Order (Recommended)

**Minimum Viable Product (MVP)**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only)

**Incremental Delivery**:
1. **Sprint 1 (MVP)**: T001-T027 (Setup + Foundational + US1 Admin) - ~5-7 days
2. **Sprint 2**: T028-T037 (US2 Catalog) - ~2-3 days
3. **Sprint 3**: T038-T049 (US4 Auth) - ~1-2 days
4. **Sprint 4 (Conditional)**: T050-T068 (US3 Readers - if performance allows) - ~3-4 days OR skip if gate fails
5. **Sprint 5**: T069-T078 (Polish & Documentation) - ~1-2 days

**Total Estimated Effort**: 12-18 days (excluding US3 if skipped due to performance)

### Independent Testing Per Story

- **US1 (Admin)**: Create user via drawer → Edit user via drawer → Assign grants via dialog → Verify PostgreSQL persistence
- **US2 (Catalog)**: Load index.html → Select tag filter → Verify cards filter → Test mobile responsive layout
- **US4 (Auth)**: Submit empty login form (validation) → Login with valid creds (loading + success) → Verify redirect
- **US3 (Readers)**: Increase font (localStorage + CSS) → Toggle theme (localStorage + attribute) → Scroll (progress + back-to-top)

---

## Parallel Execution Opportunities

### Within Phase 3 (US1 - Admin)

**Parallel Group A** (T009-T010): Load CDN + Replace button (different sections of admin.html)
**Sequential**: T011-T013 (Table conversion → Sorting → Filtering - same file, dependent logic)
**Parallel Group B** (T014-T015, T017): Create drawers and form inputs (independent markup additions)
**Sequential**: T016, T018-T019 (Drawer logic - depends on drawer HTML existing)
**Sequential**: T020-T023 (Action buttons → Grants dialog → Population → Save - logical flow)
**Parallel Group C** (T024-T026): Loading states + Notifications + Validation (independent script enhancements)
**Final**: T027 (Theme testing - validates all previous work)

### Within Phase 4 (US2 - Catalog)

**Parallel Group A** (T028-T030): CDN + Card conversion + Tag conversion (independent markup changes)
**Sequential**: T031-T032 (Filter Select → Filtering logic - dependent)
**Parallel Group B** (T033-T034): CSS Grid + Hover effects (independent styling)
**Final Parallel** (T035-T037): Responsive + Theme + Branding tests (independent validations)

### Within Phase 5 (US4 - Auth)

**Parallel Group A** (T038-T041): All login.html form input replacements (independent markup)
**Sequential**: T042-T045 (Form validation → Loading → Notifications - logical flow)
**Parallel Group B** (T046-T047): logout.html CDN + Alert (independent file)
**Final Parallel** (T048-T049): Theme test + Validation test (independent validations)

### Within Phase 6 (US3 - Readers) - IF IMPLEMENTED

**Sequential Gate**: T050-T052 MUST complete before any implementation tasks
**If gate passes**:
  - **Parallel Group A** (T053-T056): CDN + Button replacements (vivencia_pombogira.html)
  - **Sequential**: T057-T062 (Icon updates + Progress bar + Persistence verification - dependent logic)
  - **Parallel Group B** (T064-T067): Apply to other 4 reader HTML files (independent files)
  - **Final**: T063, T068 (Watermark test + Performance validation - validates all)

### Phase 7 (Polish)

**Parallel Group A** (T069-T071): Documentation updates (independent files)
**Sequential**: T072-T077 (Testing flow - each validates previous work)
**Final**: T078 (Deployment checklist - synthesizes all learnings)

---

## Implementation Strategy

### MVP First

**Phase 3 (User Story 1 - Admin Dashboard)** is the MVP. It delivers the highest value feature:
- Improves admin efficiency (30% faster CRUD operations per success criteria)
- Modernizes most critical interface (permission management)
- Validates Shoelace integration approach for remaining stories
- Can be deployed independently without other stories

**MVP Deployment**: After T027 completes, admin dashboard can go to production while remaining stories continue development.

### Incremental Delivery

Each user story is independently testable and deployable:
- **US1 (Admin)** → Deploy to production
- **US2 (Catalog)** → Deploy when ready (doesn't block US4 or US3)
- **US4 (Auth)** → Deploy when ready (improves login UX)
- **US3 (Readers)** → Deploy ONLY if performance gate passes at T052

### Conditional Implementation (US3 - Readers)

**Performance gate at T052 is CRITICAL**:
- If FCP increase <10%: Proceed with Shoelace modernization (T053-T068)
- If FCP increase ≥10%: SKIP Phase 6 entirely, document decision, keep vanilla HTML

**Rationale**: Reader pages are content-focused. Markdown rendering performance is paramount. Shoelace UI polish is secondary to reading experience. Constitutional Principle I (Content-First) takes precedence.

### Rollback Strategy

Each phase can be rolled back independently by reverting specific file changes:
- **Phase 3**: Revert `auth/admin.html` + `scripts/admin.js`
- **Phase 4**: Revert `index.html`
- **Phase 5**: Revert `auth/login.html` + `auth/logout.html`
- **Phase 6**: Revert `livros/*.html` (5 files)

Shared infrastructure (Phase 1-2) can remain even if user stories are rolled back - Shoelace CDN only loads components actually used on pages.

---

## Task Summary

**Total Tasks**: 78
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 4 tasks
- Phase 3 (US1 - Admin): 19 tasks [P1] 🎯 MVP
- Phase 4 (US2 - Catalog): 10 tasks [P2]
- Phase 5 (US4 - Auth): 12 tasks [P3]
- Phase 6 (US3 - Readers): 19 tasks [P3] **CONDITIONAL** (skip if performance gate fails)
- Phase 7 (Polish): 10 tasks

**Parallelizable Tasks**: 28 marked with [P]
**User Story Tasks**: 60 (19 US1 + 10 US2 + 12 US4 + 19 US3)
**Independent Test Criteria**: 4 user stories, each with clear validation steps

**MVP Scope**: Phase 1 (T001-T004) + Phase 2 (T005-T008) + Phase 3 (T009-T027) = 27 tasks

**Estimated Timeline**:
- MVP (Admin): 5-7 days
- Full feature (excl. Readers): 10-12 days
- Full feature (incl. Readers): 15-18 days

**Next Steps**: Start with T001 (verify research.md pivot documentation), proceed sequentially through Setup and Foundational phases, then begin MVP implementation (US1 Admin dashboard).
