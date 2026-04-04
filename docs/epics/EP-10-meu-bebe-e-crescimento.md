# EP-10 — Meu Bebê e Crescimento

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-10 |
| **Title** | Meu bebê e crescimento |
| **Priority** | P1 (High) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Data Lead |
| **Milestone** | Post-MVP Refinement (Week 8) |

## Objective
Centralizar perfil do bebê, dados de crescimento (peso, altura, circunferência craniana) e evolução ao longo do tempo. Oferecer visualização de medições em gráficos simples e histórico cronológico, transformando "Meu Bebê" em center de health records para o bebê.

---

## Epic Scope

### What This Epic Covers
- Baby profile screen (name, age, photo, caregivers list)
- Growth measurement logging (weight, height, head circumference)
- Measurement history (chronological list with dates)
- Simple growth charts (line charts showing trends)
- Latest measurement highlights (most recent for each metric)
- Percentile indicators (optional, future: integration with growth charts)
- Notes and observations linked to milestones
- Pediatrician contact info storage (optional, future)

### What This Epic Does NOT Cover
- WHO/CDC growth curve integration (future)
- Percentile calculations
- Health condition tracking (separate from growth)
- Medication history (EP-11)
- Video/photo library of milestones (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (profile layout, charts)
- **EP-02:** Data model (growth measurement entity)

### Blocking
- **Blocks:** EP-11 (health records may reference growth data)

---

## Features & Work Breakdown

### FE-10.1 — Perfil do Bebê (P1)
**Objective:** Dedicated baby profile view with key information.

#### User Stories
- **US-10.1.1** — Como cuidador, eu quero uma área própria do bebê com dados centrais.
  - Acceptance Criteria:
    - "Meu Bebê" tab accessible from bottom navigation
    - Baby's name displayed prominently
    - Baby's age (months and days) calculated and displayed
    - Baby's photo/avatar visible
    - List of associated caregivers visible
    - List of active tracker modules (which trackers are enabled)
    - Quick access to sub-screens (growth, observations, health)

#### Tasks
- **TK-10.1.1** — Criar perfil base
  - Deliverable: Baby profile screen layout
  - Layout sections:
    1. Header: Baby's photo/avatar + name + age
    2. Quick stats: Height, weight (latest)
    3. Caregivers list: Names and avatars
    4. Active modules: Icons for enabled trackers
    5. Navigation: Buttons to Growth, Observations, Health (future)
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Profile renders; responsive on mobile/tablet; tap sections navigate correctly

- **TK-10.1.2** — Exibir nome, idade e avatar
  - Deliverable: Profile header with baby's basic info
  - Display:
    - Avatar/photo (large, centered)
    - Name (large text below avatar)
    - Age in months and days (e.g., "3 months, 15 days")
    - Calculated from dateOfBirth (stored in baby entity)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Info displays correctly; age calculated accurately; responsive layout

- **TK-10.1.3** — Exibir cuidadores associados
  - Deliverable: List of caregivers associated with baby
  - Display:
    - Each caregiver as a small card or chip: avatar + name + role
    - Clickable to see caregiver details (optional)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: List shows all caregivers; correct roles displayed

- **TK-10.1.4** — Exibir módulos ativos
  - Deliverable: Visual indicators of which trackers are enabled
  - Display:
    - Icons for Feeding, Sleep, Diapers, Activities, Growth, Health
    - Enabled modules shown in color; disabled in gray
    - Tap to enable/disable (optional, or manage in settings)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Icons display correctly; enable/disable works (if implemented)

---

### FE-10.2 — Crescimento (P1, depends on FE-10.1)
**Objective:** Track and visualize baby's physical growth.

#### User Stories
- **US-10.2.1** — Como cuidador, eu quero registrar peso, altura e circunferência craniana.
  - Acceptance Criteria:
    - Growth measurement form accessible from "Meu Bebê" tab
    - Form has fields: weight (kg), height (cm), head circumference (cm)
    - Date picker for measurement date (default: today)
    - Optional notes field (e.g., "measured at pediatrician visit")
    - Submit button creates measurement record
    - Confirmation message after save

#### Tasks
- **TK-10.2.1** — Criar formulário de medidas
  - Deliverable: Growth measurement input form
  - Fields:
    - Measurement date (date picker)
    - Weight (number input in kg, e.g., 5.2 kg)
    - Height (number input in cm, e.g., 56 cm)
    - Head circumference (number input in cm, e.g., 38 cm)
    - Notes (optional text field)
    - Submit button
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Form loads; all inputs work; validation prevents invalid values; submit creates record

- **TK-10.2.2** — Criar histórico cronológico
  - Deliverable: Chronological list of all growth measurements
  - Display:
    - List sorted by date (newest first)
    - Each entry shows: date, weight, height, head circumference
    - Tap to view details or edit (future)
    - Can scroll to see history over time
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: List displays all measurements; sorted correctly; readable format

- **TK-10.2.3** — Criar gráficos simples
  - Deliverable: Line charts showing growth trends
  - Charts (one per metric):
    - Weight over time (x: date, y: kg)
    - Height over time (x: date, y: cm)
    - Head circumference over time (x: date, y: cm)
  - Features:
    - Line connects data points
    - Data points show values on hover (optional)
    - Responsive: scales to screen size
    - At least 2+ data points to show trend
  - Owner: Frontend Engineer
  - Effort: 5 hours (includes chart library integration)
  - Acceptance: Charts render correctly; data points accurate; responsive on mobile

- **TK-10.2.4** — Exibir última medição em destaque
  - Deliverable: Summary card on baby profile showing latest measurement
  - Display:
    - "Latest Measurement" card
    - Most recent weight, height, head circumference
    - Date of measurement
    - Tap to view full measurement details or history
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card shows correct latest values; updates when new measurement added

---

### FE-10.3 — Observações e Marcos (P2, depends on FE-10.1)
**Objective:** (Future/optional) Track milestones and notable observations.

#### User Stories
- **US-10.3.1** — Como cuidador, eu quero registrar marcos e observações importantes.
  - Acceptance Criteria:
    - Form to add observations/notes
    - Associate observation with date
    - Observation appears in timeline/history
    - Can view all observations chronologically

#### Tasks
- **TK-10.3.1** — Criar entidade de observação
  - Deliverable: Observation data model
  - Model:
    ```typescript
    {
      id: UUID,
      babyId: UUID,
      title: string, // e.g., "First smile"
      description: string, // detailed note
      date: ISO 8601,
      category: 'milestone' | 'observation' | 'concern', // optional
      photos: string[], // optional photo URLs
      createdAt: ISO 8601
    }
    ```
  - Owner: Backend Lead
  - Effort: 1 hour

- **TK-10.3.2** — Permitir texto livre
  - Deliverable: Text input for observation details
  - Owner: Frontend Engineer
  - Effort: 1 hour

- **TK-10.3.3** — Associar observação a data
  - Deliverable: Date picker for observation date
  - Owner: Frontend Engineer
  - Effort: 1 hour

---

## Growth Data Structure

### Growth Measurement Entity
```typescript
interface GrowthMeasurement {
  id: UUID;
  babyId: UUID;
  measurementDate: ISO 8601;
  weight?: number; // kg (float, e.g., 5.2)
  height?: number; // cm (float, e.g., 56.5)
  headCircumference?: number; // cm (float, e.g., 38.2)
  notes?: string;
  source: 'parent_logged' | 'pediatrician' | 'imported'; // optional
  createdAt: ISO 8601;
  updatedAt: ISO 8601;
}

// Stored in backend; synced to frontend
// Minimum for MVP: 1 measurement; can grow to 100+ over years
```

---

## "Meu Bebé" Tab Layout (Wireframe)

```
┌─────────────────────────────┐
│ Meu Bebê                    │  (Header)
├─────────────────────────────┤
│                             │
│     ┌──────────────────┐   │
│     │    👶 Avatar     │   │
│     │  [Baby's Name]   │   │
│     │  3 months, 15d   │   │
│     └──────────────────┘   │
│                             │
│  LATEST MEASUREMENTS        │
│  ┌──────────────────────┐  │
│  │ Weight: 5.2 kg       │  │
│  │ Height: 56 cm        │  │
│  │ Head: 38 cm          │  │
│  │ Measured: 3 days ago │  │
│  │          [VIEW MORE] │  │
│  └──────────────────────┘  │
│                             │
│  CAREGIVERS                 │
│  👩 Mom     👨 Dad  👴 Grandpa
│                             │
│  TRACKERS ENABLED           │
│  🍼 ✓    😴 ✓    💧 ✓       │
│  🍽️ ✓    📊 ✓    💪 ✓       │
│                             │
│  [ADD MEASUREMENT]          │
│  [GROWTH HISTORY]           │
│  [OBSERVATIONS] (future)    │
│                             │
└─────────────────────────────┘
     🏠  👥  📋  👶     (Bottom nav)
```

## Growth History / Charts View (Wireframe)

```
┌─────────────────────────────┐
│ Growth History              │
├─────────────────────────────┤
│ Metric: [Weight ▼]          │
│                             │
│        WEIGHT (kg)          │
│  6 ┤                    ╱   │
│  5 ┤      ╱─────╱     ╱     │
│  4 ┤  ╱──╱                  │
│    ├──┼──┼──┼──┼──┼──┼──┼──┤
│    0  1  2  3  4  5  6  months
│                             │
│ MEASUREMENT HISTORY         │
│ ├─ Mar 2: 5.2 kg            │
│ │         56 cm, 38 cm      │
│ ├─ Feb 15: 4.8 kg           │
│ │          54 cm, 37.5 cm   │
│ ├─ Feb 1: 4.5 kg            │
│ │         52 cm, 37 cm      │
│ ├─ Jan 15: 4.2 kg           │
│ │          50 cm, 36.5 cm   │
│                             │
│          [ADD NEW]          │
└─────────────────────────────┘
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance (P1)
1. **Baby Profile:** Basic info (name, age, photo), caregivers list, active modules visible
2. **Growth Measurement Form:** All fields (weight, height, head circumference) functional
3. **Measurement History:** Chronological list of all measurements
4. **Growth Charts:** Simple line charts for each metric showing trend over time
5. **Latest Measurement Highlight:** Summary card on profile with most recent values
6. **Data Persistence:** All measurements saved and retrieved correctly

### Feature-Level Acceptance (P2 - Observations)
7. **Observations Entity:** Defined and can store notes with dates
8. **Observations Form:** Can add observations; stored correctly

### QA Checklist
- [ ] "Meu Bebê" tab accessible from bottom nav
- [ ] Baby profile loads with correct data
- [ ] Baby name displays correctly
- [ ] Age calculated and displayed (months and days)
- [ ] Baby avatar/photo visible
- [ ] Caregivers list shows all associated caregivers
- [ ] Active tracker modules displayed with correct icons
- [ ] Growth measurement form accessible
- [ ] All form fields (weight, height, head circumference) work
- [ ] Date picker defaults to today; can select past dates
- [ ] Notes field optional but accepts text
- [ ] Submit saves measurement; shows confirmation
- [ ] Measurement history list displays all measurements
- [ ] Measurements sorted by date (newest first)
- [ ] Each measurement shows weight, height, head circumference, date
- [ ] Tap measurement → view details (optional)
- [ ] Weight chart renders; data points correct
- [ ] Height chart renders; data points correct
- [ ] Head circumference chart renders; data points correct
- [ ] Charts responsive on mobile (320px) and tablet (768px)
- [ ] Latest measurement card on profile shows newest values
- [ ] Card updates after new measurement added
- [ ] All measurements persist across refresh

---

## Testing Strategy

### Unit Testing
- Age calculation (from DOB)
- Measurement aggregation (latest, min, max, trend)
- Chart data transformation (measurements → chart format)

### Integration Testing
- Load profile → baby info displays
- Submit measurement → appears in history and on profile
- View growth history → all measurements displayed; charts render

### E2E Testing
- Full flow: Meu Bebê tab → tap "Add measurement" → fill form → submit → see in history and on profile

### Chart Testing
- Verify chart data points match measurements
- Check responsive behavior on different screen sizes
- Test with various datasets (1 measurement, 5+, 20+)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Age calculation accuracy | 100% | Manual verification with known DOBs |
| Measurement data accuracy | 100% | Manual verification of form inputs |
| Chart rendering performance | < 1s (10+ measurements) | Performance profiling |
| User satisfaction (profile UX) | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Chart library slow on low-end devices | Performance issue | Medium | Test on low-end device; optimize rendering; consider SVG vs. canvas |
| Missing measurement types (e.g., length vs. height) | Confusion for users | Low | Clarify in form labels; provide guidance (e.g., "measure baby lying down for length") |
| Age calculation incorrect (timezone issues) | Wrong age displayed | Low | Use UTC for DOB; test with multiple timezones |
| Too much data in profile overwhelms users | Low engagement | Low | Progressive disclosure; tabs or expandable sections; keep profile clean |
| Growth charts not interesting without goal lines | Lower engagement | Medium | Future: add percentile lines or target ranges (out of scope for MVP) |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Baby profile screen complete | Day 2 | Pending |
| Growth measurement form complete | Day 3 | Pending |
| Measurement history list done | Day 4 | Pending |
| Growth charts implemented | Day 6 | Pending |
| Latest measurement highlight done | Day 7 | Pending |
| QA and testing | Day 8 | Pending |

**Total Duration:** 8 business days

---

## Deliverables

1. ✓ Baby profile screen and layout
2. ✓ Growth measurement data model and schema
3. ✓ Growth measurement form component
4. ✓ Measurement history list component
5. ✓ Growth charts (weight, height, head circumference) with library integration
6. ✓ Latest measurement summary card
7. ✓ Age calculation utility function
8. ✓ Growth data aggregation functions
9. ✓ Unit tests for calculations and aggregations
10. ✓ Integration tests for form and data flow
11. ✓ E2E tests for complete growth tracking flow
12. ✓ Chart performance tests on low-end devices
13. ✓ (Optional P2) Observation data model
14. ✓ (Optional P2) Observation form component
15. ✓ (Optional P2) Observation history list

---

## Related Documents
- PRODUCT_SPEC.md: Growth tracking, future opportunities
- EP-02: Data model (measurement entity)
- EP-10: This epic
- EP-11: Health records (may reference growth data)

