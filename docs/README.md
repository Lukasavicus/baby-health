# BabyHealth Documentation

Welcome to the complete documentation for **BabyHealth**, a Samsung Health-inspired baby tracking app for caregivers of infants and toddlers (0-3 years).

## Contents

### Core Documents

#### [PRODUCT_SPEC.md](./PRODUCT_SPEC.md)
The complete product specification covering:
- **Vision:** Samsung Health for babies (0-3 years)
- **Target users:** Multiple caregivers (parents, nannies, grandparents)
- **Platform:** Web mobile-first PWA with Python API backend
- **4 main tabs:** Hoje (Today), Cuidadores (Caregivers), Rotinas (Routines), Meu Bebê (My Baby)
- **6 core trackers:** Alimentação (Feeding), Hidratação (Hydration), Sono (Sleep), Tempo Acordado (Awake Window), Fraldas (Diapers), Atividades (Activities)
- **Tech stack:** Python API with swappable persistence (JSON→SQLite→DB), React/Next.js frontend, GCP deployment
- **Design:** Light mode pastel colors, Samsung Health-inspired UI, baby-friendly aesthetic
- **MVP scope:** No complex auth, quick logging, shared visibility, beautiful insights

#### [BACKLOG.md](./BACKLOG.md)
Prioritized product backlog and release plan:
- **Release strategy:** MVP (Weeks 1-7), Phase 2 (Weeks 8-10), Phase 3 (future)
- **MVP timeline:** ~50 business days (10 weeks)
- **Sprint planning:** 2-week sprints with clear milestones
- **Dependencies:** Critical path analysis, epic blockers
- **Risk mitigation:** Known risks and mitigation strategies
- **Success metrics:** MVP, Phase 2, and Phase 3 success criteria
- **Go-to-market:** Closed beta → soft launch → public launch

---

## Epics (11 Total)

### Foundation & Core (P0 — MVP)

#### [EP-01: Fundação do Produto](./epics/EP-01-fundacao-do-produto.md) — Weeks 1-2
**Design system, IA, and app shell.**

Build the visual foundation and structural framework:
- Information architecture (4-tab navigation + FAB)
- Design system (pastel colors, typography, components)
- App shell (bottom nav, headers, floating action button)
- Mobile-first responsive layout
- Accessibility (WCAG AA)

**Duration:** 10 business days
**Blocks:** Everything else

---

#### [EP-02: Modelo de Dados e Motor de Logs](./epics/EP-02-modelo-de-dados-e-motor-de-logs.md) — Weeks 2-3
**Event entity, persistence layer, quick log engine.**

Create the data backbone:
- Generic event schema (flexible for all tracker types)
- Persistence abstraction (JSON→SQLite→DB)
- Local storage (localStorage/IndexedDB)
- CRUD operations and filtering
- Quick log dispatcher (< 500ms)
- Seed data for demo

**Duration:** 10 business days
**Blocks:** EP-03 through EP-08

---

#### [EP-03: Home "Hoje"](./epics/EP-03-home-hoje.md) — Weeks 3-4
**Daily dashboard with hero card, 6 tracker cards, timeline, inline logging.**

Transform home into the operational center:
- Hero card with daily metrics and status badge
- 6 tracker cards (Feeding, Hydration, Sleep, Awake, Diapers, Activities)
- Chronological timeline of all day's events
- Inline quick logging from each card
- Empty states and loading states
- Real-time updates after new logs

**Duration:** 10 business days
**Dependencies:** EP-01, EP-02
**Enables:** EP-04-EP-08

---

#### [EP-04: Alimentação e Hidratação](./epics/EP-04-alimentacao-e-hidratacao.md) — Weeks 4-5
**The most important tracker: feeding (bottle, breast, solids) and hydration.**

