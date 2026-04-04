# EP-02 — Modelo de Dados e Motor de Logs

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-02 |
| **Title** | Modelo de dados e motor de logs |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Backend Lead + Data Architect |
| **Milestone** | MVP Foundation (Week 2-3) |

## Objective
Criar a espinha dorsal do produto para registrar, armazenar e exibir eventos de forma consistente e performática. Estabelecer a entidade genérica de evento que servirá como base para todos os 6 trackers (alimentação, hidratação, sono, tempo acordado, fraldas, atividades).

---

## Epic Scope

### What This Epic Covers
- Generic event entity and schema
- Persistence layer abstraction (JSON, SQLite, DB-agnostic)
- Local storage on frontend (IndexedDB, localStorage)
- Event retrieval, filtering, and ordering
- Data validation and normalization
- Seed data for demo

### What This Epic Does NOT Cover
- Specific tracker business logic (handled in EP-04 through EP-06)
- UI components (handled in EP-03)
- Authentication/authorization (out of MVP scope)
- Real-time sync (future phase)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (not critical, but provides context for UI integration)

### Blocking
- **Blocks:** EP-03, EP-04, EP-05, EP-06, EP-07, EP-08
- **Critical:** All tracker features depend on the event model and logging engine

---

## Features & Work Breakdown

### FE-02.1 — Entidade Genérica de Evento (P0)
**Objective:** Define flexible, normalized event schema that all trackers can use.

#### User Stories
- **US-02.1.1** — Como sistema, eu preciso tratar todos os registros do bebê de forma consistente.
  - Acceptance Criteria:
    - All event types (feeding, sleep, diaper, etc.) use the same base schema
    - Events can be queried generically (by date, caregiver, type)
    - Schema is normalized (no data duplication)
    - Validation ensures data integrity
    - Events can be created, read, updated, deleted

- **US-02.1.2** — Como cuidador, eu quero ver diferentes tipos de log numa mesma linha do tempo.
  - Acceptance Criteria:
    - Timeline displays events from all trackers in chronological order
    - Each event shows its type, icon, and key details
    - Timeline is sortable (newest first, oldest first)
    - Timeline is filterable by event type
    - Empty timeline shows friendly empty state

#### Tasks
- **TK-02.1.1** — Definir schema genérico de evento
  - Deliverable: Detailed event schema definition (JSON Schema or TypeScript interface)
  - Schema outline:
    ```
    {
      id: UUID,
      babyId: UUID,
      type: enum (feeding, sleep, diaper, activity, health),
      subtype: string (bottle, nap, wet, tummy-time, etc.),
      timestamp: ISO 8601,
      caregiver: string (name of caregiver),
      quantity: number (optional),
      unit: string (optional, ml/minutes/count),
      notes: string (optional),
      metadata: object (type-specific fields),
      createdAt: ISO 8601,
      updatedAt: ISO 8601,
      isArchived: boolean (soft delete)
    }
    ```
  - Owner: Backend Lead
  - Effort: 6 hours
  - Acceptance: Schema documented; stakeholders reviewed; ready for implementation

- **TK-02.1.2** — Criar campos-base: id, tipo, subtipo, horário, quantidade, unidade, observação, cuidador
  - Deliverable: Database migrations and model definitions (SQLAlchemy, Django ORM, or equivalent)
  - Owner: Backend Engineer
  - Effort: 5 hours
  - Acceptance: Migrations run without error; schema reflects agreed-upon structure; indices on frequently queried fields (timestamp, type, caregiver)

- **TK-02.1.3** — Definir normalização por categoria
  - Deliverable: Category enums and constants (feeding types, sleep types, activity types, etc.)
  - Owner: Backend Engineer
  - Effort: 4 hours
  - Acceptance: All tracker categories and subtypes defined and documented; no free-text enums (prevent data inconsistency)

- **TK-02.1.4** — Criar utilitário de ordenação por tempo
  - Deliverable: Sorting utility function (backend + frontend)
  - Owner: Backend Engineer
  - Effort: 3 hours
  - Acceptance: Events sort by timestamp (ascending/descending); timezone handling correct; millisecond precision

---

### FE-02.2 — Persistência Local (P0, depends on FE-02.1)
**Objective:** Implement swappable persistence layer supporting offline-first workflows.

#### User Stories
- **US-02.2.1** — Como cuidador, eu quero que os registros permaneçam salvos ao fechar ou atualizar a página.
  - Acceptance Criteria:
    - Events persist across page refreshes
    - Events persist across browser restarts
    - Data is accessible immediately after app launch (no loading delay)
    - Caregiver is notified if data loss occurs (unlikely, but handled gracefully)
    - Sync queues work when back online (future phase; roadmap for now)

