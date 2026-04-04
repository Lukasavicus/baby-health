# EP-07 — Cuidadores

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-07 |
| **Title** | Cuidadores |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Backend Lead |
| **Milestone** | MVP Core (Week 5-6) |

## Objective
Suportar múltiplos cuidadores sem autenticação complexa no MVP. Permitir que famílias compartilhem visibilidade de todas as ações do bebê, atribuindo cada log a um cuidador específico, e forneçam um feed compartilhado com filtros opcionais por pessoa.

---

## Epic Scope

### What This Epic Covers
- Caregiver entity and data model
- Caregiver selection on app launch (device pairing, no auth)
- Caregiver association with every logged event
- Shared timeline/feed visible to all caregivers
- Caregiver display in timeline (avatar, name, color)
- Caregivers tab with shared feed and per-caregiver summaries
- Filtering events by caregiver (future P1, optional for MVP)
- Caregiver management (add, remove, edit colors)

### What This Epic Does NOT Cover
- Cloud synchronization (data stays local in MVP)
- Authentication (no login; device-based)
- Role-based permissions (all caregivers have equal access)
- Real-time multi-device sync (future)
- Notifications (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (colors, avatars)
- **EP-02:** Data model (event schema with caregiver attribution)
- **EP-03:** Home dashboard (timeline with caregiver display)

### Blocking
- **Blocks:** Full MVP completion (shared visibility is core to multi-caregiver families)

---

## Features & Work Breakdown

### FE-07.1 — Identidade de Cuidador (P0)
**Objective:** Define and manage caregiver identities across the app.

#### User Stories
- **US-07.1.1** — Como família, queremos saber quem registrou cada evento.
  - Acceptance Criteria:
    - Every logged event shows the caregiver name/avatar
    - Caregiver is selected at app launch (device pairing)
    - Can switch caregiver without logging off (simple dropdown/selector)
    - Caregiver state persists across sessions
    - Caregiver name visible in timeline next to event

- **US-07.1.2** — Como cuidador, eu quero saber quem está usando o app agora.
  - Acceptance Criteria:
    - Current caregiver name displayed prominently (header or sidebar)
    - Tap to change caregiver (quick switcher)
    - Change is immediate (no refresh needed)

#### Tasks
- **TK-07.1.1** — Modelar entidade de cuidador
  - Deliverable: Caregiver data model with fields
  - Schema:
    ```typescript
    {
      id: UUID,
      name: string,
      role: 'parent' | 'nanny' | 'grandparent' | 'other',
      color: string (hex), // for visual distinction
      avatar: string (emoji), // e.g., 👨 👩 👴 👵
      initials: string, // for avatar fallback
      createdAt: ISO 8601
    }
    ```
  - Owner: Backend Lead
  - Effort: 2 hours
  - Acceptance: Schema defined; migrations run; stored locally or in backend

- **TK-07.1.2** — Criar lista de cuidadores no setup inicial
  - Deliverable: First-run setup flow for adding caregivers
  - Flow:
    1. Welcome screen
    2. "Add caregivers" form (name, role, color, emoji)
    3. Add at least 1 caregiver (required)
    4. Add more caregivers (optional, can do later)
    5. Select current caregiver
    6. → Home
  - Owner: Frontend Engineer
  - Effort: 5 hours
  - Acceptance: Setup flow completes; caregivers saved; can add/edit later

- **TK-07.1.3** — Permitir selecionar cuidador atual
  - Deliverable: Caregiver selector (dropdown, pills, or modal)
  - Placement: Header area or settings
  - Behavior: Tap to open selector → choose caregiver → immediately applied → all new logs use this caregiver
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Selector works; switching is instant; state persisted

- **TK-07.1.4** — Associar cuidador a cada log
  - Deliverable: Logic to attach caregiver to every event on creation
  - Behavior: When creating event, auto-populate `caregiver` field with current user
  - Owner: Backend Engineer
  - Effort: 2 hours
  - Acceptance: All events have caregiver; no events without attribution; attribute correct

---

### FE-07.2 — Feed Compartilhado (P0, depends on FE-07.1 + FE-03.3)
**Objective:** Create a dedicated Caregivers tab showing shared feed and per-caregiver activity.

#### User Stories
- **US-07.2.1** — Como cuidador, eu quero ver um feed comum para acompanhar tudo que foi feito.
  - Acceptance Criteria:
    - Caregivers tab shows chronological feed of all events (all caregivers mixed)
    - Same events as home timeline, but dedicated view
    - Shows caregiver name and avatar for each event
    - Last 30 days visible (scroll to see older)
    - Refreshes on-demand or auto-refreshes if device has other caregiver's changes

#### Tasks
- **TK-07.2.1** — Criar tela Cuidadores
  - Deliverable: New Caregivers tab and screen
  - Layout:
    - Header: "Cuidadores" with optional "Manage" button (future)
    - Subheader: "Shared activity" or "All events"
    - Main: Scrollable timeline/feed
    - Bottom: Summary cards (optional) showing each caregiver's recent activity
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Screen renders; navigation works; bottom nav shows active tab

- **TK-07.2.2** — Exibir feed compartilhado
  - Deliverable: Shared feed component showing all events chronologically
  - Sorting: Newest first (same as home timeline)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Feed shows all events; sorted correctly; virtualized if > 100 events

- **TK-07.2.3** — Mostrar avatar/nome do cuidador
  - Deliverable: Caregiver display in timeline items
  - Display: Avatar (emoji or initials) + name next to event
  - Color: Use caregiver's assigned color as background or accent
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Avatar and name visible on all timeline items; color matches caregiver

- **TK-07.2.4** — Exibir últimos registros por pessoa
  - Deliverable: (Optional, not required for MVP) Summary cards showing each caregiver's recent activity
  - Display: Caregiver name + avatar + "Last logged: [event type] 2h ago"
  - Owner: Frontend Engineer
  - Effort: 3 hours (optional P1 task)
  - Acceptance: Cards show correct data; update after new logs

---

### FE-07.3 — Filtro por Cuidador (P1, depends on FE-07.2)
**Objective:** (Future/optional) Filter timeline by specific caregiver.

#### User Stories
- **US-07.3.1** — Como cuidador, eu quero filtrar registros por pessoa para entender quem fez o quê.
  - Acceptance Criteria:
    - Filter chips/buttons showing each caregiver
    - Tap to toggle caregiver (can select multiple or single)
    - Timeline filters to show only selected caregiver(s)
    - "All caregivers" option to reset filter
    - Filter state persists during session

#### Tasks
- **TK-07.3.1** — Implementar chips de filtro
  - Deliverable: Caregiver filter chips (toggle buttons) above timeline
  - Placement: Caregivers tab, above feed
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Chips visible; tap toggles selection; visual feedback on select

- **TK-07.3.2** — Filtrar timeline e feed
  - Deliverable: Filtering logic to show only events from selected caregiver(s)
  - Behavior: Chip selection → timeline updates instantly
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Filtering works correctly; timeline updates instantly; no data loss

- **TK-07.3.3** — Criar clear filter
  - Deliverable: "All caregivers" option to reset filter
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Clicking "All" resets filter; shows all events

---

## Caregivers Tab Layout (Wireframe)

```
┌─────────────────────────────┐
│  Cuidadores            👤  │  (Header)
├─────────────────────────────┤
│ Filter chips (future P1):    │
│ ◯ All  ◯ Mom  ◯ Dad  ◯ Nanny │
├─────────────────────────────┤
│ SHARED FEED                  │
│ ├─ 3:45 PM  👩 Mom           │
│ │           🍼 Bottle        │
│ │           Formula, 100ml  │
│ ├─ 2:30 PM  👨 Dad           │
│ │           😴 Nap ended    │
│ │           Duration: 1h 15m │
│ ├─ 1:15 PM  👵 Grandma       │
│ │           💧 Water        │
│ │           100ml           │
│ ├─ ...                       │
│                             │
│ RECENT BY CAREGIVER (opt):   │
│ ┌──────────┬─────────────┐  │
│ │👩 Mom    │ Last: Feeding│  │
│ │          │ 30m ago     │  │
│ └──────────┴─────────────┘  │
│ ┌──────────┬─────────────┐  │
│ │👨 Dad    │ Last: Sleep │  │
│ │          │ 2h ago      │  │
│ └──────────┴─────────────┘  │
└─────────────────────────────┘
     🏠  👥  📋  👶     (Bottom nav)
```

---

## Setup Flow (Wireframe)

```
Welcome to BabyHealth!

1. Baby Setup
   [Name: ________]
   [Date of birth: __/__/____]

2. Add Caregivers
   [+ Add caregiver]

   Caregiver 1:
   [Name: ________]
   [Role: Parent ▼]
   [Color: 🔵] [Avatar: 👩]

   [+ Add another caregiver]

3. Who's using the app now?
   ◯ Mom  ◯ Dad  ◯ Nanny

[Let's go!]
```

---

## Data Model

### Caregiver Entity
```typescript
interface Caregiver {
  id: UUID;
  name: string;
  role: 'parent' | 'nanny' | 'grandparent' | 'other';
  color: string; // hex color, e.g. "#FF6B9D"
  avatar: string; // emoji, e.g. "👩"
  initials: string; // e.g. "MM" for Mary Martinez
  createdAt: ISO 8601;
}

// Stored in localStorage or IndexedDB as array
// Default: empty array; setup flow creates first caregiver
```

### Current Caregiver State
```typescript
// Stored in localStorage
currentCaregiver: string; // caregiver name (or ID)
```

### Event Attribution
```typescript
// All events have caregiver field (already in EP-02 schema)
event.caregiver: string; // caregiver name
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Caregiver Entity:** Defined, stored, retrieved correctly
2. **Setup Flow:** Creates initial caregiver(s); saved to storage
3. **Caregiver Selection:** Selector works; switching instant; state persisted
4. **Event Attribution:** All events have caregiver; correct caregiver attached
5. **Shared Feed:** Caregivers tab displays chronological feed with all events
6. **Caregiver Display:** Avatar, name, and color visible in timeline
7. **Recent Activity (Optional P1):** Summary cards showing per-caregiver recent activity
8. **Filter (P1):** Chips work; filtering instant; reset available

### QA Checklist
- [ ] Setup flow runs on first launch
- [ ] Can add multiple caregivers in setup
- [ ] Caregivers saved and persisted
- [ ] Caregiver selector visible in header/settings
- [ ] Can switch caregiver quickly
- [ ] All new logs have correct caregiver attribution
- [ ] Home timeline shows caregiver name/avatar
- [ ] Caregivers tab accessible from bottom nav
- [ ] Caregivers tab displays shared feed (all events)
- [ ] Timeline sorted correctly (newest first)
- [ ] Caregiver avatar and name visible on each event
- [ ] Color assigned to each caregiver matches their identity
- [ ] Recent activity cards show correct data (if implemented)
- [ ] Filter chips toggle correctly (if implemented)
- [ ] Filtered timeline updates instantly (if implemented)
- [ ] No data loss when switching caregivers
- [ ] Caregiver state persists across app restarts

---

## Testing Strategy

### Unit Testing
- Caregiver model validation
- Event attribution logic
- Filtering logic

### Integration Testing
- Setup flow → caregivers created → default selected
- Switch caregiver → all new events use new caregiver
- Log event → appears in home timeline and caregivers tab with correct attribution
- Caregivers tab shows all events from all caregivers

### E2E Testing
- First run: Setup caregivers → select current → log event → see in shared feed with attribution

### Visual Testing
- Caregiver colors and avatars render correctly
- Timeline item layout with avatar/name
- Filter chips visual states (selected, unselected)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Setup flow completion rate | 100% | Test on new instances |
| Caregiver attribution accuracy | 100% | Manual verification of events |
| Feed load time | < 2s (30 events) | Performance profiling |
| User satisfaction | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| No auth → anyone can access/edit | Security/privacy concern | High | Clarify in onboarding: device is shared, all caregivers equal | Lock to device/browser later if needed |
| Setup flow skipped/incomplete | App broken for multi-caregiver families | Medium | Make setup mandatory; validate before → Home |
| Caregiver attribution wrong | Confusion about who did what | Low | Unit test attribution logic; manual verification |
| Many caregivers slow feed render | Performance issue | Low | Virtualize timeline if > 100 events; lazy-load |
| Filter state confuses users | Lower adoption of feature | Low | Filter is P1 (optional); can defer or simplify |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Caregiver model and setup flow complete | Day 3 | Pending |
| Caregiver selector working | Day 4 | Pending |
| Event attribution logic working | Day 5 | Pending |
| Caregivers tab and shared feed complete | Day 7 | Pending |
| (Optional P1) Filter chips and filtering | Day 8 | Pending |
| QA and testing | Day 10 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Caregiver data model and schema
2. ✓ Caregivers setup flow (first run)
3. ✓ Caregiver selector component
4. ✓ Event attribution logic
5. ✓ Caregivers tab screen
6. ✓ Shared feed component
7. ✓ Caregiver display in timeline (avatar, name, color)
8. ✓ (Optional P1) Recent activity summary cards
9. ✓ (Optional P1) Filter chips component
10. ✓ (Optional P1) Filtering logic
11. ✓ Unit tests for caregiver operations
12. ✓ Integration tests for setup and attribution
13. ✓ E2E tests for multi-caregiver flows

---

## Related Documents
- PRODUCT_SPEC.md: Target Users, Multi-caregiver support
- EP-02: Data model (event schema with caregiver field)
- EP-03: Home timeline (shows caregiver display)
- EP-07: This epic
- Future: Cloud sync (will extend caregiver management)

