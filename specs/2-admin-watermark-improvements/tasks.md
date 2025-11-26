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

## Phase 4.5: User Story 3 - CPF Input Mask (Priority: P1)

**Goal**: Add visual formatting to CPF field while user types (123.456.789-01)

**Independent Test**: Type CPF digits → verify automatic formatting with dots and dash → verify only numbers accepted

**Success Criteria**: SC-009 from spec.md

### Implementation for User Story 3

- [X] T019 [P] [US3] Add input event listener to CPF field in scripts/admin.js to format as user types (pattern: `###.###.###-##`)
- [X] T020 [P] [US3] Implement `formatCPF(value)` function that adds dots and dash at correct positions (3 digits, dot, 3 digits, dot, 3 digits, dash, 2 digits)
- [X] T021 [US3] Block non-numeric characters in CPF field using `keypress` event (allow only 0-9, backspace, delete, arrows) (depends on T019)
- [X] T022 [US3] Update form submission to strip formatting before validation (use existing `validateCPF` which already strips) (depends on T020)

**Manual Testing Checklist (User Story 3)**:
- [ ] Type "12345678901" → field shows "123.456.789-01" automatically
- [ ] Try typing letters → characters are blocked (only numbers accepted)
- [ ] Paste "123.456.789-01" → formatting is preserved
- [ ] Paste "12345678901" → formatting is applied automatically
- [ ] Form submission strips formatting and validates correctly
- [ ] Backspace/delete work correctly with formatting

**Checkpoint**: CPF field has visual mask, improving UX and reducing errors

---

## Phase 4.6: User Story 4 - Edit User (Priority: P1)

**Goal**: Enable editing of existing users (name, email, CPF, password, admin status)

**Independent Test**: Click "Editar" button → form populates with current data → change name → save → verify update in database and table

**Success Criteria**: SC-010, SC-014 from spec.md

### Implementation for User Story 4

- [X] T023 [P] [US4] Add "Editar" button to each row in users table (auth/admin.html)
- [X] T024 [P] [US4] Implement `editUser(userId)` function in scripts/admin.js to fetch user data and populate form
- [X] T025 [US4] Add hidden field `editingUserId` to track edit mode vs create mode (depends on T024)
- [X] T026 [US4] Update form submit handler to detect edit mode and send PATCH instead of POST (depends on T025)
- [X] T027 [US4] Implement PATCH `/api/users/:userId` endpoint in api/users/index.js (validate admin, check uniqueness, hash password if provided) (depends on T026)
- [X] T028 [US4] Add "Cancelar edição" button to reset form to create mode (depends on T025)
- [X] T029 [US4] Block self-edit: check if editing current logged-in user and show warning (depends on T024)
- [X] T030 [US4] Update database function `updateUser(userId, data)` in auth/db.js to handle partial updates (depends on T027)

**Manual Testing Checklist (User Story 4)**:
- [ ] Click "Editar" → form fields populate with user data
- [ ] Edit name only → save → name updates, other fields unchanged
- [ ] Edit email to duplicate → shows error "Email já cadastrado"
- [ ] Edit CPF to duplicate → shows error "CPF já cadastrado"
- [ ] Leave password empty → save → password remains unchanged
- [ ] Enter new password → save → password is updated (test login)
- [ ] Check "Admin" for regular user → save → user becomes admin
- [ ] Uncheck "Admin" for admin user → save → user becomes regular
- [ ] Try to edit own account → blocked with warning message
- [ ] Click "Cancelar" → form returns to create mode

**Checkpoint**: Users can be edited without database access

---

## Phase 4.7: User Story 5 - Delete User (Priority: P2)

**Goal**: Enable deletion of users with confirmation dialog

**Independent Test**: Click "Excluir" button → confirm dialog → user disappears from table and database

**Success Criteria**: SC-011, SC-012 from spec.md

### Implementation for User Story 5