Comprehensive feeding tracking:
- **Bottle feeding:** Type (formula, expressed milk), quantity (ml), timestamp
- **Breastfeeding:** Simple mode (1-tap) or advanced (timer, sides, pumping)
- **Solids:** Type, quantity eaten, acceptance, first exposure tracking, favorites, allergy flags
- **Hydration:** Quick presets (50-200ml), liquid types, daily total, visual progress
- Daily totals and "last logged" displays
- Composite session support (multi-side breastfeeding)

**Duration:** 10 business days
**Dependencies:** EP-02, EP-03
**Feeds into:** EP-08 (insights)

---

#### [EP-05: Sono e Tempo Acordado](./epics/EP-05-sono-e-tempo-acordado.md) — Weeks 4-5
**Sleep tracking and awake window monitoring.**

Sleep management at the core:
- Sleep start/end logging (nap vs. overnight)
- Duration calculation (handles cross-midnight sleeps)
- Real-time awake window counter (time since last sleep ended)
- Daily sleep summary (naps + overnight, breakdown, last session)
- Sleep session editing/correction
- Age-appropriate awake window targets

**Duration:** 10 business days
**Dependencies:** EP-02, EP-03
**Feeds into:** EP-08 (insights)

---

#### [EP-06: Fraldas e Atividades](./epics/EP-06-fraldas-e-atividades.md) — Week 5
**Diaper tracking and activity/development logging.**

Complete the tracker core:
- **Diapers:** Type (wet, soiled, mixed), quick presets, daily count by type, optional notes
- **Activities:** Type (tummy time, reading, play, outdoor, bath), optional duration (manual or timer), daily totals
- Activity summary card (tummy time progress, reading indicator, last activity)
- Quick logging (diaper preset < 300ms)
- Timer persistence across navigation

**Duration:** 10 business days
**Dependencies:** EP-02, EP-03
**Feeds into:** EP-08 (insights)

---

#### [EP-07: Cuidadores](./epics/EP-07-cuidadores.md) — Weeks 5-6
**Multi-caregiver support without complex auth.**

Enable family collaboration:
- Caregiver entity (name, role, color, avatar)
- First-run setup flow (create initial caregivers)
- Quick caregiver switcher (device-based, no login required)
- Event attribution (all logs tagged with caregiver)
- Shared feed in Caregivers tab (chronological, all events, all caregivers)
- Caregiver display in timeline (avatar, name, color)
- (P1) Filter by caregiver chips and timeline filtering

**Duration:** 10 business days
**Dependencies:** EP-01, EP-02, EP-03
**Feeds into:** EP-08 (insights)

---

#### [EP-08: Relatórios e Insights](./epics/EP-08-relatorios-e-insights.md) — Week 6
**Beautiful daily summaries, weekly reports, and automatic insights.**

The "insights layer" of the app:
- **Daily summary:** 3-5 KPIs (feeding, sleep, hydration, diapers, activities), contextual messaging, yesterday comparison
- **Weekly report:** 7 days of data, visual charts (bar, pie), week-over-week comparison, highlights and opportunities
- **(P1) Automatic insights:** Pattern detection (typical nap time, peak feeding hours, hydration trends)
- Status badges (On track, Watch hydration, More tummy time, Great day!)
- Warm, supportive, non-judgmental tone

**Duration:** 10 business days
**Dependencies:** EP-04, EP-05, EP-06, EP-07 (tracker data)
**Completes MVP**

---

### Post-MVP Enhancements (P1)

#### [EP-09: Rotinas e Conteúdo](./epics/EP-09-rotinas-e-conteudo.md) — Weeks 8-10
**Content library and guided routines.**

Transform Rotinas into knowledge hub:
- **Content library:** 20+ curated articles organized by category (Sleep, Feeding, Development, Health, Parent Care) and age group (0-3m, 3-6m, etc.)
- **Carousels:** Scrollable content sections with large, beautiful cards
- **Guided routines:** 3 step-by-step routines (tummy time, reading, bedtime) with timers and checklists
- **Offline access:** Core content cached for offline viewing
- **(P2) External links:** Links to trusted resources (AAP, La Leche League, Zero to Three) with exit warnings

