# EP-08 — Relatórios e Insights

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-08 |
| **Title** | Relatórios e insights |
| **Priority** | P0/P1 (P0: daily summary; P1: weekly reports and insights) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Data Analyst |
| **Milestone** | MVP Refinement (Week 6-7) |

## Objective
Entregar a camada "bonita e insightful" no estilo Samsung Health, transformando dados brutos de logs em resumos diários e relatórios semanais com insights automáticos sobre padrões de alimentação, sono e desenvolvimento do bebê.

---

## Epic Scope

### What This Epic Covers
- Daily summary (hero card on home)
- Daily metrics aggregation (feeding count, sleep hours, hydration progress)
- Daily contextual messaging (encouraging, supportive, actionable)
- Weekly report view (scrollable, card-based)
- Weekly metrics and comparisons
- Simple pattern recognition (e.g., "typical nap time is 2-3 PM")
- Insights (P1): auto-generated alerts on sleep, hydration, feeding patterns
- Visual progress indicators (bars, circles, badges)

### What This Epic Does NOT Cover
- Machine learning or predictive analytics
- Doctor/pediatrician integrations
- Historical trend lines beyond weekly
- Customizable insights or preferences
- Push notifications for insights (future)

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (cards, charts, visualizations)
- **EP-02:** Data model (events and aggregation)
- **EP-03:** Home dashboard (daily summary)
- **EP-04 to EP-06:** Tracker features (data for insights)
- **EP-07:** Caregiver info (attribution in reports)

### Blocking
- **Blocks:** Nothing in MVP, but feeds into future health features (EP-11)

---

## Features & Work Breakdown

### FE-08.1 — Resumo Diário (P0)
**Objective:** Daily summary with key metrics and status.

#### User Stories
- **US-08.1.1** — Como cuidador, eu quero uma leitura rápida do dia do bebê.
  - Acceptance Criteria:
    - Hero card on home shows 3-5 metrics (feeding count, sleep hours, diaper count, hydration status)
    - Summary text describes the day (warm, supportive tone)
    - Status badge indicates overall health ("On track", "Watch hydration", "Great day!")
    - Comparison with yesterday visible (e.g., "4h more sleep than yesterday")
    - Updates automatically as new logs are added

#### Tasks
- **TK-08.1.1** — Definir KPIs do resumo diário
  - Deliverable: Specification of which metrics appear in daily summary
  - Suggested KPIs:
    - Feeding count (number of feedings)
    - Sleep hours (total sleep today)
    - Hydration status (ml consumed vs. target for age)
    - Diaper count (wet + soiled)
    - Activity count (number of activities logged)
  - Owner: Product + Data Lead
  - Effort: 2 hours
  - Acceptance: KPIs finalized; thresholds defined; stakeholder sign-off

- **TK-08.1.2** — Gerar indicadores agregados
  - Deliverable: Backend logic to calculate daily KPIs
  - Logic:
    - Sum all feeding ml today
    - Sum all sleep minutes today
    - Count diaper changes
    - Count activities
    - Compare with target/yesterday
  - Owner: Backend Engineer
  - Effort: 4 hours
  - Acceptance: Calculations correct; tested against manual data; timezone-aware

- **TK-08.1.3** — Exibir mensagem textual contextual
  - Deliverable: Friendly, adaptive message about the day
  - Examples:
    - "Great day! 3 feedings, 4h sleep, 10 diaper changes—everything on track."
    - "Keep an eye on hydration—only 200ml so far. Encourage water intake."
    - "Bedtime soon? Baby's been awake 3h. Nap window closing."
  - Owner: Frontend Engineer + Copywriter
  - Effort: 3 hours
  - Acceptance: Messages warm and non-judgmental; tone consistent; no technical jargon

- **TK-08.1.4** — Exibir comparativo simples com dias anteriores
  - Deliverable: Simple comparison UI (e.g., "1h more sleep than yesterday")
  - Display:
    - "Sleep: 4h today (3h yesterday)" with arrow (↑ more, ↓ less, → same)
    - "Feeding: 3 times (same as yesterday)"
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Comparisons accurate; clear visual indication of change

---

### FE-08.2 — Relatório Semanal (P0, depends on FE-08.1)
**Objective:** Beautiful, scrollable weekly report with trends and highlights.

#### User Stories
- **US-08.2.1** — Como cuidador, eu quero um relatório semanal elegante para entender padrões.
  - Acceptance Criteria:
    - Dedicated weekly report view (accessible from home or Routines tab, future)
    - Report shows 7 days of data (current week or selectable)
    - Cards display: feeding totals, sleep distribution, activity highlights
    - Visual charts (bar chart for sleep, pie chart for feeding types)
    - Week-over-week comparison ("Last week: 45h sleep, this week: 48h")
    - Highlights (e.g., "✓ Great hydration this week")
    - Opportunities (e.g., "More tummy time could help development")

