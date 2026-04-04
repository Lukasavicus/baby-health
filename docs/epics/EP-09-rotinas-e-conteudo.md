# EP-09 — Rotinas e Conteúdo

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-09 |
| **Title** | Rotinas e conteúdo |
| **Priority** | P1 (High) |
| **Status** | Not Started |
| **Owner** | Content Lead + Frontend Lead |
| **Milestone** | Post-MVP Refinement (Week 7-8) |

## Objective
Adaptar a lógica de "Boa forma" do Samsung Health para desenvolvimento e cuidado do bebê. Criar biblioteca de conteúdo educativo, rotinas guiadas (tummy time, leitura, sono) e links para recursos externos confiáveis. Transformar "Rotinas" em centro de conhecimento e apoio para cuidadores.

---

## Epic Scope

### What This Epic Covers
- Rotinas tab (dedicated screen on bottom nav)
- Content library with carousels and cards (Samsung Health style)
- Guided routines with step-by-step instructions
- Age-appropriate content recommendations
- External links to trusted resources (blog posts, PDFs, videos)
- Bookmarking or favoriting content (optional, future)
- Offline-available content (core articles cached)

### What This Epic Does NOT Cover
- Real-time content syncing from backend
- Personalized recommendations via ML
- Video embedding or streaming
- User-generated content or community
- Paid content or paywalls
- Notifications about new content

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (card layouts, carousels)
- **EP-02:** Data model (content entities, if stored locally)

### Blocking
- **Blocks:** Future wellness and coaching features

---

## Features & Work Breakdown

### FE-09.1 — Biblioteca de Conteúdo (P1)
**Objective:** Curated content library organized by theme and age.

#### User Stories
- **US-09.1.1** — Como cuidador, eu quero acessar conteúdo útil sem sair do app.
  - Acceptance Criteria:
    - Rotinas tab accessible from bottom navigation
    - Content organized by category (e.g., "Sleep & Naps", "Feeding", "Development", "Health")
    - Each category is a carousel or scrollable section
    - Articles/tips displayed as large cards (Samsung Health style)
    - Card shows title, summary, and read time
    - Tap card → full article view
    - Offline access for core content (cached)

#### Tasks
- **TK-09.1.1** — Criar tela Rotinas
  - Deliverable: Rotinas tab and screen layout
  - Layout:
    1. Header: "Rotinas" with optional search (future)
    2. Hero section: Featured content or promo
    3. Carousels: 3-4 categories (Sleep, Feeding, Development, Health)
    4. Each carousel: Horizontal scrollable cards
    5. Footer: "More resources" link
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Screen renders; tab accessible from nav; responsive layout

- **TK-09.1.2** — Criar carrosséis de conteúdo
  - Deliverable: Reusable carousel component for content sections
  - Features:
    - Horizontal scrolling
    - Snapping behavior (card-aligned)
    - Dot indicators for position
    - Next/prev buttons (optional)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Carousel scrolls smoothly; cards snap correctly; responsive on mobile

- **TK-09.1.3** — Criar cards grandes estilo Samsung
  - Deliverable: Large content card component
  - Card content:
    - Title (1 line)
    - Summary/excerpt (2-3 lines)
    - Image or icon (background or side)
    - Read time or tag
    - Optional: "Saved" indicator
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Cards render correctly; text readable; images load; layout consistent

- **TK-09.1.4** — Organizar conteúdo por tema e idade
  - Deliverable: Content taxonomy and initial article library
  - Categories:
    - Sleep & Naps (nap schedules, sleep hygiene, teething and sleep)
    - Feeding (bottle feeding, breastfeeding, introducing solids, allergies)
    - Development (milestones, tummy time benefits, play)
    - Health & Safety (immunizations, first aid, temperature, common concerns)
    - Parent Care (postpartum recovery, self-care for caregivers)
  - Age groups: 0-3m, 3-6m, 6-12m, 12-24m, 24-36m
  - Content: 20-30 articles initially (expandable)
  - Owner: Content Lead
  - Effort: 8 hours
  - Acceptance: Content curated and organized; articles written or sourced; images included

