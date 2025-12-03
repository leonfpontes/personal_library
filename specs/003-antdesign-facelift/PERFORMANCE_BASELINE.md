# Performance Baseline Measurements

**Feature**: 003-antdesign-facelift  
**Date**: 2025-11-26  
**Purpose**: Capture current performance metrics before Shoelace integration to validate <10% degradation requirement

## Measurement Method

- **Tool**: Chrome DevTools > Network tab + Performance tab
- **Connection**: Fast 3G throttling (simulates real-world mobile)
- **Device**: Desktop (1920x1080) and Mobile (iPhone 12 Pro viewport)
- **Cache**: Disabled (Hard Refresh with Cmd+Shift+R / Ctrl+Shift+R)
- **Metrics Captured**: First Contentful Paint (FCP), Time to Interactive (TTI), Total Blocking Time (TBT), Network Waterfall

## Baseline Performance (Before Shoelace)

### admin.html (Admin Dashboard)

**Desktop**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms
- [ ] Total Page Weight: _____ KB
- [ ] Number of Requests: _____

**Mobile (Fast 3G)**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms

---

### index.html (Library Catalog)

**Desktop**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms
- [ ] Total Page Weight: _____ KB
- [ ] Number of Requests: _____

**Mobile (Fast 3G)**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms

---

### livros/vivencia_pombogira.html (Reader Page - Primary Test Subject)

**Desktop**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] Markdown Render Time: _____ ms (measure marked.parse() duration)
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms
- [ ] Total Page Weight: _____ KB
- [ ] Number of Requests: _____

**Mobile (Fast 3G)**:
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Total Blocking Time (TBT): _____ ms
- [ ] Markdown Render Time: _____ ms
- [ ] DOM Content Loaded: _____ ms
- [ ] Load Event: _____ ms

**Network Waterfall Notes**:
- [ ] Largest asset: _____ (_____ KB)
- [ ] Blocking resources: _____
- [ ] Critical rendering path: _____

---

## Performance Budget (Per Constitutional Requirements)

**Success Criteria**: Page load time increase <10% vs baseline  
**Target FCP**: <1.5s (per plan.md)  
**Target TTI**: <3s (per plan.md)

**Example Calculation**:
If baseline FCP = 800ms, Shoelace FCP must be ≤880ms (800 × 1.10)

### Calculated Thresholds (after baseline measurement)

admin.html:
- [ ] FCP Threshold: baseline _____ ms → max _____ ms (110%)
- [ ] TTI Threshold: baseline _____ ms → max _____ ms (110%)

index.html:
- [ ] FCP Threshold: baseline _____ ms → max _____ ms (110%)
- [ ] TTI Threshold: baseline _____ ms → max _____ ms (110%)

livros/vivencia_pombogira.html:
- [ ] FCP Threshold: baseline _____ ms → max _____ ms (110%)
- [ ] TTI Threshold: baseline _____ ms → max _____ ms (110%)
- [ ] **GATE**: If FCP exceeds threshold, SKIP Phase 6 (Reader Pages) per Task T052

---

## Test Shoelace Impact (After T006)

After creating test-shoelace.html, measure its performance:

**test-shoelace.html** (with Shoelace CDN loaded):
- [ ] First Contentful Paint (FCP): _____ ms
- [ ] Time to Interactive (TTI): _____ ms
- [ ] Shoelace CSS Load Time: _____ ms
- [ ] Shoelace JS Autoloader Time: _____ ms
- [ ] Total Page Weight: _____ KB (Shoelace overhead)

**Shoelace Bundle Analysis**:
- [ ] shoelace.css size: _____ KB (expected ~35 KB gzipped)
- [ ] shoelace-autoloader.js size: _____ KB (expected ~15 KB gzipped)
- [ ] Total Shoelace overhead: _____ KB (expected ~50 KB gzipped)

---

## Validation Steps

1. **Capture Baseline** (T005):
   - Open Chrome DevTools
   - Navigate to Network tab → disable cache → throttle to Fast 3G
   - Hard refresh each page 3 times, record median values
   - Screenshot network waterfall for reference

2. **Test Shoelace Page** (T006):
   - Access http://localhost:3000/test-shoelace.html
   - Verify all components render correctly
   - Measure performance with same method
   - Compare overhead against research.md estimate (50 KB)

3. **Calculate Thresholds** (T005 continued):
   - Apply 110% multiplier to baseline metrics
   - Document thresholds for each page
   - These become gates for Phase 6 (T052) decision

4. **Compare Post-Implementation** (T076):
   - After Phase 3-5 complete, re-measure all pages
   - Validate FCP/TTI within budget
   - If any page exceeds threshold, investigate and optimize

---

## Notes

- **Markdown rendering**: vivencia_pombogira.html uses Marked.js to render 780+ lines of Markdown. This is the most performance-sensitive page.
- **Reader pages conditional**: If Shoelace adds >10% to FCP on reader pages, Phase 6 (Tasks T050-T068) will be SKIPPED per plan.md.
- **Admin/Catalog priority**: These pages have higher tolerance for performance trade-off due to functional improvements (30% faster CRUD operations per spec.md).
- **Theme persistence**: Ensure `data-theme` localStorage reads don't block FCP.
- **Watermark canvas**: Verify watermark rendering doesn't regress with Shoelace present.

---

## References

- **spec.md**: Success Criteria SC-007 (Page load time degradation <10%)
- **plan.md**: Performance Goals (FCP <1.5s, TTI <3s, <10% increase)
- **research.md**: Shoelace bundle size analysis (50 KB gzipped vs AntD 240 KB)
- **tasks.md**: Task T052 (DECISION GATE for Phase 6)
