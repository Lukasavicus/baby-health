# EP-06 — Fraldas e Atividades

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-06 |
| **Title** | Fraldas e atividades |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Backend Lead |
| **Milestone** | MVP Core (Week 5) |

## Objective
Fechar o núcleo do log diário com tracking de fraldas (tipo: molhada, suja, mista) e atividades de desenvolvimento (tummy time, leitura, brincadeira, passeio, banho). Permitir logging rápido de fraldas com resumo diário e capturar tempo de atividade para suportar desenvolvimento do bebê.

---

## Epic Scope

### What This Epic Covers
- Diaper logging (wet, soiled, mixed)
- Diaper count aggregation (daily totals by type)
- Quick preset diaper logs
- Activity logging with duration tracking
- Activity type catalog (tummy time, reading, play, outdoor, bath)
- Activity summary cards (total time per activity, last activity)
- Optional notes for both diapers and activities
- Timeline display for all diaper and activity events

### What This Epic Does NOT Cover
- Diaper recommendations or health alerts (future)
- Activity recommendations by age (future)
- Integration with baby development milestones (future, EP-10)
- Allergy tracking for specific products (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (card styling, icons)
- **EP-02:** Data model (diaper and activity event schemas)
- **EP-03:** Home dashboard (Diaper and Activity cards)

### Blocking
- **Blocks:** EP-08 (insights use activity/diaper data)

---

## Features & Work Breakdown

### FE-06.1 — Fraldas (P0)
**Objective:** Quick and flexible diaper change logging.

#### User Stories
- **US-06.1.1** — Como cuidador, eu quero registrar xixi, cocô ou fralda mista rapidamente.
  - Acceptance Criteria:
    - Diaper form shows type selector (wet, soiled, mixed)
    - Timestamp defaulted to now, editable
    - Optional notes field (e.g., "color, consistency, any concerns")
    - Submit → creates event and updates Diaper card
    - Quick presets available (3 buttons: wet, soiled, mixed)

#### Tasks
- **TK-06.1.1** — Criar tipos: molhada, suja, mista
  - Deliverable: Diaper type enum and icons
  - Types:
    - "wet" (xixi only) — blue water droplet icon
    - "soiled" (cocô only) — brown icon
    - "mixed" (wet and soiled) — combined icon
  - Owner: Product
  - Effort: 1 hour
  - Acceptance: Types defined; icons designed and approved

- **TK-06.1.2** — Criar presets rápidos
  - Deliverable: Quick tap buttons for each diaper type
  - Placement: Registrar → Diaper type selection → quick buttons
  - Behavior: Single tap → creates event with timestamp (now) → closes → home updates
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Presets work; < 500ms latency; no form required for presets (direct save)

- **TK-06.1.3** — Permitir observação curta
  - Deliverable: Notes field (text input, optional)
  - Character limit: 140 characters (encourage brevity)
  - Placeholder: "Any notes? Color, consistency, concerns..."
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Notes field present and functional; optional (no validation)

- **TK-06.1.4** — Atualizar total diário
  - Deliverable: Diaper card displays today's count by type
  - Display: "Today: 8 wet + 3 soiled = 11 total"
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card updates after new diaper log; calculation correct; no data loss

---

### FE-06.2 — Atividades (P0)
**Objective:** Track baby activities and development time.

#### User Stories
- **US-06.2.1** — Como cuidador, eu quero registrar atividades de desenvolvimento do bebê.
  - Acceptance Criteria:
    - Activity type selector (tummy time, reading, play, outdoor, bath)
    - Duration input (optional: timer or manual minutes)
    - Timestamp defaulted to now
    - Optional notes (e.g., "seemed interested in the book")
    - Can log activity with or without duration

#### Tasks
- **TK-06.2.1** — Definir catálogo inicial: tummy time, leitura, brincadeira, passeio, banho
  - Deliverable: Activity type enum and icons
  - Types:
    - "tummy_time" — orange/warm icon (tummy time)
    - "reading" — book icon
    - "play" — toy/play icon
    - "outdoor" — sun/outdoor icon
    - "bath" — water/bath icon
  - Future extensible: "music", "water play", etc.
  - Owner: Product
  - Effort: 1 hour
  - Acceptance: Initial catalog finalized; icons designed

- **TK-06.2.2** — Permitir atividade com duração
  - Deliverable: Duration input field (minutes or timer)
  - Options:
    - Manual: text input for minutes (e.g., "15")
    - Timer: start/stop buttons (similar to sleep timer)
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Both manual and timer options work; duration saved in minutes; timer persists if user navigates

- **TK-06.2.3** — Permitir atividade sem duração
  - Deliverable: Checkbox or toggle to skip duration (optional field)
  - Behavior: Can log activity without duration (still appears in timeline and count)
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Activities can be logged without duration; no validation error

- **TK-06.2.4** — Atualizar total do dia por atividade
  - Deliverable: Activity summary on home and in Activity card
  - Display: "Tummy time: 15m | Reading: 20m | Play: 30m"
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Card updates after new activity log; aggregation correct by type; displays only activities with time

---

### FE-06.3 — Resumo de Atividades (P0, depends on FE-06.2)
**Objective:** Activity summary card on home with key engagement indicators.

#### User Stories
- **US-06.3.1** — Como cuidador, eu quero saber se o bebê teve estímulos importantes no dia.
  - Acceptance Criteria:
    - Activity card visible on home
    - Shows total tummy time today (minutes)
    - Shows whether reading was logged today (yes/no or count)
    - Shows last activity logged (type and time)
    - Card indicates if minimum daily stimulation met (future: smart target)

#### Tasks
- **TK-06.3.1** — Criar card de atividades
  - Deliverable: Activity summary card component
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Card present on home; layout clean; responsive

- **TK-06.3.2** — Exibir tummy time total
  - Deliverable: Tummy time duration aggregated from all tummy_time events today
  - Display: "Tummy time: 15m" or "Tummy time: 0m (add some today)"
  - Visual: Progress bar showing against recommended (e.g., "10m daily")
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Total calculated correctly; updates after log; progress bar accurate

- **TK-06.3.3** — Exibir leitura do dia
  - Deliverable: Indicator whether reading was logged today
  - Display: "Reading: ✓ Yes (20m ago)" or "Reading: — (try today)"
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Indicator shows reading status; time shown if logged; no time shown if not

- **TK-06.3.4** — Exibir última atividade registrada
  - Deliverable: Most recent activity (type, duration, time) on Activity card
  - Display: "Last: Tummy time, 15m (2:30 PM)"
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Shows most recent activity; time and duration accurate

---

## Data Schema (Diaper & Activity Events)

### Diaper Event
```typescript
{
  type: 'diaper',
  subtype: 'wet' | 'soiled' | 'mixed',
  timestamp: ISO 8601,
  caregiver: string,
  notes?: string,
  metadata: {
    diaperType: 'wet' | 'soiled' | 'mixed'
  }
}
```

### Activity Event
```typescript
{
  type: 'activity',
  subtype: 'tummy_time' | 'reading' | 'play' | 'outdoor' | 'bath',
  timestamp: ISO 8601,
  caregiver: string,
  quantity?: number, // duration in minutes (optional)
  unit?: 'minutes',
  notes?: string,
  metadata: {
    activityType: string,
    durationMinutes?: number
  }
}
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Diaper Logging:** Type selector, optional notes, quick presets all working
2. **Diaper Aggregation:** Daily count by type displayed in card
3. **Activity Logging:** Type selector, optional duration, optional notes working
4. **Activity Aggregation:** Daily totals by activity type calculated and displayed
5. **Activity Card:** Tummy time progress, reading indicator, last activity shown
6. **Timeline:** All diaper and activity events appear with correct icons and details
7. **Performance:** Quick diaper presets < 300ms; activity logs < 500ms

### QA Checklist
- [ ] Diaper form shows type selector (wet, soiled, mixed)
- [ ] Diaper quick presets work (1-tap)
- [ ] Diaper notes field optional and saves
- [ ] Diaper event appears in timeline with icon and type
- [ ] Diaper card shows today total by type
- [ ] Diaper card updates after new log
- [ ] Activity form shows type selector
- [ ] Activity duration input (manual) works
- [ ] Activity timer (start/stop) works; duration saves
- [ ] Activity notes field optional and saves
- [ ] Activity can be logged without duration
- [ ] Activity event appears in timeline with type and duration
- [ ] Activity card shows tummy time total (minutes)
- [ ] Activity card shows reading status (yes/no)
- [ ] Activity card shows last activity with time
- [ ] Progress bars (tummy time) fill correctly
- [ ] All events persist across refresh
- [ ] Forms validate input (prevent negative durations, etc.)

---

## Testing Strategy

### Unit Testing
- Diaper count aggregation (by type)
- Activity duration aggregation
- Last activity lookup

### Integration Testing
- Log diaper → Diaper card updates
- Log activity with timer → duration saved
- Log activity without duration → event created, no error
- Edit activity time → card updates
- Multiple activities same day → all aggregated

### E2E Testing
- Diaper flow: Tap Diaper card → select type → (optional notes) → submit → see in timeline and card
- Activity flow: Tap Activity card → select type → start timer → stop → submit → see in card with duration

### Accessibility Testing
- Quick preset buttons 48x48px minimum
- Form labels clear
- Icons have alt text or ARIA labels

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Diaper preset latency | < 300ms | Network tab |
| Activity log latency | < 500ms | Network tab |
| Data accuracy | 100% | Manual verification of counts |
| User satisfaction | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Activity timer doesn't persist across navigation | Loss of duration | Medium | Use service worker + state management; test thoroughly |
| Diaper count calculation wrong (multiple same-day entries) | Inaccurate data | Low | Unit tests for aggregation with 5+ diapers |
| Activity type catalog too limited | Users can't log their activities | Low | Start with 5 core types; plan for extensibility; user feedback in beta |
| Notes field too visible (users overwhelmed) | Low adoption of notes | Low | Make field optional and secondary; placeholder encouraging brevity |
| Tummy time target recommendation outdated | Bad user experience | Medium | Define targets by age upfront; document assumptions; plan for future customization |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Diaper types and presets complete | Day 2 | Pending |
| Diaper card and aggregation working | Day 3 | Pending |
| Activity type catalog and logging complete | Day 4 | Pending |
| Activity timer working | Day 6 | Pending |
| Activity card and summary complete | Day 8 | Pending |
| QA and testing | Day 10 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Diaper type enum and icons
2. ✓ Diaper quick preset buttons
3. ✓ Diaper form with optional notes
4. ✓ Diaper event creation and persistence
5. ✓ Diaper card component with daily totals
6. ✓ Activity type enum and icons
7. ✓ Activity form with manual duration and timer
8. ✓ Activity event creation and persistence
9. ✓ Activity card component with summary
10. ✓ Tummy time progress bar
11. ✓ Reading indicator
12. ✓ Last activity display
13. ✓ Timeline event rendering for diaper and activity
14. ✓ Data schema and migrations
15. ✓ Unit tests for aggregations
16. ✓ Integration tests for all flows
17. ✓ E2E tests for complete tracking

---

## Related Documents
- PRODUCT_SPEC.md: Core Trackers (Diapers, Activities)
- EP-02: Data model (event schema)
- EP-03: Home dashboard (Diaper and Activity cards)
- EP-06: This epic
- EP-08: Insights (uses diaper/activity data)