- [X] T031 [P] [US5] Add "Excluir" button to each row in users table (auth/admin.html)
- [X] T032 [P] [US5] Implement `deleteUser(userId, userName)` function in scripts/admin.js with confirmation dialog
- [X] T033 [US5] Show confirmation dialog: "Excluir usuário [nome]? Esta ação não pode ser desfeita." (depends on T032)
- [X] T034 [US5] Send DELETE `/api/users/:userId` request on confirmation (depends on T033)
- [X] T035 [US5] Implement DELETE endpoint in api/users/index.js (validate admin, block self-deletion, cascade grants) (depends on T034)
- [X] T036 [US5] Block self-deletion: check if deleting current logged-in user and return error (depends on T035)
- [X] T037 [US5] Update database function `deleteUser(userId)` in auth/db.js to cascade delete grants (depends on T035)

**Manual Testing Checklist (User Story 5)**:
- [ ] Click "Excluir" → confirmation dialog appears with user name
- [ ] Click "Cancelar" in dialog → user remains in table
- [ ] Click "OK" in dialog → user is removed from table
- [ ] Verify user deleted from database (check manually or try to login)
- [ ] Verify grants for deleted user are also removed
- [ ] Try to delete own account → blocked with error message
- [ ] Deleted user cannot login (credentials invalid)

**Checkpoint**: Users can be deleted safely with proper safeguards

---

## Phase 4.8: User Story 6 - Remove LGPD Checkbox (Priority: P3)

**Goal**: Remove consent checkbox until proper terms are in place

**Independent Test**: Open form → verify checkbox is not visible

**Success Criteria**: SC-013 from spec.md

### Implementation for User Story 6

- [X] T038 [US6] Remove LGPD checkbox `<label>` and `<input id="consent">` from auth/admin.html
- [X] T039 [US6] Remove `consent` field reference from form submission in scripts/admin.js (if present)
- [X] T040 [US6] Verify backend accepts requests without `consent` field (api/users/index.js) - should already work

**Manual Testing Checklist (User Story 6)**:
- [ ] LGPD checkbox not visible in form
- [ ] Form submits successfully without consent field
- [ ] User creation works normally without consent

**Checkpoint**: LGPD checkbox removed, form cleaner

---

## Phase 5: Cross-Story Integration & Validation (Updated)

**Purpose**: Verify all features work together without conflicts

- [ ] T041 Test complete user lifecycle: create → edit → delete (all fields, admin toggle)
- [ ] T042 Test CPF mask with edit form: verify formatting persists, validation works
- [ ] T043 Test admin user creation flow end-to-end (US1: create admin → login → verify watermark adapts)
- [ ] T044 Test CPF validation edge cases: formatted (123.456.789-01), empty, 10 digits, 12 digits, letters, special chars
- [ ] T045 Visual test watermark contrast across 3 themes × 5 books (15 combinations): vivencia_pombogira.html, guia_de_ervas.html, aula_iansa.html, aula_oba.html, aula_oya_loguna.html
- [ ] T046 Test edit/delete buttons do not appear for own user (self-edit/self-delete protection)
- [ ] T047 Test grants cleanup: create user → assign grants → delete user → verify grants removed
- [ ] T048 Test form reset: edit user → cancel → verify form returns to create mode

**Final Validation Checklist**:
- [ ] All CRUD operations work correctly (Create, Read, Update, Delete)
- [ ] CPF mask formats automatically while typing
- [ ] Admin checkbox works in all browsers (Chrome, Firefox, Safari, Edge)
- [ ] CPF validation error message displays correctly in pt-BR
- [ ] Edit/Delete buttons functional for all users except self
- [ ] Confirmation dialogs appear and work correctly
- [ ] Watermark adapts in all 5 protected books
- [ ] No breaking changes to existing user creation flow
- [ ] No console errors in any tested scenario
- [ ] Forms submit successfully with/without admin checkbox
- [ ] LGPD checkbox removed from form
- [ ] Vercel deployment completes without errors

---

## Phase 6: Polish & Deployment

**Purpose**: Final adjustments and production deployment

- [ ] T049 Update quickstart.md with examples: admin creation, user editing, user deletion
- [ ] T050 Verify API contract in contracts/admin-api.yaml matches implementation (PATCH and DELETE endpoints)
- [ ] T051 Test on Vercel preview deployment (push to branch → verify build success → test all CRUD flows)
- [ ] T052 Visual inspection: watermark legibility with 3+ people (success criterion SC-007)
- [ ] T053 Performance validation: CPF validation <50ms, CPF mask <100ms, watermark update ≤500ms, form submission <200ms
- [ ] T054 Production deployment: merge to main → verify auto-deploy → smoke test full CRUD + watermark