---

### FE-09.2 — Rotinas Guiadas (P1, depends on FE-09.1)
**Objective:** Step-by-step guided routines for common activities.

#### User Stories
- **US-09.2.1** — Como cuidador, eu quero seguir rotinas guiadas de tummy time, leitura e sono.
  - Acceptance Criteria:
    - Guided routine appears as special card or modal
    - Steps displayed one at a time (swipe or next button)
    - Each step has title, description, and optional timer/checklist
    - Can pause, resume, or restart routine
    - Logs activity automatically or prompts to log

#### Tasks
- **TK-09.2.1** — Definir modelo de rotina guiada
  - Deliverable: Guided routine data model and structure
  - Model:
    ```typescript
    {
      id: string,
      name: string, // "Bedtime Routine", "Tummy Time Session"
      description: string,
      duration: number, // estimated minutes
      steps: [
        {
          id: number,
          title: string,
          description: string,
          duration?: number,
          hasTimer: boolean,
          hasChecklist: boolean,
          tips?: string
        }
      ],
      activityType?: string, // for auto-logging
      ageRange: [min, max] // months
    }
    ```
  - Owner: Product Lead
  - Effort: 2 hours

- **TK-09.2.2** — Criar rotina de tummy time
  - Deliverable: Step-by-step tummy time routine (3-5 steps)
  - Example steps:
    1. "Pick a safe surface" (description + tips)
    2. "Start with 2-3 minutes" (with timer)
    3. "Make it fun" (description + suggestions)
    4. "Check for fatigue" (checklist or description)
  - Owner: Content Lead
  - Effort: 3 hours

- **TK-09.2.3** — Criar rotina de leitura
  - Deliverable: Step-by-step reading routine
  - Example steps:
    1. "Choose a quiet time" (description)
    2. "Pick an engaging book" (tips)
    3. "Sit comfortably with baby" (description + image)
    4. "Read expressively" (tips)
    5. "Let baby explore the book" (description)
  - Owner: Content Lead
  - Effort: 3 hours

- **TK-09.2.4** — Criar rotina pré-sono
  - Deliverable: Step-by-step pre-sleep routine (wind-down)
  - Example steps:
    1. "Dim the lights" (description)
    2. "Lower the temperature" (tips)
    3. "Soft sounds or music" (suggestions)
    4. "Calm activities" (checklist: bath, massage, story)
    5. "Signs of sleepiness" (description of tired cues)
  - Owner: Content Lead
  - Effort: 3 hours

- **TK-09.2.5** — Exibir passo a passo
  - Deliverable: Step-by-step UI component
  - Features:
    - One step visible at a time
    - Next/Prev buttons
    - Progress indicator (e.g., "Step 2 of 5")
    - Optional timer (start/pause/stop)
    - Optional checklist (tap to mark complete)
    - Option to log activity at end
  - Owner: Frontend Engineer
  - Effort: 5 hours
  - Acceptance: Steps display correctly; navigation works; timer and checklist functional; activity logging works

---

### FE-09.3 — Curadoria Externa (P2, depends on FE-09.1)
**Objective:** (Future/optional) Links to trusted external resources.

#### User Stories
- **US-09.3.1** — Como cuidador, eu quero acessar conteúdos externos confiáveis.
  - Acceptance Criteria:
    - External links section in Rotinas tab
    - Links curated from trusted sources (pediatrician orgs, parenting sites)
    - Tap link → opens in browser with app exit warning
    - Links organized by category
    - Optional: saved/favorited links

#### Tasks
- **TK-09.3.1** — Definir fontes externas
  - Deliverable: List of trusted external sources
  - Sources (example):
    - American Academy of Pediatrics (AAP)
    - La Leche League (breastfeeding)
    - Zero to Three (child development)
    - Local pediatrician organizations
  - Owner: Content Lead
  - Effort: 2 hours
  - Acceptance: Sources vetted and approved

