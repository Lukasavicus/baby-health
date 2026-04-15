# EP-04 — Alimentação e Hidratação

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-04 |
| **Title** | Alimentação e hidratação |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Backend Lead |
| **Milestone** | MVP Core (Week 4-5) |

## Objective
Cobrir o tracker mais importante do produto—o registro de alimentação—com suporte a múltiplas formas: mamadeira (fórmula e leite ordenhado), amamentação (básica e avançada), sólidos e papinhas, além de hidratação. Permitir que cuidadores rastreiem alimentação com flexibilidade e contexto.

---

## Epic Scope

### What This Epic Covers
- Feeding (mamadeira): bottle feeding with volume and type
- Breastfeeding (amamentação): simple and advanced modes with sides, timing, pumping
- Solids (sólidos): porridge, fruit, meals, snacks with quantity and acceptance tracking
- Hydration (hidratação): water and other liquids with visual progress
- Data storage for composite feeding sessions (multi-side breastfeeding)
- Feeding history and aggregation (last feeding time, daily total)

### What This Epic Does NOT Cover
- Feeding recommendations or AI-driven insights (EP-08)
- Baby-led weaning guidance (future)
- Allergen tracking UI (future phase)
- Integration with third-party nutrition apps (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (colors, buttons, cards)
- **EP-02:** Data model and logging engine
- **EP-03:** Home dashboard (feeding card)

### Blocking
- **Blocks:** EP-08 (insights use feeding data)

---

## Features & Work Breakdown

### FE-04.1 — Mamadeira/Leite (P0)
**Objective:** Allow quick and flexible bottle feeding logging.

#### User Stories
- **US-04.1.1** — Como cuidador, eu quero registrar mamadeira com quantidade e tipo.
  - Acceptance Criteria:
    - Feeding form shows type selector (fórmula, leite materno)
    - Quantity input in ml (presets: 50, 100, 150, 200 ml + custom)
    - Timestamp defaulted to now, editable
    - Optional notes (e.g., "left breast, then formula")
    - Save button creates event immediately

- **US-04.1.2** — Como cuidador, eu quero saber quando o bebê mamou pela última vez.
  - Acceptance Criteria:
    - Feeding card shows "Last: 2h 30m ago" or "Last: 3:45 PM"
    - Timeline shows feeding event with type, amount, and time
    - Last feeding time accurate within 1 minute

#### Tasks
- **TK-04.1.1** — Definir tipos: fórmula, leite materno ordenhado
  - Deliverable: Event subtype enum for bottle feeding
  - Owner: Product
  - Effort: 1 hour
  - Acceptance: Types defined; icon and color assigned to each

- **TK-04.1.2** — Permitir quantidade em ml
  - Deliverable: Quantity input field with ml unit selector
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Input accepts numbers 0-500ml; presets available; validation prevents negatives

- **TK-04.1.3** — Permitir horário customizado
  - Deliverable: Timestamp picker (time only, date same as today)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Picker shows current time as default; allows past times; format is HH:MM

- **TK-04.1.4** — Atualizar card "Última mamada"
  - Deliverable: Logic to display most recent bottle feeding in Feeding card
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card updates after new feeding log; shows type (bottle) and time; accurate calculation

- **TK-04.1.5** — Atualizar total diário
  - Deliverable: Calculation and display of bottle feeding total (ml) for current day
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card shows "Today: 450 ml" (sum of all bottle feedings); updates after new log

- **TK-04.1.7** — Spike: uma modalidade por vez vs. várias no mesmo fluxo (alimentação)
  - Deliverable: Documento com evidência, recomendação e impacto em US-04.1.1 / #105 (e FE-04.2/04.3 se aplicável)
  - Owner: Product / UX
  - Effort: 4 hours
  - Acceptance: Decisão ou “em aberto” + próximos passos; link da task e da issue

---

### FE-04.2 — Amamentação Básica e Avançada (P0)
**Objective:** Support breastfeeding with simple and detailed modes.

#### User Stories
- **US-04.2.1** — Como cuidador, eu quero um modo simples para registrar amamentação rapidamente.
  - Acceptance Criteria:
    - Quick button: "Registrar amamentação" → single tap to log
    - Timestamp defaulted to now
    - Minimal form (2 fields: side, duration optional)
    - Saves in < 500ms

- **US-04.2.2** — Como cuidador, eu quero ativar um modo avançado com lado e timer quando precisar.
  - Acceptance Criteria:
    - Toggle or button: "Modo avançado"
    - Advanced form shows: side (left/right/both), duration timer, pumping vs. direct, notes
    - Timer can be started/stopped mid-feeding
    - Duration calculated from timer or manual input

#### Tasks
- **TK-04.2.1** — Criar modo básico
  - Deliverable: Basic breastfeeding form (single tap with timestamp)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Form loads; single submit button; saves event with "breastfeed" type

- **TK-04.2.2** — Criar toggle para modo avançado
  - Deliverable: UI toggle/switch to show advanced form fields
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Toggle visible; switches between basic and advanced; no data loss

- **TK-04.2.3** — Suportar lado esquerdo
  - Deliverable: Side selector in advanced form (left, right, both)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Selector shows 3 options; stores as enum in event metadata

- **TK-04.2.4** — Suportar lado direito
  - Deliverable: (Same as TK-04.2.3; both sides in single task)
  - Owner: Frontend Engineer
  - Effort: 0 hours (included in TK-04.2.3)

- **TK-04.2.5** — Suportar timer
  - Deliverable: Built-in timer for duration tracking
  - Features:
    - Start/stop/pause buttons
    - Elapsed time display (MM:SS)
    - Timer persists if user navigates away (service worker / state management)
    - Duration auto-saved to event
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Timer starts/stops correctly; duration calculated; saved to event

- **TK-04.2.6** — Suportar pumping
  - Deliverable: Checkbox or mode selector for "pumping" vs. direct nursing
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Pumping flag stored in event metadata; icon/label in timeline

- **TK-04.2.7** — Definir como armazenar sessões compostas
  - Deliverable: Data model for multi-session feedings (e.g., left breast 10m, right breast 12m, then bottle 100ml)
  - Owner: Backend Lead
  - Effort: 3 hours
  - Acceptance: Schema supports multiple sub-events in single session; aggregation logic correct

---

### FE-04.3 — Sólidos/Papinhas/Refeições (P0)
**Objective:** Track solid food introduction and consumption.

#### User Stories
- **US-04.3.1** — Como cuidador, eu quero registrar o que o bebê comeu e quanto comeu aproximadamente.
  - Acceptance Criteria:
    - Food type selector (porridge, fruit, meal, snack)
    - Quantity selector (approximate: "a little", "some", "most", "all eaten")
    - Optional notes (e.g., "seemed to like carrots")
    - Timestamp defaulted to now

- **US-04.3.2** — Como cuidador, eu quero marcar se foi a primeira vez que um alimento foi oferecido.
  - Acceptance Criteria:
    - Checkbox: "First time"
    - Can add food name when marked as first exposure
    - First exposures tracked separately (for allergy prevention)

#### Tasks
- **TK-04.3.1** — Criar tipos: papinha, fruta, refeição, lanche
  - Deliverable: Food category enum and icons
  - Owner: Product
  - Effort: 1 hour

- **TK-04.3.2** — Permitir quantidade aproximada
  - Deliverable: Quantity selector (5-point scale: none, little, some, most, all)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Visual scale (e.g., filled bowls) or text-based; stores as enum

- **TK-04.3.3** — Permitir marcar "comeu bem / pouco / recusou"
  - Deliverable: Acceptance feedback (ate well / ate little / refused)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Radio buttons or emoji reaction; stores as enum

- **TK-04.3.4** — Permitir marcar "primeira exposição"
  - Deliverable: Checkbox for first food introduction
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: When checked, prompts for food name; stores flag in event

- **TK-04.3.5** — Permitir marcar "favorito"
  - Deliverable: Star or heart icon to mark food as favorite
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Star toggles on/off; favorite foods listed in quick presets

- **TK-04.3.6** — Permitir marcar "reação / alergia"
  - Deliverable: Checkbox to flag potential allergic reaction or sensitivity
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: When checked, adds alert to event; timeline shows warning icon; alerts logged separately for pediatrician review

---

### FE-04.4 — Hidratação (P0)
**Objective:** Quick tracking of water and fluid intake.

#### User Stories
- **US-04.4.1** — Como cuidador, eu quero registrar água e outros líquidos rapidamente.
  - Acceptance Criteria:
    - Quick presets for volume (50ml, 100ml, 150ml, 200ml)
    - Liquid type selector (water, juice, tea, other)
    - Timestamp defaulted to now
    - Minimal form (1-2 taps to log)

#### Tasks
- **TK-04.4.1** — Criar presets de volume
  - Deliverable: Preset buttons for common volumes
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Presets visible; quick tap logs immediately with default time

- **TK-04.4.2** — Permitir água
  - Deliverable: Preset for water in liquid type selector
  - Owner: Frontend Engineer
  - Effort: 0 hours (part of type selector)

- **TK-04.4.3** — Permitir outros líquidos configuráveis
  - Deliverable: Dropdown with water, juice, tea, milk, other
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: All types available; stores as enum

- **TK-04.4.4** — Atualizar total diário
  - Deliverable: Daily hydration total (ml) displayed in Hydration card
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card shows "Today: 200ml"; updates after new log

- **TK-04.4.5** — Exibir progresso visual no card
  - Deliverable: Progress bar in Hydration card showing intake vs. age-based target
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Bar fills as intake increases; color changes to amber if below target; target calculation by age

---

## Data Schema (Feeding Events)

### Bottle Feeding
```typescript
{
  type: 'feeding',
  subtype: 'bottle',
  quantity: 100, // ml
  unit: 'ml',
  metadata: {
    bottleType: 'formula' | 'expressed_milk',
  }
}
```

### Breastfeeding
```typescript
{
  type: 'feeding',
  subtype: 'breastfeed',
  quantity: 15, // minutes
  unit: 'minutes',
  metadata: {
    side: 'left' | 'right' | 'both',
    isPumping: boolean,
    sessions: [ // for multi-side feedings
      { side: 'left', duration: 10 },
      { side: 'right', duration: 12 },
      { side: 'bottle', quantity: 50, type: 'formula' }
    ]
  }
}
```

### Solids
```typescript
{
  type: 'feeding',
  subtype: 'solids',
  metadata: {
    foodType: 'porridge' | 'fruit' | 'meal' | 'snack',
    foodName: string,
    quantityEaten: 'none' | 'little' | 'some' | 'most' | 'all',
    acceptance: 'liked' | 'okay' | 'refused',
    isFirstExposure: boolean,
    isFavorite: boolean,
    hasReaction: boolean,
    notes: string
  }
}
```

### Hydration
```typescript
{
  type: 'feeding',
  subtype: 'hydration',
  quantity: 100, // ml
  unit: 'ml',
  metadata: {
    liquidType: 'water' | 'juice' | 'tea' | 'milk' | 'other'
  }
}
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Bottle feeding:** Type selector, quantity (ml), timestamp, last feeding display, daily total
2. **Breastfeeding:** Basic mode (1-tap), advanced mode (timer, sides), pumping flag, composite sessions
3. **Solids:** Food type, quantity eaten, acceptance, first exposure, favorites, allergies
4. **Hydration:** Quick presets, liquid type, daily total, progress bar with target
5. **Data integrity:** All feedings stored and retrieved correctly
6. **Performance:** Quick log < 500ms, timer doesn't block UI

### QA Checklist
- [ ] Bottle feeding form shows type, quantity, time inputs
- [ ] Bottle feeding saves correctly; appears in timeline
- [ ] Feeding card shows last bottle feeding and daily total (ml)
- [ ] Breastfeeding basic mode works (single tap)
- [ ] Breastfeeding advanced mode shows side and timer toggles
- [ ] Timer starts/stops correctly; duration saved
- [ ] Composite sessions (left + right + bottle) save as single event
- [ ] Solids form shows food type, quantity, acceptance, first exposure
- [ ] First exposure marked; food name captured; stored separately
- [ ] Favorite toggle works; saves state
- [ ] Allergic reaction flag works; timeline shows warning
- [ ] Hydration presets (50, 100, 150, 200 ml) work
- [ ] Hydration type selector has water, juice, tea, milk, other
- [ ] Hydration daily total calculated correctly
- [ ] Progress bar fills relative to target; color indicates status
- [ ] All forms save in < 500ms
- [ ] Timestamp editable; defaults to now
- [ ] Optional notes field available on all forms
- [ ] Timeline shows all feeding events with type icons

---

## Testing Strategy

### Unit Testing
- Volume calculations (daily totals)
- Duration calculations (breastfeeding timer)
- Target hydration calculations by age
- Composite session aggregation

### Integration Testing
- Log bottle → Feeding card updates
- Log breastfeeding (basic) → timeline shows event
- Start/stop timer → duration saved to event
- Log solids with first exposure → separate alert/tracking
- Log hydration → progress bar updates

### E2E Testing
- Full flow: Tap Feeding card → choose type → fill form → submit → see in timeline and card updated
- Timer flow: Start timer → switch apps → return → timer still running → submit → duration correct

### Visual Regression
- Feeding form appearance
- Timer UI during countdown
- Progress bar at different fill levels

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Feeding log time | < 500ms | Network tab |
| Quick preset logs | < 300ms | Interaction latency |
| Timer accuracy | ±1s | Manual testing |
| Data persistence | 100% | Refresh page → data present |
| User satisfaction (feeding UX) | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Timer doesn't persist across navigation | Frustrating UX | Medium | Use service worker + state management; test thoroughly |
| Quantity calculation wrong (multi-session) | Inaccurate data | Low | Unit tests for aggregation logic |
| Hydration target by age undefined | Empty state in card | Medium | Define targets by common ages (0-6m, 6-12m, 12-36m) upfront |
| First exposure tracking confuses users | Low adoption of feature | Low | Clear UI label and explanation |
| Preset buttons too small | Accessibility issue | Low | Ensure 48x48px minimum touch target |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Bottle feeding complete | Day 3 | Pending |
| Breastfeeding (basic + advanced) complete | Day 6 | Pending |
| Solids complete | Day 8 | Pending |
| Hydration complete | Day 9 | Pending |
| QA sign-off | Day 10 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Bottle feeding form and logic
2. ✓ Breastfeeding form (basic and advanced modes)
3. ✓ Timer component for breastfeeding
4. ✓ Solids form with dropdowns and checkboxes
5. ✓ Hydration form with quick presets
6. ✓ Feeding card component updates
7. ✓ Timeline event rendering for all feeding types
8. ✓ Data schema and migrations
9. ✓ Unit tests for calculations
10. ✓ Integration tests for all forms
11. ✓ E2E tests for complete flows

---

## Related Documents
- PRODUCT_SPEC.md: Core Trackers (Feeding detail)
- EP-02: Data model (event schema)
- EP-03: Home dashboard (Feeding card)
- EP-04: This epic
- EP-08: Insights (uses feeding data)

