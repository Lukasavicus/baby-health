# EP-01 — Fundação do Produto

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-01 |
| **Title** | Fundação do produto |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Design + Frontend Lead |
| **Milestone** | MVP Foundation (Week 1-2) |

## Objective
Criar a base visual e estrutural do app no estilo "Samsung Health para bebês". Estabelecer design system, padrão visual coerente e shell de navegação que servirá como fundação para todas as outras features.

---

## Epic Scope

### What This Epic Covers
- Information architecture and navigation taxonomy
- Complete design system (colors, typography, spacing, components)
- App shell with bottom navigation, headers, and floating action button
- Basic layout patterns (home, detail, bottom sheet)
- Mobile-first responsive framework

### What This Epic Does NOT Cover
- Content or data on any specific tracker
- User flows beyond basic navigation
- Backend API structure (handled in EP-02)
- Performance optimization (handled later)

---

## Dependencies

### Upstream Dependencies
- **None** — This is the foundational epic

### Blocking
- **Blocks:** EP-02, EP-03, EP-04, EP-05, EP-06, EP-07, EP-08, EP-09, EP-10, EP-11
- **Critical:** No other work can proceed without the design system and shell being established

---

## Features & Work Breakdown

### FE-01.1 — Arquitetura de Informação (P0)
**Objective:** Define clear navigation structure and IA for quick access to main app areas.

#### User Stories
- **US-01.1.1** — Como cuidador, eu quero uma navegação clara para acessar rapidamente as áreas principais do app.
  - Acceptance Criteria:
    - 4 main tabs visible at all times in bottom navigation
    - Tab names are concise (1-2 words max)
    - Current tab is highlighted/marked
    - Tab names use Portuguese (Brazil) terms familiar to caregivers
    - Navigation responds instantly (< 100ms)

- **US-01.1.2** — Como cuidador, eu quero nomes de abas coerentes com o universo do bebê.
  - Acceptance Criteria:
    - Tab names reflect baby/family context (not generic app names)
    - Names are warm and approachable
    - Naming aligns with Samsung Health metaphor adapted for babies
    - Stakeholder review confirms names resonate with target users

#### Tasks
- **TK-01.1.1** — Definir mapa final de navegação: Hoje, Cuidadores, Rotinas, Meu bebê
  - Deliverable: IA diagram with 4 main tabs, supporting screens, and hierarchy
  - Owner: UX/Product
  - Effort: 4 hours
  - Acceptance: Diagram approved by product + eng lead

- **TK-01.1.2** — Definir ação global "Registrar"
  - Deliverable: Spec for floating action button (placement, behavior, transitions)
  - Owner: UX Lead
  - Effort: 3 hours
  - Acceptance: Design review passed, technical feasibility confirmed

- **TK-01.1.3** — Definir hierarquia Home → detalhe → bottom sheet
  - Deliverable: Navigation flow document with state diagrams
  - Owner: UX/Frontend Lead
  - Effort: 5 hours
  - Acceptance: All edge cases (deep links, back button, modal dismissal) defined

- **TK-01.1.4** — Definir navegação mobile-first
  - Deliverable: Responsive nav patterns (mobile, tablet, potential desktop)
  - Owner: Frontend Lead
  - Effort: 4 hours
  - Acceptance: Patterns verified on 320px, 768px, and 1024px viewports

---

### FE-01.2 — Design System Visual (P0)
**Objective:** Establish complete, cohesive visual language inspired by Samsung Health but baby-focused.

#### User Stories
- **US-01.2.1** — Como cuidador, eu quero uma interface bonita e suave para usar várias vezes ao dia sem fadiga.
  - Acceptance Criteria:
    - Interface uses soft colors (pastel palette) with high contrast for readability
    - Typography is large and legible (min 14px body text)
    - Spacing is generous and breathing room evident
    - No harsh edges or aggressive visual elements
    - Micro-interactions are smooth (200-300ms easing)