**Deployment Checklist**:
- [ ] All manual tests passed (50+ items across all user stories)
- [ ] No console errors in production
- [ ] Database `users.status` column accepts 'admin' value
- [ ] Admin users can access `/auth/admin.html` in production
- [ ] Edit/Delete operations work in production
- [ ] CPF mask applies correctly in production
- [ ] LGPD checkbox absent in production
- [ ] Watermark adapts correctly in production environment
- [ ] Rollback plan ready (revert merge commit if critical issue)

---

## Dependencies

**User Story Completion Order**:
1. **User Story 1** (Admin Role Management): ✅ COMPLETED
2. **User Story 2** (Adaptive Watermark): ✅ COMPLETED
3. **User Story 3** (CPF Mask): Can be implemented independently (depends on T002 validation logic)
4. **User Story 4** (Edit User): Depends on US1 (needs user creation working first)
5. **User Story 5** (Delete User): Can run parallel with US4 (both operate on existing users)
6. **User Story 6** (Remove LGPD): Independent, can be done anytime

**Task Dependencies Within User Story 3**:
- T021 depends on T019 (keypress blocking needs input listener context)
- T022 depends on T020 (submission needs formatting function to strip)

**Task Dependencies Within User Story 4**:
- T025 depends on T024 (edit mode tracking needs fetch logic)
- T026 depends on T025 (submit handler needs edit mode detection)
- T027 depends on T026 (backend needs frontend to send PATCH)
- T028 depends on T025 (cancel button needs edit mode to reset)
- T029 depends on T024 (self-edit check needs user ID comparison)
- T030 depends on T027 (database function called by API endpoint)

**Task Dependencies Within User Story 5**:
- T033 depends on T032 (confirmation dialog is part of delete function)
- T034 depends on T033 (API call happens after confirmation)
- T035 depends on T034 (backend receives request from frontend)
- T036 depends on T035 (self-deletion check in endpoint logic)
- T037 depends on T035 (database function called by API endpoint)

**Parallel Execution Opportunities**:
- ✅ T001, T002 (US1) can run in parallel (different files: admin.html vs admin.js)
- ✅ T006, T007 (US2) can run in parallel (independent utilities in same file)
- ✅ T019, T020 (US3) can run in parallel (different functions, same file)
- ✅ T023, T024 (US4) can run in parallel (HTML vs JS, different concerns)
- ✅ T031, T032 (US5) can run in parallel (HTML vs JS, different concerns)
- ✅ US3, US6 can be implemented in parallel (no dependencies)
- ✅ US4 and US5 can be implemented in parallel (both work with existing users)

---

## Implementation Strategy (Updated)

**Phase 1 (✅ COMPLETE)**: User Story 1 + 2 (Admin Role + Watermark)
- **Delivered**: Admin checkbox, CPF validation, adaptive watermark
- **Timeline**: 4.5h actual

**Phase 2 (CURRENT)**: User Story 3 + 6 (CPF Mask + Remove LGPD)
- **Rationale**: Quick UX improvements, no backend changes
- **Deliverable**: CPF auto-formatting, cleaner form
- **Timeline**: ~1h (T019-T022 + T038-T040)

**Phase 3**: User Story 4 (Edit User) 
- **Rationale**: Critical for operations (fix typos, change permissions)
- **Deliverable**: Full user editing via UI
- **Timeline**: ~3h (T023-T030)

**Phase 4**: User Story 5 (Delete User)
- **Rationale**: Complete CRUD operations
- **Deliverable**: Safe user deletion
- **Timeline**: ~2h (T031-T037)

**Incremental Delivery**:
1. ✅ Deploy US1+US2 → validate in production
2. Deploy US3+US6 → improve UX, clean form
3. Deploy US4 → enable user editing
4. Deploy US5 → complete CRUD
5. Each phase can be deployed independently

---

## Estimated Timeline (Updated)

