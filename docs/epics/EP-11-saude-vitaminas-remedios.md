# EP-11 — Saúde, Vitaminas e Remédios

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-11 |
| **Title** | Saúde, vitaminas e remédios |
| **Priority** | P1 (High) |
| **Status** | Not Started |
| **Owner** | Frontend Lead + Data Lead |
| **Milestone** | Post-MVP Phase 2 (Week 9) |

## Objective
Aproximar o produto do Samsung Health como central de saúde do bebê. Registrar vitaminas, suplementos, remédios com dose e horário. Permitir confirmação de administração. Manter histórico leve de eventos de saúde (temperatura, sintomas, consultas). Preparar groundwork para futuras integrações com pediatrician ou health devices.

---

## Epic Scope

### What This Epic Covers
- Medication/supplement entity (vitamins, remédios, suplementos)
- Medication logging (dose, unit, time, confirmation of administration)
- Medication presets (common vitamins like D, iron, probiotics)
- Medication history and adherence tracking
- Simple health events (temperature, symptoms, consultations)
- Health event history
- Medication reminders (optional, future: notifications)
- Dose calculation helpers (optional, future)

### What This Epic Does NOT Cover
- Prescription integrations or pharmacy APIs
- Drug interaction checking
- Personalized dosage by weight (future)
- Doctor prescriptions or authorizations
- Medical diagnosis or recommendations (not a medical app)
- Emergency alerts or critical care features
- Insurance or payment processing

---

## Dependencies

### Upstream Dependencies
- **EP-01:** Design system (form inputs, tables, history layout)
- **EP-02:** Data model (health event entities)
- **EP-10:** Baby profile (health records section)

### Blocking
- **Blocks:** Future health ecosystem features (integrations with pediatricians, health devices)

---

## Features & Work Breakdown

### FE-11.1 — Vitaminas e Remédios (P1)
**Objective:** Simple medication and supplement tracking.

#### User Stories
- **US-11.1.1** — Como cuidador, eu quero registrar vitamina ou remédio com dose e horário.
  - Acceptance Criteria:
    - Medication form with fields: name, dose, unit (mg, ml, tablet), time, frequency (optional)
    - Preset list of common vitamins (Vitamin D, Iron, Probiotics, etc.)
    - Can log a dose immediately or set up recurring (future)
    - Checkbox to confirm administration ("given" vs. "pending")
    - Timestamp defaulted to now, editable
    - Medication appears in health history

- **US-11.1.2** — (Derived from above) Confirmation of administration.
  - Acceptance Criteria:
    - When logged, medication is marked "confirmed"
    - Or, can create pending dose and check off when actually given
    - Timeline shows medication with checkmark if confirmed

#### Tasks
- **TK-11.1.1** — Definir schema de medicação
  - Deliverable: Medication/dose data model
  - Schema:
    ```typescript
    interface Medication {
      id: UUID,
      name: string, // "Vitamin D", "Amoxicillin"
      type: 'vitamin' | 'supplement' | 'medication',
      dosage: number, // quantity
      unit: 'mg' | 'ml' | 'tablet' | 'drop', // unit of measurement
      frequency?: 'once' | 'daily' | 'twice_daily' | 'weekly', // optional
      notes?: string,
      babyId: UUID,
      createdAt: ISO 8601
    }

    interface MedicationDose {
      id: UUID,
      medicationId: UUID,
      babyId: UUID,
      administeredAt: ISO 8601,
      dose: number,
      unit: string,
      givenBy: string, // caregiver name
      confirmed: boolean, // has medication been confirmed as given
      notes?: string,
      createdAt: ISO 8601
    }
    ```
  - Owner: Backend Lead
  - Effort: 2 hours
  - Acceptance: Schema defined and documented; migrations created

- **TK-11.1.2** — Criar presets comuns
  - Deliverable: List of common medications/supplements
  - Presets:
    - Vitamin D (400 IU or customizable)
    - Iron supplement (varies by age)
    - Probiotics
    - Multivitamin
    - Formula supplement
    - Custom (user-defined)
  - Owner: Product Lead
  - Effort: 2 hours
  - Acceptance: Presets defined; can be expanded later

- **TK-11.1.3** — Permitir dose, unidade e horário
  - Deliverable: Form fields for dose entry
  - Fields:
    - Medication name (preset dropdown or text input)
    - Dose (number input, e.g., 400)
    - Unit (dropdown: mg, ml, tablet, drop)
    - Time (time picker, default: now)
    - Notes (optional)
  - Owner: Frontend Engineer
  - Effort: 3 hours
  - Acceptance: Form loads; all fields functional; validation prevents invalid inputs

- **TK-11.1.4** — Permitir confirmação de administração
  - Deliverable: Confirmation checkbox or state toggle
  - Behavior:
    - Log medication → default confirmed (checkbox checked)
    - Or: log as pending → user checks off when actually given
    - Timeline/history shows confirmation state with checkmark or icon
  - Owner: Frontend Engineer
  - Effort: 2 hours
  - Acceptance: Confirmation toggles; state persists; timeline displays correctly

