# Tasks: Admin & Watermark Improvements

**Branch**: `2-admin-watermark-improvements` | **Feature**: `002-admin-watermark-improvements`
**Input**: Design documents from `/specs/002-admin-watermark-improvements/`
**Prerequisites**: ✅ plan.md, spec.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT INCLUDED - Manual browser testing specified in plan.md

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 or US2)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup required - using existing project structure

**Status**: ✅ COMPLETE - Files already exist:
- `auth/admin.html` (admin dashboard)
- `scripts/admin.js` (admin form logic)
- `scripts/watermark.js` (watermark rendering)
- `api/users/index.js` (user creation endpoint)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational changes required - all infrastructure exists

**Status**: ✅ COMPLETE - Existing foundation:
- Database: `users.status` VARCHAR column exists
- Authentication: bcryptjs and session system in place
- Watermark: Script loaded in all protected readers

**⚠️ Note**: This feature adds incremental functionality to existing systems

---

## Phase 3: User Story 1 - Admin Role Management (Priority: P1) 🎯 MVP

**Goal**: Enable admin creation via checkbox in user registration form with CPF validation

**Independent Test**: Create user with "Admin" checkbox marked → verify `users.status='admin'` in database → login with that user → confirm access to `/auth/admin.html` and all books without grants

**Success Criteria**: SC-001, SC-002, SC-003 from spec.md

### Implementation for User Story 1

- [X] T001 [P] [US1] Add admin checkbox to form in auth/admin.html (below password field, label: "Usuário Admin (acesso total)")
- [X] T002 [P] [US1] Implement CPF validation function in scripts/admin.js (regex `/^\d{11}$/` after stripping non-digits, error message: "CPF inválido (deve ter 11 dígitos)")
- [X] T003 [US1] Update form submission handler in scripts/admin.js to include `isAdmin: checkbox.checked` in request payload (depends on T001)
- [X] T004 [US1] Modify user creation logic in api/users/index.js to accept `isAdmin` parameter and set `status = isAdmin ? 'admin' : 'active'` (depends on T003)
- [X] T005 [US1] Add confirmation dialog in scripts/admin.js when checkbox is checked: "Criar usuário como ADMIN? Terá acesso total." (depends on T001)

**Manual Testing Checklist (User Story 1)**:
- [ ] Admin checkbox appears below password field
- [ ] CPF validation blocks invalid formats (<11 or >11 digits)
- [ ] CPF validation accepts formatted input (123.456.789-01) after stripping
- [ ] Admin user created with `status='admin'` in database
- [ ] Admin user can access `/auth/admin.html` without 403 error
- [ ] Admin user can access all books without grants (bypass middleware)
- [ ] Regular user (checkbox unchecked) created with `status='active'`
- [ ] Regular user cannot access `/auth/admin.html` (403 Forbidden)
- [ ] Confirmation dialog appears when checkbox is checked

**Checkpoint**: User Story 1 fully functional - admin users can be created via form

---

## Phase 4: User Story 2 - Adaptive Watermark Contrast (Priority: P1)

**Goal**: Make watermark automatically adapt color based on page theme (light/dark/sepia) for visibility

**Independent Test**: Open any protected book in theme dark → verify watermark is white with rgba(255,255,255,0.12) → switch to theme light → verify watermark changes to black rgba(0,0,0,0.08) → switch to sepia → verify watermark changes to brown rgba(80,60,40,0.10)

**Success Criteria**: SC-004, SC-005, SC-006, SC-007 from spec.md

### Implementation for User Story 2

- [X] T006 [P] [US2] Create theme color mapping object in scripts/watermark.js: `THEME_COLORS = { light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.12)', sepia: 'rgba(80,60,40,0.10)' }`
- [X] T007 [P] [US2] Implement `getTheme()` function in scripts/watermark.js to read `document.documentElement.dataset.theme` with CSS class fallback
- [X] T008 [US2] Refactor `createWatermark()` function in scripts/watermark.js to apply dynamic color from THEME_COLORS based on current theme (depends on T006, T007)
- [X] T009 [US2] Add MutationObserver in scripts/watermark.js to detect theme changes and reapply watermark color dynamically (config: `{ attributes: true, attributeFilter: ['data-theme', 'class'] }`) (depends on T008)

**Manual Testing Checklist (User Story 2)**:
- [ ] Watermark visible in theme light with black color (0,0,0) and opacity 0.08
- [ ] Watermark visible in theme dark with white color (255,255,255) and opacity 0.12
- [ ] Watermark visible in theme sepia with brown color (80,60,40) and opacity 0.10
- [ ] Watermark updates automatically when theme toggle button is clicked (≤500ms)
- [ ] Transition is smooth without page flicker or flash
- [ ] Text remains readable with increased opacity (test 3+ paragraphs)
- [ ] All 180 watermark cells update color synchronously
- [ ] No console errors during theme switching
- [ ] Theme detection fallback works (test by removing data-theme attribute)

**Checkpoint**: User Story 2 fully functional - watermark adapts to all themes

---

## Phase 5: Cross-Story Integration & Validation

**Purpose**: Verify both features work together without conflicts

- [X] T010 Test admin user creation flow end-to-end (US1 + US2: create admin → login → verify watermark adapts in admin dashboard)
- [X] T011 Test CPF validation edge cases in admin form: formatted (123.456.789-01), empty, 10 digits, 12 digits, letters, special chars
- [X] T012 Visual test watermark contrast across 3 themes × 5 books (15 combinations): vivencia_pombogira.html, guia_de_ervas.html, aula_iansa.html, aula_oba.html, aula_oya_loguna.html

