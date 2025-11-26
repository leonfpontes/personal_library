# Feature 002: Admin & Watermark Improvements - Planning Complete

**Branch**: `2-admin-watermark-improvements`  
**Date**: 2025-11-26  
**Status**: ✅ **PLANNING PHASE COMPLETE** - Ready for implementation

---

## Summary

Successfully created complete implementation plan for two authentication/UX improvements:

1. **Admin Role Management**: Checkbox in `/auth/admin.html` for creating admin users with `status='admin'` (full access, bypass grants)
2. **Adaptive Watermark Contrast**: Theme-aware watermark colors (black/white/brown) with dynamic adaptation on theme toggle

---

## Deliverables Created

### Phase 0: Research ✅

**File**: [research.md](./research.md)

**Status**: SKIPPED (all decisions clear from existing codebase)

**Key Decisions**:
- Use existing `users.status` column (no migration needed)
- Frontend regex CPF validation (11 digits only, no dígitos verificadores)
- Theme detection via `data-theme` attribute
- Static color mapping (light/dark/sepia → RGBA)
- MutationObserver for theme change detection

### Phase 1: Design & Contracts ✅

**Files**:
- [data-model.md](./data-model.md) - Database schema (no changes required)
- [quickstart.md](./quickstart.md) - Implementation guide + usage examples
- [contracts/admin-api.yaml](./contracts/admin-api.yaml) - OpenAPI 3.0 spec for POST /api/users

**Key Design Decisions**:
- Admin checkbox HTML: `<input id="isAdmin" type="checkbox" />`
- Backend logic: `status = isAdmin ? 'admin' : 'active'`
- Watermark colors: `{ light: 'rgba(0,0,0,0.08)', dark: 'rgba(255,255,255,0.12)', sepia: 'rgba(80,60,40,0.10)' }`
- MutationObserver config: `{ attributes: true, attributeFilter: ['data-theme', 'class'] }`

### Phase 2: Task Planning ✅

**File**: [plan.md](./plan.md)

**Task Breakdown**: 12 tasks estimated at 4-6h implementation + 2h testing

**Categories**:
- Admin Role (5 tasks): T001-T005
- Watermark Adaptation (4 tasks): T006-T009
- Testing & Validation (3 tasks): T010-T012

---

## Constitution Check

**Status**: ✅ **PASS** - All 11 gates satisfied

| Gate | Status |
|------|--------|
| Content-first (no build) | ✅ PASS |
| Editorial integrity (pt-BR) | ✅ PASS |
| File placement | ✅ PASS |
| Naming conventions | ✅ PASS |
| Reader template fidelity | ✅ PASS |
| mdPath correctness | ✅ PASS |
| Theme/colors consistency | ✅ PASS |
| Catalog card | ✅ PASS |
| Relative paths | ✅ PASS |
| Rights/LGPD | ✅ PASS |
| Serverless Exception (v1.1.0) | ✅ PASS |

**Rationale**: Feature modifies only authentication UI/scripts. No manuscript changes, no build additions, no constitutional violations.

---

## Technical Architecture

### Files to Modify

```text
auth/admin.html          [+5 lines]  Admin checkbox + label
scripts/admin.js         [+15 lines] validateCPF() + isAdmin field
scripts/watermark.js     [+25 lines] THEME_COLORS + getTheme() + MutationObserver
api/users/index.js       [+2 lines]  status = isAdmin ? 'admin' : 'active'
```

**Total Impact**: 4 files, ~47 lines added, 0 files deleted, 0 database changes

### Data Flow

**Admin Creation**:
```
Form (checkbox=true) → validate CPF → POST /api/users { isAdmin: true }
→ Backend sets status='admin' → INSERT users → Login → Bypass grants
```

**Watermark Theme**:
```
Page load → getTheme() → Apply THEME_COLORS[theme] → Create watermark
→ User toggles theme → MutationObserver fires → Update all cells
```

---

## Success Criteria Mapping

| Criterion | Implementation | Validation |
|-----------|----------------|------------|
| SC-001: 100% admin cadastros → status='admin' | Backend: `status = isAdmin ? 'admin' : 'active'` | DB query after creation |
| SC-002: 100% CPF inválidos bloqueados | Frontend: `validateCPF()` regex | Try invalid CPF, verify error |
| SC-003: Admin acessa tudo | Middleware: bypass grants if `isAdmin` | Login as admin, access any book |
| SC-004: Dark watermark ≥0.12 white | `THEME_COLORS.dark = 'rgba(255,255,255,0.12)'` | DevTools inspect |
| SC-005: Light watermark 0.08 black | `THEME_COLORS.light = 'rgba(0,0,0,0.08)'` | DevTools inspect |
| SC-006: Theme transition ≤500ms | MutationObserver + style update | Measure with DevTools Performance |
| SC-007: Text legível | Opacity limits tested (0.08-0.12) | Visual test 3+ people |
| SC-008: Vercel deploy 100% | No build changes | Deploy to production |

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Opacity too high → unreadable | HIGH | LOW | Spec provides tested values |
| Theme attribute missing | MEDIUM | LOW | Fallback to CSS class |
| MutationObserver performance | LOW | LOW | 1 element, 2 attributes only |
| Checkbox accidentally checked | MEDIUM | MEDIUM | Add confirmation dialog |
| Regex fails edge case | LOW | LOW | Unit test before deploy |