#### Tasks
- **TK-08.2.1** — Definir layout do relatório semanal
  - Deliverable: Figma design for weekly report
  - Layout sections:
    1. Week selector (current week, previous week selector)
    2. Key metrics overview (feeding, sleep, hydration, activity)
    3. Visual charts (bar/pie/line)
    4. Highlights and opportunities (text cards)
    5. Caregiver summary (who logged most)
  - Owner: Designer
  - Effort: 4 hours
  - Acceptance: Design approved; responsive for mobile and tablet

- **TK-08.2.2** — Calcular médias e totais
  - Deliverable: Backend logic for weekly aggregation
  - Calculations:
    - Total feeding (ml) for week
    - Total sleep (hours) for week
    - Average daily feeding
    - Average daily sleep
    - Feeding breakdown (bottle vs. breast vs. solids %)
    - Activity totals (tummy time hours, activity count)
  - Owner: Backend Engineer
  - Effort: 4 hours
  - Acceptance: Calculations correct; verified against manual data

- **TK-08.2.3** — Exibir comparações semana a semana
  - Deliverable: Week-over-week comparison cards
  - Display: "Sleep this week: 48h | Last week: 45h | +3h ↑"
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Comparisons accurate; clear visual feedback (up/down arrows)

- **TK-08.2.4** — Exibir destaques positivos e quedas
  - Deliverable: Highlight and opportunity cards with contextual messaging
  - Examples of highlights:
    - "✓ Great hydration this week—200ml+ daily"
    - "✓ Consistent sleep schedule—same bedtime 5/7 days"
  - Examples of opportunities:
    - "More tummy time could help development—only 20m this week"
    - "Hydration below target on Tuesday—remember water intake"
  - Owner: Frontend Engineer + Copywriter
  - Effort: 3 hours
  - Acceptance: Highlights and opportunities generated from logic; tone supportive and actionable

---

### FE-08.3 — Insights Automáticos (P1, depends on FE-08.2)
**Objective:** (Future/optional) Pattern recognition and smart alerts.

#### User Stories
- **US-08.3.1** — Como cuidador, eu quero insights legíveis sobre padrão de sono e alimentação.
  - Acceptance Criteria:
    - Insights card on home or reports (if data available)
    - Insights detect common patterns (e.g., nap time, hungry times)
    - Language is clear and actionable (not technical)
    - Insights disappear if not applicable (not forced)

#### Tasks
- **TK-08.3.1** — Criar regras simples de insight
  - Deliverable: Rule engine for pattern detection
  - Owner: Data Lead
  - Effort: 4 hours
  - Acceptance: Rules defined; ready for implementation

- **TK-08.3.2** — Detectar horário comum da primeira soneca
  - Deliverable: Logic to find most common first nap time
  - Logic: Look at last 7 days, find first nap each day, identify mode time
  - Output: "First nap usually around 9:30 AM"
  - Owner: Backend Engineer
  - Effort: 2 hours

- **TK-08.3.3** — Detectar janelas de maior alimentação
  - Deliverable: Logic to find peak feeding times
  - Logic: Group feedings by hour, find hours with most feedings
  - Output: "Baby feeds most between 8-10 AM and 2-4 PM"
  - Owner: Backend Engineer
  - Effort: 2 hours

- **TK-08.3.4** — Detectar queda de hidratação
  - Deliverable: Logic to alert if hydration below target
  - Logic: Check daily hydration total; if < 70% of target, flag
  - Output: Alert card "Hydration below target on [date]—encourage water"
  - Owner: Backend Engineer
  - Effort: 2 hours

- **TK-08.3.5** — Exibir insights em cards
  - Deliverable: Insight card component for home or report
  - Display: Icon + insight text + optional CTA
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Cards render correctly; don't clutter UI; dismissible

---

## Daily Summary Content

### Hero Card (EP-03)
```
┌─────────────────────────────┐
│ Today's Summary    👶 3mo    │
├─────────────────────────────┤
│                             │
│ "Great day so far! 2 feeds, │
│  4h sleep, good hydration." │
│                             │
│  ✓ On track                │
│                             │
│  Feeding: 3     Sleep: 4h   │
│  Hydration: 80% Diapers: 10 │
│                             │
│  ↑ +1h sleep vs yesterday   │
│                             │
│           [See weekly report]
│                             │
└─────────────────────────────┘
```