| Phase | Tasks | Estimate | Cumulative |
|-------|-------|----------|------------|
| Setup | ✅ Complete | 0h | 0h |
| Foundational | ✅ Complete | 0h | 0h |
| User Story 1 (Admin) | T001-T005 ✅ | 2.5h | 2.5h |
| User Story 2 (Watermark) | T006-T009 ✅ | 2h | 4.5h |
| User Story 3 (CPF Mask) | T019-T022 | 1h | 5.5h |
| User Story 6 (Remove LGPD) | T038-T040 | 0.5h | 6h |
| User Story 4 (Edit User) | T023-T030 | 3h | 9h |
| User Story 5 (Delete User) | T031-T037 | 2h | 11h |
| Integration Testing | T041-T048 | 2h | 13h |
| Polish & Deploy | T049-T054 | 1h | 14h |
| **Total** | **54 tasks** | **14h** | - |

**Confidence**: HIGH - Infrastructure exists, CRUD patterns well-established

**Risk Buffer**: +2h for edge cases (self-edit/self-delete edge cases, CPF mask cursor positioning, grants cascade testing)

**Total Project Estimate**: 14-16 hours (≈2 work days)

**Completed So Far**: 11h (US1+US2+US3+US4+US5+US6) ✅  
**Remaining**: 3-5h (integration + polish)

---

## Task Status Summary (Updated)

**Total Tasks**: 54 (40 implementation + 8 integration + 6 polish/deploy)
**Completed**: 31 (T001-T009, T019-T022, T023-T030, T031-T037, T038-T040) ✅
**In Progress**: 0
**Blocked**: 0
**Remaining**: 23 (integration + polish)

**By User Story**:
- User Story 1 (Admin): 5 tasks ✅ COMPLETE
- User Story 2 (Watermark): 4 tasks ✅ COMPLETE
- User Story 3 (CPF Mask): 4 tasks ✅ COMPLETE (T019-T022)
- User Story 4 (Edit User): 8 tasks ✅ COMPLETE (T023-T030)
- User Story 5 (Delete User): 7 tasks ✅ COMPLETE (T031-T037)
- User Story 6 (Remove LGPD): 3 tasks ✅ COMPLETE (T038-T040)
- Integration: 8 tasks (T041-T048)
- Polish: 6 tasks (T049-T054)

**Parallelizable Tasks**: 13 marked with [P]
- T019, T020 (US3)
- T023, T024 (US4)
- T031, T032 (US5)
- T038 (US6)
- US3 + US6 can run in parallel (different concerns)
- US4 + US5 can run in parallel (both CRUD operations)

---

## Notes

**Constitutional Compliance**: ✅ All gates passed (see plan.md)

**Database Changes**: ❌ None - uses existing `users.status` column, CASCADE on foreign keys

**Breaking Changes**: ❌ None - backward compatible, only adds functionality

**API Changes**: 
- ✅ Added PATCH `/api/users/:userId` (new endpoint)
- ✅ Enhanced DELETE `/api/users/:userId` (self-deletion check, cascade grants)
- ✅ POST `/api/users` unchanged (already supports `isAdmin`)

**Frontend Changes**:
- ✅ CPF field now has auto-formatting mask
- ✅ Edit/Delete buttons added to user table rows
- ✅ Form switches between create/edit modes
- ✅ LGPD checkbox removed
- ✅ Watermark adapts to themes (already implemented)

**Documentation**: 
- ✅ spec.md updated with US3-US6
- ✅ contracts/admin-api.yaml updated (v1.2.0)
- 🔄 quickstart.md needs update (T049)

**Testing Approach**: Manual browser testing (no automated tests per plan.md)

**Deployment**: Vercel auto-deploy on push (zero-config)

**Post-Implementation**: 
- Monitor CRUD operations for errors
- Gather feedback on CPF mask UX
- Validate edit/delete permissions work correctly
- Ensure grants cascade properly on user deletion

**Security Considerations**:
- Self-edit blocked to prevent privilege escalation
- Self-deletion blocked to prevent admin lockout
- Admin validation on all CRUD endpoints
- Password hashing maintained on updates
- Email/CPF uniqueness validated

---

**Last Updated**: 2025-11-26 (All User Stories Complete)
**Status**: 🔄 TESTING PHASE (All US1-US6 implemented, integration testing pending)
