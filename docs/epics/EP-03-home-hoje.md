# EP-03 — Home "Hoje"

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-03 |
| **Title** | Home "Hoje" |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Frontend Lead |
| **Milestone** | MVP Core (Week 3-4) |

## Objective
Transformar a home no centro operacional do app, no espírito do Samsung Health. Criar hero card do dia, cards dos 6 trackers obrigatórios, linha do tempo, e registro inline para acesso rápido sem navegação.

---

## Epic Scope

### What This Epic Covers
- Hero card displaying daily summary and status
- 6 tracker cards (Feeding, Hydration, Sleep, Awake Window, Diapers, Activities)
- Chronological timeline of all events for the day
- Inline quick-log buttons within each tracker card
- Empty states and loading states
- Daily summary indicators (hydration progress, sleep total, etc.)

### What This Epic Does NOT Cover
- Detailed tracker flows (handled in EP-04 through EP-06)
- Advanced insights (handled in EP-08)
- Bottom sheet modal implementation (design part of EP-01, functionality here)
- Data calculation logic specific to each tracker (EP-04-EP-06)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system and shell (bottom nav, FAB, headers)
- **EP-02:** Data model and logging engine

### Blocking
- **Blocks:** EP-04, EP-05, EP-06 (detailed tracker flows build on this foundation)

---

## Features & Work Breakdown

### FE-03.1 — Hero Card do Dia (P0, depends on FE-02.3)
**Objective:** Give caregivers instant understanding of baby's daily status at a glance.

#### User Stories
- **US-03.1.1** — Como cuidador, eu quero entender o estado geral do bebê em segundos.
  - Acceptance Criteria:
    - Hero card visible at top of home screen
    - Card displays 3-5 key metrics (e.g., "3 feedings", "4h sleep", "8 wet diapers")
    - Visual badge shows status (e.g., "On track", "Check hydration", "Great sleep!")
    - Baby's name and age (days/months) displayed prominently
    - Card shows current time and last event timestamp
    - Hero card is visually prominent (large, colorful, engaging)

#### Tasks
- **TK-03.1.1** — Definir métricas do hero card
  - Deliverable: Specification of 3-5 hero metrics and calculation logic
  - Suggested metrics:
    - Feeding count (number of feedings today)
    - Hydration status (ml consumed vs. target)
    - Sleep total (hours slept today)
    - Diaper count (wet + soiled total)
    - Last activity logged (with time)
  - Owner: Product + Data Lead
  - Effort: 3 hours
  - Acceptance: Metrics agreed upon; calculation logic defined; stakeholder sign-off

- **TK-03.1.2** — Implementar resumo textual do dia
  - Deliverable: Generated text summary (1-2 sentences) about the day
  - Examples:
    - "Today was great! 3 feedings, 6 hours of sleep, and lots of playtime."
    - "Keep an eye on hydration—only 200ml so far."
    - "More sleep needed—currently 3 hours. Nap time soon?"
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Text generated based on metrics; tone is warm and supportive; no grammatical errors

- **TK-03.1.3** — Implementar status badge
  - Deliverable: Visual badge/pill with status color and icon
  - Status categories:
    - "On track" (green) — all metrics normal
    - "Watch hydration" (amber) — low fluid intake
    - "More sleep" (amber) — low sleep hours
    - "Great day!" (green) — exceeds expectations
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Badge shows correct status; color and icon match design system

- **TK-03.1.4** — Implementar visual principal do card
  - Deliverable: Hero card layout with image/illustration, metrics, and CTA
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Card layout responsive; metrics readable; illustration or placeholder present; CTA button visible (e.g., "View detailed report")

---

### FE-03.2 — Cards dos Trackers Obrigatórios (P0, depends on FE-02.3)
**Objective:** Provide quick overview and access to each of the 6 core trackers on home screen.

#### User Stories
- **US-03.2.1** — Como cuidador, eu quero acompanhar os 6 trackers essenciais sem navegar demais.
  - Acceptance Criteria:
    - All 6 tracker cards visible on home (may scroll on mobile)
    - Each card shows last event and today's total
    - Cards are color-coded by tracker type
    - Cards are tappable (navigation to detail, future)
    - Cards have quick-log button (inline logging)

#### Tasks
- **TK-03.2.1** — Criar card de Alimentação
  - Card display:
    - Icon: bottle/breast icon
    - Title: "Alimentação"
    - Metric 1: "Last: 30m ago" (e.g., 3:45 PM)
    - Metric 2: "Today: 450 ml" (sum of bottle + breast)
    - CTA: "Registrar" button (opens quick log bottom sheet)
  - Owner: Frontend Engineer
  - Effort: 3 hours

- **TK-03.2.2** — Criar card de Hidratação
  - Card display:
    - Icon: water droplet
    - Title: "Hidratação"
    - Metric 1: "Today: 200 ml"
    - Metric 2: "Target: 500 ml" (for age)
    - Progress bar: visual indicator
    - CTA: "Registrar" button
  - Owner: Frontend Engineer
  - Effort: 3 hours