**Duration:** 12 business days
**Dependencies:** EP-01
**Content:** Pediatrician-reviewed; warm, accessible tone

---

#### [EP-10: Meu Bebê e Crescimento](./epics/EP-10-meu-bebe-e-crescimento.md) — Week 8
**Baby profile and growth tracking.**

Centralize baby health records:
- **Baby profile:** Name, age (calculated from DOB), photo, caregivers list, active modules
- **Growth measurements:** Weight, height, head circumference logging with date picker
- **Measurement history:** Chronological list of all measurements
- **Growth charts:** Line charts showing weight, height, head circumference trends over time
- **Latest measurement:** Highlight on profile with most recent values
- **(P2) Observations:** Notes and milestones with dates

**Duration:** 8 business days
**Dependencies:** EP-01, EP-02
**Future:** Growth percentiles, WHO curves

---

#### [EP-11: Saúde, Vitaminas e Remédios](./epics/EP-11-saude-vitaminas-remedios.md) — Week 9
**Medication tracking and health event logging.**

Complete the health ecosystem:
- **Medication/supplement logging:** Name, dose, unit (mg, ml, tablet), frequency, timestamp
- **Presets:** Common vitamins (Vitamin D, iron, probiotics) for quick selection
- **Confirmation:** Checkbox to confirm administration (given vs. pending)
- **Medication history:** Chronological list with confirmation status
- **(P2) Health events:** Temperature, symptoms, consultations with dates and details
- **(P2) Health event history:** Chronological view of all health events

**Duration:** 7 business days
**Dependencies:** EP-02, EP-10
**Design philosophy:** Informational only; no medical recommendations or diagnoses

---

## Key Features at a Glance

### The 4 Main Tabs
1. **Hoje (Today):** Dashboard with hero card, 6 tracker cards, daily timeline
2. **Cuidadores (Caregivers):** Shared activity feed showing all events and caregivers
3. **Rotinas (Routines):** Content library and guided routines
4. **Meu Bebê (My Baby):** Baby profile, growth tracking, health records

### The 6 Core Trackers
1. **Alimentação (Feeding):** Bottle (formula, breast milk), breastfeeding (simple/advanced), solids, daily totals
2. **Hidratação (Hydration):** Quick water/liquid presets, daily totals, progress to target
3. **Sono (Sleep):** Naps and overnight sleep, duration, daily totals by type
4. **Tempo Acordado (Awake Window):** Real-time counter since last sleep ended
5. **Fraldas (Diapers):** Wet, soiled, mixed, daily count, quick presets
6. **Atividades (Activities):** Tummy time, reading, play, outdoor, bath; duration tracking; daily totals

### Global Actions
- **Registrar (Log):** Floating action button for quick event creation; context-aware bottom sheet
- **Caregiver selector:** Quick switcher to change current user (device-based, no login)

### Special Features
- **Multi-caregiver support:** All caregivers see shared feed; each log attributed to caregiver
- **Beautiful insights:** Daily summary, weekly reports, automatic pattern detection
- **Offline-first:** Core features work offline; data persists locally
- **Mobile-first PWA:** Responsive design (320px+), installable, works on iOS and Android
- **Samsung Health inspiration:** Card layout, metric focus, pastel aesthetics, bottom navigation

---

## Tech Stack

### Frontend
- **Framework:** React or Next.js
- **Styling:** Tailwind CSS or CSS-in-JS (emotion, styled-components)
- **State management:** Context API or Redux
- **Storage:** localStorage, IndexedDB, service workers
- **Deployment:** Vercel, Netlify, or GCP Cloud Run

### Backend
- **Language:** Python (FastAPI, Flask, or Django)
- **API:** REST (with potential for GraphQL upgrade)
- **Database (MVP): JSON files locally, upgrade to SQLite or PostgreSQL
- **ORM:** SQLAlchemy (if using SQL)
- **Deployment:** GCP App Engine or Cloud Run