- **US-01.2.2** — Como usuário, eu quero perceber inspiração no Samsung Health, mas com identidade baby-friendly.
  - Acceptance Criteria:
    - Visual style clearly inspired by Samsung Health (card layout, metric focus, bottom nav)
    - Color palette shifted to warm pastels (no cool grays)
    - Icons feature baby/family themes
    - Typography uses friendly, rounded fonts
    - Overall feel is approachable and warm, not clinical

#### Tasks
- **TK-01.2.1** — Definir paleta pastel clara
  - Deliverable: Color palette with primary, secondary, accent, and semantic colors (success, error, warning)
  - Colors: Peach (#FFD7BE), Mint (#C8E6E1), Lavender (#E8D5F2), Butter (#FFF9E6), Sky (#D4E8F7)
  - Owner: Designer
  - Effort: 6 hours
  - Acceptance: Palette passes WCAG AA contrast checks; designer + product sign-off

- **TK-01.2.2** — Definir tipografia, escala, espaçamento e bordas
  - Deliverable: Design tokens file with font families, sizes, weights, line heights, spacing scale, border radius
  - Recommended: Poppins (headings), Inter (body), 8px spacing grid, 8px-32px scale
  - Owner: Designer
  - Effort: 5 hours
  - Acceptance: Tokens file exported to Figma + frontend ready; all sizes tested for readability

- **TK-01.2.3** — Definir linguagem de ícones baby-friendly
  - Deliverable: Icon library (60-80 icons) for all core actions, states, and categories
  - Themes: Feeding bottle, breastfeeding, sleep, diaper, activity, heart, checkmark, etc.
  - Owner: Illustrator/Designer
  - Effort: 16 hours
  - Acceptance: Icon set approved; exported as SVG or icon font; guidelines documented

- **TK-01.2.4** — Criar padrões de cards, chips, badges, botões e bottom sheets
  - Deliverable: Component patterns guide with 5+ card types, interactive states, spacing examples
  - Components:
    - Cards (hero, metric, list, content card)
    - Chips (filter, input chip)
    - Badges (status, label)
    - Buttons (primary, secondary, tertiary, small, large)
    - Bottom sheets (full screen, half screen modal behavior)
  - Owner: Designer
  - Effort: 12 hours
  - Acceptance: All components in Figma; interactive states shown; frontend dev can build from guide

- **TK-01.2.5** — Definir estados visuais: normal, vazio, loading, erro
  - Deliverable: Visual guidelines for empty states, loading spinners, error messages, success toasts
  - Owner: Designer
  - Effort: 6 hours
  - Acceptance: Each state has visual mockup; error messages are friendly (no technical jargon)

---

### FE-01.3 — Shell do Aplicativo (P0, depends on FE-01.1 + FE-01.2)
**Objective:** Build core app structure that all other features will plug into.

#### User Stories
- **US-01.3.1** — Como cuidador, eu quero que o app abra com estrutura pronta para navegação imediata.
  - Acceptance Criteria:
    - App loads with visible bottom navigation bar
    - All 4 tabs are accessible and visible
    - Current tab content loads (or shows placeholder while loading)
    - No 404s or broken navigation states
    - First meaningful paint < 1s on 4G

#### Tasks
- **TK-01.3.1** — Implementar layout base mobile-first
  - Deliverable: HTML/CSS foundation with mobile viewport rules, responsive grid
  - Owner: Frontend Engineer
  - Effort: 6 hours
  - Acceptance: Layout renders correctly on 320px, 375px, and 768px; no overflow; accessible

- **TK-01.3.2** — Implementar bottom navigation
  - Deliverable: Working bottom nav component with 4 tabs, active state styling, click handlers
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Tabs route correctly; active tab visually distinct; touch targets 48x48px+

- **TK-01.3.3** — Implementar header global por tela
  - Deliverable: Header component that updates title/actions based on current screen
  - Owner: Frontend Engineer
  - Effort: 4 hours
  - Acceptance: Header displays contextual title; back button where needed; consistent height

- **TK-01.3.4** — Implementar floating action "Registrar"
  - Deliverable: FAB component with fixed positioning, accessible, always visible
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: FAB appears on all screens; click opens bottom sheet; z-index correct

- **TK-01.3.5** — Implementar transições básicas entre telas
  - Deliverable: Page transitions (fade, slide) between tabs and modal opens/closes
  - Owner: Frontend Engineer
  - Effort: 5 hours
  - Acceptance: Transitions are smooth (60fps); no jank; accessibility maintained

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **IA Complete:** Navigation map approved; 4 tabs defined; FAB behavior documented
2. **Design System Delivered:** Figma file with all tokens, components, and patterns; exported for dev
3. **Shell Functional:** App loads, all tabs navigate, FAB opens, transitions work smoothly
4. **Visual Cohesion:** Design review confirms Samsung Health inspiration + baby-friendly identity
5. **Accessibility:** All components tested for color contrast, keyboard nav, screen readers
6. **Performance:** FCP < 1s; TTI < 2s on 3G; smooth 60fps interactions

### QA Checklist
- [ ] Bottom nav visible on all pages
- [ ] All 4 tabs are clickable and route correctly
- [ ] FAB is always visible and accessible
- [ ] Back button works correctly (where applicable)
- [ ] Header updates contextually
- [ ] Transitions are smooth and don't break on slow devices
- [ ] No layout shift (CLS < 0.1)
- [ ] Colors meet WCAG AA contrast
- [ ] Touch targets are 48x48px minimum
- [ ] App works on Safari, Chrome, and Firefox on iOS/Android

---

## Testing Strategy

### Unit Testing
- Navigation state management
- Component rendering with different props
- Icon and color token access

### Integration Testing
- Tab switching and state persistence
- FAB triggers bottom sheet correctly
- Header updates on route change

### E2E Testing
- App loads → all tabs visible → tabs navigate → FAB opens → transitions smooth

### Visual Regression
- Screenshot comparison of all major components
- Cross-browser verification (Safari, Chrome)
- Contrast and accessibility scanning

### User Testing
- 3-5 target users test navigation and basic flow
- Feedback on naming (tab names, button labels)
- Preference testing (visual style feedback)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Page load time (FCP) | < 1s | Lighthouse / WebPageTest |
| Navigation responsiveness | < 100ms | Interaction latency testing |
| Visual consistency | 100% | Design review + automated screenshot comparison |
| Accessibility score | A+ (WCAG AA) | axe DevTools, manual testing |
| User satisfaction (design) | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Design delays | Blocks all features | Medium | Start design in parallel; use UI kit template |
| Color accessibility fail | Rejects design | Low | Use contrast checker from start; test with colorblind simulator |
| Performance baseline poor | Future optimization harder | Medium | Benchmark on low-end devices early; optimize assets |
| Icon library too large | Slow load | Low | Use SVG sprites or icon font; lazy load if needed |
| Navigation scope creep | Timeline slip | Medium | Strict cut-off: 4 tabs only; defer future nav patterns |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| IA finalized | Day 2 | Pending |
| Design system in Figma | Day 4 | Pending |
| Icon library complete | Day 6 | Pending |
| Shell MVP built | Day 10 | Pending |
| Design + QA sign-off | Day 12 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Information Architecture diagram (Figma / Miro)
2. ✓ Design system Figma file (tokens, colors, typography, components)
3. ✓ Icon library (SVG files + sprite sheet)
4. ✓ Component patterns guide (PDF or Figma pages)
5. ✓ Working app shell (React components, responsive, accessible)
6. ✓ Design handoff documentation (component specs, sizing, interactions)
7. ✓ Accessibility audit report (WCAG AA check)
8. ✓ Performance baseline (Lighthouse report)

---

## Related Documents
- PRODUCT_SPEC.md: Design Philosophy, Visual Identity, Platform details
- EP-02: Data Model (depends on this epic's completion)
- EP-03: Home "Hoje" (uses FE-01.3 shell)