- **TK-03.2.3** — Criar card de Sono
  - Card display:
    - Icon: moon/sleep
    - Title: "Sono"
    - Metric 1: "Today: 4h 30m" (total)
    - Metric 2: "Last nap: 1h 15m"
    - CTA: "Registrar" button (start/end sleep)
  - Owner: Frontend Engineer
  - Effort: 3 hours

- **TK-03.2.4** — Criar card de Tempo Acordado
  - Card display:
    - Icon: awake/eyes
    - Title: "Tempo Acordado"
    - Metric 1: "Awake: 2h 15m" (since last sleep)
    - Metric 2: "Recommended max: 3h" (for age, if known)
    - CTA: "Registrar sono" button (to log next sleep)
  - Owner: Frontend Engineer
  - Effort: 2 hours

- **TK-03.2.5** — Criar card de Fraldas
  - Card display:
    - Icon: diaper
    - Title: "Fraldas"
    - Metric 1: "Today: 8 wet + 3 soiled"
    - Metric 2: "Last: 45m ago"
    - CTA: "Registrar" button
  - Owner: Frontend Engineer
  - Effort: 2 hours

- **TK-03.2.6** — Criar card de Atividades
  - Card display:
    - Icon: play/activity
    - Title: "Atividades"
    - Metric 1: "Tummy time: 15m"
    - Metric 2: "Last: reading, 20m ago"
    - CTA: "Registrar" button
  - Owner: Frontend Engineer
  - Effort: 3 hours

---

### FE-03.3 — Linha do Tempo do Dia (P0, depends on FE-02.3)
**Objective:** Chronological view of all logged events for the day.

#### User Stories
- **US-03.3.1** — Como cuidador, eu quero ver tudo que aconteceu hoje em ordem cronológica.
  - Acceptance Criteria:
    - Timeline shows all events for current day
    - Events sorted newest first (most recent at top)
    - Alternative: oldest first (selectable)
    - Each event entry shows: icon, title, time, caregiver name
    - Clicking event (future) shows details
    - Timeline is scrollable without limiting height

#### Tasks
- **TK-03.3.1** — Implementar lista cronológica reversa
  - Deliverable: Timeline list component with events sorted descending by timestamp
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Events load from backend/storage; sorted correctly; virtualized if > 30 events (performance)

- **TK-03.3.2** — Exibir ícone, título, detalhe, horário e cuidador
  - Deliverable: Timeline item layout with all required fields
  - Layout per item:
    - Left: Icon (tracker-specific, 24x24px)
    - Center: Title (e.g., "Bottle - 100ml"), detail (e.g., "Formula"), timestamp (e.g., "3:45 PM")
    - Right: Caregiver name and color badge
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: All fields readable; layout clean and scannable

- **TK-03.3.3** — Criar empty state
  - Deliverable: Friendly message when no events logged yet
  - Message: "No events yet. Tap Registrar to log your first activity!"
  - Visual: Illustration of empty timeline
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Empty state displays when event count = 0; visually appealing

- **TK-03.3.4** — Criar filtro futuro por tipo
  - Deliverable: (Future, not in MVP) UI for filtering timeline by tracker type
  - Owner: Product
  - Effort: 0 (roadmap only)

---

### FE-03.4 — Registro Inline (P0, depends on FE-02.3 + FE-03.2)
**Objective:** Enable quick logging directly from home without leaving the screen.

#### User Stories
- **US-03.4.1** — Como cuidador, eu quero registrar direto do card, sem sair da home.
  - Acceptance Criteria:
    - Each tracker card has a "Registrar" button
    - Clicking button opens a context-aware bottom sheet
    - Bottom sheet auto-fills the tracker type
    - Caregiver is pre-selected (current user)
    - Form is minimal (2-4 fields: quantity, time, notes)
    - After submit, sheet closes and card updates

#### Tasks
- **TK-03.4.1** — Adicionar CTA inline por card
  - Deliverable: "Registrar" button on each of the 6 tracker cards
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Button visible on all 6 cards; styled consistently; tap opens bottom sheet

- **TK-03.4.2** — Abrir bottom sheet contextual
  - Deliverable: Bottom sheet modal with tracker-specific form
  - Owner: Frontend Engineer
  - Effort: 5 hours
  - Acceptance: Bottom sheet slides up; shows correct form based on tracker; dismisses on cancel/submit

- **TK-03.4.3** — Salvar evento e fechar fluxo
  - Deliverable: Form submission logic that creates event and closes modal
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Event saves; bottom sheet closes; home updates; no errors

- **TK-03.4.4** — Retornar feedback visual de sucesso
  - Deliverable: Success toast or confirmation message after log
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Toast appears for 2-3 seconds; message confirms what was logged; disappears automatically

---

## Home Screen Layout (Wireframe)