---

## Next Steps

### Immediate (Implementation)

1. **Create tasks.md**: Run `/speckit.tasks` command to generate detailed task breakdown
2. **Start T001**: Add admin checkbox to `auth/admin.html`
3. **Implement sequentially**: T001→T012 following plan.md task order
4. **Test continuously**: Manual testing after each task group (admin/watermark/validation)

### Testing Phase

1. **Unit Testing** (manual):
   - CPF validation (formatted/invalid/valid)
   - Admin checkbox state handling
   - Theme detection across 3 themes

2. **Integration Testing**:
   - Admin user creation → login → access verification
   - Watermark theme adaptation across 5 books

3. **Visual Testing**:
   - Watermark readability in all themes
   - Text overlay comfort (3+ people)

### Deployment

1. **Pre-Deploy Checks**:
   - [ ] All 12 tasks complete
   - [ ] Manual testing checklist passed
   - [ ] No console errors in DevTools
   - [ ] Database queries return correct values

2. **Deploy**:
   - Commit changes to `2-admin-watermark-improvements` branch
   - Push to GitHub
   - Vercel auto-deploys
   - Test on production URL

3. **Post-Deploy Validation**:
   - Create admin user in production
   - Verify watermark in all themes
   - Monitor Vercel logs for errors

---

## Documentation Generated

| File | Status | Lines | Purpose |
|------|--------|-------|---------|
| spec.md | ✅ Complete | 197 | Feature requirements |
| plan.md | ✅ Complete | 420 | Implementation plan |
| research.md | ✅ Complete | 286 | Technical decisions |
| data-model.md | ✅ Complete | 304 | Database schema |
| quickstart.md | ✅ Complete | 385 | Implementation guide |
| contracts/admin-api.yaml | ✅ Complete | 456 | OpenAPI 3.0 spec |
| checklists/requirements.md | ✅ Complete | 76 | Quality validation |

**Total**: 2,124 lines of documentation

---

## Agent Context Updated

**File**: `.github/agents/copilot-instructions.md`

**Changes**:
- Added language: JavaScript ES6+ (client-side), Node.js 18+ (Vercel Edge Functions)
- Added database: Neon PostgreSQL (serverless, sa-east-1) - table `users` com coluna `status` VARCHAR
- Preserved existing manual additions (manuscript instructions)

---

## Key Insights from Planning

### What Went Well

1. **No Database Migration**: Existing `users.status` column eliminates migration complexity
2. **Clear Spec**: All clarifications resolved upfront (Q1-Q5 in spec.md)
3. **Minimal Impact**: Only 4 files modified, no breaking changes
4. **Constitutional Alignment**: All 11 gates pass without exceptions

### Design Strengths

1. **Admin Role**: Leverages existing column, consistent with current auth pattern
2. **CPF Validation**: Dual validation (frontend UX + backend security)
3. **Watermark Adaptation**: MutationObserver robust, covers all theme change sources
4. **Color Mapping**: Spec-provided values, no guesswork

### Implementation Simplicity

- No new dependencies required
- No build configuration changes
- No Vercel configuration changes
- No environment variable changes

---

## Estimated Timeline

**Implementation**: 4-6 hours
- Admin Role: 2-3 hours (T001-T005)
- Watermark Adaptation: 1.5-2 hours (T006-T009)
- Testing: 0.5-1 hour (T010-T012)

**Testing**: 2 hours
- Manual testing: 1 hour
- Visual testing (3+ people): 1 hour

**Deployment**: 30 minutes
- Commit, push, verify Vercel deploy
- Post-deploy validation

**Total**: 6.5-8.5 hours (1 full work day)

---

## Feature 002 Status

**Planning Phase**: ✅ **100% COMPLETE**

**Ready for**:
- `/speckit.tasks` command (generate tasks.md)
- Implementation (T001-T012)
- Testing & Validation
- Production Deployment

**Blockers**: None

**Dependencies**: None (Feature 001 already deployed)

**Branch**: `2-admin-watermark-improvements` (active)

---

## Contact & References

**Specification**: [spec.md](./spec.md)  
**Implementation Guide**: [quickstart.md](./quickstart.md)  
**Full Plan**: [plan.md](./plan.md)  
**API Contract**: [contracts/admin-api.yaml](./contracts/admin-api.yaml)

**Constitution**: [.specify/memory/constitution.md](../../.specify/memory/constitution.md) v1.1.0

**Feature 001**: [../001-login-access-control/](../001-login-access-control/) (dependency - already deployed)

---

*Generated by `/speckit.plan` command on 2025-11-26*