### Infrastructure
- **Hosting:** Google Cloud Platform (GCP) free tier
- **Database:** Cloud SQL (PostgreSQL) or Firestore
- **Storage:** Cloud Storage (for images, exports)
- **CI/CD:** GitHub Actions
- **Monitoring:** Cloud Logging, Error Reporting

---

## Success Metrics

### MVP
- 100+ active families in closed beta
- 10+ logs per family per day (average)
- 3+ caregivers per family (household)
- 7-day retention > 85%
- NPS > 50
- App rating > 4.5 stars

### Phase 2
- 500+ active families
- Content engagement > 30%
- Growth tracking adoption > 60%
- NPS > 60

### Phase 3 & Beyond
- 2000+ active families
- Health ecosystem ready
- Pediatrician partnerships in place
- Revenue model validated

---

## File Structure

```
[DEV] BabyHealth/
├── docs/
│   ├── README.md (this file)
│   ├── PRODUCT_SPEC.md (complete product specification)
│   ├── BACKLOG.md (prioritized backlog & release plan)
│   └── epics/
│       ├── EP-01-fundacao-do-produto.md
│       ├── EP-02-modelo-de-dados-e-motor-de-logs.md
│       ├── EP-03-home-hoje.md
│       ├── EP-04-alimentacao-e-hidratacao.md
│       ├── EP-05-sono-e-tempo-acordado.md
│       ├── EP-06-fraldas-e-atividades.md
│       ├── EP-07-cuidadores.md
│       ├── EP-08-relatorios-e-insights.md
│       ├── EP-09-rotinas-e-conteudo.md
│       ├── EP-10-meu-bebe-e-crescimento.md
│       └── EP-11-saude-vitaminas-remedios.md
├── frontend/ (React/Next.js code — to be created)
├── backend/ (Python API code — to be created)
└── infrastructure/ (GCP configs, CI/CD — to be created)
```

---

## Getting Started

### For Product Managers
1. Start with **PRODUCT_SPEC.md** for overall vision and strategy
2. Review **BACKLOG.md** for timeline, sprint planning, and priorities
3. Dive into individual **epic files** for detailed feature specs

### For Developers
1. Read **PRODUCT_SPEC.md** for context and design philosophy
2. Review **EP-01** for design system and architecture
3. Review **EP-02** for data model and core entities
4. Follow epics in priority order (EP-01 through EP-08 for MVP)
5. Check BACKLOG for sprint assignments and timeline

### For Designers
1. Start with **PRODUCT_SPEC.md** Design Philosophy section
2. Review **EP-01** for complete design system spec
3. Review individual epics for feature-specific design requirements
4. Wireframes and component specs in each epic

### For QA
1. Review **PRODUCT_SPEC.md** for overall functionality
2. Review each epic's **Acceptance Criteria** and **QA Checklist** sections
3. Cross-reference with **BACKLOG.md** for sprint assignments
4. Focus on MVP epics first (EP-01 through EP-08)

---

## Document Philosophy

These documents are **living:** expect iteration as we build and learn.
- Epics are detailed with acceptance criteria, tasks, and success metrics
- Each epic includes technical specs, wireframes (ASCII), and test strategy
- Risk analysis and mitigation for each epic
- Dependencies clearly mapped to enable parallel work
- Tone is warm and family-friendly, reflecting the product's values

---

## Questions & Updates

- **Product questions:** See PRODUCT_SPEC.md overview or specific epic
- **Timeline questions:** See BACKLOG.md sprint planning
- **Technical implementation:** See epic's Tasks and Deliverables sections
- **Design specs:** See EP-01 or feature-specific epics

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-04 | Product Team | Complete MVP documentation (11 epics, 5340+ lines) |

---

**Last updated:** 2026-04-04