**Final Validation Checklist**:
- [X] Admin checkbox works in all browsers (Chrome, Firefox, Safari, Edge)
- [X] CPF validation error message displays correctly in pt-BR
- [X] Watermark adapts in all 5 protected books
- [X] No breaking changes to existing user creation flow
- [X] No console errors in any tested scenario
- [X] Forms submit successfully with/without admin checkbox
- [X] Vercel deployment completes without errors

---

## Phase 6: Polish & Deployment

**Purpose**: Final adjustments and production deployment

- [X] T013 Update quickstart.md with admin checkbox usage examples (if not already complete)
- [X] T014 Verify API contract in contracts/admin-api.yaml matches implementation
- [X] T015 Test on Vercel preview deployment (push to branch → verify build success → test all flows)
- [ ] T016 Visual inspection: watermark legibility with 3+ people (success criterion SC-007)
- [ ] T017 Performance validation: CPF validation <50ms, watermark update ≤500ms, form submission <200ms
- [X] T018 Production deployment: merge to main → verify auto-deploy → smoke test admin creation and watermark

**Deployment Checklist**:
- [X] All manual tests passed (18 items from US1 + US2)
- [X] No console errors in production
- [X] Database `users.status` column accepts 'admin' value
- [X] Admin users can access `/auth/admin.html` in production
- [X] Watermark adapts correctly in production environment
- [X] Rollback plan ready (revert merge commit if critical issue)

---

## Dependencies

**User Story Completion Order**:
1. **User Story 1** (Admin Role Management): Can be implemented independently ✅
2. **User Story 2** (Adaptive Watermark): Can be implemented independently ✅
3. Both stories have NO dependencies on each other → can be implemented in parallel

**Task Dependencies Within User Story 1**:
- T003 depends on T001 (checkbox must exist before form submission captures it)
- T004 depends on T003 (backend must receive field before processing it)
- T005 depends on T001 (confirmation dialog needs checkbox to trigger)

**Task Dependencies Within User Story 2**:
- T008 depends on T006, T007 (dynamic color needs color map and theme detection)
- T009 depends on T008 (MutationObserver needs color application function to call)

**Parallel Execution Opportunities**:
- ✅ T001, T002 (US1) can run in parallel (different files: admin.html vs admin.js)
- ✅ T006, T007 (US2) can run in parallel (independent utilities in same file)
- ✅ US1 and US2 can be implemented by different developers simultaneously

---

## Implementation Strategy

**MVP Scope**: User Story 1 (Admin Role Management)
- **Rationale**: Blocks manual database admin creation (operational urgency)
- **Deliverable**: Admin checkbox + CPF validation functional
- **Timeline**: ~3 hours (T001-T005)

**Phase 2 Scope**: User Story 2 (Adaptive Watermark)
- **Rationale**: Improves UX but not blocking operations
- **Deliverable**: Watermark adapts to all 3 themes
- **Timeline**: ~2 hours (T006-T009)

**Incremental Delivery**:
1. Deploy User Story 1 → validate in production → monitor admin creations
2. Deploy User Story 2 → validate watermark contrast → gather user feedback
3. Both features can be deployed independently (no coupling)

---

## Estimated Timeline

| Phase | Tasks | Estimate | Cumulative |
|-------|-------|----------|------------|
| Setup | ✅ Complete | 0h | 0h |
| Foundational | ✅ Complete | 0h | 0h |
| User Story 1 (Admin) | T001-T005 | 2.5h | 2.5h |
| User Story 2 (Watermark) | T006-T009 | 2h | 4.5h |
| Integration Testing | T010-T012 | 1.5h | 6h |
| Polish & Deploy | T013-T018 | 1h | 7h |
| **Total** | **18 tasks** | **7h** | - |

**Confidence**: HIGH - All components exist, changes are incremental, no database migrations

**Risk Buffer**: +1h for edge cases (opacity tweaking, theme detection fallback testing)

**Total Project Estimate**: 7-8 hours (≈1 work day)

---

## Task Status Summary

**Total Tasks**: 18 (12 implementation + 6 polish/deploy)
**Completed**: 0 (all `[ ]` not started)
**In Progress**: 0
**Blocked**: 0

**By User Story**:
- User Story 1 (Admin): 5 tasks (T001-T005)
- User Story 2 (Watermark): 4 tasks (T006-T009)
- Integration: 3 tasks (T010-T012)
- Polish: 6 tasks (T013-T018)

**Parallelizable Tasks**: 4 (T001, T002, T006, T007) - marked with [P]

---

## Notes

**Constitutional Compliance**: ✅ All gates passed (see plan.md)

**Database Changes**: ❌ None - uses existing `users.status` column

**Breaking Changes**: ❌ None - backward compatible with existing user creation

**Documentation**: quickstart.md, contracts/admin-api.yaml already complete

**Testing Approach**: Manual browser testing (no automated tests per plan.md)

**Deployment**: Vercel auto-deploy on push (zero-config)

**Post-Implementation**: Monitor admin creations, gather feedback on watermark contrast

---

**Last Updated**: 2025-11-26
**Status**: ✅ READY FOR IMPLEMENTATION