### Weekly Report View
```
┌─────────────────────────────┐
│ Weekly Report       < week > │
├─────────────────────────────┤
│ Mar 1-7, 2026               │
├─────────────────────────────┤
│ KEY METRICS                  │
│ ┌──────────────────────────┐│
│ │ Sleep: 48h total         ││
│ │ [████████░░░] vs 40h avg ││
│ │ Feeding: 125 feedings    ││
│ │ Hydration: 85% of target ││
│ └──────────────────────────┘│
│                             │
│ INSIGHTS & HIGHLIGHTS        │
│ ├─ ✓ Consistent sleep       │
│ │   schedule (9 PM, 6:30 AM)│
│ ├─ ✓ Great hydration        │
│ │   Exceeded target 5/7 days│
│ ├─ ! More tummy time        │
│ │   Only 10m—try 20m daily  │
│                             │
│ CAREGIVER ACTIVITY          │
│ Mom: 60 logs | Dad: 20 logs │
│                             │
└─────────────────────────────┘
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance
1. **Daily Summary:** 3-5 KPIs displayed; contextual message generated; comparison with yesterday
2. **Weekly Report:** 7 days of metrics; visual charts; week-over-week comparison; highlights and opportunities
3. **Insights (P1):** Pattern detection working; insights generated for applicable scenarios; cards render correctly
4. **Data Accuracy:** All calculations correct; tested against manual verification
5. **Performance:** Report loads in < 2s; insights generate in < 1s
6. **Tone:** All messaging warm, supportive, non-judgmental

### QA Checklist
- [ ] Daily summary KPIs display correctly
- [ ] KPI calculations accurate (tested against manual data)
- [ ] Contextual message generated and appropriate
- [ ] Comparison with yesterday works; shows direction (↑↓→)
- [ ] Summary updates as new logs added
- [ ] Weekly report view accessible
- [ ] Week selector works (current week, previous week, etc.)
- [ ] Weekly metrics accurate (total, average, breakdown)
- [ ] Charts render correctly (no missing data, labels visible)
- [ ] Week-over-week comparison shows correct data
- [ ] Highlights generated appropriately (not false positives)
- [ ] Opportunities generated appropriately (not false negatives)
- [ ] Insight cards display cleanly
- [ ] Insights are actionable and clear
- [ ] No insights when data insufficient
- [ ] Performance: report loads < 2s, insights < 1s

---

## Testing Strategy

### Unit Testing
- Metric calculations (daily totals, weekly sums, averages)
- Comparison logic (week-over-week)
- Pattern detection rules (nap time mode, peak feeding hours)
- Threshold logic (hydration below target)

### Integration Testing
- Log events → daily summary updates → metrics accurate
- Log events across 7 days → weekly report metrics accurate
- Insights generated when applicable; not generated when insufficient data
- Caregiver summary reflects actual contributions

### E2E Testing
- Open home → see daily summary with KPIs → tap "See weekly report" → week report loads with charts and insights

### Data Testing
- Manual verification of calculations against raw event data
- Edge cases (no events, one event, 100+ events)
- Timezone edge cases (cross-midnight events, DST changes)

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| KPI calculation accuracy | 100% | Manual verification against raw data |
| Daily summary generation speed | < 200ms | Performance profiling |
| Weekly report load time | < 2s | Lighthouse / performance tab |
| Insight generation accuracy | > 90% | Manual review of generated insights |
| User sentiment (messaging) | > 4/5 | User testing feedback |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Calculations wrong → misinformation | Loss of trust | Low | Unit test all logic; manual verification; stakeholder review |
| Insights too pushy/judgmental | Negative UX | Medium | Tone review by non-technical person; user testing |
| Report slow with 100+ events | Bad performance | Medium | Optimize queries; cache calculations; lazy-load charts |
| Week selector confusing | Low adoption of weekly reports | Low | Clear UI (< > arrows, date range display) |
| Insight false positives (e.g., "more tummy time" when enough) | Noise/clutter | Low | Set appropriate thresholds; validate rules before launch |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Daily summary design and KPIs defined | Day 2 | Pending |
| Daily summary calculations implemented | Day 4 | Pending |
| Weekly report design and layout done | Day 5 | Pending |
| Weekly report data and charts ready | Day 7 | Pending |
| (Optional P1) Insights rules and cards | Day 9 | Pending |
| QA and testing | Day 10 | Pending |

**Total Duration:** 10 business days

---

## Deliverables

1. ✓ Daily summary KPI specification and calculations
2. ✓ Contextual message generation logic
3. ✓ Week-over-week comparison calculations
4. ✓ Daily summary hero card component (updated from EP-03)
5. ✓ Weekly report view and layout
6. ✓ Weekly metrics aggregation (backend)
7. ✓ Chart components (bar, pie, line)
8. ✓ Highlights and opportunities generation logic
9. ✓ Highlight and opportunity card components
10. ✓ (Optional P1) Insight rule engine
11. ✓ (Optional P1) Insight detection logic
12. ✓ (Optional P1) Insight card components
13. ✓ Unit tests for all calculations and logic
14. ✓ Integration tests for summary and report generation
15. ✓ E2E tests for accessing reports
16. ✓ Manual verification report (calculations vs. raw data)
17. ✓ Tone/messaging review feedback

---

## Related Documents
- PRODUCT_SPEC.md: Success Metrics, Insights section
- EP-01: Design system (cards, charts)
- EP-02: Data model (aggregation utilities)
- EP-03: Home dashboard (daily summary display)
- EP-04 to EP-07: Tracker and caregiver features (data sources)
- EP-08: This epic
- EP-11: Health records (future integration with insights)