#### Tasks
- **TK-02.2.1** — Escolher estratégia de persistência local
  - Deliverable: Architecture decision record (ADR) for persistence strategy
  - Options:
    1. **Phase 1 (MVP):** JSON file (backend) + localStorage (frontend)
    2. **Phase 2:** SQLite (backend) + IndexedDB (frontend)
    3. **Phase 3:** Cloud DB (PostgreSQL) with local cache
  - Decision: Phase 1 for MVP to minimize complexity; abstract API to allow swapping
  - Owner: Tech Lead
  - Effort: 3 hours
  - Acceptance: ADR document approved; team agrees on phasing

- **TK-02.2.2** — Implementar camada de leitura/escrita
  - Deliverable: Data access layer (DAO/repository pattern) for backend and frontend
  - Backend:
    - `createEvent(event: Event): Event`
    - `getEventById(id: UUID): Event`
    - `getEventsByDate(date: string, babyId: UUID): Event[]`
    - `updateEvent(id: UUID, updates: Partial<Event>): Event`
    - `deleteEvent(id: UUID): void`
    - `getEventsByFilter(type, caregiver, dateRange): Event[]`
  - Frontend:
    - LocalStorage wrapper with JSON serialization/deserialization
    - IndexedDB adapter (for future use)
  - Owner: Full Stack Engineer
  - Effort: 8 hours
  - Acceptance: All CRUD operations work; error handling for storage quota; tests pass

- **TK-02.2.3** — Implementar seed data para demo
  - Deliverable: Sample event data for testing and demo purposes
  - Data: 10-15 events covering all tracker types, distributed across past 3 days
  - Owner: Backend Engineer
  - Effort: 3 hours
  - Acceptance: Seed loads on app first run; demo is visually complete and realistic

- **TK-02.2.4** — Implementar versionamento simples de dados
  - Deliverable: Schema version in local storage; migration strategy if schema changes
  - Owner: Backend Engineer
  - Effort: 4 hours
  - Acceptance: Data format version tracked; migrations run automatically on app update; backwards compatibility maintained

---

### FE-02.3 — Quick Log Engine (P0, depends on FE-02.1 + FE-02.2)
**Objective:** Fast, responsive event creation and UI updates after logging.

#### User Stories
- **US-02.3.1** — Como cuidador, eu quero registrar qualquer evento em poucos toques.
  - Acceptance Criteria:
    - Quick log action completes in < 500ms
    - UI feedback is immediate (spinner, success toast)
    - Validation errors are shown clearly and don't break the flow
    - User can log an event in <= 3 taps (preset quick log)

- **US-02.3.2** — Como sistema, eu quero atualizar home e timeline imediatamente após um novo log.
  - Acceptance Criteria:
    - Home dashboard updates instantly (no refresh needed)
    - Timeline reflects new event without reload
    - Cards (feeding, sleep, etc.) update immediately
    - State management ensures consistency across tabs

#### Tasks
- **TK-02.3.1** — Criar dispatcher genérico de logs
  - Deliverable: Event dispatcher function (backend endpoint + frontend service)
  - Backend: `/api/events` POST endpoint with validation and persistence
  - Frontend: `logEvent(tracker, subtype, quantity?, notes?)` service function
  - Owner: Backend Engineer + Frontend Engineer
  - Effort: 6 hours
  - Acceptance: Event creates successfully; validation catches invalid data; error messages are user-friendly

- **TK-02.3.2** — Atualizar timeline após insert
  - Deliverable: Timeline component automatically re-renders with new event
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Timeline updates without full page reload; new event appears at top; sorting is correct

- **TK-02.3.3** — Atualizar cards-resumo após insert
  - Deliverable: Home tracker cards (feeding, sleep, diaper, activity) update their summary metrics
  - Owner: Frontend Engineer
  - Effort: 5 hours
  - Acceptance: Each card updates its "last" and "today total" metrics; no visual glitch or flash

- **TK-02.3.4** — Implementar presets rápidos
  - Deliverable: Preset templates for common quick logs (e.g., "bottle 100ml", "nap started", "wet diaper")
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Presets appear in quick log UI; selecting a preset requires only 1-2 more taps; can override quantity/time

- **TK-02.3.5** — Implementar botão "log manual"
  - Deliverable: Secondary flow for custom/detailed logging (not preset)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Manual log button visible; opens detailed form; saves correctly with all optional fields

---

## Data Model Detail