- **TK-09.3.2** — Criar estrutura de links externos
  - Deliverable: External links section in Rotinas tab
  - Display: List or grid of link cards with source logo, title, and category
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Links render correctly; organized by category

- **TK-09.3.3** — Definir aviso de saída do app
  - Deliverable: Confirmation dialog or warning when exiting app
  - Message: "This link will take you outside BabyHealth. Are you sure you want to continue?"
  - Owner: Frontend Engineer
  - Effort: 1 hour
  - Acceptance: Warning appears; user can confirm or cancel

---

## Content Library Structure

### Initial Content (20-30 articles)

**Sleep & Naps (5 articles)**
- "Understanding Baby Sleep Cycles" (0-3m focus)
- "Creating a Nap Schedule" (3-12m)
- "Signs Your Baby Is Sleepy" (0-36m)
- "Safe Sleep Practices" (0-36m)
- "Teething and Sleep" (6-36m)

**Feeding (5 articles)**
- "Bottle Feeding Basics" (0-12m)
- "Breastfeeding 101" (0-12m)
- "Introducing Solids" (6-12m)
- "Common Food Allergies" (6-36m)
- "Hydration for Babies" (0-36m)

**Development (5 articles)**
- "Tummy Time Benefits" (0-12m)
- "Developmental Milestones 0-6 Months" (0-6m)
- "Play Ideas by Age" (3-36m)
- "Language Development" (6-36m)
- "Fine Motor Skills" (9-36m)

**Health & Safety (5 articles)**
- "Baby Immunization Schedule" (0-36m)
- "Recognizing Fever" (0-36m)
- "Common Newborn Concerns" (0-3m)
- "Baby First Aid Essentials" (0-36m)
- "Safe Sleep Environment" (0-36m)

**Parent Care (3-5 articles)**
- "Postpartum Recovery" (0-3m)
- "Managing Parental Stress" (0-36m)
- "Caregiver Self-Care" (0-36m)

---

## Rotinas Tab Layout (Wireframe)