```
┌─────────────────────────────┐
│  Today                  👤  │  (Header)
├─────────────────────────────┤
│  ┌─────────────────────────┐│
│  │  Hero Card              ││
│  │  "Great day! 3 feeds,   ││
│  │   4h sleep, On track 🟢 ││
│  │                    👀   ││
│  └─────────────────────────┘│
│                             │
│  ┌──────────┬──────────────┐│
│  │🍼 Feeding│  Last: 30m   ││
│  │          │  Today: 450ml││
│  │Registrar │              ││
│  └──────────┴──────────────┘│
│  ┌──────────┬──────────────┐│
│  │💧Hydrato │  Today: 200ml││
│  │          │  Target: 500 ││
│  │Registrar │  [████░░░░░] ││
│  └──────────┴──────────────┘│
│  ┌──────────┬──────────────┐│
│  │😴 Sleep  │  Today: 4h30 ││
│  │          │  Last: 1h15m ││
│  │Registrar │              ││
│  └──────────┴──────────────┘│
│  [More cards below...]        │
│                             │
│  TIMELINE                    │
│  ├─ 3:45 PM 🍼 Bottle       │
│  │           Formula, 100ml  │
│  │           Parent         │
│  ├─ 2:30 PM 💧 Water        │
│  │           100ml, Parent  │
│  ├─ 1:15 PM 😴 Nap ended   │
│  │           Duration: 45m  │
│  │           Parent         │
│  └─ ...                      │
└─────────────────────────────┘
     🏠  👥  📋  👶     (Bottom nav)
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Hero Card Complete:** Shows summary, status badge, and textual insight
2. **6 Tracker Cards Present:** Each displays last event and today's total
3. **Timeline Functional:** Chronological list of all day's events
4. **Inline Logging Works:** Quick log from card → bottom sheet → saves → closes → home updates
5. **Empty State Handled:** Friendly message when no events
6. **Performance:** Home loads in < 1s (cached data)
7. **Responsive:** Works on 320px-768px screens

### QA Checklist
- [ ] Hero card displays; metrics calculate correctly
- [ ] Status badge shows appropriate status
- [ ] All 6 tracker cards visible (scroll on mobile)
- [ ] Each card shows last event and today total
- [ ] Timeline shows all events; sorted newest first
- [ ] Timeline item shows icon, title, detail, time, caregiver
- [ ] Empty timeline shows empty state
- [ ] "Registrar" button on each card is clickable
- [ ] Bottom sheet opens on button tap
- [ ] Bottom sheet form is minimal and sensible
- [ ] Submitting form creates event
- [ ] Bottom sheet closes after submit
- [ ] Home updates immediately (card metrics, timeline)
- [ ] Success toast appears
- [ ] No visual glitches or overlaps
- [ ] Responsive on mobile (320px) and tablet (768px)

---

## Testing Strategy

### Unit Testing
- Metric calculation logic (feeding total, sleep hours, etc.)
- Timeline sorting functions
- Status badge logic (determine "On track" vs. "Check hydration")

### Integration Testing
- Load home → hero card displays
- Load home → 6 cards visible with correct data
- Load home → timeline shows events
- Click "Registrar" on card → bottom sheet opens with correct type pre-filled
- Submit form → event created → home updates

### E2E Testing
- Full flow: Home load → click Registrar on Feeding → fill form → submit → see event in timeline and card updated

### Visual Regression
- Screenshot comparison across devices (mobile, tablet)
- Empty state visual
- Loaded state visual

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Home load time (FCP) | < 1s | Lighthouse |
| Inline log speed | < 500ms | Network tab |
| Timeline render (30 events) | < 2s | Performance profiler |
| Visual consistency | 100% | Design review + automated screenshot comparison |
| Accessibility (WCAG AA) | Pass | axe DevTools |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Metrics calculation wrong | Confuses users | Medium | Unit test logic; manual verification against raw data |
| Performance degrade with many events | Slow home | Medium | Lazy-load timeline; virtualization if > 50 events |
| Inline log UX confusing | Slower adoption | Low | User testing with 3-5 target users; iterate |
| Bottom sheet doesn't close properly | Breaks flow | Low | Thorough testing of dismiss logic; handle edge cases |
| Hero card too cluttered | Defeats purpose | Low | Design review; user testing; keep to 3-5 metrics max |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Hero card complete | Day 3 | Pending |
| 6 tracker cards done | Day 5 | Pending |
| Timeline functional | Day 7 | Pending |
| Inline logging working | Day 10 | Pending |
| QA sign-off | Day 12 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Hero card component with metrics and status badge
2. ✓ Tracker card component (6 variations)
3. ✓ Timeline component with event list
4. ✓ Empty state design and component
5. ✓ Bottom sheet for inline logging
6. ✓ Home page layout (responsive)
7. ✓ Unit tests for metric calculations
8. ✓ Integration tests for state updates
9. ✓ E2E tests for full flow
10. ✓ Visual regression tests
11. ✓ Accessibility audit (WCAG AA)
12. ✓ Performance baseline (Lighthouse report)

---

## Related Documents
- PRODUCT_SPEC.md: Core Trackers, UX Flow
- EP-01: Design System (components, colors)
- EP-02: Data Model (event schema)
- EP-04 to EP-06: Detailed tracker flows (build on this)
- EP-07: Caregiver tab (shares timeline)
- EP-08: Insights (uses home card)