---

### FE-11.2 — Histórico de Saúde Leve (P2, depends on FE-11.1)
**Objective:** (Future/optional) Simple health event tracking.

#### User Stories
- **US-11.2.1** — Como cuidador, eu quero registrar eventos simples de saúde.
  - Acceptance Criteria:
    - Health event form with fields: type, date, optional details
    - Event types: temperature (with value), symptom (with description), consultation (with provider name and notes)
    - History view shows all health events chronologically
    - No medical judgment or recommendations (informational only)

#### Tasks
- **TK-11.2.1** — Criar tipo "temperatura"
  - Deliverable: Temperature health event type
  - Fields:
    - Temperature value (numeric, e.g., 37.5°C)
    - Time of measurement
    - Notes (optional)
  - Owner: Frontend Engineer
  - Effort: 2 hours

- **TK-11.2.2** — Criar tipo "sintoma"
  - Deliverable: Symptom health event type
  - Fields:
    - Symptom type (dropdown: rash, cough, diarrhea, vomiting, lethargy, other)
    - Description (text)
    - Severity (optional: mild, moderate, severe)
    - Date and time
  - Owner: Frontend Engineer
  - Effort: 2 hours

- **TK-11.2.3** — Criar tipo "consulta"
  - Deliverable: Consultation/visit health event type
  - Fields:
    - Provider type (dropdown: pediatrician, specialist, nurse, other)
    - Provider name
    - Consultation notes (text, optional)
    - Recommendations (text, optional)
    - Date
  - Owner: Frontend Engineer
  - Effort: 2 hours

- **TK-11.2.4** — Exibir histórico
  - Deliverable: Health event history list
  - Display:
    - Chronological list (newest first)
    - Icon for event type (thermometer, symptom, stethoscope, etc.)
    - Event summary (temperature value, symptom name, provider name)
    - Date and time
    - Tap to view full details
  - Owner: Frontend Engineer
  - Effort: 2 hours

---

## Health Tab Layout (Wireframe - Future)

```
┌─────────────────────────────┐
│ Saúde                       │  (Header)
├─────────────────────────────┤
│                             │
│ MEDICATIONS & VITAMINS      │
│ ┌──────────────────────────┐│
│ │ Vitamin D                ││
│ │ 400 IU daily             ││
│ │ Last given: today 9 AM ✓ ││
│ │         [GIVE NOW] [✓]   ││
│ └──────────────────────────┘│
│ ┌──────────────────────────┐│
│ │ Iron supplement          ││
│ │ 5 ml daily               ││
│ │ Last given: 2 days ago   ││
│ │         [GIVE NOW] [  ]  ││
│ └──────────────────────────┘│
│                             │
│ [ADD MEDICATION]            │
│ [VIEW HISTORY]              │
│                             │
│ RECENT HEALTH EVENTS        │
│ ├─ Today 3 PM: Temp 37.2°C │
│ ├─ Yesterday: Rash on legs  │
│ ├─ 2 days ago: Check-up    │
│ │          Dr. Smith       │
│ │          Notes: All good! │
│                             │
│ [ADD EVENT]                 │
│ [VIEW HISTORY]              │
│                             │
└─────────────────────────────┘
     🏠  👥  📋  👶     (Bottom nav)
```

---

## Data Models

### Medication Entity
```typescript
interface Medication {
  id: UUID;
  babyId: UUID;
  name: string; // "Vitamin D", "Amoxicillin"
  type: 'vitamin' | 'supplement' | 'medication';
  dosage: number; // 400, 5, 1, etc.
  unit: 'mg' | 'ml' | 'tablet' | 'drop' | 'iu'; // International Units
  frequency?: 'once' | 'daily' | 'twice_daily' | 'weekly';
  notes?: string;
  createdAt: ISO 8601;
  updatedAt: ISO 8601;
}

interface MedicationDose {
  id: UUID;
  medicationId: UUID;
  babyId: UUID;
  administeredAt: ISO 8601; // when given
  dosage: number;
  unit: string;
  givenBy: string; // caregiver name
  confirmed: boolean; // confirmed as given
  notes?: string;
  createdAt: ISO 8601;
}
```

### Health Event Entity
```typescript
interface HealthEvent {
  id: UUID;
  babyId: UUID;
  type: 'temperature' | 'symptom' | 'consultation';
  timestamp: ISO 8601;
  caregiver: string;

  // For temperature
  temperatureC?: number;
  temperatureF?: number;

  // For symptom
  symptomType?: 'rash' | 'cough' | 'diarrhea' | 'vomiting' | 'lethargy' | 'other';
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';

  // For consultation
  providerType?: 'pediatrician' | 'specialist' | 'nurse' | 'other';
  providerName?: string;
  consultationNotes?: string;
  recommendations?: string;

  notes?: string;
  createdAt: ISO 8601;
}
```

