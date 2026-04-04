# EP-05 — Sono e Tempo Acordado

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-05 |
| **Title** | Sono e tempo acordado |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Backend Lead |
| **Milestone** | MVP Core (Week 4-5) |

## Objective
Controlar rotina de sono com clareza e precisão. Permitir tracking de sonecas e sono noturno, calcular tempo acordado, exibir resumo diário de sono e facilitar o planejamento de rotinas baseado em awake windows.

---

## Epic Scope

### What This Epic Covers
- Sleep session creation (start/end with timestamp)
- Sleep type categorization (nap vs. overnight)
- Duration calculation and storage
- Awake window tracking (time since last sleep end)
- Daily sleep summary (naps + overnight total, distribution)
- Sleep history and editing (ability to correct logged sleep)
- Visual indicators (last nap, current awake time, sleep quota)

### What This Epic Does NOT Cover
- Sleep quality tracking with detailed notes (future)
- Wake counts and sleep disruption analysis (future)
- Wake window recommendations (future, but prep groundwork)
- Sleep training or coaching (future)
- Integration with wearables (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (sleep card styling)
- **EP-02:** Data model (sleep event schema)
- **EP-03:** Home dashboard (sleep card, awake window card)

### Blocking
- **Blocks:** EP-08 (insights use sleep data)

---

## Features & Work Breakdown

### FE-05.1 — Registro de Sono (P0)
**Objective:** Simple and flexible sleep logging (start and end times).

#### User Stories
- **US-05.1.1** — Como cuidador, eu quero iniciar e encerrar sonecas e sono noturno com um toque.
  - Acceptance Criteria:
    - Single button to start sleep (taps once, sets start time)
    - Active sleep state shows "Sleep in progress" with elapsed time
    - Tap to end sleep → closes session with duration
    - Sleep type selector (nap or overnight)
    - Timestamp defaulted to now, editable
    - Can see active sleep in home (small indicator)

#### Tasks
- **TK-05.1.1** — Criar tipos: soneca, sono noturno
  - Deliverable: Sleep type enum (nap, overnight_sleep)
  - Owner: Product
  - Effort: 1 hour
  - Acceptance: Types defined, icons assigned, terminology clear

- **TK-05.1.2** — Implementar iniciar sono
  - Deliverable: Start sleep action that records timestamp and creates pending sleep event
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Button tappable from Registrar or Sleep card; timestamp recorded; state persists across navigation

- **TK-05.1.3** — Implementar finalizar sono
  - Deliverable: End sleep action that records end timestamp and calculates duration
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Sleep session closes with duration; appears in timeline; awake window resets

- **TK-05.1.4** — Calcular duração
  - Deliverable: Duration calculation utility (end_time - start_time = minutes/hours)
  - Owner: Backend Engineer
  - Effort: 1 hour
  - Acceptance: Duration calculated correctly; handles same-day and next-day sleeps; stored as minutes

- **TK-05.1.5** — Permitir edição posterior
  - Deliverable: Edit form to adjust sleep start/end times after logging
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Tap event → edit time picker → save → duration recalculates; history not lost (update, not delete)

---

### FE-05.2 — Tempo Acordado (P0, depends on FE-05.1)
**Objective:** Display and track awake window (time since last sleep ended).

#### User Stories
- **US-05.2.1** — Como cuidador, eu quero saber há quanto tempo o bebê está acordado.
  - Acceptance Criteria:
    - Awake Window card displays current awake time (e.g., "2h 15m")
    - Counter updates in real-time (if app is open)
    - Resets to 0 immediately after logging new sleep
    - Shows "N/A" if no sleep logged yet in app
    - Recommended max window displayed (age-appropriate)

#### Tasks
- **TK-05.2.1** — Calcular awake window
  - Deliverable: Utility function to calculate time between last sleep end and now
  - Logic:
    - Find most recent sleep event with end time
    - If none, return null or display N/A
    - Otherwise, return (now - lastSleepEnd)
  - Owner: Backend Engineer
  - Effort: 2 hours
  - Acceptance: Calculation correct; handles edge cases (no sleep yet, multiple sleeps)

- **TK-05.2.2** — Exibir contador no card
  - Deliverable: Awake Window card component with counter display
  - Display format: "Awake 2h 15m" with visual indicator (e.g., filling arc)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Card visible on home; counter accurate; updates every minute

- **TK-05.2.3** — Resetar ao registrar novo sono
  - Deliverable: Logic to reset awake window to 0 (or null) after logging sleep end
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: After ending sleep, awake window immediately shows 0 or resets to "N/A"

- **TK-05.2.4** — Definir comportamento quando não houver dados
  - Deliverable: UI state for awake window when no sleep logged yet
  - Display: "N/A" or "—" or "Start first sleep to track"
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Empty state clear and friendly

---

### FE-05.3 — Resumo Diário de Sono (P0, depends on FE-05.1)
**Objective:** Aggregate daily sleep metrics.

#### User Stories
- **US-05.3.1** — Como cuidador, eu quero ver o total de sono do dia e a distribuição entre sonecas e noite.
  - Acceptance Criteria:
    - Sleep card shows total sleep hours today
    - Breakdown: "Naps: 2h 30m, Overnight: 8h 15m"
    - Shows last sleep session duration (e.g., "Last: 1h 15m")
    - Daily target displayed (age-dependent, e.g., "Target: 12-16h")
    - Visual progress bar or status indicator

#### Tasks
- **TK-05.3.1** — Somar sono diurno
  - Deliverable: Calculation of total nap duration for current day
  - Owner: Backend Engineer
  - Effort: 2 hours
  - Acceptance: Sum calculated correctly; ignores overnight sleeps; handles multiple naps

- **TK-05.3.2** — Somar sono noturno
  - Deliverable: Calculation of total overnight sleep duration for current day
  - Owner: Backend Engineer
  - Effort: 2 hours
  - Acceptance: Sum calculated correctly; ignores naps; handles multi-night sleep edge case

- **TK-05.3.3** — Exibir última sessão
  - Deliverable: Most recent sleep session (duration and time) displayed in card
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Shows "Last: 1h 15m (3:45 PM)" or similar

- **TK-05.3.4** — Exibir padrão básico na home
  - Deliverable: Sleep card summary visible on home (not requiring navigation to details)
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Card shows total, breakdown, and last session; clean layout; readable

---

## Data Schema (Sleep Events)

### Sleep Session
```typescript
{
  type: 'sleep',
  subtype: 'nap' | 'overnight_sleep',
  timestamp: ISO 8601, // start time
  quantity: 120, // duration in minutes
  unit: 'minutes',
  metadata: {
    startTime: ISO 8601,
    endTime: ISO 8601,
    durationMinutes: number,
    quality?: 'restful' | 'interrupted' | 'poor', // future
    wakeCount?: number // future
  }
}
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Sleep Start/End:** Single tap to start, single tap to end; state persists
2. **Duration Calculation:** Correct and displayed in timeline
3. **Awake Window:** Real-time counter; resets after sleep; N/A when not applicable
4. **Daily Summary:** Total sleep, nap vs. overnight breakdown, last sleep, target
5. **Editing:** Ability to adjust logged sleep times
6. **Performance:** Counter updates smoothly (no jank even with real-time updates)

### QA Checklist
- [ ] Tap "Start sleep" → app shows sleep in progress state
- [ ] Active sleep visible in home (indicator or banner)
- [ ] Tap "End sleep" → form shows type (nap/overnight)
- [ ] Sleep event created with start and end time
- [ ] Duration calculated correctly
- [ ] Sleep appears in timeline with icon, type, and duration
- [ ] Awake window card shows time since last sleep ended
- [ ] Awake counter updates every minute (if app open)
- [ ] Awake window resets to 0 after logging new sleep
- [ ] Sleep card shows daily total (hours)
- [ ] Sleep card shows breakdown (naps + overnight)
- [ ] Sleep card shows last sleep session
- [ ] Sleep card displays target sleep hours for age
- [ ] Tap sleep event → edit form
- [ ] Edit times → duration recalculates → save works
- [ ] No data loss when editing
- [ ] Timezone handling correct (cross-midnight sleeps)

---

## Testing Strategy

### Unit Testing
- Duration calculation (same-day and cross-midnight)
- Awake window calculation
- Daily aggregation (naps vs. overnight)
- Target sleep by age lookup

### Integration Testing
- Start sleep → active state → end sleep → event created and appears in timeline
- Log sleep → awake window resets
- Edit sleep time → duration recalculates
- Multiple sleeps in a day → all aggregated correctly

### E2E Testing
- Full flow: Tap sleep card "Start" → app shows active → switch tabs → return → counter running → "End" → event saved → timeline updated → awake window resets

### Real-time Testing
- Awake counter updates every minute without lag or battery drain
- Cross-midnight sleep (e.g., 11 PM to 7 AM) handled correctly
- Timezone change during sleep handled gracefully

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Sleep log latency | < 500ms | Network tab |
| Awake counter accuracy | ±1min | Real-time testing |
| Duration calculation accuracy | 100% | Manual verification |
| Data persistence | 100% | Edit and refresh; data present |
| User satisfaction | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Real-time counter drains battery | Battery usage complaint | Medium | Update counter only when app in foreground; use setTimeout efficiently; test battery impact |
| Cross-midnight sleep miscalculated | Wrong duration | Medium | Unit tests with dates that span midnight; handle timezone carefully |
| Awake window displays when invalid | Confuses users | Low | Clear validation logic; show N/A if no valid sleep data |
| Edit form changes wrong event | Data loss | Low | Unique event IDs; confirmation dialog before saving |
| Active sleep state persists after crash | Stale indicator | Low | Clear active state on app launch if end time missing; graceful recovery |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Sleep start/end complete | Day 3 | Pending |
| Duration calculation done | Day 4 | Pending |
| Awake window counter working | Day 6 | Pending |
| Daily summary complete | Day 8 | Pending |
| Editing and QA | Day 10 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Sleep start/end action handlers
2. ✓ Sleep form with type selector
3. ✓ Sleep event creation and persistence
4. ✓ Duration calculation utility
5. ✓ Sleep card component with daily summary
6. ✓ Awake Window card component with real-time counter
7. ✓ Timeline event rendering for sleep
8. ✓ Edit sleep form and logic
9. ✓ Data schema and migrations
10. ✓ Unit tests for calculations
11. ✓ Integration tests for start/end flows
12. ✓ E2E tests for complete sleep tracking
13. ✓ Battery/performance testing report

---

## Related Documents
- PRODUCT_SPEC.md: Core Trackers (Sleep, Awake Window)
- EP-02: Data model (event schema)
- EP-03: Home dashboard (Sleep and Awake Window cards)
- EP-05: This epic
- EP-08: Insights (uses sleep data)