### Event Base Schema (TypeScript)
```typescript
interface Event {
  id: string; // UUID
  babyId: string; // UUID
  type: 'feeding' | 'sleep' | 'diaper' | 'activity' | 'health'; // enum
  subtype: string; // e.g., 'bottle', 'nap', 'wet', 'tummy-time'
  timestamp: string; // ISO 8601
  caregiver: string; // Caregiver name
  quantity?: number; // e.g., 100 ml, 30 minutes
  unit?: string; // 'ml' | 'minutes' | 'count'
  notes?: string; // Optional observation
  metadata?: Record<string, any>; // Type-specific fields
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  isArchived: boolean; // Soft delete flag
}

interface Baby {
  id: string; // UUID
  name: string;
  dateOfBirth: string; // ISO 8601
  caregivers: string[]; // Caregiver names
  activeTrackers: string[]; // Enabled tracker types
}

interface Caregiver {
  id: string; // UUID
  name: string;
  role: 'parent' | 'nanny' | 'grandparent' | 'other';
  color: string; // Hex color for UI
  avatar?: string; // Emoji or image URL
}
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Event Schema Complete:** Defined, documented, and stakeholder-approved
2. **Persistence Working:** Events save and load correctly; no data loss
3. **CRUD Operations:** All operations tested and working
4. **Quick Log Fast:** < 500ms roundtrip; instant UI feedback
5. **State Sync:** Home, timeline, and cards all update together
6. **Seed Data Ready:** Demo app launches with realistic sample data
7. **Error Handling:** Validation errors shown gracefully; no silent failures

### QA Checklist
- [ ] Create event via API → stored and retrievable
- [ ] Update event → changes reflected in timeline
- [ ] Delete event (soft delete) → not visible in timeline
- [ ] Query events by date → correct results
- [ ] Query events by type → correct results
- [ ] Query events by caregiver → correct results
- [ ] Events sorted correctly (newest first default)
- [ ] Timezone handling correct (timestamps)
- [ ] localStorage persists across refresh
- [ ] Seed data loads on first run
- [ ] Quick presets work (1-2 taps)
- [ ] Manual logging form validates input
- [ ] Home and timeline update after new log (instant)

---

## Testing Strategy

### Unit Testing
- Event model validation
- Sorting and filtering logic
- Data serialization/deserialization
- Utility functions (date formatting, aggregation)

### Integration Testing
- Create event → stored → retrieved → timeline updates
- Update event → all views reflect change
- Delete event → soft delete works correctly
- Persistence layer (localStorage → backend sync)

### E2E Testing
- User logs feeding → home card updates → timeline shows event
- User logs sleep → awake window resets
- Multiple logs in quick succession → all save correctly

### Performance Testing
- Log creation latency (target < 500ms)
- Timeline render with 30+ events (target < 2s)
- Storage quota limits (plan for > 1000 events)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Event create latency | < 500ms | Network tab / performance monitoring |
| Data persistence | 100% | No data loss across refresh/restart |
| Timeline render (30+ events) | < 2s | Lighthouse / performance profiling |
| Schema coverage | 100% | Code review; all tracker types mapped |
| Test coverage | > 80% | Jest/Pytest coverage report |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Schema changes late | Expensive migrations | Medium | Lock schema early; get stakeholder buy-in; use versioning |
| Storage quota exceeded | Lost data | Low | Monitor quota; implement cleanup; warn users |
| Timezone bugs | Wrong time on logs | Medium | Use UTC internally; test with multiple timezones early |
| Performance degrade with scale | Slow app | Medium | Optimize queries; add indices; lazy-load timeline |
| Data corruption | Data loss | Low | Validation on insert; backups; soft deletes |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Event schema approved | Day 2 | Pending |
| Data layer implemented | Day 5 | Pending |
| Quick log engine working | Day 8 | Pending |
| Tests and seed data ready | Day 10 | Pending |
| QA sign-off | Day 12 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Event schema document (TypeScript interfaces, JSON Schema)
2. ✓ Database migrations (if using SQL)
3. ✓ Backend API endpoints (`POST /events`, `GET /events`, `PUT /events/{id}`, `DELETE /events/{id}`)
4. ✓ Frontend data service (event dispatcher, CRUD wrappers)
5. ✓ Persistence layer (localStorage adapter, future: IndexedDB, backend)
6. ✓ Utility functions (sorting, filtering, aggregation)
7. ✓ Seed data (JSON or SQL insert scripts)
8. ✓ Unit tests (> 80% coverage)
9. ✓ Integration tests (CRUD + state sync)
10. ✓ API documentation (OpenAPI/Swagger)
11. ✓ Data model diagram (ER diagram)

---

## Related Documents
- PRODUCT_SPEC.md: Core Trackers, Data Model Overview
- EP-01: Design System (shell for data display)
- EP-03: Home "Hoje" (uses this epic's event model)
- EP-04 to EP-06: Tracker features (depend on this epic)