```
┌─────────────────────────────┐
│  Rotinas               🔍   │  (Header with search icon)
├─────────────────────────────┤
│                             │
│ [FEATURED]                  │
│ ┌─────────────────────────┐ │
│ │  Today's Tip            │ │
│ │ "Baby Awake 2h—         │ │
│ │  Nap time coming soon!" │ │
│ │                    [👉]  │ │
│ └─────────────────────────┘ │
│                             │
│ SLEEP & NAPS                │
│ ←─────────────────────────→ │
│   [Card1]  [Card2]  [Card3] │
│   "Sleep   "Nap     "Tired  │
│    Cycles" Schedule" Cues"  │
│                             │
│ FEEDING                     │
│ ←─────────────────────────→ │
│   [Card1]  [Card2]  [Card3] │
│   "Bottle  "Breast  "Intro  │
│    Feeding" Feeding" Solids"│
│                             │
│ GUIDED ROUTINES             │
│ ┌─────────────────────────┐ │
│ │ 🏃 Tummy Time Session   │ │
│ │    5 steps, 15 minutes  │ │
│ │              [START]    │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 📖 Bedtime Routine      │ │
│ │    4 steps, 20 minutes  │ │
│ │              [START]    │ │
│ └─────────────────────────┘ │
│                             │
│ [More resources]            │
│ [View all articles] [Links] │
└─────────────────────────────┘
     🏠  👥  📋  👶     (Bottom nav)
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance (P1)
1. **Content Library:** 20+ articles organized by category and age
2. **Rotinas Tab:** Accessible from nav; content displayed in carousels and cards
3. **Guided Routines:** 3 routines (tummy time, reading, bedtime) with 3-5 steps each
4. **Step-by-Step UI:** Steps display one at a time; timer and checklist functional; activity logging works
5. **Offline Content:** Core articles cached for offline access
6. **Responsive:** Works on mobile and tablet

### Feature-Level Acceptance (P2 - External Links)
7. **External Links:** Links to trusted sources with category organization
8. **Exit Warning:** Confirmation dialog before leaving app

### QA Checklist
- [ ] Rotinas tab accessible from bottom nav
- [ ] Content organized by category
- [ ] Carousels scroll smoothly
- [ ] Cards render correctly (title, summary, read time)
- [ ] Tap card → full article view (scrollable)
- [ ] Offline content available (core articles cached)
- [ ] Guided routine cards visible on Rotinas tab
- [ ] Tap routine → step-by-step modal/view opens
- [ ] Steps display one at a time
- [ ] Next/Prev buttons work correctly
- [ ] Progress indicator shows position
- [ ] Timer works (start, pause, stop)
- [ ] Checklist functional (tap to mark complete)
- [ ] End of routine → option to log activity
- [ ] External links section present (P2)
- [ ] Links open in browser with warning (P2)
- [ ] Responsive on mobile (320px) and tablet (768px)

---

## Testing Strategy

### Unit Testing
- Content organization and filtering by age/category
- Timer and checklist state management

### Integration Testing
- Load Rotinas tab → carousels display → tap card → full article loads
- Load guided routine → complete all steps → prompt to log activity
- Navigate away from routine → state persists if resumed

### E2E Testing
- Full flow: Rotinas tab → select routine → complete steps → log activity → timeline updated

### Content Testing
- Verify all 20+ articles present and readable
- Check images load correctly
- Verify read time calculations
- Test offline access (articles load without network)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Content library completeness | 20+ articles | Content count audit |
| Carousel performance | Smooth 60fps | Performance profiling |
| Routine completion rate | > 60% (among users who start) | Analytics (future) |
| User satisfaction (content) | > 4/5 | User testing feedback |
| Offline content availability | 100% | Test without network |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Content outdated or inaccurate | Loss of trust; misinformation | Medium | Content review by pediatrician; update schedule |
| Carousel performance poor | Janky UX | Low | Optimize images; use virtualization if needed; test on low-end devices |
| Users don't discover Rotinas tab | Low engagement | Medium | Promote via home hero card; in-app onboarding tip |
| External links break | Broken user experience | Low | Regularly check links (automated or manual); use archive links as backup |
| Content too dense or inaccessible | Abandonment | Medium | User testing on readability; plain language; short articles + links to more |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Content library curated and organized | Day 3 | Pending |
| Rotinas tab and carousels built | Day 5 | Pending |
| Content cards and full article view done | Day 6 | Pending |
| Offline content caching working | Day 7 | Pending |
| Guided routine framework and UI done | Day 7 | Pending |
| 3 guided routines (tummy time, reading, bedtime) done | Day 9 | Pending |
| (Optional P2) External links and warning | Day 10 | Pending |
| QA and testing | Day 12 | Pending |

**Total Duration:** 12 business days (longer due to content creation)

---

## Deliverables

1. ✓ Content library (20+ articles with images and metadata)
2. ✓ Content taxonomy and organization structure
3. ✓ Rotinas tab screen and layout
4. ✓ Carousel component (reusable)
5. ✓ Content card component
6. ✓ Full article view/modal
7. ✓ Offline content caching (service worker)
8. ✓ Guided routine data model
9. ✓ Step-by-step UI component
10. ✓ Timer component (reusable)
11. ✓ Checklist component
12. ✓ Activity logging integration (from guided routine)
13. ✓ 3 guided routine definitions (tummy time, reading, bedtime)
14. ✓ (Optional P2) External links section
15. ✓ (Optional P2) Exit warning dialog
16. ✓ Unit tests for content filtering and state
17. ✓ Integration tests for full content flow
18. ✓ E2E tests for guided routines
19. ✓ Offline content testing report

---

## Related Documents
- PRODUCT_SPEC.md: Design Philosophy, Future Opportunities
- EP-01: Design system (carousels, cards)
- EP-02: Data model (content entities)
- EP-09: This epic
- Future: EP-09 extensions (bookmarking, personalization, video embedding)