---

## Acceptance Criteria Summary

### Feature-Level Acceptance (P1 - Medications)
1. **Medication Schema:** Defined and persisted
2. **Medication Form:** All fields (name, dose, unit, time) functional
3. **Preset List:** Common medications available for quick selection
4. **Dose Confirmation:** Can confirm administration; state persists
5. **Medication History:** List shows all doses with confirmation status
6. **Timeline Integration:** Medications can appear in main timeline (optional)

### Feature-Level Acceptance (P2 - Health Events)
7. **Health Event Schema:** Defined for temperature, symptom, consultation
8. **Health Event Forms:** Can log all three types
9. **Health Event History:** Chronological list of all health events
10. **No Medical Judgments:** UI only displays data, no recommendations (future)

### QA Checklist
- [ ] Medication form accessible from health section
- [ ] Preset medications load and are selectable
- [ ] Can enter custom medication name
- [ ] Dose and unit fields accept input and validate
- [ ] Time picker defaults to now; can select past times
- [ ] Notes field optional
- [ ] Submit saves medication dose; shows confirmation
- [ ] Confirmation checkbox toggles; state persists
- [ ] Medication history displays all doses
- [ ] History shows medication name, dose, time, and confirmation status
- [ ] Doses sort chronologically (newest first)
- [ ] Tap dose → view details (optional)
- [ ] Temperature event form accepts numeric value (°C or °F)
- [ ] Symptom event form has type dropdown and description field
- [ ] Consultation event form has provider type, name, and notes
- [ ] Health event history displays all events chronologically
- [ ] Events show appropriate icons and summaries
- [ ] No medical recommendations or judgments displayed
- [ ] All data persists across refresh

---

## Testing Strategy

### Unit Testing
- Medication dose calculation (if future feature adds weight-based dosing)
- Temperature conversion (°C ↔ °F, if applicable)
- Health event aggregation

### Integration Testing
- Log medication dose → appears in history
- Toggle confirmation → state updates
- Log health event → appears in health history
- View history → all events displayed correctly

### E2E Testing
- Full flow: Health section → add medication → confirm → see in history
- Full flow: Health section → add symptom → see in health event history

### Data Validation Testing
- Invalid dose values (negative, extremely high)
- Invalid temperatures (outside plausible range, e.g., < 35°C or > 41°C)
- Missing required fields

---

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Medication log latency | < 500ms | Network tab |
| History load time | < 1s (50+ doses) | Performance profiling |
| Form completion rate | > 80% | Usage analytics (future) |
| Data accuracy | 100% | Manual verification |

---

## Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Users confuse app with medical guidance | Trust loss; liability | Medium | Clear disclaimer in app; no medical recommendations; promote as informational |
| Medication dose calculation errors | Incorrect administration | Medium (if future feature) | Validate inputs strictly; unit tests for any calculations; pediatrician review |
| Health event confusion (symptom details vague) | Low usefulness | Low | Provide examples and guidance; optional fields; user testing |
| Too much data in health section | Overwhelm | Low | Progressive disclosure; tabs or expandable sections; start small |
| Integration with pediatrician delayed | Limits future growth | Medium | Build extensible data model now; document API requirements for future |

---

## Timeline & Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Medication schema and form complete | Day 2 | Pending |
| Medication presets defined | Day 2 | Pending |
| Confirmation toggle working | Day 3 | Pending |
| Medication history list done | Day 3 | Pending |
| (Optional P2) Health event schema | Day 4 | Pending |
| (Optional P2) Health event forms | Day 5 | Pending |
| (Optional P2) Health event history | Day 6 | Pending |
| QA and testing | Day 7 | Pending |

**Total Duration:** 7 business days

---

## Deliverables

1. ✓ Medication data model and schema
2. ✓ Medication dose data model and schema
3. ✓ Medication form component
4. ✓ Preset medication list
5. ✓ Medication history list component
6. ✓ Confirmation toggle/checkbox
7. ✓ Medication-related database migrations
8. ✓ Medication backend API endpoints
9. ✓ (Optional P2) Health event data model
10. ✓ (Optional P2) Health event form components
11. ✓ (Optional P2) Health event history list
12. ✓ (Optional P2) Health event backend API endpoints
13. ✓ Unit tests for medication operations
14. ✓ Integration tests for medication form and history
15. ✓ E2E tests for medication logging flow
16. ✓ Data validation tests
17. ✓ Disclaimer/informational messaging

---

## Related Documents
- PRODUCT_SPEC.md: Future Opportunities (health integrations)
- EP-02: Data model (health event entities)
- EP-10: Baby profile (health records section)
- EP-11: This epic
- Future: Pediatrician integrations, health device syncing

